import { type Position } from '../../shared/types'

type Bounds = {
  readonly width: number
  readonly height: number
}

export function generateRandomTarget(bounds: Bounds): Position {
  const x = Math.floor(Math.random() * bounds.width)
  const y = Math.floor(Math.random() * bounds.height)

  return { x, y }
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
