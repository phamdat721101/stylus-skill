"use client";

import { useState, useCallback } from "react";

export function useTool<TInput, TOutput>(toolName: string) {
  const [data, setData] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (input: TInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: toolName, input }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const result = (await res.json()) as TOutput;
        setData(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toolName]
  );

  return { execute, data, loading, error };
}
