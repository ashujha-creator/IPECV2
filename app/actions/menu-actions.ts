"use me";
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; // Adjust this import path to match your Prisma client location

// Type definition for nested menu item structure
export type MenuItemTree = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  badge: string | null;
  target: string;
  isVisible: boolean;
  order: number;
  parentId: string | null;
  children: MenuItemTree[];
};

/**
 * Helper to transform a flat list of menu items from DB into a recursive tree structure
 */
function buildTree(
  items: Array<{
    id: string;
    label: string;
    url: string;
    icon: string | null;
    badge: string | null;
    target: string;
    isVisible: boolean;
    order: number;
    parentId: string | null;
  }>,
  parentId: string | null = null,
): MenuItemTree[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

/**
 * Fetch all menu items structured as a recursive tree
 */
export async function getMenuItems(): Promise<MenuItemTree[]> {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { order: "asc" },
    });
    return buildTree(items);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    throw new Error("Could not fetch menu items.");
  }
}

/**
 * Add a new menu item (at root level or as a child)
 */
export async function createMenuItem(data: {
  label: string;
  url?: string;
  icon?: string;
  badge?: string;
  target?: string;
  parentId?: string | null;
}) {
  try {
    // Find highest order value within the same sibling level
    const siblingCount = await prisma.menuItem.count({
      where: { parentId: data.parentId || null },
    });

    const newItem = await prisma.menuItem.create({
      data: {
        label: data.label,
        url: data.url || "#",
        icon: data.icon || "Folder",
        badge: data.badge || null,
        target: data.target || "_self",
        parentId: data.parentId || null,
        order: siblingCount,
      },
    });

    revalidatePath("/dashboard/projects/links"); // Adjust this path to where your menu is displayed
    return { success: true, item: newItem };
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return { success: false, error: "Failed to create menu item" };
  }
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(
  id: string,
  data: Partial<{
    label: string;
    url: string;
    icon: string;
    badge: string;
    target: string;
    isVisible: boolean;
  }>,
) {
  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/projects/links");
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return { success: false, error: "Failed to update menu item" };
  }
}

/**
 * Delete a menu item and all its recursive children (cascade)
 */
export async function deleteMenuItem(id: string) {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects/links");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { success: false, error: "Failed to delete menu item" };
  }
}

/**
 * Reorder siblings within the same parent
 */
export async function reorderMenuItems(
  items: Array<{ id: string; order: number }>,
) {
  try {
    const updates = items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath("/dashboard/projects/links");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder menu items:", error);
    return { success: false, error: "Failed to reorder menu items" };
  }
}
