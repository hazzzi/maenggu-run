import { describe, expect, it } from 'vitest';

import { type MonitorRect } from '../../shared/types';
import { SPRITE_DISPLAY_SIZE } from './constants';
import {
  clampPositionToBounds,
  generateRandomTarget,
  isPositionInBounds,
} from './target';

describe('generateRandomTarget', () => {
  it('should generate position within bounds (no monitor rects)', () => {
    const bounds = { width: 800, height: 600 };

    for (let i = 0; i < 100; i++) {
      const target = generateRandomTarget(bounds);

      expect(target.x).toBeGreaterThanOrEqual(0);
      expect(target.x).toBeLessThanOrEqual(bounds.width - SPRITE_DISPLAY_SIZE);
      expect(target.y).toBeGreaterThanOrEqual(0);
      expect(target.y).toBeLessThanOrEqual(bounds.height - SPRITE_DISPLAY_SIZE);
    }
  });

  it('should generate position within a monitor rect, not in dead zones', () => {
    // 두 모니터: 왼쪽(0,0,1280x800), 오른쪽(1280,0,1920x1080)
    // dead zone: x>=1280 && y>800 (오른쪽 모니터 하단 영역)
    const monitorRects: MonitorRect[] = [
      { x: 0, y: 0, width: 1280, height: 800 },
      { x: 1280, y: 0, width: 1920, height: 1080 },
    ];
    const bounds = { width: 3200, height: 1080, monitorRects };

    for (let i = 0; i < 200; i++) {
      const target = generateRandomTarget(bounds);

      const inFirstMonitor =
        target.x >= 0 &&
        target.x <= 1280 - SPRITE_DISPLAY_SIZE &&
        target.y >= 0 &&
        target.y <= 800 - SPRITE_DISPLAY_SIZE;
      const inSecondMonitor =
        target.x >= 1280 &&
        target.x <= 3200 - SPRITE_DISPLAY_SIZE &&
        target.y >= 0 &&
        target.y <= 1080 - SPRITE_DISPLAY_SIZE;

      expect(inFirstMonitor || inSecondMonitor).toBe(true);
    }
  });

  it('should generate position within a single monitor rect', () => {
    const monitorRects: MonitorRect[] = [
      { x: 100, y: 50, width: 800, height: 600 },
    ];
    const bounds = { width: 1000, height: 700, monitorRects };

    for (let i = 0; i < 100; i++) {
      const target = generateRandomTarget(bounds);

      expect(target.x).toBeGreaterThanOrEqual(100);
      expect(target.x).toBeLessThanOrEqual(100 + 800 - SPRITE_DISPLAY_SIZE);
      expect(target.y).toBeGreaterThanOrEqual(50);
      expect(target.y).toBeLessThanOrEqual(50 + 600 - SPRITE_DISPLAY_SIZE);
    }
  });
});

describe('clampPositionToBounds', () => {
  const bounds = { width: 800, height: 600 };

  it('should not change position within bounds', () => {
    const position = { x: 100, y: 100 };
    const result = clampPositionToBounds(position, bounds);
    expect(result).toEqual(position);
  });

  it('should clamp negative x to 0', () => {
    const result = clampPositionToBounds({ x: -50, y: 100 }, bounds);
    expect(result.x).toBe(0);
  });

  it('should clamp negative y to 0', () => {
    const result = clampPositionToBounds({ x: 100, y: -50 }, bounds);
    expect(result.y).toBe(0);
  });

  it('should clamp x exceeding bounds', () => {
    const result = clampPositionToBounds({ x: 900, y: 100 }, bounds);
    expect(result.x).toBe(bounds.width - SPRITE_DISPLAY_SIZE);
  });

  it('should clamp y exceeding bounds', () => {
    const result = clampPositionToBounds({ x: 100, y: 700 }, bounds);
    expect(result.y).toBe(bounds.height - SPRITE_DISPLAY_SIZE);
  });
});

describe('isPositionInBounds', () => {
  const bounds = { width: 800, height: 600 };

  it('should return true for position inside bounds', () => {
    expect(isPositionInBounds({ x: 100, y: 100 }, bounds)).toBe(true);
  });

  it('should return true for position at origin', () => {
    expect(isPositionInBounds({ x: 0, y: 0 }, bounds)).toBe(true);
  });

  it('should return true for position at edge', () => {
    expect(isPositionInBounds({ x: 800, y: 600 }, bounds)).toBe(true);
  });

  it('should return false for negative x', () => {
    expect(isPositionInBounds({ x: -1, y: 100 }, bounds)).toBe(false);
  });

  it('should return false for negative y', () => {
    expect(isPositionInBounds({ x: 100, y: -1 }, bounds)).toBe(false);
  });

  it('should return false for x exceeding bounds', () => {
    expect(isPositionInBounds({ x: 801, y: 100 }, bounds)).toBe(false);
  });
});
