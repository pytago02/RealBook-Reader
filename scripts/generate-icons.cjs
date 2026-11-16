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
    fs.writeFileSync(path.join(publicDir, 'icon.png'), png512);
    fs.writeFileSync(path.join(publicDir, 'logo.png'), png512);
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), png512);
    fs.writeFileSync(path.join(mobileIconsDir, 'icon-512.png'), png512);

    // Generate standard icon sizes for Windows & Mobile: 256, 192, 128, 96, 64, 48, 32, 16
    const sizes = [256, 192, 144, 128, 96, 72, 64, 48, 32, 16];
    const pngBuffers = { 512: png512 };

    for (const size of sizes) {
      const resized = image.resize({ width: size, height: size, quality: 'best' });
      const buf = resized.toPNG();
      pngBuffers[size] = buf;
      fs.writeFileSync(path.join(mobileIconsDir, `icon-${size}.png`), buf);
      if (size === 256 || size === 192 || size === 128) {
        fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buf);
      }
    }

    // Generate Windows ICO file containing multiple sizes (16, 32, 48, 64, 128, 256)
    const icoSizes = [256, 128, 64, 48, 32, 16];
    const icoBuffer = createIco(icoSizes.map((s) => ({ size: s, data: pngBuffers[s] })));
    fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(mobileIconsDir, 'icon.ico'), icoBuffer);

    console.log('SUCCESS: All app icon assets generated (PNGs & ICO)!');
  } catch (err) {
    console.error('Error generating icons:', err);
  } finally {
    app.quit();
  }
}

// Minimal standard ICO generator from PNG buffers
function createIco(images) {
  const count = images.length;
  // Header: 6 bytes (2 reserved, 2 type [1=ICO], 2 count)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  // Each directory entry: 16 bytes
  const dirSize = 16;
  const entries = Buffer.alloc(count * dirSize);
  let currentOffset = 6 + count * dirSize;

  const dataBuffers = [];

  for (let i = 0; i < count; i++) {
    const { size, data } = images[i];
    const offset = i * dirSize;

    entries.writeUInt8(size >= 256 ? 0 : size, offset); // Width (0 means 256)
    entries.writeUInt8(size >= 256 ? 0 : size, offset + 1); // Height (0 means 256)
    entries.writeUInt8(0, offset + 2); // Color palette
    entries.writeUInt8(0, offset + 3); // Reserved
    entries.writeUInt16LE(1, offset + 4); // Color planes
    entries.writeUInt16LE(32, offset + 6); // Bits per pixel
    entries.writeUInt32LE(data.length, offset + 8); // Image size in bytes
    entries.writeUInt32LE(currentOffset, offset + 12); // Offset to image data

    currentOffset += data.length;
    dataBuffers.push(data);
  }

  return Buffer.concat([header, entries, ...dataBuffers]);
}
