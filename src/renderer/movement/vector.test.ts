import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateDirection,
  normalizeVector,
  scaleVector,
  generateRandomSpeed,
  calculateVelocity,
} from './vector'
import { MOVE_SPEED_RANGE } from '../../shared/constants'

describe('vector', () => {
  describe('calculateDirection', () => {
    it('should calculate positive direction vector', () => {
      const from = { x: 0, y: 0 }
      const to = { x: 10, y: 5 }

      const result = calculateDirection(from, to)

      expect(result).toEqual({ dx: 10, dy: 5 })
    })

    it('should calculate negative direction vector', () => {
      const from = { x: 10, y: 10 }
      const to = { x: 5, y: 3 }

      const result = calculateDirection(from, to)

      expect(result).toEqual({ dx: -5, dy: -7 })
    })

    it('should return zero vector when positions are equal', () => {
      const from = { x: 5, y: 5 }
      const to = { x: 5, y: 5 }

      const result = calculateDirection(from, to)

      expect(result).toEqual({ dx: 0, dy: 0 })
    })
  })

  describe('normalizeVector', () => {
    it('should normalize vector to unit length', () => {
      const vector = { dx: 3, dy: 4 } // magnitude = 5

      const result = normalizeVector(vector)

      expect(result.dx).toBeCloseTo(0.6)
      expect(result.dy).toBeCloseTo(0.8)
      const magnitude = Math.sqrt(result.dx ** 2 + result.dy ** 2)
      expect(magnitude).toBeCloseTo(1)
    })

    it('should handle zero vector without division by zero', () => {
      const vector = { dx: 0, dy: 0 }

      const result = normalizeVector(vector)

      expect(result).toEqual({ dx: 0, dy: 0 })
    })

    it('should preserve direction for diagonal vectors', () => {
      const vector = { dx: 1, dy: 1 }

      const result = normalizeVector(vector)

      expect(result.dx).toBeCloseTo(0.7071, 4)
      expect(result.dy).toBeCloseTo(0.7071, 4)
    })
  })

  describe('scaleVector', () => {
    it('should scale vector by positive number', () => {
      const vector = { dx: 2, dy: 3 }
      const scale = 2.5

      const result = scaleVector(vector, scale)

      expect(result).toEqual({ dx: 5, dy: 7.5 })
    })

    it('should scale vector by zero', () => {
      const vector = { dx: 10, dy: 20 }
      const scale = 0

      const result = scaleVector(vector, scale)

      expect(result).toEqual({ dx: 0, dy: 0 })
    })

    it('should scale vector by negative number', () => {
      const vector = { dx: 4, dy: 2 }
      const scale = -1

      const result = scaleVector(vector, scale)

      expect(result).toEqual({ dx: -4, dy: -2 })
    })
  })

  describe('generateRandomSpeed', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random')
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should generate minimum speed when random = 0', () => {
      vi.mocked(Math.random).mockReturnValue(0)

      const result = generateRandomSpeed()

      expect(result).toBe(MOVE_SPEED_RANGE.min)
    })

    it('should generate maximum speed when random = 1', () => {
      vi.mocked(Math.random).mockReturnValue(1)

      const result = generateRandomSpeed()

      expect(result).toBe(MOVE_SPEED_RANGE.max)
    })

    it('should generate mid-range speed when random = 0.5', () => {
      vi.mocked(Math.random).mockReturnValue(0.5)

      const result = generateRandomSpeed()

      const expected = (MOVE_SPEED_RANGE.min + MOVE_SPEED_RANGE.max) / 2
      expect(result).toBe(expected)
    })
  })

  describe('calculateVelocity', () => {
    it('should calculate velocity with direction and speed', () => {
      const from = { x: 0, y: 0 }
      const to = { x: 3, y: 4 } // magnitude = 5
      const speed = 5

      const result = calculateVelocity(from, to, speed)

      // Normalized (3,4) with magnitude 5 = (0.6, 0.8)
      // Scaled by speed 5 = (3, 4)
      expect(result.dx).toBeCloseTo(3)
      expect(result.dy).toBeCloseTo(4)
    })

    it('should handle zero speed', () => {
      const from = { x: 0, y: 0 }
      const to = { x: 10, y: 10 }
      const speed = 0

      const result = calculateVelocity(from, to, speed)

      expect(result).toEqual({ dx: 0, dy: 0 })
    })

    it('should handle same position (zero direction)', () => {
      const from = { x: 5, y: 5 }
      const to = { x: 5, y: 5 }
      const speed = 3

      const result = calculateVelocity(from, to, speed)

      expect(result).toEqual({ dx: 0, dy: 0 })
    })

    it('should calculate velocity with different speed', () => {
      const from = { x: 0, y: 0 }
      const to = { x: 1, y: 0 } // horizontal direction
      const speed = 2.5

      const result = calculateVelocity(from, to, speed)

      expect(result.dx).toBeCloseTo(2.5)
      expect(result.dy).toBeCloseTo(0)
    })
  })
})
