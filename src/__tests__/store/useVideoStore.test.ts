import { renderHook, act } from '@testing-library/react'
import { useVideoStore } from '@/store/useVideoStore'

const mockVideo = {
  id: 'video1',
  videoUrl: 'https://example.com/video1.mp4',
  thumbnailUrl: 'https://example.com/thumb1.jpg',
  duration: 6,
  likesCount: 10,
  viewsCount: 100,
  userId: 'user1',
  challengeId: 'challenge1',
  createdAt: new Date(),
}

describe('useVideoStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useVideoStore.getState().setVideos([])
      useVideoStore.getState().setCurrentVideo(null)
    })
  })

  describe('initial state', () => {
    it('should have empty videos array initially', () => {
      const { result } = renderHook(() => useVideoStore())

      expect(result.current.videos).toEqual([])
    })

    it('should have null currentVideo initially', () => {
      const { result } = renderHook(() => useVideoStore())

      expect(result.current.currentVideo).toBeNull()
    })

    it('should have empty likedVideos set initially', () => {
      const { result } = renderHook(() => useVideoStore())

      expect(result.current.likedVideos).toEqual(new Set())
    })
  })

  describe('setVideos', () => {
    it('should set videos correctly', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
      })

      expect(result.current.videos).toEqual([mockVideo])
    })

    it('should replace existing videos', () => {
      const { result } = renderHook(() => useVideoStore())
      const newVideos = [{ ...mockVideo, id: 'video2' }]

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.setVideos(newVideos)
      })

      expect(result.current.videos).toEqual(newVideos)
    })
  })

  describe('setCurrentVideo', () => {
    it('should set current video correctly', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setCurrentVideo(mockVideo)
      })

      expect(result.current.currentVideo).toEqual(mockVideo)
    })

    it('should set current video to null', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setCurrentVideo(mockVideo)
        result.current.setCurrentVideo(null)
      })

      expect(result.current.currentVideo).toBeNull()
    })
  })

  describe('addVideo', () => {
    it('should add video to the beginning of the array', () => {
      const { result } = renderHook(() => useVideoStore())
      const existingVideo = { ...mockVideo, id: 'existing' }

      act(() => {
        result.current.setVideos([existingVideo])
        result.current.addVideo(mockVideo)
      })

      expect(result.current.videos).toEqual([mockVideo, existingVideo])
    })

    it('should add video to empty array', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.addVideo(mockVideo)
      })

      expect(result.current.videos).toEqual([mockVideo])
    })
  })

  describe('updateVideo', () => {
    it('should update existing video', () => {
      const { result } = renderHook(() => useVideoStore())
      const updatedVideo = { ...mockVideo, likesCount: 20 }

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.updateVideo('video1', { likesCount: 20 })
      })

      expect(result.current.videos[0]).toEqual(updatedVideo)
    })

    it('should not update non-existing video', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.updateVideo('non-existing', { likesCount: 20 })
      })

      expect(result.current.videos[0]).toEqual(mockVideo)
    })

    it('should partially update video properties', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.updateVideo('video1', { viewsCount: 200 })
      })

      expect(result.current.videos[0].viewsCount).toBe(200)
      expect(result.current.videos[0].likesCount).toBe(10) // unchanged
    })
  })

  describe('toggleLike', () => {
    it('should add video to liked set and increment likes count', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.toggleLike('video1')
      })

      expect(result.current.likedVideos.has('video1')).toBe(true)
      expect(result.current.videos[0].likesCount).toBe(11) // 10 + 1
    })

    it('should remove video from liked set and decrement likes count', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.toggleLike('video1') // like
        result.current.toggleLike('video1') // unlike
      })

      expect(result.current.likedVideos.has('video1')).toBe(false)
      expect(result.current.videos[0].likesCount).toBe(10) // back to original
    })

    it('should prevent likes count from going below 0', () => {
      const { result } = renderHook(() => useVideoStore())
      const videoWithZeroLikes = { ...mockVideo, likesCount: 0 }

      act(() => {
        result.current.setVideos([videoWithZeroLikes])
        result.current.toggleLike('video1') // like
        result.current.toggleLike('video1') // unlike
      })

      expect(result.current.videos[0].likesCount).toBe(0)
    })

    it('should not affect other videos', () => {
      const { result } = renderHook(() => useVideoStore())
      const video2 = { ...mockVideo, id: 'video2', likesCount: 5 }

      act(() => {
        result.current.setVideos([mockVideo, video2])
        result.current.toggleLike('video1')
      })

      expect(result.current.videos[0].likesCount).toBe(11)
      expect(result.current.videos[1].likesCount).toBe(5) // unchanged
    })
  })

  describe('incrementViews', () => {
    it('should increment views count for existing video', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.incrementViews('video1')
      })

      expect(result.current.videos[0].viewsCount).toBe(101) // 100 + 1
    })

    it('should not affect other videos', () => {
      const { result } = renderHook(() => useVideoStore())
      const video2 = { ...mockVideo, id: 'video2', viewsCount: 50 }

      act(() => {
        result.current.setVideos([mockVideo, video2])
        result.current.incrementViews('video1')
      })

      expect(result.current.videos[0].viewsCount).toBe(101)
      expect(result.current.videos[1].viewsCount).toBe(50) // unchanged
    })

    it('should not affect non-existing video', () => {
      const { result } = renderHook(() => useVideoStore())

      act(() => {
        result.current.setVideos([mockVideo])
        result.current.incrementViews('non-existing')
      })

      expect(result.current.videos[0].viewsCount).toBe(100) // unchanged
    })
  })
})