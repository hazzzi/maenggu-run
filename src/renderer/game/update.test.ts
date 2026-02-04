import { describe, expect, it } from 'vitest'

import { type MaengguGameState } from './types'
import { update } from './update'

function createTestState(overrides: Partial<MaengguGameState> = {}): MaengguGameState {
  return {
    anim: {
      state: 'idle',
      frameIndex: 0,
      elapsedMs: 0,
      isComplete: false,
      ...overrides.anim,
    },
    movement: {
      position: { x: 100, y: 100 },
      target: null,
      speed: 3,
      facing: 'right',
      ...overrides.movement,
    },
    idleTimer: {
      remainingMs: 5000,
      isActive: true,
      ...overrides.idleTimer,
    },
  }
}

const bounds = { width: 800, height: 600 }

describe('update', () => {
  describe('click event', () => {
    it('should transition to eat and add snack on click', () => {
      const state = createTestState()

      const result = update(state, 16, [{ type: 'click', position: { x: 100, y: 100 } }], bounds)

      expect(result.state.anim.state).toBe('eat')
      expect(result.actions).toContainEqual({ type: 'add-snack' })
      expect(result.actions).toContainEqual(
        expect.objectContaining({ type: 'show-floating-text' }),
      )
    })

    it('should ignore click during eat animation', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 0, elapsedMs: 0, isComplete: false },
      })

      const result = update(state, 16, [{ type: 'click', position: { x: 100, y: 100 } }], bounds)

      expect(result.actions).toHaveLength(0)
    })

    it('should ignore click during happy animation', () => {
      const state = createTestState({
        anim: { state: 'happy', frameIndex: 0, elapsedMs: 0, isComplete: false },
      })

      const result = update(state, 16, [{ type: 'click', position: { x: 100, y: 100 } }], bounds)

      expect(result.actions).toHaveLength(0)
    })
  })

  describe('feed event', () => {
    it('should transition to eat on feed-success', () => {
      const state = createTestState()

      const result = update(state, 16, [{ type: 'feed-success' }], bounds)

      expect(result.state.anim.state).toBe('eat')
      expect(result.actions).toHaveLength(0) // No snack added
    })

    it('should do nothing on feed-fail', () => {
      const state = createTestState()

      const result = update(state, 16, [{ type: 'feed-fail' }], bounds)

      expect(result.state.anim.state).toBe('idle')
    })
  })

  describe('animation completion', () => {
    it('should transition from eat to happy on completion', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 4, elapsedMs: 0, isComplete: true },
      })

      const result = update(state, 16, [], bounds)

      expect(result.state.anim.state).toBe('happy')
      expect(result.state.anim.isComplete).toBe(false)
    })

    it('should transition from happy to idle on completion', () => {
      const state = createTestState({
        anim: { state: 'happy', frameIndex: 0, elapsedMs: 0, isComplete: true },
        idleTimer: { remainingMs: 0, isActive: false },
      })

      const result = update(state, 16, [], bounds)

      expect(result.state.anim.state).toBe('idle')
      expect(result.state.idleTimer.isActive).toBe(true)
      expect(result.state.idleTimer.remainingMs).toBeGreaterThan(0)
    })
  })

  describe('idle timer', () => {
    it('should decrement timer in idle state', () => {
      const state = createTestState({
        idleTimer: { remainingMs: 1000, isActive: true },
      })

      const result = update(state, 100, [], bounds)

      expect(result.state.idleTimer.remainingMs).toBe(900)
    })

    it('should start walking when timer expires', () => {
      const state = createTestState({
        idleTimer: { remainingMs: 50, isActive: true },
      })

      const result = update(state, 100, [], bounds)

      expect(result.state.anim.state).toBe('walk')
      expect(result.state.movement.target).not.toBeNull()
    })
  })

  describe('movement', () => {
    it('should update position during walk', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 100, y: 100 },
          target: { type: 'random', position: { x: 200, y: 100 } },
          speed: 3,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
      })

      const result = update(state, 16, [], bounds)

      expect(result.state.movement.position.x).toBeGreaterThan(100)
    })

    it('should transition to idle when target reached', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 199, y: 100 },
          target: { type: 'random', position: { x: 200, y: 100 } },
          speed: 3,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
      })

      const result = update(state, 16, [], bounds)

      expect(result.state.anim.state).toBe('idle')
      expect(result.state.movement.target).toBeNull()
      expect(result.state.idleTimer.isActive).toBe(true)
    })
  })
})
