import { Network } from '../types';

interface NetworkSwitcherProps {
  network: Network;
  onChange: (network: Network) => void;
  disabled?: boolean;
}

export function NetworkSwitcher({ network, onChange, disabled }: NetworkSwitcherProps) {
  return (
    <div className="network-toggle">
      <button
        onClick={() => onChange('mainnet-beta')}
        disabled={disabled}
        className={`network-btn mainnet ${network === 'mainnet-beta' ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-2">
          {network === 'mainnet-beta' && (
            <span className="w-2 h-2 rounded-full bg-current" />
          )}
          MAINNET
        </span>
      </button>
      <button
        onClick={() => onChange('devnet')}
        disabled={disabled}
        className={`network-btn devnet ${network === 'devnet' ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-2">
          {network === 'devnet' && (
            <span className="w-2 h-2 rounded-full bg-current" />
          )}
          DEVNET
        </span>
      </button>
    </div>
  );
}
