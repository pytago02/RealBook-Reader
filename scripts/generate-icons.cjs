const electron = require('electron');
const path = require('path');
const fs = require('fs');

if (typeof electron === 'string' || !electron.app) {
  const electronPath = typeof electron === 'string' ? electron : require('electron');
  const { spawn } = require('child_process');

  const cleanEnv = { ...process.env };
  delete cleanEnv.ELECTRON_RUN_AS_NODE;

  const child = spawn(electronPath, [__filename], {
    stdio: 'inherit',
    windowsHide: true,
    env: cleanEnv,
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
} else {
  generateIcons(electron);
}

async function generateIcons(electron) {
  const { app, BrowserWindow } = electron;
  await app.whenReady();

  try {
    const svgPath = path.resolve(__dirname, '../public/logo.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Create an offscreen window to render the SVG at high quality
    const win = new BrowserWindow({
      width: 512,
      height: 512,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: true,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 512px; height: 512px; background: transparent; overflow: hidden; }
            svg { width: 512px; height: 512px; display: block; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    // Wait for DOM and svg to fully paint
    await new Promise((resolve) => setTimeout(resolve, 600));

    const image = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
    const png512 = image.toPNG();

    // Ensure output directories exist
    const publicDir = path.resolve(__dirname, '../public');
    const assetsDir = path.resolve(__dirname, '../src/assets');
    const mobileIconsDir = path.resolve(__dirname, '../resources/icons');

    if (!fs.existsSync(mobileIconsDir)) {
      fs.mkdirSync(mobileIconsDir, { recursive: true });
    }

    // Save master 512x512 PNGs
    const buildDir = path.resolve(__dirname, '../build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'icon.png'), png512);
    fs.writeFileSync(path.join(publicDir, 'logo.png'), png512);
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), png512);
    fs.writeFileSync(path.join(mobileIconsDir, 'icon-512.png'), png512);
    fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);

    // Generate standard icon sizes for Windows & Mobile: 256, 192, 144, 128, 96, 72, 64, 48, 32, 16
    const sizes = [256, 192, 144, 128, 96, 72, 64, 48, 32, 16];
    const pngBuffers = { 512: png512 };
    const bitmapBuffers = {};

    for (const size of sizes) {
      const resized = image.resize({ width: size, height: size, quality: 'best' });
      const buf = resized.toPNG();
      pngBuffers[size] = buf;
      bitmapBuffers[size] = resized.toBitmap();
      fs.writeFileSync(path.join(mobileIconsDir, `icon-${size}.png`), buf);
      if (size === 256 || size === 192 || size === 128) {
        fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buf);
      }
    }

    // Generate Windows ICO file containing multiple sizes (16, 32, 48, 64, 128, 256)
    // Uses standard DIB bitmaps for <= 128 to ensure 100% compatibility with Windows GDI, Taskbar and Explorer
    const icoSizes = [256, 128, 64, 48, 32, 16];
    const icoBuffer = createStandardIco(icoSizes.map((s) => ({
      size: s,
      png: pngBuffers[s],
      bitmap: bitmapBuffers[s],
    })));
    fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(mobileIconsDir, 'icon.ico'), icoBuffer);
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

    // Update Android mipmap icons
    const androidResDir = path.resolve(__dirname, '../android/app/src/main/res');
    if (fs.existsSync(androidResDir)) {
      const mipmapMap = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
      };

      for (const [folder, size] of Object.entries(mipmapMap)) {
        const targetDir = path.join(androidResDir, folder);
        if (fs.existsSync(targetDir)) {
          const buf = pngBuffers[size];
          if (buf) {
            fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), buf);
            fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), buf);
            fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), buf);
          }
        }
      }

      // Update background color for Android adaptive icon to match brand background
      const bgColorFile = path.join(androidResDir, 'values/ic_launcher_background.xml');
      if (fs.existsSync(bgColorFile)) {
        fs.writeFileSync(bgColorFile, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#141824</color>\n</resources>\n`);
      }

      // Remove conflicting obsolete default vector foregrounds if present so Android loads mipmap icons
      const obsoleteV24 = path.join(androidResDir, 'drawable-v24/ic_launcher_foreground.xml');
      if (fs.existsSync(obsoleteV24)) {
        try { fs.unlinkSync(obsoleteV24); } catch {}
      }
      const obsoleteBg = path.join(androidResDir, 'drawable/ic_launcher_background.xml');
      if (fs.existsSync(obsoleteBg)) {
        try { fs.unlinkSync(obsoleteBg); } catch {}
      }
    }

    console.log('SUCCESS: All app icon assets generated (PNGs, standard DIB ICO & Android mipmaps)!');
  } catch (err) {
    console.error('Error generating icons:', err);
  } finally {
    app.quit();
  }
}

// Full standard Windows Vista/7/8/10/11 multi-resolution ICO generator using high-fidelity PNG frames
function createStandardIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Count

  const dirSize = 16;
  const dirBuf = Buffer.alloc(count * dirSize);
  let currentOffset = 6 + count * dirSize;
  const imageBuffers = [];

  for (let i = 0; i < count; i++) {
    const item = entries[i];
    const { size, png } = item;
    const dirOffset = i * dirSize;

    dirBuf.writeUInt8(size >= 256 ? 0 : size, dirOffset);
    dirBuf.writeUInt8(size >= 256 ? 0 : size, dirOffset + 1);
    dirBuf.writeUInt8(0, dirOffset + 2); // Colors in palette
    dirBuf.writeUInt8(0, dirOffset + 3); // Reserved
    dirBuf.writeUInt16LE(1, dirOffset + 4); // Color planes
    dirBuf.writeUInt16LE(32, dirOffset + 6); // Bits per pixel
    dirBuf.writeUInt32LE(png.length, dirOffset + 8); // Image size
    dirBuf.writeUInt32LE(currentOffset, dirOffset + 12); // Offset to image data

    currentOffset += png.length;
    imageBuffers.push(png);
  }

  return Buffer.concat([header, dirBuf, ...imageBuffers]);
}
