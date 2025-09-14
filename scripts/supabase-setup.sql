-- TON Mystery Cases - Supabase Database Setup
-- Выполните этот скрипт в SQL Editor Supabase

-- 1. Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  balance DECIMAL(10,2) DEFAULT 0,
  wallet_address VARCHAR(255),
  init_data TEXT,
  referral_code VARCHAR(50) UNIQUE,
  referred_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'case_open', 'referral_bonus', 'admin_withdrawal'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TON',
  status VARCHAR(20) DEFAULT 'completed',
  description TEXT,
  wallet_address VARCHAR(255),
  admin_action BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создание таблицы inventory
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_rarity VARCHAR(20) NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  item_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_rarity ON inventory(item_rarity);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- 5. Включение Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- 6. Создание политик RLS (пока отключены для простоты)
-- Позже можно будет включить для безопасности
-- CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (true);
-- CREATE POLICY "Users can view own inventory" ON inventory FOR SELECT USING (true);

-- 7. Создание функции для получения статистики пользователя
CREATE OR REPLACE FUNCTION get_user_stats(user_telegram_id BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'balance', COALESCE(u.balance, 0),
    'total_transactions', COALESCE(t.transaction_count, 0),
    'total_inventory', COALESCE(i.inventory_count, 0),
    'last_active', u.last_active
  ) INTO result
  FROM users u
  LEFT JOIN (
    SELECT user_id, COUNT(*) as transaction_count
    FROM transactions
    GROUP BY user_id
  ) t ON u.id = t.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as inventory_count
    FROM inventory
    GROUP BY user_id
  ) i ON u.id = i.user_id
  WHERE u.telegram_id = user_telegram_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Создание тестовых данных
INSERT INTO users (telegram_id, username, first_name, last_name, balance, wallet_address, referral_code, created_at, last_active)
VALUES 
  (123456789, 'testuser', 'Test', 'User', 100.50, 'UQAjU_dKuBVzeAQOfqNZ5kqUGsuPBXY9bjW1Cs4ZT_eTANGy', 'TEST123', NOW(), NOW()),
  (987654321, 'demo', 'Demo', 'User', 50.25, 'UQAjU_dKuBVzeAQOfqNZ5kqUGsuPBXY9bjW1Cs4ZT_eTANGy', 'DEMO456', NOW(), NOW())
ON CONFLICT (telegram_id) DO NOTHING;

-- 9. Создание тестовых транзакций
INSERT INTO transactions (user_id, type, amount, currency, status, description, wallet_address, created_at)
SELECT 
  u.id,
  'deposit',
  50.0,
  'TON',
  'completed',
  'Initial deposit',
  u.wallet_address,
  NOW()
FROM users u WHERE u.telegram_id = 123456789;

INSERT INTO transactions (user_id, type, amount, currency, status, description, created_at)
SELECT 
  u.id,
  'case_open',
  -10.0,
  'internal',
  'completed',
  'Opened basic case',
  NOW()
FROM users u WHERE u.telegram_id = 123456789;

-- 10. Создание тестового инвентаря
INSERT INTO inventory (user_id, item_name, item_rarity, item_value, created_at)
SELECT 
  u.id,
  'Delicious Cake',
  'common',
  50,
  NOW()
FROM users u WHERE u.telegram_id = 123456789;

INSERT INTO inventory (user_id, item_name, item_rarity, item_value, created_at)
SELECT 
  u.id,
  'Green Star',
  'rare',
  150,
  NOW()
FROM users u WHERE u.telegram_id = 123456789;

-- 11. Создание функции для админ статистики
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_balance', (SELECT COALESCE(SUM(balance), 0) FROM users),
    'connected_wallets', (SELECT COUNT(*) FROM users WHERE wallet_address IS NOT NULL),
    'active_today', (SELECT COUNT(*) FROM users WHERE last_active >= CURRENT_DATE),
    'total_transactions', (SELECT COUNT(*) FROM transactions),
    'total_deposits', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND currency = 'TON')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 12. Создание представления для админ панели
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  u.id,
  u.telegram_id,
  u.username,
  u.first_name,
  u.last_name,
  u.balance,
  u.wallet_address,
  u.created_at,
  u.last_active,
  COUNT(DISTINCT t.id) as transaction_count,
  COUNT(DISTINCT i.id) as inventory_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN inventory i ON u.id = i.user_id
GROUP BY u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.balance, u.wallet_address, u.created_at, u.last_active
ORDER BY u.created_at DESC;

-- Готово! База данных настроена
SELECT 'Database setup completed successfully!' as message;
