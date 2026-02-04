import { describe, expect, it } from 'vitest'

import { type MovementState } from './types'
import { startMovement, stopMovement, updateMovement } from './update-movement'

describe('updateMovement', () => {
  const bounds = { width: 800, height: 600 }

  it('should not move when target is null', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: null,
      speed: 3,
      facing: 'right',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.position).toEqual(state.position)
    expect(result.reachedTarget).toBeNull()
  })

  it('should move towards target', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: { type: 'random', position: { x: 200, y: 100 } },
      speed: 3,
      facing: 'right',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.position.x).toBeGreaterThan(100)
    expect(result.state.position.y).toBeCloseTo(100)
    expect(result.reachedTarget).toBeNull()
  })

  it('should snap to target when close enough', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: { type: 'random', position: { x: 101, y: 100 } },
      speed: 3,
      facing: 'right',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.position).toEqual({ x: 101, y: 100 })
    expect(result.state.target).toBeNull()
    expect(result.reachedTarget).toEqual({ type: 'random', position: { x: 101, y: 100 } })
  })

  it('should update facing direction when moving left', () => {
    const state: MovementState = {
      position: { x: 200, y: 100 },
      target: { type: 'random', position: { x: 100, y: 100 } },
      speed: 3,
      facing: 'right',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.facing).toBe('left')
  })

  it('should update facing direction when moving right', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: { type: 'random', position: { x: 200, y: 100 } },
      speed: 3,
      facing: 'left',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.facing).toBe('right')
  })

  it('should clamp position to bounds', () => {
    const state: MovementState = {
      position: { x: 10, y: 100 },
      target: { type: 'random', position: { x: -100, y: 100 } },
      speed: 50,
      facing: 'left',
    }

    const result = updateMovement(state, 16, bounds)

    expect(result.state.position.x).toBeGreaterThanOrEqual(0)
  })
})

describe('stopMovement', () => {
  it('should set target to null', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: { type: 'random', position: { x: 200, y: 200 } },
      speed: 3,
      facing: 'right',
    }

    const result = stopMovement(state)

    expect(result.target).toBeNull()
    expect(result.position).toEqual(state.position)
  })
})

describe('startMovement', () => {
  it('should set target and speed', () => {
    const state: MovementState = {
      position: { x: 100, y: 100 },
      target: null,
      speed: 2,
      facing: 'right',
    }

    const target = { type: 'random' as const, position: { x: 300, y: 300 } }
    const result = startMovement(state, target, 5)

    expect(result.target).toEqual(target)
    expect(result.speed).toBe(5)
  })
})
