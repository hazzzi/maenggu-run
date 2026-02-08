import { type SpritePack } from '../../shared/types';
import {
  IDLE_TIME_RANGE,
  MOVE_SPEED_RANGE,
  SLEEP_TIMEOUT_MS,
  SUMMON_SPEED,
} from './constants';
import { type Bounds, generateRandomTarget } from './target';
import {
  type AnimState,
  type GameAction,
  type GameEvent,
  type IdleTimerState,
  type MaengguGameState,
  type MovementTarget,
  type SleepTimerState,
} from './types';
import { resetAnimation, updateAnimation } from './update-animation';
import { startMovement, stopMovement, updateMovement } from './update-movement';

// === 헬퍼 함수 ===

function getRandomIdleTime(): number {
  const range = IDLE_TIME_RANGE.max - IDLE_TIME_RANGE.min;
  return IDLE_TIME_RANGE.min + Math.random() * range;
}

function getRandomSpeed(): number {
  const { min, max } = MOVE_SPEED_RANGE;
  return min + Math.random() * (max - min);
}

function canInteract(animState: AnimState): boolean {
  return animState === 'idle' || animState === 'walk' || animState === 'sleep';
}

// === 업데이트 결과 타입 ===

export type UpdateResult = {
  readonly state: MaengguGameState;
  readonly actions: readonly GameAction[];
};

// === 이벤트 핸들러 ===

function handleClick(state: MaengguGameState): {
  state: MaengguGameState;
  actions: GameAction[];
} {
  if (!canInteract(state.anim.state)) {
    return { state, actions: [] };
  }

  // sleep 상태에서 클릭 → 깨우기만 (간식 X)
  if (state.anim.state === 'sleep') {
    const newState: MaengguGameState = {
      ...state,
      anim: resetAnimation('happy'),
      idleTimer: { remainingMs: 0, isActive: false },
      sleepTimer: { elapsedMs: 0 },
    };
    return { state: newState, actions: [] };
  }

  const newState: MaengguGameState = {
    ...state,
    anim: resetAnimation('eat'),
    movement: stopMovement(state.movement),
    idleTimer: { remainingMs: 0, isActive: false },
    sleepTimer: { elapsedMs: 0 },
  };

  const actions: GameAction[] = [
    { type: 'add-snack' },
    {
      type: 'show-floating-text',
      text: '+🍖',
      position: state.movement.position,
    },
  ];

  return { state: newState, actions };
}

function handleFeedSuccess(state: MaengguGameState): {
  state: MaengguGameState;
  actions: GameAction[];
} {
  if (!canInteract(state.anim.state)) {
    return { state, actions: [] };
  }

  const newState: MaengguGameState = {
    ...state,
    anim: resetAnimation('eat'),
    movement: stopMovement(state.movement),
    idleTimer: { remainingMs: 0, isActive: false },
    sleepTimer: { elapsedMs: 0 },
  };

  return { state: newState, actions: [] };
}

function handleSummon(
  state: MaengguGameState,
  x: number,
  y: number,
): { state: MaengguGameState; actions: GameAction[] } {
  if (!canInteract(state.anim.state)) {
    return { state, actions: [] };
  }

  const target: MovementTarget = { type: 'summon', position: { x, y } };

  const newState: MaengguGameState = {
    ...state,
    anim: resetAnimation('walk'),
    movement: startMovement(state.movement, target, SUMMON_SPEED),
    idleTimer: { remainingMs: 0, isActive: false },
    sleepTimer: { elapsedMs: 0 },
  };

  return { state: newState, actions: [] };
}

function handleEvents(
  state: MaengguGameState,
  events: readonly GameEvent[],
): { state: MaengguGameState; actions: GameAction[] } {
  let currentState = state;
  const allActions: GameAction[] = [];

  for (const event of events) {
    switch (event.type) {
      case 'click': {
        const result = handleClick(currentState);
        currentState = result.state;
        allActions.push(...result.actions);
        break;
      }
      case 'feed-success': {
        const result = handleFeedSuccess(currentState);
        currentState = result.state;
        allActions.push(...result.actions);
        break;
      }
      case 'feed-fail':
        // no-op
        break;
      case 'summon': {
        const result = handleSummon(currentState, event.x, event.y);
        currentState = result.state;
        allActions.push(...result.actions);
        break;
      }
    }
  }

  return { state: currentState, actions: allActions };
}

// === 시간 기반 업데이트 ===

