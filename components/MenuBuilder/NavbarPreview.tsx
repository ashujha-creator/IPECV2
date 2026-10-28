"use client";

import React, { useState } from "react";
import { MenuItemTree } from "@/app/actions/menu-actions";
import { ChevronDown, ChevronRight, Menu, X, ExternalLink } from "lucide-react";

interface NavbarPreviewProps {
  items: MenuItemTree[];
}

export default function NavbarPreview({ items }: NavbarPreviewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Track open dropdowns by ID for both mobile and desktop click support
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );

  const toggleDropdown = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent navigating if it's just meant to open a dropdown
    }
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive Mobile Accordion Renderer
  const renderMobileTree = (nodes: MenuItemTree[]) => {
    return (
      <ul className="space-y-1 pl-4 border-l border-slate-800 mt-1">
        {nodes
          .filter((node) => node.isVisible)
          .map((node) => {
            const hasChildren = node.children && node.children.length > 0;
            const isOpen = openDropdowns[node.id];

            return (
              <li key={node.id} className="py-1">
                <div className="flex items-center justify-between">
                  <a
                    href={node.url}
                    target={node.target}
                    className="text-sm text-slate-300 hover:text-white flex items-center gap-2 py-1"
                  >
                    {node.label}
                    {node.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full">
                        {node.badge}
                      </span>
                    )}
                  </a>

                  {hasChildren && (
                    <button
                      onClick={() => toggleDropdown(node.id)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  )}
                </div>

                {hasChildren && isOpen && renderMobileTree(node.children)}
              </li>
            );
          })}
      </ul>
    );
  };

  // Recursive Desktop Dropdown Renderer (Supports Hover + Click State)
  const renderDesktopDropdown = (
    nodes: MenuItemTree[],
    parentId: string,
    isSubmenu = false,
  ) => {
    const isOpen = openDropdowns[parentId];

    return (
      <div
        className={`${
          isSubmenu
            ? "absolute left-full top-0 ml-1 hidden group-hover/sub:block"
            : `absolute left-0 top-full mt-2 ${isOpen ? "block" : "hidden"} md:group-hover:block`
        } w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 z-50`}
      >
        {nodes
          .filter((node) => node.isVisible)
          .map((node) => {
            const hasChildren = node.children && node.children.length > 0;

            return (
              <div
                key={node.id}
                className={hasChildren ? "relative group/sub" : ""}
              >
                <a
                  href={node.url}
                  target={node.target}
                  onClick={(e) => {
                    if (hasChildren) {
                      toggleDropdown(node.id, e);
                    }
                  }}
                  className="flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <span className="flex items-center gap-2">
                    {node.label}
                    {node.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full">
                        {node.badge}
                      </span>
                    )}
                  </span>

                  {hasChildren ? (
                    <ChevronRight size={14} className="text-slate-400" />
                  ) : (
                    node.target === "_blank" && (
                      <ExternalLink size={12} className="text-slate-500" />
                    )
                  )}
                </a>

                {hasChildren &&
                  renderDesktopDropdown(node.children, node.id, true)}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-visible">
      <div className="px-6 py-4 flex items-center justify-between relative">
        <div className="font-bold text-lg text-white flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          Live Preview Navbar
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {items
            .filter((node) => node.isVisible)
            .map((node) => {
              const hasChildren = node.children && node.children.length > 0;

              return (
                <div key={node.id} className="relative group py-2">
                  <a
                    href={node.url}
                    target={node.target}
                    onClick={(e) => {
                      if (hasChildren) {
                        toggleDropdown(node.id, e);
                      }
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {node.label}
                    {node.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full">
                        {node.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <ChevronDown size={14} className="text-slate-400" />
                    )}
                  </a>

                  {hasChildren && renderDesktopDropdown(node.children, node.id)}
                </div>
              );
            })}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-xl"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 px-6 py-4 space-y-3 bg-slate-950">
          {items.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">
              No menu items found.
            </p>
          ) : (
            items
              .filter((node) => node.isVisible)
              .map((node) => {
                const hasChildren = node.children && node.children.length > 0;
                const isOpen = openDropdowns[node.id];

                return (
                  <div key={node.id} className="py-1">
                    <div className="flex items-center justify-between">
                      <a
                        href={node.url}
                        target={node.target}
                        className="font-medium text-sm text-slate-200 hover:text-white flex items-center gap-2"
                      >
                        {node.label}
                        {node.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full">
                            {node.badge}
                          </span>
                        )}
                      </a>

                      {hasChildren && (
                        <button
                          onClick={() => toggleDropdown(node.id)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          {isOpen ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && renderMobileTree(node.children)}
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}
