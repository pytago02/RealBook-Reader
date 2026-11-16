const electron = require('electron');

// If executed by regular Node.js instead of Electron binary:
// `require('electron')` returns the path string to the electron executable.
if (typeof electron === 'string' || !electron.app) {
  const electronPath = typeof electron === 'string' ? electron : require('electron');
  const { spawn } = require('child_process');

  const cleanEnv = { ...process.env };
  delete cleanEnv.ELECTRON_RUN_AS_NODE;

  const child = spawn(electronPath, [__filename, ...process.argv.slice(2)], {
    stdio: 'inherit',
    windowsHide: false,
    env: cleanEnv,
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
} else {
  startApp(electron);
}

function startApp(electron) {
  const { app, BrowserWindow, Menu } = electron;
  const path = require('path');

  // Set Windows App User Model ID so the Windows Taskbar associates the custom icon and grouping correctly
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.realbook.reader');
  }

  // Dedicated data directory to prevent collisions
  app.setPath('userData', path.join(app.getPath('appData'), 'RealBookReader'));

  // Ensure only a single instance of the application runs to prevent database locks
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  let mainWindow = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    const isWin = process.platform === 'win32';
    // Use multi-layer ICO on Windows (16, 32, 48, 64, 128, 256) for crisp taskbar & titlebar; PNG on macOS/Linux
    const iconFile = isWin ? 'icon.ico' : 'icon.png';
    const iconPath = path.join(__dirname, '../public', iconFile);

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 800,
      minHeight: 560,
      backgroundColor: '#121316',
      title: 'RealBook Reader',
      icon: iconPath,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    if (isWin) {
      mainWindow.setIcon(iconPath);
    }

    Menu.setApplicationMenu(null);

    // Forward renderer console logs for easy debugging
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer] ${message} (${sourceId}:${line})`);
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(devUrl);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