function updateIdleTimer(
  idleTimer: IdleTimerState,
  deltaMs: number,
): { timer: IdleTimerState; shouldStartWalk: boolean } {
  if (!idleTimer.isActive) {
    return { timer: idleTimer, shouldStartWalk: false };
  }

  const newRemaining = idleTimer.remainingMs - deltaMs;

  if (newRemaining <= 0) {
    return {
      timer: { remainingMs: 0, isActive: false },
      shouldStartWalk: true,
    };
  }

  return {
    timer: { ...idleTimer, remainingMs: newRemaining },
    shouldStartWalk: false,
  };
}

// 상호작용 없이 흐른 시간을 추적 (idle/walk 무관하게 누적)
// 상호작용(click, feed, summon) 시 이벤트 핸들러에서 리셋됨
function updateSleepTimer(
  sleepTimer: SleepTimerState,
  deltaMs: number,
  canSleep: boolean,
): { timer: SleepTimerState; shouldSleep: boolean } {
  const newElapsed = sleepTimer.elapsedMs + deltaMs;

  if (newElapsed >= SLEEP_TIMEOUT_MS && canSleep) {
    return { timer: { elapsedMs: 0 }, shouldSleep: true };
  }

  return { timer: { elapsedMs: newElapsed }, shouldSleep: false };
}

function handleAnimationComplete(state: MaengguGameState): MaengguGameState {
  const { anim } = state;

  if (!anim.isComplete) {
    return state;
  }

  switch (anim.state) {
    case 'eat':
      // eat 완료 → happy로 전환
      return {
        ...state,
        anim: resetAnimation('happy'),
      };

    case 'happy':
      // happy 완료 → idle로 전환, 타이머 시작
      return {
        ...state,
        anim: resetAnimation('idle'),
        idleTimer: {
          remainingMs: getRandomIdleTime(),
          isActive: true,
        },
      };

    default:
      return state;
  }
}

function handleWalkStart(
  state: MaengguGameState,
  bounds: Bounds,
): MaengguGameState {
  const targetPosition = generateRandomTarget(bounds);
  const speed = getRandomSpeed();

  return {
    ...state,
    anim: resetAnimation('walk'),
    movement: startMovement(
      state.movement,
      { type: 'random', position: targetPosition },
      speed,
    ),
  };
}

function handleTargetReached(
  state: MaengguGameState,
  reachedTarget: MovementTarget | null,
): MaengguGameState {
  if (reachedTarget === null) {
    return state;
  }

  if (state.anim.state !== 'walk') {
    return state;
  }

  // summon 도착 시 happy 애니메이션
  if (reachedTarget.type === 'summon') {
    return {
      ...state,
      anim: resetAnimation('happy'),
      idleTimer: { remainingMs: 0, isActive: false },
    };
  }

  // random 도착 시 idle 전환
  return {
    ...state,
    anim: resetAnimation('idle'),
    idleTimer: {
      remainingMs: getRandomIdleTime(),
      isActive: true,
    },
  };
}

// === 메인 업데이트 함수 ===

export function update(
  state: MaengguGameState,
  deltaMs: number,
  events: readonly GameEvent[],
  bounds: Bounds,
  pack: SpritePack,
): UpdateResult {
  // 1. 이벤트 처리
  const eventResult = handleEvents(state, events);
  let currentState = eventResult.state;
  const actions = [...eventResult.actions];

  // 2. 애니메이션 완료 처리
  currentState = handleAnimationComplete(currentState);

  // 3. idle 타이머 업데이트
  if (currentState.anim.state === 'idle') {
    const timerResult = updateIdleTimer(currentState.idleTimer, deltaMs);
    currentState = { ...currentState, idleTimer: timerResult.timer };

    if (timerResult.shouldStartWalk) {
      currentState = handleWalkStart(currentState, bounds);
    }
  }

  // 4. 이동 업데이트
  if (currentState.anim.state === 'walk') {
    const movementResult = updateMovement(
      currentState.movement,
      deltaMs,
      bounds,
    );
    currentState = {
      ...currentState,
      movement: movementResult.state,
    };
    currentState = handleTargetReached(
      currentState,
      movementResult.reachedTarget,
    );
  }

  // 5. sleep 타이머 업데이트 (상호작용 없이 흐른 시간 추적)
  const canSleep =
    currentState.anim.state === 'idle' || currentState.anim.state === 'walk';
  const sleepResult = updateSleepTimer(
    currentState.sleepTimer,
    deltaMs,
    canSleep,
  );
  currentState = { ...currentState, sleepTimer: sleepResult.timer };

  if (sleepResult.shouldSleep) {
    currentState = {
      ...currentState,
      anim: resetAnimation('sleep'),
      movement: stopMovement(currentState.movement),
      idleTimer: { remainingMs: 0, isActive: false },
    };
  }

  // 6. 애니메이션 프레임 업데이트
  currentState = {
    ...currentState,
    anim: updateAnimation(currentState.anim, deltaMs, pack),
  };

  return { state: currentState, actions };
}
