#!/usr/bin/env node

/**
 * 使用 Chrome DevTools Protocol (CDP) 操作 Responsively App
 * 
 * 功能:
 * 1. 連接到 Responsively App 的 CDP 端點
 * 2. 設置 iPhone 14 設備模擬
 * 3. 導航到遊戲 URL
 * 4. 收集控制台日誌
 * 5. 執行自定義操作
 * 6. 生成報告
 * 
 * 使用方法:
 * 1. 先啟動 Responsively App: ResponsivelyApp.exe --remote-debugging-port=9222 <URL>
 * 2. 運行此腳本: node scripts/cdp-responsively-controller.js
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

async function controlResponsivelyApp() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Chrome DevTools Protocol (CDP) - Responsively App 控制器  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  let client;
  const consoleLogs = [];
  const targetLogs = [];

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

    // 2. 獲取協議版本
    const { Protocol } = client;
    const { Page, Runtime, Emulation, Network, Console } = Protocol;

    // 3. 啟用各個域
    console.log('⚙️  啟用 CDP 域...');
    await Promise.all([
      Page.enable(),
      Runtime.enable(),
      Emulation.enable(),
      Network.enable(),
      Console.enable()
    ]);
    console.log('✅ CDP 域已啟用');
    console.log('');

    // 4. 設置設備模擬
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

    // 5. 設置用戶代理
    console.log('🔐 設置用戶代理...');
    await Network.setUserAgentOverride({
      userAgent: IPHONE_14_SPECS.userAgent
    });
    console.log('✅ 用戶代理已設置');
    console.log('');

    // 6. 監聽控制台消息
    console.log('👂 監聽控制台消息...');
    Console.messageAdded(({ message }) => {
      const logEntry = {
        type: message.level,
        text: message.text,
        timestamp: new Date().toISOString()
      };
      
      consoleLogs.push(logEntry);

      // 查找目標日誌
      if (message.text.includes('[v20.0]') || message.text.includes('[v18.0]')) {
        targetLogs.push(logEntry);
        console.log(`🎯 找到目標日誌: ${message.text}`);
      }
    });
    console.log('✅ 控制台監聽已啟用');
    console.log('');

    // 7. 導航到遊戲 URL
    console.log(`🌐 導航到遊戲 URL: ${GAME_URL}`);
    await Page.navigate({ url: GAME_URL });
    console.log('✅ 頁面已導航');
    console.log('');

    // 8. 等待頁面加載
    console.log('⏳ 等待頁面加載... (10 秒)');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('✅ 頁面加載完成');
    console.log('');

    // 9. 獲取頁面信息
    console.log('📊 獲取頁面信息...');
    const pageInfo = await Runtime.evaluate({
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

    console.log('✅ 頁面信息已獲取');
    console.log('');

    // 10. 輸出結果
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 頁面信息                                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    
    if (pageInfo.result && pageInfo.result.value) {
      const info = pageInfo.result.value;
      console.log(`📄 標題: ${info.title}`);
      console.log(`🌐 URL: ${info.url}`);
      console.log('');
      console.log('🔍 視口信息:');
      console.log(`  • 寬度: ${info.viewport.innerWidth}px`);
      console.log(`  • 高度: ${info.viewport.innerHeight}px`);
      console.log(`  • DPR: ${info.viewport.devicePixelRatio}`);
      console.log('');
      console.log('🎮 遊戲狀態:');
      console.log(`  • 卡片數: ${info.gameState.cardCount}`);
      console.log(`  • 容器寬度: ${info.gameState.containerWidth}px`);
      console.log(`  • 容器高度: ${info.gameState.containerHeight}px`);
    }
    console.log('');

    // 11. 輸出目標日誌
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
    }

    // 12. 輸出所有控制台日誌
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📝 所有控制台日誌                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (consoleLogs.length > 0) {
      console.log(`總共 ${consoleLogs.length} 條日誌 (顯示前 20 條):`);
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
    console.log('');

    // 13. 保存報告
    console.log('💾 保存報告...');
    
    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'cdp-responsively-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      method: 'Chrome DevTools Protocol (CDP)',
      specs: IPHONE_14_SPECS,
      pageInfo: pageInfo.result?.value,
      targetLogs,
      allLogs: consoleLogs
    }, null, 2));

    console.log(`✅ 報告已保存: ${reportPath}`);
    console.log('');

    // 14. 關閉連接
    console.log('🔌 關閉 CDP 連接...');
    await client.close();
    console.log('✅ 連接已關閉');
    console.log('');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ 操作完成！                                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    console.error('');
    console.error('💡 故障排除:');
    console.error('  1. 確保 Responsively App 已啟動並啟用遠程調試:');
    console.error('     ResponsivelyApp.exe --remote-debugging-port=9222 <URL>');
    console.error('  2. 確保 CDP 端口 9222 未被佔用');
    console.error('  3. 確保 chrome-remote-interface 已安裝: npm install chrome-remote-interface');
    console.error('  4. 檢查防火牆設置');
    
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
controlResponsivelyApp().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

