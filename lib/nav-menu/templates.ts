// lib/nav-menu/templates.ts
//
// Starter menus shown when no menu has been saved yet (and via "Templates" in
// the toolbar). Each template is a factory so every use gets fresh node ids.
// All links are placeholders the user is expected to edit.

import { NAV_SCHEMA_VERSION } from "./constants";
import { createNode, emptyNavContent } from "./tree";
import type {
  BadgeVariant,
  LinkTarget,
  NavMenuContent,
  NavNode,
} from "./types";

export type NavTemplateId = "blank" | "ecommerce" | "corporate" | "admin";

export interface NavTemplate {
  id: NavTemplateId;
  name: string;
  description: string;
  create: () => NavMenuContent;
}

/* -------------------------------------------------------------------------- */
/* Builder helpers                                                            */
/* -------------------------------------------------------------------------- */

interface ItemOptions {
  /** Font Awesome class string, e.g. "fa-solid fa-house". */
  icon?: string;
  href?: string;
  target?: LinkTarget;
  badge?: [text: string, variant: BadgeVariant];
  visible?: boolean;
  disabled?: boolean;
}

/** Items with children are never links, so `href`/`target` are ignored for them. */
function item(
  label: string,
  options: ItemOptions = {},
  children: NavNode[] = [],
): NavNode {
  const hasChildren = children.length > 0;
  return createNode({
    label,
    icon: options.icon ?? null,
    href: hasChildren ? null : (options.href ?? null),
    target: hasChildren ? "_self" : (options.target ?? "_self"),
    badge: options.badge
      ? { text: options.badge[0], variant: options.badge[1] }
      : null,
    visible: options.visible ?? true,
    disabled: options.disabled ?? false,
    children,
  });
}

