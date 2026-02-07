import { describe, expect, it } from 'vitest';

import { type SpritePack } from '../../shared/types';
import { type MaengguGameState } from './types';
import { update } from './update';

// 테스트용 mock SpritePack
const mockPack: SpritePack = {
  basePath: '/assets/',
  manifest: {
    name: 'test',
    version: 1,
    frameSize: 32,
    fallback: 'idle',
    states: {
      idle: { frames: ['idle.png'], loop: true },
      walk: { frames: ['walk1.png', 'walk2.png', 'walk3.png'], loop: true },
      eat: {
        frames: ['eat1.png', 'eat2.png', 'eat3.png', 'eat4.png', 'eat5.png'],
        loop: false,
      },
      happy: { frames: ['happy.png'], loop: false },
      sleep: {
        frames: ['sleep1.png', 'sleep2.png'],
        loop: true,
        frameDuration: 500,
      },
    },
  },
};

function createTestState(
  overrides: Partial<MaengguGameState> = {},
): MaengguGameState {
  return {
    anim: {
      state: 'idle',
      frameIndex: 0,
      elapsedMs: 0,
      isComplete: false,
      ...overrides.anim,
    },
    movement: {
      position: { x: 100, y: 100 },
      target: null,
      speed: 3,
      facing: 'right',
      ...overrides.movement,
    },
    idleTimer: {
      remainingMs: 5000,
      isActive: true,
      ...overrides.idleTimer,
    },
    sleepTimer: {
      elapsedMs: 0,
      ...overrides.sleepTimer,
    },
  };
}

const bounds = { width: 800, height: 600 };

