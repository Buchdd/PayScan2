-- Тестовые данные для базы данных payment_system

-- Очистка таблиц (если нужно заполнить заново)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE transactions;
-- TRUNCATE TABLE transaction_approvals;
-- TRUNCATE TABLE client_wallets;
-- TRUNCATE TABLE bank_accounts;
-- TRUNCATE TABLE clients;
-- TRUNCATE TABLE admins;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Заполнение таблицы clients
INSERT INTO clients (first_name, last_name, email, password_hash, phone, date_of_birth, country, status) VALUES
('Иван', 'Петров', 'ivan.petrov@email.com', '1234', '+79161234567', '1985-03-15', 'Россия', 'active'),
('Мария', 'Сидорова', 'maria.sidorova@email.com', '1234', '+79162345678', '1990-07-22', 'Россия', 'active'),
('Алексей', 'Козлов', 'alex.kozlov@email.com', '1234', '+79163456789', '1988-11-30', 'Россия', 'active'),
('Елена', 'Николаева', 'elena.nikolaeva@email.com', '1234', '+79164567890', '1992-05-18', 'Россия', 'active'),
('Дмитрий', 'Васильев', 'dmitry.vasiliev@email.com','1234', '+79165678901', '1987-09-12', 'Россия', 'inactive'),
('Ольга', 'Федорова', 'olga.fedorova@email.com', '1234', '+79166789012', '1995-01-25', 'Россия', 'active'),
('Сергей', 'Морозов', 'sergey.morozov@email.com', '1234', '+79167890123', '1983-12-08', 'Россия', 'active'),
('Анна', 'Павлова', 'anna.pavlova@email.com', '1234', '+79168901234', '1991-04-03', 'Россия', 'suspended'),
('Павел', 'Семенов', 'pavel.semenov@email.com', '1234', '+79169012345', '1989-08-19', 'Россия', 'active'),
('Юлия', 'Лебедева', 'yulia.lebedeva@email.com', '1234', '+79160123456', '1993-06-14', 'Россия', 'active');

-- 2. Заполнение таблицы admins
INSERT INTO admins (username, email, password_hash, first_name, last_name, role, permissions) VALUES
('admin', 'admin@paymentsystem.com', '1234', 'Андрей', 'Иванов', 'super_admin', '{"all_permissions": true}'),
('admin', 'admin1@paymentsystem.com', '1234', 'Екатерина', 'Смирнова', 'admin', '{"transactions": true, "users": true, "reports": true}'),
('admin', 'moderator1@paymentsystem.com', '1234', 'Артем', 'Попов', 'moderator', '{"transactions": true, "users": false}'),
('admin', 'admin2@paymentsystem.com', '1234', 'Наталья', 'Кузнецова', 'admin', '{"transactions": true, "users": true, "reports": false}'),
('admin', 'moderator2@paymentsystem.com', '1234', 'Роман', 'Соколов', 'moderator', '{"transactions": true}');

-- 3. Заполнение таблицы client_wallets
INSERT INTO client_wallets (client_id, currency_code, balance, wallet_type) VALUES
(1, 'USD', 1500.00, 'main'),
(1, 'EUR', 800.50, 'savings'),
(2, 'USD', 2300.75, 'main'),
(2, 'RUB', 50000.00, 'savings'),
(3, 'USD', 950.25, 'main'),
(4, 'USD', 3200.00, 'main'),
(4, 'EUR', 1200.00, 'business'),
(5, 'USD', 450.80, 'main'),
(6, 'USD', 1800.40, 'main'),
(7, 'USD', 2750.60, 'main'),
(8, 'USD', 620.30, 'main'),
(9, 'USD', 1900.90, 'main'),
(10, 'USD', 3100.20, 'main');

-- 4. Заполнение таблицы bank_accounts
INSERT INTO bank_accounts (account_number, bank_name, bank_country, account_type, iban, swift_code, current_balance, min_balance, max_balance) VALUES
-- Системные счета
('SYS_MAIN_USD', 'Payment System Bank', 'USA', 'SYSTEM', NULL, 'PSYSUS33', 1000000.00, 0.00, 10000000.00),
('SYS_MAIN_EUR', 'Payment System Bank', 'Germany', 'SYSTEM', NULL, 'PSYSDEM2', 500000.00, 0.00, 5000000.00),
('SYS_MAIN_RUB', 'Payment System Bank', 'Russia', 'SYSTEM', NULL, 'PSYSRUM1', 25000000.00, 0.00, 100000000.00),
('SYS_FEE_USD', 'Payment System Bank', 'USA', 'SYSTEM', NULL, 'PSYSUS33', 15000.00, 0.00, 1000000.00),

-- Внешние счета
('EXT_MERCHANT_1', 'Alfa Bank', 'Russia', 'EXTERNAL', 'RU02123456789012345678', 'ALFARUMM', 0.00, 0.00, 1000000.00),
('EXT_MERCHANT_2', 'Sberbank', 'Russia', 'EXTERNAL', 'RU02345678901234567890', 'SABRRUMM', 0.00, 0.00, 1000000.00),
('EXT_PARTNER_1', 'VTB Bank', 'Russia', 'EXTERNAL', 'RU03456789012345678901', 'VTBRRUMM', 0.00, 0.00, 500000.00),
('EXT_CLIENT_1', 'Tinkoff Bank', 'Russia', 'EXTERNAL', 'RU04567890123456789012', 'TICSRUMM', 0.00, 0.00, 200000.00),
('EXT_CLIENT_2', 'Raiffeisen Bank', 'Russia', 'EXTERNAL', 'RU05678901234567890123', 'RFBRRUMM', 0.00, 0.00, 200000.00),
('EXT_MERCHANT_US', 'JPMorgan Chase', 'USA', 'EXTERNAL', 'US02123456789012345678', 'CHASUS33', 0.00, 0.00, 500000.00);

-- 5. Заполнение таблицы transactions (ПОЛНЫЙ НАБОР)
INSERT INTO transactions (
    transaction_id, transaction_uuid, from_wallet_id, to_wallet_id, from_bank_account_id, 
    to_bank_account_id, amount, currency_code, fee_amount, 
    transaction_type, status, created_at
) VALUES
-- Переводы между кошельками
(1, UUID(), 1, 3, NULL, NULL, 100.00, 'USD', 1.00, 'WALLET_TRANSFER', 'completed', NOW()),
(2, UUID(), 3, 5, NULL, NULL, 50.00, 'USD', 0.50, 'WALLET_TRANSFER', 'completed', NOW()),
(3, UUID(), 6, 10, NULL, NULL, 200.00, 'USD', 2.00, 'WALLET_TRANSFER', 'pending', NOW()),

-- Пополнения кошельков
(4, UUID(), NULL, 1, 8, NULL, 500.00, 'USD', 5.00, 'DEPOSIT', 'completed', NOW()),
(5, UUID(), NULL, 2, 9, NULL, 300.00, 'EUR', 3.00, 'DEPOSIT', 'completed', NOW()),
(6, UUID(), NULL, 4, 7, NULL, 10000.00, 'RUB', 100.00, 'DEPOSIT', 'completed', NOW()),

-- Выводы с кошельков
(7, UUID(), 1, NULL, NULL, 8, 200.00, 'USD', 2.00, 'WITHDRAWAL', 'completed', NOW()),
(8, UUID(), 3, NULL, NULL, 9, 150.00, 'USD', 1.50, 'WITHDRAWAL', 'pending', NOW()),

-- Оплаты покупок
(9, UUID(), 1, NULL, NULL, 5, 75.00, 'USD', 0.75, 'PAYMENT', 'completed', NOW()),
(10, UUID(), 3, NULL, NULL, 6, 120.00, 'USD', 1.20, 'PAYMENT', 'completed', NOW()),
(11, UUID(), 6, NULL, NULL, 10, 89.99, 'USD', 0.90, 'PAYMENT', 'completed', NOW()),

-- Переводы между счетами
(12, UUID(), NULL, NULL, 4, NULL, 15.45, 'USD', 0.00, 'SYSTEM_FEE', 'completed', NOW()), -- Системная комиссия
(13, UUID(), NULL, NULL, 1, 2, 10000.00, 'USD', 0.00, 'ACCOUNT_TRANSFER', 'completed', NOW()),
(14, UUID(), NULL, NULL, 2, 3, 5000.00, 'EUR', 0.00, 'ACCOUNT_TRANSFER', 'pending', NOW());

-- 6. Заполнение таблицы transaction_approvals
INSERT INTO transaction_approvals (transaction_id, admin_id, action, notes) VALUES
(2, 2, 'approved', 'Перевод прошел проверку'),
(3, 3, 'rejected', 'Недостаточно средств на кошельке'),
(8, 2, 'approved', 'Вывод средств одобрен'),
(13, 1, 'approved', 'Межбанковский перевод подтвержден'),
(14, 4, 'rejected', 'Неверный курс валют');

-- Обновление балансов банковских счетов на основе транзакций
UPDATE bank_accounts SET current_balance = 985000.00 WHERE account_id = 1; -- SYS_MAIN_USD
UPDATE bank_accounts SET current_balance = 495000.00 WHERE account_id = 2; -- SYS_MAIN_EUR
UPDATE bank_accounts SET current_balance = 25050000.00 WHERE account_id = 3; -- SYS_MAIN_RUB
UPDATE bank_accounts SET current_balance = 15015.45 WHERE account_id = 4; -- SYS_FEE_USD
UPDATE bank_accounts SET current_balance = 195.00 WHERE account_id = 5; -- EXT_MERCHANT_1
UPDATE bank_accounts SET current_balance = 120.00 WHERE account_id = 6; -- EXT_MERCHANT_2
UPDATE bank_accounts SET current_balance = 89.99 WHERE account_id = 10; -- EXT_MERCHANT_US

-- Проверочные запросы
SELECT 'Clients count: ' AS info, COUNT(*) AS count FROM clients
UNION ALL
SELECT 'Admins count: ', COUNT(*) FROM admins
UNION ALL
SELECT 'Wallets count: ', COUNT(*) FROM client_wallets
UNION ALL
SELECT 'Bank accounts count: ', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'Transactions count: ', COUNT(*) FROM transactions
UNION ALL
SELECT 'Approvals count: ', COUNT(*) FROM transaction_approvals;