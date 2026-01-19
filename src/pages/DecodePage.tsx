import { useState, useCallback } from 'react';
import { DecodedError, AnchorIdl } from '../types';
import { parseErrorInput, decodeError } from '../lib/errorDecoder';
import { ErrorDecodeResult } from '../components/ErrorDecodeResult';
import { IdlUploader } from '../components/IdlUploader';
import { CommonErrors, CommonErrorsCompact } from '../components/CommonErrors';

export function DecodePage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<DecodedError | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [idl, setIdl] = useState<AnchorIdl | null>(null);
    const [showIdlUploader, setShowIdlUploader] = useState(false);

    const handleDecode = useCallback((inputValue?: string) => {
        const value = inputValue ?? input;
        setError(null);
        setResult(null);

        const trimmed = value.trim();
        if (!trimmed) {
            setError('Please enter an error code');
            return;
        }

        const code = parseErrorInput(trimmed);
        if (code === null) {
            setError('Could not parse error code. Try formats like: 0x1771, 6001, or "custom program error: 0x1771"');
            return;
        }

        const decoded = decodeError(code, idl || undefined);
        setResult(decoded);

        // Show IDL uploader prompt for custom errors without IDL
        if (decoded.category === 'custom_program' && !decoded.name && !idl) {
            setShowIdlUploader(true);
        }
    }, [input, idl]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleDecode();
    }, [handleDecode]);

    const handleQuickSelect = useCallback((code: number) => {
        const hexInput = '0x' + code.toString(16);
        setInput(hexInput);
        handleDecode(hexInput);
    }, [handleDecode]);

    const handleIdlLoaded = useCallback((loadedIdl: AnchorIdl) => {
        setIdl(loadedIdl);
        setShowIdlUploader(false);

        // Re-decode if we have a result
        if (result) {
            const decoded = decodeError(result.code, loadedIdl);
            setResult(decoded);
        }
    }, [result]);

    const handleClearIdl = useCallback(() => {
        setIdl(null);
        // Re-decode without IDL
        if (result) {
            const decoded = decodeError(result.code);
            setResult(decoded);
        }
    }, [result]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text.trim());
            setError(null);
        } catch {
            setError('Could not access clipboard');
        }
    }, []);

    const handleClear = useCallback(() => {
        setInput('');
        setResult(null);
        setError(null);
        setShowIdlUploader(false);
    }, []);

    return (
        <div className="space-y-8">
            {/* Hero - only show when no result */}
            {!result && (
                <section className="text-center py-8 sm:py-12">
                    <div className="inline-block mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--red)]/30 bg-[var(--red)]/5 text-[var(--red)] text-xs font-mono">
                            <span className="w-1.5 h-1.5 bg-[var(--red)]" />
                            ERROR DECODER
                        </div>
                    </div>

                    <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                        Decode
                        <br />
                        <span
                            className="text-[var(--red)]"
                            style={{ textShadow: '0 0 40px rgba(255, 77, 106, 0.4)' }}
                        >
                            Solana Errors
                        </span>
                    </h2>

                    <p className="mt-6 text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                        Decode cryptic error codes like <code className="text-[var(--cyan)]">0x1771</code> into
                        human-readable explanations with fix suggestions.
                    </p>

                    {/* Quick examples */}
                    <div className="mt-8">
                        <CommonErrorsCompact onSelect={handleQuickSelect} />
                    </div>
                </section>
            )}

            {/* Input Section */}
            <section className="relative">
                {/* Accent borders */}
                <div className="absolute -top-[1px] left-0 w-16 h-[2px] bg-[var(--red)]" />
                <div className="absolute -top-[1px] right-0 w-16 h-[2px] bg-[var(--yellow)]" />
                <div className="absolute -bottom-[1px] left-0 w-16 h-[2px] bg-[var(--cyan)]" />
                <div className="absolute -bottom-[1px] right-0 w-16 h-[2px] bg-[var(--green)]" />

                <div className="card p-6 sm:p-8 border border-[var(--border-bright)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Header */}
                        <div>
                            <h2 className="font-display text-lg font-bold text-white">
                                Error Code
                            </h2>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Paste an error code or full error message
                            </p>
                        </div>

                        {/* Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError(null);
                                }}
                                placeholder='e.g. 0x1771, 6001, or "custom program error: 0x1771"'
                                className="input-field w-full px-4 py-4 pr-24 text-sm font-mono"
                                spellCheck={false}
                                autoComplete="off"
                            />

                            {/* Action buttons */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {input && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors rounded"
                                        title="Clear"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handlePaste}
                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors rounded"
                                    title="Paste from clipboard"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-[var(--red)] text-sm">
                                <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="btn-primary w-full sm:w-auto px-8 py-3.5 font-semibold text-sm flex items-center justify-center gap-3"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                                />
                            </svg>
                            Decode Error
                        </button>
                    </form>
                </div>
            </section>

            {/* Result */}
            {result && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">
                            Result
                        </h3>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--red)] border border-[var(--border-dim)] hover:border-[var(--red)]/30 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear
                        </button>
                    </div>
                    <ErrorDecodeResult
                        result={result}
                        showIdlPrompt={showIdlUploader}
                        onUploadIdl={() => setShowIdlUploader(true)}
                    />

                    {/* IDL Uploader */}
                    {(showIdlUploader || idl) && (
                        <div className="card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-[var(--purple)]/10 border border-[var(--purple)]/30 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-[var(--purple)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-sm">Program IDL</h3>
                                    <p className="text-xs text-[var(--text-muted)] font-mono">
                                        Upload to decode custom errors
                                    </p>
                                </div>
                            </div>
                            <IdlUploader
                                onIdlLoaded={handleIdlLoaded}
                                currentIdl={idl}
                                onClear={handleClearIdl}
                            />
                        </div>
                    )}
                </section>
            )}

            {/* Common errors reference - show when no result */}
            {!result && (
                <section>
                    <CommonErrors onSelect={handleQuickSelect} />
                </section>
            )}
        </div>
    );
}
