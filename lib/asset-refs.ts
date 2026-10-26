export function applyAssetUrls(
  source: string,
  urlById: Record<string, string>,
) {
  let result = source;

  for (const [id, url] of Object.entries(urlById)) {
    const reference = `asset://${id}`;
    result = result.split(reference).join(url);
  }

  return result;
}
