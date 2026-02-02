import { getCurrentWindow, cursorPosition } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

import type { MaengguApi } from '../preload/index'
import { DEFAULT_SAVE_DATA, type SaveData, type SaveLoadResult } from '../shared/types'

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
        // 데스크탑 기준 커서 위치와 창 위치를 가져와서
        // 창 내부 좌표로 변환 (getBoundingClientRect 기준과 동일하게)
        const [cursor, windowPos] = await Promise.all([
          cursorPosition(),
          appWindow.innerPosition(),
        ])
        return {
          x: cursor.x - windowPos.x,
          y: cursor.y - windowPos.y,
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
