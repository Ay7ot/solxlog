import { getCommonErrors } from '../lib/errorDecoder';

interface CommonErrorsProps {
    onSelect?: (code: number) => void;
}

export function CommonErrors({ onSelect }: CommonErrorsProps) {
    const errors = getCommonErrors();

    return (
        <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-dim)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--yellow)]/10 border border-[var(--yellow)]/30 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-[var(--yellow)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white text-sm">Common Errors</h3>
                        <p className="text-xs text-[var(--text-muted)] font-mono">Quick reference</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-[var(--border-dim)]">
                {errors.map((error) => (
                    <button
                        key={error.code}
                        onClick={() => onSelect?.(error.code)}
                        className="w-full p-3 flex items-center justify-between gap-4 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-mono text-[var(--cyan)] w-12 flex-shrink-0">
                                {error.hex}
                            </span>
                            <span className="text-sm font-mono text-white truncate">
                                {error.name}
                            </span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)] flex-shrink-0">
                            {error.category}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-dim)]">
                <p className="text-xs text-[var(--text-muted)] text-center font-mono">
                    Click an error to decode it
                </p>
            </div>
        </div>
    );
}

// Compact version for sidebar or inline use
export function CommonErrorsCompact({ onSelect }: CommonErrorsProps) {
    const errors = getCommonErrors().slice(0, 5);

    return (
        <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                Common Errors
            </div>
            <div className="flex flex-wrap gap-2">
                {errors.map((error) => (
                    <button
                        key={error.code}
                        onClick={() => onSelect?.(error.code)}
                        className="px-2 py-1 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-dim)] hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)] transition-colors"
                        title={error.name}
                    >
                        {error.hex}
                    </button>
                ))}
            </div>
        </div>
    );
}
