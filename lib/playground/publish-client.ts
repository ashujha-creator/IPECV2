// Browser-side helper: prepare -> upload straight to Storage -> commit.
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYGROUND_CONFIG } from "@/lib/playground/config";
import { mapLimit } from "@/lib/playground/map-limit";
import type {
  CommitResponseDto,
  PrepareResponseDto,
} from "@/lib/playground/dto/publish.dto";

export interface PublishInput {
  supabase: SupabaseClient; // your browser Supabase client (anon key is fine)
  playgroundId: string;
  html: string;
  css: string;
  javascript: string;
  assets: { id: string; name: string; file: File }[];
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Publish failed.");
  return json as T;
}

export async function publishPlayground(
  input: PublishInput,
): Promise<CommitResponseDto> {
  const { supabase, playgroundId, html, css, javascript, assets } = input;
  const base = `/api/playgrounds/${playgroundId}/publish`;

  // Same list, same order in both calls: the server derives the file paths from it.
  const meta = assets.map(({ id, name }) => ({ id, name }));

  const prepared = await postJson<PrepareResponseDto>(`${base}/prepare`, {
    assets: assets.map(({ id, name, file }) => ({ id, name, size: file.size })),
  });

  const fileById = new Map(assets.map((a) => [a.id, a.file]));
  await mapLimit(prepared.uploads, PLAYGROUND_CONFIG.concurrency, async (u) => {
    const file = fileById.get(u.id);
    if (!file) throw new Error(`Missing file for asset ${u.id}.`);

    const { error } = await supabase.storage
      .from(prepared.bucket)
      .uploadToSignedUrl(u.key, u.token, file, { contentType: u.contentType });
    if (error) throw new Error(`Upload failed: ${error.message}`);
  });

  return postJson<CommitResponseDto>(`${base}/commit`, {
    publishId: prepared.publishId,
    html,
    css,
    javascript,
    assets: meta,
  });
}
