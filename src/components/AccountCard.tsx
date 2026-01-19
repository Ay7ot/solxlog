import { AccountChange, Network } from '../types';
import { BalanceChangeList } from './BalanceChange';
import { formatAddress, getExplorerAccountUrl } from '../lib/accountDiff';

interface AccountCardProps {
    account: AccountChange;
    network: Network;
}

const accountTypeConfig: Record<string, { color: string; label: string }> = {
    wallet: { color: 'var(--cyan)', label: 'WALLET' },
    token_account: { color: 'var(--yellow)', label: 'TOKEN' },
    program: { color: 'var(--pink)', label: 'PROGRAM' },
    pda: { color: 'var(--purple)', label: 'PDA' },
    system: { color: 'var(--green)', label: 'SYSTEM' },
    unknown: { color: 'var(--text-muted)', label: 'ACCOUNT' },
};

export function AccountCard({ account, network }: AccountCardProps) {
    const hasChanges = account.solChange || account.tokenChanges.length > 0;
    const typeConfig = accountTypeConfig[account.accountType] || accountTypeConfig.unknown;

    return (
        <div
            className={`p-4 border transition-colors ${
                hasChanges
                    ? 'border-[var(--border-bright)] bg-[var(--bg-card)]'
                    : 'border-[var(--border-dim)] bg-[var(--bg-secondary)]/50'
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Index badge */}
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-xs font-mono text-[var(--text-muted)]">
                        {account.index}
                    </span>

                    {/* Address */}
                    <div className="min-w-0">
                        <a
                            href={getExplorerAccountUrl(account.address, network)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-white hover:text-[var(--cyan)] transition-colors truncate block"
                            title={account.address}
                        >
                            {formatAddress(account.address, 6)}
                        </a>
                        {account.label && (
                            <span className="text-xs text-[var(--text-muted)]">
                                {account.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Account type */}
                    <span
                        className="px-2 py-0.5 text-[10px] font-mono"
                        style={{
                            color: typeConfig.color,
                            background: `${typeConfig.color}10`,
                            border: `1px solid ${typeConfig.color}30`,
                        }}
                    >
                        {typeConfig.label}
                    </span>

                    {/* Status badges */}
                    {account.isFeePayer && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-[var(--yellow)] bg-[var(--yellow)]/10 border border-[var(--yellow)]/30">
                            FEE PAYER
                        </span>
                    )}
                    {account.isSigner && !account.isFeePayer && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-[var(--cyan)] bg-[var(--cyan)]/10 border border-[var(--cyan)]/30">
                            SIGNER
                        </span>
                    )}
                    {account.isNew && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-[var(--green)] bg-[var(--green)]/10 border border-[var(--green)]/30">
                            NEW
                        </span>
                    )}
                    {account.isClosed && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30">
                            CLOSED
                        </span>
                    )}
                </div>
            </div>

            {/* Balance changes */}
            {hasChanges ? (
                <div className="pl-10">
                    <BalanceChangeList
                        solChange={account.solChange}
                        tokenChanges={account.tokenChanges}
                        showFull={true}
                    />
                </div>
            ) : (
                <div className="pl-10 text-xs text-[var(--text-muted)] font-mono italic">
                    {account.accountType === 'program' ? 'Executable - no balance changes' : 'No changes'}
                </div>
            )}
        </div>
    );
}

interface AccountCardListProps {
    accounts: AccountChange[];
    network: Network;
    filter?: 'all' | 'changed' | 'sol' | 'tokens' | 'created';
}

export function AccountCardList({ accounts, network, filter = 'all' }: AccountCardListProps) {
    const filteredAccounts = accounts.filter((account) => {
        switch (filter) {
            case 'changed':
                return account.solChange || account.tokenChanges.length > 0;
            case 'sol':
                return account.solChange !== null;
            case 'tokens':
                return account.tokenChanges.length > 0;
            case 'created':
                return account.isNew || account.isClosed;
            default:
                return true;
        }
    });

    if (filteredAccounts.length === 0) {
        return (
            <div className="p-8 text-center text-[var(--text-muted)] font-mono text-sm">
                No accounts match the current filter
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {filteredAccounts.map((account) => (
                <AccountCard key={account.index} account={account} network={network} />
            ))}
        </div>
    );
}
