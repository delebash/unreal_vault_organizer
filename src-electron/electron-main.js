import {app, BrowserWindow, nativeTheme, Menu, ipcMain, shell, Tray, clipboard} from 'electron'

const contextMenu = require('electron-context-menu');
import path from 'path'
import os from 'os'
import {execSync, exec, execFile} from "child_process";
import * as fs from "fs";
import fetch from 'node-fetch';

// import got from 'got'
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let tray = null;

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
    width: 1000,
    height: 600,
    useContentSize: true,
    icon: path.join(__dirname, 'icons/icon.ico'),
    center: true,
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
  // mainWindow.webContents.on("new-window", function (event, url) {
  //   event.preventDefault();
  //   shell.openExternal(url);
  // });

  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return { action: "deny" };
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

ipcMain.handle('installMitmSSL', async (_, args) => {
  const {execSync} = require("child_process");
  let cmd_str
//Launch mitmproxy to create initial certs and close
  cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList  "--scripts py_scripts/close_app.py"'
  execSync(cmd_str, {'shell': 'powershell.exe'});

// Install Certs
  cmd_str = 'Start-Process -Verb RunAs -FilePath "certutil.exe" -ArgumentList "-addstore root $home/.mitmproxy/mitmproxy-ca-cert.cer"'
  execSync(cmd_str, {'shell': 'powershell.exe'});
})

ipcMain.handle('launchSniffer', async (_, args) => {
  let cmd_str
  cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList "--mode transparent", "--scripts py_scripts/get_auth.py"'
  execSync(cmd_str, {'shell': 'powershell.exe'});
  // if (args[0] === true) {
  //   setTimeout(function() {
  //     execFile(args[1])
  //   }, 12000);
  //
  // }
  let results = clipboard.readText()
  return results
})

ipcMain.handle('get_build_versions', async (_, args) => {
  let arrItems = []
  let vault_cache_path = args
  console.log(vault_cache_path)
  fs.readdirSync(vault_cache_path, {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .forEach((element, index) => {
      let item_data = {}

      let file = path.join(vault_cache_path, element.name, 'manifest');
      if (fs.existsSync(file)) {

        let data = fs.readFileSync(file);
        let jsonData = JSON.parse(data.toString());
        item_data.installed = false;
        if (jsonData.CustomFields.InstallLocation) {
          item_data.installed = true;
          item_data.installed_location = jsonData.CustomFields.InstallLocation;
        }
        item_data.BuildVersionString = jsonData.BuildVersionString
        item_data.AppNameString = jsonData.AppNameString
        item_data.CatalogItemId = jsonData.CustomFields.CatalogItemId
        item_data.CatalogAssetName = jsonData.CustomFields.CatalogAssetName

        arrItems.push(item_data)
      }
    });

  return arrItems
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
