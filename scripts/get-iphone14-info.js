#!/usr/bin/env node

/**
 * 使用 Responsively App 獲取 iPhone 14 直向的遊戲資訊
 * 
 * 使用方法：
 * node scripts/get-iphone14-info.js
 */

const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// Responsively App 路徑
const RESPONSIVELY_PATH = 'C:\\Users\\Administrator\\AppData\\Local\\Programs\\ResponsivelyApp\\ResponsivelyApp.exe';

// 遊戲 URL
const GAME_URL = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20';

// iPhone 14 規格
const IPHONE_14_SPECS = {
  width: 390,
  height: 844,
  devicePixelRatio: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
};

async function getGameInfo() {
  console.log('🚀 啟動 Responsively App...');
  
  // 啟動 Responsively App
  const responsively = spawn(RESPONSIVELY_PATH, [GAME_URL], {
    detached: true,
    stdio: 'ignore'
  });
  
  responsively.unref();
  
  // 等待應用啟動
  console.log('⏳ 等待 Responsively App 啟動... (5 秒)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // 嘗試連接到 Chromium 實例
    console.log('🔗 嘗試連接到 Chromium 實例...');
    
    // 使用 Puppeteer 連接到本地 Chromium
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://localhost:9222',
      timeout: 5000
    }).catch(async () => {
      console.log('⚠️  無法連接到遠程調試端口，使用本地 Chromium...');
      
      // 如果無法連接到遠程調試，使用本地 Chromium
      return await puppeteer.launch({
        headless: false,
        args: [
          `--window-size=${IPHONE_14_SPECS.width},${IPHONE_14_SPECS.height}`,
          '--disable-blink-features=AutomationControlled'
        ]
      });
    });
    
    const page = await browser.newPage();
    
    // 設置視口
    await page.setViewport({
      width: IPHONE_14_SPECS.width,
      height: IPHONE_14_SPECS.height,
      deviceScaleFactor: IPHONE_14_SPECS.devicePixelRatio
    });
    
    // 設置用戶代理
    await page.setUserAgent(IPHONE_14_SPECS.userAgent);
    
    console.log('📱 設置視口為 iPhone 14 (390×844px)');
    
    // 導航到遊戲頁面
    console.log(`🌐 導航到遊戲頁面: ${GAME_URL}`);
    await page.goto(GAME_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待遊戲加載
    console.log('⏳ 等待遊戲加載...');
    await page.waitForTimeout(3000);
    
    // 獲取頁面資訊
    console.log('📊 獲取頁面資訊...');
    const gameInfo = await page.evaluate(() => {
      return {
        // 視口信息
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        },
        
        // 遊戲容器信息
        gameContainer: document.getElementById('game-container') ? {
          width: document.getElementById('game-container').clientWidth,
          height: document.getElementById('game-container').clientHeight,
          offsetWidth: document.getElementById('game-container').offsetWidth,
          offsetHeight: document.getElementById('game-container').offsetHeight
        } : null,
        
        // iframe 信息
        iframe: document.querySelector('iframe') ? {
          width: document.querySelector('iframe').clientWidth,
          height: document.querySelector('iframe').clientHeight
        } : null,
        
        // 文檔信息
        document: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        },
        
        // 頁面標題
        title: document.title,
        
        // URL
        url: window.location.href
      };
    });
    
    // 獲取控制台日誌
    console.log('📝 獲取控制台日誌...');
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // 再等待一下以收集日誌
    await page.waitForTimeout(2000);
    
    // 截圖
    console.log('📸 截圖...');
    const screenshotPath = path.join(__dirname, '../screenshots/iphone14-game.png');
    const screenshotDir = path.dirname(screenshotPath);
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 截圖已保存: ${screenshotPath}`);
    
    // 輸出結果
    console.log('\n' + '='.repeat(60));
    console.log('📱 iPhone 14 直向遊戲資訊');
    console.log('='.repeat(60));
    console.log('\n🔍 視口信息:');
    console.log(JSON.stringify(gameInfo.viewport, null, 2));
    
    console.log('\n🎮 遊戲容器信息:');
    console.log(JSON.stringify(gameInfo.gameContainer, null, 2));
    
    console.log('\n📦 iframe 信息:');
    console.log(JSON.stringify(gameInfo.iframe, null, 2));
    
    console.log('\n📄 文檔信息:');
    console.log(JSON.stringify(gameInfo.document, null, 2));
    
    console.log('\n📝 控制台日誌 (前 10 條):');
    consoleLogs.slice(0, 10).forEach((log, index) => {
      console.log(`  [${index + 1}] [${log.type}] ${log.text}`);
    });
    
    // 保存詳細報告
    const reportPath = path.join(__dirname, '../reports/iphone14-game-info.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      specs: IPHONE_14_SPECS,
      gameInfo,
      consoleLogs
    }, null, 2));
    
    console.log(`\n✅ 詳細報告已保存: ${reportPath}`);
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    process.exit(1);
  }
}

// 執行
getGameInfo().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

