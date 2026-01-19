import { useState, useMemo } from 'react';
import { LogDiffEntry, LogType, DiffStatus } from '../types';
import { formatProgramId, getProgramName } from '../lib/solana';

interface LogDiffProps {
    logDiff: LogDiffEntry[];
    firstDivergenceIndex: number | null;
}

const typeConfig: Record<LogType, { color: string; label: string }> = {
    [LogType.INVOKE]: { color: 'var(--cyan)', label: 'INVOKE' },
    [LogType.SUCCESS]: { color: 'var(--green)', label: 'SUCCESS' },
    [LogType.FAILURE]: { color: 'var(--red)', label: 'FAILED' },
    [LogType.LOG]: { color: 'var(--text-secondary)', label: 'LOG' },
    [LogType.COMPUTE]: { color: 'var(--yellow)', label: 'COMPUTE' },
    [LogType.RETURN_DATA]: { color: 'var(--purple)', label: 'RETURN' },
    [LogType.DATA]: { color: 'var(--text-muted)', label: 'DATA' },
    [LogType.UNKNOWN]: { color: 'var(--text-muted)', label: 'LOG' },
};

const statusConfig: Record<DiffStatus, { bg: string; border: string; label: string; icon: string }> = {
    same: { bg: 'transparent', border: 'var(--border-dim)', label: 'SAME', icon: '=' },
    different: { bg: 'var(--yellow)/5', border: 'var(--yellow)', label: 'CHANGED', icon: '~' },
    only_a: { bg: 'var(--cyan)/5', border: 'var(--cyan)', label: 'ONLY A', icon: '-' },
    only_b: { bg: 'var(--pink)/5', border: 'var(--pink)', label: 'ONLY B', icon: '+' },
};

type FilterMode = 'all' | 'differences' | 'only_a' | 'only_b';

