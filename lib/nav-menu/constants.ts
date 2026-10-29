// lib/nav-menu/constants.ts

/** Row key of the single global menu. The column is unique, so more menus can be added later. */
export const NAV_MENU_KEY = "main";

/** Version of the JSON envelope stored in the database. Bump when the shape changes. */
export const NAV_SCHEMA_VERSION = 1 as const;

/**
 * Safety limits. They are deliberately generous; they exist so a broken import
 * or a malicious request can't produce a menu that is unusable or too large to
 * save (Next.js server actions accept ~1 MB bodies by default).
 */
export const NAV_LIMITS = {
  /** Levels of nesting, counting top-level items as level 1. */
  maxDepth: 12,
  maxNodes: 1000,
  maxLabelLength: 80,
  maxHrefLength: 2048,
  maxBadgeLength: 20,
  maxIconLength: 100,
} as const;

export const LINK_TARGETS = ["_self", "_blank"] as const;

export const BADGE_VARIANTS = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
] as const;

/** Schemes that can run script or expose local data. Every other link type is allowed. */
export const BLOCKED_URL_SCHEMES: readonly string[] = [
  "javascript",
  "data",
  "vbscript",
  "file",
];

/**
 * Icon value: 1-5 space-separated tokens of lowercase letters, digits and
 * hyphens, e.g. "fa-solid fa-house". Strict on purpose so the value is always
 * safe to place inside a class="" attribute in exported HTML.
 */
export const ICON_CLASS_PATTERN = /^[a-z0-9-]+(?: [a-z0-9-]+){0,4}$/;

export const DEFAULT_NEW_ITEM_LABEL = "New item";
