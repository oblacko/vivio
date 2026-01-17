import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockProps = {
  id: 'test-challenge-id',
  title: 'Test Challenge',
  description: 'This is a test challenge description',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  participantCount: 42,
  category: 'Fun',
  user: {
    id: 'user1',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  },
  likesCount: 15,
  viewsCount: 120,
  isLiked: false,
  onLike: jest.fn(),
  onShare: jest.fn(),
}

describe('ChallengeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders challenge information correctly', () => {
    render(<ChallengeCard {...mockProps} />)

    expect(screen.getByText('Test Challenge')).toBeInTheDocument()
    expect(screen.getByText('This is a test challenge description')).toBeInTheDocument()
    expect(screen.getByText('Fun')).toBeInTheDocument()
    expect(screen.getByText('42 участников')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument() // views count
    expect(screen.getByText('15')).toBeInTheDocument() // likes count
  })

  it('renders with thumbnail image', () => {
    render(<ChallengeCard {...mockProps} />)

    const image = screen.getByAltText('Test Challenge')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/thumbnail.jpg')
  })

  it('renders without thumbnail', () => {
    render(<ChallengeCard {...mockProps} thumbnailUrl={null} />)

    expect(screen.getByText('No preview')).toBeInTheDocument()
  })

  it('renders user avatar and name', () => {
    render(<ChallengeCard {...mockProps} />)

    const avatar = screen.getByAltText('') // Avatar without alt text
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders user avatar fallback when no image', () => {
    render(
      <ChallengeCard
        {...mockProps}
        user={{
          id: 'user1',
          name: 'Test User',
          image: null,
        }}
      />
    )

    expect(screen.getByText('T')).toBeInTheDocument() // First letter of name
  })

  it('renders without user information', () => {
    render(<ChallengeCard {...mockProps} user={null} />)

    // Should not render avatar
    expect(screen.queryByRole('img', { hidden: true })).toBeNull()
  })

  it('renders without description', () => {
    render(<ChallengeCard {...mockProps} description={null} />)

    expect(screen.queryByText('This is a test challenge description')).not.toBeInTheDocument()
  })

  it('calls onLike when like button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChallengeCard {...mockProps} />)

    const likeButton = screen.getByRole('button', { name: /like/i })
    await user.click(likeButton)

    expect(mockProps.onLike).toHaveBeenCalledTimes(1)
  })

  it('calls onShare when share button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChallengeCard {...mockProps} />)

    const shareButton = screen.getByRole('button', { name: /share/i })
    await user.click(shareButton)

    expect(mockProps.onShare).toHaveBeenCalledTimes(1)
  })

  it('prevents event propagation on button clicks', async () => {
    const user = userEvent.setup()
    const mockOnLike = jest.fn()

    render(<ChallengeCard {...mockProps} onLike={mockOnLike} />)

    const likeButton = screen.getByRole('button', { name: /like/i })

    // Spy on preventDefault
    const preventDefaultSpy = jest.fn()
    const mockEvent = { preventDefault: preventDefaultSpy }

    // Manually trigger the click handler with our mock event
    fireEvent.click(likeButton, mockEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('shows liked state correctly', () => {
    render(<ChallengeCard {...mockProps} isLiked={true} />)

    const likeButton = screen.getByRole('button', { name: /like/i })
    expect(likeButton).toHaveClass('text-red-500')
  })

  it('renders default values for likes and views', () => {
    render(
      <ChallengeCard
        {...mockProps}
        likesCount={undefined}
        viewsCount={undefined}
      />
    )

    expect(screen.getByText('0')).toBeInTheDocument() // default likes count
    expect(screen.getByText('0')).toBeInTheDocument() // default views count
  })

  it('renders duration badge', () => {
    render(<ChallengeCard {...mockProps} />)

    expect(screen.getByText('6 сек')).toBeInTheDocument()
  })

  it('has correct link to challenge page', () => {
    render(<ChallengeCard {...mockProps} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/challenges/test-challenge-id')
  })

  it('has correct link to user profile', () => {
    render(<ChallengeCard {...mockProps} />)

    const userLinks = screen.getAllByRole('link')
    const profileLink = userLinks.find(link =>
      link.getAttribute('href')?.includes('/profile/')
    )

    expect(profileLink).toHaveAttribute('href', '/profile/user1')
  })
})