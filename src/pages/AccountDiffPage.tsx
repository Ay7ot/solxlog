import { useState, useCallback, useEffect } from 'react';
import { Network } from '../types';
import { useAccountDiff } from '../hooks/useAccountDiff';
import { useToast } from '../hooks/useToast';
import { NetworkSwitcher } from '../components/NetworkSwitcher';
import { AccountDiffView } from '../components/AccountDiffView';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastContainer } from '../components/Toast';
import { isValidSignature } from '../lib/solana';

export function AccountDiffPage() {
    const [signature, setSignature] = useState('');
    const [network, setNetwork] = useState<Network>('mainnet-beta');
    const [inputError, setInputError] = useState<string | null>(null);

    const { data, loading, error, fetch, reset } = useAccountDiff();
    const { toasts, addToast, removeToast } = useToast();

    // Load from URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tx = params.get('tx');
        const net = params.get('network') as Network | null;

        if (tx) {
            setSignature(tx);
            if (net === 'mainnet-beta' || net === 'devnet') {
                setNetwork(net);
            }
            if (isValidSignature(tx)) {
                fetch(tx, net || network);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setInputError(null);

            const trimmed = signature.trim();
            if (!trimmed) {
                setInputError('Please enter a transaction signature');
                return;
            }

            if (!isValidSignature(trimmed)) {
                setInputError('Invalid signature format');
                return;
            }

            // Update URL
            const url = new URL(window.location.href);
            url.searchParams.set('tx', trimmed);
            url.searchParams.set('network', network);
            window.history.pushState({}, '', url.toString());

            try {
                await fetch(trimmed, network);
            } catch (err) {
                const error = err as Error;
                addToast('error', error.message);
            }
        },
        [signature, network, fetch, addToast]
    );

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setSignature(text.trim());
            setInputError(null);
        } catch {
            addToast('error', 'Could not access clipboard');
        }
    }, [addToast]);

    const handleClear = useCallback(() => {
        setSignature('');
        setInputError(null);
        reset();
        const url = new URL(window.location.href);
        url.searchParams.delete('tx');
        window.history.pushState({}, '', url.toString());
    }, [reset]);

    return (
        <>
            <div className="space-y-8">
                {/* Hero - only show when no data */}
                {!data && !loading && !error && (
                    <section className="text-center py-8 sm:py-12">
                        <div className="inline-block mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 border border-[var(--green)]/30 bg-[var(--green)]/5 text-[var(--green)] text-xs font-mono">
                                <span className="w-1.5 h-1.5 bg-[var(--green)]" />
                                ACCOUNT ANALYSIS TOOL
                            </div>
                        </div>

                        <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                            Account
                            <br />
                            <span
                                className="text-[var(--green)]"
                                style={{ textShadow: '0 0 40px rgba(0, 255, 148, 0.4)' }}
                            >
                                State Diff
                            </span>
                        </h2>

                        <p className="mt-6 text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                            See exactly what changed in each account after a transaction. Track SOL
                            transfers, token movements, and account creation.
                        </p>

                        {/* Feature list */}
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            {[
                                { label: 'SOL BALANCES', color: 'cyan' },
                                { label: 'TOKEN TRANSFERS', color: 'yellow' },
                                { label: 'ACCOUNT CREATION', color: 'green' },
                                { label: 'FEE BREAKDOWN', color: 'pink' },
                            ].map((feature) => (
                                <div
                                    key={feature.label}
                                    className={`flex items-center gap-2 px-3 py-2 border border-[var(--${feature.color})]/20 bg-[var(--${feature.color})]/5`}
                                >
                                    <span className={`w-1.5 h-1.5 bg-[var(--${feature.color})]`} />
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                                        {feature.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Input Section */}
                <section className="relative">
                    {/* Accent borders */}
                    <div className="absolute -top-[1px] left-0 w-16 h-[2px] bg-[var(--green)]" />
                    <div className="absolute -top-[1px] right-0 w-16 h-[2px] bg-[var(--cyan)]" />
                    <div className="absolute -bottom-[1px] left-0 w-16 h-[2px] bg-[var(--yellow)]" />
                    <div className="absolute -bottom-[1px] right-0 w-16 h-[2px] bg-[var(--pink)]" />

                    <div className="card p-6 sm:p-8 border border-[var(--border-bright)]">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-white">
                                        Transaction Signature
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">
                                        Analyze account changes for a Solana transaction
                                    </p>
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
                                        setInputError(null);
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
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handlePaste}
                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors rounded"
                                        title="Paste from clipboard"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {inputError && (
                                <div className="flex items-center gap-2 text-[var(--red)] text-sm">
                                    <svg
                                        className="w-4 h-4 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {inputError}
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
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                            />
                                        </svg>
                                        Analyze Accounts
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Fetch Error */}
                {error && (
                    <section className="card p-5 border-[var(--red)]/50">
                        <div className="h-[2px] bg-[var(--red)] -mt-5 -mx-5 mb-5" />
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[var(--red)]/10 border border-[var(--red)]/30 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-[var(--red)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[var(--red)] font-display font-bold tracking-wide">
                                    FETCH ERROR
                                </h3>
                                <p className="text-white mt-1 text-sm font-mono">{error}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Loading */}
                {loading && <LoadingSkeleton />}

                {/* Results */}
                {data && !loading && <AccountDiffView result={data} network={network} />}
            </div>

            {/* Toasts */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
}
