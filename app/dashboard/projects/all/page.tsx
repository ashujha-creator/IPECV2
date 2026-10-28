import { Suspense } from "react";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlaygroundGrid from "@/components/playground/PlaygroundGrid";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";

// 1. Cached Database Query (Static / ISR capable)
const getPublishedPlaygrounds = unstable_cache(
  async () => {
    return await prisma.playground.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        ownerId: true,
        createdAt: true,
      },
    });
  },
  ["published-playgrounds-list"],
  {
    revalidate: 60,
    tags: ["playgrounds"],
  },
);

// 2. Dynamic Child Component (Handles uncached header/session data inside Suspense)
async function PlaygroundGridWrapper() {
  const reqHeaders = await headers();

  const [session, rawPlaygrounds] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    getPublishedPlaygrounds(),
  ]);

  const playgrounds = rawPlaygrounds.map((p) => ({
    ...p,
    createdAt:
      p.createdAt instanceof Date
        ? p.createdAt.toISOString()
        : new Date(p.createdAt).toISOString(),
  }));

  const currentUserId = session?.user?.id ?? null;

  return (
    <PlaygroundGrid playgrounds={playgrounds} currentUserId={currentUserId} />
  );
}

// 3. Skeleton Fallback UI for Streaming
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70 p-5 shadow-sm"
        />
      ))}
    </div>
  );
}

export default function PlaygroundListPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" />
              Community Space
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Published Playgrounds
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Explore interactive projects created by the community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/playgrounds/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Playground
            </Link>
          </div>
        </div>

        {/* 4. Wrapped in Suspense to resolve Blocking Prerender error */}
        <Suspense fallback={<GridSkeleton />}>
          <PlaygroundGridWrapper />
        </Suspense>
      </main>
    </div>
  );
}
