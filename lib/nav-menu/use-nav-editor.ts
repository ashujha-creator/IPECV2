// lib/nav-menu/use-nav-editor.ts
"use client";

// Editor state for the menu builder: the current tree, undo/redo history,
// selection, collapsed rows and "has unsaved changes" tracking.
//
// All tree logic lives in ./tree (pure functions); this file only wires those
// operations into a reducer. The reducer is pure: anything the UI should tell
// the user (a rejected move, a cleared parent link) is returned as `notice`,
// which the shell shows as a toast when `notice.id` changes.

import { useMemo, useReducer } from "react";
import {
  countNodes,
  createNode,
  findNode,
  getChildren,
  indentNode,
  insertNode,
  moveNode,
  moveNodeDown,
  moveNodeUp,
  outdentNode,
  parentLinkWillBeCleared,
  removeNode,
  updateNode,
  type NodePatch,
  type TreeResult,
} from "./tree";
import type { NavNode } from "./types";

const HISTORY_LIMIT = 100;

const PARENT_LINK_NOTICE =
  "The parent's link was removed because it now has a submenu. Undo to restore it.";

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

export interface NavEditorNotice {
  /** Increases with every notice so the UI can react to repeats of the same text. */
  id: number;
  tone: "error" | "info";
  message: string;
}

interface EditorState {
  items: NavNode[];
  past: NavNode[][];
  future: NavNode[][];
  /** Items as last saved to the database; null when no menu exists yet. */
  savedItems: NavNode[] | null;
  /** Version of the saved row; null when no menu exists yet. */
  version: number | null;
  selectedId: string | null;
  collapsedIds: ReadonlySet<string>;
  notice: NavEditorNotice | null;
  noticeSeq: number;
}

