export const PLAYGROUND_CONFIG = {
  bucket: "page-media",
  maxAssetBytes: 5 * 1024 * 1024, // per asset
  maxCodeBytes: 1 * 1024 * 1024, // per html/css/js file
  maxTotalBytes: 50 * 1024 * 1024, // per playground
  maxAssets: 50,
  concurrency: 8, // parallel Storage calls (token creation on the server, uploads in the browser)

  // Vercel rejects request bodies over 4.5 MB, so both routes only ever take small JSON.
  // Assets never pass through the server: the browser uploads them straight to Storage.
  prepareBodyLimit: 64 * 1024,
  commitBodyLimit: 4 * 1024 * 1024, // 3 code files (<= 1 MB each) + JSON overhead
} as const;

// Content types come from the extension, never from the client's File.type.
// Keep this list in sync with allowed_mime_types in page-media-setup.sql.
export const ASSET_TYPES: Readonly<Record<string, string>> = {
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
