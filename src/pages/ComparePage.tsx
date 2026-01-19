import { useState, useCallback, useEffect } from 'react';
import { Network, TransactionSlot } from '../types';
import { useComparison, parseComparisonParams, updateComparisonParams } from '../hooks/useComparison';
import { useToast } from '../hooks/useToast';
import { NetworkSwitcher } from '../components/NetworkSwitcher';
import { ComparisonView } from '../components/ComparisonView';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastContainer } from '../components/Toast';
import { isValidSignature } from '../lib/solana';

export function ComparePage() {
    const [signatureA, setSignatureA] = useState('');
    const [signatureB, setSignatureB] = useState('');
    const [networkA, setNetworkA] = useState<Network>('mainnet-beta');
    const [networkB, setNetworkB] = useState<Network>('mainnet-beta');
    const [errorA, setErrorA] = useState<string | null>(null);
    const [errorB, setErrorB] = useState<string | null>(null);

    const { toasts, addToast, removeToast } = useToast();
    const {
        transactionA,
        transactionB,
        comparison,
        fetchTransaction,
        resetSlot,
        isLoading,
    } = useComparison();

    // Load from URL params on mount
    useEffect(() => {
        const params = parseComparisonParams();
        if (params.txA) {
            setSignatureA(params.txA.signature);
            setNetworkA(params.txA.network);
            if (isValidSignature(params.txA.signature)) {
                fetchTransaction('A', params.txA.signature, params.txA.network);
            }
        }
        if (params.txB) {
            setSignatureB(params.txB.signature);
            setNetworkB(params.txB.network);
            if (isValidSignature(params.txB.signature)) {
                fetchTransaction('B', params.txB.signature, params.txB.network);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFetch = useCallback(async (slot: TransactionSlot) => {
        const signature = slot === 'A' ? signatureA : signatureB;
        const network = slot === 'A' ? networkA : networkB;
        const setError = slot === 'A' ? setErrorA : setErrorB;

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

        // Update URL
        updateComparisonParams(
            slot === 'A' ? trimmed : signatureA.trim() || undefined,
            slot === 'A' ? network : networkA,
            slot === 'B' ? trimmed : signatureB.trim() || undefined,
            slot === 'B' ? network : networkB
        );

        try {
            await fetchTransaction(slot, trimmed, network);
        } catch (err) {
            const error = err as Error;
            addToast('error', `Transaction ${slot}: ${error.message}`);
        }
    }, [signatureA, signatureB, networkA, networkB, fetchTransaction, addToast]);

    const handleClear = useCallback((slot: TransactionSlot) => {
        if (slot === 'A') {
            setSignatureA('');
            setErrorA(null);
            resetSlot('A');
            updateComparisonParams(undefined, networkA, signatureB.trim() || undefined, networkB);
        } else {
            setSignatureB('');
            setErrorB(null);
            resetSlot('B');
            updateComparisonParams(signatureA.trim() || undefined, networkA, undefined, networkB);
        }
    }, [resetSlot, signatureA, signatureB, networkA, networkB]);

    const handlePaste = useCallback(async (slot: TransactionSlot) => {
        try {
            const text = await navigator.clipboard.readText();
            if (slot === 'A') {
                setSignatureA(text.trim());
                setErrorA(null);
            } else {
                setSignatureB(text.trim());
                setErrorB(null);
            }
        } catch {
            addToast('error', 'Could not access clipboard');
        }
    }, [addToast]);

    return (
        <>
            <div className="space-y-8">
                {/* Hero */}
                {!comparison && !isLoading && (
                    <section className="text-center py-8 sm:py-12">
                        <div className="inline-block mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 border border-[var(--purple)]/30 bg-[var(--purple)]/5 text-[var(--purple)] text-xs font-mono">
                                <span className="w-1.5 h-1.5 bg-[var(--purple)]" />
                                TRANSACTION DIFF TOOL
                            </div>
                        </div>

                        <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                            Compare
                            <br />
                            <span className="text-[var(--purple)]" style={{ textShadow: '0 0 40px rgba(177, 78, 255, 0.4)' }}>
                                Transactions
                            </span>
                        </h2>

                        <p className="mt-6 text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                            Side-by-side comparison of two Solana transactions. Find differences in execution flow, compute usage, and errors.
                        </p>

                        {/* Use cases */}
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            {[
                                { label: 'DEBUG FAILURES', color: 'pink' },
                                { label: 'COMPARE VERSIONS', color: 'cyan' },
                                { label: 'ANALYZE COMPUTE', color: 'yellow' },
                                { label: 'DIFF LOGS', color: 'green' },
                            ].map((feature) => (
                                <div
                                    key={feature.label}
                                    className={`flex items-center gap-2 px-3 py-2 border border-[var(--${feature.color})]/20 bg-[var(--${feature.color})]/5`}
                                >
                                    <span className={`w-1.5 h-1.5 bg-[var(--${feature.color})]`} />
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Dual Input Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Transaction A */}
                    <TransactionInputCard
                        slot="A"
                        signature={signatureA}
                        setSignature={setSignatureA}
                        network={networkA}
                        setNetwork={setNetworkA}
                        error={errorA}
                        setError={setErrorA}
                        fetchError={transactionA.error}
                        loading={transactionA.loading}
                        loaded={!!transactionA.data}
                        success={transactionA.data?.success}
                        onFetch={() => handleFetch('A')}
                        onClear={() => handleClear('A')}
                        onPaste={() => handlePaste('A')}
                        color="cyan"
                    />

                    {/* Transaction B */}
                    <TransactionInputCard
                        slot="B"
                        signature={signatureB}
                        setSignature={setSignatureB}
                        network={networkB}
                        setNetwork={setNetworkB}
                        error={errorB}
                        setError={setErrorB}
                        fetchError={transactionB.error}
                        loading={transactionB.loading}
                        loaded={!!transactionB.data}
                        success={transactionB.data?.success}
                        onFetch={() => handleFetch('B')}
                        onClear={() => handleClear('B')}
                        onPaste={() => handlePaste('B')}
                        color="pink"
                    />
                </section>

                {/* Loading */}
                {isLoading && <LoadingSkeleton />}

                {/* Comparison Results */}
                {comparison && !isLoading && (
                    <ComparisonView comparison={comparison} />
                )}

                {/* Hint when one is loaded */}
                {!comparison && !isLoading && (transactionA.data || transactionB.data) && (
                    <div className="card p-6 text-center">
                        <p className="text-[var(--text-muted)] font-mono text-sm">
                            {!transactionA.data && transactionB.data && (
                                <>Load Transaction A to compare</>
                            )}
                            {transactionA.data && !transactionB.data && (
                                <>Load Transaction B to compare</>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Toasts */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
}

interface TransactionInputCardProps {
    slot: TransactionSlot;
    signature: string;
    setSignature: (sig: string) => void;
    network: Network;
    setNetwork: (net: Network) => void;
    error: string | null;
    setError: (err: string | null) => void;
    fetchError: string | null;
    loading: boolean;
    loaded: boolean;
    success?: boolean;
    onFetch: () => void;
    onClear: () => void;
    onPaste: () => void;
    color: 'cyan' | 'pink';
}

function TransactionInputCard({
    slot,
    signature,
    setSignature,
    network,
    setNetwork,
    error,
    setError,
    fetchError,
    loading,
    loaded,
    success,
    onFetch,
    onClear,
    onPaste,
    color,
}: TransactionInputCardProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFetch();
    };

    return (
        <div className="relative">
            {/* Accent border */}
            <div className={`absolute -top-[1px] left-0 w-16 h-[2px] bg-[var(--${color})]`} />
            <div className={`absolute -top-[1px] right-0 w-16 h-[2px] bg-[var(--${color})]`} />

            <div className={`card p-5 border ${loaded ? `border-[var(--${color})]/50` : 'border-[var(--border-bright)]'}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 flex items-center justify-center bg-[var(--${color})]/10 border border-[var(--${color})]/30 text-[var(--${color})] font-mono font-bold text-sm`}>
                                {slot}
                            </span>
                            <span className="font-display font-bold text-white">
                                Transaction {slot}
                            </span>
                            {loaded && (
                                <span className={`px-2 py-0.5 text-[10px] font-mono ${
                                    success
                                        ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                        : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                                }`}>
                                    {success ? 'SUCCESS' : 'FAILED'}
                                </span>
                            )}
                        </div>
                        <NetworkSwitcher
                            network={network}
                            onChange={setNetwork}
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
                            placeholder="Enter transaction signature..."
                            className="input-field w-full px-4 py-3 pr-20 text-sm"
                            disabled={loading}
                            spellCheck={false}
                            autoComplete="off"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {signature && (
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                                    title="Clear"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onPaste}
                                className={`p-1.5 text-[var(--text-muted)] hover:text-[var(--${color})] transition-colors`}
                                title="Paste"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {(error || fetchError) && (
                        <div className="flex items-center gap-2 text-[var(--red)] text-xs">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error || fetchError}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !signature.trim()}
                        className={`w-full py-2.5 font-mono text-sm transition-all flex items-center justify-center gap-2 ${
                            loading || !signature.trim()
                                ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                                : `bg-[var(--${color})]/10 text-[var(--${color})] border border-[var(--${color})]/30 hover:bg-[var(--${color})]/20`
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </>
                        ) : loaded ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reload
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Load Transaction
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
