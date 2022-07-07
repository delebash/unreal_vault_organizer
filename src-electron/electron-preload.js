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

import fs from "fs";

const fetch = require('node-fetch');
const child = require('child_process')
import {contextBridge, clipboard, ipcRenderer} from 'electron'
import path from "path";

let results

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

  launchSniffer: (snifferPath, launcherPath,auto_launch) => {
    const sniffer = child.spawn(snifferPath);
    console.log(auto_launch)
    if(auto_launch === true) {
      const launcher = child.spawn(launcherPath);
    }
    return new Promise(resolve => {
      sniffer.on('close', (code) => {
        results = clipboard.readText()
        // launcher.kill('SIGTERM');
        console.log(results)
        resolve(results)
      });
    });
  },
  get_build_versions: (vault_cache_path) => {
    let arrItems = []
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
  },
  api_fetch: async (url, fetch_options) => {
    let response
    if (fetch_options.method === 'POST') {
      response = await fetch(url, {
        method: fetch_options.method,
        headers: fetch_options.headers,
        body: fetch_options.body
      });
    } else {
      response = await fetch(url, {
        method: fetch_options.method,
        headers: fetch_options.headers
      });
    }
    let json = await response.json();
    return json
  }
})
