"use client";

import React from "react";
import { ChevronRight, ExternalLink, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  linkText: string;
  href: string;
  isNew?: boolean;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Instructions for 1st Year New Students",
    linkText: "Read More",
    href: "#",
    isNew: false,
  },
  {
    id: "2",
    title: "PhD Admission Result",
    linkText: "View File",
    href: "#",
    isNew: true,
  },
  {
    id: "3",
    title: "Messages from AICTE/UGC",
    linkText: "Read More",
    href: "#",
    isNew: true,
  },
  {
    id: "4",
    title: "Time Table",
    linkText: "Read More",
    href: "#",
    isNew: false,
  },
  {
    id: "5",
    title: "Academic Calendar Odd Semester 2026-27",
    linkText: "View File",
    href: "#",
    isNew: true,
  },
  {
    id: "6",
    title: "Hostel Fee Structure & Guidelines",
    linkText: "Read More",
    href: "#",
    isNew: false,
  },
];

export default function LatestAnnouncements() {
  return (
    <section className="w-full bg-[#f6f9fc] py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
        {/* Left Branding Panel (5 Cols) */}
        <div className="md:col-span-5 p-8 md:p-12 bg-slate-50/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/60">
          {/* Header */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Latest
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-slate-700 mt-1">
              Announcements
            </p>
          </div>

          {/* Centered Megaphone Graphic */}
          <div className="flex-1 flex items-center justify-center my-auto py-6">
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/60 shadow-inner flex items-center justify-center">
              <Megaphone className="w-20 h-20 md:w-28 md:h-28 rotate-[336deg] stroke-[1.5] -rotate-12 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Right Scrollable Announcements List (7 Cols) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative">
          {/* Scrollable Container */}
          <div className="max-h-[320px] overflow-y-auto pr-3 space-y-0 divide-y divide-slate-200/80 custom-scrollbar">
            {ANNOUNCEMENTS.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 group transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Item Title */}
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors shrink-0" />
                      <h3 className="text-sm md:text-base font-semibold text-slate-800 group-hover:text-slate-900 truncate">
                        {item.title}
                      </h3>
                    </div>

                    {/* Action Button */}
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 ml-6 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{item.linkText}</span>
                    </a>
                  </div>

                  {/* "New" Badge */}
                  {item.isNew && (
                    <span className="shrink-0 px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-bold tracking-wider rounded-md uppercase shadow-sm">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Orange Accent Line Indicator */}
          <div className="hidden md:block absolute right-0 top-6 bottom-6 w-1  to-slate-200 rounded-l-full" />

          {/* Footer Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-start">
            <a
              href="#all-announcements"
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>View All</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
