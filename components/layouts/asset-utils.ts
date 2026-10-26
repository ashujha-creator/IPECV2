import { ProjectAsset } from "./types";

export function replaceAssetReferences(source: string, assets: ProjectAsset[]) {
  let result = source;

  for (const asset of assets) {
    const reference = `asset://${asset.id}`;

    result = result.split(reference).join(asset.dataUrl);
  }

  return result;
}
