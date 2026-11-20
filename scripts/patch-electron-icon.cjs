const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function patchElectronBinary() {
  if (process.platform !== 'win32') {
    return;
  }

  const icoPath = path.resolve(__dirname, '../public/icon.ico');
  const electronExe = path.resolve(__dirname, '../node_modules/electron/dist/electron.exe');
  const rceditExe = path.resolve(__dirname, '../node_modules/electron-winstaller/vendor/rcedit.exe');

  if (!fs.existsSync(icoPath)) {
    console.warn('[patch-electron-icon] public/icon.ico not found, skipping patch.');
    return;
  }

  if (!fs.existsSync(electronExe)) {
    console.warn('[patch-electron-icon] node_modules/electron/dist/electron.exe not found, skipping patch.');
    return;
  }

  if (!fs.existsSync(rceditExe)) {
    console.warn('[patch-electron-icon] rcedit.exe not found, skipping patch.');
    return;
  }

  try {
    execFileSync(rceditExe, [
      electronExe,
      '--set-icon', icoPath,
      '--set-version-string', 'FileDescription', 'RealBook Reader',
      '--set-version-string', 'ProductName', 'RealBook Reader',
      '--set-version-string', 'CompanyName', 'RealBook Reader',
      '--set-version-string', 'LegalCopyright', 'Copyright © 2026 RealBook Reader'
    ], { stdio: 'inherit' });
    console.log('[patch-electron-icon] Successfully injected RealBook Reader icon and metadata into electron.exe!');
  } catch (err) {
    // If electron is already running, file may be locked
    console.warn('[patch-electron-icon] Notice: electron.exe could not be patched (it may currently be open):', err.message);
  }
}

patchElectronBinary();
