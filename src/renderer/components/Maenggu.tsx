import { forwardRef, useMemo } from 'react'

import { SPRITE_SIZE } from '../../shared/constants'
import {
  type FacingDirection,
  type MaengguState,
  type Position,
} from '../../shared/types'
import { getSpriteFrameUrls, type SpriteState } from '../animation/sprite-loader'

type MaengguProps = {
  readonly animState: MaengguState
  readonly position: Position
  readonly facing: FacingDirection
  readonly frameIndex?: number
  readonly scale?: number
  readonly onPointerDown?: () => void
}

const DISPLAY_SCALE = 2

function stateToSpriteState(state: MaengguState): SpriteState {
  return state
}

export const Maenggu = forwardRef<HTMLDivElement, MaengguProps>(
  function Maenggu(
    { animState, position, facing, frameIndex = 0, scale = DISPLAY_SCALE, onPointerDown },
    ref,
  ) {
    const spriteUrls = useMemo(() => getSpriteFrameUrls('/'), [])

    const spriteState = stateToSpriteState(animState)
    const frames = spriteUrls[spriteState]
    const currentFrame = frames[frameIndex % frames.length]

    const displaySize = SPRITE_SIZE * scale

    return (
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        style={{
          position: 'absolute',
          left: position.x - displaySize / 2,
          top: position.y - displaySize / 2,
          width: displaySize,
          height: displaySize,
          pointerEvents: 'auto',
          cursor: onPointerDown ? 'pointer' : 'default',
        }}
      >
        <img
          src={currentFrame}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
      </div>
    )
  },
)
