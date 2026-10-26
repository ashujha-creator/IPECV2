import React from "react";
import Link from "next/link";
import { FolderPlus, Folders, Edit, Trash2 } from "lucide-react";

// Mock server-side fetch or state (replace with your DB call)
async function getProjectsCount() {
  // Example: const count = await db.project.count();
  return 12; // Total count placeholder
}

export default async function ProjectsDashboardPage() {
  const totalProjects = await getProjectsCount();

  const navigationCards = [
    {
      title: "View All Projects",
      description:
        "Browse, filter, and inspect all existing projects in your workspace.",
      href: "/projects/all",
      icon: Folders,
      color: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
      buttonText: "Go to Projects List",
    },
    {
      title: "Create New Project",
      description:
        "Set up a new project, assign categories, and configure details.",
      href: "/dashboard/projects/create",
      icon: FolderPlus,
      color:
        "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300",
      buttonText: "Create Project",
    },
    {
      title: "Update Project",
      description:
        "Modify existing project details, statuses, and configurations.",
      href: "/projects/edit",
      icon: Edit,
      color:
        "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300",
      buttonText: "Update Projects",
    },
    {
      title: "Delete Project",
      description:
        "Manage project removals and archive or permanently delete projects.",
      href: "/projects/delete",
      icon: Trash2,
      color: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300",
      buttonText: "Manage Deletions",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Total Projects Heading */}
        <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Projects Hub
            </h1>
            <p className="text-slate-500 mt-1">
              Select an action below to manage your application workspace.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-xl text-center self-start md:self-auto">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block">
              Total Projects
            </span>
            <span className="text-3xl font-black text-indigo-700">
              {totalProjects}
            </span>
          </div>
        </header>

        {/* Navigation Grid linking to distinct pages */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navigationCards.map((card) => (
            <ProjectNavigationCard key={card.href} card={card} />
          ))}
        </main>
      </div>
    </div>
  );
}

// Sub-component for individual Navigation Link Cards
function ProjectNavigationCard({
  card,
}: {
  card: {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    color: string;
    buttonText: string;
  };
}) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className={`group p-6 rounded-2xl bg-white border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${card.color}`}
    >
      <div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm border border-slate-100">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {card.title}
        </h2>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          {card.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between font-medium text-sm text-slate-700 group-hover:text-indigo-600">
        <span>{card.buttonText}</span>
        <span className="transform group-hover:translate-x-1 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
