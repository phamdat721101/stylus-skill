import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(__dirname, "../../../../scripts/scaffold.sh");

export function scaffoldProject(projectName: string, cwd?: string): string {
  const output = execSync(`bash "${SCRIPT_PATH}" "${projectName}"`, {
    encoding: "utf-8",
    cwd: cwd ?? process.cwd(),
    timeout: 30_000,
  });
  return output;
}

export function registerScaffold(server: McpServer): void {
  server.tool(
    "scaffold_stylus_project",
    "Scaffold a new Arbitrum Stylus project with the Counter contract template",
    {
      project_name: z.string().describe("Name of the new Stylus project"),
    },
    async ({ project_name }) => {
      const output = scaffoldProject(project_name);
      return {
        content: [{ type: "text" as const, text: output }],
      };
    }
  );
}
