-- TON Mystery Cases - Telegram Gifts Data
-- Выполните этот скрипт в SQL Editor Supabase после основного скрипта

-- 1. Создание таблицы telegram_gifts
CREATE TABLE IF NOT EXISTS telegram_gifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  image_url TEXT,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price_ton DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы cases
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_ton DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создание таблицы case_rewards
CREATE TABLE IF NOT EXISTS case_rewards (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  gift_id INTEGER REFERENCES telegram_gifts(id) ON DELETE CASCADE,
  probability DECIMAL(5,2) NOT NULL CHECK (probability > 0 AND probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создание таблицы user_inventory
CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  gift_id INTEGER REFERENCES telegram_gifts(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создание таблицы case_openings
CREATE TABLE IF NOT EXISTS case_openings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  gift_won_id INTEGER REFERENCES telegram_gifts(id) ON DELETE CASCADE,
  ton_spent DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Создание таблицы online_stats
CREATE TABLE IF NOT EXISTS online_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  online_count INTEGER DEFAULT 127,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Создание таблицы recent_wins
CREATE TABLE IF NOT EXISTS recent_wins (
  id SERIAL PRIMARY KEY,
  fake_username VARCHAR(255) NOT NULL,
  gift_id INTEGER REFERENCES telegram_gifts(id) ON DELETE CASCADE,
  case_name VARCHAR(255) NOT NULL,
  is_upgrade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Вставка тестовых подарков
INSERT INTO telegram_gifts (name, emoji, image_url, rarity, price_ton, description) VALUES
-- Common gifts
('Delicious Cake', '🍰', 'https://telegram.org/img/t_logo.png', 'common', 0.1, 'Сладкий торт для праздника'),
('Green Star', '⭐', 'https://telegram.org/img/t_logo.png', 'common', 0.15, 'Зеленая звезда удачи'),
('Blue Heart', '💙', 'https://telegram.org/img/t_logo.png', 'common', 0.2, 'Голубое сердце любви'),
('Red Rose', '🌹', 'https://telegram.org/img/t_logo.png', 'common', 0.25, 'Красная роза страсти'),
('Golden Coin', '🪙', 'https://telegram.org/img/t_logo.png', 'common', 0.3, 'Золотая монета богатства'),

-- Rare gifts
('Crystal Ball', '🔮', 'https://telegram.org/img/t_logo.png', 'rare', 0.5, 'Хрустальный шар предсказаний'),
('Diamond Ring', '💍', 'https://telegram.org/img/t_logo.png', 'rare', 0.75, 'Бриллиантовое кольцо'),
('Silver Crown', '👑', 'https://telegram.org/img/t_logo.png', 'rare', 1.0, 'Серебряная корона'),
('Magic Wand', '🪄', 'https://telegram.org/img/t_logo.png', 'rare', 1.25, 'Волшебная палочка'),
('Golden Key', '🗝️', 'https://telegram.org/img/t_logo.png', 'rare', 1.5, 'Золотой ключ от сокровищ'),

-- Epic gifts
('Fire Dragon', '🐉', 'https://telegram.org/img/t_logo.png', 'epic', 2.0, 'Огненный дракон'),
('Ice Phoenix', '🦅', 'https://telegram.org/img/t_logo.png', 'epic', 2.5, 'Ледяной феникс'),
('Thunder Sword', '⚔️', 'https://telegram.org/img/t_logo.png', 'epic', 3.0, 'Меч молний'),
('Mystic Orb', '🔮', 'https://telegram.org/img/t_logo.png', 'epic', 3.5, 'Мистическая сфера'),
('Cosmic Star', '⭐', 'https://telegram.org/img/t_logo.png', 'epic', 4.0, 'Космическая звезда'),

-- Legendary gifts
('Golden Unicorn', '🦄', 'https://telegram.org/img/t_logo.png', 'legendary', 5.0, 'Золотой единорог'),
('Diamond Castle', '🏰', 'https://telegram.org/img/t_logo.png', 'legendary', 7.5, 'Бриллиантовый замок'),
('Rainbow Bridge', '🌈', 'https://telegram.org/img/t_logo.png', 'legendary', 10.0, 'Радужный мост'),
('Cosmic Crown', '👑', 'https://telegram.org/img/t_logo.png', 'legendary', 15.0, 'Космическая корона'),
('Infinity Stone', '💎', 'https://telegram.org/img/t_logo.png', 'legendary', 25.0, 'Камень бесконечности');

-- 9. Вставка тестовых кейсов
INSERT INTO cases (name, price_ton, image_url, description) VALUES
('Starter Case', 0.0, 'https://telegram.org/img/t_logo.png', 'Бесплатный кейс для новичков'),
('Basic Case', 0.5, 'https://telegram.org/img/t_logo.png', 'Базовый кейс с обычными подарками'),
('Premium Case', 1.0, 'https://telegram.org/img/t_logo.png', 'Премиум кейс с редкими подарками'),
('Elite Case', 2.0, 'https://telegram.org/img/t_logo.png', 'Элитный кейс с эпическими подарками'),
('Legendary Case', 5.0, 'https://telegram.org/img/t_logo.png', 'Легендарный кейс с уникальными подарками');

-- 10. Настройка вероятностей для кейсов
-- Starter Case (бесплатный)
INSERT INTO case_rewards (case_id, gift_id, probability) 
SELECT 1, id, 100.0 FROM telegram_gifts WHERE rarity = 'common' LIMIT 1;

-- Basic Case
INSERT INTO case_rewards (case_id, gift_id, probability) VALUES
(2, (SELECT id FROM telegram_gifts WHERE name = 'Delicious Cake'), 40.0),
(2, (SELECT id FROM telegram_gifts WHERE name = 'Green Star'), 30.0),
(2, (SELECT id FROM telegram_gifts WHERE name = 'Blue Heart'), 20.0),
(2, (SELECT id FROM telegram_gifts WHERE name = 'Red Rose'), 10.0);

-- Premium Case
INSERT INTO case_rewards (case_id, gift_id, probability) VALUES
(3, (SELECT id FROM telegram_gifts WHERE name = 'Golden Coin'), 30.0),
(3, (SELECT id FROM telegram_gifts WHERE name = 'Crystal Ball'), 25.0),
(3, (SELECT id FROM telegram_gifts WHERE name = 'Diamond Ring'), 20.0),
(3, (SELECT id FROM telegram_gifts WHERE name = 'Silver Crown'), 15.0),
(3, (SELECT id FROM telegram_gifts WHERE name = 'Magic Wand'), 10.0);

-- Elite Case
INSERT INTO case_rewards (case_id, gift_id, probability) VALUES
(4, (SELECT id FROM telegram_gifts WHERE name = 'Golden Key'), 25.0),
(4, (SELECT id FROM telegram_gifts WHERE name = 'Fire Dragon'), 20.0),
(4, (SELECT id FROM telegram_gifts WHERE name = 'Ice Phoenix'), 20.0),
(4, (SELECT id FROM telegram_gifts WHERE name = 'Thunder Sword'), 15.0),
(4, (SELECT id FROM telegram_gifts WHERE name = 'Mystic Orb'), 15.0),
(4, (SELECT id FROM telegram_gifts WHERE name = 'Cosmic Star'), 5.0);

-- Legendary Case
INSERT INTO case_rewards (case_id, gift_id, probability) VALUES
(5, (SELECT id FROM telegram_gifts WHERE name = 'Golden Unicorn'), 30.0),
(5, (SELECT id FROM telegram_gifts WHERE name = 'Diamond Castle'), 25.0),
(5, (SELECT id FROM telegram_gifts WHERE name = 'Rainbow Bridge'), 20.0),
(5, (SELECT id FROM telegram_gifts WHERE name = 'Cosmic Crown'), 15.0),
(5, (SELECT id FROM telegram_gifts WHERE name = 'Infinity Stone'), 10.0);

-- 11. Инициализация статистики
INSERT INTO online_stats (id, online_count) VALUES (1, 127) ON CONFLICT (id) DO NOTHING;

-- 12. Создание индексов
CREATE INDEX IF NOT EXISTS idx_telegram_gifts_rarity ON telegram_gifts(rarity);
CREATE INDEX IF NOT EXISTS idx_telegram_gifts_price ON telegram_gifts(price_ton);
CREATE INDEX IF NOT EXISTS idx_case_rewards_case_id ON case_rewards(case_id);
CREATE INDEX IF NOT EXISTS idx_case_rewards_gift_id ON case_rewards(gift_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_gift_id ON user_inventory(gift_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_user_id ON case_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_created_at ON case_openings(created_at);
CREATE INDEX IF NOT EXISTS idx_recent_wins_created_at ON recent_wins(created_at);

-- Готово!
SELECT 'Telegram gifts data setup completed successfully!' as message;
