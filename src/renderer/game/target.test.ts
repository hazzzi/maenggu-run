import { describe, expect, it } from 'vitest';

import { SPRITE_DISPLAY_SIZE } from './constants';
import {
  clampPositionToBounds,
  generateRandomTarget,
  isPositionInBounds,
} from './target';

describe('generateRandomTarget', () => {
  it('should generate position within bounds', () => {
    const bounds = { width: 800, height: 600 };

    for (let i = 0; i < 100; i++) {
      const target = generateRandomTarget(bounds);

      expect(target.x).toBeGreaterThanOrEqual(0);
      expect(target.x).toBeLessThanOrEqual(bounds.width - SPRITE_DISPLAY_SIZE);
      expect(target.y).toBeGreaterThanOrEqual(0);
      expect(target.y).toBeLessThanOrEqual(bounds.height - SPRITE_DISPLAY_SIZE);
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
