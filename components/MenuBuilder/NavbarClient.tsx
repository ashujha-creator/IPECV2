"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { MenuItem } from "@/lib/nav-menu/navigation";

interface NavbarProps {
  items: MenuItem[];
}

export default function NavbarClient({ items }: NavbarProps) {
  // State for desktop hover dropdowns
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(
    null,
  );

  // State for mobile drawer toggle
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // State for accordion submenus on mobile
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<
    Record<string, boolean>
  >({});

  // Prevent background body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleMobileSubmenu = (id: string) => {
    setOpenMobileSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <nav className="bg-[#0B1348] text-white w-full shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-[#1C2766] focus:outline-none transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-1 text-sm font-medium h-full">
            {items.map((item) => {
              const visibleChildren = (item.children || []).filter(
                (child) => child.visible,
              );
              const hasChildren = visibleChildren.length > 0;

              return (
                <li
                  key={item.id}
                  className="relative group h-full flex items-center"
                  onMouseEnter={() => setOpenDesktopDropdown(item.id)}
                  onMouseLeave={() => setOpenDesktopDropdown(null)}
                >
                  {hasChildren ? (
                    <button
                      disabled={item.disabled}
                      className={`flex items-center gap-1.5 px-4 h-full transition-colors duration-150
                        ${
                          openDesktopDropdown === item.id
                            ? "bg-[#1C2766] text-white"
                            : "text-gray-100 hover:bg-[#1C2766]"
                        }
                        ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDesktopDropdown === item.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      target={item.target}
                      className={`flex items-center px-4 h-full transition-colors duration-150 text-gray-100 hover:bg-[#1C2766]
                        ${item.disabled ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Desktop Dropdown Submenu */}
                  {hasChildren && (
                    <div
                      className={`absolute left-0 top-full w-64 bg-[#0B1348] border border-slate-700/60 rounded-b-md shadow-xl py-1 z-50 transition-all duration-200 ${
                        openDesktopDropdown === item.id
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-1"
                      }`}
                    >
                      {visibleChildren.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href || "#"}
                          target={child.target}
                          className={`block px-4 py-2.5 text-sm text-gray-200 hover:bg-[#1C2766] hover:text-white transition-colors duration-150
                            ${child.disabled ? "pointer-events-none opacity-50" : ""}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE SIDEBAR / OVERLAY                   */}
      {/* ========================================== */}

      {/* Dark Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sliding Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0B1348] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <span className="font-semibold text-white text-base">Navigation</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-[#1C2766] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const visibleChildren = (item.children || []).filter(
                (child) => child.visible,
              );
              const hasChildren = visibleChildren.length > 0;
              const isExpanded = !!openMobileSubmenus[item.id];

              return (
                <li key={item.id} className="rounded-md overflow-hidden">
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleMobileSubmenu(item.id)}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          isExpanded
                            ? "bg-[#1C2766] text-white"
                            : "text-gray-200 hover:bg-[#1C2766]/60"
                        } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Mobile Nested Accordion Items */}
                      {isExpanded && (
                        <ul className="pl-4 pr-2 py-1 space-y-1 bg-[#070c2e]">
                          {visibleChildren.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.href || "#"}
                                target={child.target}
                                onClick={() => setIsMobileOpen(false)}
                                className={`block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1C2766] rounded-md transition-colors ${
                                  child.disabled
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      target={item.target}
                      onClick={() => setIsMobileOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium text-gray-200 hover:bg-[#1C2766] rounded-md transition-colors ${
                        item.disabled ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </nav>
  );
}
