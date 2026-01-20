import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { VideoPageClient } from "./VideoPageClient";

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
  const videoUrl = `${baseUrl}/videos/${video.id}`;
  
  // Используем ogImageUrl для превью (горизонтальное 1200x630), fallback на thumbnailUrl или API
  const previewImage = video.ogImageUrl || video.thumbnailUrl || `${baseUrl}/api/og?id=${video.id}`;
  const isOgImage = !!video.ogImageUrl; // Определяем, используется ли горизонтальное превью

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
          width: isOgImage ? 1200 : (video.thumbnailUrl ? undefined : 1200),
          height: isOgImage ? 630 : (video.thumbnailUrl ? undefined : 630),
          alt: videoTitle,
          type: isOgImage ? 'image/jpeg' : (video.thumbnailUrl ? 'image/webp' : 'image/jpeg'),
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
      ...(isOgImage ? {
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/jpeg',
      } : video.thumbnailUrl ? {
        'og:image:type': 'image/webp',
      } : {
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/jpeg',
      }),
      
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
      canonical: videoUrl,
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  return <VideoPageClient videoId={params.id} />;
}
