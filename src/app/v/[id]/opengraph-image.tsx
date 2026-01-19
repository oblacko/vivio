import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db/client';

export const runtime = 'nodejs';
export const alt = 'Vivio Video';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: {
    id: string;
  };
}

export default async function Image({ params }: Props) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      challenge: {
        select: {
          title: true,
          category: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!video) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontFamily: 'system-ui',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Видео не найдено
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}
          >
            Vivio
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: '600',
              color: 'white',
              marginBottom: 30,
              opacity: 0.95,
              maxWidth: '900px',
            }}
          >
            {video.challenge?.title || 'Видео'}
          </div>
          {video.user?.name && (
            <div
              style={{
                fontSize: 32,
                color: 'white',
                opacity: 0.8,
              }}
            >
              Создано {video.user.name}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: 40,
              fontSize: 28,
              color: 'white',
              opacity: 0.9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              👁️ {video.viewsCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              ❤️ {video.likesCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🎬 {video.duration}s
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
