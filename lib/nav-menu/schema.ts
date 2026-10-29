// lib/nav-menu/schema.ts
//
// Validation and normalisation for menu JSON. Used in two places:
// - server actions (mode "strict"): never trust client data
// - the import dialog (mode "import"): forgiving, repairs what it safely can
//
// Fields are validated with Zod 4; the tree itself is walked by hand so we get
// precise error paths ("items[2].children[0].href: ..."), enforce depth and
// size limits before descending, and always return a fully-normalised shape.

import { z } from "zod";
import {
  BADGE_VARIANTS,
  BLOCKED_URL_SCHEMES,
  ICON_CLASS_PATTERN,
  LINK_TARGETS,
  NAV_LIMITS,
  NAV_SCHEMA_VERSION,
} from "./constants";
import { createNodeId } from "./tree";
import type { NavMenuContent, NavNode } from "./types";

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;
const URL_SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * Any link is allowed (relative paths, #anchors, http(s), mailto:, tel:, custom
 * app schemes...) except the schemes in BLOCKED_URL_SCHEMES.
 */
export function isAllowedHref(value: string): boolean {
  // Browsers ignore tabs/newlines inside URLs ("java\nscript:"), so reject
  // control characters outright.
  if (CONTROL_CHARS.test(value)) return false;

  // Check a whitespace-free copy so spaced-out tricks can't hide a scheme.
  const compact = value.replace(/\s+/g, "");
  const scheme = URL_SCHEME.exec(compact)?.[1]?.toLowerCase();
  if (!scheme) return true; // "/path", "#anchor", "?query", "//host/path"
  return !BLOCKED_URL_SCHEMES.includes(scheme);
}

/* -------------------------------------------------------------------------- */
/* Field schemas (reusable by the editor form)                                */
/* -------------------------------------------------------------------------- */

/** undefined / null / blank string -> null; other strings are trimmed. */
function emptyToNull(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
}

export const labelSchema = z
  .string({ error: "Label is required." })
  .trim()
  .min(1, "Label is required.")
  .max(
    NAV_LIMITS.maxLabelLength,
    `Label must be ${NAV_LIMITS.maxLabelLength} characters or fewer.`,
  );

export const hrefSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(
      NAV_LIMITS.maxHrefLength,
      `Link must be ${NAV_LIMITS.maxHrefLength} characters or fewer.`,
    )
    .refine(isAllowedHref, "This type of link isn't allowed.")
    .nullable(),
);

export const iconSchema = z.preprocess((value) => {
  const normalised = emptyToNull(value);
  // "fa-solid   fa-house" -> "fa-solid fa-house"
  return typeof normalised === "string"
    ? normalised.replace(/\s+/g, " ")
    : normalised;
}, z.string().max(NAV_LIMITS.maxIconLength, "Icon class is too long.").regex(ICON_CLASS_PATTERN, "Use lowercase letters, numbers and hyphens, e.g. fa-solid fa-house.").nullable());

export const badgeSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) return null;
    // A badge with blank text means "no badge".
    if (
      typeof value === "object" &&
      "text" in value &&
      typeof value.text === "string" &&
      value.text.trim() === ""
    ) {
      return null;
    }
    return value;
  },
  z
    .object({
      text: z
        .string({ error: "Badge text is required." })
        .trim()
        .min(1, "Badge text is required.")
        .max(
          NAV_LIMITS.maxBadgeLength,
          `Badge text must be ${NAV_LIMITS.maxBadgeLength} characters or fewer.`,
        ),
      variant: z.enum(BADGE_VARIANTS).default("neutral"),
    })
    .nullable(),
);

export const targetSchema = z.enum(LINK_TARGETS).default("_self");

/** Everything on a node except `id` and `children`. Unknown keys are dropped. */
export const navNodeFieldsSchema = z.object({
  label: labelSchema,
  icon: iconSchema,
  href: hrefSchema,
  target: targetSchema,
  badge: badgeSchema,
  visible: z.boolean().default(true),
  disabled: z.boolean().default(false),
});

/* -------------------------------------------------------------------------- */
/* Tree validation                                                            */
/* -------------------------------------------------------------------------- */

export type NavParseMode = "strict" | "import";

export type NavParseResult =
  | { success: true; data: NavMenuContent; warnings: string[] }
  | { success: false; errors: string[] };

