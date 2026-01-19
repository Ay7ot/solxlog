import { NavLink } from 'react-router-dom';

export function Navigation() {
    return (
        <nav className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 border border-[var(--border-dim)]">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all ${isActive
                        ? 'bg-[var(--pink)] text-white'
                        : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                    }`
                }
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden sm:inline">Explorer</span>
            </NavLink>
            <NavLink
                to="/compare"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all ${isActive
                        ? 'bg-[var(--pink)] text-white'
                        : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                    }`
                }
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Compare</span>
            </NavLink>
            <NavLink
                to="/accounts"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all ${isActive
                        ? 'bg-[var(--pink)] text-white'
                        : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                    }`
                }
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">Accounts</span>
            </NavLink>
            <NavLink
                to="/decode"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all ${isActive
                        ? 'bg-[var(--pink)] text-white'
                        : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                    }`
                }
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="hidden sm:inline">Decode</span>
            </NavLink>
        </nav>
    );
}
