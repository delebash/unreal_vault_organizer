

// const {execSync} = require("child_process");
//
// let cmd_str
// cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList  "--scripts py_scripts/close_app.py"'
// execSync(cmd_str, {'shell': 'powershell.exe'});


import {execSync} from 'child_process';
let cmd_str
//Launch mitmproxy to create initial certs and close
cmd_str = 'Start-Process -Verb RunAs -Wait -FilePath "mitmproxy/mitmproxy.exe" -ArgumentList  "--scripts py_scripts/close_app.py"'
execSync(cmd_str, {'shell': 'powershell.exe'});

// // Install Certs
cmd_str = 'Start-Process -Verb RunAs -FilePath "certutil.exe" -ArgumentList "-addstore root $home/.mitmproxy/mitmproxy-ca-cert.cer"'
execSync(cmd_str, {'shell': 'powershell.exe'});
