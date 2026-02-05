import { useEffect, useState } from 'react'

import { SPRITE_DISPLAY_SIZE } from '../game/constants'
import { type Position } from '../game/types'

type SpeechBubbleProps = {
  readonly text: string
  readonly position: Position
  readonly duration?: number // ms, 기본 5초
  readonly onDismiss: () => void
}

const DEFAULT_DURATION_MS = 5000

export function SpeechBubble({
  text,
  position,
  duration = DEFAULT_DURATION_MS,
  onDismiss,
}: SpeechBubbleProps): JSX.Element {
  const [opacity, setOpacity] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => setOpacity(1), 50)
    
    // Start fade out before dismiss
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0)
    }, duration - 300)
    
    // Dismiss after duration
    const dismissTimer = setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, duration)

    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(dismissTimer)
    }
  }, [duration, onDismiss])

  if (!isVisible) return <></>

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - SPRITE_DISPLAY_SIZE - 20,
        transform: 'translateX(-50%)',
        padding: '8px 14px',
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        fontSize: 14,
        fontWeight: 500,
        color: '#333',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity,
        transition: 'opacity 0.3s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      {/* 말풍선 꼬리 */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        }}
      />
    </div>
  )
}
