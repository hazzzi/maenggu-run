import { useEffect, useRef } from 'react'

type MealTime = {
  readonly hour: number
  readonly minute: number
}

// 알림 시간 설정 (11:50, 17:50)
const MEAL_TIMES: readonly MealTime[] = [
  { hour: 11, minute: 50 },
  { hour: 17, minute: 50 },
]

const REMINDER_MESSAGE = '맘마 10분전! ><'

/**
 * 밥시간 알림 훅
 * 지정된 시간에 콜백 호출
 */
export function useMealReminder(
  onReminder: (message: string) => void,
): void {
  const lastTriggeredRef = useRef<string | null>(null)

  useEffect(() => {
    const checkTime = (): void => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentKey = `${currentHour}:${currentMinute}`

      // 이미 이 시간에 알림을 보냈으면 스킵
      if (lastTriggeredRef.current === currentKey) {
        return
      }

      // 알림 시간인지 확인
      const isMealTime = MEAL_TIMES.some(
        (time) => time.hour === currentHour && time.minute === currentMinute
      )

      if (isMealTime) {
        lastTriggeredRef.current = currentKey
        onReminder(REMINDER_MESSAGE)
      }
    }

    // 즉시 한 번 체크
    checkTime()

    // 매 분마다 체크 (다음 정각까지 대기 후 시작)
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    
    const initialTimeout = setTimeout(() => {
      checkTime()
      // 이후 매 분마다 체크
      const interval = setInterval(checkTime, 60 * 1000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => {
      clearTimeout(initialTimeout)
    }
  }, [onReminder])
}
