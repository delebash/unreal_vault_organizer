import {app, BrowserWindow, nativeTheme, Menu, ipcMain, shell, Tray, clipboard} from 'electron'
import path from 'node:path'
import os from 'node:os'
import {fileURLToPath} from 'node:url'
import pkg from 'electron-updater'

const {autoUpdater} = pkg
import log from 'electron-log'
import contextMenu from 'electron-context-menu'
import {ENDPOINTS, VARS} from '../src/api/globals'
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))

autoUpdater.logger = log
log.info('App starting...')

contextMenu({
  showSaveImageAs: true,
  showLookUpSelection: true,
  showSearchWithGoogle: true,
  showCopyImage: true,
  showSaveImage: true,
  showSaveLinkAs: true,
  showInspectElement: true,
  showCopyImageAddress: true
})
const template = [
  {
    label: 'File',
    submenu: [
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      }
    ]
  },

  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },

  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About',
        role: 'about'
      }
    ]
  }
]
let mainWindow


function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      )
    }
  })


  // mainWindow.maximize()
  // mainWindow.webContents.openDevTools()

//Cors bypass
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const {requestHeaders} = details
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])
      callback({requestHeaders})
    }
  )

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const {responseHeaders} = details
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
    callback({
      responseHeaders
    })
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {action: 'deny'}
  })
  mainWindow.once('ready-to-show', () => {
    sendStatusToWindow({event: 'checking-for-update', msg: 'Checking for update...'})
    autoUpdater.checkForUpdates()
  })


  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL)
  } else {
    mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
    mainWindow.webContents.openDevTools({mode: 'right'})
    mainWindow.maximize()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


ipcMain.handle('get_ue_access_token', async (_, authCode) => {
  const response = await fetch(ENDPOINTS.auth_code, {
    method: 'post',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      token_type: 'eg1'
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${VARS.client_cred_base64}`,
      'User-Agent': VARS.client_ua
    }
  })
  return await response.json()
})

ipcMain.handle('get_ue_vault', async (_, data) => {

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${data.authData.token_type} ${data.authData.access_token}`,
    'User-Agent': VARS.client_ua
  }

  try {
    const response = await fetch(data.url, {
      headers: headers
    })
    let json = await response.json()
    return json
  } catch (error) {
    console.log(error)
  }
})

ipcMain.on('toMain', (event, data) => {
  // Send result back to renderer process
  // mainWindow.webContents.send("fromMain", 'jjjj');
  if (data.event === 'restart') {
    autoUpdater.quitAndInstall()
  }
})

//Auto Updater
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow({event: 'checking-for-update', msg: 'Checking for update...'})
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow({event: 'update-available', msg: 'update-available'})
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow({event: 'update-not-available', msg: 'update-not-available'})
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow({event: 'error', msg: 'Error in auto-updater. ' + err})
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  sendStatusToWindow({event: 'download-progress', msg: log_message})
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow({event: 'update-downloaded', msg: 'Update downloaded'})
})

function sendStatusToWindow(data) {
  log.info(data.msg)
  mainWindow.webContents.send('fromMain', data)
}

function UpsertKeyValue(obj, keyToChange, value) {
  const keyToChangeLower = keyToChange.toLowerCase()
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value
      // Done
      return
    }
  }
  // Insert at end instead
  obj[keyToChange] = value
}
