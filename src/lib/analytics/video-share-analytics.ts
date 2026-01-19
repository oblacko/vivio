import { prisma } from "@/lib/db/client";

interface ShareAnalyticsData {
  videoId: string;
  referrer?: string | null;
  userAgent?: string | null;
}

/**
 * Определяет источник перехода на основе referrer
 */
function determineSource(referrer: string | null | undefined): string {
  if (!referrer) return 'direct';
  
  const lowerRef = referrer.toLowerCase();
  
  if (lowerRef.includes('vk.com') || lowerRef.includes('vkontakte')) return 'vk';
  if (lowerRef.includes('t.me') || lowerRef.includes('telegram')) return 'telegram';
  if (lowerRef.includes('facebook.com') || lowerRef.includes('fb.com')) return 'facebook';
  if (lowerRef.includes('twitter.com') || lowerRef.includes('x.com')) return 'twitter';
  if (lowerRef.includes('instagram.com')) return 'instagram';
  if (lowerRef.includes('whatsapp')) return 'whatsapp';
  
  return 'other';
}

/**
 * Записывает аналитику перехода по короткой ссылке
 */
export async function recordVideoView(data: ShareAnalyticsData): Promise<void> {
  try {
    const source = determineSource(data.referrer);
    
    await prisma.videoShare.create({
      data: {
        videoId: data.videoId,
        source,
        referrer: data.referrer || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to record video view analytics:', error);
    // Не бросаем ошибку, чтобы не прерывать основной поток
  }
}