export function LogDiff({ logDiff, firstDivergenceIndex }: LogDiffProps) {
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [collapseSame, setCollapseSame] = useState(true);

    // Filter logs based on mode
    const filteredLogs = useMemo(() => {
        switch (filterMode) {
            case 'differences':
                return logDiff.filter(e => e.status !== 'same');
            case 'only_a':
                return logDiff.filter(e => e.status === 'only_a');
            case 'only_b':
                return logDiff.filter(e => e.status === 'only_b');
            default:
                return logDiff;
        }
    }, [logDiff, filterMode]);

    // Group consecutive same entries for collapsing
    const groupedLogs = useMemo(() => {
        if (!collapseSame || filterMode !== 'all') {
            return filteredLogs.map(entry => ({ type: 'single' as const, entry }));
        }

        const groups: Array<
            | { type: 'single'; entry: LogDiffEntry }
            | { type: 'collapsed'; entries: LogDiffEntry[]; startIndex: number; endIndex: number }
        > = [];

        let sameBuffer: LogDiffEntry[] = [];

        const flushBuffer = () => {
            if (sameBuffer.length > 3) {
                groups.push({
                    type: 'collapsed',
                    entries: sameBuffer,
                    startIndex: sameBuffer[0].index,
                    endIndex: sameBuffer[sameBuffer.length - 1].index,
                });
            } else {
                sameBuffer.forEach(e => groups.push({ type: 'single', entry: e }));
            }
            sameBuffer = [];
        };

        for (const entry of filteredLogs) {
            if (entry.status === 'same') {
                sameBuffer.push(entry);
            } else {
                flushBuffer();
                groups.push({ type: 'single', entry });
            }
        }
        flushBuffer();

        return groups;
    }, [filteredLogs, collapseSame, filterMode]);

    const diffCount = logDiff.filter(e => e.status !== 'same').length;
    const onlyACount = logDiff.filter(e => e.status === 'only_a').length;
    const onlyBCount = logDiff.filter(e => e.status === 'only_b').length;

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-dim)]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--yellow)]/10 border border-[var(--yellow)]/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[var(--yellow)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-white tracking-wide">Log Diff</h3>
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                                {diffCount} difference{diffCount !== 1 ? 's' : ''} found
                                {firstDivergenceIndex !== null && ` (first at line ${firstDivergenceIndex + 1})`}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Filter dropdown */}
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
                            className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-xs font-mono text-white focus:outline-none focus:border-[var(--cyan)]"
                        >
                            <option value="all">All Logs ({logDiff.length})</option>
                            <option value="differences">Differences ({diffCount})</option>
                            <option value="only_a">Only in A ({onlyACount})</option>
                            <option value="only_b">Only in B ({onlyBCount})</option>
                        </select>

                        {/* Collapse toggle */}
                        <button
                            onClick={() => setCollapseSame(!collapseSame)}
                            className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
                                collapseSame
                                    ? 'border-[var(--green)]/50 text-[var(--green)] bg-[var(--green)]/5'
                                    : 'border-[var(--border-dim)] text-[var(--text-muted)]'
                            }`}
                        >
                            {collapseSame ? 'Collapsed' : 'Expanded'}
                        </button>
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
                    <span className="w-3 h-3 border border-[var(--yellow)] bg-[var(--yellow)]/10" />
                    Changed
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--cyan)] bg-[var(--cyan)]/10" />
                    Only in A
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-[var(--pink)] bg-[var(--pink)]/10" />
                    Only in B
                </span>
            </div>

            {/* Log entries */}
            <div className="max-h-[600px] overflow-y-auto">
                {groupedLogs.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)] font-mono text-sm">
                        No logs to display
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-dim)]">
                        {groupedLogs.map((item, i) => {
                            if (item.type === 'collapsed') {
                                return (
                                    <CollapsedGroup
                                        key={`collapsed-${i}`}
                                        entries={item.entries}
                                        startIndex={item.startIndex}
                                        endIndex={item.endIndex}
                                    />
                                );
                            }
                            return <DiffRow key={item.entry.index} entry={item.entry} />;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

interface DiffRowProps {
    entry: LogDiffEntry;
}

function DiffRow({ entry }: DiffRowProps) {
    const config = statusConfig[entry.status];

    return (
        <div
            className="grid grid-cols-[auto_1fr_1fr] hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{
                background: entry.status !== 'same' ? `${config.bg.replace('/5', '')}05` : undefined,
            }}
        >
            {/* Status indicator */}
            <div
                className="w-10 flex items-center justify-center text-xs font-mono border-r"
                style={{
                    borderColor: config.border,
                    color: config.border,
                    background: entry.status !== 'same' ? `${config.border}10` : undefined,
                }}
            >
                {config.icon}
            </div>

            {/* Transaction A side */}
            <div className="p-3 border-r border-[var(--border-dim)] min-w-0">
                {entry.logA ? (
                    <LogCell log={entry.logA} />
                ) : (
                    <div className="text-xs text-[var(--text-muted)] font-mono italic">—</div>
                )}
            </div>

            {/* Transaction B side */}
            <div className="p-3 min-w-0">
                {entry.logB ? (
                    <LogCell log={entry.logB} />
                ) : (
                    <div className="text-xs text-[var(--text-muted)] font-mono italic">—</div>
                )}
            </div>
        </div>
    );
}

interface LogCellProps {
    log: import('../types').ParsedLog;
}

function LogCell({ log }: LogCellProps) {
    const config = typeConfig[log.type];
    const programName = log.programId ? getProgramName(log.programId) : null;

    return (
        <div className="space-y-1">
            {/* Type badge and program */}
            <div className="flex items-center gap-2 flex-wrap">
                <span
                    className="px-1.5 py-0.5 text-[10px] font-mono"
                    style={{
                        color: config.color,
                        background: `${config.color}15`,
                        border: `1px solid ${config.color}30`,
                    }}
                >
                    {config.label}
                </span>
                {log.programId && (
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {programName || formatProgramId(log.programId, 12)}
                    </span>
                )}
            </div>

            {/* Message */}
            <p className="text-xs font-mono text-white break-all leading-relaxed">
                {log.message}
            </p>

            {/* Compute units if present */}
            {log.computeUnits && (
                <div className="text-[10px] font-mono text-[var(--yellow)]">
                    {log.computeUnits.consumed.toLocaleString()} / {log.computeUnits.total.toLocaleString()} CU
                </div>
            )}
        </div>
    );
}

interface CollapsedGroupProps {
    entries: LogDiffEntry[];
    startIndex: number;
    endIndex: number;
}

function CollapsedGroup({ entries, startIndex, endIndex }: CollapsedGroupProps) {
    const [expanded, setExpanded] = useState(false);

    if (expanded) {
        return (
            <>
                <button
                    onClick={() => setExpanded(false)}
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    Collapse {entries.length} matching lines
                </button>
                {entries.map(entry => (
                    <DiffRow key={entry.index} entry={entry} />
                ))}
            </>
        );
    }

    return (
        <button
            onClick={() => setExpanded(true)}
            className="w-full px-4 py-3 bg-[var(--bg-secondary)] text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center gap-2 border-y border-[var(--border-dim)]"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {entries.length} matching lines (#{startIndex + 1} - #{endIndex + 1})
        </button>
    );
}
