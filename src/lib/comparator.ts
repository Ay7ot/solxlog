import {
    ParsedTransaction,
    ParsedLog,
    ProgramInvocation,
    ComparisonResult,
    ComparisonSummary,
    ComputeStatsDiff,
    LogDiffEntry,
    InvocationDiffEntry,
    DiffStatus,
} from '../types';

/**
 * Compare two parsed logs to determine if they're equivalent
 */
function logsAreEqual(logA: ParsedLog, logB: ParsedLog): boolean {
    return (
        logA.type === logB.type &&
        logA.rawMessage === logB.rawMessage &&
        logA.programId === logB.programId
    );
}

/**
 * Create a diff of two log arrays using LCS-based approach
 */
export function diffLogs(logsA: ParsedLog[], logsB: ParsedLog[]): LogDiffEntry[] {
    const result: LogDiffEntry[] = [];
    let indexA = 0;
    let indexB = 0;
    let outputIndex = 0;

    while (indexA < logsA.length || indexB < logsB.length) {
        const logA = logsA[indexA];
        const logB = logsB[indexB];

        if (!logA && logB) {
            // Only in B
            result.push({
                status: 'only_b',
                logB,
                index: outputIndex++,
            });
            indexB++;
        } else if (logA && !logB) {
            // Only in A
            result.push({
                status: 'only_a',
                logA,
                index: outputIndex++,
            });
            indexA++;
        } else if (logA && logB) {
            if (logsAreEqual(logA, logB)) {
                // Same
                result.push({
                    status: 'same',
                    logA,
                    logB,
                    index: outputIndex++,
                });
                indexA++;
                indexB++;
            } else {
                // Look ahead to see if we can find a match
                const matchInB = logsB.slice(indexB, indexB + 5).findIndex(l => logsAreEqual(logA, l));
                const matchInA = logsA.slice(indexA, indexA + 5).findIndex(l => logsAreEqual(l, logB));

                if (matchInB !== -1 && (matchInA === -1 || matchInB <= matchInA)) {
                    // Insert items from B until we find the match
                    for (let i = 0; i < matchInB; i++) {
                        result.push({
                            status: 'only_b',
                            logB: logsB[indexB + i],
                            index: outputIndex++,
                        });
                    }
                    indexB += matchInB;
                } else if (matchInA !== -1) {
                    // Insert items from A until we find the match
                    for (let i = 0; i < matchInA; i++) {
                        result.push({
                            status: 'only_a',
                            logA: logsA[indexA + i],
                            index: outputIndex++,
                        });
                    }
                    indexA += matchInA;
                } else {
                    // No match found nearby, mark as different
                    result.push({
                        status: 'different',
                        logA,
                        logB,
                        index: outputIndex++,
                    });
                    indexA++;
                    indexB++;
                }
            }
        }
    }

    return result;
}

/**
 * Find the index of the first difference in log diff
 */
function findFirstDivergence(logDiff: LogDiffEntry[]): number | null {
    for (const entry of logDiff) {
        if (entry.status !== 'same') {
            return entry.index;
        }
    }
    return null;
}

/**
 * Diff invocation trees
 */
export function diffInvocations(
    invocationsA: ProgramInvocation[],
    invocationsB: ProgramInvocation[]
): InvocationDiffEntry[] {
    const result: InvocationDiffEntry[] = [];
    const maxLen = Math.max(invocationsA.length, invocationsB.length);

    for (let i = 0; i < maxLen; i++) {
        const invA = invocationsA[i];
        const invB = invocationsB[i];

        if (!invA && invB) {
            result.push({
                status: 'only_b',
                invocationB: invB,
                programId: invB.programId,
                depth: invB.depth,
                children: diffInvocations([], invB.children),
            });
        } else if (invA && !invB) {
            result.push({
                status: 'only_a',
                invocationA: invA,
                programId: invA.programId,
                depth: invA.depth,
                children: diffInvocations(invA.children, []),
            });
        } else if (invA && invB) {
            const isSame = invA.programId === invB.programId && invA.success === invB.success;
            result.push({
                status: isSame ? 'same' : 'different',
                invocationA: invA,
                invocationB: invB,
                programId: invA.programId,
                depth: invA.depth,
                children: diffInvocations(invA.children, invB.children),
            });
        }
    }

    return result;
}

/**
 * Calculate compute stats diff
 */
