/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import CodeEditor from "./code-editor";
import Preview from "./preview";
import { FileType, ProjectFiles, ProjectAsset } from "./types";
import AssetsPanel from "./assets-pannel";
import { replaceAssetReferences } from "./asset-utils";
const initialFiles = {
  html: `<div class="card">
  <h1>Hello World</h1>
  <p>Edit the code and see the preview.</p>
</div>`,

  css: `
body {
  font-family: Arial, sans-serif;
  padding: 40px;
}

.card {
  padding: 24px;
  background: #f5f5f5;
  border-radius: 12px;
}

h1 {
  color: #2563eb;
}
`,

  javascript: `
console.log("Hello from JavaScript");
`,
};
import PublishDialog from "./publish-dialog";

export default function EditorLayout() {
  const [activeFile, setActiveFile] = useState<FileType>("html");
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [files, setFiles] = useState<ProjectFiles>(initialFiles);

  const updateFile = (file: FileType, value: string) => {
    setFiles((previous) => ({
      ...previous,
      [file]: value,
    }));
  };

  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [previewDocument, setPreviewDocument] = useState(() => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
  ${replaceAssetReferences(files.css, assets)}
  </style>
</head>

<body>
 ${replaceAssetReferences(files.html, assets)}


  <script>
    ${files.javascript}
  </script>
</body>
</html>
`;
  });
  const [site, setSite] = useState<{ id: string; slug: string } | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<Date | null>(null);
  const addAssets = async (files: File[]) => {
    try {
      const newAssets: ProjectAsset[] = [];

      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);

        console.log("Asset loaded:", {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrlStart: dataUrl.substring(0, 50),
        });

        newAssets.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          file,
          dataUrl,
        });
      }

      setAssets((previous) => [...previous, ...newAssets]);
    } catch (error) {
      console.error("Failed to add assets:", error);
    }
  };

  const removeAsset = (assetId: string) => {
    setAssets((previous) => {
      const asset = previous.find((item) => item.id === assetId);

      if (asset) {
        URL.revokeObjectURL(asset.dataUrl);
      }

      return previous.filter((item) => item.id !== assetId);
    });
  };

  const createPreviewDocument = () => {
    const html = replaceAssetReferences(files.html, assets);

    const css = replaceAssetReferences(files.css, assets);

    const javascript = files.javascript;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <meta
    http-equiv="Content-Security-Policy"
    content="
      default-src 'none';
      img-src data: blob:;
      style-src 'unsafe-inline';
      script-src 'unsafe-inline';
      font-src data: blob:;
    "
  />

  <style>
    ${css}
  </style>
</head>

<body>
  ${html}

  <script>
    ${javascript}
  </script>
</body>
</html>
`;
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Could not convert file to Data URL"));
          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  };
  const insertAsset = (asset: ProjectAsset) => {
    const reference = `asset://${asset.id}`;

    setActiveFile("html");

    setFiles((previous) => ({
      ...previous,
      html:
        previous.html + `\n<img src="${reference}" alt="${asset.name}" />\n`,
    }));
  };

  const handleUpload = async () => {
    if (!site) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("html", files.html);
      formData.append("css", files.css);
      formData.append("javascript", files.javascript);
      formData.append(
        "assetMeta",
        JSON.stringify(
          assets.map((asset) => ({ id: asset.id, name: asset.name })),
        ),
      );

      for (const asset of assets) {
        formData.append("assets", asset.file, asset.name);
      }

      const response = await fetch(`/api/playgrounds/${site.id}/publish`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.error ?? "Failed to upload.");
        return;
      }

      setLastPublishedAt(new Date());
    } catch {
      setUploadError("Failed to upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const runPreview = () => {
    setPreviewDocument(createPreviewDocument());
  };

  useEffect(() => {
    setPreviewDocument(createPreviewDocument());
  }, []);

  useEffect(() => {
    if (!isPreviewMaximized) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewMaximized(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMaximized]);

  const resetProject = () => {
    setFiles(initialFiles);

    setPreviewDocument(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <style>
    ${initialFiles.css}
  </style>
</head>

<body>
  ${initialFiles.html}

  <script>
    ${initialFiles.javascript}
  </script>
</body>
</html>
`);
  };

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      {site && <span className="text-xs text-gray-400">/p/{site.slug}</span>}
      {/* Top toolbar */}
      <div className="flex h-12 shrink-0 items-center border-b border-gray-700 bg-[#252526]">
        <button
          type="button"
          onClick={() => setActiveFile("html")}
          className={`h-full px-5 text-sm ${
            activeFile === "html" ? "bg-[#1e1e1e] text-white" : "text-gray-400"
          }`}
        >
          HTML
        </button>

        <button
          type="button"
          onClick={() => setActiveFile("css")}
          className={`h-full px-5 text-sm ${
            activeFile === "css" ? "bg-[#1e1e1e] text-white" : "text-gray-400"
          }`}
        >
          CSS
        </button>

        <button
          type="button"
          onClick={() => setActiveFile("javascript")}
          className={`h-full px-5 text-sm ${
            activeFile === "javascript"
              ? "bg-[#1e1e1e] text-white"
              : "text-gray-400"
          }`}
        >
          JavaScript
        </button>

        <button
          type="button"
          onClick={resetProject}
          className="rounded bg-gray-700 px-4 py-1.5 text-sm text-gray-200 hover:bg-gray-600"
        >
          Reset
        </button>

        <div className="ml-auto flex items-center gap-2 px-3">
          <button
            type="button"
            onClick={runPreview}
            className="rounded bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700"
          >
            Run
          </button>
          <button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            disabled={site !== null}
            className="rounded bg-purple-600 px-4 py-1.5 text-sm text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {site ? "Slug reserved" : "Publish"}
          </button>

          {site && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Uploading…"
                : lastPublishedAt
                  ? "Re-upload"
                  : "Upload"}
            </button>
          )}

          {lastPublishedAt && !isUploading && (
            <span className="text-[11px] text-gray-500">
              Published {lastPublishedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      {uploadError && (
        <div className="border-b border-gray-700 bg-red-950/40 px-3 py-1 text-xs text-red-400">
          {uploadError}
        </div>
      )}

      {isPublishOpen && (
        <PublishDialog
          onClose={() => setIsPublishOpen(false)}
          onCreated={(created) => {
            setSite(created);
            setIsPublishOpen(false);
          }}
        />
      )}

      {/* Main workspace */}
      <div className="flex min-h-0 flex-1">
        <div className="w-56 shrink-0 border-r border-gray-700">
          <AssetsPanel
            assets={assets}
            onAddAssets={addAssets}
            onRemoveAsset={removeAsset}
            onInsertAsset={insertAsset}
          />
        </div>
        {/* Code panel */}
        <div className="w-1/2 min-w-0 border-r border-gray-700">
          <CodeEditor
            language={activeFile}
            value={files[activeFile]}
            onChange={(value) => updateFile(activeFile, value)}
          />
        </div>

        {/* Preview panel */}
        <div
          className={
            isPreviewMaximized
              ? "fixed inset-0 z-50 bg-white"
              : "w-1/2 min-w-0 bg-white"
          }
        >
          <div className="relative h-full w-full">
            <button
              type="button"
              onClick={() => setIsPreviewMaximized((prev) => !prev)}
              title={
                isPreviewMaximized
                  ? "Exit fullscreen (Esc)"
                  : "Maximize preview"
              }
              className="absolute right-2 top-2 z-10 rounded bg-gray-800/80 px-2 py-1 text-xs text-white hover:bg-gray-800"
            >
              {isPreviewMaximized ? "✕ Exit" : "⛶ Maximize"}
            </button>

            <Preview srcDoc={previewDocument} />
          </div>
        </div>
      </div>
    </div>
  );
}
