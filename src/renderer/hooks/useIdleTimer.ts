import { useEffect, useRef } from 'react'

import { IDLE_TIME_RANGE } from '../../shared/constants'
import { type MaengguState } from '../../shared/types'
import { type AnimationEvent } from '../animation/state-machine'

function getRandomIdleTime(): number {
  const range = IDLE_TIME_RANGE.max - IDLE_TIME_RANGE.min
  return IDLE_TIME_RANGE.min + Math.floor(Math.random() * range)
}

type UseIdleTimerParams = {
  readonly animState: MaengguState
  readonly dispatchAnimEvent: (event: AnimationEvent) => void
}

export function useIdleTimer({
  animState,
  dispatchAnimEvent,
}: UseIdleTimerParams): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (animState !== 'idle') {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const idleTime = getRandomIdleTime()
    timerRef.current = setTimeout(() => {
      dispatchAnimEvent({ type: 'walk-start' })
      timerRef.current = null
    }, idleTime)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [animState, dispatchAnimEvent])
}
