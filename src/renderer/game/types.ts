// === 기본 타입 (shared/types.ts에서 re-export 또는 독립 정의) ===

export type Position = {
  readonly x: number;
  readonly y: number;
};

export type FacingDirection = 'left' | 'right';

export type AnimState = 'idle' | 'walk' | 'eat' | 'happy' | 'sleep';

// === 게임 상태 (단일 소스) ===

export type AnimationState = {
  readonly state: AnimState;
  readonly frameIndex: number;
  readonly elapsedMs: number;
  readonly isComplete: boolean;
};

export type MovementTarget =
  | { readonly type: 'random'; readonly position: Position }
  | { readonly type: 'summon'; readonly position: Position };

export type MovementState = {
  readonly position: Position;
  readonly target: MovementTarget | null;
  readonly speed: number;
  readonly facing: FacingDirection;
};

export type IdleTimerState = {
  readonly remainingMs: number;
  readonly isActive: boolean;
};

// idle 상태 누적 시간 (sleep 전환용)
export type SleepTimerState = {
  readonly elapsedMs: number;
};

export type MaengguGameState = {
  readonly anim: AnimationState;
  readonly movement: MovementState;
  readonly idleTimer: IdleTimerState;
  readonly sleepTimer: SleepTimerState;
};

// === 이벤트 (외부 → 게임 루프) ===

export type GameEvent =
  | { readonly type: 'click'; readonly position: Position }
  | { readonly type: 'feed-success' }
  | { readonly type: 'feed-fail' }
  | { readonly type: 'summon'; readonly x: number; readonly y: number };

// === 액션 (게임 루프 → 외부) ===

export type GameAction =
  | { readonly type: 'add-snack' }
  | {
      readonly type: 'show-floating-text';
      readonly text: string;
      readonly position: Position;
    };
