import { useEffect, useState } from 'react'

import { ANIMATION_FRAME_DURATION_MS } from '../../shared/constants'
import { type MaengguState } from '../../shared/types'
import { getSpriteManifest } from '../animation/sprite-loader'

type UseAnimationReturn = {
  readonly frameIndex: number
}

export function useAnimation(animState: MaengguState): UseAnimationReturn {
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    setFrameIndex(0)

    const manifest = getSpriteManifest()
    const frameCount = manifest[animState].length

    if (frameCount <= 1) {
      return
    }

    const intervalId = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frameCount)
    }, ANIMATION_FRAME_DURATION_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [animState])

  return { frameIndex }
}
