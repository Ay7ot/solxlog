import { useState } from 'react';
import { AccountDiffResult, AccountDiffFilter, Network } from '../types';
import { AccountCardList } from './AccountCard';
import { formatLamportsToSol, getExplorerTxUrl } from '../lib/accountDiff';

interface AccountDiffViewProps {
    result: AccountDiffResult;
    network: Network;
}

export function AccountDiffView({ result, network }: AccountDiffViewProps) {
    const [filter, setFilter] = useState<AccountDiffFilter>('all');
    const { summary, accounts, signature, success, fee } = result;

    const filterOptions: { id: AccountDiffFilter; label: string; count: number }[] = [
        { id: 'all', label: 'All', count: accounts.length },
        { id: 'changed', label: 'Changed', count: summary.accountsModified },
        { id: 'sol', label: 'SOL Changes', count: accounts.filter(a => a.solChange).length },
        { id: 'tokens', label: 'Token Changes', count: summary.tokenTransfers },
        { id: 'created', label: 'Created/Closed', count: summary.accountsCreated + summary.accountsClosed },
    ];

    return (
        <div className="space-y-6">
            {/* Transaction header */}
            <div className="card p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1">
                            Transaction
                        </div>
                        <a
                            href={getExplorerTxUrl(signature, network)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-white hover:text-[var(--cyan)] transition-colors"
                        >
                            {signature.slice(0, 20)}...{signature.slice(-8)}
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span
                            className={`px-2 py-1 text-xs font-mono ${
                                success
                                    ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                    : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                            }`}
                        >
                            {success ? 'SUCCESS' : 'FAILED'}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                            Fee: {formatLamportsToSol(fee)} SOL
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                    label="Accounts Involved"
                    value={summary.totalAccounts}
                    color="cyan"
                />
                <SummaryCard
                    label="Accounts Modified"
                    value={summary.accountsModified}
                    color="yellow"
                />
                <SummaryCard
                    label="SOL Transferred"
                    value={summary.solTransferred.toFixed(4)}
                    suffix="SOL"
                    color="green"
                />
                <SummaryCard
                    label="Token Transfers"
                    value={summary.tokenTransfers}
                    color="pink"
                />
            </div>

            {/* Created/Closed badges */}
            {(summary.accountsCreated > 0 || summary.accountsClosed > 0) && (
                <div className="flex items-center gap-4">
                    {summary.accountsCreated > 0 && (
                        <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30">
                            <span className="w-2 h-2 bg-[var(--green)]" />
                            {summary.accountsCreated} account{summary.accountsCreated > 1 ? 's' : ''} created
                        </span>
                    )}
                    {summary.accountsClosed > 0 && (
                        <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30">
                            <span className="w-2 h-2 bg-[var(--red)]" />
                            {summary.accountsClosed} account{summary.accountsClosed > 1 ? 's' : ''} closed
                        </span>
                    )}
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-[var(--border-dim)] overflow-x-auto">
                {filterOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setFilter(option.id)}
                        className={`px-4 py-3 text-sm font-mono transition-colors relative whitespace-nowrap ${
                            filter === option.id
                                ? 'text-white'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            {option.label}
                            <span
                                className={`px-1.5 py-0.5 text-[10px] ${
                                    filter === option.id
                                        ? 'bg-[var(--pink)]/20 text-[var(--pink)]'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                                }`}
                            >
                                {option.count}
                            </span>
                        </span>
                        {filter === option.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--pink)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Account list */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-dim)] bg-[var(--bg-secondary)]">
                    <h3 className="font-display font-bold text-white">Account Changes</h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                        Showing {filter === 'all' ? 'all accounts' : `accounts with ${filter.replace('_', ' ')}`}
                    </p>
                </div>
                <div className="p-4">
                    <AccountCardList accounts={accounts} network={network} filter={filter} />
                </div>
            </div>
        </div>
    );
}

interface SummaryCardProps {
    label: string;
    value: number | string;
    suffix?: string;
    color: 'cyan' | 'pink' | 'yellow' | 'green' | 'purple';
}

function SummaryCard({ label, value, suffix, color }: SummaryCardProps) {
    return (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
                {label}
            </div>
            <div className="flex items-baseline gap-2">
                <span
                    className="text-2xl font-mono font-bold"
                    style={{ color: `var(--${color})` }}
                >
                    {value}
                </span>
                {suffix && (
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}
