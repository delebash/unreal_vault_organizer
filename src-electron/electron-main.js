import {app, BrowserWindow, nativeTheme, Menu, ipcMain, shell, ipcRenderer} from 'electron'

const contextMenu = require('electron-context-menu');
import path from 'path'
import os from 'os'

const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) {
}

contextMenu({
  showSaveImageAs: true,
  showLookUpSelection: true,
  showSearchWithGoogle: true,
  showCopyImage: true,
  showSaveImage: true,
  showSaveLinkAs: true,
  showInspectElement: true,
  showCopyImageAddress: true,
});

let mainWindow
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
      },
    ]
  }
]

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.loadURL(process.env.APP_URL)

  // This is the actual solution
  mainWindow.webContents.on("new-window", function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.closeDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });
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

ipcMain.on("toMain", (event, data) => {
  // Send result back to renderer process
  // mainWindow.webContents.send("fromMain", 'jjjj');
  if (data.event === 'restart') {
    autoUpdater.quitAndInstall();
  }
})

//Auto Updater
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow({event: 'checking-for-update', msg: 'Checking for update...'});
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow({event: 'update-available', msg: 'update-available'});
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow({event: 'update-not-available', msg: 'update-not-available'});
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow({event: 'error', msg: 'Error in auto-updater. ' + err});
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow({event: 'download-progress', msg: log_message});
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow({event: 'update-downloaded', msg: 'Update downloaded'});
})

function sendStatusToWindow(data) {
  log.info(data.msg);
  mainWindow.webContents.send('fromMain', data);
}

//
// ipcMain.on('restart_app', () => {
//
// });
