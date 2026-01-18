import { useState, useMemo, useCallback } from 'react';
import { ParsedTransaction, LogType } from '../types';
import { LogEntry } from './LogEntry';
import { formatProgramId, getProgramName, formatTimestamp, formatSol } from '../lib/solana';

interface LogTimelineProps {
  transaction: ParsedTransaction;
}

type FilterType = 'all' | LogType;

// Copy to clipboard helper
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function LogTimeline({ transaction }: LogTimelineProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showRaw, setShowRaw] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle copy with feedback
  const handleCopy = useCallback(async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  // Export as JSON
  const handleExport = useCallback(() => {
    const exportData = {
      signature: transaction.signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      success: transaction.success,
      fee: transaction.fee,
      error: transaction.error,
      computeStats: transaction.computeStats,
      logs: transaction.logs,
      rawLogMessages: transaction.rawLogMessages,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solana-tx-${transaction.signature.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transaction]);

  // Filter logs by type and search query
  const filteredLogs = useMemo(() => {
    let logs = transaction.logs;
    
    // Filter by type
    if (filter !== 'all') {
      logs = logs.filter(log => log.type === filter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.rawMessage.toLowerCase().includes(query) ||
        log.programId?.toLowerCase().includes(query)
      );
    }
    
    return logs;
  }, [transaction.logs, filter, searchQuery]);

  const toggleCollapse = (programId: string, depth: number) => {
    const key = `${programId}-${depth}`;
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: transaction.logs.length },
    { value: LogType.INVOKE, label: 'Invoke', count: transaction.logs.filter(l => l.type === LogType.INVOKE).length },
    { value: LogType.LOG, label: 'Logs', count: transaction.logs.filter(l => l.type === LogType.LOG).length },
    { value: LogType.COMPUTE, label: 'Compute', count: transaction.logs.filter(l => l.type === LogType.COMPUTE).length },
    { value: LogType.SUCCESS, label: 'Success', count: transaction.logs.filter(l => l.type === LogType.SUCCESS).length },
    { value: LogType.FAILURE, label: 'Failed', count: transaction.logs.filter(l => l.type === LogType.FAILURE).length },
  ];

  const programs = useMemo(() => {
    const programSet = new Set<string>();
    transaction.invocations.forEach(inv => {
      programSet.add(inv.programId);
      inv.children.forEach(child => programSet.add(child.programId));
    });
    return Array.from(programSet);
  }, [transaction.invocations]);

  return (
    <div className="space-y-5">
      {/* Transaction Info Card */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="section-header mb-0">
            <div className="section-icon">
              <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">Transaction Logs</h3>
              <p className="section-subtitle">{transaction.logs.length} log entries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Export button */}
            <button
              onClick={handleExport}
              className="btn-secondary px-3 py-1.5 text-xs font-mono flex items-center gap-2"
              title="Export as JSON"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
            
            {/* Status badge */}
            <div className={`badge ${transaction.success ? 'badge-success' : 'badge-error'}`}>
              <span className={`w-2 h-2 ${transaction.success ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`} />
              {transaction.success ? 'SUCCESS' : 'FAILED'}
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[var(--bg-secondary)]">
          <div>
            <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Slot</label>
            <p className="text-white font-mono text-sm mt-1">{transaction.slot.toLocaleString()}</p>
          </div>
          {transaction.blockTime && (
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Time</label>
              <p className="text-white text-xs mt-1">{formatTimestamp(transaction.blockTime)}</p>
            </div>
          )}
          {transaction.fee !== undefined && (
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Fee</label>
              <p className="text-white font-mono text-sm mt-1">{formatSol(transaction.fee)}</p>
            </div>
          )}
          <div>
            <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Programs</label>
            <p className="text-[var(--cyan)] font-mono text-sm mt-1">{programs.length}</p>
          </div>
        </div>

        {/* Programs */}
        {programs.length > 0 && (
          <div className="mt-4">
            <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Programs Involved</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {programs.map((programId, index) => {
                const name = getProgramName(programId);
                const colors = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];
                const color = colors[index % colors.length];
                return (
                  <button
                    key={programId}
                    onClick={() => handleCopy(programId, programId)}
                    className="px-2.5 py-1 text-xs font-mono bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-white hover:border-[var(--border-bright)] transition-colors flex items-center gap-1.5 group"
                    title={`Click to copy: ${programId}`}
                  >
                    <span style={{ color }}>●</span>
                    {name || formatProgramId(programId)}
                    {copiedField === programId ? (
                      <svg className="w-3 h-3 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-4">
          <label className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Signature</label>
          <div className="relative mt-2">
            <p className="text-[var(--text-secondary)] font-mono text-xs break-all p-3 pr-12 bg-[var(--bg-secondary)] border border-[var(--border-dim)]">
              {transaction.signature}
            </p>
            <button
              onClick={() => handleCopy(transaction.signature, 'signature')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"
              title="Copy signature"
            >
              {copiedField === 'signature' ? (
                <svg className="w-4 h-4 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="input-field w-full pl-10 pr-4 py-2.5 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="filter-tabs max-w-full overflow-x-auto">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              >
                {option.label}
                <span className="count">{option.count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRaw(!showRaw)}
            className="btn-secondary px-4 py-2 text-xs font-mono flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {showRaw ? 'Structured' : 'Raw'}
          </button>
        </div>
      </div>

      {/* Search results count */}
      {searchQuery && (
        <div className="text-xs text-[var(--text-muted)] font-mono">
          Found {filteredLogs.length} {filteredLogs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </div>
      )}

      {/* Logs */}
      {showRaw ? (
        <div className="card p-4 overflow-x-auto">
          <pre className="code-text text-[var(--text-secondary)]">
            {transaction.rawLogMessages.map((log, i) => (
              <div key={i} className="hover:bg-[var(--bg-tertiary)] px-2 py-0.5">
                <span className="text-[var(--text-muted)] mr-4 select-none w-8 inline-block text-right">{i}</span>
                {log}
              </div>
            ))}
          </pre>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] font-mono">
              {searchQuery ? `No logs match "${searchQuery}"` : 'No logs match this filter'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <LogEntry
                key={log.id}
                log={log}
                animationDelay={index * 20}
              />
            ))
          )}
        </div>
      )}

      {/* Invocation Tree */}
      {transaction.invocations.length > 0 && !showRaw && (
        <div className="card p-5">
          <div className="section-header">
            <div className="section-icon">
              <svg className="w-5 h-5 text-[var(--purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">Call Hierarchy</h3>
              <p className="section-subtitle">Program invocation tree</p>
            </div>
          </div>
          
          <div className="space-y-0.5 font-mono text-sm">
            {transaction.invocations.map((inv, idx) => (
              <InvocationNode
                key={`${inv.programId}-${idx}`}
                invocation={inv}
                collapsed={collapsed}
                onToggle={toggleCollapse}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface InvocationNodeProps {
  invocation: ParsedTransaction['invocations'][0];
  collapsed: Set<string>;
  onToggle: (programId: string, depth: number) => void;
  depth?: number;
}

function InvocationNode({ invocation, collapsed, onToggle, depth = 0 }: InvocationNodeProps) {
  const key = `${invocation.programId}-${depth}`;
  const isCollapsed = collapsed.has(key);
  const programName = getProgramName(invocation.programId);
  const hasChildren = invocation.children.length > 0;
  
  const depthColors = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];
  const color = depthColors[depth % depthColors.length];

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <div 
        className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
        onClick={() => hasChildren && onToggle(invocation.programId, depth)}
      >
        {hasChildren ? (
          <svg 
            className="w-3 h-3 text-[var(--text-muted)] transition-transform" 
            style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <span className="w-3" />
        )}
        
        <span 
          className="w-2 h-2" 
          style={{ background: invocation.success ? 'var(--green)' : 'var(--red)' }}
        />
        
        <span style={{ color }}>
          {programName || formatProgramId(invocation.programId)}
        </span>
        
        <span className="text-[var(--text-muted)] text-xs">
          Lvl {invocation.invokeLevel}
        </span>
        
        {invocation.computeUnits && (
          <span className="text-[var(--yellow)] text-xs ml-auto">
            {invocation.computeUnits.consumed.toLocaleString()} CU
          </span>
        )}
      </div>
      
      {!isCollapsed && hasChildren && (
        <div className="border-l border-[var(--border-dim)] ml-[7px]">
          {invocation.children.map((child, idx) => (
            <InvocationNode
              key={`${child.programId}-${idx}`}
              invocation={child}
              collapsed={collapsed}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
