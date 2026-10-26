"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  language: "html" | "css" | "javascript";
  value: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({
  language,
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value ?? "")}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        lineNumbers: "on",
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
        padding: {
          top: 12,
        },
      }}
    />
  );
}
