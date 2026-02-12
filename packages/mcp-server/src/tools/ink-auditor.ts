import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuditResult } from "../types.js";
import { INK_PATTERNS } from "../knowledge/ink-patterns.js";

export function analyzeInkUsage(sourceCode: string): AuditResult {
  const lines = sourceCode.split("\n");
  const findings: AuditResult["findings"] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comment lines
    if (/^\s*\/\//.test(line)) continue;

    for (const pattern of INK_PATTERNS) {
      if (pattern.pattern.test(line)) {
        findings.push({
          patternId: pattern.id,
          severity: pattern.severity,
          title: pattern.title,
          suggestion: pattern.suggestion,
          line: i + 1,
          code: line.trim(),
        });
      }
    }
  }

  const summary = { high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    summary[f.severity]++;
  }

  return { findings, summary };
}

export function registerInkAuditor(server: McpServer): void {
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
}
