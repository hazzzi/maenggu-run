import { useRef } from 'react'

import { Maenggu } from './components/Maenggu'
import { useAnimation } from './hooks/useAnimation'
import { useMouseCollider } from './hooks/useMouseCollider'
import { useMaengguState } from './hooks/useMaengguState'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const { animState, position } = useMaengguState()
  const { frameIndex } = useAnimation(animState)

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
