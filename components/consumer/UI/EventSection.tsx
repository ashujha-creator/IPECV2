"use client";
import React, { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HappeningEvent {
  id: string;
  image: string;
  imageAlt: string;
  date: string;
  title: string;
  description: string;
  href: string;
}

export interface ArchiveEvent {
  id: string;
  title: string;
  date: string;
  href?: string;
}

export interface WhatsHappeningProps {
  eyebrow?: string;
  heading?: string;
  events?: HappeningEvent[];
  /** Number of event cards shown per carousel page (default: 2) */
  cardsPerPage?: number;
  viewAllHref?: string;
  archiveHeading?: string;
  archiveEvents?: ArchiveEvent[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default demo content                                               */
/* ------------------------------------------------------------------ */

const defaultEvents: HappeningEvent[] = [
  {
    id: "ic3-2026",
    image: "https://picsum.photos/seed/ipec-ic3-2026/560/280",
    imageAlt: "IC3-2026 conference banner",
    date: "6th, August 2026",
    title:
      "2026 Eighteenth International Conference on Contemporary Computing (IC3-2026)",
    description:
      "The International Conference on Contemporary Computing (IC3) is being jointly organized by Jaypee Institute of Information Technology, Noida, India",
    href: "#",
  },
  {
    id: "vdat-2026",
    image: "https://picsum.photos/seed/ipec-vdat-2026/560/280",
    imageAlt: "VDAT 2026 call for papers banner",
    date: "20th, August 2026",
    title: "30th International Symposium on VLSI Design and Test (VDAT 2026)",
    description:
      "Jaypee Institute of Information Technology (JIIT), Noida is hosting the 30th International Symposium on VLSI Design and Test (VDAT 2026) from 20–22",
    href: "#",
  },
  {
    id: "sdp-2026",
    image: "https://picsum.photos/seed/ipec-sdp-2026/560/280",
    imageAlt: "Staff development program banner",
    date: "23rd, July 2026",
    title: "One-week Staff Development Program (SDP)",
    description:
      "A one-week staff development program focused on building institutional capacity and administrative excellence across departments.",
    href: "#",
  },
  {
    id: "fdp-2026",
    image: "https://picsum.photos/seed/ipec-fdp-2026/560/280",
    imageAlt: "Faculty development program banner",
    date: "13th, July 2026",
    title:
      "Faculty Development Program on Recent Advances in Computational Mathematics",
    description:
      "A faculty development program covering recent advances in computational mathematics, machine learning and emerging applications.",
    href: "#",
  },
];

const defaultArchiveEvents: ArchiveEvent[] = [
  {
    id: "sdp",
    title: "one-week Staff Development Program (SDP)",
    date: "23rd, July 2026",
    href: "#",
  },
  {
    id: "fdp",
    title:
      'One-week Faculty Development Program (FDP) on "Recent Advances in Computational Mathematics',
    date: "13th, July 2026",
  },
  {
    id: "ml-apps",
    title:
      "Recent Advances in Computational Mathematics, Machine Learning and Emerging Applications",
    date: "13th, July 2026",
    href: "#",
  },
  {
    id: "fdp-2026-archive",
    title: "Faculty Development Program 2026",
    date: "13th, July 2026",
    href: "#",
  },
  {
    id: "workshop-ai",
    title: "Workshop on AI in Higher Education",
    date: "2nd, July 2026",
    href: "#",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length > 0 ? pages : [[]];
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function EventCard({ event }: { event: HappeningEvent }) {
  return (
    <article className="flex flex-col">
      <div className="aspect-[2/1] w-full overflow-hidden rounded-lg bg-slate-200">
        <img
          src={event.image}
          alt={event.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="mt-3 text-[12.5px] font-semibold text-slate-500">
        {event.date}
      </p>
      <h3 className="mt-1 text-[15px] font-bold leading-snug text-slate-900">
        {event.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {event.description}
      </p>
      <a
        href={event.href}
        className="
          mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-300
          bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-800
          transition-colors duration-150 hover:border-orange-400 hover:text-orange-600
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-orange-500
        "
      >
        <ExternalLink
          className="h-3.5 w-3.5"
          strokeWidth={2}
          aria-hidden="true"
        />
        Know More
      </a>
    </article>
  );
}

function ArchiveItem({ event }: { event: ArchiveEvent }) {
  return (
    <li className="border-b border-slate-900/10 py-4 first:pt-0 last:border-b-0">
      <h4 className="text-[13.5px] font-bold leading-snug text-slate-900">
        {event.title}
      </h4>
      <p className="mt-2 text-[12.5px] font-semibold text-slate-600">
        {event.date}
      </p>
      {event.href && (
        <a
          href={event.href}
          className="
            mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-900/15
            bg-white/60 px-3 py-1 text-[12px] font-semibold text-slate-800
            transition-colors duration-150 hover:border-orange-400 hover:text-orange-600
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-orange-500
          "
        >
          <ExternalLink
            className="h-3 w-3"
            strokeWidth={2}
            aria-hidden="true"
          />
          Know More
        </a>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsHappening                                                      */
/* ------------------------------------------------------------------ */

export default function WhatsHappening({
  eyebrow = "What's",
  heading = "Happening @ IPEC",
  events = defaultEvents,
  cardsPerPage = 2,
  viewAllHref = "#",
  archiveHeading = "Event Archive",
  archiveEvents = defaultArchiveEvents,
  className = "",
}: WhatsHappeningProps) {
  const pages = useMemo(
    () => chunk(events, cardsPerPage),
    [events, cardsPerPage],
  );
  const [activePage, setActivePage] = useState(0);
  const currentEvents = pages[activePage] ?? [];

  return (
    <section
      aria-labelledby="whats-happening-heading"
      className={`w-full bg-[#f6f9fc] py-12 px-4 sm:px-6 lg:px-8 select-none ${className}`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left: heading + carousel card */}
        <div>
          <p className="text-[1.8rem] font-extrabold leading-tight text-slate-900 sm:text-[2.1rem] lg:text-[2.4rem]">
            {eyebrow}
          </p>
          <h2
            id="whats-happening-heading"
            className="text-[1.2rem] font-medium text-slate-700 sm:text-[1.3rem] lg:text-[1.4rem]"
          >
            {heading}
          </h2>

          <div className="mt-5 rounded-2xl bg-[#EDE9DF] p-5 sm:p-6">
            <div
              role="group"
              aria-roledescription="carousel"
              aria-label="Upcoming events"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {currentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              {/* Pagination dots */}
              {pages.length > 1 && (
                <div
                  className="flex items-center gap-1.5"
                  role="tablist"
                  aria-label="Event pages"
                >
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === activePage}
                      aria-label={`Show event page ${i + 1}`}
                      onClick={() => setActivePage(i)}
                      className={`
                        h-1.5 rounded-full transition-all duration-200
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-orange-500
                        ${i === activePage ? "w-6 bg-orange-500" : "w-6 bg-slate-300 hover:bg-slate-400"}
                      `}
                    />
                  ))}
                </div>
              )}

              <a
                href={viewAllHref}
                className="
                  inline-flex items-center gap-1.5 rounded-full border border-slate-400
                  bg-white px-4 py-1.5 text-[12.5px] font-semibold text-slate-800
                  transition-colors duration-150 hover:border-orange-400 hover:text-orange-600
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-orange-500
                "
              >
                <ExternalLink
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                View All
              </a>
            </div>
          </div>
        </div>

        {/* Right: Event Archive — scrollable panel */}
        <aside
          aria-labelledby="event-archive-heading"
          className="flex flex-col rounded-2xl bg-[#BFEAF2] px-5 py-6 sm:px-6"
        >
          <h2
            id="event-archive-heading"
            className="mb-4 text-xl font-extrabold text-slate-900"
          >
            {archiveHeading}
          </h2>

          <ul
            className="
              whats-happening-scroll min-h-0 flex-1 list-none overflow-y-auto pr-3
              lg:max-h-[420px]
            "
          >
            {archiveEvents.map((event) => (
              <ArchiveItem key={event.id} event={event} />
            ))}
          </ul>
        </aside>
      </div>

      {/* Scoped custom scrollbar styling for the Event Archive panel */}
      <style>{`
        .whats-happening-scroll {
          scrollbar-width: thin;
          scrollbar-color: #0F172A66 transparent;
        }
        .whats-happening-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .whats-happening-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .whats-happening-scroll::-webkit-scrollbar-thumb {
          background-color: #0F172A66;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
