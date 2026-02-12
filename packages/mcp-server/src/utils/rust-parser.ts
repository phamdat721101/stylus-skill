import type { ContractInfo, RustFunction, StorageField } from "../types.js";

/**
 * Extract the contract name and storage fields from a `sol_storage! { ... }` block.
 */
export function extractStorageFields(source: string): {
  contractName: string;
  fields: StorageField[];
} {
  const lines = source.split("\n");
  let contractName = "";
  const fields: StorageField[] = [];

  // Find the sol_storage! block
  let inBlock = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inBlock && /sol_storage!\s*\{/.test(line)) {
      inBlock = true;
      braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      // Try to grab the struct name from this or next lines
      const structMatch = line.match(/pub\s+struct\s+(\w+)/);
      if (structMatch) {
        contractName = structMatch[1];
      }
      continue;
    }

    if (inBlock) {
      braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      if (!contractName) {
        const structMatch = line.match(/pub\s+struct\s+(\w+)/);
        if (structMatch) {
          contractName = structMatch[1];
          continue;
        }
      }

      // Match Solidity-style field declarations like `uint256 number;`
      const fieldMatch = line.match(/^\s+([\w<>,\s]+?)\s+(\w+)\s*;/);
      if (fieldMatch) {
        fields.push({
          type: fieldMatch[1].trim(),
          name: fieldMatch[2],
          line: i + 1,
        });
      }

      if (braceDepth <= 0) {
        inBlock = false;
      }
    }
  }

  // Fallback: detect #[storage] or #[entrypoint] followed by pub struct
  if (!contractName) {
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*#\[(storage|entrypoint)\]/.test(lines[i])) {
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const m = lines[j].match(/pub\s+struct\s+(\w+)/);
          if (m) { contractName = m[1]; break; }
        }
        if (contractName) break;
      }
    }
  }

  return { contractName, fields };
}

/**
 * Extract public functions from `#[external] impl ContractName { ... }`.
 */
export function extractFunctions(source: string): RustFunction[] {
  const lines = source.split("\n");
  const functions: RustFunction[] = [];

  let inExternalImpl = false;
  let braceDepth = 0;
  let currentFnLines: string[] = [];
  let fnStartLine = 0;
  let collectingFn = false;
  let fnBraceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect #[external] followed by impl
    if (/^\s*#\[(external|public)\]/.test(line)) {
      inExternalImpl = true;
      continue;
    }

    if (inExternalImpl && !collectingFn) {
      if (/^\s*impl\s+\w+/.test(line)) {
        braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        continue;
      }

      braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      if (braceDepth <= 0 && i > 0) {
        inExternalImpl = false;
        continue;
      }

      // Detect function start
      if (/pub\s+fn\s+/.test(line)) {
        collectingFn = true;
        currentFnLines = [line];
        fnStartLine = i + 1;
        fnBraceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

        if (fnBraceDepth <= 0) continue;
        // Single-line function unlikely, but handle it
        if (fnBraceDepth === 0 && line.includes("{") && line.includes("}")) {
          functions.push(parseFnBlock(currentFnLines.join("\n"), fnStartLine));
          collectingFn = false;
        }
        continue;
      }
    }

    if (collectingFn) {
      currentFnLines.push(line);
      fnBraceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      if (fnBraceDepth <= 0) {
        functions.push(parseFnBlock(currentFnLines.join("\n"), fnStartLine));
        collectingFn = false;
        currentFnLines = [];

        // Update outer brace depth
        braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      }
    }
  }

  return functions;
}

function parseFnBlock(block: string, line: number): RustFunction {
  const sigMatch = block.match(
    /pub\s+fn\s+(\w+)\s*\(\s*(&(?:mut\s+)?self)(?:\s*,\s*([\s\S]*?))?\)\s*(?:->\s*([\s\S]*?))?\s*\{/
  );

  const name = sigMatch?.[1] ?? "unknown";
  const isMut = sigMatch?.[2]?.includes("mut") ?? false;
  const rawParams = sigMatch?.[3]?.trim() ?? "";
  const returnType = sigMatch?.[4]?.trim() ?? "()";

  const params: { name: string; type: string }[] = [];
  if (rawParams) {
    for (const p of rawParams.split(",")) {
      const parts = p.trim().split(":");
      if (parts.length === 2) {
        params.push({ name: parts[0].trim(), type: parts[1].trim() });
      }
    }
  }

  // Extract body between first { and last }
  const bodyStart = block.indexOf("{");
  const bodyEnd = block.lastIndexOf("}");
  const body = bodyStart >= 0 && bodyEnd > bodyStart ? block.slice(bodyStart + 1, bodyEnd).trim() : "";

  return { name, params, returnType, isMut, line, body };
}

/**
 * Full parse: extracts contract name, storage fields, and external functions.
 */
export function parseRustContract(source: string): ContractInfo {
  const { contractName, fields } = extractStorageFields(source);
  const functions = extractFunctions(source);

  return {
    name: contractName || "UnknownContract",
    storageFields: fields,
    functions,
  };
}
