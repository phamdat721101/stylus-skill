import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AgentManifest, ManifestFunction } from "../types.js";
import { parseRustContract } from "../utils/rust-parser.js";

const RUST_TO_SOLIDITY: Record<string, string> = {
  U256: "uint256",
  U128: "uint128",
  U64: "uint64",
  u8: "uint8",
  u16: "uint16",
  u32: "uint32",
  u64: "uint64",
  bool: "bool",
  Address: "address",
  String: "string",
  "Vec<u8>": "bytes",
};

function mapType(rustType: string): string {
  const trimmed = rustType.trim();
  // Handle [u8; N] → bytesN (must check before generic lookup)
  const fixedBytes = trimmed.match(/\[u8;\s*(\d+)\]/);
  if (fixedBytes) {
    const n = parseInt(fixedBytes[1], 10);
    return n <= 32 ? `bytes${n}` : "bytes";
  }
  for (const [rust, sol] of Object.entries(RUST_TO_SOLIDITY)) {
    if (trimmed.includes(rust)) return sol;
  }
  return "bytes";
}

function mapReturnType(returnType: string): { name: string; type: string }[] {
  const trimmed = returnType.trim();

  // Result<(), Vec<u8>> → no meaningful output
  if (/Result\s*<\s*\(\)\s*,/.test(trimmed)) {
    return [];
  }

  // Result<SomeType, Vec<u8>> → extract SomeType
  const resultMatch = trimmed.match(/Result\s*<\s*(.+?)\s*,/);
  if (resultMatch) {
    return [{ name: "value", type: mapType(resultMatch[1]) }];
  }

  if (trimmed === "()" || trimmed === "") return [];

  return [{ name: "value", type: mapType(trimmed) }];
}

export function generateAgentManifest(
  sourceCode: string,
  name?: string,
  description?: string,
  version?: string
): AgentManifest {
  const contract = parseRustContract(sourceCode);

  const abi: ManifestFunction[] = contract.functions.map((fn) => ({
    name: fn.name,
    description: `Calls ${fn.name} on the ${contract.name} contract`,
    inputs: fn.params.map((p) => ({ name: p.name, type: mapType(p.type) })),
    outputs: mapReturnType(fn.returnType),
    stateMutability: fn.isMut ? "nonpayable" : "view",
  }));

  return {
    schema: "erc-8004-v1",
    name: name ?? contract.name,
    description: description ?? `Agent manifest for the ${contract.name} Stylus contract`,
    version: version ?? "0.1.0",
    abi,
  };
}

export function registerAgentManifest(server: McpServer): void {
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
}
