import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMovement } from './useMovement'
import * as vectorModule from '../movement/vector'

vi.mock('../movement/vector', async () => {
  const actual = await vi.importActual<typeof vectorModule>('../movement/vector')
  return {
    ...actual,
    generateRandomSpeed: vi.fn(() => 3),
  }
})

describe('useMovement', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should not update position when not walking', () => {
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    renderHook(() =>
      useMovement({
        isWalking: false,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 10, y: 10 },
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    vi.runAllTimers()

    expect(onPositionUpdate).not.toHaveBeenCalled()
    expect(onTargetReached).not.toHaveBeenCalled()
  })

  it('should not update position when target is null', () => {
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    renderHook(() =>
      useMovement({
        isWalking: true,
        currentPosition: { x: 0, y: 0 },
        targetPosition: null,
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    vi.runAllTimers()

    expect(onPositionUpdate).not.toHaveBeenCalled()
    expect(onTargetReached).not.toHaveBeenCalled()
  })

  it('should reach target immediately when distance is less than speed', () => {
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    renderHook(() =>
      useMovement({
        isWalking: true,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 1, y: 1 },
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    vi.runAllTimers()

    expect(onPositionUpdate).toHaveBeenCalledWith({ x: 1, y: 1 })
    expect(onTargetReached).toHaveBeenCalledTimes(1)
  })

  it('should update position incrementally toward target', async () => {
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    vi.useRealTimers()

    renderHook(() =>
      useMovement({
        isWalking: true,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 30, y: 0 },
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    expect(onPositionUpdate).toHaveBeenCalled()
    const firstCall = onPositionUpdate.mock.calls[0]?.[0]
    expect(firstCall?.x).toBeGreaterThan(0)
    expect(firstCall?.x).toBeLessThan(30)
  })

  it('should cancel animation frame on unmount', () => {
    const cancelAnimationFrameSpy = vi.spyOn(
      globalThis,
      'cancelAnimationFrame',
    )
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    const { unmount } = renderHook(() =>
      useMovement({
        isWalking: true,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 100, y: 100 },
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
  })

  it('should cancel animation frame when isWalking becomes false', () => {
    const cancelAnimationFrameSpy = vi.spyOn(
      globalThis,
      'cancelAnimationFrame',
    )
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    const { rerender } = renderHook(
      ({ isWalking }) =>
        useMovement({
          isWalking,
          currentPosition: { x: 0, y: 0 },
          targetPosition: { x: 100, y: 100 },
          onPositionUpdate,
          onTargetReached,
          onDirectionChange: vi.fn(),
        }),
      { initialProps: { isWalking: true } },
    )

    rerender({ isWalking: false })

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
  })

  it('should generate new speed when starting to walk', () => {
    const generateRandomSpeedSpy = vi.mocked(vectorModule.generateRandomSpeed)
    const onPositionUpdate = vi.fn()
    const onTargetReached = vi.fn()

    renderHook(() =>
      useMovement({
        isWalking: true,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 100, y: 100 },
        onPositionUpdate,
        onTargetReached,
        onDirectionChange: vi.fn(),
      }),
    )

    expect(generateRandomSpeedSpy).toHaveBeenCalled()
  })
})
