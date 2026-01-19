# SolXLog - Solana Transaction Tools

A lightweight, open-source web tool that helps developers **debug and analyze Solana transactions** with structured views, comparison tools, and account state tracking.

![SolXLog](https://img.shields.io/badge/Solana-Transaction%20Tools-purple?style=for-the-badge&logo=solana)

## Features

### Log Explorer (`/`)
View and analyze a single transaction's execution flow.
- **Structured Log Timeline**: Logs grouped by program invocation with visual depth indicators
- **Log Type Highlighting**: Color-coded log types (invoke, success, failure, compute, etc.)
- **Compute Unit Insights**: Per-instruction breakdown with visual progress bars
- **Error Summary**: Prominent error display with program and instruction details

### Transaction Compare (`/compare`)
Side-by-side comparison of two transactions to identify differences.
- **Dual Transaction Input**: Load two transactions independently (can be from different networks)
- **Comparison Summary**: Status differences, compute unit changes, unique programs
- **Invocation Tree Diff**: Side-by-side program invocation comparison
- **Log Diff**: Line-by-line log comparison with collapsible matching sections

### Account State Diff (`/accounts`)
See exactly what changed in each account after a transaction.
- **SOL Balance Changes**: Before → after with colored +/- diff
- **Token Balance Changes**: Detects token transfers with symbol resolution (USDC, USDT, etc.)
- **Account Classification**: Labels accounts as wallet, token account, program, PDA
- **Summary Statistics**: Accounts modified, SOL transferred, token transfers count
- **Filter Options**: All / Changed / SOL only / Tokens only / Created/Closed

### Error Decoder (`/decode`)
Decode cryptic Solana error codes into human-readable explanations.
- **Hex & Decimal Input**: Paste `0x1771`, `6001`, or full error messages
- **Built-in Error Database**: All Solana and Anchor errors pre-loaded
- **Category Detection**: Automatically identifies error type (Solana, Anchor constraint, account, etc.)
- **IDL Upload**: Upload your program's IDL to decode custom errors (6000+)
- **Fix Suggestions**: Helpful hints for common errors
- **Quick Reference**: Common errors table for fast lookup

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

### Log Explorer
1. Enter a Solana transaction signature
2. Select the network (Mainnet or Devnet)
3. Click "Explore Logs" to analyze the transaction

### Transaction Compare
1. Navigate to the "Compare" tab
2. Enter two transaction signatures (A and B)
3. Each can use a different network
4. View the side-by-side diff of logs, invocations, and compute usage

### Account State Diff
1. Navigate to the "Accounts" tab
2. Enter a transaction signature
3. Click "Analyze Accounts" to see what changed
4. Filter by change type to focus on specific changes

### Error Decoder
1. Navigate to the "Decode" tab
2. Paste an error code (`0x1771`) or full error message
3. Click "Decode Error" to see the explanation
4. For custom errors (6000+), upload the program's IDL

## URL Parameters

### Explorer Page
```
/?tx=<signature>&network=mainnet-beta
```

### Compare Page
```
/compare?txA=<sig1>&txB=<sig2>&netA=mainnet-beta&netB=devnet
```

### Accounts Page
```
/accounts?tx=<signature>&network=mainnet-beta
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Solana**: @solana/web3.js

## Architecture

```
src/
├── pages/              # Page components
│   ├── ExplorerPage.tsx
│   ├── ComparePage.tsx
│   ├── AccountDiffPage.tsx
│   └── DecodePage.tsx
├── components/         # UI components
│   ├── Navigation.tsx
│   ├── TransactionInput.tsx
│   ├── LogTimeline.tsx
│   ├── LogEntry.tsx
│   ├── ComparisonView.tsx
│   ├── DiffSummary.tsx
│   ├── LogDiff.tsx
│   ├── InvocationDiff.tsx
│   ├── AccountDiffView.tsx
│   ├── AccountCard.tsx
│   ├── BalanceChange.tsx
│   ├── ErrorDecodeResult.tsx
│   ├── IdlUploader.tsx
│   ├── CommonErrors.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useTransaction.ts
│   ├── useComparison.ts
│   ├── useAccountDiff.ts
│   └── useToast.ts
├── lib/                # Core logic
│   ├── solana.ts       # RPC integration
│   ├── logParser.ts    # Log parsing engine
│   ├── comparator.ts   # Transaction comparison logic
│   ├── accountDiff.ts  # Account change extraction
│   └── errorDecoder.ts # Error code decoding
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx             # Main application with routing
```

## Log Types

| Type | Color | Description |
|------|-------|-------------|
| INVOKE | Cyan | Program invocation start |
| SUCCESS | Green | Program completed successfully |
| FAILURE | Red | Program execution failed |
| LOG | Gray | Program log output |
| COMPUTE | Yellow | Compute unit consumption |
| RETURN | Purple | Return data from program |
| DATA | Gray | Program data output |

## Known Programs & Tokens

The tool recognizes and displays friendly names for:

**Programs:**
- System Program, Token Program, Token-2022
- Associated Token Program, Compute Budget
- Metaplex Token Metadata
- Jupiter v6, Raydium AMM, Orca Whirlpool

**Tokens:**
- SOL, USDC, USDT, mSOL, BONK, JUP, PYTH, HNT, RENDER

## RPC Configuration

By default, the app uses public RPC endpoints. For better reliability, you can configure custom endpoints:

```env
# .env
VITE_RPC_MAINNET=https://your-mainnet-rpc.com
VITE_RPC_DEVNET=https://your-devnet-rpc.com

# Or use Alchemy
VITE_ALCHEMY_API_KEY=your-alchemy-key
```

## Limitations

- Dependent on RPC availability and rate limits
- Logs are only as accurate as on-chain output
- Token symbol resolution limited to common tokens
- Account data changes (beyond balances) not yet supported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for Solana developers
