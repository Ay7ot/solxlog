import { ComputeStats } from '../types';
import { formatProgramId, getProgramName } from '../lib/solana';

interface ComputeInsightsProps {
  stats: ComputeStats;
}

export function ComputeInsights({ stats }: ComputeInsightsProps) {
  const isHighUsage = stats.percentUsed > 80;
  const isMediumUsage = stats.percentUsed > 50;

  const getProgressClass = () => {
    if (isHighUsage) return 'high';
    if (isMediumUsage) return 'medium';
    return 'low';
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="section-header mb-0">
          <div className="section-icon">
            <svg className="w-5 h-5 text-[var(--yellow)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Compute Units</h3>
            <p className="section-subtitle">Resource usage</p>
          </div>
        </div>

        <div className={`badge ${isHighUsage ? 'badge-error' : isMediumUsage ? 'badge-warning' : 'badge-success'}`}>
          {stats.percentUsed.toFixed(1)}% USED
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="progress-bar">
          <div
            className={`progress-fill ${getProgressClass()}`}
            style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-white">
            {stats.totalConsumed.toLocaleString()} <span className="text-[var(--text-muted)]">consumed</span>
          </span>
          <span className="text-[var(--text-muted)]">
            {stats.totalBudget.toLocaleString()} budget
          </span>
        </div>
      </div>

      {/* Per-program breakdown */}
      {stats.perProgram.length > 0 && (
        <div className="mt-5 pt-5 border-t border-[var(--border-dim)]">
          <h4 className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-3">
            Per Program
          </h4>
          <div className="space-y-3">
            {stats.perProgram.map((program, index) => {
              const programName = getProgramName(program.programId);
              const percentage = (program.consumed / program.total) * 100;
              const colors = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];
              const color = colors[index % colors.length];

              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-white font-mono truncate flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      {programName || formatProgramId(program.programId)}
                    </span>
                    <span className="font-mono text-xs flex-shrink-0 ml-4" style={{ color }}>
                      {program.consumed.toLocaleString()} CU
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning */}
      {isHighUsage && (
        <div className="mt-4 p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-start gap-3">
          <svg className="w-4 h-4 text-[var(--red)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-[var(--text-secondary)]">
            High compute usage. Consider optimizing or increasing budget.
          </span>
        </div>
      )}
    </div>
  );
}
