// 게임 루프 전용 상수

export const IDLE_TIME_RANGE = { min: 3000, max: 8000 } as const

export const MOVE_SPEED_RANGE = { min: 2, max: 4 } as const

export const SPRITE_SIZE = 32

export const SPRITE_DISPLAY_SCALE = 2

export const SPRITE_DISPLAY_SIZE = SPRITE_SIZE * SPRITE_DISPLAY_SCALE

export const ANIMATION_FRAME_DURATION_MS = 200
