// app/dashboard/projects/links/_components/export-import-dialog.tsx
"use client";

import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NAV_SCHEMA_VERSION } from "@/lib/nav-menu/constants";
import { generateNavHtml } from "@/lib/nav-menu/html-export";
import { parseNavJson } from "@/lib/nav-menu/schema";
import type { NavNode } from "@/lib/nav-menu/types";
import { cn } from "@/lib/utils";

export type ExportImportTab = "json" | "html" | "import";

const TABS: { id: ExportImportTab; label: string }[] = [
  { id: "json", label: "Export JSON" },
  { id: "html", label: "Export HTML" },
  { id: "import", label: "Import JSON" },
];

const MAX_IMPORT_BYTES = 1_000_000;

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

function CodeBlock({
  code,
  filename,
  mime,
  note,
}: {
  code: string;
  filename: string;
  mime: string;
  note: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), 2000);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-md text-sm text-muted-foreground">{note}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {status === "copied" ? <Check /> : <Copy />}
            {status === "copied"
              ? "Copied"
              : status === "failed"
                ? "Copy failed"
                : "Copy"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={download}>
            <Download />
            Download
          </Button>
        </div>
      </div>
      <pre
        tabIndex={0}
        className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function JsonPanel({ items }: { items: NavNode[] }) {
  const code = useMemo(
    () => JSON.stringify({ schemaVersion: NAV_SCHEMA_VERSION, items }, null, 2),
    [items],
  );
  return (
    <CodeBlock
      code={code}
      filename="navigation-menu.json"
      mime="application/json"
      note="The full menu, including hidden items. This is the same JSON that is stored in the database, and it can be imported back."
    />
  );
}

function HtmlPanel({ items }: { items: NavNode[] }) {
  const code = useMemo(() => generateNavHtml(items), [items]);
  return (
    <CodeBlock
      code={code}
      filename="navigation-menu.html"
      mime="text/html"
      note="A self-contained snippet with markup, styles and a small script. Hidden items are left out, and icons need Font Awesome 6 on the page where you paste it."
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Import                                                                     */
/* -------------------------------------------------------------------------- */

function ImportPanel({
  onImport,
  onDone,
}: {
  onImport: (items: NavNode[], warnings: string[]) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (!file) return;

    if (file.size > MAX_IMPORT_BYTES) {
      setErrors([
        "That file is larger than 1 MB, which is too big for a menu.",
      ]);
      return;
    }
    setText(await file.text());
    setErrors([]);
  }

  function submit() {
    if (text.trim() === "") {
      setErrors(["Paste some JSON or choose a file first."]);
      return;
    }
    const result = parseNavJson(text);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    onImport(result.data.items, result.warnings);
    onDone();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Importing replaces the current menu. You can undo it afterwards. Missing
        ids are generated, and anything invalid is reported instead of imported.
      </p>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setErrors([]);
        }}
        rows={12}
        spellCheck={false}
        aria-label="Menu JSON"
        aria-invalid={errors.length > 0}
        placeholder='{ "schemaVersion": 1, "items": [ … ] }'
        className="w-full rounded-lg border border-input bg-transparent p-3 font-mono text-xs leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />

      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <p className="font-medium">This JSON can&apos;t be imported:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex cursor-pointer items-center text-sm font-medium underline-offset-2 hover:underline">
          Choose a .json file
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        <Button type="button" onClick={submit}>
          Import and replace menu
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

function Body({
  initialTab,
  items,
  onImport,
  onClose,
}: {
  initialTab: ExportImportTab;
  items: NavNode[];
  onImport: (items: NavNode[], warnings: string[]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ExportImportTab>(initialTab);

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = TABS.findIndex((candidate) => candidate.id === tab);
    const step = event.key === "ArrowRight" ? 1 : TABS.length - 1;
    const next = TABS[(index + step) % TABS.length];
    setTab(next.id);
    document.getElementById(`ei-tab-${next.id}`)?.focus();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Export and import</DialogTitle>
        <DialogDescription>
          Copy the menu as JSON or HTML, or replace it by importing JSON.
        </DialogDescription>
      </DialogHeader>

      <div
        role="tablist"
        aria-label="Export or import"
        onKeyDown={handleTabKeyDown}
        className="inline-flex w-fit rounded-lg bg-muted p-1"
      >
        {TABS.map((candidate) => (
          <button
            key={candidate.id}
            id={`ei-tab-${candidate.id}`}
            type="button"
            role="tab"
            aria-selected={tab === candidate.id}
            aria-controls="ei-panel"
            tabIndex={tab === candidate.id ? 0 : -1}
            onClick={() => setTab(candidate.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === candidate.id
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {candidate.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="ei-panel" aria-labelledby={`ei-tab-${tab}`}>
        {tab === "json" && <JsonPanel items={items} />}
        {tab === "html" && <HtmlPanel items={items} />}
        {tab === "import" && (
          <ImportPanel onImport={onImport} onDone={onClose} />
        )}
      </div>
    </>
  );
}

export interface ExportImportDialogProps {
  open: boolean;
  /** Which tab to show when the dialog opens. */
  initialTab: ExportImportTab;
  items: NavNode[];
  onOpenChange: (open: boolean) => void;
  onImport: (items: NavNode[], warnings: string[]) => void;
}

export function ExportImportDialog({
  open,
  initialTab,
  items,
  onOpenChange,
  onImport,
}: ExportImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {/* Mounted only while open, so tabs and typed text reset each time. */}
        {open && (
          <Body
            initialTab={initialTab}
            items={items}
            onImport={onImport}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
