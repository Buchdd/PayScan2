import { Link } from 'react-router-dom';
import type { Stream, Wallet } from '../types';
import '../styles/pages/dashboard.css';

interface DashboardPageProps {
  streams: Stream[];
}

interface WalletWithContext extends Wallet {
  streamId: string;
  streamLabel: string;
  tenantTitle: string;
}

const DashboardPage = ({ streams }: DashboardPageProps) => {
  // Собираем все кошельки со всех стримов
  const allWallets: WalletWithContext[] = streams.flatMap((stream) =>
    stream.tenants.flatMap((tenant) =>
      tenant.wallets.map((wallet) => ({
        ...wallet,
        streamId: stream.id,
        streamLabel: stream.label,
        tenantTitle: tenant.title,
      })),
    ),
  );

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <p className="page__eyebrow">Личный кабинет</p>
          <h2>Мои кошельки</h2>
        </div>
        <div className="page__header-stats">
          <div>
            <p className="stat-label">Всего кошельков</p>
            <h3>{allWallets.length}</h3>
          </div>
        </div>
      </div>

      <div className="wallets-overview">
        {allWallets.length === 0 ? (
          <div className="card">
            <p>У вас пока нет кошельков</p>
          </div>
        ) : (
          <div className="wallet-list">
            {allWallets.map((wallet) => (
              <Link
                key={wallet.id}
                to={`/streams/${wallet.streamId}`}
                className="wallet-item"
              >
                <div className="wallet-item__info">
                  <div className="wallet-item__header">
                    <h3>{wallet.currency} кошелёк</h3>
                    <span className="badge badge--outline">{wallet.streamLabel}</span>
                  </div>
                  <p className="wallet-item__tenant">{wallet.tenantTitle}</p>
                  <p className="wallet-item__id">ID: {wallet.id}</p>
                </div>
                <div className="wallet-item__balance">
                  <p className="wallet-item__amount">
                    {wallet.balance.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="wallet-item__currency">{wallet.currency}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="streams-quick-access">
        <h3>Быстрый доступ к стримам</h3>
        <div className="card-grid">
          {streams.map((stream) => (
            <Link
              key={stream.id}
              to={`/streams/${stream.id}`}
              className="card card--clickable"
            >
              <div className="card__header">
                <div>
                  <p className="card__eyebrow">Стрим</p>
                  <h3>{stream.label}</h3>
                </div>
                <span className="badge">{stream.type}</span>
              </div>
              {stream.description && <p>{stream.description}</p>}
              <div className="card__footer">
                <div>
                  <p className="meta">
                    Кошельков: <strong>
                      {stream.tenants.reduce(
                        (sum, tenant) => sum + tenant.wallets.length,
                        0,
                      )}
                    </strong>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;


