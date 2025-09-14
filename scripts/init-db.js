// Скрипт для инициализации базы данных
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initDatabase() {
  console.log('🚀 Инициализация базы данных...')
  
  try {
    // Создаем тестового пользователя
    console.log('👤 Создание тестового пользователя...')
    
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(123456789),
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        balance: 100.5,
        walletAddress: 'UQAjU_dKuBVzeAQOfqNZ5kqUGsuPBXY9bjW1Cs4ZT_eTANGy',
        referralCode: 'TEST123',
        createdAt: new Date(),
        lastActive: new Date(),
      }
    })
    
    console.log('✅ Тестовый пользователь создан:', testUser)
    
    // Создаем тестовые транзакции
    console.log('💰 Создание тестовых транзакций...')
    
    await prisma.transaction.createMany({
      data: [
        {
          userId: testUser.id,
          type: 'deposit',
          amount: 50.0,
          currency: 'TON',
          status: 'completed',
          description: 'Initial deposit',
          walletAddress: testUser.walletAddress,
          createdAt: new Date(),
        },
        {
          userId: testUser.id,
          type: 'case_open',
          amount: -10.0,
          currency: 'internal',
          status: 'completed',
          description: 'Opened basic case',
          createdAt: new Date(),
        }
      ]
    })
    
    console.log('✅ Тестовые транзакции созданы')
    
    // Создаем тестовый инвентарь
    console.log('🎁 Создание тестового инвентаря...')
    
    await prisma.inventoryItem.createMany({
      data: [
        {
          userId: testUser.id,
          itemName: 'Delicious Cake',
          itemRarity: 'common',
          itemValue: 50,
          createdAt: new Date(),
        },
        {
          userId: testUser.id,
          itemName: 'Green Star',
          itemRarity: 'rare',
          itemValue: 150,
          createdAt: new Date(),
        }
      ]
    })
    
    console.log('✅ Тестовый инвентарь создан')
    
    // Проверяем статистику
    const userCount = await prisma.user.count()
    const transactionCount = await prisma.transaction.count()
    const inventoryCount = await prisma.inventoryItem.count()
    
    console.log('📊 Статистика базы данных:')
    console.log(`   Пользователей: ${userCount}`)
    console.log(`   Транзакций: ${transactionCount}`)
    console.log(`   Предметов в инвентаре: ${inventoryCount}`)
    
    console.log('🎉 База данных успешно инициализирована!')
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()
