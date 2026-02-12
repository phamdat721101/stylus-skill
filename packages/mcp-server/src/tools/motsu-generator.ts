import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TestGeneratorResult } from "../types.js";
import { parseRustContract } from "../utils/rust-parser.js";
import {
  TEST_SCENARIOS,
  generateTestHeader,
  generateTestFooter,
} from "../knowledge/motsu-templates.js";

export function generateMotsuTests(sourceCode: string): TestGeneratorResult {
  const contract = parseRustContract(sourceCode);
  const header = generateTestHeader(contract.name);
  const tests: TestGeneratorResult["tests"] = [];

  for (const fn of contract.functions) {
    for (const scenario of TEST_SCENARIOS) {
      const code = scenario.templateFn(contract.name, fn);
      if (code) {
        tests.push({ scenario: scenario.label, code });
      }
    }
  }

  const fullFile = [
    header,
    ...tests.map((t) => t.code),
    "",
    generateTestFooter(),
  ].join("\n");

  return { header, tests, fullFile };
}

export function registerMotsuGenerator(server: McpServer): void {
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
}
