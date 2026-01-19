import { prisma } from "./src/lib/db/client";

async function testUserVideoBinding() {
  console.log("🔍 Проверка привязки видео к пользователям...");

  try {
    // Получаем всех пользователей с их видео
    const usersWithVideos = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            videos: true,
          },
        },
        videos: {
          take: 3, // Берем первые 3 видео для каждого пользователя
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            videoUrl: true,
            createdAt: true,
          },
        },
      },
    });

    console.log("📊 Найдено пользователей:", usersWithVideos.length);

    for (const user of usersWithVideos) {
      console.log(`\n👤 Пользователь: ${user.name || "Без имени"} (${user.email})`);
      console.log(`   Видео в профиле: ${user._count.videos}`);
      console.log(`   Последние видео:`);

      if (user.videos.length === 0) {
        console.log(`   ❌ У пользователя нет видео`);
      } else {
        user.videos.forEach((video, index) => {
          console.log(`   ${index + 1}. ID: ${video.id}, URL: ${video.videoUrl}, Создано: ${video.createdAt}`);
        });
      }
    }

    // Проверим, есть ли видео без userId (анонимные)
    const anonymousVideos = await prisma.video.findMany({
      where: {
        userId: null,
      },
      take: 5,
      select: {
        id: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    console.log(`\n🎭 Анонимные видео (без userId): ${anonymousVideos.length}`);
    if (anonymousVideos.length > 0) {
      console.log("   ⚠️  Найдены анонимные видео - это может быть проблемой!");
      anonymousVideos.forEach((video, index) => {
        console.log(`   ${index + 1}. ID: ${video.id}, URL: ${video.videoUrl}`);
      });
    } else {
      console.log("   ✅ Анонимных видео не найдено");
    }

    // Проверим общее количество видео
    const totalVideos = await prisma.video.count();
    const videosWithUser = await prisma.video.count({
      where: {
        userId: {
          not: null,
        },
      },
    });

    console.log(`\n📈 Общая статистика:`);
    console.log(`   Всего видео: ${totalVideos}`);
    console.log(`   Видео с привязкой к пользователю: ${videosWithUser}`);
    console.log(`   Процент привязанных видео: ${totalVideos > 0 ? ((videosWithUser / totalVideos) * 100).toFixed(1) : 0}%`);

  } catch (error) {
    console.error("❌ Ошибка при проверке:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserVideoBinding();