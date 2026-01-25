import { type Position } from '../../shared/types'
import { MOVE_SPEED_RANGE } from '../../shared/constants'

export type Vector = {
  readonly dx: number
  readonly dy: number
}

export function calculateDirection(from: Position, to: Position): Vector {
  const dx = to.x - from.x
  const dy = to.y - from.y

  return { dx, dy }
}

export function normalizeVector(vector: Vector): Vector {
  const magnitude = Math.sqrt(vector.dx ** 2 + vector.dy ** 2)

  if (magnitude === 0) {
    return { dx: 0, dy: 0 }
  }

  return {
    dx: vector.dx / magnitude,
    dy: vector.dy / magnitude,
  }
}

export function scaleVector(vector: Vector, scale: number): Vector {
  return {
    dx: vector.dx * scale,
    dy: vector.dy * scale,
  }
}

export function generateRandomSpeed(): number {
  const { min, max } = MOVE_SPEED_RANGE
  return Math.random() * (max - min) + min
}

export function calculateVelocity(from: Position, to: Position, speed: number): Vector {
  const direction = calculateDirection(from, to)
  const normalized = normalizeVector(direction)
  return scaleVector(normalized, speed)
}
