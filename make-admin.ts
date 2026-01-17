async function makeAdmin() {
  const { prisma } = await import('./src/lib/db/client');

  try {
    console.log('Ищем пользователей в базе данных...');

    // Находим всех пользователей
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
      console.log('Пользователи не найдены в базе данных');
      return;
    }

    console.log(`Найдено ${users.length} пользователей:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Без имени'} (${user.email}) - Роль: ${user.role}`);
    });

    // Если есть только один пользователь, делаем его админом
    if (users.length === 1) {
      const user = users[0];
      console.log(`\nОбновляем роль пользователя ${user.email} на ADMIN...`);

      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });

      console.log('✅ Роль успешно обновлена на ADMIN');
    } else {
      // Если несколько пользователей, спрашиваем кого сделать админом
      console.log('\nНесколько пользователей найдено. Укажите email пользователя, которого нужно сделать админом:');
      process.exit(0);
    }

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();