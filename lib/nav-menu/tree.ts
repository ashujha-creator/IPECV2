// lib/nav-menu/tree.ts
//
// Pure, immutable helpers for the menu tree. No React, no server code: used by
// the editor reducer, the drag-and-drop layer and the validator.
//
// Conventions
// - Items are addressed by `id`, never by index path.
// - `level` is 1-based: top-level items are level 1.
// - Every function returns new arrays/objects along the changed path only and
//   returns the SAME reference when nothing changed.
// - Operations that can break a limit or a rule return a TreeResult instead of
//   throwing, so the UI can show `reason` in a toast.

import {
  DEFAULT_NEW_ITEM_LABEL,
  NAV_LIMITS,
  NAV_SCHEMA_VERSION,
} from "./constants";
import type { NavMenuContent, NavNode } from "./types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type NodePatch = Partial<Omit<NavNode, "id" | "children">>;

export type TreeResult =
  | { ok: true; items: NavNode[] }
  | { ok: false; reason: string };

export interface NodeLocation {
  node: NavNode;
  parentId: string | null;
  /** Position among its siblings. */
  index: number;
  level: number;
}

/** One row of the flattened tree, used by the drag-and-drop list. */
export interface FlatNode {
  id: string;
  parentId: string | null;
  level: number;
  index: number;
  node: NavNode;
  hasChildren: boolean;
}

export interface MoveState {
  canMoveUp: boolean;
  canMoveDown: boolean;
  canIndent: boolean;
  canOutdent: boolean;
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                  */
/* -------------------------------------------------------------------------- */

export function createNodeId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for non-secure contexts where randomUUID is unavailable.
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createNode(
  overrides: Partial<Omit<NavNode, "id">> = {},
): NavNode {
  return {
    id: createNodeId(),
    label: DEFAULT_NEW_ITEM_LABEL,
    icon: null,
    href: null,
    target: "_self",
    badge: null,
    visible: true,
    disabled: false,
    children: [],
    ...overrides,
  };
}

export function emptyNavContent(): NavMenuContent {
  return { schemaVersion: NAV_SCHEMA_VERSION, items: [] };
}

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export function findNode(items: NavNode[], id: string): NodeLocation | null {
  return find(items, id, null, 1);
}

function find(
  items: NavNode[],
  id: string,
  parentId: string | null,
  level: number,
): NodeLocation | null {
  for (let index = 0; index < items.length; index++) {
    const node = items[index];
    if (node.id === id) return { node, parentId, index, level };
    if (node.children.length > 0) {
      const found = find(node.children, id, node.id, level + 1);
      if (found) return found;
    }
  }
  return null;
}

/** Children of `parentId`, or the top-level list when `parentId` is null. */
export function getChildren(
  items: NavNode[],
  parentId: string | null,
): NavNode[] {
  if (parentId === null) return items;
  return findNode(items, parentId)?.node.children ?? [];
}

export function countNodes(items: NavNode[]): number {
  let total = 0;
  for (const node of items) total += 1 + countNodes(node.children);
  return total;
}

/** Number of levels in this node's subtree, counting the node itself (a leaf is 1). */
export function subtreeHeight(node: NavNode): number {
  let deepest = 0;
  for (const child of node.children) {
    deepest = Math.max(deepest, subtreeHeight(child));
  }
  return deepest + 1;
}

export function treeHeight(items: NavNode[]): number {
  return items.reduce((max, node) => Math.max(max, subtreeHeight(node)), 0);
}

/**
 * Depth-first list of rows in display order. Children of collapsed nodes are
 * left out, which is what the drag-and-drop list renders.
 */
export function flattenTree(
  items: NavNode[],
  collapsedIds: ReadonlySet<string> = new Set(),
): FlatNode[] {
  const rows: FlatNode[] = [];

  const visit = (nodes: NavNode[], parentId: string | null, level: number) => {
    nodes.forEach((node, index) => {
      const hasChildren = node.children.length > 0;
      rows.push({ id: node.id, parentId, level, index, node, hasChildren });
      if (hasChildren && !collapsedIds.has(node.id)) {
        visit(node.children, node.id, level + 1);
      }
    });
  };

  visit(items, null, 1);
  return rows;
}

/** Which row buttons should be enabled for this item. */
export function getMoveState(items: NavNode[], id: string): MoveState {
  const location = findNode(items, id);
  if (!location) {
    return {
      canMoveUp: false,
      canMoveDown: false,
      canIndent: false,
      canOutdent: false,
    };
  }

  const siblings = getChildren(items, location.parentId);
  const height = subtreeHeight(location.node);

  return {
    canMoveUp: location.index > 0,
    canMoveDown: location.index < siblings.length - 1,
    // Indenting nests the item under its previous sibling, one level deeper.
    canIndent:
      location.index > 0 && location.level + height <= NAV_LIMITS.maxDepth,
    canOutdent: location.parentId !== null,
  };
}

/**
 * True when adding a child to `parentId` will clear that parent's link
 * (parents with a submenu can't be links). Lets the UI tell the user.
 */
export function parentLinkWillBeCleared(
  items: NavNode[],
  parentId: string | null,
): boolean {
  if (parentId === null) return false;
  const parent = findNode(items, parentId)?.node;
  return !!parent && parent.children.length === 0 && parent.href !== null;
}

/**
 * The items a visitor should see. Hidden items are removed together with
 * their descendants, and so is a parent whose children are all hidden
 * (parents are never links, so it would be an empty dropdown).
 * Shared by the server reader and the builder preview so they always agree.
 */
export function getPublicItems(items: NavNode[]): NavNode[] {
  const result: NavNode[] = [];

  for (const node of items) {
    if (!node.visible) continue;

    if (node.children.length === 0) {
      result.push(node);
      continue;
    }

    const children = getPublicItems(node.children);
    if (children.length > 0) result.push({ ...node, children });
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Adds `node` (with its subtree) under `parentId`, or at the top level when
 * `parentId` is null. `index` defaults to the end of the sibling list.
 */
export function insertNode(
  items: NavNode[],
  node: NavNode,
  parentId: string | null,
  index?: number,
): TreeResult {
  let parentLevel = 0;
  if (parentId !== null) {
    const parent = findNode(items, parentId);
    if (!parent) return fail("The parent item no longer exists.");
    parentLevel = parent.level;
  }

  if (parentLevel + subtreeHeight(node) > NAV_LIMITS.maxDepth) {
    return fail(`Menus can be at most ${NAV_LIMITS.maxDepth} levels deep.`);
  }
  if (countNodes(items) + countNodes([node]) > NAV_LIMITS.maxNodes) {
    return fail(`Menus can have at most ${NAV_LIMITS.maxNodes} items.`);
  }

  return ok(
    updateSiblings(items, parentId, (siblings) => {
      const at = clampIndex(index ?? siblings.length, siblings.length);
      return [...siblings.slice(0, at), node, ...siblings.slice(at)];
    }),
  );
}

/** Removes the item and its whole subtree. */
export function removeNode(items: NavNode[], id: string): NavNode[] {
  const location = findNode(items, id);
  if (!location) return items;
  return updateSiblings(items, location.parentId, (siblings) =>
    siblings.filter((sibling) => sibling.id !== id),
  );
}

/**
 * Updates an item's own fields. If the item has children, any `href`/`target`
 * in the patch is overridden: parents can't be links.
 */
export function updateNode(
  items: NavNode[],
  id: string,
  patch: NodePatch,
): NavNode[] {
  const location = findNode(items, id);
  if (!location) return items;
  return updateSiblings(items, location.parentId, (siblings) =>
    siblings.map((sibling) =>
      sibling.id === id ? applyParentRules({ ...sibling, ...patch }) : sibling,
    ),
  );
}

/**
 * Moves an item (with its subtree) under `newParentId` (null = top level).
 *
 * `index` is the position in the destination list AFTER the item has been
 * taken out of its old place. For a move within the same list, that is the
 * final position of the item.
 */
export function moveNode(
  items: NavNode[],
  id: string,
  newParentId: string | null,
  index: number,
): TreeResult {
  const location = findNode(items, id);
  if (!location) return fail("That item no longer exists.");

  if (newParentId !== null) {
    if (newParentId === id || findNode(location.node.children, newParentId)) {
      return fail("An item can't be moved inside itself.");
    }
    if (!findNode(items, newParentId)) {
      return fail("The destination item no longer exists.");
    }
  }

  // insertNode re-checks the depth limit against the destination.
  return insertNode(removeNode(items, id), location.node, newParentId, index);
}

export function moveNodeUp(items: NavNode[], id: string): NavNode[] {
  return swapWithSibling(items, id, -1);
}

export function moveNodeDown(items: NavNode[], id: string): NavNode[] {
  return swapWithSibling(items, id, 1);
}

/** Nests the item under its previous sibling, as that sibling's last child. */
export function indentNode(items: NavNode[], id: string): TreeResult {
  const location = findNode(items, id);
  if (!location) return fail("That item no longer exists.");
  if (location.index === 0) {
    return fail("There is no item above to nest this one under.");
  }

  const previous = getChildren(items, location.parentId)[location.index - 1];
  return moveNode(items, id, previous.id, previous.children.length);
}

/** Moves the item up one level, placing it right after its former parent. */
export function outdentNode(items: NavNode[], id: string): TreeResult {
  const location = findNode(items, id);
  if (!location) return fail("That item no longer exists.");
  if (location.parentId === null)
    return fail("This item is already at the top level.");

  const parent = findNode(items, location.parentId);
  if (!parent) return fail("The parent item no longer exists.");

  return moveNode(items, id, parent.parentId, parent.index + 1);
}

/* -------------------------------------------------------------------------- */
/* Internals                                                                  */
/* -------------------------------------------------------------------------- */

const ok = (items: NavNode[]): TreeResult => ({ ok: true, items });
const fail = (reason: string): TreeResult => ({ ok: false, reason });

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), length);
}

