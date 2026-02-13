# Stylus Architect

**Stylus Architect** is a comprehensive toolkit designed to accelerate the development of Arbitrum Stylus smart contracts using AI agents and modern web interfaces. It bridges the gap between raw Rust code and deployed dApps on the Arbitrum network.

This repository contains:
1.  **MCP Server**: An AI-powered backend that exposes specialized tools to Large Language Models (LLMs) via the Model Context Protocol.
2.  **Web Dashboard**: A developer-friendly interface for visual interaction with Stylus tools.
3.  **CLI Scripts**: Essential utilities for project scaffolding, building, and deploying.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [1. Dashboard](#1-dashboard)
  - [2. MCP Server (AI Agent)](#2-mcp-server-ai-agent)
- [Core Features](#core-features)
- [Detailed Documentation](#detailed-documentation)
- [Scripts Reference](#scripts-reference)
- [Project Structure](#project-structure)

## Prerequisites

-   **Node.js**: v18 or higher (for Dashboard and MCP Server).
-   **Rust**: v1.75+ (for Stylus contract development).
-   **Unix-like Environment**: macOS or Linux (for scripts).

The setup script helps prepare your environment:

```bash
./scripts/setup.sh
```

## Quick Start

### 1. Dashboard

Launch the web interface to immediately start using the tools visually.

```bash
cd packages/dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. MCP Server (AI Agent)

To use these tools within Claude Desktop or other MCP-compatible clients, you need to configure the server.

**Build the server:**
```bash
cd packages/mcp-server
npm install
npm run build
```

**Add to Claude Desktop config:**
 Add the following to your `claude_desktop_config.json`:

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

## Core Features

-   **Ink Auditor**: Scans Rust contracts for expensive patterns that consume excessive WASM gas (Ink).
-   **Motsu Test Generator**: Automatically generates unit tests using the Motsu testing framework.
-   **Agent Manifest (ERC-8004)**: Generates a JSON manifest to make your contract discoverable and usable by autonomous agents.
-   **Project Scaffolding**: Quickly set up a new Stylus project with best-practice configuration.

## Detailed Documentation

-   [**AI Agent Skills Tutorial**](docs/agent-skills-tutorial.md): Guide on using the MCP tools with an AI assistant.
-   [**Stylus Dashboard Tutorial**](docs/stylus-dashboard-tutorial.md): Walkthrough of the web interface features.

## Scripts Reference

Legacy helper scripts for manual workflow:

| Script | Description | Arguments |
| :--- | :--- | :--- |
| `setup.sh` | Installs Rust, cargo-stylus, and wasm target. | None |
| `scaffold.sh` | Creates a new Stylus project structure. | `<project_name>` |
| `check.sh` | Builds and validates a contract. | `[project_path]` |
| `deploy.sh` | Deploys a contract to chain. | `<private_key> [endpoint]` |

## Project Structure

```text
stylus-skill/
├── packages/
│   ├── mcp-server/    # AI Agent tools implementation
│   └── dashboard/     # Web UI for developers
├── scripts/           # Shell scripts for build/deploy
├── docs/              # Detailed tutorials
└── README.md          # This file
```
