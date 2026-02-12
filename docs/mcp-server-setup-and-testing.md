# MCP Server — Setup & Testing Guide

This guide walks you through installing, building, testing, and connecting the **Stylus Architect MCP Server** to AI clients.

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 18 | Required to run the MCP server |
| npm | >= 8 | Comes with Node.js; used for workspaces |
| Git | any | To clone the repository |
| Rust toolchain | latest stable | **Only** needed if you use `scaffold_stylus_project` |

> The `scaffold_stylus_project` tool shells out to `scripts/scaffold.sh`, which requires `cargo`, the `wasm32-unknown-unknown` target, and `cargo-stylus`. Run `./scripts/setup.sh` to install them. The other three tools (`analyze_ink_usage`, `generate_motsu_tests`, `generate_agent_manifest`) are pure in-process and need only Node.js.

## 2. Install & Build

From the repository root:

```bash
# Install all workspace dependencies
npm install

# Build the MCP server
npm run build -w packages/mcp-server

# Verify the build output exists
ls packages/mcp-server/dist/index.js
```

If the `ls` command prints the file path, the build succeeded.

## 3. Test with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the easiest way to interact with the server. It launches a web UI where you can list tools, send requests, and view responses.

```bash
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js
```

This opens a browser window. Click **"Tools"** in the sidebar to see all four tools. Select a tool, fill in the input fields, and click **"Run"** to execute it.

## 4. Test Each Tool

Below are copy-pasteable sample inputs you can use in MCP Inspector (or any MCP client).

### 4.1 `scaffold_stylus_project`

Creates a new Stylus project directory in the server's working directory.

**Input:**

```json
{
  "project_name": "test_project"
}
```

**Expected output:** Text confirming the project was created, listing the generated files (`Cargo.toml`, `src/lib.rs`, `.cargo/config.toml`, `Stylus.toml`).

> Requires the Rust toolchain. If Rust is not installed, the tool returns an error.

### 4.2 `analyze_ink_usage`

Scans Rust source code for gas-expensive patterns.

**Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct BadContract {\n        uint256 value;\n    }\n}\n\n#[external]\nimpl BadContract {\n    pub fn bad_fn(&mut self) -> Result<(), Vec<u8>> {\n        let data: HashMap<String, u64> = HashMap::new();\n        let cloned = \"hello\".to_string().clone();\n        let formatted = format!(\"val: {}\", cloned);\n        Ok(())\n    }\n}"
}
```

**Expected output (abbreviated):**

```json
{
  "findings": [
    {
      "patternId": "hashmap-in-storage",
      "severity": "high",
      "title": "HashMap/BTreeMap used instead of StorageMap",
      "suggestion": "Use `StorageMap` via `sol_storage!` macro. ...",
      "line": 11,
      "code": "let data: HashMap<String, u64> = HashMap::new();"
    },
    {
      "patternId": "string-in-storage",
      "severity": "high",
      "title": "String used in storage",
      "line": 11,
      "code": "let data: HashMap<String, u64> = HashMap::new();"
    },
    {
      "patternId": "clone-usage",
      "severity": "medium",
      "title": "Unnecessary .clone() detected",
      "line": 12,
      "code": "let cloned = \"hello\".to_string().clone();"
    },
    {
      "patternId": "string-in-storage",
      "severity": "high",
      "title": "String used in storage",
      "line": 12,
      "code": "let cloned = \"hello\".to_string().clone();"
    },
    {
      "patternId": "format-macro",
      "severity": "low",
      "title": "format!() macro used",
      "line": 13,
      "code": "let formatted = format!(\"val: {}\", cloned);"
    }
  ],
  "summary": { "high": 3, "medium": 1, "low": 1 }
}
```

### 4.3 `generate_motsu_tests`

Generates Motsu-framework unit tests from a contract's source code.

**Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct Counter {\n        uint256 number;\n    }\n}\n\n#[external]\nimpl Counter {\n    pub fn number(&self) -> Result<U256, Vec<u8>> {\n        Ok(self.number.get())\n    }\n\n    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {\n        self.number.set(new_number);\n        Ok(())\n    }\n\n    pub fn increment(&mut self) -> Result<(), Vec<u8>> {\n        let number = self.number.get();\n        self.number.set(number + U256::from(1));\n        Ok(())\n    }\n}"
}
```

