import { type MonitorRect } from '../../shared/types';
import { SPRITE_DISPLAY_SIZE } from './constants';
import { type Position } from './types';

export type Bounds = {
  readonly width: number;
  readonly height: number;
  readonly monitorRects?: readonly MonitorRect[];
};

/** 스프라이트 중심점이 모니터 rect 안에 있는지 판정 */
function isInMonitorRect(position: Position, rect: MonitorRect): boolean {
  const cx = position.x + SPRITE_DISPLAY_SIZE / 2;
  const cy = position.y + SPRITE_DISPLAY_SIZE / 2;
  return (
    cx >= rect.x &&
    cx < rect.x + rect.width &&
    cy >= rect.y &&
    cy < rect.y + rect.height
  );
}

/** 위치를 특정 모니터 rect 안으로 클램핑 */
function clampToRect(position: Position, rect: MonitorRect): Position {
  const maxX = rect.x + rect.width - SPRITE_DISPLAY_SIZE;
  const maxY = rect.y + rect.height - SPRITE_DISPLAY_SIZE;
  return {
    x: Math.max(rect.x, Math.min(position.x, maxX)),
    y: Math.max(rect.y, Math.min(position.y, maxY)),
  };
}

/** position에서 rect까지의 최단 거리 (rect 내부면 0) */
function distanceToRect(position: Position, rect: MonitorRect): number {
  const cx = Math.max(rect.x, Math.min(position.x, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(position.y, rect.y + rect.height));
  const dx = position.x - cx;
  const dy = position.y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

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
  if (bounds.monitorRects && bounds.monitorRects.length > 0) {
    // 이미 어떤 모니터 안에 있으면 그대로 반환
    for (const rect of bounds.monitorRects) {
      if (isInMonitorRect(position, rect)) {
        return position;
      }
    }

    // 가장 가까운 모니터로 클램핑
    let nearest = bounds.monitorRects[0];
    let minDist = distanceToRect(position, nearest);
    for (let i = 1; i < bounds.monitorRects.length; i++) {
      const d = distanceToRect(position, bounds.monitorRects[i]);
      if (d < minDist) {
        minDist = d;
        nearest = bounds.monitorRects[i];
      }
    }
    return clampToRect(position, nearest);
  }

  // 폴백: 전체 bounds 사용
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
  if (bounds.monitorRects && bounds.monitorRects.length > 0) {
    return bounds.monitorRects.some((rect) => isInMonitorRect(position, rect));
  }

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
