import { z } from "zod";
import { PLAYGROUND_CONFIG as C } from "@/lib/playground/config";

const assetId = z.string().regex(/^[\w-]{1,64}$/);
const assetName = z.string().min(1).max(255);

// ── requests ──────────────────────────────────────────────────────────────

/** Step 1: "I want to upload these files." Sizes are the client's claim, re-checked in commit. */
export const prepareRequestSchema = z.object({
  assets: z
    .array(
      z.object({
        id: assetId,
        name: assetName,
        size: z.number().int().min(0),
      }),
    )
    .max(C.maxAssets),
});

/** Step 3: "The files are uploaded, publish." Code travels here; it's small. */
export const commitRequestSchema = z.object({
  publishId: z.string().uuid(),
  html: z.string().max(C.maxCodeBytes),
  css: z.string().max(C.maxCodeBytes),
  javascript: z.string().max(C.maxCodeBytes),
  // Same list, same order as in prepare: paths are derived from it deterministically.
  assets: z.array(z.object({ id: assetId, name: assetName })).max(C.maxAssets),
});

export type PrepareRequestDto = z.infer<typeof prepareRequestSchema>;
export type CommitRequestDto = z.infer<typeof commitRequestSchema>;

// ── responses ─────────────────────────────────────────────────────────────

export interface PrepareResponseDto {
  bucket: string;
  publishId: string;
  uploads: {
    id: string; // the asset id from the request
    key: string; // where to upload in the bucket
    token: string; // signed upload token for that key
    contentType: string; // derived from the extension; pass it to the upload
  }[];
}

export interface CommitResponseDto {
  success: string;
  files: number;
  totalBytes: number;
}
