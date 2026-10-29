// app/dashboard/projects/links/_components/tree-row.tsx
"use client";

// One row of the structure tree. Purely presentational: it knows nothing about
// drag-and-drop. The drag layer (nav-tree.tsx) passes in the drag handle as a
// node, so swapping the DnD library never touches this file.

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  ChevronRight,
  ExternalLink,
  EyeOff,
  GripVertical,
  IndentDecrease,
  IndentIncrease,
  Link2Off,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { NavBadgeChip, NavIcon } from "@/components/MenuBuilder/nav-preview";
import type { MoveState } from "@/lib/nav-menu/tree";
import type { NavNode } from "@/lib/nav-menu/types";
import { cn } from "@/lib/utils";

/** Horizontal indentation per nesting level. Shared with the drag projection. */
export const INDENT_PX = 24;

/* -------------------------------------------------------------------------- */
/* Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function IconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-background hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-35",
        destructive && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function StatusChip({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

function SecondaryLine({ node }: { node: NavNode }) {
  const count = node.children.length;

  if (count > 0) {
    return (
      <span className="truncate text-xs text-muted-foreground">
        {count} sub-item{count === 1 ? "" : "s"}
      </span>
    );
  }

  if (!node.href) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700">
        <Link2Off aria-hidden className="size-3" />
        No link yet
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
      <span className="truncate">{node.href}</span>
      {node.target === "_blank" && (
        <ExternalLink
          aria-label="Opens in a new tab"
          className="size-3 shrink-0"
        />
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

export interface TreeRowProps {
  node: NavNode;
  /** 1-based nesting level; controls indentation. */
  level: number;
  isCollapsed: boolean;
  isSelected: boolean;
  moveState: MoveState;
  /** "ghost" is the drop placeholder shown in place while the row is dragged. */
  variant?: "default" | "ghost";
  /** Drag handle element supplied by the drag-and-drop layer. */
  dragHandle: ReactNode;
  onSelect: () => void;
  onToggle: () => void;
  onAddChild: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onIndent: () => void;
  onOutdent: () => void;
}

export function TreeRow({
  node,
  level,
  isCollapsed,
  isSelected,
  moveState,
  variant = "default",
  dragHandle,
  onSelect,
  onToggle,
  onAddChild,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
}: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isGhost = variant === "ghost";

  return (
    <div
      className={cn(
        "group relative flex min-h-12 items-center gap-1 rounded-md border pr-2 text-sm transition-colors",
        isSelected
          ? "border-primary/40 bg-accent"
          : "border-transparent bg-background hover:bg-muted",
        isGhost &&
          "border-dashed border-primary bg-primary/5 hover:bg-primary/5 [&>*]:invisible",
      )}
      style={{ paddingLeft: (level - 1) * INDENT_PX + 4 }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-label={
            isCollapsed ? `Expand ${node.label}` : `Collapse ${node.label}`
          }
          aria-expanded={!isCollapsed}
          onClick={onToggle}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              !isCollapsed && "rotate-90",
            )}
          />
        </button>
      ) : (
        <span className="size-6 shrink-0" aria-hidden />
      )}

      {dragHandle}

      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onEdit}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !node.visible && "opacity-60",
        )}
      >
        <span className="inline-flex size-4 shrink-0 items-center justify-center">
          <NavIcon icon={node.icon} className="size-4 text-muted-foreground" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium leading-5">{node.label}</span>
          <SecondaryLine node={node} />
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {node.badge && <NavBadgeChip badge={node.badge} />}
        {!node.visible && (
          <StatusChip icon={<EyeOff aria-hidden className="size-3" />}>
            Hidden
          </StatusChip>
        )}
        {node.disabled && (
          <StatusChip icon={<Ban aria-hidden className="size-3" />}>
            Disabled
          </StatusChip>
        )}
      </div>

      {/* Actions sit over the chips. They stay in the tab order and appear on
          hover, on keyboard focus, and whenever the row is selected. */}
      <div
        className={cn(
          "absolute inset-y-0 right-1 flex items-center gap-0.5 bg-inherit pl-2 opacity-0 transition-opacity",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          isSelected && "opacity-100",
        )}
      >
        <IconButton
          label="Move up"
          disabled={!moveState.canMoveUp}
          onClick={onMoveUp}
        >
          <ArrowUp aria-hidden className="size-4" />
        </IconButton>
        <IconButton
          label="Move down"
          disabled={!moveState.canMoveDown}
          onClick={onMoveDown}
        >
          <ArrowDown aria-hidden className="size-4" />
        </IconButton>
        <IconButton
          label="Move out one level"
          disabled={!moveState.canOutdent}
          onClick={onOutdent}
        >
          <IndentDecrease aria-hidden className="size-4" />
        </IconButton>
        <IconButton
          label="Nest under the item above"
          disabled={!moveState.canIndent}
          onClick={onIndent}
        >
          <IndentIncrease aria-hidden className="size-4" />
        </IconButton>
        <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />
        <IconButton label="Add sub-item" onClick={onAddChild}>
          <Plus aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="Edit" onClick={onEdit}>
          <Pencil aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="Delete" destructive onClick={onRemove}>
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drag overlay                                                               */
/* -------------------------------------------------------------------------- */

/** The floating card that follows the pointer while a row is dragged. */
export function TreeRowOverlay({
  node,
  descendantCount,
}: {
  node: NavNode;
  descendantCount: number;
}) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-md border bg-background px-3 text-sm shadow-lg ring-1 ring-primary/20">
      <GripVertical aria-hidden className="size-4 text-muted-foreground" />
      <NavIcon icon={node.icon} className="size-4 text-muted-foreground" />
      <span className="truncate font-medium">{node.label}</span>
      {descendantCount > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
          +{descendantCount}
        </span>
      )}
    </div>
  );
}
