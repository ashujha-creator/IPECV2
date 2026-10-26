const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "app",
  "www",
  "editor",
  "dashboard",
  "login",
  "signup",
  "settings",
  "playgrounds",
  "render",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

const MIN_LENGTH = 3;
const MAX_LENGTH = 63;

export type SlugValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateSlugFormat(slug: string): SlugValidationResult {
  if (slug.length < MIN_LENGTH) {
    return {
      valid: false,
      reason: `Slug must be at least ${MIN_LENGTH} characters.`,
    };
  }
  if (slug.length > MAX_LENGTH) {
    return {
      valid: false,
      reason: `Slug must be at most ${MAX_LENGTH} characters.`,
    };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      reason:
        "Use lowercase letters, numbers, and single hyphens only (no leading, trailing, or double hyphens).",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, reason: "This slug is reserved." };
  }
  return { valid: true };
}
