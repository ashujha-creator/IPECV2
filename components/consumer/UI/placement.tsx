"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface HighlightCard {
  id: string;
  value: string;
  title: string;
  subtitle: string;
  bgColor: string;
}

const highlightsData: HighlightCard[] = [
  {
    id: "highest-package",
    value: "₹ 94.25 Lacs",
    title: "Highest Package",
    subtitle: "Offered by LinkedIn",
    bgColor: "bg-[#98e2e6]", // Light Cyan
  },
  {
    id: "companies-visited",
    value: "433+",
    title: "Companies Visited",
    subtitle: "(2026)",
    bgColor: "bg-[#ffd3c4]", // Soft Peach
  },
  {
    id: "placements-offered",
    value: "1124+",
    title: "Placements & Internship",
    subtitle: "Offered (Accumulated)",
    bgColor: "bg-[#fbe7be]", // Soft Yellow
  },
  {
    id: "highest-stipend",
    value: "₹ 1.88 Lacs",
    title: "Highest Internship Stipend",
    subtitle: "Offered by Uber",
    bgColor: "bg-[#cbeffd]", // Soft Ice Blue
  },
];

const recruiters = [
  { name: "Innovaccer", fontStyle: "font-bold tracking-tight text-slate-800" },
  { name: "TCS", fontStyle: "font-extrabold text-red-600 tracking-wider" },
  { name: "LifeCell", fontStyle: "font-semibold text-purple-700" },
  { name: "PepsiCo", fontStyle: "font-black text-blue-800 italic" },
  { name: "Deloitte.", fontStyle: "font-extrabold text-black" },
  { name: "Goldman Sachs", fontStyle: "font-bold text-sky-600" },
  { name: "Google", fontStyle: "font-bold text-blue-600" },
  { name: "Microsoft", fontStyle: "font-bold text-slate-700" },
  { name: "Amazon", fontStyle: "font-extrabold text-amber-600" },
];

export default function PlacementHighlights() {
  // Triplicated array for seamless infinite looping
  const marqueeRecruiters = [...recruiters, ...recruiters, ...recruiters];

  return (
    <section className="w-full bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 select-none">
      {/* Self-contained Keyframe style injection */}
      <style jsx global>{`
        @keyframes recruiterMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-recruiter-scroll {
          animation: recruiterMarquee 22s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* ================= HEADER SECTION ================= */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <h2 className="text-[2.6rem] font-extrabold text-slate-900 tracking-tight">
            Placement
          </h2>
          <h3 className="text-[1.8rem] font-medium text-slate-700 mt-1">
            Highlights
          </h3>
          <p className="text-[1.25rem] sm:text-sm text-slate-500 mt-2 max-w-5xl leading-relaxed">
            With our excellent placement record, you can land your dream role.
            Top employers recruit from IPEC, offering top salary packages and
            establishing a lucrative career ahead.
          </p>
        </div>

        {/* ================= STATS HIGHLIGHTS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlightsData.map((card) => (
            <div
              key={card.id}
              className={`${card.bgColor} rounded-2xl p-6 h-52 flex flex-col justify-between border border-black/5 shadow-sm transition-transform duration-300 hover:scale-[1.02]`}
            >
              <div className="text-[ 1.9rem] sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="space-y-1">
                <p className="text-[1.35rem] font-bold text-slate-700 leading-snug">
                  {card.title}
                </p>
                <p className="text-[0.85rem] font-semibold text-slate-700">
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= KEY RECRUITERS AUTO-SCROLLING SECTION ================= */}
        <div className="pt-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Left Header Label */}
            <div className="shrink-0 w-full lg:w-64 h-32 p-6 flex flex-col justify-center gap-1 bg-white rounded-2xl border border-black/5 shadow-sm">
              <h4 className="text-[1.8rem] font-extrabold text-slate-900 leading-tight">
                Key Recruiters
              </h4>
              <p className="text-[ 1.1rem] text-slate-500 font-medium">
                Placement Companies
              </p>
            </div>

            {/* Scrolling Ticker & Arrow Container */}
            <div className="relative flex-1 flex items-center overflow-hidden">
              {/* Marquee Wrapper */}
              <div className="group relative w-full overflow-hidden py-6">
                <div className="flex w-max space-x-4 animate-recruiter-scroll group-hover:paused">
                  {marqueeRecruiters.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="w-50 h-20 flex-shrink-0 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center justify-center p-3 transition-shadow hover:shadow-md"
                    >
                      <span className={`text-sm ${item.fontStyle}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow Navigation Indicator */}
              <div className="ml-3 flex-shrink-0 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-colors z-10">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
