import { describe, expect, it } from 'vitest'

import { getNextAnimationState } from './state-machine'

describe('getNextAnimationState', () => {
  it('transitions idle to walk on walk-start', () => {
    expect(getNextAnimationState('idle', { type: 'walk-start' })).toBe('walk')
  })

  it('transitions walk to idle on idle-start', () => {
    expect(getNextAnimationState('walk', { type: 'idle-start' })).toBe('idle')
  })

  it('transitions idle to eat on eat-start', () => {
    expect(getNextAnimationState('idle', { type: 'eat-start' })).toBe('eat')
  })

  it('transitions eat to happy on eat-finish', () => {
    expect(getNextAnimationState('eat', { type: 'eat-finish' })).toBe('happy')
  })

  it('transitions happy to idle on happy-finish', () => {
    expect(getNextAnimationState('happy', { type: 'happy-finish' })).toBe('idle')
  })

  it('ignores invalid transitions', () => {
    expect(getNextAnimationState('eat', { type: 'walk-start' })).toBe('eat')
  })

  it('force-idle overrides from any state', () => {
    expect(getNextAnimationState('idle', { type: 'force-idle' })).toBe('idle')
    expect(getNextAnimationState('walk', { type: 'force-idle' })).toBe('idle')
    expect(getNextAnimationState('eat', { type: 'force-idle' })).toBe('idle')
    expect(getNextAnimationState('happy', { type: 'force-idle' })).toBe('idle')
  })
})
