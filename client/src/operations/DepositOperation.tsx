interface DepositOperationProps {
  onClose: () => void;
}

const DepositOperation = ({ onClose }: DepositOperationProps) => {
  return (
    <div className="transfer-form-container">
      <h4>Пополнение счёта</h4>
      <p>Функция пополнения счёта будет реализована позже.</p>
      <div className="form-actions">
        <button type="button" className="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default DepositOperation;

