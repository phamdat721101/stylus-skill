#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerInkAuditor } from "./tools/ink-auditor.js";
import { registerMotsuGenerator } from "./tools/motsu-generator.js";
import { registerAgentManifest } from "./tools/agent-manifest.js";
import { registerScaffold } from "./tools/scaffold.js";

const server = new McpServer({
  name: "stylus-architect",
  version: "0.1.0",
});

registerInkAuditor(server);
registerMotsuGenerator(server);
registerAgentManifest(server);
registerScaffold(server);

const transport = new StdioServerTransport();
await server.connect(transport);
