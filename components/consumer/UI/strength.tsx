"use client";

import React from "react";
import {
  Users,
  BookOpen,
  IndianRupee,
  Rocket,
  Award,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface StrengthCard {
  id: number;
  title: string;
  metric?: string;
  description: string;
  icon: React.ElementType;
  variant: "orange" | "white" | "blue";
}

const strengthsData: StrengthCard[] = [
  {
    id: 1,
    title: "Strong Alumni Network",
    description: "Network of over 12000 Alumni",
    icon: Users,
    variant: "orange",
  },
  {
    id: 2,
    title: "Publications",
    metric: "7542",
    description: "Empowering impactful research through JIIT publications",
    icon: BookOpen,
    variant: "white",
  },
  {
    id: 3,
    title: "Funded Projects",
    metric: "90",
    description: "Supporting innovation with funded projects",
    icon: IndianRupee,
    variant: "white",
  },
  {
    id: 4,
    title: "Startups",
    metric: "15",
    description: "Transforming ideas into startups at JIIT",
    icon: Rocket,
    variant: "white",
  },
  {
    id: 5,
    title: "Approval",
    description: "AICTE approved Institution since 2000",
    icon: Award,
    variant: "blue",
  },
];

export default function OurStrength() {
  // Triplicated array for seamless continuous looping without white gaps
  const duplicatedCards = [
    ...strengthsData,
    ...strengthsData,
    ...strengthsData,
  ];

  return (
    <section className=" py-12 w-full px-4 sm:px-6 lg:px-8 bg-[#f7f7f7] overflow-hidden select-none">
      {/* Inject Keyframe Animation directly so you don't need tailwind.config */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee-custom {
          animation: marquee 25s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 mb-8">
        <h2 className="text-[2.6rem] font-extrabold tracking-tight text-slate-900 mb-6">
          Our Strength
        </h2>
      </div>

      {/* Main Track Container */}
      <div className="relative flex max-w-7xl mx-auto  items-center">
        {/* Continuous Center Horizontal Blue Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-sky-400 -translate-y-1/2 z-0" />

        {/* Continuous Scrolling Strip */}
        <div className="group relative w-full overflow-hidden z-10 py-4">
          <div className="flex w-max space-x-6 animate-marquee-custom group-hover:[animation-play-state:paused]">
            {duplicatedCards.map((card, idx) => {
              const Icon = card.icon;

              // ORANGE CARD (With Framed Gap Effect)
              if (card.variant === "orange") {
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className="w-64 h-80 flex-shrink-0 bg-[#ea4300] p-1.5 border-[2px] border-[#ea4300] shadow-md transition-transform duration-300 hover:scale-105"
                  >
                    <div className="w-full h-full border-[1.5px] border-white/80 p-5 flex flex-col justify-between text-white">
                      <div>
                        <h3 className="text-xl font-semibold leading-tight mb-4">
                          {card.title}
                        </h3>
                        <p className="text-xs font-normal opacity-90 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      <div className="flex justify-center pb-2">
                        <Icon className="w-14 h-14 stroke-[1.2]" />
                      </div>
                    </div>
                  </div>
                );
              }

              // BLUE CARD (With Framed Gap Effect)
              if (card.variant === "blue") {
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className="w-64 h-80 flex-shrink-0 bg-[#003B7A] p-1.5 border-[2px] border-[#003B7A] shadow-md transition-transform duration-300 hover:scale-105"
                  >
                    <div className="w-full h-full border-[1.5px] border-white/80 p-5 flex flex-col justify-between text-white">
                      <div>
                        <h3 className="text-xl font-semibold leading-tight mb-4">
                          {card.title}
                        </h3>
                        <p className="text-xs font-normal opacity-90 leading-relaxed mb-3">
                          {card.description}
                        </p>
                      </div>
                      <div className="flex justify-start">
                        <div className="w-12 h-12 bg-amber-500 rounded flex items-center justify-center font-bold text-black text-xs">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // WHITE CARD (Standard)
              return (
                <div
                  key={`${card.id}-${idx}`}
                  className="w-64 h-80 flex-shrink-0 bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex justify-center pt-2">
                    <Icon className="w-12 h-12 text-slate-800 stroke-[1.3]" />
                  </div>
                  <div className="text-left my-auto">
                    {card.metric && (
                      <span className="block text-3xl font-extrabold text-slate-900 mb-1">
                        {card.metric}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-normal">
                      {card.description}
                    </p>
                  </div>
                  <div />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
