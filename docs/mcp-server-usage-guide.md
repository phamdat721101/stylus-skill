# MCP Server — Usage Guide

Comprehensive tool reference for the **Stylus Architect MCP Server** (`stylus-architect` v0.1.0).

## 1. Overview

The Stylus Architect MCP Server exposes four AI-integrated tools over the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) using stdio transport. It enables AI agents and IDE extensions to scaffold, audit, test, and document Arbitrum Stylus smart contracts.

| Tool | Purpose | Requires Rust? |
|---|---|---|
| `scaffold_stylus_project` | Create a new Stylus project from the Counter template | Yes |
| `analyze_ink_usage` | Audit Rust code for gas-expensive WASM patterns | No |
| `generate_motsu_tests` | Generate Motsu-framework unit tests from a contract | No |
| `generate_agent_manifest` | Produce an ERC-8004 Agent Manifest JSON | No |

## 2. Architecture

```
┌──────────────────────┐       stdio        ┌──────────────────────────┐
│   AI Client          │◄──────────────────►│   MCP Server             │
│  (Claude Desktop,    │   JSON-RPC over    │   stylus-architect       │
│   Cursor, CLI, etc.) │   stdin/stdout     │   v0.1.0                 │
└──────────────────────┘                    └──────┬───────────────────┘
                                                   │
                           ┌───────────────────────┼───────────────────────┐
                           │                       │                       │
                    ┌──────▼──────┐  ┌─────────────▼──────┐  ┌────────────▼─────────┐
                    │ scaffold    │  │ analyze_ink_usage   │  │ generate_motsu_tests │
                    │ (shells out │  │ (in-process)        │  │ (in-process)         │
                    │  to bash)   │  │                     │  │                      │
                    └─────────────┘  └─────────────────────┘  └──────────────────────┘
                                                                        │
                                                            ┌───────────▼──────────────┐
                                                            │ generate_agent_manifest  │
                                                            │ (in-process)             │
                                                            └──────────────────────────┘
```

- **`scaffold_stylus_project`** shells out to `scripts/scaffold.sh` via `child_process.execSync`. It requires the Rust toolchain.
- The other three tools are pure TypeScript, running entirely in-process with no external dependencies.

## 3. Quick Start

```bash
# 1. Install & build
npm install && npm run build -w packages/mcp-server

# 2. Test interactively with MCP Inspector
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js

# 3. Connect to your AI client (see Integration Guides below)
```

For detailed setup instructions, see the [Setup & Testing Guide](./mcp-server-setup-and-testing.md).

## 4. Tool Reference

### 4.1 `scaffold_stylus_project`

> Scaffold a new Arbitrum Stylus project with the Counter contract template.

**Input Schema:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | `string` | Yes | Name of the new Stylus project |

**Example Input:**

```json
{ "project_name": "my_token" }
```

**Example Output:**

```
Creating new Stylus project: my_token
  Created my_token/Cargo.toml
  Created my_token/src/lib.rs
  Created my_token/.cargo/config.toml
  Created my_token/Stylus.toml
Project my_token created successfully!
```

**Notes:**
- Creates the project directory relative to the server's current working directory.
- Requires `cargo`, `wasm32-unknown-unknown` target, and `cargo-stylus` to be installed.
- The generated project includes a Counter contract template with optimized release profile settings.

---

### 4.2 `analyze_ink_usage`

> Analyze a Stylus Rust contract for expensive Ink (WASM gas) patterns and suggest optimizations.

