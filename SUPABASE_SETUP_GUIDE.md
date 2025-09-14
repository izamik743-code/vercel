# 🚀 Настройка Supabase для TON Mystery Cases

## 📋 Пошаговая инструкция

### 1. Настройка базы данных Supabase

1. **Откройте Supabase Dashboard**
   - Перейдите на [supabase.com](https://supabase.com)
   - Войдите в свой проект: `jhtufrleluowmnzgrgrr`

2. **Выполните SQL скрипт**
   - Перейдите в **SQL Editor**
   - Скопируйте и вставьте содержимое файла `scripts/supabase-setup.sql`
   - Нажмите **Run** для выполнения

3. **Проверьте созданные таблицы**
   - Перейдите в **Table Editor**
   - Убедитесь, что созданы таблицы: `users`, `transactions`, `inventory`

### 2. Получение ключей Supabase

1. **Перейдите в Settings > API**
2. **Скопируйте ключи:**
   - `Project URL`: `https://jhtufrleluowmnzgrgrr.supabase.co`
   - `anon public`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodHVmcmxlbHVvd21uemdyZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTg4MzEsImV4cCI6MjA3MzM5NDgzMX0.1Tt9lqSsjGFcy07D6Ct8fVTrDl2CEGDOUhfrQ1E96jw`
   - `service_role`: (скопируйте из Supabase)

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jhtufrleluowmnzgrgrr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodHVmcmxlbHVvd21uemdyZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTg4MzEsImV4cCI6MjA3MzM5NDgzMX0.1Tt9lqSsjGFcy07D6Ct8fVTrDl2CEGDOUhfrQ1E96jw
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Admin Configuration
ADMIN_SECRET_KEY=your_admin_secret_key_here
NEXT_PUBLIC_ADMIN_KEY=your_admin_secret_key_here
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=/api
```

### 4. Тестирование локально

```bash
# Установите зависимости
npm install

# Запустите проект
npm run dev

# Откройте в браузере
http://localhost:3000
```

### 5. Деплой на Vercel

1. **Подключите репозиторий к Vercel**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Подключите ваш GitHub репозиторий

2. **Настройте переменные окружения в Vercel**
   - В настройках проекта перейдите в "Environment Variables"
   - Добавьте все переменные из `.env.local`

3. **Деплой**
   - Vercel автоматически задеплоит проект
   - Получите URL вашего приложения

## 🔍 Проверка работоспособности

### 1. Проверка базы данных
- Откройте Supabase Dashboard > Table Editor
- Убедитесь, что есть тестовые пользователи в таблице `users`

### 2. Проверка API
- Откройте приложение в браузере
- Проверьте, что пользователь создается в базе
- Проверьте, что баланс отображается

### 3. Проверка админ панели
- Перейдите на `/admin`
- Введите пароль (по умолчанию: `admin123`)
- Проверьте, что отображается список пользователей

## 📊 Структура базы данных

### Таблица `users`
```sql
- id (SERIAL PRIMARY KEY)
- telegram_id (BIGINT UNIQUE)
- username (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- balance (DECIMAL)
- wallet_address (VARCHAR)
- referral_code (VARCHAR UNIQUE)
- referred_by (INTEGER)
- created_at (TIMESTAMP)
- last_active (TIMESTAMP)
```

### Таблица `transactions`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- type (VARCHAR) -- 'deposit', 'withdrawal', 'case_open', etc.
- amount (DECIMAL)
- currency (VARCHAR)
- status (VARCHAR)
- description (TEXT)
- wallet_address (VARCHAR)
- admin_action (BOOLEAN)
- created_at (TIMESTAMP)
```

### Таблица `inventory`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- item_name (VARCHAR)
- item_rarity (VARCHAR) -- 'common', 'rare', 'epic', 'legendary'
- item_value (INTEGER)
- created_at (TIMESTAMP)
```

## 🛠️ Полезные SQL запросы

### Проверка пользователей
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### Проверка транзакций
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

### Статистика
```sql
SELECT 
  COUNT(*) as total_users,
  SUM(balance) as total_balance,
  COUNT(CASE WHEN wallet_address IS NOT NULL THEN 1 END) as connected_wallets
FROM users;
```

### Админ статистика
```sql
SELECT * FROM get_admin_stats();
```

## 🐛 Troubleshooting

### Ошибка "Database error"
- Проверьте, что SQL скрипт выполнен полностью
- Убедитесь, что все таблицы созданы

### Ошибка "User not found"
- Проверьте переменные окружения
- Убедитесь, что `SUPABASE_SERVICE_ROLE_KEY` правильный

### Ошибка "Invalid token"
- Проверьте `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Убедитесь, что ключ скопирован полностью

### Ошибка "Unauthorized admin access"
- Проверьте `ADMIN_SECRET_KEY`
- Убедитесь, что ключ одинаковый в `ADMIN_SECRET_KEY` и `NEXT_PUBLIC_ADMIN_KEY`

## 🎯 Готово!

После выполнения всех шагов у вас будет:
- ✅ Рабочая база данных Supabase
- ✅ Настроенные API endpoints
- ✅ Рабочая авторизация
- ✅ Админ панель
- ✅ Готовый к деплою проект

### Следующие шаги:
1. **Протестируйте все функции** локально
2. **Настройте Telegram бота** (если нужно)
3. **Деплойте на Vercel**
4. **Настройте домен** (если нужно)

## 🆘 Нужна помощь?

Если что-то не работает:
1. Проверьте логи в консоли браузера
2. Проверьте логи в Supabase Dashboard > Logs
3. Проверьте переменные окружения
4. Обратитесь за помощью с логами ошибок
