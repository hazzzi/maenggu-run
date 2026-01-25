import { useCallback, useEffect, useRef } from 'react'

import { Maenggu } from './components/Maenggu'
import { useAnimation } from './hooks/useAnimation'
import { useIdleTimer } from './hooks/useIdleTimer'
import { useMouseCollider } from './hooks/useMouseCollider'
import { useMaengguState } from './hooks/useMaengguState'
import { useMovement } from './hooks/useMovement'
import { generateRandomTarget, getWindowBounds } from './movement/target'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const {
    animState,
    position,
    moveTarget,
    dispatchAnimEvent,
    setPosition,
    setMoveTarget,
  } = useMaengguState()

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

  const { frameIndex } = useAnimation(animState, handleAnimationComplete)

  useIdleTimer({ animState, dispatchAnimEvent })
  useMouseCollider(maengguRef)

  useMovement({
    isWalking: animState === 'walk',
    currentPosition: position,
    targetPosition: moveTarget,
    onPositionUpdate: setPosition,
    onTargetReached: handleTargetReached,
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
      <Maenggu
        ref={maengguRef}
        animState={animState}
        position={position}
        frameIndex={frameIndex}
      />
    </div>
  )
}

export default App
