import { SolChange, TokenChange } from '../types';
import { formatLamportsToSol, formatTokenAmount } from '../lib/accountDiff';

interface SolBalanceChangeProps {
    change: SolChange;
    showFull?: boolean;
}

export function SolBalanceChange({ change, showFull = false }: SolBalanceChangeProps) {
    const isPositive = change.diff > 0;
    const isNegative = change.diff < 0;

    return (
        <div className="flex items-center gap-3 text-sm font-mono">
            <span className="text-[var(--text-muted)]">SOL:</span>
            {showFull ? (
                <>
                    <span className="text-[var(--text-secondary)]">
                        {formatLamportsToSol(change.before)}
                    </span>
                    <span className="text-[var(--text-muted)]">→</span>
                    <span className="text-white">
                        {formatLamportsToSol(change.after)}
                    </span>
                </>
            ) : null}
            <span
                className={`px-2 py-0.5 text-xs ${
                    isPositive
                        ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                        : isNegative
                        ? 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                        : 'text-[var(--text-muted)] bg-[var(--bg-secondary)]'
                }`}
            >
                {isPositive ? '+' : ''}{formatLamportsToSol(change.diff)}
            </span>
        </div>
    );
}

interface TokenBalanceChangeProps {
    change: TokenChange;
    showFull?: boolean;
}

export function TokenBalanceChange({ change, showFull = false }: TokenBalanceChangeProps) {
    const isPositive = change.diff > 0;
    const isNegative = change.diff < 0;
    const symbol = change.symbol || change.mint.slice(0, 4) + '...';

    return (
        <div className="flex items-center gap-3 text-sm font-mono">
            <span className="text-[var(--text-muted)]">{symbol}:</span>
            {showFull ? (
                <>
                    <span className="text-[var(--text-secondary)]">
                        {formatTokenAmount(change.before)}
                    </span>
                    <span className="text-[var(--text-muted)]">→</span>
                    <span className="text-white">
                        {formatTokenAmount(change.after)}
                    </span>
                </>
            ) : null}
            <span
                className={`px-2 py-0.5 text-xs ${
                    isPositive
                        ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                        : isNegative
                        ? 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                        : 'text-[var(--text-muted)] bg-[var(--bg-secondary)]'
                }`}
            >
                {isPositive ? '+' : ''}{formatTokenAmount(change.diff)}
            </span>
        </div>
    );
}

interface BalanceChangeListProps {
    solChange: SolChange | null;
    tokenChanges: TokenChange[];
    showFull?: boolean;
}

export function BalanceChangeList({ solChange, tokenChanges, showFull = true }: BalanceChangeListProps) {
    const hasChanges = solChange || tokenChanges.length > 0;

    if (!hasChanges) {
        return (
            <div className="text-xs text-[var(--text-muted)] font-mono italic">
                No balance changes
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {solChange && (
                <SolBalanceChange change={solChange} showFull={showFull} />
            )}
            {tokenChanges.map((tc, i) => (
                <TokenBalanceChange key={i} change={tc} showFull={showFull} />
            ))}
        </div>
    );
}
