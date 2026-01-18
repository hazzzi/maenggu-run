import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, screen, Tray } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { IPC_CHANNELS } from '../shared/types'
import { registerSaveIpcHandlers } from './ipc/save'
import { registerSnackIpcHandlers } from './ipc/snack'
import { flushSave } from './save-scheduler'
import { getSnackState } from './snack-state'
import { loadSaveData } from './save'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null = null

function calculateCombinedDisplayBounds(): {
  x: number
  y: number
  width: number
  height: number
} {
  const displays = screen.getAllDisplays()

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const display of displays) {
    const { x, y, width, height } = display.bounds
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function createWindow(): void {
  const bounds = calculateCombinedDisplayBounds()

  win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setIgnoreMouseEvents(true, { forward: true })
  win.setAlwaysOnTop(true, 'screen-saver')
  win.setContentProtection(true)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createTray(): void {
  const iconPath = path.join(process.env.VITE_PUBLIC!, 'assets/idle/mangoo_defatult.png')
  const icon = nativeImage.createFromPath(iconPath)
  
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('Maenggu Run')
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  
  tray.setContextMenu(contextMenu)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('before-quit', async (event) => {
  event.preventDefault()
  await flushSave()
  app.exit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function registerMouseIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.MOUSE_COLLIDER, (_event, inCollider: boolean) => {
    if (!win) return

    if (inCollider) {
      win.setIgnoreMouseEvents(false)
    } else {
      win.setIgnoreMouseEvents(true, { forward: true })
    }
  })
}

app.whenReady().then(async () => {
  registerMouseIpcHandlers()
  registerSaveIpcHandlers()
  registerSnackIpcHandlers()

  const saveResult = await loadSaveData()
  if (saveResult.success) {
    getSnackState().initializeFromSave(saveResult.data)
  } else {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Save Data Error',
      message: 'Failed to load save data',
      detail: saveResult.error,
      buttons: ['Quit'],
    })
    app.quit()
    return
  }

  createWindow()
  createTray()
})
