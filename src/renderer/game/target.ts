import { type MonitorRect } from '../../shared/types';
import { SPRITE_DISPLAY_SIZE } from './constants';
import { type Position } from './types';

export type Bounds = {
  readonly width: number;
  readonly height: number;
  readonly monitorRects?: readonly MonitorRect[];
};

export function generateRandomTarget(bounds: Bounds): Position {
  if (bounds.monitorRects && bounds.monitorRects.length > 0) {
    const rects = bounds.monitorRects;

    // 넓이 비례로 모니터 선택 (큰 모니터에 더 자주 가도록)
    const totalArea = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    let pick = Math.random() * totalArea;
    let chosen = rects[0];
    for (const rect of rects) {
      pick -= rect.width * rect.height;
      if (pick <= 0) {
        chosen = rect;
        break;
      }
    }

    const maxX = chosen.x + chosen.width - SPRITE_DISPLAY_SIZE;
    const maxY = chosen.y + chosen.height - SPRITE_DISPLAY_SIZE;
    const rangeX = Math.max(0, maxX - chosen.x);
    const rangeY = Math.max(0, maxY - chosen.y);

    return {
      x: Math.floor(chosen.x + Math.random() * rangeX),
      y: Math.floor(chosen.y + Math.random() * rangeY),
    };
  }

  // 폴백: 전체 bounds 사용 (모니터 정보 없을 때)
  const maxX = bounds.width - SPRITE_DISPLAY_SIZE;
  const maxY = bounds.height - SPRITE_DISPLAY_SIZE;

  return {
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
  };
}

export function clampPositionToBounds(
  position: Position,
  bounds: Bounds,
): Position {
  const maxX = bounds.width - SPRITE_DISPLAY_SIZE;
  const maxY = bounds.height - SPRITE_DISPLAY_SIZE;

  return {
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY)),
  };
}

export function isPositionInBounds(
  position: Position,
  bounds: Bounds,
): boolean {
  return (
    position.x >= 0 &&
    position.x <= bounds.width &&
    position.y >= 0 &&
    position.y <= bounds.height
  );
}

export function getWindowBounds(): Bounds {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
