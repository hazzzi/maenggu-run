// === 기본 타입 (shared/types.ts에서 re-export 또는 독립 정의) ===

export type Position = {
  readonly x: number
  readonly y: number
}

export type FacingDirection = 'left' | 'right'

export type AnimState = 'idle' | 'walk' | 'eat' | 'happy'

// === 게임 상태 (단일 소스) ===

export type AnimationState = {
  readonly state: AnimState
  readonly frameIndex: number
  readonly elapsedMs: number
  readonly isComplete: boolean
}

export type MovementState = {
  readonly position: Position
  readonly target: Position | null
  readonly speed: number
  readonly facing: FacingDirection
}

export type IdleTimerState = {
  readonly remainingMs: number
  readonly isActive: boolean
}

export type MaengguGameState = {
  readonly anim: AnimationState
  readonly movement: MovementState
  readonly idleTimer: IdleTimerState
}

// === 이벤트 (외부 → 게임 루프) ===

export type GameEvent =
  | { readonly type: 'click'; readonly position: Position }
  | { readonly type: 'feed-success' }
  | { readonly type: 'feed-fail' }
  | { readonly type: 'summon'; readonly x: number; readonly y: number }

// === 액션 (게임 루프 → 외부) ===

export type GameAction =
  | { readonly type: 'add-snack' }
  | { readonly type: 'show-floating-text'; readonly text: string; readonly position: Position }
