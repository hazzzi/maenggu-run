import { forwardRef } from 'react';

import { type SpritePack } from '../../shared/types';
import { SPRITE_DISPLAY_SCALE, SPRITE_SIZE } from '../game/constants';
import { getFrameUrls } from '../game/sprite-pack';
import {
  type AnimState,
  type FacingDirection,
  type Position,
} from '../game/types';

type MaengguProps = {
  readonly animState: AnimState;
  readonly position: Position;
  readonly facing: FacingDirection;
  readonly frameIndex?: number;
  readonly scale?: number;
  readonly spritePack: SpritePack;
  readonly onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  readonly onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const DISPLAY_SCALE = SPRITE_DISPLAY_SCALE;

export const Maenggu = forwardRef<HTMLDivElement, MaengguProps>(
  function Maenggu(
    {
      animState,
      position,
      facing,
      frameIndex = 0,
      scale = DISPLAY_SCALE,
      spritePack,
      onPointerDown,
      onContextMenu,
    },
    ref,
  ) {
    const frames = getFrameUrls(spritePack, animState);
    const currentFrame = frames[frameIndex % frames.length];

    const displaySize = SPRITE_SIZE * scale;

    return (
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onContextMenu={onContextMenu}
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
    );
  },
);
