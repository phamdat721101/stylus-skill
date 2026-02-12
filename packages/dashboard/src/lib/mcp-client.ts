import { analyzeInkUsage } from "@stylus-skill/mcp-server/tools/ink-auditor";
import { generateMotsuTests } from "@stylus-skill/mcp-server/tools/motsu-generator";
import { generateAgentManifest } from "@stylus-skill/mcp-server/tools/agent-manifest";

export type ToolName =
  | "analyze_ink_usage"
  | "generate_motsu_tests"
  | "generate_agent_manifest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toolMap: Record<ToolName, (input: any) => any> = {
  analyze_ink_usage: (input: { source_code: string }) =>
    analyzeInkUsage(input.source_code),
  generate_motsu_tests: (input: { source_code: string }) =>
    generateMotsuTests(input.source_code),
  generate_agent_manifest: (input: {
    source_code: string;
    name?: string;
    description?: string;
    version?: string;
  }) =>
    generateAgentManifest(
      input.source_code,
      input.name,
      input.description,
      input.version
    ),
};

export function callTool(toolName: string, input: unknown): unknown {
  const fn = toolMap[toolName as ToolName];
  if (!fn) throw new Error(`Unknown tool: ${toolName}`);
  return fn(input);
}
