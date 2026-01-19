import { useState } from 'react';
import { InvocationDiffEntry, DiffStatus } from '../types';
import { formatProgramId, getProgramName } from '../lib/solana';

interface InvocationDiffProps {
    invocationDiff: InvocationDiffEntry[];
}

const statusColors: Record<DiffStatus, { border: string; bg: string; text: string }> = {
    same: { border: 'var(--border-dim)', bg: 'transparent', text: 'var(--text-secondary)' },
    different: { border: 'var(--yellow)', bg: 'var(--yellow)', text: 'var(--yellow)' },
    only_a: { border: 'var(--cyan)', bg: 'var(--cyan)', text: 'var(--cyan)' },
    only_b: { border: 'var(--pink)', bg: 'var(--pink)', text: 'var(--pink)' },
};

const depthColors = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];

export function InvocationDiff({ invocationDiff }: InvocationDiffProps) {
    const hasDifferences = invocationDiff.some(
        e => e.status !== 'same' || e.children.some(hasNestedDifference)
    );

    function hasNestedDifference(entry: InvocationDiffEntry): boolean {
        if (entry.status !== 'same') return true;
        return entry.children.some(hasNestedDifference);
    }

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-dim)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white tracking-wide">Program Invocations</h3>
                        <p className="text-xs text-[var(--text-muted)] font-mono">
                            {hasDifferences ? 'Execution paths differ' : 'Execution paths match'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-dim)] flex items-center gap-4 flex-wrap text-xs font-mono">
                <span className="text-[var(--text-muted)]">Legend:</span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--border-dim)]" />
                    Same
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--yellow)] bg-[var(--yellow)]/20" />
                    Different result
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--cyan)] bg-[var(--cyan)]/20" />
                    Only in A
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--pink)] bg-[var(--pink)]/20" />
                    Only in B
                </span>
            </div>

            {/* Side-by-side view */}
            <div className="grid grid-cols-2 divide-x divide-[var(--border-dim)]">
                {/* Header row */}
                <div className="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-dim)]">
                    <div className="text-xs font-mono text-[var(--cyan)] font-bold">TRANSACTION A</div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-dim)]">
                    <div className="text-xs font-mono text-[var(--pink)] font-bold">TRANSACTION B</div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {invocationDiff.map((entry, i) => (
                        <InvocationNodeA key={i} entry={entry} />
                    ))}
                    {invocationDiff.length === 0 && (
                        <div className="text-xs text-[var(--text-muted)] font-mono italic">No invocations</div>
                    )}
                </div>
                <div className="p-4">
                    {invocationDiff.map((entry, i) => (
                        <InvocationNodeB key={i} entry={entry} />
                    ))}
                    {invocationDiff.length === 0 && (
                        <div className="text-xs text-[var(--text-muted)] font-mono italic">No invocations</div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface InvocationNodeProps {
    entry: InvocationDiffEntry;
}

function InvocationNodeA({ entry }: InvocationNodeProps) {
    const [expanded, setExpanded] = useState(true);
    const invocation = entry.invocationA;
    const colors = statusColors[entry.status];
    const depthColor = depthColors[entry.depth % depthColors.length];

    if (!invocation && entry.status === 'only_b') {
        // Placeholder for alignment
        return (
            <div style={{ marginLeft: `${entry.depth * 16}px` }} className="mb-2">
                <div className="p-2 border border-dashed border-[var(--border-dim)] bg-[var(--bg-secondary)]/50 text-xs font-mono text-[var(--text-muted)] italic">
                    — not present —
                </div>
                {entry.children.map((child, i) => (
                    <InvocationNodeA key={i} entry={child} />
                ))}
            </div>
        );
    }

    if (!invocation) return null;

    const programName = getProgramName(invocation.programId);
    const hasChildren = entry.children.length > 0;

    return (
        <div style={{ marginLeft: `${entry.depth * 16}px` }} className="mb-2">
            <div
                className="p-2 border-l-2 border transition-colors cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{
                    borderLeftColor: depthColor,
                    borderColor: colors.border,
                    background: entry.status !== 'same' ? `${colors.bg}10` : undefined,
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    {/* Expand/collapse indicator */}
                    {hasChildren && (
                        <svg
                            className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    )}

                    {/* Program name */}
                    <span className="text-xs font-mono font-bold" style={{ color: depthColor }}>
                        {programName || formatProgramId(invocation.programId, 16)}
                    </span>

                    {/* Status badge */}
                    <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono ${
                            invocation.success
                                ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                        }`}
                    >
                        {invocation.success ? 'SUCCESS' : 'FAILED'}
                    </span>

                    {/* Diff indicator */}
                    {entry.status !== 'same' && (
                        <span
                            className="px-1.5 py-0.5 text-[10px] font-mono"
                            style={{
                                color: colors.text,
                                background: `${colors.bg}20`,
                                border: `1px solid ${colors.border}50`,
                            }}
                        >
                            {entry.status === 'only_a' ? 'ONLY A' : entry.status === 'different' ? 'DIFFERS' : ''}
                        </span>
                    )}
                </div>

                {/* Compute units */}
                {invocation.computeUnits && (
                    <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                        {invocation.computeUnits.consumed.toLocaleString()} CU
                    </div>
                )}
            </div>

            {/* Children */}
            {expanded && entry.children.map((child, i) => (
                <InvocationNodeA key={i} entry={child} />
            ))}
        </div>
    );
}

function InvocationNodeB({ entry }: InvocationNodeProps) {
    const [expanded, setExpanded] = useState(true);
    const invocation = entry.invocationB;
    const colors = statusColors[entry.status];
    const depthColor = depthColors[entry.depth % depthColors.length];

    if (!invocation && entry.status === 'only_a') {
        // Placeholder for alignment
        return (
            <div style={{ marginLeft: `${entry.depth * 16}px` }} className="mb-2">
                <div className="p-2 border border-dashed border-[var(--border-dim)] bg-[var(--bg-secondary)]/50 text-xs font-mono text-[var(--text-muted)] italic">
                    — not present —
                </div>
                {entry.children.map((child, i) => (
                    <InvocationNodeB key={i} entry={child} />
                ))}
            </div>
        );
    }

    if (!invocation) return null;

    const programName = getProgramName(invocation.programId);
    const hasChildren = entry.children.length > 0;

    return (
        <div style={{ marginLeft: `${entry.depth * 16}px` }} className="mb-2">
            <div
                className="p-2 border-l-2 border transition-colors cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{
                    borderLeftColor: depthColor,
                    borderColor: colors.border,
                    background: entry.status !== 'same' ? `${colors.bg}10` : undefined,
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    {/* Expand/collapse indicator */}
                    {hasChildren && (
                        <svg
                            className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    )}

                    {/* Program name */}
                    <span className="text-xs font-mono font-bold" style={{ color: depthColor }}>
                        {programName || formatProgramId(invocation.programId, 16)}
                    </span>

                    {/* Status badge */}
                    <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono ${
                            invocation.success
                                ? 'text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30'
                                : 'text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30'
                        }`}
                    >
                        {invocation.success ? 'SUCCESS' : 'FAILED'}
                    </span>

                    {/* Diff indicator */}
                    {entry.status !== 'same' && (
                        <span
                            className="px-1.5 py-0.5 text-[10px] font-mono"
                            style={{
                                color: colors.text,
                                background: `${colors.bg}20`,
                                border: `1px solid ${colors.border}50`,
                            }}
                        >
                            {entry.status === 'only_b' ? 'ONLY B' : entry.status === 'different' ? 'DIFFERS' : ''}
                        </span>
                    )}
                </div>

                {/* Compute units */}
                {invocation.computeUnits && (
                    <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                        {invocation.computeUnits.consumed.toLocaleString()} CU
                    </div>
                )}
            </div>

            {/* Children */}
            {expanded && entry.children.map((child, i) => (
                <InvocationNodeB key={i} entry={child} />
            ))}
        </div>
    );
}
