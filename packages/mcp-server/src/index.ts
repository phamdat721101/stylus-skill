#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyzeInkUsage } from "./tools/ink-auditor.ts";
import { generateMotsuTests } from "./tools/motsu-generator.ts";
import { generateAgentManifest } from "./tools/agent-manifest.ts";
import { registerScaffold } from "./tools/scaffold.ts";

const server = new McpServer({
  name: "stylus-architect",
  version: "0.1.0",
});

server.tool(
  "analyze_ink_usage",
  "Analyze a Stylus Rust contract for expensive Ink (WASM gas) patterns and suggest optimizations",
  { source_code: z.string().describe("Rust source code of a Stylus contract") },
  async ({ source_code }) => {
    const result = analyzeInkUsage(source_code);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "generate_motsu_tests",
  "Generate Motsu framework unit tests for a Stylus Rust smart contract",
  { source_code: z.string().describe("Rust source code of a Stylus contract") },
  async ({ source_code }) => {
    const result = generateMotsuTests(source_code);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "generate_agent_manifest",
  "Generate an ERC-8004 Agent Manifest JSON from a Stylus Rust contract",
  {
    source_code: z.string().describe("Rust source code of a Stylus contract"),
    name: z.string().optional().describe("Override manifest name"),
    description: z.string().optional().describe("Override manifest description"),
    version: z.string().optional().describe("Override manifest version"),
  },
  async ({ source_code, name, description, version }) => {
    const result = generateAgentManifest(source_code, name, description, version);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

registerScaffold(server);

const transport = new StdioServerTransport();
await server.connect(transport);
