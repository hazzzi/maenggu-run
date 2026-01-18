import { contextBridge, ipcRenderer } from 'electron'

import { IPC_CHANNELS } from '../src/shared/types'

export type MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => void
  }
}

const maengguApi: MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => {
      ipcRenderer.send(IPC_CHANNELS.MOUSE_COLLIDER, inCollider)
    },
  },
}

contextBridge.exposeInMainWorld('maenggu', maengguApi)
