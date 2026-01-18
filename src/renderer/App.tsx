import { useRef } from 'react'

import { Maenggu } from './components/Maenggu'
import { useMouseCollider } from './hooks/useMouseCollider'
import { useMaengguState } from './hooks/useMaengguState'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)
  const { animState, position } = useMaengguState()

  useMouseCollider(maengguRef)

  return (
    <div id="maenggu-container">
      <Maenggu
        ref={maengguRef}
        animState={animState}
        position={position}
      />
    </div>
  )
}

export default App
