"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/code-editor";
import { ResultPanel } from "@/components/result-panel";
import { useTool } from "@/hooks/use-tool";
import type { AgentManifest } from "@stylus-skill/mcp-server/types";

export default function ManifestPage() {
  const [source, setSource] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { execute, data, loading, error } = useTool<
    { source_code: string; name?: string; description?: string },
    AgentManifest
  >("generate_agent_manifest");

  const manifestJson = data ? JSON.stringify(data, null, 2) : "";

  return (
    <div className="max-w-6xl space-y-4">
      <h2 className="text-xl font-bold">Agent Manifest (ERC-8004)</h2>
      <p className="text-sm text-muted-foreground">
        Generate an agent manifest JSON from your contract for the agent economy.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <CodeEditor value={source} onChange={setSource} />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Manifest name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={() =>
              execute({
                source_code: source,
                ...(name && { name }),
                ...(description && { description }),
              })
            }
            disabled={loading || !source.trim()}
          >
            {loading ? "Generating..." : "Generate Manifest"}
          </Button>
        </div>

        <ResultPanel title="Agent Manifest JSON" loading={loading} error={error}>
          {data ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {data.abi.length} function(s) in ABI
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(manifestJson)}
                >
                  Copy JSON
                </Button>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[500px] whitespace-pre-wrap">
                {manifestJson}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Manifest will appear here after generation.
            </p>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
