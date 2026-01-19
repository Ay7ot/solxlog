import { useState } from 'react';
import { ComparisonResult } from '../types';
import { DiffSummary } from './DiffSummary';
import { LogDiff } from './LogDiff';
import { InvocationDiff } from './InvocationDiff';

interface ComparisonViewProps {
    comparison: ComparisonResult;
}

type ViewTab = 'summary' | 'invocations' | 'logs';

export function ComparisonView({ comparison }: ComparisonViewProps) {
    const [activeTab, setActiveTab] = useState<ViewTab>('summary');

    const tabs: { id: ViewTab; label: string; count?: number }[] = [
        { id: 'summary', label: 'Summary' },
        { id: 'invocations', label: 'Invocations' },
        { 
            id: 'logs', 
            label: 'Log Diff', 
            count: comparison.summary.totalLogDifferences 
        },
    ];

    return (
        <div className="space-y-6">
            {/* Transaction signatures header */}
            <div className="card p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-[var(--cyan)] font-mono uppercase tracking-wider mb-1">
                            Transaction A
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://explorer.solana.com/tx/${comparison.transactionA.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono text-white hover:text-[var(--cyan)] transition-colors truncate"
                            >
                                {comparison.transactionA.signature.slice(0, 20)}...{comparison.transactionA.signature.slice(-8)}
                            </a>
                            <span className={`px-1.5 py-0.5 text-[10px] font-mono ${
                                comparison.transactionA.success
                                    ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                    : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                            }`}>
                                {comparison.transactionA.success ? 'SUCCESS' : 'FAILED'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--pink)] font-mono uppercase tracking-wider mb-1">
                            Transaction B
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://explorer.solana.com/tx/${comparison.transactionB.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono text-white hover:text-[var(--pink)] transition-colors truncate"
                            >
                                {comparison.transactionB.signature.slice(0, 20)}...{comparison.transactionB.signature.slice(-8)}
                            </a>
                            <span className={`px-1.5 py-0.5 text-[10px] font-mono ${
                                comparison.transactionB.success
                                    ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                    : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                            }`}>
                                {comparison.transactionB.success ? 'SUCCESS' : 'FAILED'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-1 border-b border-[var(--border-dim)]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-mono transition-colors relative ${
                            activeTab === tab.id
                                ? 'text-white'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-[var(--yellow)]/10 text-[var(--yellow)] border border-[var(--yellow)]/30">
                                    {tab.count}
                                </span>
                            )}
                        </span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--pink)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {activeTab === 'summary' && (
                    <DiffSummary summary={comparison.summary} />
                )}
                {activeTab === 'invocations' && (
                    <InvocationDiff invocationDiff={comparison.invocationDiff} />
                )}
                {activeTab === 'logs' && (
                    <LogDiff 
                        logDiff={comparison.logDiff} 
                        firstDivergenceIndex={comparison.summary.firstDivergenceIndex}
                    />
                )}
            </div>
        </div>
    );
}