function diffComputeStats(txA: ParsedTransaction, txB: ParsedTransaction): ComputeStatsDiff {
    const statsA = txA.computeStats;
    const statsB = txB.computeStats;

    const totalConsumedDiff = statsB.totalConsumed - statsA.totalConsumed;
    const totalConsumedDiffPercent = statsA.totalConsumed > 0
        ? (totalConsumedDiff / statsA.totalConsumed) * 100
        : 0;

    // Get all unique program IDs
    const allProgramIds = new Set<string>();
    statsA.perProgram.forEach(p => allProgramIds.add(p.programId));
    statsB.perProgram.forEach(p => allProgramIds.add(p.programId));

    const programDiffs = Array.from(allProgramIds).map(programId => {
        const progA = statsA.perProgram.find(p => p.programId === programId);
        const progB = statsB.perProgram.find(p => p.programId === programId);

        const consumedA = progA?.consumed || 0;
        const consumedB = progB?.consumed || 0;

        let status: DiffStatus = 'same';
        if (!progA) status = 'only_b';
        else if (!progB) status = 'only_a';
        else if (consumedA !== consumedB) status = 'different';

        return {
            programId,
            consumedA,
            consumedB,
            diff: consumedB - consumedA,
            status,
        };
    });

    return {
        totalConsumedA: statsA.totalConsumed,
        totalConsumedB: statsB.totalConsumed,
        totalConsumedDiff,
        totalConsumedDiffPercent,
        totalBudgetA: statsA.totalBudget,
        totalBudgetB: statsB.totalBudget,
        programDiffs,
    };
}

/**
 * Extract unique program IDs from invocations
 */
function getProgramIds(invocations: ProgramInvocation[]): Set<string> {
    const ids = new Set<string>();

    function traverse(inv: ProgramInvocation) {
        ids.add(inv.programId);
        inv.children.forEach(traverse);
    }

    invocations.forEach(traverse);
    return ids;
}

/**
 * Build comparison summary
 */
function buildSummary(
    txA: ParsedTransaction,
    txB: ParsedTransaction,
    logDiff: LogDiffEntry[],
    computeDiff: ComputeStatsDiff
): ComparisonSummary {
    const statusA = txA.success ? 'success' : 'failure';
    const statusB = txB.success ? 'success' : 'failure';

    const programsA = getProgramIds(txA.invocations);
    const programsB = getProgramIds(txB.invocations);

    const programsOnlyInA: string[] = [];
    const programsOnlyInB: string[] = [];
    const programsInBoth: string[] = [];

    programsA.forEach(id => {
        if (programsB.has(id)) {
            programsInBoth.push(id);
        } else {
            programsOnlyInA.push(id);
        }
    });

    programsB.forEach(id => {
        if (!programsA.has(id)) {
            programsOnlyInB.push(id);
        }
    });

    const totalLogDifferences = logDiff.filter(e => e.status !== 'same').length;

    return {
        statusA,
        statusB,
        statusMatch: statusA === statusB,
        computeDiff,
        totalLogDifferences,
        firstDivergenceIndex: findFirstDivergence(logDiff),
        programsOnlyInA,
        programsOnlyInB,
        programsInBoth,
    };
}

/**
 * Compare two transactions and produce a full comparison result
 */
export function compareTransactions(
    transactionA: ParsedTransaction,
    transactionB: ParsedTransaction
): ComparisonResult {
    const logDiff = diffLogs(transactionA.logs, transactionB.logs);
    const invocationDiff = diffInvocations(transactionA.invocations, transactionB.invocations);
    const computeDiff = diffComputeStats(transactionA, transactionB);
    const summary = buildSummary(transactionA, transactionB, logDiff, computeDiff);

    return {
        transactionA,
        transactionB,
        summary,
        logDiff,
        invocationDiff,
    };
}

/**
 * Format a program ID for display (truncate middle)
 */
export function formatProgramId(programId: string, maxLength: number = 16): string {
    if (programId.length <= maxLength) return programId;
    const half = Math.floor((maxLength - 3) / 2);
    return `${programId.slice(0, half)}...${programId.slice(-half)}`;
}

/**
 * Format compute units with commas
 */
export function formatComputeUnits(units: number): string {
    return units.toLocaleString();
}

/**
 * Format percentage with sign
 */
export function formatPercentDiff(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
}
