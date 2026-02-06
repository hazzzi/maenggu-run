import { ANIMATION_FRAME_DURATION_MS } from "./constants";
import { getFrameCount } from "./sprite-loader";
import { type AnimationState, type AnimState } from "./types";

const LOOPING_STATES: ReadonlySet<AnimState> = new Set([
  "idle",
  "walk",
  "sleep",
]);

// 상태별 프레임 duration (ms)
const STATE_FRAME_DURATION: Partial<Record<AnimState, number>> = {
  sleep: 500, // 느린 숨쉬기 애니메이션
};

function isLoopingState(state: AnimState): boolean {
  return LOOPING_STATES.has(state);
}

function getFrameDuration(state: AnimState): number {
  return STATE_FRAME_DURATION[state] ?? ANIMATION_FRAME_DURATION_MS;
}

export function updateAnimation(
  anim: AnimationState,
  deltaMs: number,
): AnimationState {
  // 이미 완료된 one-shot 애니메이션은 그대로 유지
  if (anim.isComplete) {
    return anim;
  }

  const frameCount = getFrameCount(anim.state);
  const frameDuration = getFrameDuration(anim.state);
  const newElapsed = anim.elapsedMs + deltaMs;

  // 프레임 전환이 필요한지 확인
  if (newElapsed < frameDuration) {
    return { ...anim, elapsedMs: newElapsed };
  }

  // 다음 프레임으로 전환
  const nextFrameIndex = anim.frameIndex + 1;

  if (isLoopingState(anim.state)) {
    // 루프 애니메이션: 처음으로 돌아감
    return {
      ...anim,
      frameIndex: nextFrameIndex % frameCount,
      elapsedMs: newElapsed - frameDuration,
    };
  }

  // one-shot 애니메이션
  if (nextFrameIndex >= frameCount) {
    // 마지막 프레임에서 완료
    return {
      ...anim,
      frameIndex: frameCount - 1,
      elapsedMs: 0,
      isComplete: true,
    };
  }

  // 다음 프레임으로 진행
  return {
    ...anim,
    frameIndex: nextFrameIndex,
    elapsedMs: newElapsed - frameDuration,
  };
}

export function resetAnimation(state: AnimState): AnimationState {
  return {
    state,
    frameIndex: 0,
    elapsedMs: 0,
    isComplete: false,
  };
}