function content(items: NavNode[]): NavMenuContent {
  return { schemaVersion: NAV_SCHEMA_VERSION, items };
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */

function createEcommerce(): NavMenuContent {
  return content([
    item("Home", { icon: "fa-solid fa-house", href: "/" }),
    item("Shop", { icon: "fa-solid fa-bag-shopping" }, [
      item("Men", {}, [
        item("New Arrivals", {
          href: "/shop/men/new",
          badge: ["New", "success"],
        }),
        item("Clothing", {}, [
          item("T-Shirts", { href: "/shop/men/clothing/t-shirts" }),
          item("Shirts", { href: "/shop/men/clothing/shirts" }),
          item("Jeans", { href: "/shop/men/clothing/jeans" }),
          item("Jackets", { href: "/shop/men/clothing/jackets" }),
        ]),
        item("Shoes", { href: "/shop/men/shoes" }),
        item("Accessories", { href: "/shop/men/accessories" }),
      ]),
      item("Women", {}, [
        item("New Arrivals", {
          href: "/shop/women/new",
          badge: ["New", "success"],
        }),
        item("Dresses", { href: "/shop/women/dresses" }),
        item("Tops", { href: "/shop/women/tops" }),
        item("Shoes", { href: "/shop/women/shoes" }),
        item("Bags", { href: "/shop/women/bags" }),
      ]),
      item("Kids", {}, [
        item("Boys", { href: "/shop/kids/boys" }),
        item("Girls", { href: "/shop/kids/girls" }),
        item("Baby", { href: "/shop/kids/baby" }),
      ]),
      item("Home & Living", {}, [
        item("Furniture", { href: "/shop/home/furniture" }),
        item("Decor", { href: "/shop/home/decor" }),
        item("Kitchen", { href: "/shop/home/kitchen" }),
      ]),
      item("Sale", {
        icon: "fa-solid fa-tag",
        href: "/shop/sale",
        badge: ["Up to 50%", "danger"],
      }),
    ]),
    item("Deals", {
      icon: "fa-solid fa-fire",
      href: "/deals",
      badge: ["Hot", "danger"],
    }),
    item("Brands", { icon: "fa-solid fa-tags", href: "/brands" }),
    item("Support", { icon: "fa-solid fa-headset" }, [
      item("Track Order", { icon: "fa-solid fa-truck", href: "/orders/track" }),
      item("Shipping & Returns", { href: "/support/shipping-returns" }),
      item("FAQs", { href: "/support/faq" }),
      item("Contact Us", { href: "/contact" }),
    ]),
  ]);
}

function createCorporate(): NavMenuContent {
  return content([
    item("Home", { icon: "fa-solid fa-house", href: "/" }),
    item("About", { icon: "fa-solid fa-building" }, [
      item("Our Story", { href: "/about" }),
      item("Leadership", { href: "/about/leadership" }),
      item("Careers", {
        icon: "fa-solid fa-user-tie",
        href: "/careers",
        badge: ["Hiring", "success"],
      }),
      item("Press", { href: "/press" }),
    ]),
    item("Services", { icon: "fa-solid fa-briefcase" }, [
      item("Consulting", { href: "/services/consulting" }),
      item("Engineering", {}, [
        item("Web Development", { href: "/services/engineering/web" }),
        item("Mobile Apps", { href: "/services/engineering/mobile" }),
        item("Cloud & DevOps", { href: "/services/engineering/cloud" }),
      ]),
      item("Managed Services", { href: "/services/managed" }),
      item("Training", { href: "/services/training" }),
    ]),
    item("Industries", { icon: "fa-solid fa-industry" }, [
      item("Healthcare", { href: "/industries/healthcare" }),
      item("Finance", { href: "/industries/finance" }),
      item("Retail", { href: "/industries/retail" }),
      item("Education", { href: "/industries/education" }),
    ]),
    item("Resources", { icon: "fa-solid fa-book-open" }, [
      item("Blog", { href: "/blog" }),
      item("Case Studies", { href: "/resources/case-studies" }),
      item("Whitepapers", {
        icon: "fa-solid fa-file-lines",
        href: "/resources/whitepapers",
      }),
      item("Events", { href: "/events" }),
    ]),
    item("Contact", { icon: "fa-solid fa-envelope", href: "/contact" }),
  ]);
}

function createAdmin(): NavMenuContent {
  return content([
    item("Dashboard", { icon: "fa-solid fa-gauge", href: "/dashboard" }),
    item("Analytics", { icon: "fa-solid fa-chart-line" }, [
      item("Overview", { href: "/dashboard/analytics" }),
      item("Traffic", { href: "/dashboard/analytics/traffic" }),
      item("Conversions", { href: "/dashboard/analytics/conversions" }),
      item("Reports", { href: "/dashboard/analytics/reports" }),
    ]),
    item("Users", { icon: "fa-solid fa-users" }, [
      item("All Users", { href: "/dashboard/users" }),
      item("Roles & Permissions", {
        href: "/dashboard/users/roles",
        badge: ["Soon", "neutral"],
        disabled: true,
      }),
      item("Invitations", { href: "/dashboard/users/invitations" }),
    ]),
    item("Content", { icon: "fa-solid fa-file-lines" }, [
      item("Pages", { href: "/dashboard/content/pages" }),
      item("Posts", { href: "/dashboard/content/posts" }),
      item("Media Library", {
        icon: "fa-solid fa-image",
        href: "/dashboard/content/media",
      }),
      item("Comments", { href: "/dashboard/content/comments" }),
    ]),
    item("Orders", {
      icon: "fa-solid fa-cart-shopping",
      href: "/dashboard/orders",
      badge: ["12", "info"],
    }),
    item("Settings", { icon: "fa-solid fa-gear" }, [
      item("General", { href: "/dashboard/settings" }),
      item("Appearance", {
        icon: "fa-solid fa-palette",
        href: "/dashboard/settings/appearance",
      }),
      item("Integrations", { href: "/dashboard/settings/integrations" }),
      item("Billing", { href: "/dashboard/settings/billing" }),
      item("Security", {
        icon: "fa-solid fa-shield-halved",
        href: "/dashboard/settings/security",
      }),
      // Hidden items stay in the builder but are left out of the public site.
      item("Internal Tools", {
        href: "/dashboard/settings/internal",
        visible: false,
      }),
    ]),
    item("Help", { icon: "fa-solid fa-circle-question" }, [
      item("Documentation", {
        icon: "fa-solid fa-arrow-up-right-from-square",
        href: "https://docs.example.com",
        target: "_blank",
      }),
      item("Contact Support", { href: "mailto:support@example.com" }),
    ]),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

export const NAV_TEMPLATES: readonly NavTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from an empty menu and build your own structure.",
    create: emptyNavContent,
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description:
      "Shop categories nested four levels deep, with deals, brands and support.",
    create: createEcommerce,
  },
  {
    id: "corporate",
    name: "Corporate Website",
    description:
      "About, services, industries and resources for a company website.",
    create: createCorporate,
  },
  {
    id: "admin",
    name: "Admin Dashboard",
    description:
      "Sidebar-style sections with badges, a disabled item, a hidden item and external links.",
    create: createAdmin,
  },
];

export function getNavTemplate(id: NavTemplateId): NavTemplate {
  return (
    NAV_TEMPLATES.find((template) => template.id === id) ?? NAV_TEMPLATES[0]
  );
}
