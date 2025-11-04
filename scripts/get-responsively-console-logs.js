#!/usr/bin/env node

/**
 * 從 Responsively App 的 iPhone 14 設備中獲取控制台日誌
 * 
 * 使用方法：
 * 1. 先啟動 Responsively App 並打開遊戲 URL
 * 2. 在 Responsively App 中添加 iPhone 14 設備 (390×844px)
 * 3. 運行此腳本：node scripts/get-responsively-console-logs.js
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Responsively App 的 Chromium 路徑
const RESPONSIVELY_CHROMIUM_PATH = 'C:\\Program Files\\Responsively\\resources\\app.asar.unpacked\\node_modules\\puppeteer-core\\.local-chromium\\win64-1234567\\chrome.exe';

// 遊戲 URL
const GAME_URL = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20';

// iPhone 14 規格
const IPHONE_14_SPECS = {
  width: 390,
  height: 844,
  devicePixelRatio: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
};

async function getConsoleLogs() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  從 Responsively App 獲取 iPhone 14 控制台日誌              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const consoleLogs = [];
  const targetLogs = [];

  try {
    console.log('🔗 嘗試連接到 Responsively App...');
    
    // 方法 1：嘗試連接到遠程調試端口
    let browser;
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: 'ws://localhost:9222',
        timeout: 5000
      });
      console.log('✅ 已連接到 Responsively App (遠程調試)');
    } catch (error) {
      console.log('⚠️  無法連接到遠程調試端口，嘗試啟動本地 Chromium...');
      
      // 方法 2：啟動本地 Chromium
      browser = await puppeteer.launch({
        headless: false,
        args: [
          `--window-size=${IPHONE_14_SPECS.width},${IPHONE_14_SPECS.height}`,
          '--disable-blink-features=AutomationControlled'
        ]
      });
      console.log('✅ 已啟動本地 Chromium');
    }

    const page = await browser.newPage();

    // 設置視口為 iPhone 14
    console.log(`📱 設置視口為 iPhone 14 (${IPHONE_14_SPECS.width}×${IPHONE_14_SPECS.height}px)`);
    await page.setViewport({
      width: IPHONE_14_SPECS.width,
      height: IPHONE_14_SPECS.height,
      deviceScaleFactor: IPHONE_14_SPECS.devicePixelRatio
    });

    // 設置用戶代理
    await page.setUserAgent(IPHONE_14_SPECS.userAgent);

    // 監聽控制台消息
    console.log('📝 開始監聽控制台日誌...');
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };
      
      consoleLogs.push(logEntry);
      
      // 檢查是否是目標日誌
      if (msg.text().includes('[v20.0]') || msg.text().includes('[v18.0]')) {
        targetLogs.push(logEntry);
        console.log(`  ✅ 找到目標日誌: ${msg.text().substring(0, 80)}...`);
      }
    });

    // 導航到遊戲頁面
    console.log(`🌐 導航到遊戲頁面...`);
    await page.goto(GAME_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // 等待遊戲加載並收集日誌
    console.log('⏳ 等待遊戲加載 (5 秒)...');
    await page.waitForTimeout(5000);

    // 獲取頁面信息
    console.log('📊 獲取頁面信息...');
    const pageInfo = await page.evaluate(() => {
      return {
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        },
        gameContainer: document.getElementById('game-container') ? {
          width: document.getElementById('game-container').clientWidth,
          height: document.getElementById('game-container').clientHeight
        } : null,
        iframe: document.querySelector('iframe') ? {
          width: document.querySelector('iframe').clientWidth,
          height: document.querySelector('iframe').clientHeight
        } : null,
        title: document.title,
        url: window.location.href
      };
    });

    // 輸出結果
    console.log('');
    console.log('═'.repeat(60));
    console.log('📱 iPhone 14 頁面信息');
    console.log('═'.repeat(60));
    console.log('');
    console.log('🔍 視口信息:');
    console.log(JSON.stringify(pageInfo.viewport, null, 2));
    console.log('');
    console.log('🎮 遊戲容器信息:');
    console.log(JSON.stringify(pageInfo.gameContainer, null, 2));
    console.log('');
    console.log('📦 iframe 信息:');
    console.log(JSON.stringify(pageInfo.iframe, null, 2));
    console.log('');

    // 輸出目標日誌
    console.log('═'.repeat(60));
    console.log('🎯 目標控制台日誌');
    console.log('═'.repeat(60));
    console.log('');

    if (targetLogs.length > 0) {
      targetLogs.forEach((log, index) => {
        console.log(`[${index + 1}] [${log.type}] ${log.text}`);
        console.log('');
      });
    } else {
      console.log('⚠️  未找到目標日誌，顯示所有日誌:');
      console.log('');
      consoleLogs.forEach((log, index) => {
        if (log.text.length > 0) {
          console.log(`[${index + 1}] [${log.type}] ${log.text}`);
        }
      });
    }

    // 保存詳細報告
    console.log('');
    console.log('═'.repeat(60));
    console.log('💾 保存報告...');
    console.log('═'.repeat(60));
    console.log('');

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'responsively-console-logs.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      specs: IPHONE_14_SPECS,
      pageInfo,
      consoleLogs,
      targetLogs
    }, null, 2));

    console.log(`✅ 報告已保存: ${reportPath}`);
    console.log('');

    // 截圖
    console.log('📸 截圖...');
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, 'responsively-iphone14.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 截圖已保存: ${screenshotPath}`);
    console.log('');

    await browser.close();

    console.log('✅ 完成！');

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    console.error('');
    console.error('💡 故障排除:');
    console.error('  1. 確保 Responsively App 已啟動');
    console.error('  2. 確保遊戲 URL 已在 Responsively App 中打開');
    console.error('  3. 確保 iPhone 14 設備已添加到 Responsively App');
    console.error('  4. 確保 Node.js 和 Puppeteer 已正確安裝');
    process.exit(1);
  }
}

// 執行
getConsoleLogs().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

