---
name: Stylus Builder
description: A skill for AI agents to build, test, and deploy Arbitrum Stylus smart contracts using Rust.
---

# Stylus Builder Skill

This skill allows you to scaffold, check, and deploy Arbitrum Stylus smart contracts efficiently. It adheres to the "Actionable Skills" philosophy, providing CLI-based tools for one-shot execution.

## Usage

The skill provides the following scripts in the `scripts/` directory:

### 1. Setup Environment
Ensures `rustc`, `cargo`, and `cargo-stylus` are installed and ready.

```bash
./scripts/setup.sh
```

### 2. Scaffold New Project
Creates a new Stylus project with a standard directory structure.

```bash
./scripts/scaffold.sh <project_name>
```
*   `project_name`: Name of the new project directory.

### 3. Check Contract
Verifies that the contract compiles and meets Stylus validity requirements.

```bash
./scripts/check.sh [project_path]
```
*   `project_path`: (Optional) Path to the Stylus project. Defaults to current directory.

### 4. Deploy Contract
Deploys the compiled WebAssembly contract to an Arbitrum Stylus chain.

```bash
./scripts/deploy.sh <private_key> [endpoint]
```
*   `private_key`: The wallet private key for deployment (ensure it has ETH for gas).
*   `endpoint`: (Optional) RPC endpoint. Defaults to `https://sepolia-rollup.arbitrum.io/rpc`.

## Workflow Example

```bash
# 1. Setup
./scripts/setup.sh

# 2. Create a project
./scripts/scaffold.sh my_stylus_dapp
cd my_stylus_dapp

# 3. Develop & Check
# (Agent writes code here)
../scripts/check.sh

# 4. Deploy
../scripts/deploy.sh "0xYourPrivateKey..."
```
