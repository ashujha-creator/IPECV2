// lib/nav-menu/types.ts
//
// Pure types, safe to import from both server and client code.

import type {
  BADGE_VARIANTS,
  LINK_TARGETS,
  NAV_SCHEMA_VERSION,
} from "./constants";

export type LinkTarget = (typeof LINK_TARGETS)[number];
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export interface NavBadge {
  text: string;
  variant: BadgeVariant;
}

/**
 * One menu item. Every key is always present (empty values are `null`) so any
 * consumer, including the future navbar, never has to check for missing fields.
 *
 * Rule enforced by the server: an item with children has `href: null` and
 * `target: "_self"`. It only opens a submenu; it is not a link itself.
 */
export interface NavNode {
  id: string;
  label: string;
  /** Font Awesome class string such as "fa-solid fa-house", or null. */
  icon: string | null;
  href: string | null;
  target: LinkTarget;
  badge: NavBadge | null;
  /** When false the item (and its children) is excluded from the public site. */
  visible: boolean;
  /** When true the item is shown greyed out and is not clickable. */
  disabled: boolean;
  children: NavNode[];
}

/** The JSON document stored in `NavMenu.content`. */
export interface NavMenuContent {
  schemaVersion: typeof NAV_SCHEMA_VERSION;
  items: NavNode[];
}

/** What the server hands to the builder UI (serializable across the RSC boundary). */
export interface NavMenuSnapshot {
  content: NavMenuContent;
  version: number;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}

export type NavActionErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "CONFLICT"
  | "NOT_FOUND"
  | "UNKNOWN";

/** Return type of every server action in this feature. Actions never throw to the client. */
export type NavActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: NavActionErrorCode;
      message: string;
      /** Human-readable validation problems, when `code` is "VALIDATION". */
      details?: string[];
    };
