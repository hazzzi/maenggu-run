import { useEffect, useRef } from 'react'

import { type Position } from '../../shared/types'
import { calculateVelocity, generateRandomSpeed } from '../movement/vector'

type UseMovementProps = {
  readonly isWalking: boolean
  readonly currentPosition: Position
  readonly targetPosition: Position | null
  readonly onPositionUpdate: (position: Position) => void
  readonly onTargetReached: () => void
}

export function useMovement({
  isWalking,
  currentPosition,
  targetPosition,
  onPositionUpdate,
  onTargetReached,
}: UseMovementProps): void {
  const rafIdRef = useRef<number | null>(null)
  const speedRef = useRef<number>(generateRandomSpeed())

  useEffect(() => {
    if (!isWalking || !targetPosition) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      return
    }

    speedRef.current = generateRandomSpeed()

    const updatePosition = () => {
      if (!targetPosition) return

      const dx = targetPosition.x - currentPosition.x
      const dy = targetPosition.y - currentPosition.y
      const distanceToTarget = Math.sqrt(dx ** 2 + dy ** 2)

      if (distanceToTarget < speedRef.current) {
        onPositionUpdate(targetPosition)
        onTargetReached()
        return
      }

      const velocity = calculateVelocity(
        currentPosition,
        targetPosition,
        speedRef.current,
      )

      const nextPosition: Position = {
        x: currentPosition.x + velocity.dx,
        y: currentPosition.y + velocity.dy,
      }

      onPositionUpdate(nextPosition)
      rafIdRef.current = requestAnimationFrame(updatePosition)
    }

    rafIdRef.current = requestAnimationFrame(updatePosition)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [isWalking, currentPosition, targetPosition, onPositionUpdate, onTargetReached])
}
