import { Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import {
    Network,
    RPC_ENDPOINTS,
    AccountChange,
    AccountDiffResult,
    AccountDiffSummary,
    SolChange,
    TokenChange,
    AccountType,
} from '../types';
import { isValidSignature } from './solana';

// LAMPORTS_PER_SOL constant
const LAMPORTS_PER_SOL = 1_000_000_000;

// Known token symbols by mint address
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
    'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9 },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6 },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6 },
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', decimals: 9 },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', decimals: 5 },
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'ETH', decimals: 8 },
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', decimals: 6 },
    'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': { symbol: 'RENDER', decimals: 8 },
    'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH', decimals: 6 },
    'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': { symbol: 'HNT', decimals: 8 },
};

// Known program addresses
const KNOWN_PROGRAMS: Record<string, string> = {
    '11111111111111111111111111111111': 'System Program',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token',
    'ComputeBudget111111111111111111111111111111': 'Compute Budget',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': 'Metaplex Metadata',
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter v6',
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM',
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca Whirlpool',
};

// Connection cache
const connectionCache = new Map<Network, Connection>();

function getConnection(network: Network): Connection {
    if (!connectionCache.has(network)) {
        const endpoint = RPC_ENDPOINTS[network];
        const connection = new Connection(endpoint, { commitment: 'confirmed' });
        connectionCache.set(network, connection);
    }
    return connectionCache.get(network)!;
}

/**
 * Determine account type based on various heuristics
 */
function classifyAccount(
    address: string,
    isExecutable: boolean,
    preBalance: number,
    postBalance: number
): AccountType {
    // Check if it's a known program
    if (KNOWN_PROGRAMS[address] || isExecutable) {
        return 'program';
    }

    // System program
    if (address === '11111111111111111111111111111111') {
        return 'system';
    }

    // If balance is 0 before and after, might be a PDA
    if (preBalance === 0 && postBalance === 0) {
        return 'pda';
    }

    return 'wallet';
}

/**
 * Get label for an account
 */
function getAccountLabel(
    address: string,
    isFeePayer: boolean,
    isSigner: boolean,
    accountType: AccountType
): string | undefined {
    if (isFeePayer) return 'Fee Payer';

    const programName = KNOWN_PROGRAMS[address];
    if (programName) return programName;

    if (accountType === 'program') return 'Program';
    if (isSigner && !isFeePayer) return 'Signer';

    return undefined;
}

/**
 * Get token info from mint address
 */
function getTokenInfo(mint: string): { symbol: string; decimals: number } | undefined {
    return KNOWN_TOKENS[mint];
}

/**
 * Extract account changes from a parsed transaction
 */
