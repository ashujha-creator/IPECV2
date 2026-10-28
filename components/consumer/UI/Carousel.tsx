"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1171&auto=format&fit=crop",
    badge: "IPEC Cutting-Edge Labs",
    title: "LEARN. EXPERIMENT. INNOVATE.",
    subtitle: "VLSI Fabrication Lab | AI Skill Lab | Cybersecurity Lab & More",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop",
    badge: "Admissions Open 2026",
    title: "Shape Your Future With Us",
    subtitle: "Explore our world-class UG & PG engineering programmes.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
    badge: "Campus Life",
    title: "Vibrant Student Community",
    subtitle: "State-of-the-art infrastructure, sports, and technical clubs.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop",
    badge: "Placement Excellence",
    title: "Top-Tier Global Recruiters",
    subtitle:
      "Consistently high placement records with leading multinational tech giants.",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
    badge: "Research & Innovation",
    title: "Drive Technological Breakthroughs",
    subtitle:
      "Empowering students with hands-on research grants and incubation cells.",
  },
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === SLIDES.length - 1 ? 0 : prevIndex + 1,
    );
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? SLIDES.length - 1 : prevIndex - 1,
    );
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-2 py-6 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-16/7 min-h-320px sm:min-h-400px overflow-hidden rounded-2xl shadow-xl bg-slate-900 border border-slate-200">
        {/* Slides */}
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Gradient Overlay */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover transform scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-transparent sm:w-3/4" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 md:px-16 max-w-2xl z-20">
              {slide.badge && (
                <span className="inline-block w-fit px-3 py-1 mb-3 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-blue-700 to-indigo-700 rounded-full shadow-md">
                  {slide.badge}
                </span>
              )}
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-base text-slate-700 font-medium mb-6">
                {slide.subtitle}
              </p>
              <div>
                <button className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-full shadow-lg transition-all duration-200 active:scale-95">
                  Explore Programmes
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Indicators (Bottom Right) */}
        <div className="absolute bottom-4 right-6 z-30 flex items-center space-x-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-orange-500"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
