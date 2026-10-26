import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYGROUND_CONFIG as C } from "@/lib/playground/config";
import { HttpError } from "@/lib/playground/error";
import { mapLimit } from "@/lib/playground/map-limit";

/** Everything that talks to Supabase Storage lives here; nothing else imports the client. */
export class StorageRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket: string,
  ) {}

  private get files() {
    return this.client.storage.from(this.bucket);
  }

  /** One signed upload token per key, so the browser can upload straight to Storage. */
  createUploadTokens(keys: string[]): Promise<string[]> {
    return mapLimit(keys, C.concurrency, async (key) => {
      const { data, error } = await this.files.createSignedUploadUrl(key);
      if (error || !data) {
        console.error("[storage] createSignedUploadUrl failed", key, error);
        throw new HttpError(502, "Could not prepare the upload.");
      }
      return data.token;
    });
  }

  /** Object name -> size in bytes for everything directly inside `folder`. */
  async listSizes(folder: string): Promise<Map<string, number>> {
    const { data, error } = await this.files.list(folder, { limit: 100 });
    if (error) {
      console.error("[storage] list failed", folder, error);
      throw new HttpError(502, "Could not verify the uploaded files.");
    }
    const sizes = new Map<string, number>();
    for (const object of data ?? []) {
      const size = object.metadata?.size;
      if (typeof size === "number") sizes.set(object.name, size);
    }
    return sizes;
  }

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    const { error } = await this.files.upload(key, data, {
      contentType,
      cacheControl: "31536000", // keys contain the publishId, so the bytes never change
      upsert: true, // makes a retried commit idempotent
    });
    if (error) {
      console.error("[storage] upload failed", key, error);
      throw new HttpError(502, "Failed to upload files to storage.");
    }
  }

  /** Best effort: leftovers are harmless and get swept up later. */
  async remove(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const { error } = await this.files.remove(keys);
    if (error) console.error("[storage] remove failed", error);
  }
}
