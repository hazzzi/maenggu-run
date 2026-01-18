import { SAVE_DEBOUNCE_MS } from '../shared/constants'
import { debounce } from '../shared/utils'
import { saveSaveData } from './save'
import { getSnackState } from './snack-state'

async function performSave(): Promise<void> {
  const saveData = getSnackState().toSaveData()
  try {
    await saveSaveData(saveData)
  } catch (err) {
    console.error('[save-scheduler] Failed to save:', err)
  }
}

const debouncedSave = debounce(() => {
  void performSave()
}, SAVE_DEBOUNCE_MS)

export function scheduleSave(): void {
  debouncedSave()
}

export function cancelPendingSave(): void {
  debouncedSave.cancel()
}

export async function flushSave(): Promise<void> {
  debouncedSave.cancel()
  await performSave()
}
