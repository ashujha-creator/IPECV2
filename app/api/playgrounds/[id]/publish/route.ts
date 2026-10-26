// app/api/playgrounds/[id]/publish/route.ts
//
// Flow:
//   1. auth + ownership
//   2. validate the multipart payload (html, css, javascript, assetMeta, assets)
//   3. build the final file set: index.html (wrapped), style.css, script.js, assets/*
//      - asset://<id> references are rewritten to relative paths (assets/<name>)
//   4. sha256 every file, upload only the blobs that don't exist yet (content-addressed keys)
//   5. one DB transaction: upsert Blob rows, replace the playground's file rows, mark PUBLISHED
//
// Order matters: bytes reach Storage BEFORE any DB row points at them, so the DB never
// references a missing object. A failure between 4 and 5 only leaves harmless orphan blobs.

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { playgroundTag } from "@/lib/playground-cache";
import crypto from "node:crypto";
import { z } from "zod";
import { auth } from "@/lib/auth"; // adjust to your better-auth export
import { prisma } from "@/lib/prisma"; // adjust to your Prisma client singleton
import { supabaseAdmin } from "@/lib/supabase-admin";

// ───────────────────────── limits & allowlists ─────────────────────────

const BUCKET = "page-media";
const MAX_ASSET_BYTES = 5 * 1024 * 1024; // per asset
const MAX_CODE_BYTES = 1 * 1024 * 1024; // per html/css/js file
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // per playground
const MAX_ASSETS = 50;
const BODY_OVERHEAD_BYTES = 1 * 1024 * 1024; // multipart framing + text fields
const UPLOAD_CONCURRENCY = 5;

// Content types come from the extension, never from the client's File.type.
// Keep this list in sync with allowed_mime_types in page-media-setup.sql.
const ASSET_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
  json: "application/json",
};

const assetMetaSchema = z
  .array(
    z.object({
      id: z.string().regex(/^[\w-]{1,64}$/),
      name: z.string().min(1).max(255),
    }),
  )
  .max(MAX_ASSETS);

// ───────────────────────── small helpers ─────────────────────────

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type PreparedFile = {
  path: string;
  contentType: string;
  data: Buffer;
  checksum: string;
};

const sha256 = (data: Buffer) =>
  crypto.createHash("sha256").update(data).digest("hex");

// "blobs/ab/abcdef…" – the 2-char prefix keeps listings in the dashboard manageable.
const blobKey = (checksum: string) =>
  `blobs/${checksum.slice(0, 2)}/${checksum}`;

// Browsers normalise form text to CRLF; normalise back so hashes are stable.
const normalizeNewlines = (s: string) => s.replace(/\r\n?/g, "\n");

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * "My Photo (1).JPEG" -> { base: "my-photo-1", ext: "jpeg" }
 * The base can't contain dots or slashes, so path traversal ("..") is impossible.
 * Returns null when the extension isn't on the allowlist.
 */
function toSafeAssetName(
  original: string,
): { base: string; ext: string } | null {
  const lower = original.trim().toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1).replace(/[^a-z0-9]/g, "") : "";
  if (!ASSET_TYPES[ext]) return null;

  const rawBase = dot >= 0 ? lower.slice(0, dot) : lower;
  const base =
    rawBase
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "")
      .slice(0, 80) || "file";

  return { base, ext };
}

function uniquePath(base: string, ext: string, used: Set<string>) {
  let path = `assets/${base}.${ext}`;
  let n = 1;
  while (used.has(path)) path = `assets/${base}-${++n}.${ext}`;
  used.add(path);
  return path;
}

