import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ExplorerPage } from './pages/ExplorerPage';
import { ComparePage } from './pages/ComparePage';
import { AccountDiffPage } from './pages/AccountDiffPage';
import { DecodePage } from './pages/DecodePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-[var(--cyan)]/20" />
          <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-[var(--pink)]/20" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-[var(--yellow)]/20" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-[var(--green)]/20" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                                linear-gradient(var(--text-muted) 1px, transparent 1px),
                                linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)
                            `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border-dim)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-[var(--pink)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.9l7 3.5v7.28l-7-3.5V8.9zm9 10.78V12.4l7-3.5v7.28l-7 3.5z" />
                  </svg>
                </div>
                {/* Decorative corner */}
                <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-[var(--cyan)]" />
                <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-[var(--yellow)]" />
              </div>
              <div className="text-left hidden md:block">
                <h1 className="font-display font-bold text-white text-lg tracking-wider">
                  SOL<span className="text-[var(--pink)]">X</span>LOG
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest">
                  TRANSACTION TOOLS
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Navigation />

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[var(--green)]/30 bg-[var(--green)]/5">
                <span className="w-2 h-2 bg-[var(--green)]" style={{ boxShadow: '0 0 10px var(--green)' }} />
                <span className="text-xs font-mono text-[var(--green)]">RPC LIVE</span>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors border border-transparent hover:border-[var(--cyan)]/30"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 relative z-10 pt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <Routes>
              <Route path="/" element={<ExplorerPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/accounts" element={<AccountDiffPage />} />
              <Route path="/decode" element={<DecodePage />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[var(--border-dim)] mt-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
                <span>OPEN SOURCE</span>
                <span className="w-1 h-1 bg-[var(--border-bright)]" />
                <span>MIT LICENSE</span>
                <span className="w-1 h-1 bg-[var(--border-bright)]" />
                <span>NO TRACKING</span>
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                BUILT FOR <span className="text-[var(--pink)]">SOLANA</span> DEVELOPERS
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
