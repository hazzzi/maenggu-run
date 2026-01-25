import { useCallback, useState } from 'react'

import { type FacingDirection, type MaengguState, type Position } from '../../shared/types'
import {
  type AnimationEvent,
  getNextAnimationState,
} from '../animation/state-machine'

type MaengguStateData = {
  readonly animState: MaengguState
  readonly position: Position
  readonly moveTarget: Position | null
  readonly facing: FacingDirection
}

type MaengguStateActions = {
  readonly dispatchAnimEvent: (event: AnimationEvent) => void
  readonly setPosition: (position: Position) => void
  readonly setMoveTarget: (target: Position | null) => void
  readonly setFacing: (direction: FacingDirection) => void
}

type UseMaengguStateReturn = MaengguStateData & MaengguStateActions

function getInitialPosition(): Position {
  return {
    x: Math.floor(window.innerWidth / 2),
    y: Math.floor(window.innerHeight / 2),
  }
}

export function useMaengguState(): UseMaengguStateReturn {
  const [animState, setAnimState] = useState<MaengguState>('idle')
  const [position, setPosition] = useState<Position>(getInitialPosition)
  const [moveTarget, setMoveTarget] = useState<Position | null>(null)
  const [facing, setFacing] = useState<FacingDirection>('right')

  const dispatchAnimEvent = useCallback(
    (event: AnimationEvent) => {
      setAnimState((current) => getNextAnimationState(current, event))
    },
    [],
  )

  return {
    animState,
    position,
    moveTarget,
    facing,
    dispatchAnimEvent,
    setPosition,
    setMoveTarget,
    setFacing,
  }
}
