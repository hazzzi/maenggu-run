import { useEffect, useRef } from 'react'

export function useMouseCollider(
  colliderRef: React.RefObject<HTMLElement | null>,
): void {
  const isInsideRef = useRef<boolean>(false)

  useEffect(() => {
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
