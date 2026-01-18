import { TransactionError } from '../types';
import { formatProgramId, getProgramName } from '../lib/solana';

interface ErrorSummaryProps {
  error: TransactionError;
}

export function ErrorSummary({ error }: ErrorSummaryProps) {
  const programName = error.programId ? getProgramName(error.programId) : null;

  return (
    <div className="card overflow-hidden border-[var(--red)]/30">
      {/* Red top bar */}
      <div className="h-1 bg-[var(--red)]" />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[var(--red)]/10 border border-[var(--red)]/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[var(--red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[var(--red)] font-display font-bold text-base">
              Transaction Failed
            </h3>
            <p className="text-white mt-2 code-text break-all">
              {error.message}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-[var(--border-dim)]">
          {error.programId && (
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                Program
              </label>
              <p className="text-sm text-white font-mono mt-1">
                {programName && (
                  <span className="text-[var(--cyan)]">{programName}</span>
                )}
                {programName && <br />}
                <span className="text-[var(--text-secondary)]">
                  {formatProgramId(error.programId, programName ? 8 : 16)}
                </span>
              </p>
            </div>
          )}
          
          {error.instructionIndex !== undefined && (
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                Instruction Index
              </label>
              <p className="text-sm text-[var(--yellow)] font-mono mt-1">
                {error.instructionIndex}
              </p>
            </div>
          )}
          
          {error.errorCode && (
            <div className="sm:col-span-2">
              <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                Error Code
              </label>
              <p className="text-sm text-[var(--red)] font-mono mt-1">
                {error.errorCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
