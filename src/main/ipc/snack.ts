import { ipcMain } from 'electron'

import { IPC_CHANNELS } from '../../shared/types'
import { scheduleSave } from '../save-scheduler'
import { getSnackState } from '../snack-state'

export function registerSnackIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.SNACK_ADD, (_event, amount?: number) => {
    getSnackState().add(amount)
    scheduleSave()
  })

  ipcMain.handle(
    IPC_CHANNELS.SNACK_SPEND,
    (_event, amount?: number): boolean => {
      const success = getSnackState().spend(amount)
      if (success) {
        scheduleSave()
      }
      return success
    }
  )
}
