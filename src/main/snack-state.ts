import { BrowserWindow } from 'electron'

import { IPC_CHANNELS, SaveData, SaveDataStats } from '../shared/types'

export type SnackStateManager = {
  readonly getSnacks: () => number
  readonly getStats: () => SaveDataStats
  readonly add: (amount?: number) => void
  readonly spend: (amount?: number) => boolean
  readonly initializeFromSave: (data: SaveData) => void
  readonly toSaveData: () => SaveData
}

export function createSnackStateManager(): SnackStateManager {
  let snacks = 0
  let stats: SaveDataStats = {
    totalClicks: 0,
    totalFeedings: 0,
    peakSnacks: 0,
    sessionPlaytime: 0,
  }

  function broadcastUpdate(): void {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send(IPC_CHANNELS.SNACK_UPDATE, snacks)
    }
  }

  function updatePeakSnacks(): void {
    if (snacks > stats.peakSnacks) {
      stats = { ...stats, peakSnacks: snacks }
    }
  }

  return {
    getSnacks: () => snacks,
    getStats: () => stats,

    add: (amount = 1) => {
      snacks += amount
      stats = { ...stats, totalClicks: stats.totalClicks + 1 }
      updatePeakSnacks()
      broadcastUpdate()
    },

    spend: (amount = 1) => {
      if (snacks < amount) return false

      snacks -= amount
      stats = { ...stats, totalFeedings: stats.totalFeedings + 1 }
      broadcastUpdate()
      return true
    },

    initializeFromSave: (data: SaveData) => {
      snacks = data.snacks
      stats = { ...data.stats }
    },

    toSaveData: (): SaveData => ({
      version: 1,
      snacks,
      stats,
    }),
  }
}

let snackStateInstance: SnackStateManager | null = null

export function getSnackState(): SnackStateManager {
  if (!snackStateInstance) {
    snackStateInstance = createSnackStateManager()
  }
  return snackStateInstance
}
