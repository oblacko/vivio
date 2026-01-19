import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";

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
    `Смотрите это ${video.duration}-секундное видео на Vivio${video.user?.name ? `. Создано ${video.user.name}` : ''}`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vivio.vercel.app';
  const videoUrl = `${baseUrl}/v/${video.id}`;
  
  // Используем thumbnailUrl для превью
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
          type: 'image/jpeg',
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
      // Open Graph дополнительные
      'og:image': previewImage,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      
      // Видео теги
      'og:video': video.videoUrl,
      'og:video:url': video.videoUrl,
      'og:video:secure_url': video.videoUrl,
      'og:video:type': 'video/mp4',
      'og:video:width': '1080',
      'og:video:height': '1920',
      
      // Twitter
      'twitter:player': video.videoUrl,
      'twitter:player:width': '1080',
      'twitter:player:height': '1920',
      
      // VK
      'vk:image': previewImage,
      
      // Telegram
      'telegram:player': video.videoUrl,
      'telegram:player:width': '1080',
      'telegram:player:height': '1920',
    },
    alternates: {
      canonical: `${baseUrl}/videos/${video.id}`,
    },
  };
}

export default async function ShortVideoPage({ params }: PageProps) {
  // Проверяем существование видео перед редиректом
  const video = await getVideo(params.id);
  
  if (!video) {
    redirect('/not-found');
  }

  // HTTP редирект на полную страницу
  // Боты прочитают метатеги ДО этого редиректа
  redirect(`/videos/${params.id}`);
}
