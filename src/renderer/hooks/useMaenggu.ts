import { convertFileSrc } from '@tauri-apps/api/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type SpritePack } from '../../shared/types';
import { MAX_DELTA_MS } from '../game/constants';
import { createInitialState } from '../game/create-initial-state';
import { loadSpritePack } from '../game/sprite-pack';
import { getWindowBounds } from '../game/target';
import {
  type GameAction,
  type GameEvent,
  type MaengguGameState,
} from '../game/types';
import { update, type UpdateResult } from '../game/update';

/** 로컬 파일 경로를 Tauri asset URL로 변환 */
function toAssetUrl(path: string): string {
  // /assets/로 시작하면 기본 스프라이트 (Vite 제공)
  if (path.startsWith('/assets/') || path.startsWith('http')) {
    return path;
  }
  // 로컬 파일 경로면 convertFileSrc 사용
  return convertFileSrc(path);
}

export type UseMaengguReturn = {
  readonly gameState: MaengguGameState;
  readonly pushEvent: (event: GameEvent) => void;
  readonly spritePack: SpritePack | null;
  readonly isLoading: boolean;
  readonly error: string | null;
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

  // SpritePack 로딩 상태
  const [spritePack, setSpritePack] = useState<SpritePack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // SpritePack 로딩 함수
  const loadSpritePackFromPath = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    const assetUrl = toAssetUrl(path);
    const result = await loadSpritePack(assetUrl);

    if (result.success) {
      setSpritePack(result.pack);
    } else {
      setError(result.error);
      console.error('Failed to load sprite pack:', result.error);
    }
    setIsLoading(false);
  }, []);

  // 초기 SpritePack 로딩
  useEffect(() => {
    loadSpritePackFromPath('/assets/');
  }, [loadSpritePackFromPath]);

  // sprite_changed 이벤트 구독
  useEffect(() => {
    const unsubscribe = window.maenggu.sprite.onSpriteChanged((path: string) => {
      loadSpritePackFromPath(path);
    });

    return unsubscribe;
  }, [loadSpritePackFromPath]);

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

  // 게임 루프 (SpritePack 로딩 완료 후 시작)
  useEffect(() => {
    if (!spritePack) return;

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
        spritePack,
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
  }, [spritePack]);

  return { gameState, pushEvent, spritePack, isLoading, error };
}
