import type { Tenant } from '../types';

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
        {tenant.wallets.map((wallet) => (
          <div key={wallet.id} className="wallet-card">
            <p className="wallet-card__label">
              {wallet.label || wallet.currency} кошелёк
            </p>
            <p className="wallet-card__amount">
              {wallet.balance.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {wallet.currency}
            </p>
            <p className="wallet-card__id">{wallet.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletList;


