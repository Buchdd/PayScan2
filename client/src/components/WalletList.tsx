import type { Tenant } from '../types';
import { formatWithConversion, getCurrencySymbol } from '../utils/currencyConverter';

interface WalletListProps {
  tenant: Tenant;
}

const WalletList = ({ tenant }: WalletListProps) => {
  return (
    <div className="card">
      <div className="card__header">
        <div>
          <p className="card__eyebrow">Кошелёк</p>
          <h3>{tenant.title}</h3>
        </div>
      </div>
      <div className="wallet-grid">
        {tenant.wallets.map((wallet) => {
          const formatted = formatWithConversion(wallet.balance, wallet.currency);
          const currencySymbol = getCurrencySymbol(wallet.currency);
          
          return (
            <div key={wallet.id} className="wallet-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{currencySymbol}</span>
                <p className="wallet-card__label">
                  {wallet.label || `${wallet.currency} кошелёк`}
                  {formatted.isForeign && (
                    <span style={{
                      fontSize: '10px',
                      marginLeft: '6px',
                      padding: '1px 4px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '3px',
                      color: '#64748b',
                    }}>
                      ИНО
                    </span>
                  )}
                </p>
              </div>
              <p className="wallet-card__amount">
                {formatted.primary}
              </p>
              {formatted.secondary && (
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '4px 0',
                  fontStyle: 'italic',
                }}>
                  {formatted.secondary}
                </p>
              )}
              <p className="wallet-card__id">{wallet.id}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletList;