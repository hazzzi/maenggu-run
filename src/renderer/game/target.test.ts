import { describe, expect, it } from 'vitest';

import { type MonitorRect } from '../../shared/types';
import { SPRITE_DISPLAY_SIZE } from './constants';
import {
  type Bounds,
  clampPositionToBounds,
  generateRandomTarget,
  isPositionInBounds,
} from './target';

describe('generateRandomTarget', () => {
  it('should generate position within bounds (single screen)', () => {
    const bounds: Bounds = { kind: 'single', width: 800, height: 600 };

    for (let i = 0; i < 100; i++) {
      const target = generateRandomTarget(bounds);

      expect(target.x).toBeGreaterThanOrEqual(0);
      expect(target.x).toBeLessThanOrEqual(bounds.width - SPRITE_DISPLAY_SIZE);
      expect(target.y).toBeGreaterThanOrEqual(0);
      expect(target.y).toBeLessThanOrEqual(bounds.height - SPRITE_DISPLAY_SIZE);
    }
  });

  it('should generate position within a monitor rect, not in dead zones', () => {
    const monitorRects: MonitorRect[] = [
      { x: 0, y: 0, width: 1280, height: 800 },
      { x: 1280, y: 0, width: 1920, height: 1080 },
    ];
    const bounds: Bounds = { kind: 'multi', monitorRects };

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
    const bounds: Bounds = { kind: 'multi', monitorRects };

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
  const bounds: Bounds = { kind: 'single', width: 800, height: 600 };

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
    expect(result.x).toBe(800 - SPRITE_DISPLAY_SIZE);
  });

  it('should clamp y exceeding bounds', () => {
    const result = clampPositionToBounds({ x: 100, y: 700 }, bounds);
    expect(result.y).toBe(600 - SPRITE_DISPLAY_SIZE);
  });

  describe('with staggered monitor rects', () => {
    const staggeredRects: MonitorRect[] = [
      { x: 0, y: 0, width: 1280, height: 800 },
      { x: 1280, y: 200, width: 1920, height: 1080 },
      { x: 3200, y: 400, width: 1440, height: 900 },
    ];
    const staggeredBounds: Bounds = {
      kind: 'multi',
      monitorRects: staggeredRects,
    };

    it('should not change position inside a monitor', () => {
      const pos = { x: 100, y: 100 };
      expect(clampPositionToBounds(pos, staggeredBounds)).toEqual(pos);
    });

    it('should not change position inside second monitor', () => {
      const pos = { x: 1500, y: 300 };
      expect(clampPositionToBounds(pos, staggeredBounds)).toEqual(pos);
    });

    it('should clamp dead zone position to nearest monitor', () => {
      const result = clampPositionToBounds(
        { x: 1400, y: 150 },
        staggeredBounds,
      );
      expect(result.x).toBe(1400);
      expect(result.y).toBe(200);
    });

    it('should clamp position far outside to nearest monitor edge', () => {
      const result = clampPositionToBounds(
        { x: 5000, y: 500 },
        staggeredBounds,
      );
      expect(result.x).toBe(3200 + 1440 - SPRITE_DISPLAY_SIZE);
      expect(result.y).toBe(500);
    });

    it('should allow seamless transition between vertically adjacent monitors', () => {
      const halfSprite = SPRITE_DISPLAY_SIZE / 2;
      const justInM1 = { x: 100, y: 800 - halfSprite - 1 };
      expect(clampPositionToBounds(justInM1, staggeredBounds)).toEqual(
        justInM1,
      );
    });
  });
});

describe('isPositionInBounds', () => {
  const bounds: Bounds = { kind: 'single', width: 800, height: 600 };

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

  describe('with staggered monitor rects', () => {
    const staggeredRects: MonitorRect[] = [
      { x: 0, y: 0, width: 1280, height: 800 },
      { x: 1280, y: 200, width: 1920, height: 1080 },
    ];
    const staggeredBounds: Bounds = {
      kind: 'multi',
      monitorRects: staggeredRects,
    };

    it('should return true for position inside first monitor', () => {
      expect(isPositionInBounds({ x: 100, y: 100 }, staggeredBounds)).toBe(
        true,
      );
    });

    it('should return true for position inside second monitor', () => {
      expect(isPositionInBounds({ x: 1500, y: 300 }, staggeredBounds)).toBe(
        true,
      );
    });

    it('should return false for position in dead zone', () => {
      expect(isPositionInBounds({ x: 1400, y: 0 }, staggeredBounds)).toBe(
        false,
      );
    });

    it('should return false for position below first monitor but left of second', () => {
      expect(isPositionInBounds({ x: 100, y: 850 }, staggeredBounds)).toBe(
        false,
      );
    });
  });
});
