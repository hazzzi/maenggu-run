import { useRef } from 'react'

import { useMouseCollider } from './hooks/useMouseCollider'

function App(): JSX.Element {
  const maengguRef = useRef<HTMLDivElement>(null)

  useMouseCollider(maengguRef)

  return (
    <div id="maenggu-container">
      <div
        ref={maengguRef}
        id="maenggu"
        style={{
          position: 'absolute',
          left: '100px',
          top: '100px',
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(255, 100, 100, 0.5)',
          pointerEvents: 'auto',
        }}
      />
    </div>
  )
}

export default App
