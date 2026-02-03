import { useEffect, useRef } from 'react'

import { isTauri } from '../tauri-api'

/**
 * 맹구 영역 마우스 충돌 감지 훅
 *
 * Electron: mousemove 이벤트 + { forward: true } 방식
 * Tauri: cursorPosition 폴링 방식 (forward 옵션이 없어서)
 */
export function useMouseCollider(
  colliderRef: React.RefObject<HTMLElement | null>,
): void {
  const isInsideRef = useRef<boolean>(false)

  useEffect(() => {
    // Tauri: cursorPosition 폴링 방식
    if (isTauri()) {
      let rafId: number | null = null
      let isRunning = true

      const pollCursorPosition = async (): Promise<void> => {
        if (!isRunning) return

        try {
          const element = colliderRef.current
          if (element) {
            const cursorPos = await window.maenggu.mouse.getCursorPosition()
            if (cursorPos) {
              const rect = element.getBoundingClientRect()
              const isInside =
                cursorPos.x >= rect.left &&
                cursorPos.x <= rect.right &&
                cursorPos.y >= rect.top &&
                cursorPos.y <= rect.bottom

              if (isInside !== isInsideRef.current) {
                isInsideRef.current = isInside
                window.maenggu.mouse.setCollider(isInside)
              }
            }
          }
        } catch (e) {
          console.error('pollCursorPosition error:', e)
        }

        if (isRunning) {
          rafId = requestAnimationFrame(pollCursorPosition)
        }
      }

      rafId = requestAnimationFrame(pollCursorPosition)

      return () => {
        isRunning = false
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }
        if (isInsideRef.current) {
          window.maenggu.mouse.setCollider(false)
          isInsideRef.current = false
        }
      }
    }

    // Electron: mousemove 이벤트 방식
    const handleMouseMove = (event: MouseEvent): void => {
      const element = colliderRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const { clientX, clientY } = event

      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom

      if (isInside !== isInsideRef.current) {
        isInsideRef.current = isInside
        window.maenggu.mouse.setCollider(isInside)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (isInsideRef.current) {
        window.maenggu.mouse.setCollider(false)
        isInsideRef.current = false
      }
    }
  }, [colliderRef])
}
