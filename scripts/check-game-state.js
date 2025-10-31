const { chromium } = require('playwright');

async function main() {
  // 連接到已打開的 Chrome 實例
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  
  if (contexts.length === 0) {
    console.log('❌ 沒有找到打開的瀏覽器上下文');
    await browser.close();
    return;
  }

  const context = contexts[0];
  const pages = context.pages();
  
  if (pages.length === 0) {
    console.log('❌ 沒有找到打開的頁面');
    await browser.close();
    return;
  }

  const page = pages[pages.length - 1];  // 最後打開的頁面
  
  console.log(`\n📄 當前頁面: ${page.url()}\n`);

  // 等待頁面加載
  await page.waitForTimeout(3000);

  // 檢查 window 對象中的遊戲數據
  const gameData = await page.evaluate(() => {
    return {
      matchUpAudioDiagnostics: window.matchUpAudioDiagnostics ? Object.keys(window.matchUpAudioDiagnostics).length : 0,
      hasPhaser: !!window.Phaser,
      hasGame: !!window.game,
      documentReady: document.readyState,
      bodyHTML: document.body.innerHTML.substring(0, 500)
    };
  });

  console.log('🎮 遊戲狀態:');
  console.log(`   Phaser: ${gameData.hasPhaser ? '✅' : '❌'}`);
  console.log(`   Game: ${gameData.hasGame ? '✅' : '❌'}`);
  console.log(`   Document Ready: ${gameData.documentReady}`);
  console.log(`   Audio Diagnostics: ${gameData.matchUpAudioDiagnostics}`);

  // 檢查控制台日誌
  const logs = [];
  page.on('console', (msg) => {
    logs.push(msg.text());
  });

  // 重新加載頁面以捕獲日誌
  console.log('\n🔄 重新加載頁面以捕獲日誌...\n');
  await page.reload({ waitUntil: 'networkidle' });
  
  await page.waitForTimeout(5000);

  // 輸出關鍵日誌
  console.log('📋 控制台日誌:');
  const keyLogs = logs.filter(log => 
    log.includes('✅') || log.includes('❌') || log.includes('vocabularyItems') || log.includes('API')
  );
  
  if (keyLogs.length > 0) {
    keyLogs.forEach(log => {
      console.log(`   ${log}`);
    });
  } else {
    console.log('   沒有找到關鍵日誌');
    console.log('\n   所有日誌:');
    logs.slice(0, 20).forEach(log => {
      console.log(`   ${log}`);
    });
  }

  await browser.close();
}

main().catch(console.error);

