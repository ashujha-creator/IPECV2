"use client";

import React from "react";
import Link from "next/link";
import { Megaphone, ExternalLink, ArrowRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  linkText?: string;
  href: string;
  isExternal?: boolean;
}

interface AnnouncementBannerProps {
  announcements?: Announcement[];
  label?: string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "PhD Admission Result-Odd Sem 2026",
    linkText: "Click Here",
    href: "/admissions/phd-results-2026",
  },
  {
    id: "2",
    title: "List of Hostellers - 1st Year (as on 23 July)",
    linkText: "Click Here",
    href: "/hostel/first-year-list",
  },
  {
    id: "3",
    title: "Registration instructions",
    linkText: "View Instructions",
    href: "/registration/instructions",
  },
];

export default function AnnouncementBanner({
  announcements = DEFAULT_ANNOUNCEMENTS,
  label = "Important Announcements:",
}: AnnouncementBannerProps) {
  return (
    <div className="w-full bg-slate-50 border-y border-slate-200/80 text-slate-800 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between py-2.5 text-sm  ">
          {/* Main Content Area */}
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-0.5   ">
            {/* Header / Icon */}

            {/* Announcement Items */}
            <div className="flex items-center space-x-6 shrink-0 divide-x divide-slate-300 animate-marquee">
              <div className="flex items-center space-x-2 shrink-0 font-semibold text-slate-900 bg-slate-200/60 px-2.5 py-1 rounded-md border border-slate-300/50 ">
                <Megaphone className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="whitespace-nowrap">{label}</span>
              </div>
              {announcements.map((item, idx) => {
                const LinkIcon = item.isExternal ? ExternalLink : ArrowRight;
                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center space-x-2.5 ${
                      idx !== 0 ? "pl-6" : ""
                    }`}
                  >
                    <span className="text-slate-700 font-medium whitespace-nowrap">
                      {item.title}
                    </span>

                    <Link
                      href={item.href}
                      target={item.isExternal ? "_blank" : "_self"}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full transition-all duration-150 shadow-sm active:scale-95 group"
                    >
                      <span>{item.linkText || "Click Here"}</span>
                      <LinkIcon className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
