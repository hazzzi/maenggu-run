import { ipcMain } from 'electron'

import { IPC_CHANNELS } from '../../shared/types'
import { getSnackState } from '../snack-state'

export function registerSnackIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.SNACK_ADD, (_event, amount?: number) => {
    getSnackState().add(amount)
  })

  ipcMain.handle(
    IPC_CHANNELS.SNACK_SPEND,
    (_event, amount?: number): boolean => {
      return getSnackState().spend(amount)
    }
  )
}
