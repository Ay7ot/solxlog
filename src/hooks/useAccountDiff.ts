import { useState, useCallback } from 'react';
import { Network, AccountDiffResult, FetchState } from '../types';
import { fetchAccountDiff } from '../lib/accountDiff';

interface UseAccountDiffReturn extends FetchState<AccountDiffResult> {
    fetch: (signature: string, network: Network) => Promise<void>;
    reset: () => void;
}

export function useAccountDiff(): UseAccountDiffReturn {
    const [state, setState] = useState<FetchState<AccountDiffResult>>({
        data: null,
        loading: false,
        error: null,
    });

    const fetch = useCallback(async (signature: string, network: Network) => {
        setState({ data: null, loading: true, error: null });

        try {
            const result = await fetchAccountDiff(signature, network);
            setState({ data: result, loading: false, error: null });
        } catch (err) {
            const error = err as Error;
            console.error('Account diff fetch error:', error);
            setState({ data: null, loading: false, error: error.message });
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        fetch,
        reset,
    };
}
