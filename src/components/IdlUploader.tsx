import { useState, useCallback, useRef } from 'react';
import { AnchorIdl } from '../types';
import { parseIdl } from '../lib/errorDecoder';

interface IdlUploaderProps {
    onIdlLoaded: (idl: AnchorIdl) => void;
    currentIdl?: AnchorIdl | null;
    onClear?: () => void;
}

export function IdlUploader({ onIdlLoaded, currentIdl, onClear }: IdlUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        if (!file.name.endsWith('.json')) {
            setError('Please upload a JSON file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const idl = parseIdl(content);

            if (!idl) {
                setError('Invalid IDL format');
                return;
            }

            if (!idl.errors || idl.errors.length === 0) {
                setError('IDL has no error definitions');
                return;
            }

            onIdlLoaded(idl);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    }, [onIdlLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Show loaded IDL info
    if (currentIdl) {
        const errorCount = currentIdl.errors?.length || 0;
        return (
            <div className="p-4 bg-[var(--green)]/5 border border-[var(--green)]/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--green)]/10 border border-[var(--green)]/30 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-[var(--green)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-mono text-white">
                                {currentIdl.name || 'IDL'} {currentIdl.version && `v${currentIdl.version}`}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-mono">
                                {errorCount} error definition{errorCount !== 1 ? 's' : ''} loaded
                            </div>
                        </div>
                    </div>
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--red)] border border-[var(--border-dim)] hover:border-[var(--red)]/30 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`p-6 border-2 border-dashed cursor-pointer transition-colors ${
                    isDragging
                        ? 'border-[var(--purple)] bg-[var(--purple)]/5'
                        : 'border-[var(--border-dim)] hover:border-[var(--purple)]/50 hover:bg-[var(--bg-secondary)]'
                }`}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`w-12 h-12 flex items-center justify-center ${
                        isDragging ? 'text-[var(--purple)]' : 'text-[var(--text-muted)]'
                    }`}>
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm text-[var(--text-secondary)]">
                            Drop IDL file here or <span className="text-[var(--purple)]">click to browse</span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                            JSON file from target/idl/
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 text-[var(--red)] text-xs">
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
        </div>
    );
}
