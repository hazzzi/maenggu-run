import { describe, expect, it } from 'vitest';

import { ANIMATION_FRAME_DURATION_MS } from './constants';
import { type AnimationState } from './types';
import { resetAnimation, updateAnimation } from './update-animation';

describe('updateAnimation', () => {
  describe('looping animations (idle, walk)', () => {
    it('should increment elapsed time', () => {
      const state: AnimationState = {
        state: 'idle',
        frameIndex: 0,
        elapsedMs: 0,
        isComplete: false,
      };

      const result = updateAnimation(state, 50);

      expect(result.elapsedMs).toBe(50);
      expect(result.frameIndex).toBe(0);
    });

    it('should advance frame when elapsed exceeds duration', () => {
      const state: AnimationState = {
        state: 'walk',
        frameIndex: 0,
        elapsedMs: ANIMATION_FRAME_DURATION_MS - 10,
        isComplete: false,
      };

      const result = updateAnimation(state, 20);

      expect(result.frameIndex).toBe(1);
      expect(result.elapsedMs).toBe(10);
    });

    it('should loop back to first frame', () => {
      const state: AnimationState = {
        state: 'walk',
        frameIndex: 2, // walk has 3 frames
        elapsedMs: ANIMATION_FRAME_DURATION_MS - 10,
        isComplete: false,
      };

      const result = updateAnimation(state, 20);

      expect(result.frameIndex).toBe(0);
    });

    it('should never set isComplete for looping animations', () => {
      const state: AnimationState = {
        state: 'idle',
        frameIndex: 0,
        elapsedMs: 0,
        isComplete: false,
      };

      const result = updateAnimation(state, 10000);

      expect(result.isComplete).toBe(false);
    });
  });

  describe('one-shot animations (eat, happy)', () => {
    it('should set isComplete when reaching last frame', () => {
      const state: AnimationState = {
        state: 'eat',
        frameIndex: 3, // eat has 5 frames
        elapsedMs: ANIMATION_FRAME_DURATION_MS - 10,
        isComplete: false,
      };

      // Advance to frame 4
      let result = updateAnimation(state, 20);
      expect(result.isComplete).toBe(false);

      // Advance past frame 4 (last frame)
      result = updateAnimation(result, ANIMATION_FRAME_DURATION_MS + 10);
      expect(result.isComplete).toBe(true);
      expect(result.frameIndex).toBe(4);
    });

    it('should not update when already complete', () => {
      const state: AnimationState = {
        state: 'eat',
        frameIndex: 4,
        elapsedMs: 0,
        isComplete: true,
      };

      const result = updateAnimation(state, 1000);

      expect(result).toEqual(state);
    });
  });
});

describe('resetAnimation', () => {
  it('should create fresh animation state', () => {
    const result = resetAnimation('walk');

    expect(result).toEqual({
      state: 'walk',
      frameIndex: 0,
      elapsedMs: 0,
      isComplete: false,
    });
  });
});
