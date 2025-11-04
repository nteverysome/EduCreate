#!/usr/bin/env node

/**
 * 增強版 CDP 控制器 - 包含性能監控、截圖和網絡模擬
 * 
 * 功能:
 * 1. 連接到 Responsively App 的 CDP 端點
 * 2. 設置 iPhone 14 設備模擬
 * 3. 模擬網絡條件 (可選)
 * 4. 導航到遊戲 URL
 * 5. 收集性能指標
 * 6. 收集控制台日誌
 * 7. 截圖
 * 8. 生成詳細報告
 * 
 * 使用方法:
 * node scripts/cdp-enhanced-controller.js [--network-throttle] [--screenshot]
 */

const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');

// iPhone 14 規格
const IPHONE_14_SPECS = {
  width: 390,
  height: 844,
  devicePixelRatio: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  mobile: true,
  hasTouch: true
};

const GAME_URL = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20';

// 命令行參數
const args = process.argv.slice(2);
const enableNetworkThrottle = args.includes('--network-throttle');
const enableScreenshot = args.includes('--screenshot');

async function enhancedControl() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  增強版 CDP 控制器 - 性能監控 + 截圖 + 網絡模擬           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  let client;
  const consoleLogs = [];
  const targetLogs = [];
  const networkRequests = [];
  let pageInfo = null;
  let performanceMetrics = null;

  try {
    // 1. 連接到 CDP 端點
    console.log('🔗 正在連接到 Responsively App (CDP 端點: localhost:9222)...');
    
    client = await CDP({
      port: 9222,
      host: 'localhost',
      timeout: 10000
    });

    console.log('✅ 已連接到 Responsively App');
    console.log('');

    const { Protocol } = client;
    const { Page, Runtime, Emulation, Network, Console, Performance } = Protocol;

    // 2. 啟用各個域
    console.log('⚙️  啟用 CDP 域...');
    await Promise.all([
      Page.enable(),
      Runtime.enable(),
      Emulation.enable(),
      Network.enable(),
      Console.enable(),
      Performance.enable()
    ]);
    console.log('✅ CDP 域已啟用');
    console.log('');

    // 3. 設置設備模擬
    console.log('📱 設置 iPhone 14 設備模擬...');
    await Emulation.setDeviceMetricsOverride({
      width: IPHONE_14_SPECS.width,
      height: IPHONE_14_SPECS.height,
      deviceScaleFactor: IPHONE_14_SPECS.devicePixelRatio,
      mobile: IPHONE_14_SPECS.mobile,
      hasTouch: IPHONE_14_SPECS.hasTouch
    });
    console.log(`✅ 設備模擬已設置: ${IPHONE_14_SPECS.width}×${IPHONE_14_SPECS.height}px (DPR: ${IPHONE_14_SPECS.devicePixelRatio})`);
    console.log('');

    // 4. 設置用戶代理
    console.log('🔐 設置用戶代理...');
    await Network.setUserAgentOverride({
      userAgent: IPHONE_14_SPECS.userAgent
    });
    console.log('✅ 用戶代理已設置');
    console.log('');

    // 5. 模擬網絡條件 (可選)
    if (enableNetworkThrottle) {
      console.log('🌐 模擬網絡條件 (Slow 4G)...');
      await Network.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 1.6 * 1024 * 1024 / 8,  // 1.6 Mbps
        uploadThroughput: 750 * 1024 / 8,            // 750 Kbps
        latency: 40                                    // 40ms
      });
      console.log('✅ 網絡模擬已設置: Slow 4G');
      console.log('');
    }

    // 6. 監聽控制台消息
    console.log('👂 監聽控制台消息...');
    Console.messageAdded(({ message }) => {
      const logEntry = {
        type: message.level,
        text: message.text,
        timestamp: new Date().toISOString()
      };
      
      consoleLogs.push(logEntry);

      if (message.text.includes('[v20.0]') || message.text.includes('[v18.0]')) {
        targetLogs.push(logEntry);
        console.log(`🎯 找到目標日誌: ${message.text}`);
      }
    });
    console.log('✅ 控制台監聽已啟用');
    console.log('');

    // 7. 監聽網絡請求
    console.log('📡 監聽網絡請求...');
    Network.requestWillBeSent(({ request }) => {
      networkRequests.push({
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      });
    });
    console.log('✅ 網絡監聽已啟用');
    console.log('');

    // 8. 導航到遊戲 URL
    console.log(`🌐 導航到遊戲 URL...`);
    await Page.navigate({ url: GAME_URL });
    console.log('✅ 頁面已導航');
    console.log('');

    // 9. 等待頁面加載
    console.log('⏳ 等待頁面加載... (15 秒)');
    await new Promise(resolve => setTimeout(resolve, 15000));
    console.log('✅ 頁面加載完成');
    console.log('');

    // 10. 收集性能指標
    console.log('📊 收集性能指標...');
    const metricsResult = await Performance.getMetrics();
    if (metricsResult && metricsResult.metrics) {
      performanceMetrics = {};
      metricsResult.metrics.forEach(metric => {
        performanceMetrics[metric.name] = metric.value;
      });
      console.log('✅ 性能指標已收集');
    }
    console.log('');

    // 11. 獲取頁面信息
    console.log('📊 獲取頁面信息...');
    const pageInfoResult = await Runtime.evaluate({
      expression: `({
        title: document.title,
        url: window.location.href,
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        gameState: {
          cardCount: document.querySelectorAll('[class*="card"]').length,
          containerWidth: document.querySelector('[class*="container"]')?.offsetWidth,
          containerHeight: document.querySelector('[class*="container"]')?.offsetHeight
        }
      })`
    });

    if (pageInfoResult.result && pageInfoResult.result.value) {
      pageInfo = pageInfoResult.result.value;
    }
    console.log('✅ 頁面信息已獲取');
    console.log('');

    // 12. 截圖 (可選)
    if (enableScreenshot) {
      console.log('📸 截圖...');
      const screenshot = await Page.captureScreenshot({
        format: 'png',
        quality: 100
      });

      const screenshotDir = path.join(__dirname, '../reports/screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const screenshotPath = path.join(screenshotDir, `iphone14-${Date.now()}.png`);
      fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`✅ 截圖已保存: ${screenshotPath}`);
      console.log('');
    }

    // 13. 輸出結果
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 頁面信息                                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    
    if (pageInfo) {
      console.log(`📄 標題: ${pageInfo.title}`);
      console.log(`🌐 URL: ${pageInfo.url}`);
      console.log('');
      console.log('🔍 視口信息:');
      console.log(`  • 寬度: ${pageInfo.viewport.innerWidth}px`);
      console.log(`  • 高度: ${pageInfo.viewport.innerHeight}px`);
      console.log(`  • DPR: ${pageInfo.viewport.devicePixelRatio}`);
      console.log('');
      console.log('🎮 遊戲狀態:');
      console.log(`  • 卡片數: ${pageInfo.gameState.cardCount}`);
      console.log(`  • 容器寬度: ${pageInfo.gameState.containerWidth}px`);
      console.log(`  • 容器高度: ${pageInfo.gameState.containerHeight}px`);
    }
    console.log('');

    // 14. 輸出性能指標
    if (performanceMetrics) {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║  ⚡ 性能指標                                               ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      
      Object.entries(performanceMetrics).forEach(([name, value]) => {
        console.log(`  • ${name}: ${value.toFixed(2)}`);
      });
      console.log('');
    }

    // 15. 輸出目標日誌
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 目標控制台日誌                                         ║');
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
    }
    console.log('');

    // 16. 保存報告
    console.log('💾 保存報告...');
    
    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'cdp-enhanced-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      method: 'Chrome DevTools Protocol (CDP) - Enhanced',
      specs: IPHONE_14_SPECS,
      options: {
        networkThrottle: enableNetworkThrottle,
        screenshot: enableScreenshot
      },
      pageInfo,
      performanceMetrics,
      targetLogs,
      networkRequests: networkRequests.slice(0, 20),
      summary: {
        totalLogs: consoleLogs.length,
        targetLogsCount: targetLogs.length,
        networkRequests: networkRequests.length,
        success: targetLogs.length > 0
      }
    }, null, 2));

    console.log(`✅ 報告已保存: ${reportPath}`);
    console.log('');

    // 17. 關閉連接
    console.log('🔌 關閉 CDP 連接...');
    await client.close();
    console.log('✅ 連接已關閉');
    console.log('');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ 操作完成！                                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // 忽略關閉錯誤
      }
    }
    
    process.exit(1);
  }
}

// 執行
enhancedControl().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

