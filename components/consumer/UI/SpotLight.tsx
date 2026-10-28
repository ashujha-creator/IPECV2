"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserCheck, Globe, GraduationCap, ExternalLink } from "lucide-react";

const SPOTLIGHT_NEWS = [
  {
    id: 1,
    date: "September 4th, 2025",
    text: "The Ministry of Education's SPARC project of PMSE-JIIT, led by PI Dr. Ashish Bhatnagar with Co-PIs Prof. D.K. Rai and Dr. Manoj Tripathi, has been recognized among the top four projects across India (alongside IIT Hyderabad, IIM Udaipur, and Jadavpur University).",
  },
  {
    id: 2,
    date: "September 14th, 2025",
    text: "We are proud to share that Dr. Ashish Bhatnagar has been selected as a member of the Indian National Young Academy of Sciences (INYAS) for 2025.",
  },
  {
    id: 3,
    date: "September 19th, 2025",
    text: "9 scientists from JIIT have been featured in the Stanford/Elsevier Top 2%.",
  },
];

const STATS = [
  {
    value: "10+",
    label: "CIVIL SERVANTS",
    icon: UserCheck,
    isHighlighted: false,
  },
  {
    value: "150+",
    label: "CEOS ACROSS THE GLOBE",
    icon: Globe,
    isHighlighted: true, // Distinct teal background block matching the original image
  },
  {
    value: "20000+",
    label: "ALUMNI ACROSS THE GLOBE",
    icon: GraduationCap,
    isHighlighted: false,
  },
];

export default function SpotlightAlumni() {
  const [activeNewsId, setActiveNewsId] = useState<number>(1);

  return (
    <section className="w-full bg-[#f6f9fc] py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-sm border border-slate-200/80 rounded-2xl bg-white">
        {/* Left Column: In Spotlight News Feed (5 Cols) */}
        <div className="lg:col-span-5 p-6 md:p-10 bg-slate-50/60 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
              In Spotlight
            </h2>

            {/* News Items List */}
            <div className="space-y-6">
              {SPOTLIGHT_NEWS.map((item) => {
                const isActive = activeNewsId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveNewsId(item.id)}
                    className={`relative pl-4 pr-3 py-2 cursor-pointer transition-all duration-300 border-b border-slate-200/80 last:border-none ${
                      isActive
                        ? "bg-slate-100/80 rounded-r-lg"
                        : "hover:bg-slate-100/40"
                    }`}
                  >
                    {/* Active Accent Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 rounded-full" />
                    )}

                    <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                      {item.date}
                    </span>

                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Alumni Showcase Background & Stats Overlay (7 Cols) */}
        <div className="lg:col-span-7 relative min-h-[480px] lg:min-h-full flex flex-col justify-between p-6 md:p-10 text-white overflow-hidden">
          {/* Background Image with Gradient Overlay */}
          <Image
            src="https://images.unsplash.com/photo-1658235081452-c2ded30b8d9f?q=80&w=1114&auto=format&fit=crop"
            alt="JIIT Alumni Meet"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/40" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-xl my-auto py-12">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
              ALUMNI
            </h3>
            <p className="mt-2 text-sm md:text-base font-medium text-slate-200 leading-snug max-w-md drop-shadow">
              JIIT alumni exemplify excellence and accomplishment across diverse
              fields.
            </p>
          </div>

          {/* Bottom Overlay: Stats Card & Link Button */}
          <div className="relative z-10 space-y-4">
            {/* Stats Grid Bar */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl overflow-hidden shadow-lg grid grid-cols-1 sm:grid-cols-3 border border-white/20">
              {STATS.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-slate-200/60 last:border-none transition-colors ${
                      stat.isHighlighted
                        ? "bg-[#3b93a5] text-white"
                        : "bg-white text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-2xl font-extrabold tracking-tight block">
                        {stat.value}
                      </span>
                      <span
                        className={`text-[10px] font-bold tracking-wider leading-tight block ${
                          stat.isHighlighted ? "text-teal-50" : "text-slate-600"
                        }`}
                      >
                        {stat.label}
                      </span>
                    </div>

                    <IconComponent
                      className={`w-7 h-7 shrink-0 ml-2 ${
                        stat.isHighlighted ? "text-white/90" : "text-slate-400"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Alumni Cell Pill Button */}
            <div className="flex justify-start">
              <a
                href="#alumni-cell"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
                <span>Alumni Cell</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
