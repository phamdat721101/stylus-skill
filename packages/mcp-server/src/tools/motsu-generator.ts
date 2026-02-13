import type { TestGeneratorResult } from "../types.ts";
import { parseRustContract } from "../utils/rust-parser.ts";
import {
  TEST_SCENARIOS,
  generateTestHeader,
  generateTestFooter,
} from "../knowledge/motsu-templates.ts";

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