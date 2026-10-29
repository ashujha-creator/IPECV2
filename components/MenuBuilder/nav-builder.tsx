// app/dashboard/projects/links/_components/nav-builder.tsx
"use client";

// The builder shell: owns the editor state, wires the tree, preview and dialogs
// together, and talks to the server actions. Everything else is presentational.

import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  Download,
  LayoutTemplate,
  LoaderCircle,
  Monitor,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import {
  NavPreview,
  type NavPreviewMode,
} from "@/components/MenuBuilder/nav-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NAV_SCHEMA_VERSION } from "@/lib/nav-menu/constants";
import { getNavTemplate, type NavTemplateId } from "@/lib/nav-menu/templates";
import { countNodes, findNode } from "@/lib/nav-menu/tree";
import type {
  NavActionResult,
  NavMenuSnapshot,
  NavNode,
} from "@/lib/nav-menu/types";
import { useNavEditor } from "@/lib/nav-menu/use-nav-editor";
import { cn } from "@/lib/utils";
import { deleteNavMenuAction, saveNavMenuAction } from "@/app/dashboard/projects/links/actions";
import {
  ExportImportDialog,
  type ExportImportTab,
} from "@/components/MenuBuilder/export-import-dialog";
import { NavTree } from "@/components/MenuBuilder/nav-tree";
import { NodeEditorDialog } from "./node-editor-dialog";
import { TemplatePicker } from "./template-picker";

type Failure = Extract<NavActionResult<unknown>, { ok: false }>;

function reportFailure(result: Failure) {
  const needsReload = result.code === "CONFLICT" || result.code === "NOT_FOUND";
  toast.error(result.message, {
    description: result.details?.slice(0, 3).join(" • "),
    duration: needsReload ? 10_000 : undefined,
    action: needsReload
      ? { label: "Reload page", onClick: () => window.location.reload() }
      : undefined,
  });
}

