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
    const appPath = app.getAppPath();

    // Resolve icon paths across dev and production builds
    const icoCandidates = [
      path.join(__dirname, '../public/icon.ico'),
      path.join(__dirname, '../dist/icon.ico'),
      path.join(appPath, 'public/icon.ico'),
      path.join(appPath, 'dist/icon.ico'),
      path.resolve(process.cwd(), 'public/icon.ico'),
    ];
    const pngCandidates = [
      path.join(__dirname, '../public/icon.png'),
      path.join(__dirname, '../dist/icon.png'),
      path.join(appPath, 'public/icon.png'),
      path.join(appPath, 'dist/icon.png'),
      path.resolve(process.cwd(), 'public/icon.png'),
    ];

    let iconPath = null;
    if (isWin) {
      iconPath = icoCandidates.find((p) => fs.existsSync(p)) || pngCandidates.find((p) => fs.existsSync(p));
    } else {
      iconPath = pngCandidates.find((p) => fs.existsSync(p)) || icoCandidates.find((p) => fs.existsSync(p));
    }

    let appIcon = null;
    if (iconPath && fs.existsSync(iconPath)) {
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) {
        appIcon = img;
      }
    }

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 800,
      minHeight: 560,
      backgroundColor: '#121316',
      title: 'RealBook Reader',
      icon: iconPath || appIcon,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    if (iconPath) {
      try {
        mainWindow.setIcon(iconPath);
      } catch {
        if (appIcon) mainWindow.setIcon(appIcon);
      }
    } else if (appIcon) {
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
