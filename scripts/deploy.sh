#!/bin/bash
set -e

PRIVATE_KEY=$1
ENDPOINT=${2:-https://sepolia-rollup.arbitrum.io/rpc}

if [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: ./scripts/deploy.sh <private_key> [endpoint]"
    exit 1
fi

echo "Deploying Stylus contract..."
echo "Endpoint: $ENDPOINT"

# Build first
echo "Building contract..."
cargo build --release --target wasm32-unknown-unknown

# Get project name from Cargo.toml
PROJECT_NAME=$(grep -m 1 '^name =' Cargo.toml | cut -d '"' -f 2)
WASM_FILE="target/wasm32-unknown-unknown/release/$PROJECT_NAME.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "Error: WASM file not found at $WASM_FILE"
    exit 1
fi

echo "Deploying $WASM_FILE..."

# Run cargo stylus deploy with specific wasm file to avoid config issues
cargo stylus deploy --private-key "$PRIVATE_KEY" --endpoint-url "$ENDPOINT" --wasm-file "$WASM_FILE"