export function NavBuilder({
  initialSnapshot,
}: {
  initialSnapshot: NavMenuSnapshot | null;
}) {
  const editor = useNavEditor({
    initialItems: initialSnapshot?.content.items ?? [],
    initialVersion: initialSnapshot?.version ?? null,
  });
  const { actions } = editor;

  // With no saved menu, show the template picker until the user chooses.
  const [started, setStarted] = useState(initialSnapshot !== null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<NavPreviewMode>("desktop");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [exportImportTab, setExportImportTab] =
    useState<ExportImportTab>("json");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBusy = isSaving || isDeleting;
  const undoAction = { label: "Undo", onClick: () => actions.undo() };

  // Messages produced by the reducer (rejected moves, cleared parent links).
  useEffect(() => {
    if (!editor.notice) return;
    if (editor.notice.tone === "error") toast.error(editor.notice.message);
    else toast.info(editor.notice.message);
  }, [editor.notice]);

  // Warn before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!editor.canSave) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editor.canSave]);

  /* ----------------------------- Item handlers ---------------------------- */

  const editingNode = editingId
    ? (findNode(editor.items, editingId)?.node ?? null)
    : null;

  function handleAddRoot() {
    setEditingId(actions.addItem(null));
  }

  function handleAddChild(parentId: string) {
    setEditingId(actions.addItem(parentId));
  }

  function handleRemove(id: string) {
    const location = findNode(editor.items, id);
    if (!location) return;
    const subItems = countNodes(location.node.children);
    actions.removeItem(id);
    toast(`Deleted “${location.node.label}”`, {
      description:
        subItems > 0
          ? `${subItems} sub-item${subItems === 1 ? "" : "s"} removed too.`
          : undefined,
      action: undoAction,
    });
  }

  /* --------------------------- Template and import ------------------------ */

  function handlePickTemplate(id: NavTemplateId) {
    const template = getNavTemplate(id);
    const hadItems = editor.items.length > 0;
    actions.replaceItems(template.create().items);
    setStarted(true);
    setTemplatesOpen(false);
    if (hadItems) {
      toast(`Replaced the menu with “${template.name}”`, {
        action: undoAction,
      });
    }
  }

  function handleImport(items: NavNode[], warnings: string[]) {
    actions.replaceItems(items);
    setStarted(true);
    toast.success(`Imported ${countNodes(items)} items`, {
      description:
        warnings.length > 0 ? warnings.slice(0, 2).join(" ") : undefined,
      action: undoAction,
    });
  }

  function openExportImport(tab: ExportImportTab) {
    setExportImportTab(tab);
    setExportImportOpen(true);
  }

  /* ------------------------------ Save and delete ------------------------- */

  async function handleSave() {
    if (isBusy || !editor.canSave) return;
    setIsSaving(true);
    const sentItems = editor.items;
    try {
      const result = await saveNavMenuAction({
        content: { schemaVersion: NAV_SCHEMA_VERSION, items: sentItems },
        expectedVersion: editor.version,
      });
      if (result.ok) {
        actions.markSaved(result.data.version, sentItems);
        toast.success("Menu saved");
      } else {
        reportFailure(result);
      }
    } catch {
      toast.error(
        "Couldn't reach the server. Your changes are still here, so try saving again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMenu() {
    if (editor.version === null) return;
    setIsDeleting(true);
    try {
      const result = await deleteNavMenuAction({
        expectedVersion: editor.version,
      });
      if (result.ok) {
        actions.reset([], null);
        setStarted(false);
        setDeleteOpen(false);
        toast.success("Menu deleted");
      } else {
        reportFailure(result);
      }
    } catch {
      toast.error("Couldn't reach the server. The menu was not deleted.");
    } finally {
      setIsDeleting(false);
    }
  }

  /* --------------------------------- Render ------------------------------- */

  if (!started) {
    return (
      <div className="py-6">
        <TemplatePicker onSelect={handlePickTemplate} />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  const status =
    editor.version === null
      ? "Not saved yet"
      : editor.isDirty
        ? "Unsaved changes"
        : "All changes saved";
  const hasParents = editor.items.some((node) => node.children.length > 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <span
              aria-hidden
              className={cn(
                "size-2 rounded-full",
                editor.version === null
                  ? "bg-muted-foreground/50"
                  : editor.isDirty
                    ? "bg-amber-500"
                    : "bg-emerald-500",
              )}
            />
            {status}
          </span>
          <span className="text-sm text-muted-foreground">
            {editor.nodeCount} item{editor.nodeCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Undo"
            title="Undo"
            disabled={!editor.canUndo}
            onClick={() => actions.undo()}
          >
            <Undo2 />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Redo"
            title="Redo"
            disabled={!editor.canRedo}
            onClick={() => actions.redo()}
          >
            <Redo2 />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTemplatesOpen(true)}
          >
            <LayoutTemplate />
            Templates
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openExportImport("import")}
          >
            <Upload />
            Import
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openExportImport("json")}
          >
            <Download />
            Export
          </Button>
          {editor.version !== null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Delete menu
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!editor.canSave || isBusy}
            onClick={handleSave}
          >
            {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
            {isSaving ? "Saving…" : "Save menu"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Structure */}
        <section
          aria-labelledby="structure-heading"
          className="rounded-xl border bg-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <h2 id="structure-heading" className="text-sm font-semibold">
              Structure
            </h2>
            <div className="flex items-center gap-1">
              {hasParents && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.expandAll()}
                  >
                    Expand all
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.collapseAll()}
                  >
                    Collapse all
                  </Button>
                </>
              )}
              <Button type="button" size="sm" onClick={handleAddRoot}>
                <Plus />
                Add item
              </Button>
            </div>
          </div>
          <div className="p-2">
            <NavTree
              items={editor.items}
              collapsedIds={editor.collapsedIds}
              selectedId={editor.selectedId}
              actions={actions}
              onAddChild={handleAddChild}
              onEdit={setEditingId}
              onRemove={handleRemove}
            />
          </div>
        </section>

        {/* Preview */}
        <section
          aria-labelledby="preview-heading"
          className="rounded-xl border bg-card lg:sticky lg:top-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <h2 id="preview-heading" className="text-sm font-semibold">
              Live preview
            </h2>
            <div
              role="group"
              aria-label="Preview size"
              className="inline-flex rounded-lg bg-muted p-1"
            >
              {(["desktop", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={previewMode === mode}
                  onClick={() => setPreviewMode(mode)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    previewMode === mode
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode === "desktop" ? (
                    <Monitor className="size-4" />
                  ) : (
                    <Smartphone className="size-4" />
                  )}
                  {mode === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <NavPreview items={editor.items} mode={previewMode} />
            <p className="mt-3 text-xs text-muted-foreground">
              Shows what visitors would get: hidden items are left out. The
              styling is basic on purpose, since the navbar design comes later.
            </p>
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <NodeEditorDialog
        node={editingNode}
        onClose={() => setEditingId(null)}
        onSave={(id, patch) => {
          actions.updateItem(id, patch);
          setEditingId(null);
        }}
      />

      <ExportImportDialog
        open={exportImportOpen}
        initialTab={exportImportTab}
        items={editor.items}
        onOpenChange={setExportImportOpen}
        onImport={handleImport}
      />

      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Start from a template</DialogTitle>
            <DialogDescription>
              This replaces the current menu. You can undo it afterwards.
            </DialogDescription>
          </DialogHeader>
          <TemplatePicker showHeading={false} onSelect={handlePickTemplate} />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete the saved menu?</DialogTitle>
            <DialogDescription>
              This removes the menu from the database. Your site&apos;s navbar
              will have nothing to render until you create a new one. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteMenu}
            >
              {isDeleting && <LoaderCircle className="animate-spin" />}
              Delete menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove this line if your root layout already renders a sonner Toaster. */}
      <Toaster position="bottom-right" />
    </div>
  );
}
