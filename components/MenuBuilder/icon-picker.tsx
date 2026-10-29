// app/dashboard/projects/links/_components/icon-picker.tsx
"use client";

// A searchable grid of the curated icon set. It is rendered inline (inside the
// node editor) rather than as a popover, which avoids nested focus traps.
// Icons outside this set can still be typed into the editor's class field.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NAV_ICONS, getNavIcon, searchNavIcons } from "@/lib/nav-menu/icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  /** Currently stored class string, e.g. "fa-solid fa-house", or null. */
  value: string | null;
  /** Called with the chosen class string, or null to remove the icon. */
  onChange: (icon: string | null) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchNavIcons(query), [query]);
  const selectedName = getNavIcon(value)?.name;

  return (
    <div className={cn("rounded-lg border bg-muted/30 p-2", className)}>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons, e.g. cart, user, settings"
          aria-label="Search icons"
          autoComplete="off"
          className="pl-8"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span aria-live="polite">
          {results.length} of {NAV_ICONS.length} icons
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded px-1 font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Remove icon
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ul className="mt-2 grid max-h-52 grid-cols-7 gap-1 overflow-y-auto pr-1">
          {results.map((definition) => {
            const isSelected = definition.name === selectedName;
            return (
              <li key={definition.name}>
                <button
                  type="button"
                  title={definition.label}
                  aria-label={definition.label}
                  aria-pressed={isSelected}
                  onClick={() => onChange(definition.className)}
                  className={cn(
                    "inline-flex size-9 w-full items-center justify-center rounded-md border border-transparent text-foreground transition-colors",
                    "hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected &&
                      "border-primary/50 bg-background text-primary",
                  )}
                >
                  <definition.Icon aria-hidden className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 px-1 text-sm text-muted-foreground">
          No icons match &ldquo;{query}&rdquo;. You can still type any Font
          Awesome class into the icon field.
        </p>
      )}
    </div>
  );
}
