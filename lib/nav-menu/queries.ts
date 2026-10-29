// lib/nav-menu/queries.ts
//
// Server-only read access to the saved menu.
// - getNavMenu():        used by the builder page (full tree, with version)
// - getPublicNavItems(): ready for the future navbar (visible items only)
//
// Reads are not cached yet. When the navbar is built, wrap getPublicNavItems
// in Next's caching (cacheTag) and invalidate it from the save/delete actions.

import "server-only";

import { prisma } from "@/lib/prisma";
import { NAV_MENU_KEY } from "./constants";
import { parseNavContent } from "./schema";
import { getPublicItems } from "./tree";
import type { NavMenuSnapshot, NavNode } from "./types";

/**
 * The saved menu, or null when none has been created yet.
 *
 * Throws if the stored JSON no longer passes validation. That can only happen
 * through manual database edits or a future format change, and failing loudly
 * is better than showing the builder an empty menu that would overwrite it.
 */
export async function getNavMenu(): Promise<NavMenuSnapshot | null> {
  const row = await prisma.navMenu.findUnique({ where: { key: NAV_MENU_KEY } });
  if (!row) return null;

  const parsed = parseNavContent(row.content, "strict");
  if (!parsed.success) {
    throw new Error(
      `The saved navigation menu is invalid: ${parsed.errors.slice(0, 3).join(" ")}`,
    );
  }

  return {
    content: parsed.data,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Items a visitor should see (see getPublicItems for the rules). Returns []
 * if there is no menu or it can't be read, so the site never breaks because
 * of the navbar.
 */
export async function getPublicNavItems(): Promise<NavNode[]> {
  try {
    const menu = await getNavMenu();
    return menu ? getPublicItems(menu.content.items) : [];
  } catch (error) {
    console.error("[nav-menu] Could not load the public menu", error);
    return [];
  }
}
