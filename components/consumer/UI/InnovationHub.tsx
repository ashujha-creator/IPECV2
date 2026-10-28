"use client";
import React, { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface InnovationProject {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  institute: string;
  coordinator: string;
}

export interface InnovationTab {
  id: string;
  label: string;
  projects: InnovationProject[];
}

export interface Startup {
  id: string;
  name: string;
  founders: string;
  description: string;
  logo: string;
  logoAlt: string;
}

export interface InnovationHubProps {
  heading?: string;
  description?: string;
  tabs?: InnovationTab[];
  defaultTabId?: string;
  startupsHeading?: string;
  startups?: Startup[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default demo content                                               */
/* ------------------------------------------------------------------ */

const defaultTabs: InnovationTab[] = [
  {
    id: "center-of-excellence",
    label: "Center of Excellence",
    projects: [
      {
        id: "ai-education",
        image: "https://picsum.photos/seed/ipec-ai-brain/560/360",
        imageAlt:
          "Illustration of a glowing brain representing AI for education",
        title: "Artificial Intelligence for Education",
        institute: "IPEC",
        coordinator: "Dr. Anita Sahoo",
      },
      {
        id: "soil-water",
        image: "https://picsum.photos/seed/ipec-soil-water/560/360",
        imageAlt:
          "Aerial farmland view with data overlays for soil and water sensing",
        title: "Technology Solutions for Soil and Water Remediation",
        institute: "IPEC",
        coordinator: "Prof. Pammi Gauba",
      },
    ],
  },
  {
    id: "innovation-projects",
    label: "Innovation Projects",
    projects: [
      {
        id: "smart-campus",
        image: "https://picsum.photos/seed/ipec-smart-campus/560/360",
        imageAlt: "Smart campus IoT concept illustration",
        title: "IoT-Based Smart Campus Monitoring",
        institute: "IPEC",
        coordinator: "Dr. Rakesh Kumar",
      },
    ],
  },
  {
    id: "giant-projects",
    label: "Giant Projects",
    projects: [
      {
        id: "renewable-grid",
        image: "https://picsum.photos/seed/ipec-renewable-grid/560/360",
        imageAlt: "Renewable energy grid concept illustration",
        title: "Renewable Micro-Grid for Rural Electrification",
        institute: "IPEC",
        coordinator: "Dr. Neha Verma",
      },
    ],
  },
];

const defaultStartups: Startup[] = [
  {
    id: "gratify-ventures",
    name: "Gratify Ventures Private Limited",
    founders: "Sidhant Singh, Shivansh Mahajan, Krish Monga",
    description:
      "An AI-powered Smart Bin for waste segregation that rewards users with eco-points and vouchers. With QR scanning, digital displays, and...",
    logo: "https://picsum.photos/seed/gratify-logo/80/80",
    logoAlt: "Gratify Ventures logo",
  },
  {
    id: "2",
    name: "Gratify Ventures Private Limited",
    founders: "Sidhant Singh, Shivansh Mahajan, Krish Monga",
    description:
      "An AI-powered Smart Bin for waste segregation that rewards users with eco-points and vouchers. With QR scanning, digital displays, and...",
    logo: "https://picsum.photos/seed/gratify-logo/80/80",
    logoAlt: "Gratify Ventures logo",
  },
  {
    id: "3",
    name: "Gratify Ventures Private Limited",
    founders: "Sidhant Singh, Shivansh Mahajan, Krish Monga",
    description:
      "An AI-powered Smart Bin for waste segregation that rewards users with eco-points and vouchers. With QR scanning, digital displays, and...",
    logo: "https://picsum.photos/seed/gratify-logo/80/80",
    logoAlt: "Gratify Ventures logo",
  },
  {
    id: "tangle-connect",
    name: "Tangle Connect Private Limited",
    founders: "Dev Singh, Aryan Singla",
    description:
      "A mobile-first app transforming residential living by fostering community engagement. Features include buddy matching,...",
    logo: "https://picsum.photos/seed/tangle-logo/80/80",
    logoAlt: "Tangle Connect logo",
  },
  {
    id: "nimbus-agri",
    name: "Nimbus Agritech Private Limited",
    founders: "Riya Kapoor, Manav Chauhan",
    description:
      "A precision-agriculture platform that uses satellite and sensor data to help farmers optimise irrigation and reduce input costs.",
    logo: "https://picsum.photos/seed/nimbus-logo/80/80",
    logoAlt: "Nimbus Agritech logo",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProjectCard({ project }: { project: InnovationProject }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-4 py-4">
        <h3 className="text-[15px] font-bold leading-snug text-slate-900">
          {project.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Institute: </span>
          {project.institute}
        </p>
        <p className="text-[13px] leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Coordinator: </span>
          {project.coordinator}
        </p>
      </div>
    </article>
  );
}

function StartupCard({ startup }: { startup: Startup }) {
  return (
    <li className="flex gap-3 border-b border-white/10 py-4 first:pt-0 last:border-b-0">
      <img
        src={startup.logo}
        alt={startup.logoAlt}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-md object-cover ring-1 ring-white/15"
      />
      <div className="min-w-0">
        <h4 className="text-[13.5px] font-bold leading-snug text-white">
          {startup.founders}
        </h4>
        <p className="mt-1 text-[12.5px] leading-relaxed text-white/70">
          {startup.description}
        </p>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  InnovationHub                                                       */
/* ------------------------------------------------------------------ */

export default function InnovationHub({
  heading = "Innovation Hub",
  description = "Be creative, collaborative, and engage in entrepreneurial roles with the IPEC Innovation Hub. It is a place for aspiring innovators to find resources and support to turn their ideas into reality.",
  tabs = defaultTabs,
  defaultTabId,
  startupsHeading = "Startups",
  startups = defaultStartups,
  className = "",
}: InnovationHubProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId ?? tabs[0]?.id ?? "",
  );
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  return (
    <section
      aria-labelledby="innovation-hub-heading"
      className={`w-full bg-[#f6f9fc] py-10 px-4 sm:px-6 lg:px-4 select-none rounded-2xl ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Left: heading, tabs, project cards */}
        <div className="bg-[#D6F3F1]">
          <div className="bg-white px-5 pt-6 sm:px-8 sm:pt-8">
            <h2
              id="innovation-hub-heading"
              className="text-[2.5rem] p-4 font-extrabold text-slate-900 sm:text-[2.9rem]"
            >
              {heading}
            </h2>
            <p className="mt-2 max-w-2xl p-2  text-[1.25rem] leading-relaxed text-slate-600 sm:text-[1rem]">
              {description}
            </p>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Innovation Hub categories"
              className="mt-5 flex flex-wrap items-center gap-1 border-b border-slate-200 pb-0"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab?.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`
                      relative -mb-px rounded-t-md px-4 py-2.5 text-[13.5px] font-semibold
                      transition-colors duration-150
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-orange-500
                      ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project cards */}
          <div
            role="tabpanel"
            id={`panel-${activeTab?.id}`}
            aria-labelledby={`tab-${activeTab?.id}`}
            className="px-5 py-6 sm:px-8 sm:py-8"
          >
            {activeTab && activeTab.projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {activeTab.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-[13.5px] text-slate-600">
                No projects to show yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Startups — scrollable panel */}
        <aside
          aria-labelledby="startups-heading"
          className="flex flex-col bg-[#241E68] px-5 py-6 sm:px-6 sm:py-8 lg:h-full"
        >
          <h2
            id="startups-heading"
            className="mb-4 text-xl pb-6 font-extrabold text-white sm:text-2xl"
          >
            {startupsHeading}
          </h2>

          <ul
            className="
              innovation-hub-scroll min-h-0 flex-1 list-none overflow-y-auto pr-3
              lg:max-h-[calc(100vh-8rem)] lg:pr-0
            "
          >
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </ul>
        </aside>
      </div>

      {/* Scoped custom scrollbar styling for the Startups panel */}
      <style>{`
        .innovation-hub-scroll {
          scrollbar-width: thin;
          scrollbar-color: #F26522 rgba(255, 255, 255, 0.12);
        }
        .innovation-hub-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .innovation-hub-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
        }
        .innovation-hub-scroll::-webkit-scrollbar-thumb {
          background-color: #F26522;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
