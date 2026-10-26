import { ASSET_TYPES } from "@/lib/playground/config";
import { HttpError } from "@/lib/playground/error";

export interface AllocatedAsset {
  id: string;
  name: string; // what the user called it
  path: string; // where it lives in the site: assets/<safe-name>.<ext>
  contentType: string;
}

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

/**
 * Deterministic: the same list in the same order always yields the same paths.
 * prepare and commit both call this, so the server never has to remember what it handed out.
 */
export function allocateAssetPaths(
  assets: ReadonlyArray<{ id: string; name: string }>,
): AllocatedAsset[] {
  const ids = new Set<string>();
  const usedPaths = new Set<string>();

  return assets.map(({ id, name }) => {
    if (ids.has(id)) throw new HttpError(400, "Duplicate asset ids.");
    ids.add(id);

    const safe = toSafeAssetName(name);
    if (!safe)
      throw new HttpError(400, `"${name}" is not a supported file type.`);

    return {
      id,
      name,
      path: uniquePath(safe.base, safe.ext, usedPaths),
      contentType: ASSET_TYPES[safe.ext],
    };
  });
}
