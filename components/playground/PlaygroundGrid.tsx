"use client";

import { useState } from "react";
import Link from "next/link";

type PlaygroundListItem = {
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

export default function PlaygroundGrid({
  playgrounds: initialPlaygrounds,
  currentUserId,
}: PlaygroundGridProps) {
  const [playgrounds, setPlaygrounds] = useState(initialPlaygrounds);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, slug: string) => {
    const confirmed = window.confirm(
      `Delete "${slug}"? This cannot be undone.`,
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
        setError(data.error ?? "Failed to delete.");
        return;
      }

      setPlaygrounds((previous) => previous.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  if (playgrounds.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        No published playgrounds yet.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {playgrounds.map((playground) => (
        <div
          key={playground.id}
          className="flex items-center justify-between rounded border border-gray-200 p-3"
        >
          <Link
            href={`/playground/${playground.slug}`}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-medium text-blue-600 hover:underline">
              /{playground.slug}
            </p>
            {playground.title && (
              <p className="truncate text-xs text-gray-500">
                {playground.title}
              </p>
            )}
          </Link>

          {currentUserId === playground.ownerId && (
            <button
              type="button"
              onClick={() => handleDelete(playground.id, playground.slug)}
              disabled={deletingId === playground.id}
              className="ml-3 shrink-0 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === playground.id ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
