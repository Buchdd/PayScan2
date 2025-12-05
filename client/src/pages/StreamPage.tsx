// StreamPage.tsx - исправляем использование wallet.currency
import { useState } from 'react';
import type { Stream, TransferPayload } from '../types';
import '../styles/pages/stream.css';
import TransferOperation from '../operations/TransferOperation';
import QrPaymentOperation from '../operations/QrPaymentOperation';
import DepositOperation from '../operations/DepositOperation';
import HistoryOperation from '../operations/HistoryOperation';
import BankDetailsOperation from '../operations/BankDetailsOperation';
import { formatWithConversion, getCurrencySymbol } from '../utils/currencyConverter';

interface StreamPageProps {
  stream: Stream;
  onCreateTransfer: (payload: TransferPayload) => Promise<string>;
}

type OperationType = 'transfer' | 'qr' | 'deposit' | 'history' | 'bank-details' | null;

const StreamPage = ({ stream, onCreateTransfer }: StreamPageProps) => {
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationType>(null);

  // Собираем все кошельки из текущего стрима
  const allWallets = stream.tenants.flatMap((tenant) =>
    tenant.wallets.map((wallet) => ({
      ...wallet,
      tenantId: tenant.id,
      tenantTitle: tenant.title,
    })),
  );

  const handleOperationClick = (tenantId: string, operation: OperationType) => {
    if (activeTenantId === tenantId && activeOperation === operation) {
      setActiveTenantId(null);
      setActiveOperation(null);
    } else {
      setActiveTenantId(tenantId);
      setActiveOperation(operation);
    }
  };

  const handleCloseOperation = () => {
    setActiveTenantId(null);
    setActiveOperation(null);
  };

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2>{stream.label}</h2>
          {stream.description && <p>{stream.description}</p>}
        </div>
        <span className="badge badge--outline">{stream.type}</span>
      </div>

      <div className="tenants-grid">
        {stream.tenants.map((tenant) => (
          <div
            key={tenant.id}
            className={`tenant-card ${activeTenantId === tenant.id ? 'tenant-card--active' : ''}`}
          >
            <div className="tenant-card__header">
              <div>
                <h3>{tenant.title}</h3>
              </div>
            </div>

            <div className="tenant-card__content">
              <div className="tenant-wallets">
                <h4>Кошельки:</h4>
                <div className="wallet-grid">
                  {tenant.wallets.map((wallet) => {
                    // ИСПРАВЛЯЕМ: wallet.currency -> wallet.currency_code
                    const formatted = formatWithConversion(wallet.balance, wallet.currency_code);
                    const currencySymbol = getCurrencySymbol(wallet.currency_code);
                    
                    return (
                      <div key={wallet.id} className="wallet-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>{currencySymbol}</span>
                          <p className="wallet-card__label">
                            {wallet.currency_code} кошелёк {/* ИСПРАВЛЯЕМ */}
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
                            margin: '2px 0',
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

              {/* Остальной код без изменений */}
              <div className="tenant-actions">
                <h4>Операции:</h4>
                <div className="actions-grid">
                  <button
                    className="action-button"
                    onClick={() => handleOperationClick(tenant.id, 'transfer')}
                  >
                    💸 Перевод между кошельками
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleOperationClick(tenant.id, 'deposit')}
                  >
                    💳 Быстрое пополнение
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleOperationClick(tenant.id, 'bank-details')}
                  >
                    🏦 Пополнение по реквизитам
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleOperationClick(tenant.id, 'qr')}
                  >
                    📱 QR-оплата
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleOperationClick(tenant.id, 'history')}
                  >
                    📊 История операций
                  </button>
                </div>
              </div>

              {activeTenantId === tenant.id && activeOperation === 'transfer' && (
                <TransferOperation
                  allWallets={allWallets}
                  onCreateTransfer={onCreateTransfer}
                  onClose={handleCloseOperation}
                />
              )}

              {activeTenantId === tenant.id && activeOperation === 'qr' && (
                <QrPaymentOperation
                  tenantWallets={tenant.wallets}
                  onClose={handleCloseOperation}
                />
              )}

              {activeTenantId === tenant.id && activeOperation === 'deposit' && (
                <DepositOperation onClose={handleCloseOperation} />
              )}

              {activeTenantId === tenant.id && activeOperation === 'history' && (
                <HistoryOperation onClose={handleCloseOperation} />
              )}

              {activeTenantId === tenant.id && activeOperation === 'bank-details' && (
                <BankDetailsOperation
                  tenantWallets={tenant.wallets}
                  onClose={handleCloseOperation}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StreamPage;