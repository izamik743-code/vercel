# Развертывание на Vercel

## Быстрый старт

1. **Подключите репозиторий к Vercel**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Подключите ваш GitHub репозиторий

2. **Настройте переменные окружения**
   - В настройках проекта Vercel перейдите в "Environment Variables"
   - Добавьте все переменные из `.env.example`

3. **Деплой**
   - Vercel автоматически задеплоит проект
   - Получите URL вашего приложения

## Переменные окружения для Vercel

### Обязательные переменные

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### Рекомендуемые переменные

```env
TON_API_KEY=your_ton_api_key
TON_NETWORK=mainnet
ADMIN_SECRET_KEY=your_secure_admin_key
NEXT_PUBLIC_ADMIN_KEY=your_secure_admin_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Для полной интеграции с TON

```env
TON_PRIVATE_KEY=your_ton_private_key
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
```

## Настройка домена

1. В настройках проекта Vercel добавьте ваш домен
2. Обновите `NEXT_PUBLIC_APP_URL` на ваш домен
3. Настройте DNS записи согласно инструкциям Vercel

## Мониторинг

- **Vercel Dashboard** - мониторинг деплоев и производительности
- **Vercel Analytics** - аналитика использования
- **Function Logs** - логи Serverless Functions
- **Supabase Dashboard** - мониторинг базы данных

## Безопасность

1. **Никогда не коммитьте** `.env.local` файл
2. **Используйте сильные пароли** для админ панели
3. **Регулярно обновляйте** API ключи
4. **Настройте RLS** в Supabase
5. **Используйте HTTPS** (автоматически в Vercel)

## Производительность

- Serverless Functions автоматически масштабируются
- Кэширование на CDN Vercel
- Оптимизация изображений
- Автоматическое сжатие

## Troubleshooting

### Ошибка "Function not found"
- Проверьте, что файлы находятся в `app/api/`
- Убедитесь, что экспортированы правильные HTTP методы

### Ошибка подключения к Supabase
- Проверьте переменные окружения
- Убедитесь, что RLS политики настроены правильно

### Ошибка TON API
- Проверьте `TON_API_KEY`
- Убедитесь, что кошелек имеет достаточный баланс

### Ошибка Telegram
- Проверьте `TELEGRAM_BOT_TOKEN`
- Убедитесь, что бот настроен правильно

## Обновление

1. Сделайте изменения в коде
2. Запушьте в GitHub
3. Vercel автоматически задеплоит обновления

## Резервное копирование

- **Код**: автоматически в GitHub
- **База данных**: настройте автоматические бэкапы в Supabase
- **Переменные окружения**: экспортируйте в Vercel Dashboard

## Масштабирование

- Vercel автоматически масштабирует Serverless Functions
- Supabase автоматически масштабирует базу данных
- CDN Vercel обеспечивает быструю доставку контента

## Стоимость

- **Vercel Pro**: $20/месяц за команду
- **Supabase Pro**: $25/месяц
- **TON API**: бесплатно (с лимитами)

## Поддержка

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TON Documentation](https://docs.ton.org)
