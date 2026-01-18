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

// Get Alchemy API key from environment
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || '';

// Build RPC endpoints - prioritize env vars, then Alchemy, then fallback
export const RPC_ENDPOINTS: Record<Network, string> = {
    'mainnet-beta': import.meta.env.VITE_RPC_MAINNET ||
        (ALCHEMY_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://rpc.ankr.com/solana'),
    'devnet': import.meta.env.VITE_RPC_DEVNET ||
        (ALCHEMY_API_KEY ? `https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://rpc.ankr.com/solana_devnet'),
};
