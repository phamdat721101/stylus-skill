import type { RustFunction, TestScenario } from "../types.ts";

function fnCallArgs(fn: RustFunction): string {
  return fn.params.map((p) => defaultValueForType(p.type)).join(", ");
}

function defaultValueForType(ty: string): string {
  const t = ty.trim();
  if (t.includes("U256")) return "U256::from(42)";
  if (t.includes("U128")) return "U128::from(42)";
  if (t.includes("U64")) return "U64::from(42)";
  if (t.includes("Address")) return "Address::ZERO";
  if (t.includes("bool")) return "true";
  if (t.includes("u8") || t.includes("u16") || t.includes("u32") || t.includes("u64")) return "42";
  if (t.includes("String") || t.includes("str")) return '"hello".to_string()';
  if (t.includes("Vec<u8>")) return "vec![1, 2, 3]";
  return "Default::default()";
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: "basic-call",
    label: "Basic function call",
    templateFn: (contractName, fn) => {
      const call = fn.isMut
        ? `contract.${fn.name}(${fnCallArgs(fn)})`
        : `contract.${fn.name}(${fnCallArgs(fn)})`;
      return `    #[motsu::test]
    fn test_${fn.name}(contract: ${contractName}) {
        let result = ${call};
        assert!(result.is_ok());
    }`;
    },
  },
  {
    id: "state-change",
    label: "State change verification",
    templateFn: (contractName, fn) => {
      if (!fn.isMut) {
        return `    #[motsu::test]
    fn test_${fn.name}_returns_value(contract: ${contractName}) {
        let result = ${`contract.${fn.name}(${fnCallArgs(fn)})`};
        assert!(result.is_ok());
    }`;
      }
      return `    #[motsu::test]
    fn test_${fn.name}_modifies_state(contract: ${contractName}) {
        // Act
        let result = contract.${fn.name}(${fnCallArgs(fn)});
        assert!(result.is_ok());

        // TODO: Assert state was modified as expected
        // e.g., let stored = contract.getter().unwrap();
    }`;
    },
  },
  {
    id: "reentrancy",
    label: "Reentrancy guard",
    templateFn: (contractName, fn) => {
      if (!fn.isMut) return "";
      return `    #[motsu::test]
    fn test_${fn.name}_no_reentrancy(contract: ${contractName}) {
        // First call should succeed
        let first = contract.${fn.name}(${fnCallArgs(fn)});
        assert!(first.is_ok());

        // Second call in same context should also succeed (no reentrancy guard by default)
        let second = contract.${fn.name}(${fnCallArgs(fn)});
        assert!(second.is_ok());
    }`;
    },
  },
];

export function generateTestHeader(contractName: string): string {
  return `#[cfg(test)]
mod tests {
    use super::${contractName};
    use stylus_sdk::alloy_primitives::{U256, Address};
`;
}

export function generateTestFooter(): string {
  return `}
`;
}
