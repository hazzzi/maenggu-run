import { useEffect, useRef, useState } from 'react';

import {
  DEFAULT_MEAL_REMINDER,
  type MealReminderSettings,
} from '../../shared/types';

/**
 * 밥시간 알림 훅
 * 설정에서 시간/메시지를 읽어와서 지정된 시간에 콜백 호출
 */
export function useMealReminder(onReminder: (message: string) => void): void {
  const lastTriggeredRef = useRef<string | null>(null);
  const [settings, setSettings] = useState<MealReminderSettings>(DEFAULT_MEAL_REMINDER);

  // 설정 로드 및 변경 구독
  useEffect(() => {
    // 초기 로드
    window.maenggu?.mealReminder.getSettings().then(setSettings);

    // 변경 구독
    const unsubscribe = window.maenggu?.mealReminder.onSettingsChanged(setSettings);

    return () => {
      unsubscribe?.();
    };
  }, []);

  // 시간 체크 로직
  useEffect(() => {
    // 비활성화면 스킵
    if (!settings.enabled) return;

    const checkTime = (): void => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentKey = `${currentHour}:${currentMinute}`;

      // 이미 이 시간에 알림을 보냈으면 스킵
      if (lastTriggeredRef.current === currentKey) {
        return;
      }

      // 알림 시간인지 확인
      const isMealTime = settings.times.some(
        (time) => time.hour === currentHour && time.minute === currentMinute,
      );

      if (isMealTime) {
        lastTriggeredRef.current = currentKey;
        onReminder(settings.message);
      }
    };

    // 즉시 한 번 체크
    checkTime();

    // 매 분마다 체크 (다음 정각까지 대기 후 시작)
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const initialTimeout = setTimeout(() => {
      checkTime();
      // 이후 매 분마다 체크
      intervalId = setInterval(checkTime, 60 * 1000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [settings, onReminder]);
}
