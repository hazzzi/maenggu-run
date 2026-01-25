import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  generateRandomTarget,
  isPositionInBounds,
  getWindowBounds,
  clampPositionToBounds,
} from './target'
import { SPRITE_SIZE } from '../../shared/constants'

describe('target', () => {
  const SPRITE_DISPLAY_SIZE = SPRITE_SIZE * 2

  describe('generateRandomTarget', () => {
    it('should generate position within bounds accounting for sprite size', () => {
      const bounds = { width: 1000, height: 800 }
      const maxX = bounds.width - SPRITE_DISPLAY_SIZE
      const maxY = bounds.height - SPRITE_DISPLAY_SIZE

      for (let i = 0; i < 100; i++) {
        const target = generateRandomTarget(bounds)

        expect(target.x).toBeGreaterThanOrEqual(0)
        expect(target.x).toBeLessThanOrEqual(maxX)
        expect(target.y).toBeGreaterThanOrEqual(0)
        expect(target.y).toBeLessThanOrEqual(maxY)
      }
    })

    it('should generate different positions', () => {
      const bounds = { width: 1000, height: 800 }
      const positions = new Set<string>()

      for (let i = 0; i < 50; i++) {
        const target = generateRandomTarget(bounds)
        positions.add(`${target.x},${target.y}`)
      }

      expect(positions.size).toBeGreaterThan(1)
    })

    it('should generate integer coordinates', () => {
      const bounds = { width: 1000, height: 800 }
      const target = generateRandomTarget(bounds)

      expect(Number.isInteger(target.x)).toBe(true)
      expect(Number.isInteger(target.y)).toBe(true)
    })
  })

  describe('isPositionInBounds', () => {
    const bounds = { width: 1000, height: 800 }

    it('should return true for position inside bounds', () => {
      expect(isPositionInBounds({ x: 500, y: 400 }, bounds)).toBe(true)
      expect(isPositionInBounds({ x: 0, y: 0 }, bounds)).toBe(true)
      expect(isPositionInBounds({ x: 1000, y: 800 }, bounds)).toBe(true)
    })

    it('should return false for position outside bounds', () => {
      expect(isPositionInBounds({ x: -1, y: 400 }, bounds)).toBe(false)
      expect(isPositionInBounds({ x: 500, y: -1 }, bounds)).toBe(false)
      expect(isPositionInBounds({ x: 1001, y: 400 }, bounds)).toBe(false)
      expect(isPositionInBounds({ x: 500, y: 801 }, bounds)).toBe(false)
    })
  })

  describe('getWindowBounds', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        innerWidth: 1920,
        innerHeight: 1080,
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should return window dimensions', () => {
      const bounds = getWindowBounds()

      expect(bounds.width).toBe(1920)
      expect(bounds.height).toBe(1080)
    })
  })

  describe('clampPositionToBounds', () => {
    const SPRITE_DISPLAY_SIZE = SPRITE_SIZE * 2
    const bounds = { width: 1000, height: 800 }
    const maxX = bounds.width - SPRITE_DISPLAY_SIZE
    const maxY = bounds.height - SPRITE_DISPLAY_SIZE

    it('should not modify position within valid bounds', () => {
      const position = { x: 400, y: 300 }
      const result = clampPositionToBounds(position, bounds)

      expect(result).toEqual(position)
    })

    it('should clamp negative x to 0', () => {
      const position = { x: -50, y: 300 }
      const result = clampPositionToBounds(position, bounds)

      expect(result.x).toBe(0)
      expect(result.y).toBe(300)
    })

    it('should clamp negative y to 0', () => {
      const position = { x: 400, y: -100 }
      const result = clampPositionToBounds(position, bounds)

      expect(result.x).toBe(400)
      expect(result.y).toBe(0)
    })

    it('should clamp x exceeding max boundary', () => {
      const position = { x: 1000, y: 300 }
      const result = clampPositionToBounds(position, bounds)

      expect(result.x).toBe(maxX)
      expect(result.y).toBe(300)
    })

    it('should clamp y exceeding max boundary', () => {
      const position = { x: 400, y: 900 }
      const result = clampPositionToBounds(position, bounds)

      expect(result.x).toBe(400)
      expect(result.y).toBe(maxY)
    })

    it('should clamp both x and y when both exceed bounds', () => {
      const position = { x: -10, y: 1000 }
      const result = clampPositionToBounds(position, bounds)

      expect(result.x).toBe(0)
      expect(result.y).toBe(maxY)
    })
  })
})
