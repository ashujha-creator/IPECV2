import { PLAYGROUND_CONFIG as C } from "@/lib/playground/config";
import { HttpError } from "@/lib/playground/error";

export interface BuiltFile {
  path: string;
  contentType: string;
  data: Buffer;
}

// Browsers normalise form text to CRLF; normalise back so output is stable.
const normalizeNewlines = (s: string) => s.replace(/\r\n?/g, "\n");

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** The editor sends the HTML pane as a body fragment, so wrap it in a real document. */
function wrapDocument(bodyHtml: string, title: string) {
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

/** asset://<id> -> assets/<name>. Unknown ids are collected so the publish can be rejected. */
function rewriteAssetRefs(
  source: string,
  pathById: ReadonlyMap<string, string>,
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

/** Turns the editor's three panes into index.html, style.css and script.js. */
export function buildCodeFiles(input: {
  html: string;
  css: string;
  javascript: string;
  title: string;
  pathById: ReadonlyMap<string, string>;
}): BuiltFile[] {
  const unresolved = new Set<string>();
  const rewrite = (source: string) =>
    rewriteAssetRefs(normalizeNewlines(source), input.pathById, unresolved);

  const sources = [
    {
      path: "index.html",
      contentType: "text/html",
      text: wrapDocument(rewrite(input.html), input.title),
    },
    { path: "style.css", contentType: "text/css", text: rewrite(input.css) },
    {
      path: "script.js",
      contentType: "text/javascript",
      text: rewrite(input.javascript),
    },
  ];

  if (unresolved.size > 0) {
    throw new HttpError(
      400,
      "Your code references assets that weren't uploaded. Remove or re-add them and try again.",
    );
  }

  return sources.map(({ text, ...file }) => {
    const data = Buffer.from(text, "utf-8");
    if (data.length > C.maxCodeBytes) {
      throw new HttpError(413, `${file.path} is larger than 1 MB.`);
    }
    return { ...file, data };
  });
}
