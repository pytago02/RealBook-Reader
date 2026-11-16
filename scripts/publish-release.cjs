const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Get GitHub token from Git Credential Manager
const creds = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8'
});
const token = creds.split('\n').find(l => l.startsWith('password=')).split('=')[1].trim();

const repo = 'pytago02/RealBook-Reader';
const tag = 'v1.0.0';

async function main() {
  console.log('1. Checking or creating release', tag);

  // Check if release already exists
  let release;
  const listRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    headers: { 'Authorization': `token ${token}` }
  });
  const releases = await listRes.json();
  release = releases.find(r => r.tag_name === tag);

  if (!release) {
    console.log('Creating release for', tag);
    const createRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: 'main',
        name: 'RealBook Reader v1.0.0',
        body: `## 🎉 RealBook Reader v1.0.0 - Trải nghiệm đọc sách chân thực

### 📥 Tải xuống ứng dụng:
- **Windows (Cài đặt - Setup):** [\`RealBook.Reader.Setup.1.0.0.exe\`](https://github.com/${repo}/releases/download/v1.0.0/RealBook.Reader.Setup.1.0.0.exe)
- **Windows (Chạy ngay - Portable):** [\`RealBook.Reader.1.0.0.exe\`](https://github.com/${repo}/releases/download/v1.0.0/RealBook.Reader.1.0.0.exe)
- **Android (Mobile APK):** [\`RealBook-Reader.apk\`](https://github.com/${repo}/releases/download/v1.0.0/RealBook-Reader.apk)

---
### ✨ Tính năng nổi bật:
- **Đọc sách chân thực:** Lật trang 3D mượt mà, dàn trang đôi/đơn.
- **Bảo vệ mắt:** 5 chế độ đọc chuyên biệt.
- **Kho sách online 70.000+ cuốn:** Văn học Việt Nam & Tác phẩm kinh điển thế giới.
- **Đa ngôn ngữ:** Hỗ trợ đầy đủ tiếng Việt, Anh, Trung, Pháp, Tây Ban Nha, Nhật.`,
        draft: false,
        prerelease: false
      })
    });
    release = await createRes.json();
    console.log('Release created! ID:', release.id, release.html_url);
  } else {
    console.log('Release already exists! ID:', release.id, release.html_url);
  }

  // 2. Upload local Windows binaries if present in release/
  const uploadUrl = release.upload_url.split('{')[0];
  const filesToUpload = [
    {
      localPath: path.resolve(__dirname, '../release/RealBook Reader Setup 1.0.0.exe'),
      name: 'RealBook.Reader.Setup.1.0.0.exe'
    },
    {
      localPath: path.resolve(__dirname, '../release/RealBook Reader 1.0.0.exe'),
      name: 'RealBook.Reader.1.0.0.exe'
    },
    {
      localPath: path.resolve(__dirname, '../release/RealBook-Reader.apk'),
      name: 'RealBook-Reader.apk'
    }
  ];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.localPath)) {
      console.warn('File not found, skipping:', item.localPath);
      continue;
    }

    console.log(`Uploading ${item.name} (${(fs.statSync(item.localPath).size / 1024 / 1024).toFixed(1)} MB)...`);

    // Check if asset already exists in release
    const existingAsset = (release.assets || []).find(a => a.name === item.name);
    if (existingAsset) {
      console.log(`Asset ${item.name} already exists (ID: ${existingAsset.id}), deleting first...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `token ${token}` }
      });
    }

    const fileBuffer = fs.readFileSync(item.localPath);
    const upRes = await fetch(`${uploadUrl}?name=${encodeURIComponent(item.name)}`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length
      },
      body: fileBuffer
    });

    if (upRes.ok) {
      const assetData = await upRes.json();
      console.log(`✅ Uploaded ${item.name} successfully! Download URL:`, assetData.browser_download_url);
    } else {
      const errText = await upRes.text();
      console.error(`❌ Failed to upload ${item.name}:`, errText);
    }
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
