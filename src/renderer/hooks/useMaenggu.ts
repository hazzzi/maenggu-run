import { useCallback, useEffect, useRef, useState } from 'react';

import { MAX_DELTA_MS } from '../game/constants';
import { createInitialState } from '../game/create-initial-state';
import { getWindowBounds } from '../game/target';
import {
  type GameAction,
  type GameEvent,
  type MaengguGameState,
} from '../game/types';
import { update, type UpdateResult } from '../game/update';

export type UseMaengguReturn = {
  readonly gameState: MaengguGameState;
  readonly pushEvent: (event: GameEvent) => void;
};

function executeAction(
  action: GameAction,
  onFloatingText?: (text: string, position: { x: number; y: number }) => void,
): void {
  switch (action.type) {
    case 'add-snack':
      window.maenggu.snack.add();
      break;
    case 'show-floating-text':
      onFloatingText?.(action.text, action.position);
      break;
  }
}

export function useMaenggu(
  onFloatingText?: (text: string, position: { x: number; y: number }) => void,
): UseMaengguReturn {
  const [gameState, setGameState] = useState<MaengguGameState>(() => {
    const bounds = getWindowBounds();
    return createInitialState(bounds.width, bounds.height);
  });

  const eventsRef = useRef<GameEvent[]>([]);
  const onFloatingTextRef = useRef(onFloatingText);
  const gameStateRef = useRef(gameState);

  // 최신 상태를 ref에 동기화
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 콜백 참조 업데이트
  useEffect(() => {
    onFloatingTextRef.current = onFloatingText;
  }, [onFloatingText]);

  const pushEvent = useCallback((event: GameEvent) => {
    eventsRef.current.push(event);
  }, []);

  // summon 이벤트 구독
  useEffect(() => {
    const unsubscribe = window.maenggu.summon.onSummon(async () => {
      const cursor = await window.maenggu.mouse.getCursorPosition();
      if (cursor) {
        pushEvent({ type: 'summon', x: cursor.x, y: cursor.y });
      }
    });

    return unsubscribe;
  }, [pushEvent]);

  // 게임 루프
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number): void => {
      const deltaMs = Math.min(now - lastTime, MAX_DELTA_MS);
      lastTime = now;

      const events = eventsRef.current;
      eventsRef.current = [];

      const bounds = getWindowBounds();

      // 상태 업데이트 (ref에서 직접 읽어서 setState 중복 호출 문제 회피)
      const result: UpdateResult = update(
        gameStateRef.current,
        deltaMs,
        events,
        bounds,
      );

      // 상태 변경이 있을 때만 setState 호출
      if (result.state !== gameStateRef.current) {
        gameStateRef.current = result.state;
        setGameState(result.state);
      }

      // 액션 실행 (setState 바깥에서)
      for (const action of result.actions) {
        executeAction(action, onFloatingTextRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { gameState, pushEvent };
}
