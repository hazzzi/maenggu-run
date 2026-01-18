import { contextBridge, ipcRenderer } from 'electron'

import { IPC_CHANNELS, SaveLoadResult } from '../shared/types'

export type MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => void
  }
  save: {
    load: () => Promise<SaveLoadResult>
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
}

contextBridge.exposeInMainWorld('maenggu', maengguApi)
