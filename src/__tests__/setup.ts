import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  User: () => <div data-testid="user-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}))

// Global test utilities
global.fetch = jest.fn()

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'