import { ipcMain } from 'electron'

import { IPC_CHANNELS, SaveLoadResult } from '../../shared/types'
import { loadSaveData } from '../save'

export function registerSaveIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SAVE_LOAD, async (): Promise<SaveLoadResult> => {
    return loadSaveData()
  })
}
