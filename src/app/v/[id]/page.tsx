import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { headers } from "next/headers";
import { recordVideoView } from "@/lib/analytics/video-share-analytics";

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
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vivio.app';
  const videoUrl = `${baseUrl}/v/${video.id}`;

  return {
    title: videoTitle,
    description: videoDescription,
    openGraph: {
      type: 'video.other',
      title: videoTitle,
      description: 'Сделано в приложении Vivio',
      url: videoUrl,
      siteName: 'Vivio',
      images: video.thumbnailUrl ? [
        {
          url: video.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: videoTitle,
        }
      ] : [],
      videos: [
        {
          url: video.videoUrl,
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
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
      players: {
        playerUrl: video.videoUrl,
        streamUrl: video.videoUrl,
        width: 1080,
        height: 1920,
      },
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

  // Записываем аналитику перехода (асинхронно, не блокируя редирект)
  recordVideoView({
    videoId: params.id,
    referrer: referer,
    userAgent: userAgent,
  }).catch(err => console.error('Analytics error:', err));

  // Редиректим на основную страницу видео
  redirect(`/videos/${params.id}`);
}
