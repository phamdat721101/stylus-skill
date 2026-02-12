"use client";

import { useState, useCallback } from "react";
import { AbiCoder } from "ethers";
import type { IntentResult, AgentManifest } from "@stylus-skill/mcp-server/types";

const abiCoder = AbiCoder.defaultAbiCoder();

function matchIntent(
  query: string,
  manifest: AgentManifest
): IntentResult {
  const q = query.toLowerCase().trim();

  for (const fn of manifest.abi) {
    const keywords = fn.name.replace(/_/g, " ").toLowerCase().split(" ");
    const matchScore = keywords.filter((kw) => q.includes(kw)).length;

    if (matchScore >= 1) {
      // Extract numbers from query as potential args
      const numbers = q.match(/\d+/g) ?? [];
      const args = numbers.slice(0, fn.inputs.length);

      let calldata: string | undefined;
      if (fn.inputs.length > 0 && args.length > 0) {
        try {
          const types = fn.inputs.map((i) => i.type);
          const values = fn.inputs.map((input, idx) => {
            const raw = args[idx] ?? "0";
            if (input.type.startsWith("uint") || input.type.startsWith("int")) {
              return BigInt(raw);
            }
            return raw;
          });
          calldata = abiCoder.encode(types, values);
        } catch {
          // Encoding failed, return without calldata
        }
      }

      return {
        matched: true,
        functionName: fn.name,
        args,
        calldata,
      };
    }
  }

  return { matched: false };
}

export function useAgentIntent(manifest: AgentManifest | null) {
  const [result, setResult] = useState<IntentResult | null>(null);

  const resolve = useCallback(
    (query: string) => {
      if (!manifest) {
        setResult({ matched: false });
        return { matched: false } as IntentResult;
      }
      const r = matchIntent(query, manifest);
      setResult(r);
      return r;
    },
    [manifest]
  );

  return { resolve, result };
}
