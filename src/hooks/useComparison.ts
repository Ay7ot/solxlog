import { useState, useCallback, useMemo } from 'react';
import { Network, ParsedTransaction, FetchState, ComparisonResult, TransactionSlot } from '../types';
import { fetchTransaction } from '../lib/solana';
import { compareTransactions } from '../lib/comparator';

interface TransactionInput {
    signature: string;
    network: Network;
}

interface UseComparisonReturn {
    // Transaction A state
    transactionA: FetchState<ParsedTransaction>;
    // Transaction B state
    transactionB: FetchState<ParsedTransaction>;
    // Comparison result (null if both transactions aren't loaded)
    comparison: ComparisonResult | null;
    // Fetch a transaction for slot A or B
    fetchTransaction: (slot: TransactionSlot, signature: string, network: Network) => Promise<void>;
    // Reset a specific slot
    resetSlot: (slot: TransactionSlot) => void;
    // Reset everything
    resetAll: () => void;
    // Check if we can compare (both loaded)
    canCompare: boolean;
    // Check if either is loading
    isLoading: boolean;
}

const initialState: FetchState<ParsedTransaction> = {
    data: null,
    loading: false,
    error: null,
};

export function useComparison(): UseComparisonReturn {
    const [transactionA, setTransactionA] = useState<FetchState<ParsedTransaction>>(initialState);
    const [transactionB, setTransactionB] = useState<FetchState<ParsedTransaction>>(initialState);

    // Compute comparison when both transactions are loaded
    const comparison = useMemo(() => {
        if (transactionA.data && transactionB.data) {
            return compareTransactions(transactionA.data, transactionB.data);
        }
        return null;
    }, [transactionA.data, transactionB.data]);

    const fetchTx = useCallback(async (slot: TransactionSlot, signature: string, network: Network) => {
        const setState = slot === 'A' ? setTransactionA : setTransactionB;

        setState({ data: null, loading: true, error: null });

        try {
            const result = await fetchTransaction(signature, network);
            setState({ data: result, loading: false, error: null });
        } catch (err) {
            const error = err as Error;
            console.error(`Transaction ${slot} fetch error:`, error);
            setState({ data: null, loading: false, error: error.message });
        }
    }, []);

    const resetSlot = useCallback((slot: TransactionSlot) => {
        const setState = slot === 'A' ? setTransactionA : setTransactionB;
        setState(initialState);
    }, []);

    const resetAll = useCallback(() => {
        setTransactionA(initialState);
        setTransactionB(initialState);
    }, []);

    const canCompare = Boolean(transactionA.data && transactionB.data);
    const isLoading = transactionA.loading || transactionB.loading;

    return {
        transactionA,
        transactionB,
        comparison,
        fetchTransaction: fetchTx,
        resetSlot,
        resetAll,
        canCompare,
        isLoading,
    };
}

/**
 * Parse URL params for comparison
 */
export function parseComparisonParams(): { txA?: TransactionInput; txB?: TransactionInput } {
    const params = new URLSearchParams(window.location.search);
    const result: { txA?: TransactionInput; txB?: TransactionInput } = {};

    const sigA = params.get('txA');
    const sigB = params.get('txB');
    const netA = params.get('netA') as Network | null;
    const netB = params.get('netB') as Network | null;

    if (sigA) {
        result.txA = {
            signature: sigA,
            network: netA || 'mainnet-beta',
        };
    }

    if (sigB) {
        result.txB = {
            signature: sigB,
            network: netB || 'mainnet-beta',
        };
    }

    return result;
}

/**
 * Update URL params with current comparison state
 */
export function updateComparisonParams(
    sigA?: string,
    netA?: Network,
    sigB?: string,
    netB?: Network
): void {
    const params = new URLSearchParams();

    if (sigA) {
        params.set('txA', sigA);
        if (netA && netA !== 'mainnet-beta') {
            params.set('netA', netA);
        }
    }

    if (sigB) {
        params.set('txB', sigB);
        if (netB && netB !== 'mainnet-beta') {
            params.set('netB', netB);
        }
    }

    const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
}
