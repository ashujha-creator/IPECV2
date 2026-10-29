// lib/nav-menu/html-export.ts
//
// Turns the menu into a self-contained snippet: semantic <nav>/<ul> markup,
// a small stylesheet and a small script (nested dropdowns on desktop, a
// drawer with accordion on narrow screens). It exports what visitors see, so
// hidden items are left out. Pure string building: safe on server and client.

import { ICON_CLASS_PATTERN } from "./constants";
import { isAllowedHref } from "./schema";
import { getPublicItems } from "./tree";
import type { NavNode } from "./types";

const STYLES = `.nm{--nm-fg:#1f2937;--nm-muted:#6b7280;--nm-bg:#fff;--nm-hover:#f3f4f6;--nm-border:#e5e7eb;--nm-accent:#2563eb;position:relative;background:var(--nm-bg);border-bottom:1px solid var(--nm-border);color:var(--nm-fg);font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
.nm ul{margin:0;padding:0;list-style:none}
.nm-link{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;padding:10px 12px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;text-align:left;text-decoration:none;cursor:pointer}
.nm-link:hover{background:var(--nm-hover)}
.nm-link:focus-visible,.nm-toggle:focus-visible{outline:2px solid var(--nm-accent);outline-offset:-2px}
.nm-link.is-disabled{opacity:.5;pointer-events:none}
.nm-text{cursor:default}
.nm-text:hover{background:none}
.nm-link i{width:16px;color:var(--nm-muted);text-align:center}
.nm-caret{margin-left:auto;transition:transform .15s}
.nm-caret::before{content:"";display:block;width:6px;height:6px;border:solid var(--nm-muted);border-width:0 1.5px 1.5px 0;transform:rotate(45deg) translate(-1px,-1px)}
[aria-expanded="true"]>.nm-caret{transform:rotate(180deg)}
.nm-badge{padding:2px 6px;border-radius:999px;background:#f1f5f9;color:#334155;font-size:11px;font-weight:500;line-height:1.2}
.nm-badge--info{background:#eff6ff;color:#1d4ed8}
.nm-badge--success{background:#ecfdf5;color:#047857}
.nm-badge--warning{background:#fffbeb;color:#92400e}
.nm-badge--danger{background:#fef2f2;color:#b91c1c}
.nm-sub{display:none}
.nm-has-sub>button[aria-expanded="true"]+.nm-sub{display:block}
.nm-toggle{display:none;position:relative;z-index:60;align-items:center;justify-content:center;width:40px;height:40px;margin:4px;border:0;border-radius:6px;background:none;color:inherit;cursor:pointer}
.nm-bars,.nm-bars::before,.nm-bars::after{display:block;width:18px;height:2px;border-radius:1px;background:currentColor}
.nm-bars{position:relative}
.nm-bars::before,.nm-bars::after{content:"";position:absolute;left:0}
.nm-bars::before{top:-6px}
.nm-bars::after{top:6px}
@media (min-width:768px){
.nm-list{display:flex;gap:4px;padding:4px 8px}
.nm-item{position:relative}
.nm-link{width:auto}
.nm-sub{position:absolute;top:100%;left:0;z-index:20;min-width:220px;padding:4px;border:1px solid var(--nm-border);border-radius:8px;background:var(--nm-bg);box-shadow:0 8px 24px rgba(0,0,0,.08)}
.nm-sub .nm-sub{top:0;left:100%}
.nm-sub .nm-link{width:100%}
.nm-has-sub:hover>.nm-sub,.nm-has-sub:focus-within>.nm-sub{display:block}
}
@media (max-width:767px){
.nm-toggle{display:inline-flex}
.nm-list{position:fixed;top:0;bottom:0;left:0;z-index:50;box-sizing:border-box;width:min(320px,85vw);padding:56px 8px 8px;overflow-y:auto;background:var(--nm-bg);box-shadow:4px 0 24px rgba(0,0,0,.12);transform:translateX(-100%);visibility:hidden;transition:transform .2s,visibility .2s}
.nm-open .nm-list{transform:none;visibility:visible}
.nm-sub{margin-left:16px;padding-left:4px;border-left:1px solid var(--nm-border)}
}`;

