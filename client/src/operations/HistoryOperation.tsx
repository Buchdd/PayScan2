interface HistoryOperationProps {
  onClose: () => void;
}

const HistoryOperation = ({ onClose }: HistoryOperationProps) => {
  return (
    <div className="transfer-form-container">
      <h4>История операций</h4>
      <p>Функция просмотра истории операций будет реализована позже.</p>
      <div className="form-actions">
        <button type="button" className="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default HistoryOperation;

