import { useCallback, useEffect, useRef, useState } from 'react'

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
  const clickLockRef = useRef(false)
  const clickTimeoutRef = useRef<number | null>(null)
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
    })

    return cleanup
  }, [])

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

  const handleMaengguClick = useCallback(() => {
    if (clickLockRef.current) {
      return
    }
    clickLockRef.current = true

    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current)
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      clickLockRef.current = false
    }, 350)

    setMoveTarget(null)
    dispatchAnimEvent({ type: 'eat-start' })
    window.maenggu.snack.add()
    addFloatingText('+1', position)
  }, [setMoveTarget, dispatchAnimEvent, addFloatingText, position])

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
