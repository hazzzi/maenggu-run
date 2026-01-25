import { useCallback, useEffect, useRef, useState } from 'react'

import { type Position } from '../shared/types'
import { Maenggu } from './components/Maenggu'
import { SnackCounter } from './components/SnackCounter'
import { FloatingText } from './components/FloatingText'
import { useAnimation } from './hooks/useAnimation'
import { useIdleTimer } from './hooks/useIdleTimer'
import { useMouseCollider } from './hooks/useMouseCollider'
import { useMaengguState } from './hooks/useMaengguState'
import { useMovement } from './hooks/useMovement'
import { useFloatingTexts } from './hooks/useFloatingTexts'
import { generateRandomTarget, getWindowBounds } from './movement/target'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const lastPointerRef = useRef<{ id: number; time: number } | null>(null)
  const lastClickRef = useRef<{ time: number; position: Position } | null>(null)
  const lastSnackCountRef = useRef(0)
  const [snackCount, setSnackCount] = useState(0)

  const {
    animState,
    position,
    moveTarget,
    facing,
    dispatchAnimEvent,
    setPosition,
    setMoveTarget,
    setFacing,
  } = useMaengguState()

  const { floatingTexts, addFloatingText, removeFloatingText } = useFloatingTexts()

  useEffect(() => {
    const cleanup = window.maenggu.snack.onUpdate((count) => {
      setSnackCount(count)

      const lastClick = lastClickRef.current
      const lastSnackCount = lastSnackCountRef.current

      if (lastClick && count > lastSnackCount) {
        addFloatingText('+🍖', lastClick.position)
      }

      lastSnackCountRef.current = count
    })

    return cleanup
  }, [addFloatingText])

  const handleAnimationComplete = useCallback(() => {
    if (animState === 'eat') {
      dispatchAnimEvent({ type: 'eat-finish' })
    } else if (animState === 'happy') {
      dispatchAnimEvent({ type: 'happy-finish' })
    }
  }, [animState, dispatchAnimEvent])

  const handleTargetReached = useCallback(() => {
    setMoveTarget(null)
    dispatchAnimEvent({ type: 'force-idle' })
  }, [setMoveTarget, dispatchAnimEvent])

  const handleMaengguClick = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) {
      return
    }

    if (animState === 'eat' || animState === 'happy') {
      return
    }

    const pointerId = event.pointerId
    const now = Date.now()
    const lastPointer = lastPointerRef.current

    if (lastPointer && lastPointer.id === pointerId && now - lastPointer.time < 500) {
      return
    }

    lastPointerRef.current = { id: pointerId, time: now }

    setMoveTarget(null)
    dispatchAnimEvent({ type: 'eat-start' })
    lastClickRef.current = { time: Date.now(), position }
    window.maenggu.snack.add()
  }, [animState, setMoveTarget, dispatchAnimEvent, position])

  const { frameIndex } = useAnimation(animState, handleAnimationComplete)

  useIdleTimer({ animState, dispatchAnimEvent })
  useMouseCollider(maengguRef)

  useMovement({
    isWalking: animState === 'walk',
    currentPosition: position,
    targetPosition: moveTarget,
    onPositionUpdate: setPosition,
    onTargetReached: handleTargetReached,
    onDirectionChange: setFacing,
  })

  useEffect(() => {
    if (animState === 'walk' && !moveTarget) {
      const bounds = getWindowBounds()
      const target = generateRandomTarget(bounds)
      setMoveTarget(target)
    }
  }, [animState, moveTarget, setMoveTarget])

  return (
    <div id="maenggu-container">
      <SnackCounter count={snackCount} />
      <Maenggu
        ref={maengguRef}
        animState={animState}
        position={position}
        facing={facing}
        frameIndex={frameIndex}
        onPointerDown={handleMaengguClick}
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
