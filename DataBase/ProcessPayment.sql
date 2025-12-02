DELIMITER //

CREATE FUNCTION ProcessPayment(
    p_client_wallet_id INT,
    p_client_account_id INT,
    p_merchant_account_id INT,
    p_amount DECIMAL(15,2),
    p_currency_code VARCHAR(3),
    p_fee_amount DECIMAL(15,2)
) RETURNS VARCHAR(50)
READS SQL DATA
BEGIN
    DECLARE v_client_balance DECIMAL(15,2);
    DECLARE v_account_balance DECIMAL(15,2);
    DECLARE v_transaction_uuid VARCHAR(36);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RETURN 'error';
    END;

    -- Проверяем достаточность средств
    SELECT balance INTO v_client_balance 
    FROM client_wallets 
    WHERE wallet_id = p_client_wallet_id;
    
    SELECT current_balance INTO v_account_balance 
    FROM bank_accounts 
    WHERE account_id = p_client_account_id;
    
    IF v_client_balance < p_amount OR v_account_balance < p_amount THEN
        RETURN 'insufficient_funds';
    END IF;

    -- Генерируем UUID для транзакции
    SET v_transaction_uuid = UUID();
    
    START TRANSACTION;
    
    -- Снимаем средства с кошелька клиента
    UPDATE client_wallets 
    SET balance = balance - p_amount 
    WHERE wallet_id = p_client_wallet_id;
    
    -- Снимаем средства с системного банковского счета
    UPDATE bank_accounts 
    SET current_balance = current_balance - p_amount 
    WHERE account_id = p_client_account_id;
    
    -- Зачисляем средства на счет мерчанта
    UPDATE bank_accounts 
    SET current_balance = current_balance + p_amount 
    WHERE account_id = p_merchant_account_id;
    
    -- Записываем транзакцию
    INSERT INTO transactions (
        transaction_uuid, from_wallet_id, from_bank_account_id, 
        to_bank_account_id, amount, currency_code, fee_amount, 
        transaction_type, status
    ) VALUES (
        v_transaction_uuid, p_client_wallet_id, p_client_account_id, 
        p_merchant_account_id, p_amount, p_currency_code, p_fee_amount, 
        'PAYMENT', 'completed'
    );
    
    COMMIT;
    
    RETURN 'success';
END //

DELIMITER ;