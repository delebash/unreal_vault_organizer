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
import {contextBridge, clipboard, ipcRenderer} from 'electron';
import {execSync, exec, execFile} from "child_process";


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
  installMitmSSL: () => {
    const {execSync} = require("child_process");
    let cmd_str
//Launch mitmproxy to create initial certs and close
    cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList  "--scripts py_scripts/close_app.py"'
    execSync(cmd_str, {'shell': 'powershell.exe'});

// Install Certs
    cmd_str = 'Start-Process -Verb RunAs -FilePath "certutil.exe" -ArgumentList "-addstore root $home/.mitmproxy/mitmproxy-ca-cert.cer"'
    execSync(cmd_str, {'shell': 'powershell.exe'});

  },

  launchSniffer: (launch_unreal, launcher_path) => {
    let cmd_str
    cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList "--mode transparent", "--scripts py_scripts/get_auth.py"'
    execSync(cmd_str, {'shell': 'powershell.exe'});
    if (launch_unreal === true) {
      setTimeout(function() {
        execFile(launcher_path)
      }, 12000);

    }
    results = clipboard.readText()
    return results
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

