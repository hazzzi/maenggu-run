import { describe, expect, it } from 'vitest';

import { getNextAnimationState } from './state-machine';

describe('getNextAnimationState', () => {
  describe('from idle', () => {
    it('should transition to walk on walk-start', () => {
      expect(getNextAnimationState('idle', { type: 'walk-start' })).toBe(
        'walk',
      );
    });

    it('should transition to eat on eat-start', () => {
      expect(getNextAnimationState('idle', { type: 'eat-start' })).toBe('eat');
    });

    it('should stay idle on force-idle', () => {
      expect(getNextAnimationState('idle', { type: 'force-idle' })).toBe(
        'idle',
      );
    });

    it('should ignore invalid events', () => {
      expect(getNextAnimationState('idle', { type: 'eat-finish' })).toBe(
        'idle',
      );
      expect(getNextAnimationState('idle', { type: 'happy-finish' })).toBe(
        'idle',
      );
    });
  });

  describe('from walk', () => {
    it('should transition to idle on idle-start', () => {
      expect(getNextAnimationState('walk', { type: 'idle-start' })).toBe(
        'idle',
      );
    });

    it('should transition to eat on eat-start', () => {
      expect(getNextAnimationState('walk', { type: 'eat-start' })).toBe('eat');
    });

    it('should transition to idle on force-idle', () => {
      expect(getNextAnimationState('walk', { type: 'force-idle' })).toBe(
        'idle',
      );
    });
  });

  describe('from eat', () => {
    it('should transition to happy on eat-finish', () => {
      expect(getNextAnimationState('eat', { type: 'eat-finish' })).toBe(
        'happy',
      );
    });

    it('should transition to idle on force-idle', () => {
      expect(getNextAnimationState('eat', { type: 'force-idle' })).toBe('idle');
    });

    it('should ignore walk-start during eat', () => {
      expect(getNextAnimationState('eat', { type: 'walk-start' })).toBe('eat');
    });
  });

  describe('from happy', () => {
    it('should transition to idle on happy-finish', () => {
      expect(getNextAnimationState('happy', { type: 'happy-finish' })).toBe(
        'idle',
      );
    });

    it('should transition to idle on force-idle', () => {
      expect(getNextAnimationState('happy', { type: 'force-idle' })).toBe(
        'idle',
      );
    });
  });
});
