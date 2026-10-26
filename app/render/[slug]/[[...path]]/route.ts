// app/render/[slug]/[...path]/route.ts
//
// Serves one published file per request, e.g. /render/my-site/index.html,
// /render/my-site/style.css, /render/my-site/assets/logo.png.
// The public page embeds /render/<slug>/<entryFile> in a sandboxed iframe, so the browser
// resolves every relative URL in the user's HTML against this route on its own.
//
// Caching model: the *URL* is stable but the *content* changes on every publish, so the
// browser revalidates with an ETag (the storage key contains the publishId, so it changes
// on every publish). Unchanged files answer 304 without touching Storage.

import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma"; // adjust to your Prisma client singleton
import { playgroundTag } from "@/lib/playground-cache";
import { PLAYGROUND_CONFIG } from "@/lib/playground/config";
import { RENDER_SANDBOX } from "@/lib/render-sandbox"; // e.g. "allow-scripts allow-forms allow-popups"
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ slug: string; path: string[] }> };

/**
 * One cache entry per slug (at most ~53 rows), invalidated by the publish route's
 * revalidateTag. Looking paths up in memory means random URLs can't create cache entries.
 */
async function getPublishedFiles(slug: string) {
  "use cache";
  cacheTag(playgroundTag(slug));
  cacheLife("hours");

  return prisma.playgroundFile.findMany({
    where: { playground: { slug, status: "PUBLISHED" } },
    select: { path: true, storageKey: true, contentType: true },
  });
}

/** If-None-Match can be a list, and CDNs sometimes weaken validators (W/"…"). */
function matchesEtag(header: string | null, etag: string) {
  if (!header) return false;
  return header
    .split(",")
    .map((token) => token.trim().replace(/^W\//, ""))
    .some((token) => token === "*" || token === etag);
}

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });

export async function GET(request: Request, { params }: Ctx) {
  const { slug, path } = await params;

  const files = await getPublishedFiles(slug);
  const filePath = path.join("/");
  const file = files.find((f) => f.path === filePath);
  // Unknown slug, draft/archived playground, or unknown path: all look the same.
  if (!file) return notFound();

  const etag = `"${file.storageKey}"`;
  const contentType = file.contentType.startsWith("text/")
    ? `${file.contentType}; charset=utf-8`
    : file.contentType;

  const headers = {
    "Content-Type": contentType, // from the DB (derived from the extension), never sniffed
    ETag: etag,
    "Cache-Control": "public, max-age=0, must-revalidate",
    // Same sandbox as the iframe attribute, so opening a file URL directly is just as isolated.
    "Content-Security-Policy": `sandbox ${RENDER_SANDBOX}`,
    "X-Content-Type-Options": "nosniff",
    // Sandboxed pages have an opaque origin: fonts and fetch() need CORS to load.
    "Access-Control-Allow-Origin": "*",
    // Index the public page, not the raw files.
    "X-Robots-Tag": "noindex",
  };

  if (matchesEtag(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(PLAYGROUND_CONFIG.bucket)
    .download(file.storageKey);

  if (error || !data) {
    console.error("[render] storage download failed", file.storageKey, error);
    return notFound();
  }

  return new Response(data.stream(), { headers });
}