const SCRIPT = `document.querySelectorAll(".nm").forEach(function (nav) {
  if (nav.dataset.nmReady) return;
  nav.dataset.nmReady = "1";
  var toggle = nav.querySelector(".nm-toggle");
  var triggers = nav.querySelectorAll(".nm-has-sub > button");

  function setDrawer(open) {
    nav.classList.toggle("nm-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  function closeAll() {
    triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
    setDrawer(false);
  }

  toggle.addEventListener("click", function () {
    setDrawer(!nav.classList.contains("nm-open"));
  });
  triggers.forEach(function (t) {
    t.addEventListener("click", function () {
      t.setAttribute("aria-expanded", String(t.getAttribute("aria-expanded") !== "true"));
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) closeAll(); });
});`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderContent(node: NavNode): string {
  const icon =
    node.icon && ICON_CLASS_PATTERN.test(node.icon)
      ? `<i class="${escapeHtml(node.icon)}" aria-hidden="true"></i>`
      : "";
  const badge = node.badge
    ? `<span class="nm-badge nm-badge--${node.badge.variant}">${escapeHtml(node.badge.text)}</span>`
    : "";
  return `${icon}<span>${escapeHtml(node.label)}</span>${badge}`;
}

function renderLeaf(node: NavNode, content: string): string {
  if (node.disabled) {
    return `<a class="nm-link is-disabled" aria-disabled="true" tabindex="-1">${content}</a>`;
  }
  // Re-check the link here too, so an unsafe value can never reach the output.
  if (node.href && isAllowedHref(node.href)) {
    const external =
      node.target === "_blank"
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
    return `<a class="nm-link" href="${escapeHtml(node.href)}"${external}>${content}</a>`;
  }
  return `<span class="nm-link nm-text">${content}</span>`;
}

function renderItem(node: NavNode, depth: number): string {
  const pad = "  ".repeat(depth);
  const content = renderContent(node);

  if (node.children.length === 0) {
    return `${pad}<li class="nm-item">${renderLeaf(node, content)}</li>`;
  }

  const disabled = node.disabled ? ' disabled aria-disabled="true"' : "";
  const linkClass = node.disabled ? "nm-link is-disabled" : "nm-link";

  return [
    `${pad}<li class="nm-item nm-has-sub">`,
    `${pad}  <button class="${linkClass}" type="button" aria-expanded="false"${disabled}>${content}<span class="nm-caret" aria-hidden="true"></span></button>`,
    `${pad}  <ul class="nm-sub">`,
    ...node.children.map((child) => renderItem(child, depth + 2)),
    `${pad}  </ul>`,
    `${pad}</li>`,
  ].join("\n");
}

/** Generates the snippet for the items visitors would see. */
export function generateNavHtml(items: NavNode[]): string {
  const visible = getPublicItems(items);
  if (visible.length === 0) {
    return "<!-- The menu is empty, or every item is hidden. -->";
  }

  const list = visible.map((node) => renderItem(node, 2)).join("\n");
  const usesIcons = list.includes('<i class="');

  return [
    "<!-- Navigation menu generated by the menu builder. -->",
    usesIcons
      ? "<!-- Icons need Font Awesome 6 (free) to be loaded on the page. -->"
      : null,
    `<style>\n${STYLES}\n</style>`,
    '<nav class="nm" aria-label="Main">',
    '  <button class="nm-toggle" type="button" aria-expanded="false" aria-controls="nm-list" aria-label="Open menu"><span class="nm-bars" aria-hidden="true"></span></button>',
    '  <ul class="nm-list" id="nm-list">',
    list,
    "  </ul>",
    "</nav>",
    `<script>\n${SCRIPT}\n</script>`,
  ]
    .filter((part): part is string => part !== null)
    .join("\n");
}
