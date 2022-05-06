import { app, BrowserWindow, nativeTheme, Menu, MenuItem , shell} from 'electron'
const contextMenu = require('electron-context-menu');
import path from 'path'
import os from 'os'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }


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

function createWindow () {
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
  let defaultMenu = Menu.getApplicationMenu()

  let newMenu = new Menu();
  defaultMenu.items
    .filter(x => x.role != 'help')
    .forEach(x => {
      if(x.role == 'viewmenu' && process.env.NODE_ENV == 'production') {
        // let newSubmenu = new Menu();
        //
        // x.submenu.items.filter(y => y.role != 'toggledevtools').forEach(y => newSubmenu.append(y));
        //
        // x.submenu = newSubmenu;
        //
        // newMenu.append(
        //   new MenuItem({
        //     type: x.type,
        //     label: x.label,
        //     submenu: newSubmenu
        //   })
        // );
      } else {
        newMenu.append(x);
      }
    })

  Menu.setApplicationMenu(newMenu);

  //mainWindow.setMenu(null);
  mainWindow.loadURL(process.env.APP_URL)

  // This is the actual solution
  mainWindow.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    // com.epicgames.launcher://ue/marketplace/item/
    console.log(url)
    shell.openExternal(url);
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
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