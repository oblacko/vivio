import { PrismaClient, VideoQuality, JobStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please make sure .env.local or .env file exists with DATABASE_URL');
  process.exit(1);
}

// Using PrismaPg adapter for PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

// Данные для 30 видео с разными aspect-ratio
const videoData = [
  // 16:9 aspect ratio (1.78)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129670/3129670-uhd_2560_1440_25fps.mp4',
    aspectRatio: 1.78,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_25fps.mp4',
    aspectRatio: 1.78,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129669/3129669-uhd_2560_1440_25fps.mp4',
    aspectRatio: 1.78,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3121458/3121458-uhd_2560_1440_25fps.mp4',
    aspectRatio: 1.78,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129668/3129668-uhd_2560_1440_25fps.mp4',
    aspectRatio: 1.78,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  },

  // 9:16 aspect ratio (0.56)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129667/3129667-uhd_1440_2560_25fps.mp4',
    aspectRatio: 0.56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=711&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129666/3129666-uhd_1440_2560_25fps.mp4',
    aspectRatio: 0.56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=711&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129665/3129665-uhd_1440_2560_25fps.mp4',
    aspectRatio: 0.56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=711&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129664/3129664-uhd_1440_2560_25fps.mp4',
    aspectRatio: 0.56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=711&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129663/3129663-uhd_1440_2560_25fps.mp4',
    aspectRatio: 0.56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=711&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },

  // 1:1 aspect ratio (1.0)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129662/3129662-uhd_1440_1440_25fps.mp4',
    aspectRatio: 1.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129661/3129661-uhd_1440_1440_25fps.mp4',
    aspectRatio: 1.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129660/3129660-uhd_1440_1440_25fps.mp4',
    aspectRatio: 1.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129659/3129659-uhd_1440_1440_25fps.mp4',
    aspectRatio: 1.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129658/3129658-uhd_1440_1440_25fps.mp4',
    aspectRatio: 1.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },

  // 4:5 aspect ratio (0.8)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129657/3129657-uhd_1152_1440_25fps.mp4',
    aspectRatio: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129656/3129656-uhd_1152_1440_25fps.mp4',
    aspectRatio: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129655/3129655-uhd_1152_1440_25fps.mp4',
    aspectRatio: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129654/3129654-uhd_1152_1440_25fps.mp4',
    aspectRatio: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129653/3129653-uhd_1152_1440_25fps.mp4',
    aspectRatio: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },

  // 21:9 aspect ratio (2.33)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129652/3129652-uhd_3328_1440_25fps.mp4',
    aspectRatio: 2.33,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=344&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129651/3129651-uhd_3328_1440_25fps.mp4',
    aspectRatio: 2.33,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=344&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129650/3129650-uhd_3328_1440_25fps.mp4',
    aspectRatio: 2.33,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=344&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129649/3129649-uhd_3328_1440_25fps.mp4',
    aspectRatio: 2.33,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=344&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129648/3129648-uhd_3328_1440_25fps.mp4',
    aspectRatio: 2.33,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=344&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },

  // 3:4 aspect ratio (0.75)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129647/3129647-uhd_1080_1440_25fps.mp4',
    aspectRatio: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=375&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129646/3129646-uhd_1080_1440_25fps.mp4',
    aspectRatio: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=375&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129645/3129645-uhd_1080_1440_25fps.mp4',
    aspectRatio: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=375&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129644/3129644-uhd_1080_1440_25fps.mp4',
    aspectRatio: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=375&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129643/3129643-uhd_1080_1440_25fps.mp4',
    aspectRatio: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=375&h=500&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'
  },

  // 2.35:1 aspect ratio (2.35)
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129642/3129642-uhd_3384_1440_25fps.mp4',
    aspectRatio: 2.35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=341&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129641/3129641-uhd_3384_1440_25fps.mp4',
    aspectRatio: 2.35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=341&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129640/3129640-uhd_3384_1440_25fps.mp4',
    aspectRatio: 2.35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=341&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129639/3129639-uhd_3384_1440_25fps.mp4',
    aspectRatio: 2.35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=341&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  },
  {
    videoUrl: 'https://videos.pexels.com/video-files/3129638/3129638-uhd_3384_1440_25fps.mp4',
    aspectRatio: 2.35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=341&fit=crop',
    ogImageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=630&fit=crop'
  }
];

async function main() {
  console.log('🎬 Seeding videos database...');

  // Получаем существующие vibes для привязки видео
  const vibes = await prisma.vibe.findMany({
    select: { id: true, category: true }
  });

  if (vibes.length === 0) {
    console.log('❌ No vibes found. Please run the main seed first.');
    process.exit(1);
  }

  // Группируем vibes по категориям для равномерного распределения
  type VibeRecord = typeof vibes[number];
  const vibesByCategory = vibes.reduce<Record<string, VibeRecord[]>>((acc, vibe) => {
    const category = vibe.category ?? 'UNCATEGORIZED';
    if (!acc[category]) acc[category] = [];
    acc[category].push(vibe);
    return acc;
  }, {});

  let videoCount = 0;

  for (const videoInfo of videoData) {
    try {
      // Генерируем уникальный jobId
      const jobId = randomUUID();

      // Выбираем случайный vibe из доступных
      const allVibes = vibes.flat();
      const randomVibe = allVibes[Math.floor(Math.random() * allVibes.length)];

      // Создаем GenerationJob
      const job = await prisma.generationJob.create({
        data: {
          id: jobId,
          externalJobId: `demo-job-${jobId}`,
          imageUrl: videoInfo.thumbnailUrl || 'https://via.placeholder.com/800x600',
          prompt: `Demo video generation for aspect ratio ${videoInfo.aspectRatio}`,
          aspectRatio: videoInfo.aspectRatio,
          status: JobStatus.COMPLETED,
          progress: 100,
          duration: 6,
          completedAt: new Date(),
        }
      });

      // Создаем Video
      const video = await prisma.video.create({
        data: {
          jobId: job.id,
          vibeId: randomVibe.id,
          videoUrl: videoInfo.videoUrl,
          thumbnailUrl: videoInfo.thumbnailUrl,
          ogImageUrl: videoInfo.ogImageUrl,
          aspectRatio: videoInfo.aspectRatio,
          duration: 6,
          quality: VideoQuality.HD,
          likesCount: Math.floor(Math.random() * 100) + 10, // 10-110 лайков
          viewsCount: Math.floor(Math.random() * 1000) + 50, // 50-1050 просмотров
          shareCount: Math.floor(Math.random() * 20) + 1, // 1-21 шеров
          isPublic: true,
        }
      });

      videoCount++;
      console.log(`✅ Created video ${videoCount}/30: aspect ratio ${videoInfo.aspectRatio}, vibe: ${randomVibe.id}`);

    } catch (error) {
      console.error(`❌ Error creating video ${videoCount + 1}:`, error);
    }
  }

  console.log(`🎉 Successfully seeded ${videoCount} videos!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during video seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });