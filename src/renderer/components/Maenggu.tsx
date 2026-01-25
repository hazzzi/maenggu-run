import { forwardRef, useMemo } from 'react'

import { SPRITE_SIZE } from '../../shared/constants'
import { type MaengguState, type Position } from '../../shared/types'
import { getSpriteFrameUrls, type SpriteState } from '../animation/sprite-loader'

type MaengguProps = {
  readonly animState: MaengguState
  readonly position: Position
  readonly frameIndex?: number
  readonly scale?: number
  readonly onClick?: () => void
  readonly onContextMenu?: (event: React.MouseEvent) => void
}

const DISPLAY_SCALE = 2

function stateToSpriteState(state: MaengguState): SpriteState {
  return state
}

export const Maenggu = forwardRef<HTMLDivElement, MaengguProps>(
  function Maenggu(
    { animState, position, frameIndex = 0, scale = DISPLAY_SCALE, onClick, onContextMenu },
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
        onClick={onClick}
        onContextMenu={onContextMenu}
        style={{
          position: 'absolute',
          left: position.x - displaySize / 2,
          top: position.y - displaySize / 2,
          width: displaySize,
          height: displaySize,
          pointerEvents: 'auto',
          cursor: onClick ? 'pointer' : 'default',
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
          }}
        />
      </div>
    )
  },
)
