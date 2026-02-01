import { type Bounds, clampPositionToBounds } from './target'
import { type FacingDirection, type MovementState, type Position } from './types'
import { calculateVelocity } from './vector'

export function updateMovement(
  movement: MovementState,
  deltaMs: number,
  bounds: Bounds,
): MovementState {
  const { position, target, speed } = movement

  // 타겟이 없으면 이동하지 않음
  if (target === null) {
    return movement
  }

  const dx = target.x - position.x
  const dy = target.y - position.y
  const distanceToTarget = Math.sqrt(dx ** 2 + dy ** 2)

  // 방향 결정
  const facing: FacingDirection = dx < 0 ? 'left' : dx > 0 ? 'right' : movement.facing

  // 타겟 도달 판정 (speed 기준)
  if (distanceToTarget < speed) {
    return {
      ...movement,
      position: target,
      target: null,
      facing,
    }
  }

  // 이동 계산 (deltaMs를 프레임 단위로 변환: 60fps 기준)
  const frameRatio = deltaMs / (1000 / 60)
  const velocity = calculateVelocity(position, target, speed * frameRatio)

  const nextPosition: Position = {
    x: position.x + velocity.dx,
    y: position.y + velocity.dy,
  }

  const clampedPosition = clampPositionToBounds(nextPosition, bounds)

  return {
    ...movement,
    position: clampedPosition,
    facing,
  }
}

export function stopMovement(movement: MovementState): MovementState {
  return {
    ...movement,
    target: null,
  }
}

export function startMovement(movement: MovementState, target: Position, speed: number): MovementState {
  return {
    ...movement,
    target,
    speed,
  }
}
