export type SaveDataStats = {
  readonly totalClicks: number
  readonly totalFeedings: number
  readonly peakSnacks: number
  readonly sessionPlaytime: number
}

export type SaveData = {
  readonly version: 1
  readonly snacks: number
  readonly stats: SaveDataStats
}

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  snacks: 0,
  stats: {
    totalClicks: 0,
    totalFeedings: 0,
    peakSnacks: 0,
    sessionPlaytime: 0,
  },
} as const

export type MaengguState = 'idle' | 'walk' | 'eat' | 'happy'

export type Position = {
  readonly x: number
  readonly y: number
}

export type FacingDirection = 'left' | 'right'

export const IPC_CHANNELS = {
  SNACK_ADD: 'snack:add',
  SNACK_SPEND: 'snack:spend',
  SNACK_UPDATE: 'snack:update',
  SAVE_LOAD: 'save:load',
  MOUSE_COLLIDER: 'mouse:collider',
} as const

export type IpcChannels = typeof IPC_CHANNELS

export type SaveLoadResult =
  | { success: true; data: SaveData }
  | { success: false; error: string }
