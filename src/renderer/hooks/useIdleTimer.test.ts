import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { IDLE_TIME_RANGE } from '../../shared/constants'
import { type MaengguState } from '../../shared/types'

import { useIdleTimer } from './useIdleTimer'

describe('useIdleTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should dispatch walk-start after idle timeout', () => {
    const dispatchAnimEvent = vi.fn()

    renderHook(() =>
      useIdleTimer({ animState: 'idle', dispatchAnimEvent }),
    )

    expect(dispatchAnimEvent).not.toHaveBeenCalled()

    vi.advanceTimersByTime(IDLE_TIME_RANGE.max)

    expect(dispatchAnimEvent).toHaveBeenCalledOnce()
    expect(dispatchAnimEvent).toHaveBeenCalledWith({ type: 'walk-start' })
  })

  it('should not dispatch before minimum idle time', () => {
    const dispatchAnimEvent = vi.fn()

    renderHook(() =>
      useIdleTimer({ animState: 'idle', dispatchAnimEvent }),
    )

    vi.advanceTimersByTime(IDLE_TIME_RANGE.min - 1)

    expect(dispatchAnimEvent).not.toHaveBeenCalled()
  })

  it('should cancel timer when animState changes from idle', () => {
    const dispatchAnimEvent = vi.fn()

    const { rerender } = renderHook(
      ({ animState }: { animState: MaengguState }) =>
        useIdleTimer({ animState, dispatchAnimEvent }),
      { initialProps: { animState: 'idle' as MaengguState } },
    )

    vi.advanceTimersByTime(1000)

    rerender({ animState: 'walk' })

    vi.advanceTimersByTime(IDLE_TIME_RANGE.max)

    expect(dispatchAnimEvent).not.toHaveBeenCalled()
  })

  it('should restart timer when entering idle state', () => {
    const dispatchAnimEvent = vi.fn()

    const { rerender } = renderHook(
      ({ animState }: { animState: MaengguState }) =>
        useIdleTimer({ animState, dispatchAnimEvent }),
      { initialProps: { animState: 'walk' as MaengguState } },
    )

    expect(dispatchAnimEvent).not.toHaveBeenCalled()

    rerender({ animState: 'idle' })

    vi.advanceTimersByTime(IDLE_TIME_RANGE.max)

    expect(dispatchAnimEvent).toHaveBeenCalledOnce()
    expect(dispatchAnimEvent).toHaveBeenCalledWith({ type: 'walk-start' })
  })

  it('should not start timer for non-idle states', () => {
    const dispatchAnimEvent = vi.fn()
    const states: MaengguState[] = ['walk', 'eat', 'happy']

    for (const state of states) {
      const { unmount } = renderHook(() =>
        useIdleTimer({ animState: state, dispatchAnimEvent }),
      )

      vi.advanceTimersByTime(IDLE_TIME_RANGE.max)

      expect(dispatchAnimEvent).not.toHaveBeenCalled()

      unmount()
    }
  })

  it('should cleanup timer on unmount', () => {
    const dispatchAnimEvent = vi.fn()

    const { unmount } = renderHook(() =>
      useIdleTimer({ animState: 'idle', dispatchAnimEvent }),
    )

    vi.advanceTimersByTime(1000)

    unmount()

    vi.advanceTimersByTime(IDLE_TIME_RANGE.max)

    expect(dispatchAnimEvent).not.toHaveBeenCalled()
  })
})
