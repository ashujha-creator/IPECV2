/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

type PublishDialogProps = {
  onClose: () => void;
  onCreated: (playground: { id: string; slug: string }) => void;
};

type SlugStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; reason: string };

export default function PublishDialog({
  onClose,
  onCreated,
}: PublishDialogProps) {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<SlugStatus>({ state: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = slug.trim().toLowerCase();

    if (!trimmed) {
      setStatus({ state: "idle" });
      return;
    }

    setStatus({ state: "checking" });

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/playgrounds/check-slug?slug=${encodeURIComponent(trimmed)}`,
        );
        const data = await response.json();

        if (data.available) {
          setStatus({ state: "available" });
        } else {
          setStatus({
            state: "unavailable",
            reason: data.reason ?? "That slug is taken.",
          });
        }
      } catch {
        setStatus({
          state: "unavailable",
          reason: "Could not check slug right now.",
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [slug]);

  const handleSubmit = async () => {
    if (status.state !== "available") return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/playgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Failed to create playground.");
        return;
      }

      onCreated({ id: data.playground.id, slug: data.playground.slug });
    } catch {
      setSubmitError("Failed to create playground.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-lg bg-[#252526] p-4 text-white shadow-xl">
        <h2 className="text-sm font-medium">Choose a slug</h2>
        <p className="mt-1 text-xs text-gray-400">
          Your playground will be published at /p/&lt;slug&gt;
        </p>

        <input
          autoFocus
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="my-cool-page"
          className="mt-3 w-full rounded bg-[#1e1e1e] px-2 py-1.5 text-sm outline-none ring-1 ring-gray-700 focus:ring-blue-500"
        />

        <div className="mt-1 h-4 text-[11px]">
          {status.state === "checking" && (
            <span className="text-gray-400">Checking availability…</span>
          )}
          {status.state === "available" && (
            <span className="text-green-400">Available</span>
          )}
          {status.state === "unavailable" && (
            <span className="text-red-400">{status.reason}</span>
          )}
        </div>

        {submitError && (
          <p className="mt-1 text-[11px] text-red-400">{submitError}</p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={status.state !== "available" || isSubmitting}
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
