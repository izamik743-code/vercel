# 🔧 Исправление авторизации в TON Mystery Cases

## 🚨 Найденные проблемы

### 1. Проблемы с API endpoints
- ❌ Неправильные параметры в API клиенте
- ❌ Несоответствие между фронтендом и бекендом
- ❌ Неправильная структура ответов

### 2. Проблемы с Supabase
- ❌ Неправильные переменные окружения
- ❌ Проблемы с подключением к базе данных
- ❌ Отсутствие тестовых данных

### 3. Проблемы с авторизацией
- ❌ Неправильная обработка Telegram WebApp данных
- ❌ Проблемы с инициализацией пользователей

## ✅ Исправления

### 1. Исправлены API endpoints

**Файл: `lib/api.ts`**
```typescript
// ✅ Исправлено: правильные параметры для initializeUser
async initializeUser(userData: {
  tg_id: number
  username?: string
  first_name: string
  last_name?: string
  init_data: string
  referral_code?: string
}): Promise<BackendResponse<UserState>> {
  return this.request<UserState>("/user/init", {
    method: "POST",
    body: JSON.stringify({
      telegramId: userData.tg_id,      // ✅ Исправлено
      username: userData.username,
      firstName: userData.first_name,  // ✅ Исправлено
      lastName: userData.last_name,    // ✅ Исправлено
      initData: userData.init_data,    // ✅ Исправлено
      referralCode: userData.referral_code, // ✅ Исправлено
    }),
  })
}

// ✅ Исправлено: правильный endpoint для connectWallet
async connectWallet(tg_id: number, walletAddress: string): Promise<BackendResponse> {
  return this.request("/connect-wallet", {  // ✅ Исправлено
    method: "POST",
    body: JSON.stringify({ userId: tg_id, walletAddress }), // ✅ Исправлено
  })
}
```

### 2. Исправлены ответы API

**Файл: `app/api/user/init/route.ts`**
```typescript
// ✅ Исправлено: правильная структура ответа
return NextResponse.json({ 
  success: true, 
  data: existingUser  // ✅ Исправлено: было user, стало data
})
```

### 3. Создан скрипт тестирования

**Файл: `scripts/test-auth.js`**
- Тестирует подключение к Supabase
- Проверяет создание и получение пользователей
- Очищает тестовые данные

## 🚀 Как исправить авторизацию

### Шаг 1: Настройте переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

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

### Шаг 2: Настройте базу данных Supabase

Выполните SQL скрипты из `scripts/` папки:

1. `001_create_database_schema.sql` - создание таблиц
2. `002_seed_telegram_gifts.sql` - тестовые данные
3. `003_create_database_functions.sql` - функции базы данных

### Шаг 3: Протестируйте подключение

```bash
# Установите зависимости
npm install

# Запустите тест авторизации
node scripts/test-auth.js
```

### Шаг 4: Запустите проект

```bash
# Запустите в режиме разработки
npm run dev
```

## 🔍 Диагностика проблем

### Проверка переменных окружения

```javascript
// Добавьте в начало app/page.tsx для отладки
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
```

### Проверка API ответов

```javascript
// Добавьте в initializeUserInDatabase для отладки
console.log('API Response:', result)
console.log('User Data:', result.data)
```

### Проверка Supabase подключения

```javascript
// Добавьте в app/api/user/init/route.ts для отладки
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')
```

## 🐛 Частые ошибки

### 1. "Database error" при создании пользователя
- **Причина**: Неправильные ключи Supabase
- **Решение**: Проверьте переменные окружения

### 2. "User not found" при получении пользователя
- **Причина**: Неправильный telegram_id
- **Решение**: Проверьте логи в консоли

### 3. "Network error" при API запросах
- **Причина**: Неправильный базовый URL
- **Решение**: Убедитесь, что `NEXT_PUBLIC_API_URL=/api`

### 4. "Unauthorized admin access"
- **Причина**: Неправильный админ ключ
- **Решение**: Проверьте `ADMIN_SECRET_KEY`

## 📊 Мониторинг

### Логи в консоли браузера
- Откройте DevTools (F12)
- Перейдите на вкладку Console
- Ищите сообщения с префиксом `[v0]`

### Логи в Vercel
- Перейдите в Vercel Dashboard
- Выберите ваш проект
- Перейдите в Functions > Logs

### Логи в Supabase
- Перейдите в Supabase Dashboard
- Выберите ваш проект
- Перейдите в Logs

## ✅ Чек-лист исправления

- [ ] Переменные окружения настроены
- [ ] База данных Supabase создана
- [ ] API endpoints исправлены
- [ ] Тест авторизации проходит
- [ ] Пользователи создаются в базе
- [ ] Баланс отображается корректно
- [ ] Админ панель работает

## 🆘 Если ничего не помогает

1. **Проверьте логи** в консоли браузера и Vercel
2. **Убедитесь**, что все переменные окружения настроены
3. **Проверьте**, что база данных Supabase доступна
4. **Запустите тест** `node scripts/test-auth.js`
5. **Обратитесь за помощью** с логами ошибок
