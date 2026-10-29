import { Suspense } from "react";
import MenuWrapper from "@/components/MenuBuilder/MenuWrapper";

export default function MenusAdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Dynamic Recursive Menu Builder
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Manage website navigation headers, submenus, and child categories stored directly in your database.
          </p>
        </header>

        <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading menu configuration...</div>}>
          <MenuWrapper />
        </Suspense>
      </div>
    </main>
  );
}