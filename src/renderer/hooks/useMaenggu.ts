import { useCallback, useEffect, useRef, useState } from 'react'

import { createInitialState } from '../game/create-initial-state'
import { getWindowBounds } from '../game/target'
import { type GameAction, type GameEvent, type MaengguGameState } from '../game/types'
import { update } from '../game/update'

export type UseMaengguReturn = {
  readonly gameState: MaengguGameState
  readonly pushEvent: (event: GameEvent) => void
}

function handleAction(action: GameAction): void {
  switch (action.type) {
    case 'add-snack':
      window.maenggu.snack.add()
      break
    case 'show-floating-text':
      // App.tsx에서 처리하도록 별도 콜백으로 전달
      // 여기서는 IPC만 처리
      break
  }
}

export function useMaenggu(
  onFloatingText?: (text: string, position: { x: number; y: number }) => void,
): UseMaengguReturn {
  const [gameState, setGameState] = useState<MaengguGameState>(() => {
    const bounds = getWindowBounds()
    return createInitialState(bounds.width, bounds.height)
  })

  const eventsRef = useRef<GameEvent[]>([])
  const onFloatingTextRef = useRef(onFloatingText)

  // 콜백 참조 업데이트
  useEffect(() => {
    onFloatingTextRef.current = onFloatingText
  }, [onFloatingText])

  const pushEvent = useCallback((event: GameEvent) => {
    eventsRef.current.push(event)
  }, [])

  // 게임 루프
  useEffect(() => {
    let lastTime = performance.now()
    let rafId: number

    const loop = (now: number): void => {
      const deltaMs = now - lastTime
      lastTime = now

      const events = eventsRef.current
      eventsRef.current = []

      const bounds = getWindowBounds()

      setGameState((prev) => {
        const result = update(prev, deltaMs, events, bounds)

        // 액션 처리 (사이드 이펙트)
        for (const action of result.actions) {
          handleAction(action)

          if (action.type === 'show-floating-text' && onFloatingTextRef.current) {
            onFloatingTextRef.current(action.text, action.position)
          }
        }

        return result.state
      })

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, []) // deps 비어있음!

  return { gameState, pushEvent }
}
