import { describe, expect, it } from 'vitest';

import {
  calculateDirection,
  calculateVelocity,
  normalizeVector,
  scaleVector,
} from './vector';

describe('calculateDirection', () => {
  it('should calculate direction from origin to positive point', () => {
    const result = calculateDirection({ x: 0, y: 0 }, { x: 10, y: 5 });
    expect(result).toEqual({ dx: 10, dy: 5 });
  });

  it('should calculate direction with negative values', () => {
    const result = calculateDirection({ x: 5, y: 5 }, { x: 0, y: 0 });
    expect(result).toEqual({ dx: -5, dy: -5 });
  });

  it('should return zero vector for same position', () => {
    const result = calculateDirection({ x: 3, y: 3 }, { x: 3, y: 3 });
    expect(result).toEqual({ dx: 0, dy: 0 });
  });
});

describe('normalizeVector', () => {
  it('should normalize a vector to unit length', () => {
    const result = normalizeVector({ dx: 3, dy: 4 });
    expect(result.dx).toBeCloseTo(0.6);
    expect(result.dy).toBeCloseTo(0.8);
  });

  it('should handle zero vector', () => {
    const result = normalizeVector({ dx: 0, dy: 0 });
    expect(result).toEqual({ dx: 0, dy: 0 });
  });

  it('should handle horizontal vector', () => {
    const result = normalizeVector({ dx: 10, dy: 0 });
    expect(result.dx).toBeCloseTo(1);
    expect(result.dy).toBeCloseTo(0);
  });

  it('should handle vertical vector', () => {
    const result = normalizeVector({ dx: 0, dy: -5 });
    expect(result.dx).toBeCloseTo(0);
    expect(result.dy).toBeCloseTo(-1);
  });
});

describe('scaleVector', () => {
  it('should scale a vector by given factor', () => {
    const result = scaleVector({ dx: 2, dy: 3 }, 4);
    expect(result).toEqual({ dx: 8, dy: 12 });
  });

  it('should handle zero scale', () => {
    const result = scaleVector({ dx: 5, dy: 10 }, 0);
    expect(result).toEqual({ dx: 0, dy: 0 });
  });

  it('should handle negative scale', () => {
    const result = scaleVector({ dx: 2, dy: 3 }, -2);
    expect(result).toEqual({ dx: -4, dy: -6 });
  });
});

describe('calculateVelocity', () => {
  it('should calculate velocity towards target', () => {
    const result = calculateVelocity({ x: 0, y: 0 }, { x: 3, y: 4 }, 5);
    expect(result.dx).toBeCloseTo(3);
    expect(result.dy).toBeCloseTo(4);
  });

  it('should return zero velocity for same position', () => {
    const result = calculateVelocity({ x: 5, y: 5 }, { x: 5, y: 5 }, 10);
    expect(result).toEqual({ dx: 0, dy: 0 });
  });
});
