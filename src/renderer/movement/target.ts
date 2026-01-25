import { type Position } from '../../shared/types'
import { SPRITE_SIZE } from '../../shared/constants'

type Bounds = {
  readonly width: number
  readonly height: number
}

const SPRITE_DISPLAY_SIZE = SPRITE_SIZE * 2

export function generateRandomTarget(bounds: Bounds): Position {
  const maxX = bounds.width - SPRITE_DISPLAY_SIZE
  const maxY = bounds.height - SPRITE_DISPLAY_SIZE

  const x = Math.floor(Math.random() * maxX)
  const y = Math.floor(Math.random() * maxY)

  return { x, y }
}

export function clampPositionToBounds(position: Position, bounds: Bounds): Position {
  const maxX = bounds.width - SPRITE_DISPLAY_SIZE
  const maxY = bounds.height - SPRITE_DISPLAY_SIZE

  return {
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY)),
  }
}

export function isPositionInBounds(position: Position, bounds: Bounds): boolean {
  return (
    position.x >= 0 &&
    position.x <= bounds.width &&
    position.y >= 0 &&
    position.y <= bounds.height
  )
}

export function getWindowBounds(): Bounds {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}
