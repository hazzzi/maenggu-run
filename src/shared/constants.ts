// main process + renderer 공용 상수

export const APP_NAME = 'maenggu-run'

export const SAVE_FILE_NAME = 'save.json'

export const SAVE_DEBOUNCE_MS = 500

// 게임 상수 re-export (기존 코드 호환성 유지, 리팩터링 완료 후 제거 예정)
// TODO: 리팩터링 완료 후 이 re-export 제거
export {
  IDLE_TIME_RANGE,
  MOVE_SPEED_RANGE,
  SPRITE_SIZE,
  ANIMATION_FRAME_DURATION_MS,
} from '../renderer/game/constants'
