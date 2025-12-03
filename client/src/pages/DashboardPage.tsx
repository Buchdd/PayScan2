import { Link } from 'react-router-dom';
import type { Stream, Wallet } from '../types';
import UserProfile, { type UserProfileData } from '../components/UserProfile';
import { formatWithConversion, getCurrencySymbol } from '../utils/currencyConverter';
import '../styles/pages/dashboard.css';

interface DashboardPageProps {
  streams: Stream[];
}

interface WalletWithContext extends Wallet {
  streamId: string;
  streamLabel: string;
  tenantTitle: string; 
}

// Пример данных пользователя
const mockUserData: UserProfileData = {
  fullName: 'Иванов Иван Иванович',
  phone: '+7 (999) 123-45-67',
  email: 'ivan.ivanov@example.com',
  passportData: {
    series: '45 01',
    number: '123456',
    issuedBy: 'ОУФМС России по г. Москве',
    issueDate: '12.05.2018',
  },
  verificationStatus: 'verified',
};

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

  const handleVerificationRequest = () => {
    console.log('Запрос на верификацию отправлен');
  };

  const handleEditProfile = () => {
    console.log('Редактирование профиля');
  };

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

      {/* Профиль пользователя с возможностью сворачивания */}
      <UserProfile
        user={mockUserData}
        onVerificationRequest={handleVerificationRequest}
        onEditProfile={handleEditProfile}
        defaultCollapsed={true}
      />

      <div className="wallets-overview">
        {allWallets.length === 0 ? (
          <div className="card">
            <p>У вас пока нет кошельков</p>
          </div>
        ) : (
          <div className="wallet-list">
            {allWallets.map((wallet) => {
              const formatted = formatWithConversion(wallet.balance, wallet.currency);
              const currencySymbol = getCurrencySymbol(wallet.currency);
              
              return (
                <Link
                  key={wallet.id}
                  to={`/streams/${wallet.streamId}`}
                  className="wallet-item"
                >
                  <div className="wallet-item__info">
                    <div className="wallet-item__header">
                      <h3>
                        <span style={{ marginRight: '8px' }}>{currencySymbol}</span>
                        {wallet.currency} кошелёк
                        {formatted.isForeign && (
                          <span style={{
                            fontSize: '12px',
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '4px',
                            color: '#64748b',
                          }}>
                            Иностранный
                          </span>
                        )}
                      </h3>
                      <span className="badge badge--outline">{wallet.streamLabel}</span>
                    </div>
                    <p className="wallet-item__tenant">{wallet.tenantTitle}</p>
                    <p className="wallet-item__id">ID: {wallet.id}</p>
                  </div>
                  <div className="wallet-item__balance">
                    <p className="wallet-item__amount">
                      {formatted.primary}
                    </p>
                    {formatted.secondary && (
                      <p className="wallet-item__conversion" style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '4px 0',
                        fontStyle: 'italic',
                      }}>
                        {formatted.secondary}
                      </p>
                    )}
                    <p className="wallet-item__currency">
                      Баланс в {wallet.currency}
                    </p>
                  </div>
                </Link>
              );
            })}
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