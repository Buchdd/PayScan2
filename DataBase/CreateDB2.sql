-- Создание базы данных
-- USE financial_system;
-- DROP DATABASE financial_system;

CREATE DATABASE IF NOT EXISTS financial_system;
USE financial_system;

-- 1. Таблица Клиентов
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_uuid (uuid),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- 2. Таблица Кошельков клиента (фиктивные)
CREATE TABLE client_wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- USD, EUR, RUB, etc.
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_currency (client_id, currency),
    
    INDEX idx_client_id (client_id),
    INDEX idx_currency (currency),
    CHECK (balance >= 0)
);

-- 3. Таблица Банковских счетов (системные и внешние)
CREATE TABLE bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    account_type ENUM('SYSTEM', 'EXTERNAL') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    client_id INT NULL, -- NULL для системных счетов
    metadata JSON, -- Дополнительная информация (BIC, IBAN, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    
    INDEX idx_account_number (account_number),
    INDEX idx_account_type (account_type),
    INDEX idx_client_id (client_id),
    INDEX idx_currency (currency)
);

-- 4. Таблица Транзакций
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    transaction_type ENUM(
        'DEPOSIT',           -- Пополнение кошелька
        'WITHDRAWAL',        -- Вывод с кошелька
        'TRANSFER',          -- Перевод между кошельками
        'SYSTEM_TRANSFER',   -- Системный перевод
        'FEE',               -- Комиссия
        'REFUND'             -- Возврат
    ) NOT NULL,
    
    -- Связь с кошельком клиента (для операций пополнения/вывода)
    client_wallet_id INT NULL,
    
    -- Системные счета участвующие в операции
    from_bank_account_id INT NULL,
    to_bank_account_id INT NULL,
    
    -- Внешние счета (для пополнения/вывода)
    external_account_id INT NULL,
    
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    
    -- Информация о переводе
    description TEXT,
    reference VARCHAR(255), -- Референс операции
    
    metadata JSON, -- Дополнительные данные
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    
    FOREIGN KEY (client_wallet_id) REFERENCES client_wallets(id) ON DELETE SET NULL,
    FOREIGN KEY (from_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (external_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    
    INDEX idx_uuid (uuid),
    INDEX idx_client_wallet_id (client_wallet_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_type_status (transaction_type, status)
);

-- 5. Таблица для связи операций (если транзакция состоит из нескольких шагов)
CREATE TABLE transaction_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_transaction_id INT NOT NULL,
    child_transaction_id INT NOT NULL,
    link_type ENUM('FEE', 'MAIN', 'REFUND') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (child_transaction_id) REFERENCES transactions(id),
    
    UNIQUE KEY unique_child (child_transaction_id),
    INDEX idx_parent (parent_transaction_id)
);

-- Триггер для автоматического создания UUID
DELIMITER //
CREATE TRIGGER before_insert_clients
BEFORE INSERT ON clients
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_transactions
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
END//
DELIMITER ;

-- Вставка начальных данных (системные счета)
INSERT INTO bank_accounts (account_number, account_name, bank_name, currency, account_type, metadata) VALUES
('SYS_MAIN_USD', 'Основной системный счет USD', 'Системный банк', 'USD', 'SYSTEM', '{"purpose": "main_operational"}'),
('SYS_MAIN_EUR', 'Основной системный счет EUR', 'Системный банк', 'EUR', 'SYSTEM', '{"purpose": "main_operational"}'),
('SYS_MAIN_RUB', 'Основной системный счет RUB', 'Системный банк', 'RUB', 'SYSTEM', '{"purpose": "main_operational"}'),
('SYS_FEE_USD', 'Счет для комиссий USD', 'Системный банк', 'USD', 'SYSTEM', '{"purpose": "fee_collection"}');