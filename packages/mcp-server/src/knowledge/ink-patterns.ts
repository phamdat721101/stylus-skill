import type { InkPattern } from "../types.js";

export const INK_PATTERNS: InkPattern[] = [
  {
    id: "string-in-storage",
    pattern: /\bString\b/,
    severity: "high",
    title: "String used in storage",
    suggestion:
      "Use `StorageString` from stylus-sdk instead. Heap-allocated String costs significantly more Ink for reads/writes.",
  },
  {
    id: "hashmap-in-storage",
    pattern: /\bHashMap\b|\bBTreeMap\b/,
    severity: "high",
    title: "HashMap/BTreeMap used instead of StorageMap",
    suggestion:
      "Use `StorageMap` via `sol_storage!` macro. Native Rust maps serialize the entire collection on each access, costing O(n) Ink.",
  },
  {
    id: "vec-in-storage",
    pattern: /\bVec\s*<(?!u8\s*>)/,
    severity: "high",
    title: "Vec used in storage",
    suggestion:
      "Use `StorageVec` from stylus-sdk. A standard Vec serializes entirely on each read/write, which is extremely expensive.",
  },
  {
    id: "clone-usage",
    pattern: /\.clone\(\)/,
    severity: "medium",
    title: "Unnecessary .clone() detected",
    suggestion:
      "Use references (&T) instead of cloning. Each clone allocates memory and copies data, increasing Ink cost.",
  },
  {
    id: "unbounded-iter",
    pattern: /\.iter\(\)[\s\S]{0,40}\.collect/,
    severity: "medium",
    title: "Unbounded iteration with .collect()",
    suggestion:
      "Add bounds with `.take(n)` before `.collect()`. Unbounded iteration can exhaust the Ink budget and revert.",
  },
  {
    id: "box-new",
    pattern: /Box::new\b/,
    severity: "medium",
    title: "Heap allocation via Box::new",
    suggestion:
      "Prefer stack-based alternatives. Heap allocations in WASM are costly and increase Ink usage.",
  },
  {
    id: "format-macro",
    pattern: /format!\s*\(/,
    severity: "low",
    title: "format!() macro used",
    suggestion:
      "Use fixed-size byte arrays or pre-computed values where possible. format! allocates and is expensive in WASM.",
  },
];
