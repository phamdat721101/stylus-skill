#!/bin/bash
set -e

PROJECT_PATH=${1:-.}

echo "Checking Stylus contract in: $PROJECT_PATH"

cd "$PROJECT_PATH"

if [ ! -f "Cargo.toml" ]; then
    echo "Error: Cargo.toml not found in $PROJECT_PATH. Is this a Rust project?"
    exit 1
fi

echo "Running cargo build..."
cargo build --release --target wasm32-unknown-unknown

echo "Contract check (build) passed!"
