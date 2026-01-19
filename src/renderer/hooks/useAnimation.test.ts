import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useAnimation } from './useAnimation'

describe('useAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('looping animations', () => {
    it('should cycle through idle frames (single frame, no animation)', () => {
      const { result } = renderHook(() => useAnimation('idle'))

      expect(result.current.frameIndex).toBe(0)

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current.frameIndex).toBe(0)
    })

    it('should cycle through walk frames indefinitely', () => {
      const { result } = renderHook(() => useAnimation('walk'))

      expect(result.current.frameIndex).toBe(0)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(1)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(2)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(0)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(1)
    })
  })

  describe('one-shot animations', () => {
    it('should play eat animation once and call onComplete', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useAnimation('eat', onComplete))

      expect(result.current.frameIndex).toBe(0)
      expect(onComplete).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(1)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(2)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(3)

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current.frameIndex).toBe(3)
      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('should call onComplete for happy (single frame)', () => {
      const onComplete = vi.fn()
      renderHook(() => useAnimation('happy', onComplete))

      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('should call onComplete only once for eat animation', () => {
      const onComplete = vi.fn()
      renderHook(() => useAnimation('eat', onComplete))

      act(() => {
        vi.advanceTimersByTime(200 * 10)
      })

      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('should stay at last frame after eat completes', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useAnimation('eat', onComplete))

      act(() => {
        vi.advanceTimersByTime(200 * 5)
      })

      expect(result.current.frameIndex).toBe(3)

      act(() => {
        vi.advanceTimersByTime(200 * 5)
      })

      expect(result.current.frameIndex).toBe(3)
    })
  })

  describe('animation state changes', () => {
    it('should reset frame index when animation state changes', () => {
      const { result, rerender } = renderHook(
        ({ animState }: { animState: 'walk' | 'idle' }) => useAnimation(animState),
        { initialProps: { animState: 'walk' as 'walk' | 'idle' } },
      )

      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(result.current.frameIndex).toBe(2)

      rerender({ animState: 'idle' })

      expect(result.current.frameIndex).toBe(0)
    })

    it('should reset completion flag when changing to one-shot animation', () => {
      const onComplete = vi.fn()
      const { rerender } = renderHook(
        ({ animState }: { animState: 'eat' | 'walk' }) => useAnimation(animState, onComplete),
        { initialProps: { animState: 'eat' as 'eat' | 'walk' } },
      )

      act(() => {
        vi.advanceTimersByTime(200 * 5)
      })
      expect(onComplete).toHaveBeenCalledTimes(1)

      rerender({ animState: 'walk' })
      rerender({ animState: 'eat' })

      act(() => {
        vi.advanceTimersByTime(200 * 5)
      })
      expect(onComplete).toHaveBeenCalledTimes(2)
    })
  })
})
