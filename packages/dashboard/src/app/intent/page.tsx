"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/code-editor";
import { ResultPanel } from "@/components/result-panel";
import { useTool } from "@/hooks/use-tool";
import { useAgentIntent } from "@/hooks/use-agent-intent";
import { Badge } from "@/components/ui/badge";
import type { AgentManifest } from "@stylus-skill/mcp-server/types";

export default function IntentPage() {
  const [source, setSource] = useState("");
  const [query, setQuery] = useState("");
  const { execute, data: manifest, loading, error } = useTool<
    { source_code: string },
    AgentManifest
  >("generate_agent_manifest");
  const { resolve, result } = useAgentIntent(manifest);

  return (
    <div className="max-w-6xl space-y-4">
      <h2 className="text-xl font-bold">Intent Hook</h2>
      <p className="text-sm text-muted-foreground">
        First generate a manifest from your contract, then type a natural language
        intent to resolve it to ABI-encoded calldata.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <CodeEditor value={source} onChange={setSource} />
          <Button
            onClick={() => execute({ source_code: source })}
            disabled={loading || !source.trim()}
          >
            {loading ? "Generating Manifest..." : "1. Generate Manifest"}
          </Button>

          {manifest && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">
                Manifest loaded: {manifest.name} ({manifest.abi.length} functions)
              </p>
              <Input
                placeholder='e.g. "set the number to 100"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                onClick={() => resolve(query)}
                disabled={!query.trim()}
                variant="secondary"
              >
                2. Resolve Intent
              </Button>
            </div>
          )}
        </div>

        <ResultPanel title="Intent Result" loading={loading} error={error}>
          {result ? (
            result.matched ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>Matched</Badge>
                  <span className="text-sm font-mono">{result.functionName}</span>
                </div>
                {result.args && result.args.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Arguments:</p>
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(result.args, null, 2)}
                    </pre>
                  </div>
                )}
                {result.calldata && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      ABI-encoded calldata:
                    </p>
                    <pre className="text-xs bg-muted p-2 rounded break-all">
                      {result.calldata}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No matching function found. Try different wording.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              {manifest
                ? "Enter a natural language intent and click Resolve."
                : "Generate a manifest first, then resolve intents."}
            </p>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
