import { useCallback, useRef } from 'react'

import { Maenggu } from './components/Maenggu'
import { useAnimation } from './hooks/useAnimation'
import { useMouseCollider } from './hooks/useMouseCollider'
import { useMaengguState } from './hooks/useMaengguState'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const { animState, position, dispatchAnimEvent } = useMaengguState()

  const handleAnimationComplete = useCallback(() => {
    if (animState === 'eat') {
      dispatchAnimEvent({ type: 'eat-finish' })
    }
  }, [animState, dispatchAnimEvent])

  const { frameIndex } = useAnimation(animState, handleAnimationComplete)

  useMouseCollider(maengguRef)

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
