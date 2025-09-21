// 創建 PWA 圖標的腳本
// 這個腳本會創建簡單的 PWA 圖標佔位符

const fs = require('fs');
const path = require('path');

// 創建 assets 目錄
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 創建簡單的 SVG 圖標
const createSVGIcon = (size) => {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4CAF50"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/8}" fill="white" text-anchor="middle" dominant-baseline="middle">S</text>
  <circle cx="${size/4}" cy="${size/4}" r="${size/12}" fill="white" opacity="0.8"/>
  <circle cx="${size*3/4}" cy="${size/4}" r="${size/12}" fill="white" opacity="0.8"/>
  <path d="M ${size/3} ${size*2/3} Q ${size/2} ${size*3/4} ${size*2/3} ${size*2/3}" stroke="white" stroke-width="${size/40}" fill="none"/>
</svg>`;
};

// 創建 192x192 圖標
const icon192 = createSVGIcon(192);
fs.writeFileSync(path.join(assetsDir, 'icon-192.svg'), icon192);

// 創建 512x512 圖標  
const icon512 = createSVGIcon(512);
fs.writeFileSync(path.join(assetsDir, 'icon-512.svg'), icon512);

// 創建簡單的 PNG 佔位符（使用 data URL）
const createPNGPlaceholder = (size) => {
    // 這是一個簡單的綠色方塊 PNG 的 base64 數據
    const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4CAF50"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/6}" fill="white" text-anchor="middle" dominant-baseline="middle">🎮</text>
</svg>`;
    return canvas;
};

// 創建截圖佔位符
const createScreenshot = (width, height, orientation) => {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#000"/>
  <rect x="10%" y="10%" width="80%" height="80%" fill="#4CAF50" rx="20"/>
  <text x="50%" y="30%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Shimozurdo Game</text>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle">🎮 Educational Memory Game</text>
  <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">${orientation} Screenshot</text>
</svg>`;
};

// 創建截圖
const screenshotWide = createScreenshot(1280, 720, 'Wide');
fs.writeFileSync(path.join(assetsDir, 'screenshot-wide.svg'), screenshotWide);

const screenshotNarrow = createScreenshot(720, 1280, 'Narrow');
fs.writeFileSync(path.join(assetsDir, 'screenshot-narrow.svg'), screenshotNarrow);

console.log('✅ PWA 圖標和截圖已創建:');
console.log('  - assets/icon-192.svg');
console.log('  - assets/icon-512.svg');
console.log('  - assets/screenshot-wide.svg');
console.log('  - assets/screenshot-narrow.svg');
console.log('');
console.log('📝 注意: 這些是 SVG 佔位符，生產環境建議使用真實的 PNG 圖標');
console.log('💡 可以使用線上工具將 SVG 轉換為 PNG，或使用設計軟體創建專業圖標');