export function extractAccountChanges(
    transaction: ParsedTransactionWithMeta
): AccountChange[] {
    const meta = transaction.meta;
    const message = transaction.transaction.message;

    if (!meta) {
        return [];
    }

    // Get account keys - handle both legacy and versioned transactions
    const accountKeys = message.accountKeys.map((key) =>
        typeof key === 'string' ? key : key.pubkey.toBase58()
    );

    const preBalances = meta.preBalances;
    const postBalances = meta.postBalances;
    const preTokenBalances = meta.preTokenBalances || [];
    const postTokenBalances = meta.postTokenBalances || [];

    // Build token balance maps
    const preTokenMap = new Map<number, typeof preTokenBalances[0]>();
    const postTokenMap = new Map<number, typeof postTokenBalances[0]>();

    for (const tb of preTokenBalances) {
        preTokenMap.set(tb.accountIndex, tb);
    }
    for (const tb of postTokenBalances) {
        postTokenMap.set(tb.accountIndex, tb);
    }

    // Get header info for signers/writables
    // @ts-expect-error - header exists on parsed message but types are incomplete
    const numRequiredSignatures = message.header?.numRequiredSignatures || 1;

    const accounts: AccountChange[] = [];

    for (let i = 0; i < accountKeys.length; i++) {
        const address = accountKeys[i];
        const preBal = preBalances[i] || 0;
        const postBal = postBalances[i] || 0;

        const isSigner = i < numRequiredSignatures;
        const isFeePayer = i === 0;
        const isWritable = true; // Simplified - would need more complex logic for exact determination

        // SOL change
        let solChange: SolChange | null = null;
        if (preBal !== postBal) {
            solChange = {
                before: preBal,
                after: postBal,
                diff: postBal - preBal,
            };
        }

        // Token changes
        const tokenChanges: TokenChange[] = [];
        const preToken = preTokenMap.get(i);
        const postToken = postTokenMap.get(i);

        if (preToken || postToken) {
            const mint = preToken?.mint || postToken?.mint || '';
            const owner = preToken?.owner || postToken?.owner || '';
            const decimals = preToken?.uiTokenAmount?.decimals || postToken?.uiTokenAmount?.decimals || 0;

            const preBefore = preToken?.uiTokenAmount?.uiAmount || 0;
            const postAfter = postToken?.uiTokenAmount?.uiAmount || 0;

            if (preBefore !== postAfter || preToken || postToken) {
                const tokenInfo = getTokenInfo(mint);
                tokenChanges.push({
                    mint,
                    symbol: tokenInfo?.symbol,
                    before: preBefore,
                    after: postAfter,
                    diff: postAfter - preBefore,
                    decimals,
                    owner,
                });
            }
        }

        // Determine if data changed (simplified - we consider balance changes as data changes)
        const dataChanged = solChange !== null || tokenChanges.length > 0;

        // Check if account was created or closed
        const isNew = preBal === 0 && postBal > 0;
        const isClosed = preBal > 0 && postBal === 0;

        // Classify account type
        const accountType = classifyAccount(address, false, preBal, postBal);

        // Get label
        const label = getAccountLabel(address, isFeePayer, isSigner, accountType);

        accounts.push({
            address,
            index: i,
            isSigner,
            isWritable,
            isFeePayer,
            accountType,
            label,
            solChange,
            tokenChanges,
            dataChanged,
            isNew,
            isClosed,
        });
    }

    return accounts;
}

/**
 * Calculate summary statistics from account changes
 */
export function calculateSummary(accounts: AccountChange[]): AccountDiffSummary {
    let accountsModified = 0;
    let solTransferred = 0;
    let tokenTransfers = 0;
    let accountsCreated = 0;
    let accountsClosed = 0;

    for (const account of accounts) {
        if (account.dataChanged) {
            accountsModified++;
        }

        if (account.solChange && !account.isFeePayer) {
            // Only count positive transfers (to avoid double counting)
            if (account.solChange.diff > 0) {
                solTransferred += account.solChange.diff;
            }
        }

        tokenTransfers += account.tokenChanges.filter((tc) => tc.diff !== 0).length;

        if (account.isNew) accountsCreated++;
        if (account.isClosed) accountsClosed++;
    }

    return {
        totalAccounts: accounts.length,
        accountsModified,
        solTransferred: solTransferred / LAMPORTS_PER_SOL,
        tokenTransfers,
        accountsCreated,
        accountsClosed,
    };
}

/**
 * Fetch transaction and extract account diff
 */
export async function fetchAccountDiff(
    signature: string,
    network: Network
): Promise<AccountDiffResult> {
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

    const accounts = extractAccountChanges(transaction);
    const fee = transaction.meta?.fee || 0;
    const summary = calculateSummary(accounts);

    return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime || undefined,
        success: !transaction.meta?.err,
        fee,
        accounts,
        summary,
    };
}

/**
 * Format lamports to SOL string
 */
export function formatLamportsToSol(lamports: number, decimals: number = 4): string {
    const sol = lamports / LAMPORTS_PER_SOL;
    if (Math.abs(sol) < 0.0001 && sol !== 0) {
        return sol.toExponential(2);
    }
    return sol.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: number, decimals: number = 4): string {
    if (Math.abs(amount) < 0.0001 && amount !== 0) {
        return amount.toExponential(2);
    }
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format address for display
 */
export function formatAddress(address: string, length: number = 4): string {
    if (address.length <= length * 2 + 3) {
        return address;
    }
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Get explorer URL for an account
 */
export function getExplorerAccountUrl(address: string, network: Network): string {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/address/${address}${cluster}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(signature: string, network: Network): string {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${signature}${cluster}`;
}
