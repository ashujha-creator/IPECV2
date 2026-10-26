import { randomUUID } from "node:crypto";
import { PLAYGROUND_CONFIG as C } from "@/lib/playground/config";
import { HttpError } from "@/lib/playground/error";
import { allocateAssetPaths } from "@/lib/playground/assets";
import { buildCodeFiles } from "@/lib/playground/site-builder";
import type {
  CommitRequestDto,
  PrepareRequestDto,
  PrepareResponseDto,
} from "@/lib/playground/dto/publish.dto";
import type { PlaygroundRepository } from "@/lib/playground/repositories/playground.repository";
import type { StorageRepository } from "@/lib/playground/repositories/storage.repository";

// Every publish gets its own immutable folder, so there is no cross-user sharing of bytes
// and a half-finished publish can never overwrite what visitors are looking at.
const storageKey = (playgroundId: string, publishId: string, path: string) =>
  `playgrounds/${playgroundId}/${publishId}/${path}`;

const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

export interface PublishResult {
  slug: string;
  files: number;
  totalBytes: number;
  staleKeys: string[]; // objects from the previous version, safe to delete now
}

/**
 * Publishing is two small JSON calls around a direct browser -> Storage upload:
 *   prepare  validate the file list, hand out signed upload tokens
 *   (browser uploads the assets straight to Storage; our server never sees those bytes)
 *   commit   verify what landed, build + upload the code files, swap the DB rows
 */
export class PublishService {
  constructor(
    private readonly playgrounds: PlaygroundRepository,
    private readonly storage: StorageRepository,
  ) {}

  async prepare(
    userId: string,
    playgroundId: string,
    dto: PrepareRequestDto,
  ): Promise<PrepareResponseDto> {
    const playground = await this.requirePublishable(playgroundId, userId);
    const assets = allocateAssetPaths(dto.assets);

    // Sizes are the client's claim (commit re-checks the real ones), but failing here is cheaper.
    const tooBig = dto.assets.find((a) => a.size > C.maxAssetBytes);
    if (tooBig)
      throw new HttpError(413, `"${tooBig.name}" is larger than 5 MB.`);
    const claimed = dto.assets.reduce((sum, a) => sum + a.size, 0);
    if (claimed > C.maxTotalBytes) {
      throw new HttpError(
        413,
        "Total size exceeds the playground's 50 MB limit.",
      );
    }

    const publishId = randomUUID();
    const keys = assets.map((a) =>
      storageKey(playground.id, publishId, a.path),
    );
    const tokens = await this.storage.createUploadTokens(keys);

    return {
      bucket: C.bucket,
      publishId,
      uploads: assets.map((a, i) => ({
        id: a.id,
        key: keys[i],
        token: tokens[i],
        contentType: a.contentType,
      })),
    };
  }

  async commit(
    userId: string,
    playgroundId: string,
    dto: CommitRequestDto,
  ): Promise<PublishResult> {
    const playground = await this.requirePublishable(playgroundId, userId);
    const assets = allocateAssetPaths(dto.assets);
    const keyOf = (path: string) =>
      storageKey(playground.id, dto.publishId, path);

    // 1. Cheap local work first: build and validate the three code files.
    const code = buildCodeFiles({
      html: dto.html,
      css: dto.css,
      javascript: dto.javascript,
      title: playground.title ?? "Playground",
      pathById: new Map(assets.map((a) => [a.id, a.path])),
    });

    // 2. Confirm the browser really uploaded every asset, and measure the real sizes.
    const assetKeys = assets.map((a) => keyOf(a.path));
    const stored = await this.storage.listSizes(keyOf("assets"));

    let assetBytes = 0;
    for (const asset of assets) {
      const size = stored.get(baseName(asset.path));
      if (size === undefined) {
        throw new HttpError(400, `"${asset.name}" was not uploaded.`);
      }
      if (size > C.maxAssetBytes) {
        await this.storage.remove(assetKeys);
        throw new HttpError(413, `"${asset.name}" is larger than 5 MB.`);
      }
      assetBytes += size;
    }

    const totalBytes =
      assetBytes + code.reduce((sum, file) => sum + file.data.length, 0);
    if (totalBytes > C.maxTotalBytes) {
      await this.storage.remove(assetKeys);
      throw new HttpError(
        413,
        "Total size exceeds the playground's 50 MB limit.",
      );
    }

    // 3. Code files are tiny (<= 3 MB total), so the server uploads them itself.
    await Promise.all(
      code.map((f) => this.storage.put(keyOf(f.path), f.data, f.contentType)),
    );

    // 4. Bytes are in Storage; now one transaction points the DB at them.
    const files = [...code, ...assets].map((f) => ({
      path: f.path,
      contentType: f.contentType,
      storageKey: keyOf(f.path),
    }));
    const replacedKeys = await this.playgrounds.replacePublishedFiles(
      playground.id,
      {
        files,
        totalBytes,
        publishedAt: playground.publishedAt ?? new Date(),
      },
    );

    // A retried commit replaces rows with identical keys: never delete what we just wrote.
    const current = new Set(files.map((f) => f.storageKey));
    return {
      slug: playground.slug,
      files: files.length,
      totalBytes,
      staleKeys: replacedKeys.filter((key) => !current.has(key)),
    };
  }

  /** Called after the response is sent (see the commit route). */
  deleteObjects(keys: string[]): Promise<void> {
    return this.storage.remove(keys);
  }

  private async requirePublishable(playgroundId: string, userId: string) {
    const playground = await this.playgrounds.findOwned(playgroundId, userId);
    if (!playground) throw new HttpError(404, "Playground not found.");
    if (playground.status === "ARCHIVED") {
      throw new HttpError(409, "Archived playgrounds can't be published.");
    }
    return playground;
  }
}
