// app/dashboard/projects/links/_components/node-editor-dialog.tsx
"use client";

// Edits one menu item. The form works with plain strings and booleans and is
// converted to a NodePatch on submit; the server re-validates everything on
// save, so these rules only exist to give instant feedback.

import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavBadgeChip, NavIcon } from "@/components/MenuBuilder/nav-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BADGE_VARIANTS,
  ICON_CLASS_PATTERN,
  LINK_TARGETS,
  NAV_LIMITS,
} from "@/lib/nav-menu/constants";
import { isAllowedHref, labelSchema } from "@/lib/nav-menu/schema";
import type { NodePatch } from "@/lib/nav-menu/tree";
import type { NavNode } from "@/lib/nav-menu/types";
import { IconPicker } from "./icon-picker";

/* -------------------------------------------------------------------------- */
/* Form schema                                                                */
/* -------------------------------------------------------------------------- */

const collapseSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const formSchema = z.object({
  label: labelSchema,
  icon: z
    .string()
    .max(NAV_LIMITS.maxIconLength, "Icon class is too long.")
    .refine(
      (value) =>
        collapseSpaces(value) === "" ||
        ICON_CLASS_PATTERN.test(collapseSpaces(value)),
      "Use lowercase letters, numbers and hyphens, e.g. fa-solid fa-house.",
    ),
  href: z
    .string()
    .trim()
    .max(
      NAV_LIMITS.maxHrefLength,
      `Link must be ${NAV_LIMITS.maxHrefLength} characters or fewer.`,
    )
    .refine(
      (value) => value === "" || isAllowedHref(value),
      "This type of link isn't allowed.",
    ),
  target: z.enum(LINK_TARGETS),
  badgeText: z
    .string()
    .trim()
    .max(
      NAV_LIMITS.maxBadgeLength,
      `Badge text must be ${NAV_LIMITS.maxBadgeLength} characters or fewer.`,
    ),
  badgeVariant: z.enum(BADGE_VARIANTS),
  visible: z.boolean(),
  disabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/* -------------------------------------------------------------------------- */
/* Small layout helpers                                                       */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-message`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-message`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="space-y-0.5">
        <p id={`${id}-title`} className="text-sm font-medium">
          {title}
        </p>
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value: boolean) => onCheckedChange(value)}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form                                                                       */
/* -------------------------------------------------------------------------- */

function NodeEditorForm({
  node,
  onCancel,
  onSave,
}: {
  node: NavNode;
  onCancel: () => void;
  onSave: (patch: NodePatch) => void;
}) {
  // Items with a submenu only open it; they can't be links themselves.
  const hasChildren = node.children.length > 0;
  const [showIcons, setShowIcons] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: node.label,
      icon: node.icon ?? "",
      href: node.href ?? "",
      target: node.target,
      badgeText: node.badge?.text ?? "",
      badgeVariant: node.badge?.variant ?? "neutral",
      visible: node.visible,
      disabled: node.disabled,
    },
  });

  const iconValue = collapseSpaces(watch("icon"));
  const badgeText = watch("badgeText").trim();
  const badgeVariant = watch("badgeVariant");

  const submit = handleSubmit((values) => {
    const icon = collapseSpaces(values.icon);
    onSave({
      label: values.label,
      icon: icon === "" ? null : icon,
      href: hasChildren || values.href === "" ? null : values.href,
      target: hasChildren ? "_self" : values.target,
      badge:
        values.badgeText === ""
          ? null
          : { text: values.badgeText, variant: values.badgeVariant },
      visible: values.visible,
      disabled: values.disabled,
    });
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit item</DialogTitle>
        <DialogDescription>
          Change how this item looks and where it goes. Remember to save the
          menu afterwards.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} noValidate className="space-y-5">
        <Field id="node-label" label="Label" error={errors.label?.message}>
          <Input
            id="node-label"
            autoFocus
            autoComplete="off"
            aria-invalid={!!errors.label}
            aria-describedby={errors.label ? "node-label-message" : undefined}
            {...register("label")}
          />
        </Field>

        <Field
          id="node-icon"
          label="Icon"
          hint="A Font Awesome class, e.g. fa-solid fa-house. Optional."
          error={errors.icon?.message}
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40"
            >
              <NavIcon
                icon={iconValue === "" ? null : iconValue}
                className="size-4"
              />
            </span>
            <Input
              id="node-icon"
              autoComplete="off"
              spellCheck={false}
              placeholder="fa-solid fa-house"
              aria-invalid={!!errors.icon}
              aria-describedby="node-icon-message"
              {...register("icon")}
            />
            <Button
              type="button"
              variant="outline"
              aria-expanded={showIcons}
              onClick={() => setShowIcons((value) => !value)}
            >
              Browse
            </Button>
          </div>
          {showIcons && (
            <IconPicker
              value={iconValue === "" ? null : iconValue}
              onChange={(icon) => {
                setValue("icon", icon ?? "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setShowIcons(false);
              }}
            />
          )}
        </Field>

        {hasChildren ? (
          <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            This item opens a submenu, so it doesn&apos;t have a link of its
            own. Remove its sub-items if you want it to be a link.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <Field
              id="node-href"
              label="Link"
              hint="A path like /about, a full URL, mailto:, tel: or #anchor."
              error={errors.href?.message}
            >
              <Input
                id="node-href"
                autoComplete="off"
                spellCheck={false}
                placeholder="/about"
                aria-invalid={!!errors.href}
                aria-describedby="node-href-message"
                {...register("href")}
              />
            </Field>
            <Field id="node-target" label="Opens in">
              <select
                id="node-target"
                className={SELECT_CLASS}
                {...register("target")}
              >
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </select>
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <Field
            id="node-badge-text"
            label="Badge"
            hint="Short text such as New or Sale. Leave empty for none."
            error={errors.badgeText?.message}
            aside={
              badgeText !== "" ? (
                <NavBadgeChip
                  badge={{ text: badgeText, variant: badgeVariant }}
                />
              ) : null
            }
          >
            <Input
              id="node-badge-text"
              autoComplete="off"
              aria-invalid={!!errors.badgeText}
              aria-describedby="node-badge-text-message"
              {...register("badgeText")}
            />
          </Field>
          <Field id="node-badge-variant" label="Badge style">
            <select
              id="node-badge-variant"
              className={SELECT_CLASS}
              {...register("badgeVariant")}
            >
              <option value="neutral">Neutral</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </Field>
        </div>

        <div className="space-y-2">
          <Controller
            control={control}
            name="visible"
            render={({ field }) => (
              <ToggleRow
                id="node-visible"
                title="Visible"
                description="Hidden items stay in the builder but are left out of the public menu, along with their sub-items."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="disabled"
            render={({ field }) => (
              <ToggleRow
                id="node-disabled"
                title="Disabled"
                description="Shown greyed out and can't be clicked."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Apply changes</Button>
        </DialogFooter>
      </form>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

export interface NodeEditorDialogProps {
  /** The item being edited; null keeps the dialog closed. */
  node: NavNode | null;
  onClose: () => void;
  onSave: (id: string, patch: NodePatch) => void;
}

export function NodeEditorDialog({
  node,
  onClose,
  onSave,
}: NodeEditorDialogProps) {
  return (
    <Dialog
      open={node !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {node && (
          // `key` remounts the form, so it starts fresh for each item.
          <NodeEditorForm
            key={node.id}
            node={node}
            onCancel={onClose}
            onSave={(patch) => onSave(node.id, patch)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
