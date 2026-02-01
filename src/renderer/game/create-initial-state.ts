import { IDLE_TIME_RANGE, MOVE_SPEED_RANGE } from './constants'
import { type MaengguGameState } from './types'

function getRandomIdleTime(): number {
  const range = IDLE_TIME_RANGE.max - IDLE_TIME_RANGE.min
  return IDLE_TIME_RANGE.min + Math.random() * range
}

function getRandomSpeed(): number {
  const { min, max } = MOVE_SPEED_RANGE
  return min + Math.random() * (max - min)
}

export function createInitialState(windowWidth: number, windowHeight: number): MaengguGameState {
  return {
    anim: {
      state: 'idle',
      frameIndex: 0,
      elapsedMs: 0,
      isComplete: false,
    },
    movement: {
      position: {
        x: Math.floor(windowWidth / 2),
        y: Math.floor(windowHeight / 2),
      },
      target: null,
      speed: getRandomSpeed(),
      facing: 'right',
    },
    idleTimer: {
      remainingMs: getRandomIdleTime(),
      isActive: true,
    },
  }
}
