import { useEffect, useRef, useState } from 'react'

import { ANIMATION_FRAME_DURATION_MS } from '../../shared/constants'
import { type MaengguState } from '../../shared/types'
import { getSpriteManifest } from '../animation/sprite-loader'

type UseAnimationReturn = {
  readonly frameIndex: number
}

const LOOPING_STATES: readonly MaengguState[] = ['idle', 'walk']

export function useAnimation(
  animState: MaengguState,
  onComplete?: () => void,
): UseAnimationReturn {
  const [frameIndex, setFrameIndex] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    setFrameIndex(0)
    completedRef.current = false

    const manifest = getSpriteManifest()
    const frameCount = manifest[animState].length
    const isLooping = LOOPING_STATES.includes(animState)

    if (frameCount <= 1) {
      if (!isLooping && onComplete && !completedRef.current) {
        completedRef.current = true
        onComplete()
      }
      return
    }

    const intervalId = setInterval(() => {
      setFrameIndex((prev) => {
        const nextFrame = prev + 1

        if (isLooping) {
          return nextFrame % frameCount
        }

        if (nextFrame >= frameCount) {
          if (onComplete && !completedRef.current) {
            completedRef.current = true
            onComplete()
          }
          return frameCount - 1
        }

        return nextFrame
      })
    }, ANIMATION_FRAME_DURATION_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [animState, onComplete])

  return { frameIndex }
}
