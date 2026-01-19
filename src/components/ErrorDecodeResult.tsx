import { DecodedError } from '../types';

interface ErrorDecodeResultProps {
    result: DecodedError;
    showIdlPrompt?: boolean;
    onUploadIdl?: () => void;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    solana_builtin: { bg: 'var(--cyan)/10', text: 'var(--cyan)', border: 'var(--cyan)/30' },
    anchor_instruction: { bg: 'var(--yellow)/10', text: 'var(--yellow)', border: 'var(--yellow)/30' },
    anchor_idl: { bg: 'var(--purple)/10', text: 'var(--purple)', border: 'var(--purple)/30' },
    anchor_constraint: { bg: 'var(--pink)/10', text: 'var(--pink)', border: 'var(--pink)/30' },
    anchor_account: { bg: 'var(--green)/10', text: 'var(--green)', border: 'var(--green)/30' },
    anchor_misc: { bg: 'var(--text-muted)/10', text: 'var(--text-muted)', border: 'var(--text-muted)/30' },
    anchor_deprecated: { bg: 'var(--red)/10', text: 'var(--red)', border: 'var(--red)/30' },
    custom_program: { bg: 'var(--purple)/10', text: 'var(--purple)', border: 'var(--purple)/30' },
};

export function ErrorDecodeResult({ result, showIdlPrompt, onUploadIdl }: ErrorDecodeResultProps) {
    const colors = categoryColors[result.category] || categoryColors.custom_program;
    const isCustom = result.category === 'custom_program';
    const hasName = !!result.name;

    return (
        <div className="card overflow-hidden">
            {/* Header bar */}
            <div
                className="h-1"
                style={{ background: `${colors.text}` }}
            />

            <div className="p-6 space-y-6">
                {/* Code display */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
                            Error Code
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-mono font-bold text-white">
                                {result.code}
                            </span>
                            <span className="text-lg font-mono text-[var(--text-muted)]">
                                ({result.hex})
                            </span>
                        </div>
                    </div>

                    {/* Category badge */}
                    <div
                        className="px-3 py-1.5 text-xs font-mono"
                        style={{
                            background: colors.bg.replace('/10', '10'),
                            color: colors.text,
                            border: `1px solid ${colors.border.replace('/30', '30')}`,
                        }}
                    >
                        {result.categoryLabel}
                    </div>
                </div>

                {/* Error name and message */}
                <div className="space-y-4">
                    {hasName && (
                        <div>
                            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1">
                                Error Name
                            </div>
                            <div
                                className="text-xl font-mono font-bold"
                                style={{ color: colors.text }}
                            >
                                {result.name}
                            </div>
                        </div>
                    )}

                    {result.message && (
                        <div>
                            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1">
                                {hasName ? 'Description' : 'Message'}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {result.message}
                            </div>
                        </div>
                    )}
                </div>

                {/* Range info */}
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-dim)]">
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                        Range: <span className="text-[var(--text-secondary)]">{result.range}</span>
                    </div>
                    <div className="w-1 h-1 bg-[var(--border-dim)]" />
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                        Category: <span className="text-[var(--text-secondary)]">{result.category.replace(/_/g, ' ')}</span>
                    </div>
                </div>

                {/* Suggestion */}
                {result.suggestion && (
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-[var(--yellow)] flex-shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                            <div>
                                <div className="text-xs text-[var(--yellow)] font-mono uppercase tracking-wider mb-1">
                                    Suggestion
                                </div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {result.suggestion}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* IDL upload prompt for custom errors */}
                {isCustom && showIdlPrompt && !hasName && (
                    <div className="p-4 bg-[var(--purple)]/5 border border-[var(--purple)]/30">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-[var(--purple)] flex-shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <div className="flex-1">
                                <div className="text-sm text-[var(--text-secondary)] mb-3">
                                    This is a custom error (code {'>='} 6000). Upload the program's IDL to decode it.
                                </div>
                                {onUploadIdl && (
                                    <button
                                        onClick={onUploadIdl}
                                        className="px-4 py-2 text-sm font-mono text-[var(--purple)] bg-[var(--purple)]/10 border border-[var(--purple)]/30 hover:bg-[var(--purple)]/20 transition-colors"
                                    >
                                        Upload IDL
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
