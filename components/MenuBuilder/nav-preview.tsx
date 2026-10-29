// components/nav-menu/nav-preview.tsx
"use client";

// A deliberately plain, unbranded renderer for the menu JSON. It shows how the
// data behaves (nested flyouts on desktop, accordion drawer on mobile) without
// pretending to be the final navbar design.
//
// - The mode is a prop, not a media query, so it works inside the builder.
// - It renders exactly what visitors would get: hidden items are removed.
// - Links are inert here; clicking one must never navigate away from the builder.
// - Also exports NavIcon and NavBadgeChip, which the tree rows reuse.

import {
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { ChevronDown, ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { getNavIcon } from "@/lib/nav-menu/icons";
import {getPublicItems} from "@/lib/nav-menu/tree"
import type { BadgeVariant, NavBadge, NavNode } from "@/lib/nav-menu/types";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                */
/* -------------------------------------------------------------------------- */

/** Renders a stored Font Awesome class string. Unknown classes get a placeholder box. */
export function NavIcon({
  icon,
  className,
}: {
  icon: string | null;
  className?: string;
}) {
  if (!icon) return null;

  const definition = getNavIcon(icon);
  if (!definition) {
    return (
      <span
        aria-hidden
        title={`No preview available for "${icon}"`}
        className={cn(
          "inline-block rounded-[3px] border border-dashed border-muted-foreground/50",
          className,
        )}
      />
    );
  }

  return <definition.Icon aria-hidden className={className} />;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export function NavBadgeChip({
  badge,
  className,
}: {
  badge: NavBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none ring-1 ring-inset",
        BADGE_STYLES[badge.variant],
        className,
      )}
    >
      {badge.text}
    </span>
  );
}

function ItemContent({ node }: { node: NavNode }) {
  return (
    <>
      <NavIcon
        icon={node.icon}
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span className="truncate">{node.label}</span>
      {node.badge && <NavBadgeChip badge={node.badge} />}
      {node.target === "_blank" && (
        <ExternalLink
          aria-hidden
          className="size-3 shrink-0 text-muted-foreground"
        />
      )}
    </>
  );
}

function PreviewLink({
  node,
  className,
}: {
  node: NavNode;
  className?: string;
}) {
  return (
    <a
      href={node.disabled ? undefined : (node.href ?? undefined)}
      title={node.href ?? undefined}
      aria-disabled={node.disabled || undefined}
      tabIndex={node.disabled ? -1 : undefined}
      onClick={(event) => event.preventDefault()}
      className={cn(className, node.disabled && "pointer-events-none opacity-50")}
    >
      <ItemContent node={node} />
    </a>
  );
}

function PagePlaceholder() {
  return (
    <div aria-hidden className="space-y-3 p-4">
      <div className="h-3 w-2/5 rounded bg-muted" />
      <div className="h-3 w-4/5 rounded bg-muted/70" />
      <div className="h-3 w-3/5 rounded bg-muted/70" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop: horizontal bar with nested flyouts                                */
/* -------------------------------------------------------------------------- */

function DesktopItem({ node, depth }: { node: NavNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const hasChildren = node.children.length > 0;
  const isRoot = depth === 0;

  const rowClass = cn(
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors",
    "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    node.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
  );

  function handleBlur(event: FocusEvent<HTMLLIElement>) {
    // Close when focus leaves this item and everything nested inside it.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (event.key !== "Escape" || !open) return;
    event.stopPropagation(); // close only the innermost open flyout
    setOpen(false);
    itemRef.current?.querySelector<HTMLElement>(":scope > button")?.focus();
  }

  return (
    <li
      ref={itemRef}
      className="relative"
      onMouseEnter={() => hasChildren && !node.disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-expanded={open}
          disabled={node.disabled}
          onClick={() => setOpen((value) => !value)}
          className={rowClass}
        >
          <ItemContent node={node} />
          {isRoot ? (
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
          ) : (
            <ChevronRight
              aria-hidden
              className="ml-auto size-4 shrink-0 text-muted-foreground"
            />
          )}
        </button>
      ) : (
        <PreviewLink node={node} className={rowClass} />
      )}

      {hasChildren && open && (
        // The wrapper's padding bridges the gap so the pointer can travel into the flyout.
        <div
          className={cn(
            "absolute z-20 min-w-56",
            isRoot ? "left-0 top-full pt-1" : "left-full top-0 pl-1",
          )}
        >
          <ul className="rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
            {node.children.map((child) => (
              <DesktopItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function DesktopPreview({
  items,
  emptyMessage,
}: {
  items: NavNode[];
  emptyMessage: string;
}) {
  return (
    <div className="min-h-[26rem] rounded-xl border bg-background">
      <nav
        aria-label="Menu preview"
        className="flex items-center gap-4 border-b px-4 py-2"
      >
        <span className="text-sm font-semibold text-muted-foreground">
          Logo
        </span>
        {items.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1">
            {items.map((node) => (
              <DesktopItem key={node.id} node={node} depth={0} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </nav>
      <PagePlaceholder />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile: drawer with accordion                                              */
/* -------------------------------------------------------------------------- */

function MobileItem({ node }: { node: NavNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasChildren = node.children.length > 0;

  const rowClass =
    "flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (!hasChildren) {
    return (
      <li>
        <PreviewLink node={node} className={rowClass} />
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={node.disabled}
        onClick={() => setOpen((value) => !value)}
        className={cn(rowClass, node.disabled && "opacity-50")}
      >
        <ItemContent node={node} />
        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      <ul id={panelId} hidden={!open} className="ml-4 border-l pl-1">
        {node.children.map((child) => (
          <MobileItem key={child.id} node={child} />
        ))}
      </ul>
    </li>
  );
}

function MobilePreview({
  items,
  emptyMessage,
}: {
  items: NavNode[];
  emptyMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  return (
    <div
      className="relative mx-auto h-[34rem] w-full max-w-[22rem] overflow-hidden rounded-xl border bg-background"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold text-muted-foreground">
          Logo
        </span>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen(true)}
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu aria-hidden className="size-5" />
        </button>
      </div>
      <PagePlaceholder />

      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-foreground/30 transition-opacity motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id={drawerId}
        aria-label="Menu"
        inert={!open}
        className={cn(
          "absolute inset-y-0 left-0 flex w-4/5 flex-col border-r bg-background shadow-xl transition-transform duration-200 motion-reduce:transition-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <nav
          aria-label="Menu preview"
          className="flex-1 overflow-y-auto p-2"
        >
          {items.length > 0 ? (
            <ul>
              {items.map((node) => (
                <MobileItem key={node.id} node={node} />
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </nav>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Public component                                                           */
/* -------------------------------------------------------------------------- */

export type NavPreviewMode = "desktop" | "mobile";

export function NavPreview({
  items,
  mode,
}: {
  items: NavNode[];
  mode: NavPreviewMode;
}) {
  // Same filtering the public site will use: hidden items (and parents left
  // with no visible children) are removed.
  const publicItems = useMemo(() => getPublicItems(items), [items]);

  const emptyMessage =
    items.length === 0
      ? "Add an item to see it here."
      : "Every item is hidden, so visitors would see an empty menu.";

  return mode === "mobile" ? (
    <MobilePreview items={publicItems} emptyMessage={emptyMessage} />
  ) : (
    <DesktopPreview items={publicItems} emptyMessage={emptyMessage} />
  );
}