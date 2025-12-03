import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Wallet } from '../types';
import { formatWithConversion, getCurrencySymbol } from '../utils/currencyConverter';

interface BankDetailsOperationProps {
  tenantWallets: Wallet[];
  onClose: () => void;
}

const BankDetailsOperation = ({ tenantWallets, onClose }: BankDetailsOperationProps) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    tenantWallets[0]?.id || ''
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Примерные банковские реквизиты для разных валют
  const getBankDetails = (currency: string) => {
    const detailsMap: Record<string, {
      bankName: string;
      accountNumber: string;
      swift: string;
      iban?: string;
      routingNumber?: string;
      additionalInfo?: string;
    }> = {
      RUB: {
        bankName: 'Тинькофф Банк',
        accountNumber: '40817810200000012345',
        swift: 'TICSRUMM',
        iban: 'RU02012345678901234567',
        additionalInfo: 'Для переводов в рублях РФ',
      },
      USD: {
        bankName: 'Citibank N.A. (New York)',
        accountNumber: '36001234',
        swift: 'CITIUS33',
        routingNumber: '021000089',
        additionalInfo: 'Для переводов в долларах США',
      },
      EUR: {
        bankName: 'Deutsche Bank AG',
        accountNumber: '100987654321',
        swift: 'DEUTDEFF',
        iban: 'DE89370400440532013000',
        additionalInfo: 'Для переводов в евро',
      },
      THB: {
        bankName: 'Bangkok Bank Public Company Limited',
        accountNumber: '123-4-56789-0',
        swift: 'BKKBTHBK',
        additionalInfo: 'Для переводов в тайских батах',
      },
      CNY: {
        bankName: 'Bank of China',
        accountNumber: '4567890123456789',
        swift: 'BKCHCNBJ',
        additionalInfo: 'Для переводов в китайских юанях',
      },
    };

    return detailsMap[currency.toUpperCase()] || {
      bankName: 'Международный банк',
      accountNumber: 'По запросу',
      swift: 'По запросу',
      additionalInfo: 'Реквизиты для данной валюты уточняйте у менеджера',
    };
  };

  const selectedWallet = tenantWallets.find(w => w.id === selectedWalletId);
  const bankDetails = selectedWallet ? getBankDetails(selectedWallet.currency) : null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedWallet || !bankDetails) {
    return (
      <div className="transfer-form-container">
        <h4>Пополнение по реквизитам</h4>
        <p>Нет доступных кошельков</p>
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const formattedBalance = formatWithConversion(
    selectedWallet.balance,
    selectedWallet.currency
  );
  const currencySymbol = getCurrencySymbol(selectedWallet.currency);

  return (
    <div className="transfer-form-container">
      <h4>Пополнение по банковским реквизитам</h4>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div>
          <label className="form-field">
            <span>Выберите кошелёк для пополнения</span>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              style={{ width: '100%' }}
            >
              {tenantWallets.map((wallet) => {
                const formatted = formatWithConversion(wallet.balance, wallet.currency);
                return (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.currency} кошелёк • {formatted.primary}
                  </option>
                );
              })}
            </select>
          </label>

          <div style={{ 
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h5 style={{ marginTop: 0 }}>Информация о кошельке</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Валюта:</span>
                <span style={{ fontWeight: '500' }}>
                  {currencySymbol} {selectedWallet.currency}
                  {formattedBalance.isForeign && (
                    <span style={{
                      fontSize: '11px',
                      marginLeft: '6px',
                      padding: '1px 4px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '3px',
                      color: '#64748b',
                    }}>
                      ИНО
                    </span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Текущий баланс:</span>
                <span style={{ fontWeight: '500' }}>{formattedBalance.primary}</span>
              </div>
              {formattedBalance.secondary && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>В рублях:</span>
                  <span style={{ fontStyle: 'italic' }}>{formattedBalance.secondary}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <h5 style={{ marginTop: 0, color: '#0369a1' }}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Важная информация
          </h5>
          <ul style={{ 
            margin: '12px 0', 
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#475569'
          }}>
            <li>Используйте указанные реквизиты для банковского перевода</li>
            <li>Обязательно укажите номер кошелька в назначении платежа</li>
            <li>Пополнение обрабатывается в течение 1-3 рабочих дней</li>
            <li>Комиссия банка отправителя оплачивается отдельно</li>
          </ul>
        </div>
      </div>

      {/* Банковские реквизиты */}
      <div style={{ 
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #0f172a'
      }}>
        <h4 style={{ 
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          Банковские реквизиты для {selectedWallet.currency}
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries({
            'Банк получателя': bankDetails.bankName,
            'Номер счёта': bankDetails.accountNumber,
            ...(bankDetails.swift && { 'SWIFT/BIC код': bankDetails.swift }),
            ...(bankDetails.iban && { 'IBAN': bankDetails.iban }),
            ...(bankDetails.routingNumber && { 'Routing Number': bankDetails.routingNumber }),
            'Назначение платежа': `Пополнение кошелька ${selectedWallet.id}`,
          }).map(([label, value]) => (
            <div 
              key={label}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => handleCopy(value, label)}
              title="Нажмите для копирования"
            >
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  {label}
                </div>
                <div style={{ 
                  fontWeight: '500',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  wordBreak: 'break-all'
                }}>
                  {value}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {copiedField === label && (
                  <span style={{
                    fontSize: '12px',
                    color: '#10b981',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    Скопировано!
                  </span>
                )}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#64748b" 
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {bankDetails.additionalInfo && (
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <strong>Примечание:</strong> {bankDetails.additionalInfo}
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="form-actions" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            className="button"
            onClick={() => {
              const allDetails = Object.entries({
                'Валюта': selectedWallet.currency,
                'Банк получателя': bankDetails.bankName,
                'Номер счёта': bankDetails.accountNumber,
                ...(bankDetails.swift && { 'SWIFT/BIC код': bankDetails.swift }),
                ...(bankDetails.iban && { 'IBAN': bankDetails.iban }),
                ...(bankDetails.routingNumber && { 'Routing Number': bankDetails.routingNumber }),
                'Назначение платежа': `Пополнение кошелька ${selectedWallet.id}`,
                ...(bankDetails.additionalInfo && { 'Примечание': bankDetails.additionalInfo }),
              }).map(([key, value]) => `${key}: ${value}`).join('\n');
              
              handleCopy(allDetails, 'all');
            }}
          >
            {copiedField === 'all' ? 'Скопировано!' : 'Копировать все'}
          </button>
          <button 
            type="button" 
            className="button button-secondary"
            onClick={handlePrint}
          >
            Печать реквизитов
          </button>
        </div>
        <button type="button" className="primary-button" onClick={onClose}>
          Готово
        </button>
      </div>

      {/* Стили для анимации */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @media print {
            .form-actions {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BankDetailsOperation;