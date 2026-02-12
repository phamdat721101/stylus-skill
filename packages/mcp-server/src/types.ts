// ── Parser output ──

export interface StorageField {
  name: string;
  type: string; // Solidity type as written in sol_storage!
  line: number;
}

export interface RustFunction {
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
  isMut: boolean;
  line: number;
  body: string;
}

export interface ContractInfo {
  name: string;
  storageFields: StorageField[];
  functions: RustFunction[];
}

// ── Ink Auditor ──

export type Severity = "high" | "medium" | "low";

export interface InkPattern {
  id: string;
  pattern: RegExp;
  severity: Severity;
  title: string;
  suggestion: string;
}

export interface AuditFinding {
  patternId: string;
  severity: Severity;
  title: string;
  suggestion: string;
  line: number;
  code: string;
}

export interface AuditResult {
  findings: AuditFinding[];
  summary: { high: number; medium: number; low: number };
}

// ── Motsu Test Generator ──

export interface TestScenario {
  id: string;
  label: string;
  templateFn: (contractName: string, fn: RustFunction) => string;
}

export interface GeneratedTest {
  scenario: string;
  code: string;
}

export interface TestGeneratorResult {
  header: string;
  tests: GeneratedTest[];
  fullFile: string;
}

// ── Agent Manifest (ERC-8004) ──

export interface ManifestFunction {
  name: string;
  description: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  stateMutability: string;
}

export interface AgentManifest {
  schema: string;
  name: string;
  description: string;
  version: string;
  abi: ManifestFunction[];
}

// ── Intent Hook (frontend) ──

export interface IntentResult {
  matched: boolean;
  functionName?: string;
  args?: string[];
  calldata?: string;
}
