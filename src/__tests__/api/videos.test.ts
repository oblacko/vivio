import { NextRequest } from 'next/server'
import { GET } from '@/app/api/videos/route'
import { prisma } from '@/lib/db/client'

// Mock Prisma
jest.mock('@/lib/db/client', () => ({
  prisma: {
    video: {
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/videos GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return videos successfully', async () => {
    const mockVideos = [
      {
        id: '1',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        duration: 6,
        likesCount: 10,
        viewsCount: 100,
        userId: 'user1',
        challengeId: 'challenge1',
        createdAt: new Date(),
        isPublic: true,
        user: {
          id: 'user1',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
        },
        challenge: {
          id: 'challenge1',
          title: 'Test Challenge',
          category: 'Fun',
        },
      },
    ]

    mockPrisma.video.findMany.mockResolvedValue(mockVideos)

    const request = new NextRequest('http://localhost:3000/api/videos')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(mockVideos)
    expect(mockPrisma.video.findMany).toHaveBeenCalledWith({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: 0,
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
          },
        },
      },
    })
  })

  it('should filter by challengeId when provided', async () => {
    const mockVideos = [
      {
        id: '1',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: null,
        duration: 6,
        likesCount: 5,
        viewsCount: 50,
        userId: 'user1',
        challengeId: 'challenge1',
        createdAt: new Date(),
        isPublic: true,
        user: null,
        challenge: {
          id: 'challenge1',
          title: 'Test Challenge',
          category: 'Fun',
        },
      },
    ]

    mockPrisma.video.findMany.mockResolvedValue(mockVideos)

    const request = new NextRequest('http://localhost:3000/api/videos?challengeId=challenge1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.video.findMany).toHaveBeenCalledWith({
      where: {
        isPublic: true,
        challengeId: 'challenge1',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: 0,
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
          },
        },
      },
    })
  })

  it('should handle pagination parameters', async () => {
    mockPrisma.video.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/videos?limit=10&offset=5')
    await GET(request)

    expect(mockPrisma.video.findMany).toHaveBeenCalledWith({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      skip: 5,
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
          },
        },
      },
    })
  })

  it('should return 500 on database error', async () => {
    const error = new Error('Database connection failed')
    mockPrisma.video.findMany.mockRejectedValue(error)

    const request = new NextRequest('http://localhost:3000/api/videos')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Database connection failed')
  })

  it('should return 500 on generic error', async () => {
    mockPrisma.video.findMany.mockRejectedValue('String error')

    const request = new NextRequest('http://localhost:3000/api/videos')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch videos')
  })
})