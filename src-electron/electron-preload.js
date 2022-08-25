/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import {contextBridge, ipcRenderer} from 'electron';


contextBridge.exposeInMainWorld('myNodeApi', {
  send: (channel, data) => {
    let validChannels = ["toMain"]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender` and is a security risk
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  installMitmSSL: async () =>
    ipcRenderer.invoke('installMitmSSL'),
  launchSniffer: async () =>
    ipcRenderer.invoke('launchSniffer'),
  get_build_versions: async (vault_cache_path) =>
    ipcRenderer.invoke('get_build_versions', vault_cache_path),
  api_fetch: async (fetch_options) =>
    ipcRenderer.invoke(fetch_options),
  restart: async () =>
    ipcRenderer.invoke('restart')
})