/** The editor sends the HTML pane as a body fragment, so wrap it in a real document. */
function buildIndexHtml(bodyHtml: string, title: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="style.css" />
</head>
<body>
${bodyHtml}
<script src="script.js"></script>
</body>
</html>
`;
}

/** asset://<id> -> assets/<name>. Unknown ids are collected so we can reject the publish. */
function rewriteAssetRefs(
  source: string,
  pathById: Map<string, string>,
  unresolved: Set<string>,
) {
  return source.replace(/asset:\/\/([\w-]+)/g, (match, id: string) => {
    const path = pathById.get(id);
    if (!path) {
      unresolved.add(id);
      return match;
    }
    return path;
  });
}

/** Run `fn` over `items` with at most `limit` in flight; stop early on first failure. */
async function mapLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
) {
  let next = 0;
  let aborted = false;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (!aborted && next < items.length) {
        const item = items[next++];
        try {
          await fn(item);
        } catch (error) {
          aborted = true;
          throw error;
        }
      }
    },
  );
  await Promise.all(workers);
}

function requireText(form: FormData, field: string): string {
  const value = form.get(field);
  if (typeof value !== "string") {
    throw new HttpError(400, `"${field}" is required.`);
  }
  return value;
}

// ───────────────────────── handler ─────────────────────────

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    return await publish(request, ctx);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[publish] unexpected failure", error);
    return NextResponse.json(
      { error: "Failed to publish playground." },
      { status: 500 },
    );
  }
}

async function publish(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. auth + ownership ----------------------------------------------------
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new HttpError(401, "Unauthorized");

  // Cheap rejection before the body is buffered. Real sizes are re-checked below.
  const declaredBytes = Number(request.headers.get("content-length") ?? 0);
  if (declaredBytes > MAX_TOTAL_BYTES + BODY_OVERHEAD_BYTES) {
    throw new HttpError(413, "Upload exceeds the playground's 50 MB limit.");
  }

  // One query; "missing" and "not yours" return the same 404 so ids can't be probed.
  const playground = await prisma.playground.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      title: true,
      status: true,
      publishedAt: true,
      slug: true,
    },
  });
  if (!playground) throw new HttpError(404, "Playground not found.");
  if (playground.status === "ARCHIVED") {
    throw new HttpError(409, "Archived playgrounds can't be published.");
  }

  // 2. parse + validate ----------------------------------------------------
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new HttpError(400, "Expected multipart form data.");
  }

  const htmlSource = requireText(form, "html");
  const cssSource = requireText(form, "css");
  const jsSource = requireText(form, "javascript");

  let assetMeta: z.infer<typeof assetMetaSchema> = [];
  const assetMetaRaw = form.get("assetMeta");
  if (typeof assetMetaRaw === "string" && assetMetaRaw.length > 0) {
    let json: unknown;
    try {
      json = JSON.parse(assetMetaRaw);
    } catch {
      throw new HttpError(400, "Invalid assetMeta.");
    }
    const parsed = assetMetaSchema.safeParse(json);
    if (!parsed.success) throw new HttpError(400, "Invalid assetMeta.");
    assetMeta = parsed.data;
  }

  if (new Set(assetMeta.map((a) => a.id)).size !== assetMeta.length) {
    throw new HttpError(400, "Duplicate asset ids.");
  }

  // assetMeta[i] describes assets[i]; FormData preserves append order.
  const assetFiles = form
    .getAll("assets")
    .filter((entry): entry is File => entry instanceof File);

  if (assetFiles.length !== assetMeta.length) {
    throw new HttpError(
      400,
      "assetMeta does not match the number of uploaded files.",
    );
  }

  // 3. build the final file set -------------------------------------------
  const files: PreparedFile[] = [];
  const usedPaths = new Set(["index.html", "style.css", "script.js"]);
  const pathById = new Map<string, string>();

  for (let i = 0; i < assetFiles.length; i++) {
    const file = assetFiles[i];
    const meta = assetMeta[i];

    if (file.size > MAX_ASSET_BYTES) {
      throw new HttpError(413, `"${meta.name}" is larger than 5 MB.`);
    }
    const safe = toSafeAssetName(meta.name);
    if (!safe) {
      throw new HttpError(400, `"${meta.name}" is not a supported file type.`);
    }

    const path = uniquePath(safe.base, safe.ext, usedPaths);
    const data = Buffer.from(await file.arrayBuffer());
    pathById.set(meta.id, path);
    files.push({
      path,
      contentType: ASSET_TYPES[safe.ext],
      data,
      checksum: sha256(data),
    });
  }

  const unresolved = new Set<string>();
  const rewrite = (source: string) =>
    rewriteAssetRefs(normalizeNewlines(source), pathById, unresolved);

  const codeFiles = [
    {
      path: "index.html",
      contentType: "text/html",
      text: buildIndexHtml(
        rewrite(htmlSource),
        playground.title ?? "Playground",
      ),
    },
    { path: "style.css", contentType: "text/css", text: rewrite(cssSource) },
    {
      path: "script.js",
      contentType: "text/javascript",
      text: rewrite(jsSource),
    },
  ];

  if (unresolved.size > 0) {
    throw new HttpError(
      400,
      "Your code references assets that weren't uploaded. Remove or re-add them and try again.",
    );
  }

  for (const code of codeFiles) {
    const data = Buffer.from(code.text, "utf-8");
    if (data.length > MAX_CODE_BYTES) {
      throw new HttpError(413, `${code.path} is larger than 1 MB.`);
    }
    files.push({
      path: code.path,
      contentType: code.contentType,
      data,
      checksum: sha256(data),
    });
  }

  // Measured on the final bytes (after wrapping/rewriting), not the raw form fields.
  const totalBytes = files.reduce((sum, f) => sum + f.data.length, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new HttpError(
      413,
      "Total size exceeds the playground's 50 MB limit.",
    );
  }

  // 4. upload only what Storage doesn't have yet ----------------------------
  const uniqueByChecksum = new Map(files.map((f) => [f.checksum, f]));

  const known = new Set(
    (
      await prisma.blob.findMany({
        where: { checksum: { in: [...uniqueByChecksum.keys()] } },
        select: { checksum: true },
      })
    ).map((b) => b.checksum),
  );

  const toUpload = [...uniqueByChecksum.values()].filter(
    (f) => !known.has(f.checksum),
  );

  await mapLimit(toUpload, UPLOAD_CONCURRENCY, async (file) => {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(blobKey(file.checksum), file.data, {
        contentType: file.contentType,
        cacheControl: "31536000", // key is the content hash, so the bytes never change
        upsert: true, // same key == same bytes, so a concurrent duplicate is harmless
      });

    if (error) {
      console.error("[publish] storage upload failed", file.path, error);
      throw new HttpError(502, "Failed to upload files to storage.");
    }
  });

  // 5. one transaction: blobs, file rows, playground state -------------------
  const now = new Date();

  await prisma.$transaction(
    async (tx) => {
      // Serialise concurrent publishes of the same playground.
      await tx.$queryRaw`SELECT id FROM "playground" WHERE id = ${playground.id} FOR UPDATE`;

      await tx.blob.createMany({
        data: [...uniqueByChecksum.values()].map((f) => ({
          checksum: f.checksum,
          size: f.data.length,
          storageKey: blobKey(f.checksum),
        })),
        skipDuplicates: true,
      });

      // Replace-all inside the transaction: readers see the old set until commit,
      // then the new set. Removed assets disappear without any diffing logic.
      await tx.playgroundFile.deleteMany({
        where: { playgroundId: playground.id },
      });
      await tx.playgroundFile.createMany({
        data: files.map((f) => ({
          playgroundId: playground.id,
          path: f.path,
          contentType: f.contentType,
          blobChecksum: f.checksum,
        })),
      });

      await tx.playground.update({
        where: { id: playground.id },
        data: {
          status: "PUBLISHED",
          entryFile: "index.html",
          totalBytes,
          publishedAt: playground.publishedAt ?? now,
        },
      });
    },
    { timeout: 15_000 },
  );
  revalidateTag(playgroundTag(playground.slug), { expire: 0 });
  return NextResponse.json(
    {
      success: "Playground published successfully.",
      files: files.length,
      totalBytes,
    },
    { status: 200 },
  );
}
