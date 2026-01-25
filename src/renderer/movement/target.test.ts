import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  generateRandomTarget,
  isPositionInBounds,
  getWindowBounds,
} from './target'

describe('target', () => {
  describe('generateRandomTarget', () => {
    it('should generate position within bounds', () => {
      const bounds = { width: 1000, height: 800 }

      for (let i = 0; i < 100; i++) {
        const target = generateRandomTarget(bounds)

        expect(target.x).toBeGreaterThanOrEqual(0)
        expect(target.x).toBeLessThanOrEqual(bounds.width)
        expect(target.y).toBeGreaterThanOrEqual(0)
        expect(target.y).toBeLessThanOrEqual(bounds.height)
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
})
