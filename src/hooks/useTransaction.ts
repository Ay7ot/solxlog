import { useState, useCallback } from 'react';
import { Network, ParsedTransaction, FetchState } from '../types';
import { fetchTransaction } from '../lib/solana';

interface UseTransactionReturn extends FetchState<ParsedTransaction> {
  fetch: (signature: string, network: Network) => Promise<void>;
  reset: () => void;
}

export function useTransaction(): UseTransactionReturn {
  const [state, setState] = useState<FetchState<ParsedTransaction>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (signature: string, network: Network) => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await fetchTransaction(signature, network);
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const error = err as Error;
      console.error('Transaction fetch error:', error);
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
