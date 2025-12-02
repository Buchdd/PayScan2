import { useState } from 'react';
import type { Wallet } from '../types';

interface QrPaymentOperationProps {
  tenantWallets: Wallet[];
  onClose: () => void;
}

const generateQrSeed = (amount: number, walletId: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PayScan-${amount}-${walletId}-${Date.now()}`;

const QrPaymentOperation = ({
  tenantWallets,
  onClose,
}: QrPaymentOperationProps) => {
  const [qrData, setQrData] = useState({
    amount: '',
    walletId: tenantWallets[0]?.id || '',
  });
  const [generatedQr, setGeneratedQr] = useState('');

  const handleGenerateQr = () => {
    if (!qrData.walletId || !qrData.amount || parseFloat(qrData.amount) <= 0) {
      alert('Пожалуйста, выберите кошелёк и укажите сумму');
      return;
    }
    
    const amount = parseFloat(qrData.amount);
    const qrCode = generateQrSeed(amount, qrData.walletId);
    setGeneratedQr(qrCode);
  };

  const handleAmountChange = (value: string) => {
    // Разрешаем только числа и одну точку для десятичных
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setQrData({
        ...qrData,
        amount: value,
      });
    }
  };

  const formatAmount = (amount: string) => {
    if (!amount) return '0,00';
    const num = parseFloat(amount);
    return isNaN(num) ? '0,00' : num.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="qr-form-container">
      <h4>QR-оплата</h4>
      <p className="qr-form-description">
        Укажите сумму и выберите кошелёк для получения оплаты. Клиент может оплатить через российский или азиатский счёт.
        После настройки нажмите "Сгенерировать QR", чтобы создать код для оплаты.
      </p>
      
      <div className="qr-layout-inline">
        <div className="qr-form-fields">
          <label className="form-field">
            <span>Кошелёк для получения</span>
            <select
              value={qrData.walletId}
              onChange={(event) =>
                setQrData({
                  ...qrData,
                  walletId: event.target.value,
                })
              }
              className="form-select"
            >
              {tenantWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.currency} ({wallet.balance.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} {wallet.currency})
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Сумма платежа</span>
            <div className="amount-input-wrapper">
              <input
                type="text"
                value={qrData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0,00"
                className="amount-input"
              />
              <span className="currency-suffix">₽</span>
            </div>
            <div className="amount-preview">
              {qrData.amount ? formatAmount(qrData.amount) : '0,00'} ₽
            </div>
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={handleGenerateQr}
              disabled={!qrData.amount || parseFloat(qrData.amount) <= 0}
            >
              Сгенерировать QR-код
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setQrData({
                  amount: '',
                  walletId: tenantWallets[0]?.id || '',
                });
                setGeneratedQr('');
              }}
            >
              Очистить
            </button>
          </div>
        </div>

        <div className="qr-card-inline">
          {generatedQr ? (
            <>
              <p className="card__eyebrow">QR-код для оплаты</p>
              <img src={generatedQr} alt="QR code" />
              <div className="qr-card-info">
                <p>Сумма: <strong>{formatAmount(qrData.amount)} ₽</strong></p>
                <p className="qr-instruction">
                  Для оплаты отсканируйте QR-код через приложение банка
                </p>
              </div>
              <div className="qr-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleGenerateQr}
                >
                  Обновить QR
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedQr;
                    link.download = `qr-payment-${Date.now()}.png`;
                    link.click();
                  }}
                >
                  Сохранить QR
                </button>
              </div>
            </>
          ) : (
            <div className="qr-placeholder">
              <p className="card__eyebrow">QR-код</p>
              <div className="placeholder-image">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 4" />
                  <path d="M8 12h8M12 8v8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="placeholder-text">
                Укажите сумму и нажмите "Сгенерировать QR-код"
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default QrPaymentOperation;