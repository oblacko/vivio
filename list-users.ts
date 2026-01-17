import { prisma } from './src/lib/db/client';

async function listUsers() {
  try {
    console.log('Список пользователей в базе данных:');
    console.log('=====================================');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('Пользователи не найдены');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Без имени'} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Роль: ${user.role}`);
        console.log(`   Создан: ${user.createdAt.toISOString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();