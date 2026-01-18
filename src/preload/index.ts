import { contextBridge, ipcRenderer } from 'electron'

import { IPC_CHANNELS, SaveLoadResult } from '../shared/types'

export type MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => void
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

const maengguApi: MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => {
      ipcRenderer.send(IPC_CHANNELS.MOUSE_COLLIDER, inCollider)
    },
  },
  save: {
    load: () => ipcRenderer.invoke(IPC_CHANNELS.SAVE_LOAD),
  },
  snack: {
    add: (amount?: number) => {
      ipcRenderer.send(IPC_CHANNELS.SNACK_ADD, amount)
    },
    spend: (amount?: number) => {
      return ipcRenderer.invoke(IPC_CHANNELS.SNACK_SPEND, amount)
    },
    onUpdate: (callback: (snacks: number) => void) => {
      const listener = (_event: unknown, snacks: number) => callback(snacks)
      ipcRenderer.on(IPC_CHANNELS.SNACK_UPDATE, listener)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.SNACK_UPDATE, listener)
      }
    },
  },
}

contextBridge.exposeInMainWorld('maenggu', maengguApi)
