import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: 60,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '80px',
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 40,
                textShadow: '0 8px 16px rgba(0,0,0,0.4)',
                letterSpacing: '-2px',
              }}
            >
              Vivio
            </div>
            <div
              style={{
                fontSize: 48,
                color: 'white',
                opacity: 0.95,
                marginBottom: 20,
              }}
            >
              6-секундное AI видео
            </div>
            <div
              style={{
                fontSize: 36,
                color: 'white',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                🎬 Смотреть
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
