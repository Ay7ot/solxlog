import { ComparisonSummary } from '../types';
import { formatComputeUnits, formatPercentDiff, formatProgramId } from '../lib/comparator';

interface DiffSummaryProps {
    summary: ComparisonSummary;
}

export function DiffSummary({ summary }: DiffSummaryProps) {
    const {
        statusA,
        statusB,
        statusMatch,
        computeDiff,
        totalLogDifferences,
        firstDivergenceIndex,
        programsOnlyInA,
        programsOnlyInB,
    } = summary;

    const computeChange = computeDiff.totalConsumedDiff;
    const computeChangePercent = computeDiff.totalConsumedDiffPercent;

    return (
        <div className="card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[var(--purple)]/10 border border-[var(--purple)]/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-display font-bold text-white tracking-wide">Comparison Summary</h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">Overview of differences</p>
                </div>
            </div>

            {/* Main metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {/* Status comparison */}
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
                    <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">Status</div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-mono ${statusA === 'success' ? 'bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/30' : 'bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/30'}`}>
                            A: {statusA.toUpperCase()}
                        </span>
                        <span className="text-[var(--text-muted)]">vs</span>
                        <span className={`px-2 py-1 text-xs font-mono ${statusB === 'success' ? 'bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/30' : 'bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/30'}`}>
                            B: {statusB.toUpperCase()}
                        </span>
                    </div>
                    {!statusMatch && (
                        <div className="mt-2 text-xs text-[var(--yellow)] font-mono">
                            Status differs
                        </div>
                    )}
                </div>

                {/* Compute difference */}
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
                    <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">Compute Change</div>
                    <div className={`text-lg font-mono font-bold ${computeChange > 0 ? 'text-[var(--red)]' : computeChange < 0 ? 'text-[var(--green)]' : 'text-[var(--text-secondary)]'}`}>
                        {computeChange > 0 ? '+' : ''}{formatComputeUnits(computeChange)}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">
                        {formatPercentDiff(computeChangePercent)} from A
                    </div>
                </div>

                {/* Log differences */}
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
                    <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">Log Differences</div>
                    <div className={`text-lg font-mono font-bold ${totalLogDifferences > 0 ? 'text-[var(--yellow)]' : 'text-[var(--green)]'}`}>
                        {totalLogDifferences}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">
                        {firstDivergenceIndex !== null ? `First at line ${firstDivergenceIndex + 1}` : 'Logs match'}
                    </div>
                </div>

                {/* Program differences */}
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
                    <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">Programs</div>
                    <div className="flex items-center gap-2">
                        {programsOnlyInA.length > 0 && (
                            <span className="px-2 py-1 text-xs font-mono bg-[var(--cyan)]/10 text-[var(--cyan)] border border-[var(--cyan)]/30">
                                +{programsOnlyInA.length} in A
                            </span>
                        )}
                        {programsOnlyInB.length > 0 && (
                            <span className="px-2 py-1 text-xs font-mono bg-[var(--pink)]/10 text-[var(--pink)] border border-[var(--pink)]/30">
                                +{programsOnlyInB.length} in B
                            </span>
                        )}
                        {programsOnlyInA.length === 0 && programsOnlyInB.length === 0 && (
                            <span className="text-sm font-mono text-[var(--green)]">Same programs</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Compute breakdown */}
            <div className="border-t border-[var(--border-dim)] pt-5">
                <h4 className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-3">
                    Compute Units Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center mb-3">
                    <div>
                        <div className="text-xs text-[var(--cyan)] font-mono mb-1">Transaction A</div>
                        <div className="text-lg font-mono text-white">{formatComputeUnits(computeDiff.totalConsumedA)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-muted)] font-mono mb-1">Difference</div>
                        <div className={`text-lg font-mono ${computeChange > 0 ? 'text-[var(--red)]' : computeChange < 0 ? 'text-[var(--green)]' : 'text-[var(--text-secondary)]'}`}>
                            {computeChange > 0 ? '+' : ''}{formatComputeUnits(computeChange)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--pink)] font-mono mb-1">Transaction B</div>
                        <div className="text-lg font-mono text-white">{formatComputeUnits(computeDiff.totalConsumedB)}</div>
                    </div>
                </div>

                {/* Per-program compute diff */}
                {computeDiff.programDiffs.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {computeDiff.programDiffs.map((prog, i) => (
                            <div key={i} className="flex items-center justify-between text-xs font-mono p-2 bg-[var(--bg-primary)] border border-[var(--border-dim)]">
                                <span className="text-[var(--text-secondary)] truncate flex-1">
                                    {formatProgramId(prog.programId, 20)}
                                </span>
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="text-[var(--cyan)] w-20 text-right">
                                        {prog.status === 'only_b' ? '-' : formatComputeUnits(prog.consumedA)}
                                    </span>
                                    <span className={`w-20 text-right ${prog.diff > 0 ? 'text-[var(--red)]' : prog.diff < 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>
                                        {prog.diff > 0 ? '+' : ''}{prog.diff !== 0 ? formatComputeUnits(prog.diff) : '='}
                                    </span>
                                    <span className="text-[var(--pink)] w-20 text-right">
                                        {prog.status === 'only_a' ? '-' : formatComputeUnits(prog.consumedB)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Program differences detail */}
            {(programsOnlyInA.length > 0 || programsOnlyInB.length > 0) && (
                <div className="border-t border-[var(--border-dim)] pt-5 mt-5">
                    <h4 className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-3">
                        Unique Programs
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        {programsOnlyInA.length > 0 && (
                            <div>
                                <div className="text-xs text-[var(--cyan)] font-mono mb-2">Only in A:</div>
                                <div className="space-y-1">
                                    {programsOnlyInA.map((prog, i) => (
                                        <div key={i} className="text-xs font-mono text-[var(--text-secondary)] truncate">
                                            {formatProgramId(prog, 24)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {programsOnlyInB.length > 0 && (
                            <div>
                                <div className="text-xs text-[var(--pink)] font-mono mb-2">Only in B:</div>
                                <div className="space-y-1">
                                    {programsOnlyInB.map((prog, i) => (
                                        <div key={i} className="text-xs font-mono text-[var(--text-secondary)] truncate">
                                            {formatProgramId(prog, 24)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
