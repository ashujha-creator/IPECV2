"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Data for Campus Cards
const campusCards = [
  {
    id: "main-building",
    title: "Main Bulding",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hostels",
    title: "Hostels",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ipec-tbi",
    title: "IPEC TBI",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
];

// Sample accreditation logo items using Lucide icons as fallback placeholders
const accreditations = [
  { id: "1", label: "IQAC", code: "IQAC" },
  { id: "2", label: "NAAC", code: "NAAC" },
  { id: "3", label: "NBA", code: "NBA" },
  { id: "4", label: "IIC", code: "IIC" },
  { id: "5", label: "NSS", code: "NSS" },
  { id: "6", label: "NIRF", code: "NIRF" },
  { id: "7", label: "Unnat Bharat", code: "UBA" },
  { id: "8", label: "AISHE", code: "AISHE" },
  { id: "9", label: "AICTE", code: "AICTE" },
  { id: "10", label: "SWAYAM", code: "SWAYAM" },
  { id: "11", label: "ARIIA", code: "ARIIA" },
  { id: "12", label: "UGC", code: "UGC" },
];

export default function CampusAndAccreditations() {
  // Triplicated for smooth infinite marquee animation
  const marqueeItems = [
    ...accreditations,
    ...accreditations,
    ...accreditations,
  ];

  return (
    <section className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Inline Keyframe for Logo Marquee without tailwind.config */}
      <style jsx global>{`
        @keyframes logoScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-logo-scroll {
          animation: logoScroll 20s linear infinite;
        }
        .text-stroke {
          -webkit-text-stroke: 2px #1e3a8a;
          color: transparent;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* ================= COMPONENT 1: IPEC CAMPUS ================= text-3xl font-extrabold text-slate-900 tracking-tight */}
        <div className="max-w-7xl mx-auto px-2 mb-8">
          <h2 className=" text-[2.5rem] font-extrabold text-slate-900 mb-6 tracking-tight">
            IPEC Campus
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Campus Image Cards */}
            {campusCards.map((card) => (
              <div
                key={card.id}
                className="relative flex flex-col h-64 rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              >
                {/* Image Area */}
                <div className="relative w-full h-[80%] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>

                {/* Dark Blue Title Banner */}
                <div className="w-full h-[20%] bg-[#1b4d8e] flex items-center justify-center border-t border-[#1b4d8e]">
                  <span className="text-white text-lg font-bold tracking-wide">
                    {card.title}
                  </span>
                </div>
              </div>
            ))}

            {/* Campus Area Stat Card */}
            <div className="h-64 rounded-2xl bg-[#f7f3e9] p-6 flex flex-col justify-between border border-slate-200/80 shadow-sm">
              <p className="text-[#1b4d8e] font-bold text-lg leading-snug">
                Inderprastha Engineering College,has a campus spanning
              </p>

              {/* Stroked Outlined Large Number */}
              <div className="my-auto">
                <span className="text-6xl font-extrabold tracking-tight text-stroke font-mono">
                  12.82
                </span>
              </div>

              <span className="text-[#1b4d8e] font-extrabold text-2xl tracking-wide">
                acres
              </span>
            </div>
          </div>
        </div>

        {/* ================= COMPONENT 2: ACCREDITATION LOGOS MARQUEE ================= */}
        <div className="relative flex items-center">
          {/* Scrolling Marquee Container */}
          <div className="group w-full overflow-hidden py-2">
            <div className="flex w-max space-x-4 animate-logo-scroll group-hover:paused">
              {marqueeItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="w-24 h-16 sm:w-28 sm:h-18 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-2 transition-shadow hover:shadow-md"
                >
                  <div className="text-center">
                    <span className="text-xs sm:text-sm font-extrabold text-[#1b4d8e] block">
                      {item.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Navigation Icon */}
          <div className="ml-3 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
