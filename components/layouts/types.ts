export type FileType = "html" | "css" | "javascript";

export type ProjectFiles = {
  html: string;
  css: string;
  javascript: string;
};

export type ProjectAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  // Temporary URL usable by the iframe
  dataUrl: string;
};
