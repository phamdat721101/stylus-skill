# Stylus Builder Skill

This framework provides a streamlined, skill-based approach to building, testing, and deploying Arbitrum Stylus smart contracts. It is designed to be used by AI agents or developers to quickly spin up and deploy Stylus projects using Rust.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
  - [1. Scaffold a New Project](#1-scaffold-a-new-project)
  - [2. Develop & Check](#2-develop--check)
  - [3. Deploy](#3-deploy)
- [Scripts Reference](#scripts-reference)
- [Project Structure](#project-structure)

## Prerequisites

Before using this framework, ensure you have a Unix-like environment (macOS or Linux). The setup script will handle most dependencies, but basic system tools like `curl` and `git` should be available.

## Installation & Setup

1.  **Clone or Navigate to this Directory**: Ensure you are in the root of the `stylus-skill` directory.
2.  **Run the Setup Script**: This script checks for and installs Rust, the `wasm32-unknown-unknown` target, and the `cargo-stylus` tool.

    ```bash
    ./scripts/setup.sh
    ```

    *Expected Output:*
    ```text
    Checking Stylus development environment...
    Rust is already installed.
    Adding wasm32-unknown-unknown target...
    cargo-stylus is already installed.
    Stylus environment setup complete!
    cargo-stylus 0.x.x
    ```

## Usage

### 1. Scaffold a New Project

To create a new Stylus project with all necessary configuration files:

```bash
./scripts/scaffold.sh <project_name>
```

**Example:**
```bash
./scripts/scaffold.sh my_stylus_dapp
```

This creates a directory named `my_stylus_dapp` with:
- `Cargo.toml`: Configured with `stylus-sdk` and other dependencies.
- `src/lib.rs`: A basic "Counter" contract example.
- `Stylus.toml`: Stylus-specific configuration.
- `.cargo/config.toml`: Sets the default build target to WebAssembly.

### 2. Develop & Check

Navigate into your project directory and start developing.

**Check compiling:**
To ensure your contract compiles and meets Stylus validity requirements, use the check script. You can run it from inside the project directory or provide the path.

```bash
# From inside the project directory
../scripts/check.sh

# Or from the root
./scripts/check.sh my_stylus_dapp
```

### 3. Deploy

To deploy your compiled contract to an Arbitrum Stylus chain (default: Sepolia Testnet).

**Requirements:**
- A private key with some Sepolia ETH for gas.

```bash
# From inside the project directory
../scripts/deploy.sh <your_private_key> [rpc_endpoint]
```

**Parameters:**
- `private_key`: Your wallet's private key (starts with `0x` or without).
- `rpc_endpoint`: (Optional) The RPC URL. Defaults to `https://sepolia-rollup.arbitrum.io/rpc`.

## Scripts Reference

| Script | Description | Arguments |
| :--- | :--- | :--- |
| `setup.sh` | Installs system dependencies (Rust, cargo-stylus). | None |
| `scaffold.sh` | Creates a new Stylus project structure. | `<project_name>` |
| `check.sh` | Builds and validates the contract. | `[project_path]` (default: `.`) |
| `deploy.sh` | Deploys the contract to the chain. | `<private_key> [endpoint]` |

## Project Structure

A scaffolded project will have the following layout:

```text
my_project/
├── .cargo/
│   └── config.toml      # Forces wasm32-unknown-unknown target
├── src/
│   └── lib.rs           # Contract entrypoint and logic
├── Cargo.toml           # Rust dependencies (stylus-sdk, alloy, etc.)
├── Stylus.toml          # Stylus program metadata
└── [Target Directory]   # Created after build/check
```

## Troubleshooting

-   **Deployment Failures**: Ensure your account has enough ETH on the specific Arbitrum chain you are deploying to.
-   **Build Errors**: Make sure you rely on `cargo-stylus` compatible dependencies. Standard Rust `std` libraries that rely on OS features (like I/O, threads) are not supported in the WASM environment.
