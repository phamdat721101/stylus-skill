"use client";

import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
}

export function CodeEditor({
  value,
  onChange,
  placeholder = "Paste your Rust contract code here...",
  readOnly = false,
  rows = 20,
}: CodeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      className="font-mono text-sm resize-y min-h-[200px]"
    />
  );
}
