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

  const redirectUrl = `/videos/${params.id}`;

  // ВОЗВРАЩАЕМ HTML С МЕТАТЕГАМИ + META-REFRESH ДЛЯ РЕДИРЕКТА
  // Боты читают метатеги, пользователи редиректятся через 0.5 сек
  return (
    <html lang="ru">
      <head>
        <meta httpEquiv="refresh" content={`0.5; url=${redirectUrl}`} />
        <script dangerouslySetInnerHTML={{
          __html: `setTimeout(function() { window.location.href = '${redirectUrl}'; }, 500);`
        }} />
      </head>
      <body style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Vivio
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Загрузка видео...
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
            Если автоматический переход не работает,{' '}
            <a href={redirectUrl} style={{ color: 'white', textDecoration: 'underline' }}>
              нажмите здесь
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
