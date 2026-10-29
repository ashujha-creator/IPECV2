// app/dashboard/projects/links/_components/nav-tree.tsx
"use client";

// The structure tree with drag-and-drop. This is the ONLY file that imports
// dnd-kit, so replacing the library later means rewriting just this file.
//
// How nesting works while dragging: the visible rows are a flat list. Moving
// the pointer up/down reorders it; moving it left/right changes the depth the
// row will land at. `getProjection` turns "row position + horizontal offset"
// into a (parentId, index) pair, which is handed to `actions.moveItem`.
// The row being dragged is shown as a dashed placeholder at the projected
// depth, plus a floating card that follows the pointer.

import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { NAV_LIMITS } from "@/lib/nav-menu/constants";
import {
  countNodes,
  findNode,
  flattenTree,
  getMoveState,
  subtreeHeight,
  type FlatNode,
  type MoveState,
} from "@/lib/nav-menu/tree";
import type { NavNode } from "@/lib/nav-menu/types";
import type { NavEditor } from "@/lib/nav-menu/use-nav-editor";
import { INDENT_PX, TreeRow, TreeRowOverlay } from "./tree-row";

const NO_MOVES: MoveState = {
  canMoveUp: false,
  canMoveDown: false,
  canIndent: false,
  canOutdent: false,
};

/* -------------------------------------------------------------------------- */
/* Drop projection                                                            */
/* -------------------------------------------------------------------------- */

interface Projection {
  /** 0-based depth the dragged row will have. */
  depth: number;
  parentId: string | null;
  /** Position among the new parent's children, after the row is lifted out. */
  index: number;
}

function getProjection(
  rows: FlatNode[],
  activeId: string,
  overId: string,
  depthDelta: number,
): Projection | null {
  const activeIndex = rows.findIndex((row) => row.id === activeId);
  const overIndex = rows.findIndex((row) => row.id === overId);
  if (activeIndex === -1 || overIndex === -1) return null;

  const active = rows[activeIndex];
  const reordered = arrayMove(rows, activeIndex, overIndex);
  const previous = reordered[overIndex - 1];
  const next = reordered[overIndex + 1];

  // A row can nest at most one level below the row above it, can't sit
  // shallower than the row below it, and must respect the global depth limit.
  const maxDepth = previous
    ? Math.min(previous.level, NAV_LIMITS.maxDepth - subtreeHeight(active.node))
    : 0;
  const minDepth = next ? next.level - 1 : 0;
  const projectedDepth = active.level - 1 + depthDelta;

  let depth = projectedDepth;
  if (projectedDepth >= maxDepth) depth = maxDepth;
  else if (projectedDepth < minDepth) depth = minDepth;
  depth = Math.max(depth, 0);

  if (!previous) return { depth: 0, parentId: null, index: 0 };

  const previousDepth = previous.level - 1;

  // Deeper than the row above: becomes that row's first child.
  if (depth > previousDepth) return { depth, parentId: previous.id, index: 0 };

  // Same depth or shallower: lands right after the sibling at that depth.
  const anchor =
    depth === previousDepth
      ? previous
      : reordered
          .slice(0, overIndex)
          .reverse()
          .find((row) => row.level - 1 === depth);
  if (!anchor) return null;

  // If the dragged row currently sits before the anchor in the same list,
  // lifting it out shifts the anchor up by one.
  const shift =
    active.parentId === anchor.parentId && active.index < anchor.index ? 1 : 0;

  return { depth, parentId: anchor.parentId, index: anchor.index + 1 - shift };
}

function collectDescendantIds(
  node: NavNode,
  into: Set<string> = new Set(),
): Set<string> {
  for (const child of node.children) {
    into.add(child.id);
    collectDescendantIds(child, into);
  }
  return into;
}

/* -------------------------------------------------------------------------- */
/* Sortable row                                                               */
/* -------------------------------------------------------------------------- */

interface SortableRowProps {
  row: FlatNode;
  level: number;
  isCollapsed: boolean;
  isSelected: boolean;
  moveState: MoveState;
  actions: NavEditor["actions"];
  onAddChild: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableRow({
  row,
  level,
  isCollapsed,
  isSelected,
  moveState,
  actions,
  onAddChild,
  onEdit,
  onRemove,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { id, node } = row;

  return (
    <li ref={setNodeRef} style={style}>
      <TreeRow
        node={node}
        level={level}
        isCollapsed={isCollapsed}
        isSelected={isSelected}
        moveState={moveState}
        variant={isDragging ? "ghost" : "default"}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${node.label}`}
            className="inline-flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          >
            <GripVertical aria-hidden className="size-4" />
          </button>
        }
        onSelect={() => actions.select(id)}
        onToggle={() => actions.toggleCollapsed(id)}
        onAddChild={() => onAddChild(id)}
        onEdit={() => onEdit(id)}
        onRemove={() => onRemove(id)}
        onMoveUp={() => actions.moveUp(id)}
        onMoveDown={() => actions.moveDown(id)}
        onIndent={() => actions.indent(id)}
        onOutdent={() => actions.outdent(id)}
      />
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Tree                                                                       */
/* -------------------------------------------------------------------------- */

export interface NavTreeProps {
  items: NavNode[];
  collapsedIds: ReadonlySet<string>;
  selectedId: string | null;
  actions: NavEditor["actions"];
  onAddChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function NavTree({
  items,
  collapsedIds,
  selectedId,
  actions,
  onAddChild,
  onEdit,
  onRemove,
}: NavTreeProps) {
  // A stable id keeps dnd-kit's generated aria ids identical on server and client.
  const dndId = useId();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // Horizontal drag distance in whole indentation steps (changes rarely, so
  // the list doesn't re-render on every pointer move).
  const [depthDelta, setDepthDelta] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const allRows = useMemo(
    () => flattenTree(items, collapsedIds),
    [items, collapsedIds],
  );
  const activeRow = activeId
    ? (allRows.find((row) => row.id === activeId) ?? null)
    : null;

  // While dragging, the row's own sub-items travel with it and are hidden.
  const rows = useMemo(() => {
    if (!activeRow) return allRows;
    const hidden = collectDescendantIds(activeRow.node);
    return allRows.filter((row) => !hidden.has(row.id));
  }, [allRows, activeRow]);

  const sortableIds = useMemo(() => rows.map((row) => row.id), [rows]);

  const projection = useMemo(
    () =>
      activeId && overId
        ? getProjection(rows, activeId, overId, depthDelta)
        : null,
    [rows, activeId, overId, depthDelta],
  );

  const moveStates = useMemo(() => {
    const states = new Map<string, MoveState>();
    for (const row of flattenTree(items)) {
      states.set(row.id, getMoveState(items, row.id));
    }
    return states;
  }, [items]);

  function resetDrag() {
    setActiveId(null);
    setOverId(null);
    setDepthDelta(0);
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
    setOverId(String(active.id));
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setDepthDelta(Math.round(delta.x / INDENT_PX));
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over ? String(over.id) : null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const target = projection;
    resetDrag();
    if (!target || !over) return;

    const id = String(active.id);
    const current = findNode(items, id);
    if (!current) return;

    // Dropped where it already was: don't create an empty undo step.
    if (
      current.parentId === target.parentId &&
      current.index === target.index
    ) {
      return;
    }
    actions.moveItem(id, target.parentId, target.index);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        No items yet. Add your first item to start building the menu.
      </div>
    );
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
    >
      <SortableContext
        items={sortableIds}
        strategy={verticalListSortingStrategy}
      >
        <ul aria-label="Menu structure" className="flex flex-col gap-0.5">
          {rows.map((row) => (
            <SortableRow
              key={row.id}
              row={row}
              level={
                row.id === activeId && projection
                  ? projection.depth + 1
                  : row.level
              }
              isCollapsed={collapsedIds.has(row.id)}
              isSelected={row.id === selectedId}
              moveState={moveStates.get(row.id) ?? NO_MOVES}
              actions={actions}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeRow ? (
          <TreeRowOverlay
            node={activeRow.node}
            descendantCount={countNodes(activeRow.node.children)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
