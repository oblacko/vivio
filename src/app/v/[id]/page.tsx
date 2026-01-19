import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { headers } from "next/headers";
import { recordVideoView } from "@/lib/analytics/video-share-analytics";

export const runtime = 'nodejs';

interface PageProps {
  params: {
    id: string;
  };
}

async function getVideo(id: string) {
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
        },
      },
    },
  });

  return video;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const video = await getVideo(params.id);

  if (!video) {
    return {
      title: "Видео не найдено",
    };
  }

  const videoTitle = video.challenge?.title || "Видео на Vivio";
  const videoDescription = 
    video.challenge?.description || 
    `Смотрите это 6-секундное видео на Vivio${video.user?.name ? `. Создано ${video.user.name}` : ''}`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vivio.vercel.app';
  const videoUrl = `${baseUrl}/v/${video.id}`;
  
  // Используем thumbnail или статическое изображение для превью
  // ВАЖНО: Telegram требует именно изображение, не MP4!
  const previewImage = video.thumbnailUrl || `${baseUrl}/api/og?id=${video.id}`;

  return {
    title: videoTitle,
    description: videoDescription,
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: 'video.other',
      title: videoTitle,
      description: videoDescription,
      url: videoUrl,
      siteName: 'Vivio',
      locale: 'ru_RU',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: videoTitle,
        }
      ],
      videos: [
        {
          url: video.videoUrl,
          secureUrl: video.videoUrl,
          type: 'video/mp4',
          width: 1080,
          height: 1920,
        }
      ],
    },
    twitter: {
      card: 'player',
      title: videoTitle,
      description: videoDescription,
      site: '@vivio',
      images: [previewImage],
      players: {
        playerUrl: video.videoUrl,
        streamUrl: video.videoUrl,
        width: 1080,
        height: 1920,
      },
    },
    other: {
      // Telegram-специфичные теги
      'og:image': previewImage,
      'og:image:width': '1200',
      'og:image:height': '630',
      // Видео теги
      'og:video': video.videoUrl,
      'og:video:url': video.videoUrl,
      'og:video:secure_url': video.videoUrl,
      'og:video:type': 'video/mp4',
      'og:video:width': '1080',
      'og:video:height': '1920',
      // Дополнительные теги для Telegram
      'telegram:player': video.videoUrl,
      'telegram:player:width': '1080',
      'telegram:player:height': '1920',
    },
    alternates: {
      canonical: videoUrl,
    },
  };
}

export default async function ShareVideoPage({ params }: PageProps) {
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  // Получаем информацию о реферере для аналитики
  const headersList = headers();
  const referer = headersList.get('referer');
  const userAgent = headersList.get('user-agent');

  // Записываем аналитику перехода (асинхронно)
  recordVideoView({
    videoId: params.id,
    referrer: referer,
    userAgent: userAgent,
  }).catch(err => console.error('Analytics error:', err));

  // Определяем, это бот или реальный пользователь
  const isBot = userAgent?.toLowerCase().includes('bot') || 
                userAgent?.toLowerCase().includes('crawler') ||
                userAgent?.toLowerCase().includes('telegram');

  // Для ботов показываем простую HTML страницу с метатегами
  // Для пользователей делаем редирект через JavaScript
  if (isBot) {
    // Telegram и другие боты получат HTML с правильными метатегами
    return (
      <html>
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body>
          <h1>Загрузка видео...</h1>
          <p>Видео на Vivio</p>
        </body>
      </html>
    );
  }

  // Для обычных пользователей делаем редирект
  redirect(`/videos/${params.id}`);
}
