/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Trash2,
  ExternalLink,
  UserCheck,
  Clock,
  FolderKanban,
  AlertCircle,
  Loader2,
} from "lucide-react";

export type PlaygroundListItem = {
  id: string;
  slug: string;
  title: string | null;
  ownerId: string;
  createdAt: string;
};

type PlaygroundGridProps = {
  playgrounds: PlaygroundListItem[];
  currentUserId: string | null;
};

const CACHE_KEY = "cached_playgrounds_grid_list";

export default function PlaygroundGrid({
  playgrounds: initialPlaygrounds,
  currentUserId,
}: PlaygroundGridProps) {
  const [playgrounds, setPlaygrounds] =
    useState<PlaygroundListItem[]>(initialPlaygrounds);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state when props change & store in client-side sessionStorage
  useEffect(() => {
    if (initialPlaygrounds && initialPlaygrounds.length > 0) {
      setPlaygrounds(initialPlaygrounds);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(initialPlaygrounds));
      } catch (err) {
        console.warn("Failed to update client cache", err);
      }
    } else {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setPlaygrounds(JSON.parse(cached));
        } catch (err) {
          console.error("Failed to parse cached playgrounds", err);
        }
      }
    }
  }, [initialPlaygrounds]);

  const handleDelete = async (id: string, slug: string) => {
    const confirmed = window.confirm(
      `Delete "${slug}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/playgrounds/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to delete playground.");
        return;
      }

      // Optimistic state update & cache sync
      setPlaygrounds((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.warn("Failed to update cache after delete", err);
        }
        return updated;
      });
    } catch {
      setError("Failed to delete playground. Check your connection.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlaygrounds = playgrounds.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.slug.toLowerCase().includes(query) ||
      (p.title && p.title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Control */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Empty State */}
      {filteredPlaygrounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <FolderKanban className="h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            No playgrounds found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery
              ? "No matches found for your search query."
              : "There are no published playgrounds available right now."}
          </p>
        </div>
      ) : (
        /* Light Theme Responsive Card Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlaygrounds.map((playground) => {
            const isOwner = currentUserId === playground.ownerId;
            const isDeleting = deletingId === playground.id;
            const formattedDate = new Date(
              playground.createdAt,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={playground.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      /{playground.slug}
                    </span>
                    {isOwner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <UserCheck className="h-3 w-3" />
                        Owner
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                    {playground.title || "Untitled Playground"}
                  </h2>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(playground.id, playground.slug)
                        }
                        disabled={isDeleting}
                        title="Delete playground"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    <Link
                      href={`/playground/${playground.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-600 hover:text-white"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
