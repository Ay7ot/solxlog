# Product: SolXLog - Solana Transaction Tools

## Overview

SolXLog is a lightweight, open-source web tool that helps Solana developers **debug and analyze transactions** through four core features:

1. **Log Explorer** - View and analyze a single transaction's execution flow
2. **Transaction Compare** - Diff two transactions side-by-side to identify differences
3. **Account Diff** - See exactly what changed in each account after a transaction
4. **Error Decoder** - Decode cryptic error codes into human-readable explanations

The goal is simple: make Solana debugging faster and more intuitive.

---

## Problem Statement

When debugging Solana transactions, developers often need to:
- Understand why a transaction failed
- Compare a failing transaction against a working one
- Identify what changed between two program versions
- Debug differences between devnet and mainnet execution
- See what accounts changed and by how much (SOL, tokens)
- Decode cryptic error codes like `0x1771` into meaningful explanations

While Solana Explorer shows structured logs and accounts involved, it doesn't clearly show **what changed** in each account or help decode error messages. Developers often ask "Did my transaction actually update the data?", "How much SOL moved where?", or "What does error 0xbbf mean?"

---

## Target Users

- Solana program developers
- Engineers debugging Anchor or native Solana programs
- Auditors reviewing transaction behavior
- Developers comparing before/after deployments

---

## Core Features

### Feature 1: Log Explorer

A single transaction viewer with structured logs.

**Capabilities:**
- Fetch transaction data using `getTransaction`
- Parse logs into structured timeline
- Group logs by program invocation with depth tracking
- Color-coded log types (invoke, success, failure, compute)
- Compute unit insights per instruction
- Error summary with failing program identification

### Feature 2: Transaction Compare (New)

Side-by-side comparison of two transactions.

**Capabilities:**
- Load two transactions independently (can be from different networks)
- Comparison summary showing:
  - Status differences (success vs failure)
  - Compute unit changes (+/- with percentage)
  - Programs unique to each transaction
  - First point of log divergence
- Side-by-side invocation tree diff
- Line-by-line log diff with:
  - Color-coded differences (same, changed, only in A, only in B)
  - Collapsible matching sections
  - Filter by difference type
- Shareable URLs via query parameters (`?txA=...&txB=...`)

**Use Cases:**
- Compare failing vs working transaction
- Compare before/after a program upgrade
- Compare devnet simulation vs mainnet execution
- Identify compute unit regressions

### Feature 3: Account State Diff

Visual breakdown of what changed in each account.

**Capabilities:**
- Show all accounts involved in a transaction
- Display SOL balance changes (before → after with diff)
- Display token balance changes with symbol resolution
- Identify account creation and closure
- Classify accounts (wallet, token account, program, PDA)
- Label known accounts (fee payer, signers, known programs)
- Filter by change type (all, changed, SOL, tokens, created)
- Summary statistics (accounts modified, SOL transferred, token transfers)

**Data Sources:**
- `meta.preBalances` / `meta.postBalances` for SOL changes
- `meta.preTokenBalances` / `meta.postTokenBalances` for token changes
- `transaction.message.accountKeys` for account list

**Use Cases:**
- Verify a transfer actually moved funds
- Debug why an account wasn't created
- Track token movements through a swap
- Understand fee distribution

### Feature 4: Error Decoder

Decode cryptic Solana error codes into human-readable explanations.

**Capabilities:**
- Parse error codes from multiple formats:
  - Hex codes (`0x1771`)
  - Decimal codes (`6001`)
  - Full error messages (`custom program error: 0x1771`)
- Built-in error database for:
  - Solana ProgramError (0-99)
  - Anchor instruction errors (100-999)
  - Anchor constraint errors (2000-2999)
  - Anchor account errors (3000-4099)
  - Anchor misc errors (4100-4999)
- Category detection based on Anchor's numbering scheme
- IDL upload for custom program errors (6000+)
- Fix suggestions for common errors
- Quick reference table of common errors

**Error Code Ranges:**
| Range | Category |
|-------|----------|
| 0-99 | Solana built-in ProgramError |
| 100-999 | Anchor instruction errors |
| 1000-1999 | Anchor IDL errors |
| 2000-2999 | Anchor constraint errors |
| 3000-4099 | Anchor account errors |
| 4100-4999 | Anchor misc errors |
| 5000 | Deprecated |
| 6000+ | Custom program errors (user-defined) |

**Use Cases:**
- Quickly decode `0x1771` without manual hex conversion
- Understand Anchor constraint violations
- Look up Solana built-in errors
- Decode custom program errors with IDL upload

---

## Technical Architecture

### Frontend
- Vite + React
- React Router for navigation
- Tailwind CSS
- Pure client-side rendering

### Solana Integration
- `@solana/web3.js`
- Public RPC endpoints (configurable)
- No backend or database

### Comparison Engine
- Log diff using lookahead matching algorithm
- Invocation tree diff with recursive comparison
- Compute stats aggregation and delta calculation

---

## Routes

- `/` - Log Explorer (single transaction viewer)
- `/compare` - Transaction Compare (side-by-side diff)
- `/accounts` - Account State Diff (what changed in each account)
- `/decode` - Error Decoder (decode error codes)

---

## URL Parameters

### Explorer Page
- `tx` or `signature` - Transaction signature
- `network` - Network (`mainnet-beta` or `devnet`)

### Compare Page
- `txA` - Transaction A signature
- `txB` - Transaction B signature
- `netA` - Network for A (defaults to mainnet-beta)
- `netB` - Network for B (defaults to mainnet-beta)

### Accounts Page
- `tx` - Transaction signature
- `network` - Network (`mainnet-beta` or `devnet`)

---

## Non-Goals (Out of Scope)

- Wallet connections
- Authentication or user accounts
- Token balances and analytics
- Full block explorer functionality
- AI-powered explanations
- Transaction simulation/building

---

## Open Source Strategy

- MIT License
- No telemetry or tracking
- Contributions welcome via pull requests

---

## Future Enhancements (Optional)

- Export comparison as JSON/PDF
- Compare more than two transactions
- Program ID filtering in compare view
- Saved comparisons (local storage)
- Diff highlighting in raw log view
- Mobile-optimized compare layout

---

## Success Criteria

The product is successful if:
- Developers can identify why one transaction failed vs another
- Compare feature is bookmarked for repeated debugging sessions
- Time to identify root cause is reduced vs manual comparison
- Zero setup required - paste signatures and compare immediately
