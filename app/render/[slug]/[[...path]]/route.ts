// app/render/[slug]/[[...path]]/route.ts
//
// Serves a published playground's files, one request per file:
//   /render/<slug>/index.html   -> the document
//   /render/<slug>/style.css    -> resolved by the browser from the <link> in index.html
//   /render/<slug>/assets/x.png -> same
//
// Why it works: every stored file is addressed by (playground, path). The browser asks
// for each path separately, so nothing is stitched together by hand and one file's bytes
// can never be served as another's. The bytes are also re-hashed and compared with the
// stored checksum, so a wrong or corrupted object fails loudly instead of rendering.

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RENDER_SANDBOX } from "@/lib/render-sandbox";

const BUCKET = "page-media";

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

const isTextType = (contentType: string) =>
  contentType.startsWith("text/") || contentType === "application/json";

export async function GET(request: NextRequest, { params }: Ctx) {
  const { slug, path: segments } = await params;
  const path = (segments ?? []).join("/");

  // /render/<slug> (no file) -> redirect to the entry file. Serving the document at
  // /render/<slug>/index.html keeps relative URLs ("style.css") resolving correctly,
  // with no <base> tag and no dependence on trailing-slash behaviour.
  if (!path) {
    const playground = await prisma.playground.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { entryFile: true },
    });
    if (!playground) return new NextResponse("Not found", { status: 404 });
    return NextResponse.redirect(
      new URL(`/render/${slug}/${playground.entryFile}`, request.url),
      308,
    );
  }

  // One query: the file, its blob, and a check that the playground is published.
  const file = await prisma.playgroundFile.findFirst({
    where: { path, playground: { slug, status: "PUBLISHED" } },
    select: {
      contentType: true,
      blob: { select: { checksum: true, storageKey: true } },
    },
  });
  if (!file) return new NextResponse("Not found", { status: 404 });

  const etag = `"${file.blob.checksum}"`;

  const headers: Record<string, string> = {
    "Content-Type": isTextType(file.contentType)
      ? `${file.contentType}; charset=utf-8`
      : file.contentType,
    ETag: etag,
    // Browsers revalidate (cheap 304); a CDN may serve it for a minute after a republish.
    "Cache-Control":
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    "X-Content-Type-Options": "nosniff",
    // User code runs with an opaque origin: no cookies, no access to this app.
    // Keep the flags identical to the iframe's sandbox attribute (see lib/render-sandbox.ts).
    "Content-Security-Policy": `sandbox ${RENDER_SANDBOX}`,
    // A sandboxed frame has a "null" origin, so its fetch() calls and web fonts
    // need CORS to read these (public) files.
    "Access-Control-Allow-Origin": "*",
  };

  // Conditional request: skip Storage entirely when the browser's copy is current.
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(file.blob.storageKey);

  if (error || !data) {
    console.error("[render] download failed", file.blob.storageKey, error);
    return new NextResponse("Storage error", { status: 502 });
  }

  const bytes = Buffer.from(await data.arrayBuffer());

  const actual = crypto.createHash("sha256").update(bytes).digest("hex");
  if (actual !== file.blob.checksum) {
    console.error("[render] checksum mismatch", {
      slug,
      path,
      storageKey: file.blob.storageKey,
      expected: file.blob.checksum,
      actual,
    });
    return new NextResponse("Stored file is corrupted", { status: 500 });
  }

  return new NextResponse(new Uint8Array(bytes), { status: 200, headers });
}