describe('update', () => {
  describe('click event', () => {
    it('should transition to eat and add snack on click', () => {
      const state = createTestState();

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(result.state.anim.state).toBe('eat');
      expect(result.actions).toContainEqual({ type: 'add-snack' });
      expect(result.actions).toContainEqual(
        expect.objectContaining({ type: 'show-floating-text' }),
      );
    });

    it('should ignore click during eat animation', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 0, elapsedMs: 0, isComplete: false },
      });

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(result.actions).toHaveLength(0);
    });

    it('should ignore click during happy animation', () => {
      const state = createTestState({
        anim: {
          state: 'happy',
          frameIndex: 0,
          elapsedMs: 0,
          isComplete: false,
        },
      });

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(result.actions).toHaveLength(0);
    });
  });

  describe('feed event', () => {
    it('should transition to eat on feed-success', () => {
      const state = createTestState();

      const result = update(state, 16, [{ type: 'feed-success' }], bounds, mockPack);

      expect(result.state.anim.state).toBe('eat');
      expect(result.actions).toHaveLength(0); // No snack added
    });

    it('should do nothing on feed-fail', () => {
      const state = createTestState();

      const result = update(state, 16, [{ type: 'feed-fail' }], bounds, mockPack);

      expect(result.state.anim.state).toBe('idle');
    });
  });

  describe('animation completion', () => {
    it('should transition from eat to happy on completion', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 4, elapsedMs: 0, isComplete: true },
      });

      const result = update(state, 16, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('happy');
      expect(result.state.anim.isComplete).toBe(false);
    });

    it('should transition from happy to idle on completion', () => {
      const state = createTestState({
        anim: { state: 'happy', frameIndex: 0, elapsedMs: 0, isComplete: true },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(state, 16, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('idle');
      expect(result.state.idleTimer.isActive).toBe(true);
      expect(result.state.idleTimer.remainingMs).toBeGreaterThan(0);
    });
  });

  describe('idle timer', () => {
    it('should decrement timer in idle state', () => {
      const state = createTestState({
        idleTimer: { remainingMs: 1000, isActive: true },
      });

      const result = update(state, 100, [], bounds, mockPack);

      expect(result.state.idleTimer.remainingMs).toBe(900);
    });

    it('should start walking when timer expires', () => {
      const state = createTestState({
        idleTimer: { remainingMs: 50, isActive: true },
      });

      const result = update(state, 100, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('walk');
      expect(result.state.movement.target).not.toBeNull();
    });
  });

  describe('movement', () => {
    it('should update position during walk', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 100, y: 100 },
          target: { type: 'random', position: { x: 200, y: 100 } },
          speed: 3,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(state, 16, [], bounds, mockPack);

      expect(result.state.movement.position.x).toBeGreaterThan(100);
    });

    it('should transition to idle when target reached', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 199, y: 100 },
          target: { type: 'random', position: { x: 200, y: 100 } },
          speed: 3,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(state, 16, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('idle');
      expect(result.state.movement.target).toBeNull();
      expect(result.state.idleTimer.isActive).toBe(true);
    });
  });

  describe('summon event', () => {
    it('should start walking towards summon position', () => {
      const state = createTestState();

      const result = update(
        state,
        16,
        [{ type: 'summon', x: 500, y: 300 }],
        bounds,
        mockPack,
      );

      expect(result.state.anim.state).toBe('walk');
      expect(result.state.movement.target).toEqual({
        type: 'summon',
        position: { x: 500, y: 300 },
      });
      expect(result.state.movement.speed).toBe(4); // SUMMON_SPEED
    });

    it('should ignore summon during eat animation', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 0, elapsedMs: 0, isComplete: false },
      });

      const result = update(
        state,
        16,
        [{ type: 'summon', x: 500, y: 300 }],
        bounds,
        mockPack,
      );

      expect(result.state.anim.state).toBe('eat');
      expect(result.state.movement.target).toBeNull();
    });

    it('should transition to happy when summon target reached', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 499, y: 300 },
          target: { type: 'summon', position: { x: 500, y: 300 } },
          speed: 4,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(state, 16, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('happy');
      expect(result.state.movement.target).toBeNull();
    });
  });

  describe('sleep', () => {
    it('should accumulate sleep timer during idle', () => {
      const state = createTestState({
        sleepTimer: { elapsedMs: 0 },
      });

      const result = update(state, 1000, [], bounds, mockPack);

      expect(result.state.sleepTimer.elapsedMs).toBeGreaterThan(0);
    });

    it('should accumulate sleep timer during walk too', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 100, y: 100 },
          target: { type: 'random', position: { x: 500, y: 100 } },
          speed: 2,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
        sleepTimer: { elapsedMs: 10_000 },
      });

      const result = update(state, 1000, [], bounds, mockPack);

      expect(result.state.sleepTimer.elapsedMs).toBeGreaterThan(10_000);
    });

    it('should transition to sleep after 10min without interaction', () => {
      const state = createTestState({
        sleepTimer: { elapsedMs: 599_500 },
      });

      const result = update(state, 1000, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('sleep');
    });

    it('should stop movement when falling asleep during walk', () => {
      const state = createTestState({
        anim: { state: 'walk', frameIndex: 0, elapsedMs: 0, isComplete: false },
        movement: {
          position: { x: 100, y: 100 },
          target: { type: 'random', position: { x: 500, y: 100 } },
          speed: 2,
          facing: 'right',
        },
        idleTimer: { remainingMs: 0, isActive: false },
        sleepTimer: { elapsedMs: 599_500 },
      });

      const result = update(state, 1000, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('sleep');
      expect(result.state.movement.target).toBeNull();
    });

    it('should reset sleep timer on click', () => {
      const state = createTestState({
        sleepTimer: { elapsedMs: 300_000 },
      });

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(result.state.sleepTimer.elapsedMs).toBeLessThan(100);
    });

    it('should not sleep during eat/happy animation', () => {
      const state = createTestState({
        anim: { state: 'eat', frameIndex: 0, elapsedMs: 0, isComplete: false },
        sleepTimer: { elapsedMs: 599_500 },
      });

      const result = update(state, 1000, [], bounds, mockPack);

      expect(result.state.anim.state).toBe('eat');
    });

    it('should wake up on click (no snack, show happy)', () => {
      const state = createTestState({
        anim: {
          state: 'sleep',
          frameIndex: 0,
          elapsedMs: 0,
          isComplete: false,
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(result.state.anim.state).toBe('happy');
      expect(result.actions).toHaveLength(0);
      expect(result.state.sleepTimer.elapsedMs).toBeLessThan(100);
    });

    it('should wake up on summon', () => {
      const state = createTestState({
        anim: {
          state: 'sleep',
          frameIndex: 0,
          elapsedMs: 0,
          isComplete: false,
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(
        state,
        16,
        [{ type: 'summon', x: 400, y: 200 }],
        bounds,
        mockPack,
      );

      expect(result.state.anim.state).toBe('walk');
      expect(result.state.movement.target).toEqual({
        type: 'summon',
        position: { x: 400, y: 200 },
      });
      expect(result.state.sleepTimer.elapsedMs).toBeLessThan(100);
    });

    it('should not add snack when waking from sleep by click', () => {
      const state = createTestState({
        anim: {
          state: 'sleep',
          frameIndex: 1,
          elapsedMs: 200,
          isComplete: false,
        },
        idleTimer: { remainingMs: 0, isActive: false },
      });

      const result = update(
        state,
        16,
        [{ type: 'click', position: { x: 100, y: 100 } }],
        bounds,
        mockPack,
      );

      expect(
        result.actions.find((a) => a.type === 'add-snack'),
      ).toBeUndefined();
    });
  });
});
