import { forwardRef, useMemo } from 'react'

import { SPRITE_DISPLAY_SCALE, SPRITE_SIZE } from '../game/constants'
import { getSpriteFrameUrls } from '../game/sprite-loader'
import { type AnimState, type FacingDirection, type Position } from '../game/types'

type MaengguProps = {
  readonly animState: AnimState
  readonly position: Position
  readonly facing: FacingDirection
  readonly frameIndex?: number
  readonly scale?: number
  readonly onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void
  readonly onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const DISPLAY_SCALE = SPRITE_DISPLAY_SCALE

export const Maenggu = forwardRef<HTMLDivElement, MaengguProps>(
  function Maenggu(
    { animState, position, facing, frameIndex = 0, scale = DISPLAY_SCALE, onPointerDown, onContextMenu },
    ref,
  ) {
    const spriteUrls = useMemo(() => getSpriteFrameUrls('/'), [])

    const frames = spriteUrls[animState]
    const currentFrame = frames[frameIndex % frames.length]

    const displaySize = SPRITE_SIZE * scale
    // 정수 좌표로 반올림하여 subpixel rendering 방지
    const left = Math.round(position.x - displaySize / 2)
    const top = Math.round(position.y - displaySize / 2)

    return (
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onContextMenu={onContextMenu}
        style={{
          position: 'absolute',
          left,
          top,
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
            // 픽셀 아트 crisp rendering
            imageRendering: 'pixelated',
            // Firefox 호환
            // @ts-expect-error - Firefox specific property
            MozCrispEdges: 'crisp-edges',
            // subpixel 위치 방지
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            // GPU 렌더링으로 일관성 확보
            willChange: 'transform',
          }}
        />
      </div>
    )
  },
)
