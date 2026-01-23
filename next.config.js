/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация для production
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',

  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Экспериментальные функции для оптимизации
  experimental: {
    // Оптимизация для serverless
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Отключаем статическую генерацию для API роутов
    serverActions: {
      allowedOrigins: ['*'],
    },
    // Отключаем статическую генерацию для всех роутов, использующих headers
    forceDynamic: {
      patterns: ['**/api/**'],
    },
  },

  // Security Headers для production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Webpack оптимизация
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Не включаем серверные модули на клиенте
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
