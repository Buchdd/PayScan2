DELIMITER //

CREATE FUNCTION TransferBetweenWallets(
    p_from_wallet_id INT,
    p_to_wallet_id INT,
    p_amount DECIMAL(15,2),
    p_currency_code VARCHAR(3),
    p_fee_amount DECIMAL(15,2)
) RETURNS VARCHAR(50)
READS SQL DATA
BEGIN
    DECLARE v_from_client_id INT;
    DECLARE v_to_client_id INT;
    DECLARE v_from_balance DECIMAL(15,2);
    DECLARE v_system_account_from INT;
    DECLARE v_system_account_to INT;
    DECLARE v_system_balance_from DECIMAL(15,2);
    DECLARE v_system_balance_to DECIMAL(15,2);
    DECLARE v_transaction_uuid VARCHAR(36);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RETURN 'error';
    END;

    -- Получаем информацию о кошельках и клиентах
    SELECT client_id, balance INTO v_from_client_id, v_from_balance
    FROM client_wallets 
    WHERE wallet_id = p_from_wallet_id AND is_active = 1;
    
    SELECT client_id INTO v_to_client_id
    FROM client_wallets 
    WHERE wallet_id = p_to_wallet_id AND is_active = 1;
    
    -- Получаем системные счета для данной валюты
    -- Предполагаем, что есть системные счета для каждой валюты
    SELECT account_id, current_balance INTO v_system_account_from, v_system_balance_from
    FROM bank_accounts 
    WHERE account_type = 'SYSTEM' AND currency_code = p_currency_code
    LIMIT 1;
    
    SELECT account_id INTO v_system_account_to
    FROM bank_accounts 
    WHERE account_type = 'SYSTEM' AND account_id != v_system_account_from
    AND currency_code = p_currency_code
    LIMIT 1;

    -- Проверяем существование кошельков и системных счетов
    IF v_from_client_id IS NULL THEN
        RETURN 'sender_wallet_not_found';
    END IF;
    
    IF v_to_client_id IS NULL THEN
        RETURN 'receiver_wallet_not_found';
    END IF;
    
    IF v_system_account_from IS NULL OR v_system_account_to IS NULL THEN
        RETURN 'system_accounts_not_found';
    END IF;

    -- Проверяем достаточность средств
    IF v_from_balance < (p_amount + p_fee_amount) THEN
        RETURN 'insufficient_funds';
    END IF;

    -- Проверяем баланс системного счета (если нужно)
    IF v_system_balance_from < p_amount THEN
        RETURN 'system_insufficient_funds';
    END IF;

    -- Генерируем UUID для транзакции
    SET v_transaction_uuid = UUID();
    
    START TRANSACTION;
    
    -- Снимаем средства с кошелька отправителя
    UPDATE client_wallets 
    SET balance = balance - (p_amount + p_fee_amount),
        updated_at = NOW()
    WHERE wallet_id = p_from_wallet_id;
    
    -- Зачисляем средства на кошелек получателя
    UPDATE client_wallets 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE wallet_id = p_to_wallet_id;
    
    -- Отражение в системных банковских счетах
    -- Снимаем с одного системного счета
    UPDATE bank_accounts 
    SET current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE account_id = v_system_account_from;
    
    -- Зачисляем на другой системный счет
    UPDATE bank_accounts 
    SET current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE account_id = v_system_account_to;
    
    -- Записываем транзакцию
    INSERT INTO transactions (
        transaction_uuid, from_wallet_id, to_wallet_id, 
        from_bank_account_id, to_bank_account_id, amount, 
        currency_code, fee_amount, transaction_type, status,
        created_at, updated_at
    ) VALUES (
        v_transaction_uuid, p_from_wallet_id, p_to_wallet_id, 
        v_system_account_from, v_system_account_to, p_amount, 
        p_currency_code, p_fee_amount, 'WALLET_TRANSFER', 'completed',
        NOW(), NOW()
    );
    
    COMMIT;
    
    RETURN 'success';
END //

DELIMITER ;