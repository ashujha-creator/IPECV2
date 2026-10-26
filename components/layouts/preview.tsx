"use client";

type PreviewProps = {
  srcDoc: string;
};

export default function Preview({ srcDoc }: PreviewProps) {
  return (
    <iframe
      title="Code Preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-white"
    />
  );
}
