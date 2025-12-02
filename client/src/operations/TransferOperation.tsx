import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Wallet, TransferPayload } from '../types';

interface TransferOperationProps {
  allWallets: Array<Wallet & { tenantId: string; tenantTitle: string }>;
  onCreateTransfer: (payload: TransferPayload) => Promise<string>;
  onClose: () => void;
}

const TransferOperation = ({
  allWallets,
  onCreateTransfer,
  onClose,
}: TransferOperationProps) => {
  const [transferData, setTransferData] = useState({
    fromWallet: allWallets[0]?.id || '',
    toWallet: allWallets[1]?.id || allWallets[0]?.id || '',
    amount: 0,
    memo: '',
  });
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!transferData.fromWallet || !transferData.toWallet || transferData.fromWallet === transferData.toWallet) {
      setResult('Выберите разные кошельки');
      return;
    }
    if (transferData.amount <= 0) {
      setResult('Введите корректную сумму');
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const reference = await onCreateTransfer({
        fromWallet: transferData.fromWallet,
        toWallet: transferData.toWallet,
        amount: transferData.amount,
        memo: transferData.memo,
      });
      setResult(`Перевод создан. Референс: ${reference}`);
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 3000);
    } catch (error) {
      setResult('Не удалось создать перевод. Попробуйте позже.');
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="transfer-form-container">
      <h4>Создать перевод</h4>
      <form className="transfer-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Откуда</span>
          <select
            value={transferData.fromWallet}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                fromWallet: event.target.value,
              })
            }
          >
            {allWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.tenantTitle} · {wallet.currency} (
                {wallet.balance.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {wallet.currency})
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Куда</span>
          <select
            value={transferData.toWallet}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                toWallet: event.target.value,
              })
            }
          >
            {allWallets
              .filter((w) => w.id !== transferData.fromWallet)
              .map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.tenantTitle} · {wallet.currency} (
                  {wallet.balance.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {wallet.currency})
                </option>
              ))}
          </select>
        </label>

        <label className="form-field">
          <span>Сумма</span>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={transferData.amount || ''}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                amount: Number(event.target.value),
              })
            }
            required
          />
        </label>

        <label className="form-field">
          <span>Комментарий</span>
          <textarea
            value={transferData.memo}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                memo: event.target.value,
              })
            }
          />
        </label>

        {result && (
          <div className={`form-result ${result.includes('создан') ? 'form-result--success' : 'form-result--error'}`}>
            {result}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="primary-button" disabled={pending}>
            {pending ? 'Отправляем...' : 'Создать перевод'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferOperation;

