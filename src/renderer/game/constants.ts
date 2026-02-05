// 게임 루프 전용 상수

export const IDLE_TIME_RANGE = { min: 3000, max: 8000 } as const

export const MOVE_SPEED_RANGE = { min: 1, max: 2 } as const

export const SUMMON_SPEED = 4

export const SPRITE_SIZE = 32

// 픽셀 아트는 정수배 스케일에서만 깨끗하게 보임
// 1.5배 같은 비정수배는 픽셀이 일정하지 않게 렌더링됨
export const SPRITE_DISPLAY_SCALE = 2

export const SPRITE_DISPLAY_SIZE = SPRITE_SIZE * SPRITE_DISPLAY_SCALE

export const ANIMATION_FRAME_DURATION_MS = 200

// Sleep/탭 전환 후 deltaMs 폭주 방지 (60fps 기준 ~6프레임)
export const MAX_DELTA_MS = 100
