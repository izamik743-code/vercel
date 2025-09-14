// Скрипт для тестирования авторизации
const { createClient } = require('@supabase/supabase-js')

// Замените на ваши реальные ключи Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('🔍 Тестирование подключения к Supabase...')
  
  try {
    // Тест подключения
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error.message)
      return
    }
    
    console.log('✅ Подключение к Supabase успешно!')
    
    // Тест создания пользователя
    console.log('🔍 Тестирование создания пользователя...')
    
    const testUser = {
      telegram_id: 123456789,
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
    
    console.log('✅ Пользователь создан успешно:', newUser)
    
    // Тест получения пользователя
    console.log('🔍 Тестирование получения пользователя...')
    
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', 123456789)
      .single()
    
    if (getUserError) {
      console.error('❌ Ошибка получения пользователя:', getUserError.message)
      return
    }
    
    console.log('✅ Пользователь получен успешно:', user)
    
    // Очистка тестовых данных
    await supabase
      .from('users')
      .delete()
      .eq('telegram_id', 123456789)
    
    console.log('🧹 Тестовые данные очищены')
    console.log('🎉 Все тесты прошли успешно!')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

testAuth()
