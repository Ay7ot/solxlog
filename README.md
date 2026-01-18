# Solana Log Explorer

A lightweight, open-source web tool that helps developers **understand Solana transaction logs**, not just view them.

![Solana Log Explorer](https://img.shields.io/badge/Solana-Log%20Explorer-purple?style=for-the-badge&logo=solana)

## Features

- **Structured Log Timeline**: Logs grouped by program invocation with visual depth indicators
- **Log Type Highlighting**: Color-coded log types (invoke, success, failure, compute, etc.)
- **Compute Unit Insights**: Per-instruction breakdown with visual progress bars
- **Error Summary**: Prominent error display with program and instruction details
- **Network Switching**: Toggle between Mainnet and Devnet
- **Shareable URLs**: Transaction signature preserved in URL for easy sharing
- **Raw Log View**: Toggle between structured and raw log display

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

1. Enter a Solana transaction signature in the input field
2. Select the network (Mainnet or Devnet)
3. Click "Explore Logs" to fetch and analyze the transaction
4. Browse the structured log timeline, compute insights, and error details

### URL Parameters

You can link directly to a transaction by using URL parameters:

```
https://your-domain.com/?tx=<signature>&network=mainnet-beta
```

- `tx` or `signature`: The transaction signature
- `network`: Either `mainnet-beta` or `devnet`

## Tech Stack

- **Frontend**: React + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Solana**: @solana/web3.js

## Log Types

| Type | Color | Description |
|------|-------|-------------|
| INVOKE | Blue | Program invocation start |
| SUCCESS | Green | Program completed successfully |
| FAILURE | Red | Program execution failed |
| LOG | Gray | Program log output |
| COMPUTE | Yellow | Compute unit consumption |
| RETURN | Purple | Return data from program |
| DATA | Gray | Program data output |

## Architecture

```
src/
├── components/       # React UI components
│   ├── TransactionInput.tsx
│   ├── NetworkSwitcher.tsx
│   ├── LogTimeline.tsx
│   ├── LogEntry.tsx
│   ├── ErrorSummary.tsx
│   ├── ComputeInsights.tsx
│   └── Toast.tsx
├── hooks/            # Custom React hooks
│   ├── useTransaction.ts
│   └── useToast.ts
├── lib/              # Core logic
│   ├── solana.ts     # RPC integration
│   └── logParser.ts  # Log parsing engine
├── types/            # TypeScript types
│   └── index.ts
└── App.tsx           # Main application
```

## Known Programs

The tool recognizes and displays friendly names for common Solana programs:

- System Program
- Token Program
- Token-2022
- Associated Token Program
- Compute Budget Program
- Metaplex Token Metadata
- Jupiter v6
- Raydium AMM
- Orca Whirlpool
- And more...

## Limitations

- Dependent on RPC availability and rate limits
- Logs are only as accurate as on-chain output
- Some compute data may vary by transaction version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for Solana developers 🟣
