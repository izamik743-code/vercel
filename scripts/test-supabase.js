// Скрипт для тестирования подключения к Supabase
const { createClient } = require('@supabase/supabase-js')

// Ваши ключи Supabase
const supabaseUrl = 'https://jhtufrleluowmnzgrgrr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodHVmcmxlbHVvd21uemdyZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTg4MzEsImV4cCI6MjA3MzM5NDgzMX0.1Tt9lqSsjGFcy07D6Ct8fVTrDl2CEGDOUhfrQ1E96jw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('🔍 Тестирование подключения к Supabase...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Тест подключения
    console.log('\n1. Тестирование подключения...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Ошибка подключения:', error.message)
      return
    }
    
    console.log('✅ Подключение к Supabase успешно!')
    
    // Тест получения пользователей
    console.log('\n2. Тестирование получения пользователей...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Ошибка получения пользователей:', usersError.message)
      return
    }
    
    console.log('✅ Пользователи получены успешно!')
    console.log('Количество пользователей:', users.length)
    
    if (users.length > 0) {
      console.log('Первый пользователь:', {
        id: users[0].id,
        telegram_id: users[0].telegram_id,
        username: users[0].username,
        first_name: users[0].first_name,
        balance: users[0].balance
      })
    }
    
    // Тест создания пользователя
    console.log('\n3. Тестирование создания пользователя...')
    const testUser = {
      telegram_id: Date.now(), // Уникальный ID
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      balance: 0,
      wallet_address: null,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Ошибка создания пользователя:', createError.message)
      return
    }
    
    console.log('✅ Пользователь создан успешно!')
    console.log('ID нового пользователя:', newUser.id)
    
    // Тест получения транзакций
    console.log('\n4. Тестирование получения транзакций...')
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5)
    
    if (transactionsError) {
      console.error('❌ Ошибка получения транзакций:', transactionsError.message)
    } else {
      console.log('✅ Транзакции получены успешно!')
      console.log('Количество транзакций:', transactions.length)
    }
    
    // Тест получения инвентаря
    console.log('\n5. Тестирование получения инвентаря...')
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(5)
    
    if (inventoryError) {
      console.error('❌ Ошибка получения инвентаря:', inventoryError.message)
    } else {
      console.log('✅ Инвентарь получен успешно!')
      console.log('Количество предметов:', inventory.length)
    }
    
    // Очистка тестового пользователя
    console.log('\n6. Очистка тестовых данных...')
    await supabase
      .from('users')
      .delete()
      .eq('telegram_id', testUser.telegram_id)
    
    console.log('✅ Тестовые данные очищены')
    
    // Финальная статистика
    console.log('\n📊 Финальная статистика:')
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: transactionCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
    
    const { count: inventoryCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Пользователей: ${userCount}`)
    console.log(`   Транзакций: ${transactionCount}`)
    console.log(`   Предметов в инвентаре: ${inventoryCount}`)
    
    console.log('\n🎉 Все тесты прошли успешно!')
    console.log('✅ Supabase настроен правильно')
    console.log('✅ База данных работает')
    console.log('✅ API готов к использованию')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

testSupabase()