const NODE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_REPORTED_ISSUES = 20;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Validates and normalises a menu document.
 *
 * "strict" (server save): requires the { schemaVersion, items } envelope and a
 * valid, unique `id` on every node.
 *
 * "import" (pasted JSON): also accepts a bare array of items, and gives any
 * missing, invalid or duplicate `id` a fresh one.
 *
 * In both modes missing optional fields get defaults, and a node that has
 * children has its link removed (reported as a warning).
 */
export function parseNavContent(
  input: unknown,
  mode: NavParseMode = "strict",
): NavParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  let nodeCount = 0;
  let aborted = false;

  const report = (message: string) => {
    if (aborted) return;
    if (errors.length >= MAX_REPORTED_ISSUES) {
      errors.push("More problems were found but are not listed.");
      aborted = true;
      return;
    }
    errors.push(message);
  };

  const source = extractItems(input, mode);
  if ("error" in source) return { success: false, errors: [source.error] };

  const walk = (
    rawItems: unknown[],
    level: number,
    path: string,
  ): NavNode[] => {
    const nodes: NavNode[] = [];

    for (let index = 0; index < rawItems.length; index++) {
      if (aborted) break;

      const nodePath = `${path}[${index}]`;

      nodeCount += 1;
      if (nodeCount > NAV_LIMITS.maxNodes) {
        report(`The menu has more than ${NAV_LIMITS.maxNodes} items.`);
        aborted = true;
        break;
      }

      const raw = rawItems[index];
      if (!isRecord(raw)) {
        report(`${nodePath}: expected an object.`);
        continue;
      }

      const fields = navNodeFieldsSchema.safeParse(raw);
      if (!fields.success) {
        for (const issue of fields.error.issues) {
          const field = issue.path.map(String).join(".");
          report(`${nodePath}${field ? `.${field}` : ""}: ${issue.message}`);
        }
        continue;
      }

      // id
      const candidate = typeof raw.id === "string" ? raw.id.trim() : "";
      let id = candidate;
      if (!NODE_ID.test(candidate) || seenIds.has(candidate)) {
        if (mode === "strict") {
          const reason =
            candidate === ""
              ? "is required."
              : seenIds.has(candidate)
                ? "is duplicated."
                : "may only contain letters, numbers, - and _ (max 64).";
          report(`${nodePath}.id: ${reason}`);
          continue;
        }
        id = createNodeId();
      }
      seenIds.add(id);

      // children
      const rawChildren = raw.children ?? [];
      if (!Array.isArray(rawChildren)) {
        report(`${nodePath}.children: expected an array.`);
        continue;
      }

      let children: NavNode[] = [];
      if (rawChildren.length > 0) {
        if (level + 1 > NAV_LIMITS.maxDepth) {
          report(
            `${nodePath}: menus can be at most ${NAV_LIMITS.maxDepth} levels deep.`,
          );
          aborted = true;
          break;
        }
        children = walk(rawChildren, level + 1, `${nodePath}.children`);
      }

      const { label, icon, href, target, badge, visible, disabled } =
        fields.data;
      const hasChildren = children.length > 0;

      if (hasChildren && href !== null) {
        warnings.push(
          `"${label}": the link was removed because this item has a submenu.`,
        );
      }

      nodes.push({
        id,
        label,
        icon,
        href: hasChildren ? null : href,
        target: hasChildren ? "_self" : target,
        badge,
        visible,
        disabled,
        children,
      });
    }

    return nodes;
  };

  const items = walk(source.items, 1, "items");

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    data: { schemaVersion: NAV_SCHEMA_VERSION, items },
    warnings: warnings.slice(0, MAX_REPORTED_ISSUES),
  };
}

/** Parses pasted JSON text for the import dialog. */
export function parseNavJson(text: string): NavParseResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof SyntaxError ? ` ${error.message}` : "";
    return {
      success: false,
      errors: [`That isn't valid JSON.${detail}`],
    };
  }
  return parseNavContent(value, "import");
}

function extractItems(
  input: unknown,
  mode: NavParseMode,
): { items: unknown[] } | { error: string } {
  if (mode === "import" && Array.isArray(input)) return { items: input };

  if (!isRecord(input)) {
    return {
      error: 'Expected an object like { "schemaVersion": 1, "items": [] }.',
    };
  }

  if (input.schemaVersion === undefined) {
    if (mode === "strict") return { error: "schemaVersion is required." };
  } else if (input.schemaVersion !== NAV_SCHEMA_VERSION) {
    return {
      error: `Unsupported schemaVersion. Expected ${NAV_SCHEMA_VERSION}.`,
    };
  }

  if (!Array.isArray(input.items)) {
    return { error: '"items" must be an array.' };
  }
  return { items: input.items };
}
