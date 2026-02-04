import { type Bounds, clampPositionToBounds } from './target'
import { type FacingDirection, type MovementState, type MovementTarget, type Position } from './types'
import { calculateVelocity } from './vector'

export type MovementUpdateResult = {
  readonly state: MovementState
  readonly reachedTarget: MovementTarget | null
}

export function updateMovement(
  movement: MovementState,
  deltaMs: number,
  bounds: Bounds,
): MovementUpdateResult {
  const { position, target, speed } = movement

  // 타겟이 없으면 이동하지 않음
  if (target === null) {
    return { state: movement, reachedTarget: null }
  }

  const targetPos = target.position
  const dx = targetPos.x - position.x
  const dy = targetPos.y - position.y
  const distanceToTarget = Math.sqrt(dx ** 2 + dy ** 2)

  // 방향 결정
  const facing: FacingDirection = dx < 0 ? 'left' : dx > 0 ? 'right' : movement.facing

  // 타겟 도달 판정 (speed 기준)
  if (distanceToTarget < speed) {
    return {
      state: {
        ...movement,
        position: targetPos,
        target: null,
        facing,
      },
      reachedTarget: target,
    }
  }

  // 이동 계산 (deltaMs를 프레임 단위로 변환: 60fps 기준)
  const frameRatio = deltaMs / (1000 / 60)
  const velocity = calculateVelocity(position, targetPos, speed * frameRatio)

  const nextPosition: Position = {
    x: position.x + velocity.dx,
    y: position.y + velocity.dy,
  }

  const clampedPosition = clampPositionToBounds(nextPosition, bounds)

  return {
    state: {
      ...movement,
      position: clampedPosition,
      facing,
    },
    reachedTarget: null,
  }
}

export function stopMovement(movement: MovementState): MovementState {
  return {
    ...movement,
    target: null,
  }
}

export function startMovement(movement: MovementState, target: MovementTarget, speed: number): MovementState {
  return {
    ...movement,
    target,
    speed,
  }
}
