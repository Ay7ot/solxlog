# Product: Solana Log Explorer

## Overview

Solana Log Explorer is a lightweight, open-source web tool that helps developers **understand Solana transaction logs**, not just view them.

Instead of dumping raw log text, the tool structures logs into a readable timeline, highlights errors and compute usage, and visualizes program invocation depth.

The goal is simple: make Solana debugging less painful.

---

## Problem Statement

Solana transaction logs are:
- Flat text
- Extremely noisy
- Hard to scan
- Difficult to associate with instruction execution

Most existing explorers display logs verbatim with minimal structure, forcing developers to manually trace execution flow and errors.

This slows down debugging and increases cognitive load during development.

---

## Target Users

- Solana program developers
- Engineers debugging Anchor or native Solana programs
- Auditors and contributors reviewing transaction behavior
- Developers learning how Solana executes instructions

This tool is **not** intended to be a full block explorer.

---

## Core Use Case

A developer pastes a Solana transaction signature and immediately sees:
- Which programs were invoked
- The execution order and nesting
- Where logs came from
- Where compute units were consumed
- Why the transaction failed (if it did)

---

## MVP Features

### 1. Transaction Log Parsing
- Fetch transaction data using `getTransaction`
- Extract `meta.logMessages`
- Parse logs into structured entries

### 2. Structured Log Timeline
- Group logs by program invocation
- Track invocation depth using invoke / success / failure signals
- Display nested calls with indentation or collapsible sections

### 3. Log Type Highlighting
Logs are categorized and visually distinguished:
- Program invocation logs
- `Program log:` output
- Success messages
- Failure and error messages
- Compute unit usage logs

### 4. Compute Unit Insights
- Extract compute unit consumption per instruction
- Display remaining compute budget
- Surface potential compute-related failures

### 5. Error Summary
- Show final error prominently
- Identify the instruction index and program responsible
- Avoid burying critical information in raw logs

---

## Non-Goals (Explicitly Out of Scope)

- Wallet connections
- Authentication
- User accounts
- Token balances and analytics
- Full block explorer functionality
- AI-powered explanations

This tool focuses strictly on logs and execution flow.

---

## Technical Architecture

### Frontend
- Vite + React
- Tailwind CSS or simple CSS modules
- Pure client-side rendering

### Solana Integration
- `@solana/web3.js`
- Public RPC endpoints
- No backend or database

### Log Processing
- Regex-based log classification
- Invocation depth tracking via a call stack
- Normalized internal log schema

---

## Data Flow

1. User submits a transaction signature
2. App fetches transaction data from Solana RPC
3. Raw logs are parsed and normalized
4. Structured logs are rendered as a timeline
5. Errors and compute usage are summarized

---

## Open Source Strategy

- MIT License
- No telemetry
- No tracking
- Contributions welcome via pull requests
- Clear README with usage examples and limitations

---

## Limitations

- Dependent on RPC availability and rate limits
- Logs are only as accurate as on-chain output
- Some compute data may vary by transaction version
- Program ID search is not included in MVP

---

## Future Enhancements (Optional)

- Program ID filtering
- Search within logs
- Shareable URLs with query parameters
- Export logs as JSON
- Support for program-based recent transaction lookup

---

## Success Criteria

The product is successful if:
- Developers can identify errors faster than with existing explorers
- Execution flow is understandable at a glance
- The tool is usable without documentation
- Developers bookmark it for repeated use

---

## Summary

Solana Log Explorer improves the developer experience by adding structure, clarity, and focus to Solana transaction logs.

It does one thing well: helping developers debug faster.