function createInitialState(
  items: NavNode[],
  version: number | null,
): EditorState {
  return {
    items,
    past: [],
    future: [],
    savedItems: version === null ? null : items,
    version,
    selectedId: null,
    collapsedIds: new Set(),
    notice: null,
    noticeSeq: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

type EditorAction =
  | { type: "add"; parentId: string | null; node: NavNode }
  | { type: "update"; id: string; patch: NodePatch }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; parentId: string | null; index: number }
  | { type: "moveUp"; id: string }
  | { type: "moveDown"; id: string }
  | { type: "indent"; id: string }
  | { type: "outdent"; id: string }
  | { type: "replace"; items: NavNode[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; id: string | null }
  | { type: "toggleCollapsed"; id: string }
  | { type: "expandAll" }
  | { type: "collapseAll" }
  | { type: "markSaved"; version: number; savedItems: NavNode[] }
  | { type: "reset"; items: NavNode[]; version: number | null };

interface CommitOptions {
  /** Expand this row so a just-added or just-moved child is visible. */
  expandId?: string | null;
  /** Select this row after the change, if it still exists. */
  selectId?: string;
}

/** Applies a content change and records the previous tree for undo. */
function commit(
  state: EditorState,
  items: NavNode[],
  options: CommitOptions = {},
): EditorState {
  if (items === state.items) return state; // nothing changed: no history entry

  let collapsedIds = state.collapsedIds;
  if (options.expandId && collapsedIds.has(options.expandId)) {
    const next = new Set(collapsedIds);
    next.delete(options.expandId);
    collapsedIds = next;
  }

  const selectedId =
    options.selectId && findNode(items, options.selectId)
      ? options.selectId
      : validSelection(items, state.selectedId);

  return {
    ...state,
    items,
    past: [...state.past, state.items].slice(-HISTORY_LIMIT),
    future: [],
    selectedId,
    collapsedIds,
  };
}

function applyResult(
  state: EditorState,
  result: TreeResult,
  options?: CommitOptions,
): EditorState {
  if (!result.ok) return notify(state, "error", result.reason);
  return commit(state, result.items, options);
}

function notify(
  state: EditorState,
  tone: NavEditorNotice["tone"],
  message: string,
): EditorState {
  const id = state.noticeSeq + 1;
  return { ...state, noticeSeq: id, notice: { id, tone, message } };
}

function validSelection(items: NavNode[], id: string | null): string | null {
  return id !== null && findNode(items, id) ? id : null;
}

function collectParentIds(items: NavNode[], into: Set<string> = new Set()) {
  for (const node of items) {
    if (node.children.length > 0) {
      into.add(node.id);
      collectParentIds(node.children, into);
    }
  }
  return into;
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                    */
/* -------------------------------------------------------------------------- */

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "add": {
      const clearsLink = parentLinkWillBeCleared(state.items, action.parentId);
      const result = insertNode(state.items, action.node, action.parentId);
      const next = applyResult(state, result, {
        expandId: action.parentId,
        selectId: action.node.id,
      });
      return result.ok && clearsLink
        ? notify(next, "info", PARENT_LINK_NOTICE)
        : next;
    }

    case "update":
      return commit(state, updateNode(state.items, action.id, action.patch));

    case "remove":
      return commit(state, removeNode(state.items, action.id));

    case "move": {
      const clearsLink = parentLinkWillBeCleared(state.items, action.parentId);
      const result = moveNode(
        state.items,
        action.id,
        action.parentId,
        action.index,
      );
      const next = applyResult(state, result, {
        expandId: action.parentId,
        selectId: action.id,
      });
      return result.ok && clearsLink
        ? notify(next, "info", PARENT_LINK_NOTICE)
        : next;
    }

    case "moveUp":
      return commit(state, moveNodeUp(state.items, action.id));

    case "moveDown":
      return commit(state, moveNodeDown(state.items, action.id));

    case "indent": {
      // The item becomes the last child of its previous sibling.
      const location = findNode(state.items, action.id);
      const previous = location
        ? getChildren(state.items, location.parentId)[location.index - 1]
        : undefined;
      const clearsLink = parentLinkWillBeCleared(
        state.items,
        previous?.id ?? null,
      );
      const result = indentNode(state.items, action.id);
      const next = applyResult(state, result, {
        expandId: previous?.id,
        selectId: action.id,
      });
      return result.ok && clearsLink
        ? notify(next, "info", PARENT_LINK_NOTICE)
        : next;
    }

    case "outdent":
      return applyResult(state, outdentNode(state.items, action.id), {
        selectId: action.id,
      });

    case "replace": {
      // Templates and imports: undoable, with a clean selection and expanded tree.
      const next = commit(state, action.items);
      return next === state
        ? state
        : { ...next, selectedId: null, collapsedIds: new Set() };
    }

    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        items: previous,
        past: state.past.slice(0, -1),
        future: [state.items, ...state.future],
        selectedId: validSelection(previous, state.selectedId),
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        items: next,
        past: [...state.past, state.items].slice(-HISTORY_LIMIT),
        future: rest,
        selectedId: validSelection(next, state.selectedId),
      };
    }

    case "select":
      return state.selectedId === action.id
        ? state
        : { ...state, selectedId: action.id };

    case "toggleCollapsed": {
      const collapsedIds = new Set(state.collapsedIds);
      if (!collapsedIds.delete(action.id)) collapsedIds.add(action.id);
      return { ...state, collapsedIds };
    }

    case "expandAll":
      return { ...state, collapsedIds: new Set() };

    case "collapseAll":
      return { ...state, collapsedIds: collectParentIds(state.items) };

    case "markSaved":
      // Records what was persisted. Items are left alone so edits made while
      // the save was in flight are not lost (they simply show as unsaved).
      return {
        ...state,
        version: action.version,
        savedItems: action.savedItems,
      };

    case "reset":
      return {
        ...createInitialState(action.items, action.version),
        noticeSeq: state.noticeSeq,
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export interface UseNavEditorOptions {
  initialItems: NavNode[];
  /** Version of the saved menu, or null when none exists yet. */
  initialVersion: number | null;
}

export function useNavEditor({
  initialItems,
  initialVersion,
}: UseNavEditorOptions) {
  const [state, dispatch] = useReducer(
    reducer,
    { initialItems, initialVersion },
    (arg) => createInitialState(arg.initialItems, arg.initialVersion),
  );

  // `dispatch` is stable, so this object never changes identity.
  const actions = useMemo(
    () => ({
      /**
       * Adds a new item under `parentId` (null = top level) and selects it.
       * Returns the new id so the caller can open the editor for it. If the
       * insert is rejected (limits), the id won't exist in the tree and a
       * `notice` explains why.
       */
      addItem(
        parentId: string | null,
        overrides?: Partial<Omit<NavNode, "id">>,
      ): string {
        const node = createNode(overrides);
        dispatch({ type: "add", parentId, node });
        return node.id;
      },
      updateItem: (id: string, patch: NodePatch) =>
        dispatch({ type: "update", id, patch }),
      removeItem: (id: string) => dispatch({ type: "remove", id }),
      /** `index` is the position in the destination list after the item is lifted out. */
      moveItem: (id: string, parentId: string | null, index: number) =>
        dispatch({ type: "move", id, parentId, index }),
      moveUp: (id: string) => dispatch({ type: "moveUp", id }),
      moveDown: (id: string) => dispatch({ type: "moveDown", id }),
      indent: (id: string) => dispatch({ type: "indent", id }),
      outdent: (id: string) => dispatch({ type: "outdent", id }),
      /** Replace the whole tree (template or import). Undoable. */
      replaceItems: (items: NavNode[]) => dispatch({ type: "replace", items }),
      undo: () => dispatch({ type: "undo" }),
      redo: () => dispatch({ type: "redo" }),
      select: (id: string | null) => dispatch({ type: "select", id }),
      toggleCollapsed: (id: string) =>
        dispatch({ type: "toggleCollapsed", id }),
      expandAll: () => dispatch({ type: "expandAll" }),
      collapseAll: () => dispatch({ type: "collapseAll" }),
      /** Call after a successful save with the items that were sent. */
      markSaved: (version: number, savedItems: NavNode[]) =>
        dispatch({ type: "markSaved", version, savedItems }),
      /** Discard everything and start over (e.g. after deleting the menu). */
      reset: (items: NavNode[] = [], version: number | null = null) =>
        dispatch({ type: "reset", items, version }),
    }),
    [],
  );

  const isDirty = useMemo(() => {
    if (state.savedItems === null) return true; // never saved
    if (state.items === state.savedItems) return false;
    return JSON.stringify(state.items) !== JSON.stringify(state.savedItems);
  }, [state.items, state.savedItems]);

  // A menu that was never saved and is still empty has nothing worth saving.
  const canSave =
    isDirty && !(state.savedItems === null && state.items.length === 0);

  const nodeCount = useMemo(() => countNodes(state.items), [state.items]);

  return {
    items: state.items,
    version: state.version,
    selectedId: state.selectedId,
    collapsedIds: state.collapsedIds,
    notice: state.notice,
    nodeCount,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    isDirty,
    canSave,
    actions,
  };
}

export type NavEditor = ReturnType<typeof useNavEditor>;
