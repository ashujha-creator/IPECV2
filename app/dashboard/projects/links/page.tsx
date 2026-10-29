// app/dashboard/projects/links/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getNavMenu } from "@/lib/nav-menu/queries";
import { NavBuilder } from "@/components/MenuBuilder/nav-builder";

export const metadata: Metadata = {
  title: "Navigation menu",
};

/**
 * Reads the saved menu. With Cache Components enabled, request-time data must
 * be read inside a <Suspense> boundary: the page shell (heading, skeleton) is
 * prerendered and this part streams in on every request.
 */
async function BuilderLoader() {
  // Opt into request-time rendering so the database is read per request,
  // not once at build time.
  await connection();

  // null means no menu has been saved yet: the builder shows the templates.
  const snapshot = await getNavMenu();

  return <NavBuilder initialSnapshot={snapshot} />;
}

function BuilderSkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Loading the menu builder…</span>
      <div className="h-[58px] animate-pulse rounded-xl border bg-muted/50 motion-reduce:animate-none" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-xl border bg-muted/50 motion-reduce:animate-none" />
        <div className="h-96 animate-pulse rounded-xl border bg-muted/50 motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export default function LinksPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Navigation menu
        </h1>
        <p className="text-sm text-muted-foreground">
          Build the menu your site&apos;s navbar will render. Saving stores it
          in the database as JSON.
        </p>
      </header>

      <Suspense fallback={<BuilderSkeleton />}>
        <BuilderLoader />
      </Suspense>
    </div>
  );
}
