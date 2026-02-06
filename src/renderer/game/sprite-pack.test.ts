import { describe, expect, it } from 'vitest';

import type { SpriteManifest, SpritePack } from '../../shared/types';
import {
  getFrameCount,
  getFrameUrls,
  getStateConfig,
  isLoopingState,
} from './sprite-pack';

const mockManifest: SpriteManifest = {
  name: 'Test Pack',
  version: 1,
  frameSize: 32,
  states: {
    idle: { frames: ['idle/01.png'], loop: true },
    walk: { frames: ['walk/01.png', 'walk/02.png', 'walk/03.png'], loop: true },
    eat: { frames: ['eat/01.png', 'eat/02.png'], loop: false },
    happy: { frames: ['happy/01.png'], loop: false },
  },
  fallback: 'idle',
};

const mockPack: SpritePack = {
  manifest: mockManifest,
  basePath: '/sprites/test/',
};

describe('getFrameUrls', () => {
  it('should return frame URLs for existing state', () => {
    const urls = getFrameUrls(mockPack, 'walk');

    expect(urls).toEqual([
      '/sprites/test/walk/01.png',
      '/sprites/test/walk/02.png',
      '/sprites/test/walk/03.png',
    ]);
  });

  it('should return fallback URLs for missing state', () => {
    const urls = getFrameUrls(mockPack, 'sleep');

    expect(urls).toEqual(['/sprites/test/idle/01.png']);
  });
});

describe('getStateConfig', () => {
  it('should return config for existing state', () => {
    const config = getStateConfig(mockPack, 'eat');

    expect(config.frames).toHaveLength(2);
    expect(config.loop).toBe(false);
  });

  it('should return fallback config for missing state', () => {
    const config = getStateConfig(mockPack, 'nonexistent');

    expect(config.frames).toEqual(['idle/01.png']);
    expect(config.loop).toBe(true);
  });
});

describe('getFrameCount', () => {
  it('should return correct frame count', () => {
    expect(getFrameCount(mockPack, 'idle')).toBe(1);
    expect(getFrameCount(mockPack, 'walk')).toBe(3);
    expect(getFrameCount(mockPack, 'eat')).toBe(2);
    expect(getFrameCount(mockPack, 'happy')).toBe(1);
  });
});

describe('isLoopingState', () => {
  it('should return true for looping states', () => {
    expect(isLoopingState(mockPack, 'idle')).toBe(true);
    expect(isLoopingState(mockPack, 'walk')).toBe(true);
  });

  it('should return false for non-looping states', () => {
    expect(isLoopingState(mockPack, 'eat')).toBe(false);
    expect(isLoopingState(mockPack, 'happy')).toBe(false);
  });

  it('should return fallback loop value for missing state', () => {
    expect(isLoopingState(mockPack, 'nonexistent')).toBe(true); // fallback is idle, which loops
  });
});
