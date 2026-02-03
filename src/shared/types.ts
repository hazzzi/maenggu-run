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

export type SaveLoadResult =
  | { success: true; data: SaveData }
  | { success: false; error: string }

// Cursor position type for mouse collider
export type CursorPosition = {
  readonly x: number
  readonly y: number
}

// Maenggu API interface exposed to renderer
export type MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => void
    getCursorPosition: () => Promise<CursorPosition | null>
  }
  save: {
    load: () => Promise<SaveLoadResult>
  }
  snack: {
    add: (amount?: number) => void
    spend: (amount?: number) => Promise<boolean>
    onUpdate: (callback: (snacks: number) => void) => () => void
  }
}
