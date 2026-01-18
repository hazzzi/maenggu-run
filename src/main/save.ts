import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { SAVE_FILE_NAME } from '../shared/constants'
import { DEFAULT_SAVE_DATA, SaveData, SaveLoadResult } from '../shared/types'

function getSaveFilePath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, SAVE_FILE_NAME)
}

function isValidSaveData(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  if (obj.version !== 1) return false
  if (typeof obj.snacks !== 'number') return false
  if (typeof obj.stats !== 'object' || obj.stats === null) return false

  const stats = obj.stats as Record<string, unknown>
  if (typeof stats.totalClicks !== 'number') return false
  if (typeof stats.totalFeedings !== 'number') return false
  if (typeof stats.peakSnacks !== 'number') return false
  if (typeof stats.sessionPlaytime !== 'number') return false

  return true
}

export async function loadSaveData(): Promise<SaveLoadResult> {
  const filePath = getSaveFilePath()

  try {
    const content = await readFile(filePath, 'utf-8')
    const parsed: unknown = JSON.parse(content)

    if (!isValidSaveData(parsed)) {
      return { success: false, error: 'Invalid save data schema' }
    }

    return { success: true, data: parsed }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { success: true, data: DEFAULT_SAVE_DATA }
    }

    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function saveSaveData(data: SaveData): Promise<void> {
  const filePath = getSaveFilePath()
  const dir = path.dirname(filePath)

  await mkdir(dir, { recursive: true })
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
