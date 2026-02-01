import { type AnimState } from './types'

export type AnimationEvent =
  | { type: 'idle-start' }
  | { type: 'walk-start' }
  | { type: 'eat-start' }
  | { type: 'eat-finish' }
  | { type: 'happy-finish' }
  | { type: 'force-idle' }

const STATE_TRANSITIONS: Record<AnimState, Set<AnimationEvent['type']>> = {
  idle: new Set(['walk-start', 'eat-start', 'force-idle']),
  walk: new Set(['idle-start', 'eat-start', 'force-idle']),
  eat: new Set(['eat-finish', 'force-idle']),
  happy: new Set(['happy-finish', 'force-idle']),
}

const EVENT_TO_STATE: Record<AnimationEvent['type'], AnimState> = {
  'idle-start': 'idle',
  'walk-start': 'walk',
  'eat-start': 'eat',
  'eat-finish': 'happy',
  'happy-finish': 'idle',
  'force-idle': 'idle',
}

export function getNextAnimationState(
  current: AnimState,
  event: AnimationEvent,
): AnimState {
  const allowedEvents = STATE_TRANSITIONS[current]

  if (!allowedEvents.has(event.type)) {
    return current
  }

  return EVENT_TO_STATE[event.type]
}
