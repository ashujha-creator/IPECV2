"use client";

import React, { useState, useTransition } from "react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  MenuItemTree,
} from "@/app/actions/menu-actions";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Folder,
  Layers,
  ExternalLink,
} from "lucide-react";

interface MenuBuilderProps {
  initialItems: MenuItemTree[];
}

export default function MenuBuilder({ initialItems }: MenuBuilderProps) {
  const [items, setItems] = useState<MenuItemTree[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<MenuItemTree | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Toggle collapse state for a node
  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handler to add a root or child item
  const handleAdd = (parentId: string | null = null) => {
    const label = prompt("Enter menu item title:");
    if (!label) return;

    startTransition(async () => {
      const res = await createMenuItem({ label, parentId });
      if (res.success && res.item) {
        // Optimistic or full refresh reload pattern
        window.location.reload();
      } else {
        alert(res.error || "Failed to create item");
      }
    });
  };

  // Handler to delete an item
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure? All nested child menus will also be deleted.")) return;

    startTransition(async () => {
      const res = await deleteMenuItem(id);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Failed to delete item");
      }
    });
  };

  // Handler to save edited item details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    startTransition(async () => {
      const res = await updateMenuItem(editingItem.id, {
        label: editingItem.label,
        url: editingItem.url,
        icon: editingItem.icon || "Folder",
        badge: editingItem.badge||"none",
        target: editingItem.target,
        isVisible: editingItem.isVisible,
      });

      if (res.success) {
        setEditingItem(null);
        window.location.reload();
      } else {
        alert(res.error || "Failed to update item");
      }
    });
  };

  // Recursive Renderer for Tree Nodes
  const renderTree = (nodes: MenuItemTree[], level = 0) => {
    return (
      <ul className={`space-y-2 ${level > 0 ? "ml-6 pl-4 border-l border-slate-700/50 mt-2" : ""}`}>
        {nodes.map((node, index) => {
          const isCollapsed = collapsed[node.id];
          const hasChildren = node.children && node.children.length > 0;

          return (
            <li key={node.id} className="group">
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Collapse toggle if children exist */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleCollapse(node.id)}
                      className="p-1 text-slate-400 hover:text-white transition"
                    >
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                  ) : (
                    <span className="w-4" />
                  )}

                  <Folder size={16} className="text-blue-400" />

                  <span className={`font-medium text-sm ${!node.isVisible ? "opacity-50 line-through text-slate-400" : "text-slate-200"}`}>
                    {node.label}
                  </span>

                  {node.badge && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-medium">
                      {node.badge}
                    </span>
                  )}

                  <span className="text-xs text-slate-500 truncate max-w-[150px] hidden sm:inline">
                    {node.url}
                  </span>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleAdd(node.id)}
                    title="Add Child Menu"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    onClick={() => setEditingItem(node)}
                    title="Edit Item"
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(node.id)}
                    title="Delete"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Render Children Recursively */}
              {hasChildren && !isCollapsed && renderTree(node.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="text-blue-500" /> Navigation Menu Hierarchy
          </h2>
          <p className="text-sm text-slate-400">
            Dynamically configure multi-level recursive menus stored in database.
          </p>
        </div>
        <button
          onClick={() => handleAdd(null)}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} /> Add Root Menu
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500 mb-3">No menu items created yet.</p>
          <button
            onClick={() => handleAdd(null)}
            className="text-blue-400 hover:underline text-sm font-medium"
          >
            Create your first menu item
          </button>
        </div>
      ) : (
        renderTree(items)
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold">Edit Menu Item</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Label</label>
              <input
                type="text"
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">URL / Link</label>
              <input
                type="text"
                value={editingItem.url}
                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Badge (Optional)</label>
                <input
                  type="text"
                  value={editingItem.badge || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                  placeholder="e.g. New"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target</label>
                <select
                  value={editingItem.target}
                  onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="_self">Same Tab (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={editingItem.isVisible}
                onChange={(e) => setEditingItem({ ...editingItem, isVisible: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
              />
              <label htmlFor="isVisible" className="text-sm text-slate-300">Visible on Navbar</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}