import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimit, getIdentifier } from '@/lib/middleware/rate-limit'
import { checkRateLimit } from '@/lib/redis/client'

// Mock the Redis checkRateLimit function
jest.mock('@/lib/redis/client', () => ({
  checkRateLimit: jest.fn(),
}))

const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIdentifier', () => {
    it('should return x-forwarded-for header if available', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      })

      const identifier = getIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })

    it('should return x-real-ip header if x-forwarded-for is not available', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      })

      const identifier = getIdentifier(request)
      expect(identifier).toBe('192.168.1.2')
    })

    it('should return anonymous if no IP headers are available', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const identifier = getIdentifier(request)
      expect(identifier).toBe('anonymous')
    })

    it('should prioritize x-forwarded-for over x-real-ip', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      })

      const identifier = getIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })
  })

  describe('withRateLimit', () => {
    const mockHandler = jest.fn()

    beforeEach(() => {
      mockHandler.mockResolvedValue(new NextResponse('OK'))
    })

    it('should allow request when rate limit is not exceeded', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await withRateLimit(request, mockHandler)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('anonymous', 3, 60)
      expect(mockHandler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should use custom config', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 19,
        reset: Date.now() + 60000,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 20, windowSeconds: 30 }
      const response = await withRateLimit(request, mockHandler, config)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('anonymous', 20, 30)
    })

    it('should use custom identifier function', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      const customIdentifier = () => 'custom-id'
      const config = { identifier: customIdentifier }
      await withRateLimit(request, mockHandler, config)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('custom-id', 3, 60)
    })

    it('should block request when rate limit is exceeded', async () => {
      const resetTime = Date.now() + 60000
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        limit: 3,
        remaining: 0,
        reset: resetTime,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await withRateLimit(request, mockHandler)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(429)

      const data = await response.json()
      expect(data.error).toBe('Rate limit exceeded')
      expect(data.limit).toBe(3)
      expect(data.remaining).toBe(0)
      expect(data.reset).toBe(resetTime)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBe(resetTime.toString())
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('should handle errors from checkRateLimit', async () => {
      mockCheckRateLimit.mockRejectedValue(new Error('Redis connection failed'))

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await withRateLimit(request, mockHandler)

      // Should still allow the request when rate limit check fails
      expect(mockHandler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
    })
  })

  describe('rateLimit helper', () => {
    it('should return a function that applies rate limiting', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() + 60000,
      })

      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const rateLimitedHandler = rateLimit({ limit: 5 })

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await rateLimitedHandler(mockHandler)(request)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('anonymous', 5, 60)
      expect(mockHandler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
    })

    it('should work without config', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 3,
        remaining: 2,
        reset: Date.now() + 60000,
      })

      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const rateLimitedHandler = rateLimit()

      const request = new NextRequest('http://localhost:3000/api/test')
      await rateLimitedHandler(mockHandler)(request)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('anonymous', 3, 60)
    })
  })
})