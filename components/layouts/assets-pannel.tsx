"use client";

import { ChangeEvent, useRef } from "react";
import { ProjectAsset } from "./types";

type AssetsPanelProps = {
  assets: ProjectAsset[];
  onAddAssets: (files: File[]) => void;
  onRemoveAsset: (assetId: string) => void;
  onInsertAsset: (asset: ProjectAsset) => void;
};

export default function AssetsPanel({
  assets,
  onAddAssets,
  onRemoveAsset,
  onInsertAsset,
}: AssetsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onAddAssets(files);
    }

    event.target.value = "";
  };

  return (
    <div className="flex h-full flex-col bg-[#252526] text-white">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 px-3">
        <span className="text-sm font-medium">Assets</span>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-700"
        >
          Upload
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </div>

      {/* Asset list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {assets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-gray-500">
            <div>
              <p>No assets yet.</p>
              <p className="mt-1">Upload images or files.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group rounded p-2 hover:bg-[#2d2d2d]"
              >
                <div className="flex items-center gap-2">
                  {asset.type.startsWith("image/") ? (
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-700 text-xs">
                      FILE
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{asset.name}</p>

                    <p className="text-[10px] text-gray-500">
                      {formatFileSize(asset.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveAsset(asset.id)}
                    className="text-xs text-red-400"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => onInsertAsset(asset)}
                    className="flex-1 rounded bg-blue-600 px-2 py-1 text-[11px] hover:bg-blue-700"
                  >
                    Insert
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(`asset://${asset.id}`)
                    }
                    className="rounded bg-gray-700 px-2 py-1 text-[11px] hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
