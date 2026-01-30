#!/bin/bash
set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: ./scripts/scaffold.sh <project_name>"
    exit 1
fi

echo "Scaffolding new Stylus project: $PROJECT_NAME..."

# Create directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize Rust library
cargo init --lib --name "$PROJECT_NAME"

# Create Cargo.toml with Stylus dependencies
cat > Cargo.toml <<EOF
[workspace]

[package]
name = "$PROJECT_NAME"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
stylus-sdk = "0.10.0"
alloy-primitives = "=0.7.6"
alloy-sol-types = "=0.7.6"
mini-alloc = "0.4.2"

[features]
export-abi = ["stylus-sdk/export-abi"]
debug = ["stylus-sdk/debug"]

[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = "s"
EOF

# Create src/lib.rs with basic Stylus contract
cat > src/lib.rs <<EOF
// Only run this as a WASM if the export-abi feature is not set.
#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

/// Initializes a custom, global allocator for smaller wasm code chunks.
#[global_allocator]
static ALLOC: mini_alloc::MiniAlloc = mini_alloc::MiniAlloc::INIT;

use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 number;
    }
}

/// Declare that \`Counter\` is a contract with the following external methods.
#[external]
impl Counter {
    /// Gets the number from storage.
    pub fn number(&self) -> Result<U256, Vec<u8>> {
        Ok(self.number.get())
    }

    /// Sets a number in storage to a user-specified value.
    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {
        self.number.set(new_number);
        Ok(())
    }
    
    /// Increments the number in storage.
    pub fn increment(&mut self) -> Result<(), Vec<u8>> {
        let number = self.number.get();
        self.number.set(number + U256::from(1));
        Ok(())
    }
}
EOF

# Create .cargo/config.toml for default target
mkdir -p .cargo
cat > .cargo/config.toml <<EOF
[build]
target = "wasm32-unknown-unknown"
EOF

# Create Stylus.toml
cat > Stylus.toml <<EOF
[program]
license = "MIT"
version = "0.1.0"
EOF

echo "Project '$PROJECT_NAME' created successfully (manual scaffold)!"
ls -F .
