import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Play } from "lucide-react";

export default function AboutSection() {
  const stats = [
    { value: "26+", label: "Years of Excellence" },
    { value: "15000+", label: "Alumni" },
    { value: "200+", label: "Recruiters" },
    { value: "75+", label: "Startups Incubated" },
  ];

  const quickLinks = [
    {
      title:
        "2nd Semester End-Term Theory Exam Schedule (B.Tech, BBA, BCA, M.Tech, MBA, MCA)",
      href: "#",
      isNew: true,
    },
    { title: "IPEC LIVE (ERP)", href: "#", isNew: false },
    { title: "Academic Fee 2026-27", href: "#", isNew: false },
    { title: "Hostel Fee 2026-27", href: "#", isNew: false },
  ];

  const accreditations = [
    {
      name: "AICTE",
      logo: "/AICTE_LOGO.jpg",
      title: "All India Council for Technical Education",
    },
    {
      name: "AKTU",
      logo: "/AKTU.jpg",
      title: "Dr. A.P.J. Abdul Kalam Technical University",
    },
    {
      name: "NBA",
      logo: "/NBA_LOGO.jpg",
      title: "National Board of Accreditation",
    },
    {
      name: "NAAC",
      logo: "/NAAC.jpg",
      title: "National Assessment and Accreditation Council",
    },
  ];

  return (
    <section className="bg-slate-50/50 text-slate-800 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16">
        {/* Main Grid: Left content + Image Card, Right stats & links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight uppercase">
                Inderprastha Engineering College
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Established in the year 2000 under the aegis of Shail Garg
                Shiksha Sansthan, IPEC brings over 25 years of educational
                excellence, a rich alumni network of 15,000+ graduates, and
                reliable placements with 200+ recruiting partners.
              </p>

              <div>
                <Link
                  href="/about"
                  className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-800 transition-colors group"
                >
                  View More
                  <span className="ml-2 bg-[#1E3A8A] text-white p-1.5 rounded group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Campus Highlight Image Card (Fills remaining height) */}
            <div className="relative group overflow-hidden rounded-xl border border-slate-200/80 shadow-sm min-h-[190px] sm:min-h-[220px] lg:*:min-h-[260px] flex-1">
              <Image
                src="https://images.unsplash.com/photo-1602052577122-f73b9710adba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Replace with actual campus image path
                alt="IPEC Campus Life"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/90 via-[#1E3A8A]/30 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-200">
                  Campus Life
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug">
                  State-of-the-Art Labs & Infrastructure
                </h3>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
            {/* Responsive Stats Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black">
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Links Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Updates & Links
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="group flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#1E3A8A] hover:shadow-sm transition-all"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] pr-3 leading-snug">
                      {link.title}
                      {link.isNew && (
                        <span className="ml-2 inline-flex items-center bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                          New
                        </span>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accreditation Logos */}
        <div className="border-t border-slate-200 pt-8 sm:pt-10">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Accreditations & Approvals
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {accreditations.map((item, idx) => (
              <Card
                key={idx}
                className="group border border-slate-200/80 hover:border-[#1E3A8A]/30 shadow-sm hover:shadow-md transition-all duration-300 bg-white"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-3">
                  {/* Logo Container */}
                  <div className="relative h-16 sm:h-20 w-full flex items-center justify-center">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={160}
                      height={160}
                      className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Accreditation Name Tag */}
                  <span className="text-xs font-semibold tracking-wider text-slate-800 group-hover:text-[#1E3A8A] transition-colors uppercase">
                    {item.title}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
