import {app, BrowserWindow, nativeTheme, Menu, ipcMain, shell, Tray, clipboard} from 'electron'

import contextMenu from 'electron-context-menu';
import {execSync} from "child_process";
import * as fs from "fs";
import fetch from 'node-fetch';
import log from 'electron-log';
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import {ENDPOINTS, VARS} from 'src/globals.js'
autoUpdater.logger = log;
log.info('App starting...');

const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let tray = null;


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
    width: 1000,
    height: 600,
    useContentSize: true,
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    center: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      )
    }
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  mainWindow.loadURL(process.env.APP_URL)
  // This is the actual solution
  // mainWindow.webContents.on("new-window", function (event, url) {
  //   event.preventDefault();
  //   shell.openExternal(url);
  // });

  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return {action: "deny"};
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

  // mainWindow.on('minimize', function (event) {
  //   event.preventDefault();
  //   mainWindow.hide();
  //   tray = createTray();
  // });

  // mainWindow.on('restore', function (event) {
  //   mainWindow.show();
  //   tray.destroy();
  // });


  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    sendStatusToWindow({event: 'checking-for-update', msg: 'Checking for update...'});
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

function createTray() {
  let appIcon = new Tray(path.join(__dirname, "icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show', click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Exit', click: function () {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  appIcon.on('double-click', function (event) {
    mainWindow.show();
  });
  appIcon.setToolTip('Tray Tutorial');
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}

ipcMain.handle('get_build_versions', async (_, args) => {
  let arrItems = []
  let vault_cache_path = args
  let jsonData

  fs.readdirSync(vault_cache_path, {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .forEach((element, index) => {
      let item_data = {}

      let file = path.join(vault_cache_path, element.name, 'manifest');
      if (fs.existsSync(file)) {

        let data = fs.readFileSync(file);
        try {
          jsonData = JSON.parse(data.toString())
          item_data.installed = false;
          item_data.installed_location = "";
          if (jsonData.CustomFields.InstallLocation) {
            item_data.installed = true;
            item_data.installed_location = jsonData.CustomFields.InstallLocation;
          }

            item_data.BuildVersionString = jsonData.BuildVersionString
            item_data.AppNameString = jsonData.AppNameString
            item_data.CatalogItemId = jsonData.CustomFields.CatalogItemId
            item_data.CatalogAssetName = jsonData.CustomFields.CatalogAssetName

            arrItems.push(item_data)

        } catch (error) {
          console.log(error)
        }
      }
    });

  return arrItems
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

ipcMain.handle('api_fetch', async (_, args) => {
  let fetch_options = args
  let response
  if (fetch_options.method === 'POST') {
    response = await fetch(fetch_options.url, {
      method: fetch_options.method,
      headers: fetch_options.headers,
      body: fetch_options.body
    });
  } else {
    response = await fetch(fetch_options.url, {
      method: fetch_options.method,
      headers: fetch_options.headers
    });
  }
  let json = await response.json();
  return json
})
ipcMain.handle('get_ue_vault', async (_, data) => {

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${data.token_type} ${data.access_token}`,
    'User-Agent': VARS.client_ua
  }
  // console.log(headers)
  // console.log(data)

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
