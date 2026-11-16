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
  const { app, BrowserWindow, Menu, nativeImage } = electron;
  const fs = require('fs');
  const path = require('path');

  // Set Windows App User Model ID so the Windows Taskbar associates the custom icon and grouping correctly
  if (process.platform === 'win32') {
    if (app.isPackaged) {
      app.setAppUserModelId('com.realbook.reader');
    } else {
      // In dev mode, using process.execPath allows the custom window icon to bind directly to the taskbar item
      app.setAppUserModelId(process.execPath);
    }
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
    const iconPathIco = path.join(__dirname, '../public/icon.ico');
    const iconPathPng = path.join(__dirname, '../public/icon.png');
    let appIcon = null;

    if (fs.existsSync(iconPathPng)) {
      const pngImg = nativeImage.createFromPath(iconPathPng);
      if (!pngImg.isEmpty()) {
        appIcon = pngImg;
      }
    }
    if (!appIcon && fs.existsSync(iconPathIco)) {
      const icoImg = nativeImage.createFromPath(iconPathIco);
      if (!icoImg.isEmpty()) {
        appIcon = icoImg;
      }
    }

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 800,
      minHeight: 560,
      backgroundColor: '#121316',
      title: 'RealBook Reader',
      icon: appIcon || (isWin ? iconPathIco : iconPathPng),
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    if (appIcon) {
      mainWindow.setIcon(appIcon);
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