**Expected output (abbreviated):**

```json
{
  "header": "#[cfg(test)]\nmod tests {\n    use super::Counter;\n    use stylus_sdk::alloy_primitives::{U256, Address};\n",
  "tests": [
    { "scenario": "Basic function call", "code": "    #[motsu::test]\n    fn test_number(contract: Counter) { ... }" },
    { "scenario": "State change verification", "code": "    #[motsu::test]\n    fn test_number_returns_value(contract: Counter) { ... }" },
    { "scenario": "Basic function call", "code": "    #[motsu::test]\n    fn test_set_number(contract: Counter) { ... }" },
    { "scenario": "State change verification", "code": "    #[motsu::test]\n    fn test_set_number_modifies_state(contract: Counter) { ... }" },
    { "scenario": "Reentrancy guard", "code": "    #[motsu::test]\n    fn test_set_number_no_reentrancy(contract: Counter) { ... }" },
    { "scenario": "Basic function call", "code": "    #[motsu::test]\n    fn test_increment(contract: Counter) { ... }" },
    { "scenario": "State change verification", "code": "    #[motsu::test]\n    fn test_increment_modifies_state(contract: Counter) { ... }" },
    { "scenario": "Reentrancy guard", "code": "    #[motsu::test]\n    fn test_increment_no_reentrancy(contract: Counter) { ... }" }
  ],
  "fullFile": "#[cfg(test)]\nmod tests {\n    use super::Counter;\n    ..."
}
```

The `fullFile` field contains the complete, ready-to-paste test module.

### 4.4 `generate_agent_manifest`

Produces an ERC-8004 Agent Manifest JSON from a Stylus contract.

**Input:**

```json
{
  "source_code": "sol_storage! {\n    #[entrypoint]\n    pub struct Counter {\n        uint256 number;\n    }\n}\n\n#[external]\nimpl Counter {\n    pub fn number(&self) -> Result<U256, Vec<u8>> {\n        Ok(self.number.get())\n    }\n\n    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {\n        self.number.set(new_number);\n        Ok(())\n    }\n\n    pub fn increment(&mut self) -> Result<(), Vec<u8>> {\n        let number = self.number.get();\n        self.number.set(number + U256::from(1));\n        Ok(())\n    }\n}"
}
```

**Expected output:**

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

You can also pass optional `name`, `description`, and `version` fields to override the auto-detected values.

## 5. Connect to Claude Desktop

1. Open (or create) the Claude Desktop config file:

   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the `stylus-architect` server entry:

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

> Replace `/absolute/path/to/stylus-skill` with the actual path on your machine.

3. Restart Claude Desktop. The four tools will appear in the tool picker (hammer icon).

## 6. Connect to Cursor

Create or edit `.cursor/mcp.json` in your project root:

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

Restart Cursor or reload the window. The tools will be available in Cursor's AI features.

## 7. Connect to Claude Code CLI

Create or edit `.mcp.json` in your project root:

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

Claude Code will automatically discover and load the tools on startup.

## 8. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Cannot find module 'dist/index.js'` | Server not built | Run `npm run build -w packages/mcp-server` |
| `scaffold_stylus_project` fails with "command not found" | Rust not installed | Run `./scripts/setup.sh` or install Rust via [rustup.rs](https://rustup.rs) |
| `ERR_MODULE_NOT_FOUND` or import errors | Dependencies not installed | Run `npm install` from the repo root |
| Node version error / unexpected syntax | Node.js < 18 | Upgrade to Node.js 18+ (`node --version` to check) |
| Permission denied on `scaffold.sh` | Script not executable | Run `chmod +x scripts/scaffold.sh` |
| Tools not appearing in Claude Desktop | Config path wrong or stale | Verify the absolute path in `claude_desktop_config.json` and restart Claude Desktop |
| MCP Inspector shows "connection refused" | Server crashed on startup | Check terminal output for errors; ensure `dist/index.js` exists |

---

Next: See the [MCP Server Usage Guide](./mcp-server-usage-guide.md) for detailed tool reference, architecture, and workflow examples.
