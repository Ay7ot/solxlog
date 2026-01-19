import { useState, useCallback } from 'react';
import { Network } from '../types';
import { useTransaction } from '../hooks/useTransaction';
import { useToast } from '../hooks/useToast';
import { TransactionInput } from '../components/TransactionInput';
import { LogTimeline } from '../components/LogTimeline';
import { ErrorSummary } from '../components/ErrorSummary';
import { ComputeInsights } from '../components/ComputeInsights';
import { ToastContainer } from '../components/Toast';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function ExplorerPage() {
    const [network, setNetwork] = useState<Network>('mainnet-beta');
    const { data, loading, error, fetch, reset } = useTransaction();
    const { toasts, addToast, removeToast } = useToast();

    const handleSubmit = useCallback(async (signature: string, selectedNetwork: Network) => {
        reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
            await fetch(signature, selectedNetwork);
        } catch (err) {
            const error = err as Error;
            addToast('error', error.message);
        }
    }, [fetch, reset, addToast]);

    const handleNetworkChange = useCallback((newNetwork: Network) => {
        setNetwork(newNetwork);
    }, []);

    return (
        <>
            <div className="space-y-8">
                {/* Hero - only show when no data */}
                {!data && !loading && !error && (
                    <section className="text-center py-8 sm:py-16">
                        <div className="inline-block mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 border border-[var(--pink)]/30 bg-[var(--pink)]/5 text-[var(--pink)] text-xs font-mono">
                                <span className="w-1.5 h-1.5 bg-[var(--pink)]" />
                                SOLANA DEBUGGING TOOL
                            </div>
                        </div>

                        <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                            Transaction
                            <br />
                            <span className="text-[var(--pink)]" style={{ textShadow: '0 0 40px rgba(255, 45, 146, 0.4)' }}>
                                Log Explorer
                            </span>
                        </h2>

                        <p className="mt-6 text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                            Debug with clarity. Analyze execution flow, compute usage, and errors in a structured timeline view.
                        </p>

                        {/* Feature list */}
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            {[
                                { label: 'PROGRAM CALLS', color: 'cyan' },
                                { label: 'COMPUTE UNITS', color: 'yellow' },
                                { label: 'ERROR TRACKING', color: 'pink' },
                                { label: 'CALL HIERARCHY', color: 'green' },
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

                {/* Input Section */}
                <section className="relative">
                    {/* Accent borders */}
                    <div className="absolute -top-[1px] left-0 w-16 h-[2px] bg-[var(--cyan)]" />
                    <div className="absolute -top-[1px] right-0 w-16 h-[2px] bg-[var(--pink)]" />
                    <div className="absolute -bottom-[1px] left-0 w-16 h-[2px] bg-[var(--yellow)]" />
                    <div className="absolute -bottom-[1px] right-0 w-16 h-[2px] bg-[var(--green)]" />

                    <div className="card p-6 sm:p-8 border border-[var(--border-bright)]">
                        <TransactionInput
                            onSubmit={handleSubmit}
                            loading={loading}
                            network={network}
                            onNetworkChange={handleNetworkChange}
                        />
                    </div>
                </section>

                {/* Fetch Error */}
                {error && (
                    <section className="card p-5 border-[var(--red)]/50">
                        <div className="h-[2px] bg-[var(--red)] -mt-5 -mx-5 mb-5" />
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[var(--red)]/10 border border-[var(--red)]/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[var(--red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                {data && !loading && (
                    <div className="space-y-6">
                        {data.error && <ErrorSummary error={data.error} />}
                        <ComputeInsights stats={data.computeStats} />
                        <LogTimeline transaction={data} />
                    </div>
                )}
            </div>

            {/* Toasts */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
}
