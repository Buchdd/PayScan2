-- Создание базы данных
DROP DATABASE IF EXISTS payment_system;
CREATE DATABASE IF NOT EXISTS payment_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE payment_system;

-- Таблица клиентов
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    country VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_country (country)
);

-- Таблица кошельков клиентов
CREATE TABLE client_wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    wallet_type ENUM('main', 'savings', 'business') DEFAULT 'main',
    is_active TINYINT(1) DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_currency (client_id, currency_code),
    
    INDEX idx_client_id (client_id),
    INDEX idx_currency (currency_code),
    INDEX idx_is_active (is_active),
    CHECK (balance >= 0)
);

-- Таблица банковских счетов
CREATE TABLE bank_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_country VARCHAR(100) NOT NULL,
    account_type ENUM('SYSTEM', 'EXTERNAL') NOT NULL,
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    min_balance DECIMAL(15,2) DEFAULT 0.00,
    max_balance DECIMAL(15,2) DEFAULT 1000000.00,
    is_active TINYINT(1) DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_account_number (account_number),
    INDEX idx_account_type (account_type),
    INDEX idx_bank_country (bank_country),
    INDEX idx_is_active (is_active)
);

-- Таблица администраторов
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active TINYINT(1) DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Таблица транзакций
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_uuid VARCHAR(36) UNIQUE NOT NULL,
    from_wallet_id INT,
    to_wallet_id INT,
    from_bank_account_id INT,
    to_bank_account_id INT,
    amount DECIMAL(15,2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    fee_amount DECIMAL(15,2) DEFAULT 0.00,
    transaction_type ENUM(
        'DEPOSIT',           -- Пополнение кошелька с внешнего счета
        'WITHDRAWAL',        -- Вывод с кошелька на внешний счет
        'WALLET_TRANSFER',   -- Перевод между кошельками
        'ACCOUNT_TRANSFER',  -- Перевод между счетами
        'SYSTEM_FEE',        -- Системная комиссия
        'PAYMENT',           -- Оплата покупки
        'EXCHANGE'           -- Обмен валют
    ) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (from_wallet_id) REFERENCES client_wallets(wallet_id),
    FOREIGN KEY (to_wallet_id) REFERENCES client_wallets(wallet_id),
    FOREIGN KEY (from_bank_account_id) REFERENCES bank_accounts(account_id),
    FOREIGN KEY (to_bank_account_id) REFERENCES bank_accounts(account_id),
    
    CONSTRAINT chk_wallet_or_account CHECK (
        (from_wallet_id IS NOT NULL OR from_bank_account_id IS NOT NULL) AND
        (to_wallet_id IS NOT NULL OR to_bank_account_id IS NOT NULL)
    ),
    
    INDEX idx_transaction_uuid (transaction_uuid),
    INDEX idx_from_wallet (from_wallet_id),
    INDEX idx_to_wallet (to_wallet_id),
    INDEX idx_from_account (from_bank_account_id),
    INDEX idx_to_account (to_bank_account_id),
    INDEX idx_type_status (transaction_type, status),
    INDEX idx_created_at (created_at),
    INDEX idx_currency (currency_code)
);

-- Таблица для отслеживания подтверждений администраторов
CREATE TABLE transaction_approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    admin_id INT NOT NULL,
    action ENUM('approved', 'rejected') NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id),
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
);