# Stylus Dashboard Tutorial

The **Stylus Architect Dashboard** provides a visual, web-based interface for interacting with the Stylus tool suite. It is perfect for developers who prefer a graphical UI over command-line interactions or AI chat interfaces.

## Getting Started

To launch the dashboard locally:

1.  Navigate to the dashboard directory:
    ```bash
    cd packages/dashboard
    ```

2.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and go to [http://localhost:3000](http://localhost:3000).

## Features Walkthrough

The home page categorizes the available tools. Click on any card to access that specific tool.

### 1. Ink Auditor

**Goal**: Optimize your contract's gas usage.

*   **How to use**:
    1.  Click on **Ink Auditor**.
    2.  Paste your Rust contract code into the editor on the left.
    3.  Click **Analyze**.
    4.  Review the **Audit Results** on the right. High-severity issues will be highlighted in red, suggesting changes to save gas.

### 2. Test Generator

**Goal**: Quickly create unit tests for your contract.

*   **How to use**:
    1.  Click on **Test Generator**.
    2.  Paste your Rust contract code.
    3.  Click **Generate Tests**.
    4.  The tool will produce a complete test file using the **Motsu** framework.
    5.  Copy the code and save it to your project's `tests` directory.

### 3. Agent Manifest (ERC-8004)

**Goal**: Make your contract discoverable by autonomous AI agents.

*   **How to use**:
    1.  Click on **Agent Manifest**.
    2.  Paste your contract source code.
    3.  (Optional) Enter a custom name and description for your manifest.
    4.  Click **Generate Manifest**.
    5.  The result is a JSON file following the **ERC-8004** standard, which describes your contract's capabilities to AI agents. Publish this JSON alongside your contract or on an agent registry.

### 4. Intent Hook

**Goal**: Translate natural language user intents into executable transactions.

*   **How to use**:
    1.  Provide your generated Agent Manifest.
    2.  Type a user intent (e.g., "Swap 100 USDC for ETH").
    3.  The tool simulates how an agent would interpret this intent and construct the transaction call data based on your ABI.

## Tips

*   **Real-time Feedback**: The dashboard provides immediate feedback on your code.
*   **Copy & Paste**: All generated outputs (tests, manifests, analysis) have a convenient "Copy" button.
*   **Privacy**: All processing happens locally on your machine or within the connected MCP server context; your code is not sent to external cloud services unless configured otherwise.
