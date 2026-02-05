import { getCurrentWindow, cursorPosition } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

import {
  DEFAULT_SAVE_DATA,
  type MaengguApi,
  type MonitorBounds,
  type SaveData,
  type SaveLoadResult,
} from '../shared/types'

const appWindow = getCurrentWindow()

export const tauriMaengguApi: MaengguApi = {
  mouse: {
    setCollider: (inCollider: boolean) => {
      // inCollider가 true면 클릭 가능 (ignore = false)
      // inCollider가 false면 클릭 통과 (ignore = true)
      appWindow.setIgnoreCursorEvents(!inCollider)
    },
    getCursorPosition: async () => {
      try {
        const [cursor, windowPos] = await Promise.all([
          cursorPosition(),
          appWindow.outerPosition(),
        ])
        // cursorPosition()은 스크린 좌표 (physical pixels)
        // outerPosition()은 창 위치 (physical pixels)
        // 창 내부 좌표 = 스크린 좌표 - 창 위치
        const scale = window.devicePixelRatio || 1
        return {
          x: (cursor.x - windowPos.x) / scale,
          y: (cursor.y - windowPos.y) / scale,
        }
      } catch {
        return null
      }
    },
  },
  save: {
    load: async (): Promise<SaveLoadResult> => {
      try {
        const data = await invoke<SaveData | null>('load_save')
        if (data) {
          return { success: true, data }
        }
        return { success: true, data: DEFAULT_SAVE_DATA }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },
  snack: {
    add: (amount?: number) => {
      invoke('snack_add', { amount: amount ?? 1 })
    },
    spend: async (amount?: number): Promise<boolean> => {
      try {
        return await invoke<boolean>('snack_spend', { amount: amount ?? 1 })
      } catch {
        return false
      }
    },
    onUpdate: (callback: (snacks: number) => void): (() => void) => {
      let unlisten: UnlistenFn | null = null

      listen<number>('snack_update', (event) => {
        callback(event.payload)
      }).then((fn) => {
        unlisten = fn
      })

      return () => {
        unlisten?.()
      }
    },
  },
  summon: {
    onSummon: (callback: () => void): (() => void) => {
      let unlisten: UnlistenFn | null = null

      listen('summon', () => {
        callback()
      }).then((fn) => {
        unlisten = fn
      })

      return () => {
        unlisten?.()
      }
    },
  },
  monitor: {
    getBounds: async (): Promise<MonitorBounds | null> => {
      try {
        return await invoke<MonitorBounds | null>('get_monitor_bounds')
      } catch {
        return null
      }
    },
  },
}

// Tauri 환경인지 확인
export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

// window.maenggu에 Tauri API 바인딩
export function initTauriApi(): void {
  if (isTauri()) {
    ;(window as Window).maenggu = tauriMaengguApi
  }
}
