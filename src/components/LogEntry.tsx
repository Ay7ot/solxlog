import { ParsedLog, LogType } from '../types';
import { formatProgramId, getProgramName } from '../lib/solana';

interface LogEntryProps {
  log: ParsedLog;
  animationDelay?: number;
}

const typeConfig: Record<LogType, { color: string; bgColor: string; label: string }> = {
  [LogType.INVOKE]: {
    color: 'var(--cyan)',
    bgColor: 'rgba(0, 240, 255, 0.1)',
    label: 'INVOKE',
  },
  [LogType.SUCCESS]: {
    color: 'var(--green)',
    bgColor: 'rgba(0, 255, 148, 0.1)',
    label: 'SUCCESS',
  },
  [LogType.FAILURE]: {
    color: 'var(--red)',
    bgColor: 'rgba(255, 77, 106, 0.1)',
    label: 'FAILED',
  },
  [LogType.LOG]: {
    color: 'var(--text-secondary)',
    bgColor: 'rgba(160, 160, 176, 0.1)',
    label: 'LOG',
  },
  [LogType.COMPUTE]: {
    color: 'var(--yellow)',
    bgColor: 'rgba(255, 225, 77, 0.1)',
    label: 'COMPUTE',
  },
  [LogType.RETURN_DATA]: {
    color: 'var(--purple)',
    bgColor: 'rgba(177, 78, 255, 0.1)',
    label: 'RETURN',
  },
  [LogType.DATA]: {
    color: 'var(--text-muted)',
    bgColor: 'rgba(96, 96, 112, 0.1)',
    label: 'DATA',
  },
  [LogType.UNKNOWN]: {
    color: 'var(--text-muted)',
    bgColor: 'rgba(96, 96, 112, 0.1)',
    label: 'LOG',
  },
};

const depthColors = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];

export function LogEntry({ log, animationDelay = 0 }: LogEntryProps) {
  const config = typeConfig[log.type];
  const programName = log.programId ? getProgramName(log.programId) : null;
  const depthColor = depthColors[log.depth % depthColors.length];

  return (
    <div
      className="log-entry"
      style={{
        animationDelay: `${animationDelay}ms`,
        marginLeft: `${log.depth * 20}px`,
      }}
    >
      <div
        className="flex items-start gap-3 p-3 bg-[var(--bg-card)] border-l-2 border border-[var(--border-dim)] hover:bg-[var(--bg-tertiary)] transition-colors group"
        style={{ borderLeftColor: depthColor }}
      >
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="log-type-badge"
              style={{
                color: config.color,
                background: config.bgColor,
                border: `1px solid ${config.color}30`,
              }}
            >
              {config.label}
            </span>

            {log.programId && (
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {programName ? (
                  <span style={{ color: depthColor }}>{programName}</span>
                ) : (
                  formatProgramId(log.programId)
                )}
              </span>
            )}

            {log.invokeLevel !== undefined && (
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Level {log.invokeLevel}
              </span>
            )}
          </div>

          {/* Message */}
          <p className="code-text text-white break-all">
            {log.message}
          </p>

          {/* Compute units */}
          {log.computeUnits && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] overflow-hidden max-w-[200px]">
                <div
                  className="h-full bg-[var(--yellow)]"
                  style={{ width: `${(log.computeUnits.consumed / log.computeUnits.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {log.computeUnits.consumed.toLocaleString()} / {log.computeUnits.total.toLocaleString()}
              </span>
            </div>
          )}

          {/* Return data */}
          {log.returnData && (
            <div className="mt-2 p-2 bg-[var(--bg-secondary)] text-xs font-mono text-[var(--text-muted)] overflow-x-auto border border-[var(--border-dim)]">
              {log.returnData}
            </div>
          )}
        </div>

        {/* Line number */}
        <span className="text-xs text-[var(--text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          #{log.index}
        </span>
      </div>
    </div>
  );
}
