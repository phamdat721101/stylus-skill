"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { ResultPanel } from "@/components/result-panel";
import { SeverityBadge } from "@/components/severity-badge";
import { useTool } from "@/hooks/use-tool";
import type { AuditResult } from "@stylus-skill/mcp-server/types";

export default function AuditorPage() {
  const [source, setSource] = useState("");
  const { execute, data, loading, error } = useTool<
    { source_code: string },
    AuditResult
  >("analyze_ink_usage");

  return (
    <div className="max-w-6xl space-y-4">
      <h2 className="text-xl font-bold">Ink Auditor</h2>
      <p className="text-sm text-muted-foreground">
        Paste your Stylus contract to scan for expensive Ink (WASM gas) patterns.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <CodeEditor value={source} onChange={setSource} />
          <Button
            onClick={() => execute({ source_code: source })}
            disabled={loading || !source.trim()}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        <ResultPanel title="Audit Results" loading={loading} error={error}>
          {data ? (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-destructive font-medium">
                  High: {data.summary.high}
                </span>
                <span className="text-muted-foreground font-medium">
                  Medium: {data.summary.medium}
                </span>
                <span className="font-medium">Low: {data.summary.low}</span>
              </div>

              {data.findings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No issues found. Your contract looks efficient!
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.findings.map((f, i) => (
                    <li key={i} className="border rounded-md p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={f.severity} />
                        <span className="text-sm font-medium">{f.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Line {f.line}
                        </span>
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {f.code}
                      </pre>
                      <p className="text-xs text-muted-foreground">{f.suggestion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Results will appear here after analysis.
            </p>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
