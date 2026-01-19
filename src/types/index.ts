// Network types
export type Network = 'mainnet-beta' | 'devnet';

// Log type classification
export enum LogType {
    INVOKE = 'INVOKE',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOG = 'LOG',
    COMPUTE = 'COMPUTE',
    RETURN_DATA = 'RETURN_DATA',
    DATA = 'DATA',
    UNKNOWN = 'UNKNOWN',
}

// Parsed log entry
export interface ParsedLog {
    id: string;
    type: LogType;
    message: string;
    rawMessage: string;
    depth: number;
    programId?: string;
    invokeLevel?: number;
    computeUnits?: {
        consumed: number;
        total: number;
    };
    returnData?: string;
    timestamp?: number;
    index: number;
}

// Program invocation group
export interface ProgramInvocation {
    programId: string;
    depth: number;
    invokeLevel: number;
    logs: ParsedLog[];
    success: boolean;
    computeUnits?: {
        consumed: number;
        total: number;
    };
    children: ProgramInvocation[];
    startIndex: number;
    endIndex: number;
}

// Compute stats
export interface ComputeStats {
    totalConsumed: number;
    totalBudget: number;
    percentUsed: number;
    perProgram: {
        programId: string;
        consumed: number;
        total: number;
    }[];
}

// Transaction error info
export interface TransactionError {
    message: string;
    programId?: string;
    instructionIndex?: number;
    errorCode?: string;
    rawError: unknown;
}

// Full parsed transaction result
export interface ParsedTransaction {
    signature: string;
    slot: number;
    blockTime?: number;
    success: boolean;
    logs: ParsedLog[];
    invocations: ProgramInvocation[];
    computeStats: ComputeStats;
    error?: TransactionError;
    fee?: number;
    rawLogMessages: string[];
}

// Fetch state
export interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

// RPC endpoint configuration
export interface RpcConfig {
    network: Network;
    endpoint: string;
}

// ============================================
// Comparison Types
// ============================================

// Diff status for each item
export type DiffStatus = 'same' | 'different' | 'only_a' | 'only_b';

// Log diff entry
export interface LogDiffEntry {
    status: DiffStatus;
    logA?: ParsedLog;
    logB?: ParsedLog;
    index: number;
}

// Invocation diff entry
export interface InvocationDiffEntry {
    status: DiffStatus;
    invocationA?: ProgramInvocation;
    invocationB?: ProgramInvocation;
    programId: string;
    depth: number;
    children: InvocationDiffEntry[];
}

// Compute stats diff
export interface ComputeStatsDiff {
    totalConsumedA: number;
    totalConsumedB: number;
    totalConsumedDiff: number;
    totalConsumedDiffPercent: number;
    totalBudgetA: number;
    totalBudgetB: number;
    programDiffs: {
        programId: string;
        consumedA: number;
        consumedB: number;
        diff: number;
        status: DiffStatus;
    }[];
}

// Summary of differences
export interface ComparisonSummary {
    statusA: 'success' | 'failure';
    statusB: 'success' | 'failure';
    statusMatch: boolean;
    computeDiff: ComputeStatsDiff;
    totalLogDifferences: number;
    firstDivergenceIndex: number | null;
    programsOnlyInA: string[];
    programsOnlyInB: string[];
    programsInBoth: string[];
}

// Full comparison result
export interface ComparisonResult {
    transactionA: ParsedTransaction;
    transactionB: ParsedTransaction;
    summary: ComparisonSummary;
    logDiff: LogDiffEntry[];
    invocationDiff: InvocationDiffEntry[];
}

// Transaction slot for comparison (A or B)
export type TransactionSlot = 'A' | 'B';

// Comparison state
export interface ComparisonState {
    transactionA: FetchState<ParsedTransaction>;
    transactionB: FetchState<ParsedTransaction>;
    comparison: ComparisonResult | null;
}

// ============================================
// Account Diff Types
// ============================================

// SOL balance change
export interface SolChange {
    before: number; // in lamports
    after: number;
    diff: number;
}

// Token balance change
export interface TokenChange {
    mint: string;
    symbol?: string;
    before: number;
    after: number;
    diff: number;
    decimals: number;
    owner: string;
}

// Account type classification
export type AccountType = 'wallet' | 'token_account' | 'program' | 'pda' | 'system' | 'unknown';

// Single account change
export interface AccountChange {
    address: string;
    index: number;
    isSigner: boolean;
    isWritable: boolean;
    isFeePayer: boolean;
    accountType: AccountType;
    label?: string; // e.g., "Fee Payer", "Token Program"
    solChange: SolChange | null;
    tokenChanges: TokenChange[];
    dataChanged: boolean;
    isNew: boolean; // Account was created in this tx
    isClosed: boolean; // Account was closed in this tx
}

// Summary of account changes
export interface AccountDiffSummary {
    totalAccounts: number;
    accountsModified: number;
    solTransferred: number; // in SOL (not lamports)
    tokenTransfers: number;
    accountsCreated: number;
    accountsClosed: number;
}

// Full account diff result
export interface AccountDiffResult {
    signature: string;
    slot: number;
    blockTime?: number;
    success: boolean;
    fee: number;
    accounts: AccountChange[];
    summary: AccountDiffSummary;
}

// Filter options for account diff view
export type AccountDiffFilter = 'all' | 'changed' | 'sol' | 'tokens' | 'created';

// ============================================
// Error Decoder Types
// ============================================

// Error category based on Anchor's numbering scheme
export type ErrorCategory =
    | 'solana_builtin'      // 0-99
    | 'anchor_instruction'  // 100-999
    | 'anchor_idl'          // 1000-1999
    | 'anchor_constraint'   // 2000-2999
    | 'anchor_account'      // 3000-4099
    | 'anchor_misc'         // 4100-4999
    | 'anchor_deprecated'   // 5000
    | 'custom_program';     // 6000+

// Decoded error result
export interface DecodedError {
    code: number;
    hex: string;
    category: ErrorCategory;
    categoryLabel: string;
    name?: string;
    message?: string;
    suggestion?: string;
    range: string;
}

// Error entry in database
export interface ErrorEntry {
    code: number;
    name: string;
    message?: string;
    suggestion?: string;
}

// Anchor IDL structure (partial - only what we need for errors)
export interface AnchorIdl {
    name?: string;
    version?: string;
    errors?: Array<{
        code: number;
        name: string;
        msg?: string;
    }>;
}

// Get Alchemy API key from environment
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || '';

// Build RPC endpoints - prioritize env vars, then Alchemy, then fallback
export const RPC_ENDPOINTS: Record<Network, string> = {
    'mainnet-beta': import.meta.env.VITE_RPC_MAINNET ||
        (ALCHEMY_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://rpc.ankr.com/solana'),
    'devnet': import.meta.env.VITE_RPC_DEVNET ||
        (ALCHEMY_API_KEY ? `https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://rpc.ankr.com/solana_devnet'),
};
