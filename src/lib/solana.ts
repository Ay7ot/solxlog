import { Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import { Network, RPC_ENDPOINTS, ParsedTransaction } from '../types';
import { parseLogs, buildInvocationTree, calculateComputeStats, extractError } from './logParser';

// Connection cache
const connectionCache = new Map<Network, Connection>();

// Get or create connection for network
export function getConnection(network: Network): Connection {
    if (!connectionCache.has(network)) {
        const endpoint = RPC_ENDPOINTS[network];
        const connection = new Connection(endpoint, {
            commitment: 'confirmed',
        });
        connectionCache.set(network, connection);
    }
    return connectionCache.get(network)!;
}

// Validate transaction signature format
export function isValidSignature(signature: string): boolean {
    // Solana signatures are base58 encoded, typically 87-88 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return base58Regex.test(signature);
}

// Fetch and parse transaction
export async function fetchTransaction(
    signature: string,
    network: Network
): Promise<ParsedTransaction> {
    if (!isValidSignature(signature)) {
        throw new Error('Invalid transaction signature format');
    }

    const connection = getConnection(network);

    let transaction: ParsedTransactionWithMeta | null;

    try {
        transaction = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });
    } catch (err) {
        const error = err as Error;
        if (error.message?.includes('429')) {
            throw new Error('Rate limited by RPC. Please try again in a few seconds.');
        }
        throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    if (!transaction) {
        throw new Error('Transaction not found. It may not exist or has not been confirmed yet.');
    }

    const rawLogMessages = transaction.meta?.logMessages || [];
    const rawError = transaction.meta?.err;

    // Parse logs
    const parsedLogs = parseLogs(rawLogMessages);

    // Build invocation tree
    const invocations = buildInvocationTree(parsedLogs);

    // Calculate compute stats
    const computeStats = calculateComputeStats(parsedLogs);

    // Extract error if present
    const error = extractError(parsedLogs, rawError);

    return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime || undefined,
        success: !rawError,
        logs: parsedLogs,
        invocations,
        computeStats,
        error,
        fee: transaction.meta?.fee,
        rawLogMessages,
    };
}

// Format program ID for display (truncate middle)
export function formatProgramId(programId: string, length: number = 8): string {
    if (programId.length <= length * 2 + 3) {
        return programId;
    }
    return `${programId.slice(0, length)}...${programId.slice(-length)}`;
}

// Known program names
const KNOWN_PROGRAMS: Record<string, string> = {
    '11111111111111111111111111111111': 'System Program',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token',
    'ComputeBudget111111111111111111111111111111': 'Compute Budget',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': 'Metaplex Token Metadata',
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter v6',
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM',
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca Whirlpool',
    'So11111111111111111111111111111111111111112': 'Wrapped SOL',
    'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX': 'Serum DEX v3',
    '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin': 'Serum DEX v2',
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'Memo v2',
    'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo': 'Memo v1',
};

// Get program name
export function getProgramName(programId: string): string | null {
    return KNOWN_PROGRAMS[programId] || null;
}

// Format timestamp
export function formatTimestamp(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });
}

// Format SOL amount
export function formatSol(lamports: number): string {
    const sol = lamports / 1e9;
    return `${sol.toFixed(9)} SOL`;
}
