// app/dashboard/projects/links/_components/template-picker.tsx
"use client";

import { useMemo } from "react";
import {
  Building2,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { NAV_TEMPLATES, type NavTemplateId } from "@/lib/nav-menu/templates";
import { countNodes } from "@/lib/nav-menu/tree";

const TEMPLATE_ICONS: Record<NavTemplateId, LucideIcon> = {
  blank: Plus,
  ecommerce: ShoppingBag,
  corporate: Building2,
  admin: LayoutDashboard,
};

interface TemplatePickerProps {
  onSelect: (id: NavTemplateId) => void;
  /** Hide the heading when the picker is shown inside a dialog that has its own. */
  showHeading?: boolean;
}

export function TemplatePicker({
  onSelect,
  showHeading = true,
}: TemplatePickerProps) {
  // Summaries are for display only; real ids are generated when one is chosen.
  const summaries = useMemo(
    () =>
      NAV_TEMPLATES.map((template) => {
        const { items } = template.create();
        return {
          template,
          count: countNodes(items),
          topLevel: items.map((item) => item.label),
        };
      }),
    [],
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {showHeading && (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Start with a template
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a starting point. Nothing is saved until you click Save menu,
            and you can change everything afterwards.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {summaries.map(({ template, count, topLevel }) => {
          const Icon = TEMPLATE_ICONS[template.id];
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="inline-flex size-9 items-center justify-center rounded-lg bg-muted"
              >
                <Icon className="size-4" />
              </span>
              <span className="space-y-1">
                <span className="block font-medium">{template.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {template.description}
                </span>
              </span>
              <span className="mt-auto block truncate text-xs text-muted-foreground">
                {count === 0
                  ? "Empty menu"
                  : `${count} items · ${topLevel.join(", ")}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
