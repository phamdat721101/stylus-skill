"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { ResultPanel } from "@/components/result-panel";
import { useTool } from "@/hooks/use-tool";
import type { TestGeneratorResult } from "@stylus-skill/mcp-server/types";

export default function TestsPage() {
  const [source, setSource] = useState("");
  const { execute, data, loading, error } = useTool<
    { source_code: string },
    TestGeneratorResult
  >("generate_motsu_tests");

  return (
    <div className="max-w-6xl space-y-4">
      <h2 className="text-xl font-bold">Motsu Test Generator</h2>
      <p className="text-sm text-muted-foreground">
        Generate Motsu framework unit tests from your contract.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <CodeEditor value={source} onChange={setSource} />
          <Button
            onClick={() => execute({ source_code: source })}
            disabled={loading || !source.trim()}
          >
            {loading ? "Generating..." : "Generate Tests"}
          </Button>
        </div>

        <ResultPanel title="Generated Tests" loading={loading} error={error}>
          {data ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {data.tests.length} test(s) generated
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(data.fullFile)}
                >
                  Copy All
                </Button>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[500px] whitespace-pre-wrap">
                {data.fullFile}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tests will appear here after generation.
            </p>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
