import { useState, useCallback, useEffect } from 'react';
import { Network } from '../types';
import { NetworkSwitcher } from './NetworkSwitcher';
import { isValidSignature } from '../lib/solana';

interface TransactionInputProps {
  onSubmit: (signature: string, network: Network) => void;
  loading?: boolean;
  network: Network;
  onNetworkChange: (network: Network) => void;
}

export function TransactionInput({ onSubmit, loading, network, onNetworkChange }: TransactionInputProps) {
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sig = params.get('tx') || params.get('signature');
    const net = params.get('network') as Network | null;
    
    if (sig) {
      setSignature(sig);
      if (net === 'mainnet-beta' || net === 'devnet') {
        onNetworkChange(net);
      }
      if (isValidSignature(sig)) {
        onSubmit(sig, net || network);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = signature.trim();
    if (!trimmed) {
      setError('Please enter a transaction signature');
      return;
    }

    if (!isValidSignature(trimmed)) {
      setError('Invalid signature format');
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('tx', trimmed);
    url.searchParams.set('network', network);
    window.history.pushState({}, '', url.toString());

    onSubmit(trimmed, network);
  }, [signature, network, onSubmit]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSignature(text.trim());
      setError(null);
    } catch {
      setError('Could not access clipboard');
    }
  }, []);

  const handleClear = useCallback(() => {
    setSignature('');
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('tx');
    url.searchParams.delete('signature');
    window.history.pushState({}, '', url.toString());
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Transaction Signature
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Paste a Solana transaction to analyze its logs
          </p>
        </div>
        <NetworkSwitcher 
          network={network} 
          onChange={onNetworkChange} 
          disabled={loading}
        />
      </div>
      
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={signature}
          onChange={(e) => {
            setSignature(e.target.value);
            setError(null);
          }}
          placeholder="e.g. 5U3NmK7x9vBHzrW3zW5mWaALQxXJN..."
          className="input-field w-full px-4 py-4 pr-24 text-sm"
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
        />
        
        {/* Action buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {signature && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors rounded"
              title="Clear"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handlePaste}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors rounded"
            title="Paste from clipboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-[var(--red)] text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !signature.trim()}
        className="btn-primary w-full sm:w-auto px-8 py-3.5 font-semibold text-sm flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Fetching...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore Logs
          </>
        )}
      </button>
    </form>
  );
}
