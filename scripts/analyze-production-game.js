const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  // 監聽所有 API 響應
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      let body = null;
      try {
        body = await response.json();
      } catch (e) {
        body = await response.text();
      }
      apiCalls.push({ status, url, body });
      console.log(`\n📡 API: ${status} ${url.split('/').pop()}`);
    }
  });

  // 監聽控制台日誌
  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('✅') || text.includes('❌') || text.includes('🔍') || text.includes('📝') || text.includes('🔄')) {
      console.log(`📋 ${text}`);
    }
  });

  // 訪問生產環境遊戲
  const url = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94';
  console.log(`\n🎮 訪問: ${url}\n`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('\n✅ 頁面加載完成');
  } catch (e) {
    console.log(`\n❌ 頁面加載失敗: ${e.message}`);
  }

  // 等待遊戲初始化
  await page.waitForTimeout(5000);

  // 檢查 API 響應
  console.log('\n\n📊 API 響應分析:');
  const activityApi = apiCalls.find(call => call.url.includes('/api/activities/cmh93tjuh0001l404hszkdf94'));
  
  if (activityApi) {
    console.log(`\n✅ 找到活動 API 響應:`);
    console.log(`   狀態: ${activityApi.status}`);
    
    if (activityApi.body && typeof activityApi.body === 'object') {
      console.log(`   vocabularyItems: ${activityApi.body.vocabularyItems ? activityApi.body.vocabularyItems.length : 0}`);
      
      if (activityApi.body.vocabularyItems && activityApi.body.vocabularyItems.length > 0) {
        const first = activityApi.body.vocabularyItems[0];
        console.log(`\n   第一個詞彙項目:`);
        console.log(`     english: "${first.english}"`);
        console.log(`     chinese: "${first.chinese}"`);
        console.log(`     imageUrl: ${first.imageUrl ? '✅ 有' : '❌ 無'}`);
        console.log(`     audioUrl: ${first.audioUrl ? '✅ 有' : '❌ 無'}`);
        
        // 檢查所有詞彙項目
        const withEnglish = activityApi.body.vocabularyItems.filter(item => item.english && item.english.trim()).length;
        const withAudio = activityApi.body.vocabularyItems.filter(item => item.audioUrl).length;
        console.log(`\n   統計:`);
        console.log(`     有 English 的: ${withEnglish}/${activityApi.body.vocabularyItems.length}`);
        console.log(`     有 AudioUrl 的: ${withAudio}/${activityApi.body.vocabularyItems.length}`);
      }
    }
  } else {
    console.log(`\n❌ 沒有找到活動 API 響應`);
    console.log(`\n所有 API 調用:`);
    apiCalls.forEach(call => {
      console.log(`   ${call.status} ${call.url}`);
    });
  }

  // 檢查控制台日誌中的關鍵信息
  console.log('\n\n📋 控制台日誌分析:');
  const keyLogs = consoleLogs.filter(log => 
    log.includes('✅') || log.includes('❌') || log.includes('詞彙') || log.includes('vocabularyItems')
  );
  
  if (keyLogs.length > 0) {
    keyLogs.forEach(log => {
      console.log(`   ${log}`);
    });
  } else {
    console.log('   沒有找到關鍵日誌');
  }

  // 檢查頁面內容
  console.log('\n\n🔍 頁面內容檢查:');
  const pageContent = await page.evaluate(() => {
    return {
      textLength: document.body.innerText.length,
      cardCount: document.querySelectorAll('[class*="card"]').length,
      audioButtonCount: document.querySelectorAll('button[class*="audio"], button[class*="sound"]').length,
      textElements: Array.from(document.querySelectorAll('text, span, p, div')).filter(el => el.innerText && el.innerText.length > 0).length
    };
  });
  
  console.log(`   頁面文本長度: ${pageContent.textLength}`);
  console.log(`   卡片數量: ${pageContent.cardCount}`);
  console.log(`   音頻按鈕數量: ${pageContent.audioButtonCount}`);
  console.log(`   文本元素數量: ${pageContent.textElements}`);

  await browser.close();
}

main().catch(console.error);

