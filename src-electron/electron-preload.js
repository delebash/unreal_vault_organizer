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

const fetch = require('node-fetch');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const child = require('child_process')
import {contextBridge, clipboard} from 'electron'


let results
contextBridge.exposeInMainWorld('myNodeApi', {

  launchSniffer: (snifferPath, launcherPath) => {
    const sniffer = child.spawn(snifferPath);
    const launcher = child.spawn(launcherPath);
    return new Promise(resolve => {
      sniffer.on('close', (code) => {
        results = clipboard.readText()
       // launcher.kill('SIGTERM');
        resolve(results)
      });
    });
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
