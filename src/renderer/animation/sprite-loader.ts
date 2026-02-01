// TODO: 리팩터링 완료 후 이 파일 삭제
// 기존 코드 호환성을 위한 re-export
export { getSpriteManifest, getSpriteFrameUrls, getFrameCount } from '../game/sprite-loader'

// 기존 코드에서 사용하던 SpriteState 타입 호환성
export type SpriteState = 'idle' | 'walk' | 'eat' | 'happy'
