import { useCallback, useRef } from 'react'

import { FloatingText } from './components/FloatingText'
import { Maenggu } from './components/Maenggu'
import { useFloatingTexts } from './hooks/useFloatingTexts'
import { useMaenggu } from './hooks/useMaenggu'
import { useMouseCollider } from './hooks/useMouseCollider'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const pendingFeedRef = useRef(false)

  const { floatingTexts, addFloatingText, removeFloatingText } = useFloatingTexts()

  const handleFloatingText = useCallback(
    (text: string, position: { x: number; y: number }) => {
      addFloatingText(text, position)
    },
    [addFloatingText],
  )

  const { gameState, pushEvent } = useMaenggu(handleFloatingText)

  useMouseCollider(maengguRef)

  // 클릭 핸들러
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return
      pushEvent({ type: 'click', position: gameState.movement.position })
    },
    [pushEvent, gameState.movement.position],
  )

  // 우클릭 (먹이주기) 핸들러
  const handleContextMenu = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()

      if (pendingFeedRef.current) return
      pendingFeedRef.current = true

      try {
        const success = await window.maenggu.snack.spend()
        if (success) {
          pushEvent({ type: 'feed-success' })
        } else {
          pushEvent({ type: 'feed-fail' })
        }
      } finally {
        pendingFeedRef.current = false
      }
    },
    [pushEvent],
  )

  return (
    <div id="maenggu-container">
      <Maenggu
        ref={maengguRef}
        animState={gameState.anim.state}
        position={gameState.movement.position}
        facing={gameState.movement.facing}
        frameIndex={gameState.anim.frameIndex}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
      />
      {floatingTexts.map((floatingText) => (
        <FloatingText
          key={floatingText.id}
          text={floatingText.text}
          position={floatingText.position}
          onAnimationEnd={() => {
            removeFloatingText(floatingText.id)
          }}
        />
      ))}
    </div>
  )
}

export default App
