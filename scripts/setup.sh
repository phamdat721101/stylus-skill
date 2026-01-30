#!/bin/bash
set -e

echo "Checking Stylus development environment..."

# Check Rust
if ! command -v cargo &> /dev/null; then
    echo "Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# Add wasm32-unknown-unknown target
echo "Adding wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown

# Check cargo-stylus
if ! command -v cargo-stylus &> /dev/null; then
    echo "cargo-stylus not found. Installing..."
    # Attempt to install via cargo
    cargo install cargo-stylus
else
    echo "cargo-stylus is already installed."
fi

echo "Stylus environment setup complete!"
cargo stylus --version
