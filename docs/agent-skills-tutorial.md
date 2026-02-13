# AI Agent Skills Tutorial

This tutorial explains how to use the **Stylus Architect MCP Server** to empower your AI assistant (like Claude or other LLMs) with specialized capabilities for building Arbitrum Stylus smart contracts.

## What is MCP?

The **Model Context Protocol (MCP)** is a standard that allows AI models to interact with external tools and data. By running the Stylus Architect MCP Server, you give your AI assistant direct access to:

1.  **Scaffolding** new Stylus projects.
2.  **Analyzing** Rust code for gas efficiency.
3.  **Generating** unit tests automatically.
4.  **Creating** Agent Manifests (ERC-8004).

## Installation & Configuration

### 1. Build the Server

First, you need to build the MCP server from source:

```bash
cd packages/mcp-server
npm install
npm run build
```

This will create a `dist/index.js` file, which is the entry point for the server.

### 2. Configure Claude Desktop

To use this with the Claude Desktop app:

1.  Open your config file:
    *   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2.  Add the `stylus-architect` server to the `mcpServers` object:

    ```json
    {
      "mcpServers": {
        "stylus-architect": {
          "command": "node",
          "args": [
            "/ABSOLUTE/PATH/TO/stylus-skill/packages/mcp-server/dist/index.js"
          ]
        }
      }
    }
    ```

    > **Note**: Replace `/ABSOLUTE/PATH/TO/...` with the actual full path to your `stylus-skill` directory.

3.  Restart Claude Desktop. You should see a plug icon indicating the tools are connected.

## Available Tools

Once connected, your AI assistant will have access to the following tools:

### `scaffold_stylus_project`

*   **Description**: Creates a new Stylus project with best-practice directory structure and configuration.
*   **Arguments**:
    *   `project_name`: The name of the new directory to create.
*   **Prompt Example**:
    > "Create a new Stylus project called 'my-nft-marketplace'."

### `analyze_ink_usage`

*   **Description**: Scans your Rust code for patterns that might consume excessive "Ink" (WASM gas) and suggests optimizations.
*   **Arguments**:
    *   `source_code`: The Rust Source code to analyze.
*   **Prompt Example**:
    > "Analyze this contract code for gas optimizations." (Then paste your code)

### `generate_motsu_tests`

*   **Description**: Generates a comprehensive unit test suite using the Motsu framework, tailored to your contract's functions.
*   **Arguments**:
    *   `source_code`: The Rust contract code.
*   **Prompt Example**:
    > "Write unit tests for this smart contract."

### `generate_agent_manifest`

*   **Description**: Generates an ERC-8004 compliant JSON manifest. This file helps other autonomous agents discover and interact with your contract.
*   **Arguments**:
    *   `source_code`: The Rust contract code.
    *   `name` (optional): Override name.
    *   `description` (optional): Override description.
    *   `version` (optional): Override version.
*   **Prompt Example**:
    > "Generate an agent manifest for this contract so other agents can use it."

## Workflow Example

Here is how a typical conversation might look:

**You**: "I want to build a crowdfunding contract on Stylus. Can you start by scaffolding a project called 'crowdfund'?"

**AI**: (Calls `scaffold_stylus_project`) "I've created the 'crowdfund' project for you. Now, let's write the contract logic..."

**(You collaborate to write the Rust code)**

**You**: "The code looks good. Can you double-check it for any gas issues?"

**AI**: (Calls `analyze_ink_usage`) "I found a few potential optimizations. On line 45, you're using a loop that could be expensive..."

**You**: "Great catch. Now please generate some tests for it."

**AI**: (Calls `generate_motsu_tests`) "Here is a test file using the Motsu framework covering your `deposit` and `withdraw` functions..."