/** A node with a submenu is not a link. */
function applyParentRules(node: NavNode): NavNode {
  if (
    node.children.length > 0 &&
    (node.href !== null || node.target !== "_self")
  ) {
    return { ...node, href: null, target: "_self" };
  }
  return node;
}

/**
 * Applies `fn` to the sibling list under `parentId` (null = top level) and
 * rebuilds only the nodes on the path to it. Returns the original `items`
 * reference when `fn` returns its input unchanged.
 */
function updateSiblings(
  items: NavNode[],
  parentId: string | null,
  fn: (siblings: NavNode[]) => NavNode[],
): NavNode[] {
  if (parentId === null) return fn(items);

  let changed = false;
  const next = items.map((item) => {
    if (item.id === parentId) {
      const children = fn(item.children);
      if (children === item.children) return item;
      changed = true;
      return applyParentRules({ ...item, children });
    }
    if (item.children.length === 0) return item;

    const children = updateSiblings(item.children, parentId, fn);
    if (children === item.children) return item;
    changed = true;
    return { ...item, children };
  });

  return changed ? next : items;
}

function swapWithSibling(
  items: NavNode[],
  id: string,
  direction: -1 | 1,
): NavNode[] {
  const location = findNode(items, id);
  if (!location) return items;

  return updateSiblings(items, location.parentId, (siblings) => {
    const from = location.index;
    const to = from + direction;
    if (to < 0 || to >= siblings.length) return siblings;

    const next = siblings.slice();
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  });
}
