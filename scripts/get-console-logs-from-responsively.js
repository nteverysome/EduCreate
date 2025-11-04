#!/usr/bin/env node

/**
 * 從 Responsively App 獲取 iPhone 14 直向的控制台日誌
 * 
 * 使用方法：
 * 1. 先啟動 Responsively App 並打開遊戲 URL
 * 2. 在 Responsively App 中添加 iPhone 14 設備 (390×844px)
 * 3. 運行此腳本：node scripts/get-console-logs-from-responsively.js
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

  let browser;
  let page;

  try {
    console.log('🔗 嘗試連接到 Responsively App...');
    
    // 嘗試連接到遠程調試端口
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: 'ws://localhost:9222',
        timeout: 5000
      });
      console.log('✅ 已連接到 Responsively App (遠程調試)');
    } catch (error) {
      console.log('⚠️  無法連接到遠程調試端口');
      console.log('');
      console.log('💡 請按照以下步驟手動操作:');
      console.log('');
      console.log('1️⃣  在 Responsively App 中:');
      console.log('   • 打開遊戲 URL');
      console.log('   • 添加 iPhone 14 設備 (390×844px)');
      console.log('   • 按 F12 打開開發者工具');
      console.log('   • 在控制台中查看日誌');
      console.log('');
      console.log('2️⃣  查找以下日誌:');
      console.log('   • [v20.0] 設備尺寸和寬高比詳細信息');
      console.log('   • [v18.0] 動態列數計算: itemCount=20, cols=5');
      console.log('');
      console.log('3️⃣  或者，使用以下命令啟動 Responsively App 並啟用遠程調試:');
      console.log('   C:\\Users\\Administrator\\AppData\\Local\\Programs\\ResponsivelyApp\\ResponsivelyApp.exe --remote-debugging-port=9222');
      console.log('');
      
      throw new Error('無法連接到 Responsively App');
    }

    // 獲取所有頁面
    const pages = await browser.pages();
    console.log(`📄 找到 ${pages.length} 個頁面`);

    if (pages.length === 0) {
      throw new Error('Responsively App 中沒有打開的頁面');
    }

    // 使用第一個頁面
    page = pages[0];
    console.log('📄 使用第一個頁面');
    console.log('');

    // 收集控制台日誌
    const consoleLogs = [];
    const targetLogs = [];

    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      
      consoleLogs.push(logEntry);

      // 查找目標日誌
      if (msg.text().includes('[v20.0]') || msg.text().includes('[v18.0]')) {
        targetLogs.push(logEntry);
        console.log(`🎯 找到目標日誌: ${msg.text()}`);
      }
    });

    // 獲取當前頁面信息
    console.log('📊 獲取頁面信息...');
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      };
    });

    console.log(`✅ 頁面標題: ${pageInfo.title}`);
    console.log(`✅ 頁面 URL: ${pageInfo.url}`);
    console.log('');

    // 等待並收集日誌
    console.log('⏳ 等待並收集控制台日誌... (5 秒)');
    await page.waitForTimeout(5000);

    // 刷新頁面以觸發日誌
    console.log('🔄 刷新頁面以觸發日誌...');
    await page.reload({ waitUntil: 'networkidle2' });

    // 再等待一下
    console.log('⏳ 等待日誌... (5 秒)');
    await page.waitForTimeout(5000);

    // 輸出結果
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 頁面信息                                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('🔍 視口信息:');
    console.log(`  • 寬度: ${pageInfo.viewport.innerWidth}px`);
    console.log(`  • 高度: ${pageInfo.viewport.innerHeight}px`);
    console.log(`  • 設備像素比: ${pageInfo.viewport.devicePixelRatio}`);
    console.log(`  • 屏幕寬度: ${pageInfo.viewport.screenWidth}px`);
    console.log(`  • 屏幕高度: ${pageInfo.viewport.screenHeight}px`);
    console.log('');

    // 輸出目標日誌
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 目標控制台日誌 (v20.0 和 v18.0)                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (targetLogs.length > 0) {
      console.log(`✅ 找到 ${targetLogs.length} 條目標日誌:`);
      console.log('');
      
      targetLogs.forEach((log, index) => {
        console.log(`[${index + 1}] [${log.type.toUpperCase()}]`);
        console.log(`    ${log.text}`);
        console.log('');
      });
    } else {
      console.log('⚠️  未找到目標日誌');
      console.log('');
      console.log('💡 可能的原因:');
      console.log('  1. 遊戲尚未完全加載');
      console.log('  2. 控制台日誌已被清除');
      console.log('  3. 頁面未正確導航到遊戲 URL');
      console.log('');
    }

    // 輸出所有控制台日誌
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📝 所有控制台日誌                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (consoleLogs.length > 0) {
      console.log(`總共 ${consoleLogs.length} 條日誌:`);
      console.log('');
      
      consoleLogs.slice(0, 20).forEach((log, index) => {
        console.log(`[${index + 1}] [${log.type.toUpperCase()}] ${log.text}`);
      });

      if (consoleLogs.length > 20) {
        console.log(`... 還有 ${consoleLogs.length - 20} 條日誌`);
      }
    } else {
      console.log('❌ 未收集到任何控制台日誌');
    }

    // 保存報告
    console.log('');
    console.log('💾 保存報告...');
    
    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'responsively-console-logs.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      specs: IPHONE_14_SPECS,
      pageInfo,
      targetLogs,
      allLogs: consoleLogs
    }, null, 2));

    console.log(`✅ 報告已保存: ${reportPath}`);
    console.log('');

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    console.error('');
    console.error('💡 故障排除:');
    console.error('  1. 確保 Responsively App 已啟動');
    console.error('  2. 確保遊戲 URL 已在 Responsively App 中打開');
    console.error('  3. 確保 iPhone 14 設備已添加並選中');
    console.error('  4. 嘗試在 Responsively App 中按 F12 查看控制台');
    process.exit(1);
  }
}

// 執行
getConsoleLogs().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