**Input Schema:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_code` | `string` | Yes | Rust source code of a Stylus contract |

**Detected Patterns:**

| ID | Pattern | Severity | Title |
|---|---|---|---|
| `string-in-storage` | `String` keyword | High | String used in storage |
| `hashmap-in-storage` | `HashMap` or `BTreeMap` | High | HashMap/BTreeMap used instead of StorageMap |
| `vec-in-storage` | `Vec<` (except `Vec<u8>`) | High | Vec used in storage |
| `clone-usage` | `.clone()` | Medium | Unnecessary .clone() detected |
| `unbounded-iter` | `.iter()` ... `.collect` | Medium | Unbounded iteration with .collect() |
| `box-new` | `Box::new` | Medium | Heap allocation via Box::new |
| `format-macro` | `format!(` | Low | format!() macro used |

**Example Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct BadContract {\n        uint256 value;\n    }\n}\n\n#[external]\nimpl BadContract {\n    pub fn bad_fn(&mut self) -> Result<(), Vec<u8>> {\n        let data: HashMap<String, u64> = HashMap::new();\n        let cloned = \"hello\".to_string().clone();\n        let formatted = format!(\"val: {}\", cloned);\n        Ok(())\n    }\n}"
}
```

**Example Output:**

```json
{
  "findings": [
    {
      "patternId": "hashmap-in-storage",
      "severity": "high",
      "title": "HashMap/BTreeMap used instead of StorageMap",
      "suggestion": "Use `StorageMap` via `sol_storage!` macro. Native Rust maps serialize the entire collection on each access, costing O(n) Ink.",
      "line": 11,
      "code": "let data: HashMap<String, u64> = HashMap::new();"
    },
    {
      "patternId": "string-in-storage",
      "severity": "high",
      "title": "String used in storage",
      "suggestion": "Use `StorageString` from stylus-sdk instead. Heap-allocated String costs significantly more Ink for reads/writes.",
      "line": 11,
      "code": "let data: HashMap<String, u64> = HashMap::new();"
    },
    {
      "patternId": "clone-usage",
      "severity": "medium",
      "title": "Unnecessary .clone() detected",
      "suggestion": "Use references (&T) instead of cloning. Each clone allocates memory and copies data, increasing Ink cost.",
      "line": 12,
      "code": "let cloned = \"hello\".to_string().clone();"
    },
    {
      "patternId": "string-in-storage",
      "severity": "high",
      "title": "String used in storage",
      "suggestion": "Use `StorageString` from stylus-sdk instead. Heap-allocated String costs significantly more Ink for reads/writes.",
      "line": 12,
      "code": "let cloned = \"hello\".to_string().clone();"
    },
    {
      "patternId": "format-macro",
      "severity": "low",
      "title": "format!() macro used",
      "suggestion": "Use fixed-size byte arrays or pre-computed values where possible. format! allocates and is expensive in WASM.",
      "line": 13,
      "code": "let formatted = format!(\"val: {}\", cloned);"
    }
  ],
  "summary": { "high": 3, "medium": 1, "low": 1 }
}
```

**Notes:**
- Comment lines (`// ...`) are skipped automatically.
- The `String` pattern may match in lines where `String` appears as part of a type parameter (e.g., `HashMap<String, u64>`), producing multiple findings per line.

---

### 4.3 `generate_motsu_tests`

> Generate Motsu framework unit tests for a Stylus Rust smart contract.

**Input Schema:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_code` | `string` | Yes | Rust source code of a Stylus contract |

**Test Scenarios Generated:**

| Scenario | Applies To | Description |
|---|---|---|
| Basic function call | All functions | Calls the function and asserts `result.is_ok()` |
| State change verification | All functions | For `&mut self`: asserts success + TODO placeholder for state check. For `&self`: asserts return value is Ok |
| Reentrancy guard | `&mut self` only | Calls the function twice in sequence, asserts both succeed |

**Example Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct Counter {\n        uint256 number;\n    }\n}\n\n#[external]\nimpl Counter {\n    pub fn number(&self) -> Result<U256, Vec<u8>> {\n        Ok(self.number.get())\n    }\n\n    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {\n        self.number.set(new_number);\n        Ok(())\n    }\n\n    pub fn increment(&mut self) -> Result<(), Vec<u8>> {\n        let number = self.number.get();\n        self.number.set(number + U256::from(1));\n        Ok(())\n    }\n}"
}
```

**Example Output (abbreviated):**

```json
{
  "header": "#[cfg(test)]\nmod tests {\n    use super::Counter;\n    use stylus_sdk::alloy_primitives::{U256, Address};\n",
  "tests": [
    { "scenario": "Basic function call", "code": "    #[motsu::test]\n    fn test_number(contract: Counter) {\n        let result = contract.number();\n        assert!(result.is_ok());\n    }" },
    { "scenario": "State change verification", "code": "    #[motsu::test]\n    fn test_number_returns_value(contract: Counter) {\n        let result = contract.number();\n        assert!(result.is_ok());\n    }" },
    { "scenario": "Basic function call", "code": "    #[motsu::test]\n    fn test_set_number(contract: Counter) {\n        let result = contract.set_number(U256::from(42));\n        assert!(result.is_ok());\n    }" },
    { "scenario": "State change verification", "code": "..." },
    { "scenario": "Reentrancy guard", "code": "..." },
    { "scenario": "Basic function call", "code": "..." },
    { "scenario": "State change verification", "code": "..." },
    { "scenario": "Reentrancy guard", "code": "..." }
  ],
  "fullFile": "#[cfg(test)]\nmod tests {\n    use super::Counter;\n    use stylus_sdk::alloy_primitives::{U256, Address};\n\n    #[motsu::test]\n    fn test_number(contract: Counter) {\n        let result = contract.number();\n        assert!(result.is_ok());\n    }\n    ...\n}\n"
}
```

**Notes:**
- The `fullFile` field contains the complete test module, ready to append to `src/lib.rs` or save as a separate test file.
- Default argument values are generated automatically based on type (e.g., `U256::from(42)` for `U256`, `Address::ZERO` for `Address`).
- State change tests for `&mut self` functions include a TODO comment where you should add your own assertion logic.

---

### 4.4 `generate_agent_manifest`

> Generate an ERC-8004 Agent Manifest JSON from a Stylus Rust contract.

**Input Schema:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_code` | `string` | Yes | Rust source code of a Stylus contract |
| `name` | `string` | No | Override manifest name (default: contract struct name) |
| `description` | `string` | No | Override manifest description |
| `version` | `string` | No | Override manifest version (default: `"0.1.0"`) |

**Rust to Solidity Type Mapping:**

| Rust Type | Solidity Type |
|---|---|
| `U256` | `uint256` |
| `U128` | `uint128` |
| `U64` | `uint64` |
| `u8` | `uint8` |
| `u16` | `uint16` |
| `u32` | `uint32` |
| `u64` | `uint64` |
| `bool` | `bool` |
| `Address` | `address` |
| `String` | `string` |
| `Vec<u8>` | `bytes` |
| `[u8; N]` | `bytesN` (N <= 32) |

Unrecognized types default to `bytes`.

**Example Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct Counter {\n        uint256 number;\n    }\n}\n\n#[external]\nimpl Counter {\n    pub fn number(&self) -> Result<U256, Vec<u8>> {\n        Ok(self.number.get())\n    }\n\n    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {\n        self.number.set(new_number);\n        Ok(())\n    }\n\n    pub fn increment(&mut self) -> Result<(), Vec<u8>> {\n        let number = self.number.get();\n        self.number.set(number + U256::from(1));\n        Ok(())\n    }\n}"
}
```

**Example Output:**

```json
{
  "schema": "erc-8004-v1",
  "name": "Counter",
  "description": "Agent manifest for the Counter Stylus contract",
  "version": "0.1.0",
  "abi": [
    {
      "name": "number",
      "description": "Calls number on the Counter contract",
      "inputs": [],
      "outputs": [{ "name": "value", "type": "uint256" }],
      "stateMutability": "view"
    },
    {
      "name": "set_number",
      "description": "Calls set_number on the Counter contract",
      "inputs": [{ "name": "new_number", "type": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "name": "increment",
      "description": "Calls increment on the Counter contract",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ]
}
```

**Notes:**
- `&self` functions are mapped to `"view"` state mutability; `&mut self` to `"nonpayable"`.
- Return types of `Result<(), Vec<u8>>` produce an empty `outputs` array.
- Return types of `Result<SomeType, Vec<u8>>` extract `SomeType` and map it to the corresponding Solidity type.

## 5. Integration Guides

### Claude Desktop

Config path:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "stylus-architect": {
      "command": "node",
      "args": ["/absolute/path/to/stylus-skill/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stylus-architect": {
      "command": "node",
      "args": ["/absolute/path/to/stylus-skill/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Claude Code CLI

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stylus-architect": {
      "command": "node",
      "args": ["/absolute/path/to/stylus-skill/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Custom MCP Clients

The server uses **stdio transport** (JSON-RPC over stdin/stdout). To connect from a custom client:

1. Spawn `node /path/to/dist/index.js` as a child process.
2. Write JSON-RPC requests to the process's stdin.
3. Read JSON-RPC responses from stdout.
4. Use the MCP SDK's `StdioClientTransport` for a higher-level API.

## 6. Workflow Examples

### Full Development Flow

A typical end-to-end workflow using all four tools:

```
1. scaffold_stylus_project("my_defi_app")
   → Creates project with Counter template

2. (Developer writes contract code in src/lib.rs)

3. analyze_ink_usage(source_code)
   → Identifies expensive patterns, suggests optimizations

4. (Developer applies fixes based on audit findings)

5. generate_motsu_tests(source_code)
   → Generates test module, developer adds to project

6. generate_agent_manifest(source_code)
   → Produces ERC-8004 JSON for AI agent integration

7. (Developer deploys via ./scripts/deploy.sh)
```

### Audit-Only Flow

For existing contracts that need a gas optimization review:

```
1. analyze_ink_usage(source_code)
   → Review findings, fix high-severity issues first

2. analyze_ink_usage(updated_source_code)
   → Re-audit to confirm fixes, check for remaining issues
```

### Test Generation Flow

For adding tests to an existing contract:

```
1. generate_motsu_tests(source_code)
   → Get generated test module from fullFile

2. Append to src/lib.rs or create src/tests.rs

3. Fill in TODO assertions for state change tests

4. Run: cargo test
```

## 7. FAQ & Troubleshooting

**Q: Do I need Rust installed to use the MCP server?**
Only for `scaffold_stylus_project`. The other three tools are pure TypeScript and only need Node.js >= 18.

**Q: Can I analyze contracts that don't use `sol_storage!`?**
The ink auditor scans for patterns line-by-line, so it works on any Rust code. However, the test generator and manifest generator rely on parsing `sol_storage!` blocks and `#[external] impl` blocks, so they need standard Stylus contract structure.

**Q: Why does the auditor flag `String` in `HashMap<String, u64>`?**
The pattern matcher checks each line for the `String` keyword. If a line contains `String` in any context, it flags it. This is intentional — `String` anywhere in a Stylus contract is a potential gas concern.

**Q: Can I use the generated tests as-is?**
The "basic call" and "reentrancy" tests are ready to run. "State change verification" tests for `&mut self` functions include TODO placeholders where you need to add assertions specific to your contract's logic.

**Q: What happens if the Rust parser can't find a contract struct?**
It falls back to the name `"UnknownContract"`. The tools will still produce output, but function names and types may be missing if the source doesn't follow the expected `sol_storage!` + `#[external] impl` structure.

**Q: Can I run the server without building first?**
No. The server is written in TypeScript and must be compiled to JavaScript first via `npm run build -w packages/mcp-server`. The entry point is `dist/index.js`.

---

See also: [Setup & Testing Guide](./mcp-server-setup-and-testing.md) | [Detail Usage Guide](./detail-usage-guide.md)
