const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('\n🎮 Match-up 遊戲診斷工具\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 收集所有日誌
  const logs = [];
  const apiCalls = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/activities/')) {
      const status = response.status();
      let body = null;
      try {
        body = await response.json();
      } catch (e) {
        body = await response.text();
      }
      apiCalls.push({ status, url, body });
    }
  });

  // 訪問遊戲頁面
  const gameUrl = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94';
  console.log(`\n📍 訪問: ${gameUrl}\n`);
  
  try {
    await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`❌ 頁面加載失敗: ${e.message}`);
  }

  // 等待遊戲初始化
  await page.waitForTimeout(5000);

  // 輸出診斷結果
  console.log('\n' + '='.repeat(60));
  console.log('📊 診斷結果\n');

  // 1. API 響應
  console.log('1️⃣ API 響應:');
  if (apiCalls.length > 0) {
    apiCalls.forEach((call, index) => {
      console.log(`\n   [${index + 1}] ${call.status} ${call.url.split('/').pop()}`);
      
      if (call.body && typeof call.body === 'object') {
        if (call.body.vocabularyItems) {
          console.log(`       ✅ vocabularyItems: ${call.body.vocabularyItems.length} 個`);
          
          if (call.body.vocabularyItems.length > 0) {
            const first = call.body.vocabularyItems[0];
            console.log(`       📝 第一個詞彙:`);
            console.log(`          english: "${first.english}"`);
            console.log(`          chinese: "${first.chinese}"`);
            console.log(`          imageUrl: ${first.imageUrl ? '✅' : '❌'}`);
            console.log(`          audioUrl: ${first.audioUrl ? '✅' : '❌'}`);
            
            // 統計
            const withEnglish = call.body.vocabularyItems.filter(item => item.english && item.english.trim()).length;
            const withAudio = call.body.vocabularyItems.filter(item => item.audioUrl).length;
            console.log(`       📊 統計: English=${withEnglish}/${call.body.vocabularyItems.length}, Audio=${withAudio}/${call.body.vocabularyItems.length}`);
          }
        } else if (call.body.error) {
          console.log(`       ❌ 錯誤: ${call.body.error}`);
        }
      }
    });
  } else {
    console.log('   ❌ 沒有 API 調用');
  }

  // 2. 控制台日誌
  console.log('\n\n2️⃣ 控制台日誌:');
  const keyLogs = logs.filter(log => 
    log.includes('🔄') || log.includes('✅') || log.includes('❌') || 
    log.includes('📡') || log.includes('📝') || log.includes('[DEBUG]')
  );
  
  if (keyLogs.length > 0) {
    keyLogs.forEach(log => {
      console.log(`   ${log}`);
    });
  } else {
    console.log('   ❌ 沒有找到關鍵日誌');
    console.log('\n   所有日誌:');
    logs.slice(0, 30).forEach(log => {
      console.log(`   ${log}`);
    });
  }

  // 3. 頁面內容
  console.log('\n\n3️⃣ 頁面內容:');
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      textLength: document.body.innerText.length,
      hasCanvas: !!document.querySelector('canvas'),
      canvasCount: document.querySelectorAll('canvas').length
    };
  });
  
  console.log(`   標題: ${pageInfo.title}`);
  console.log(`   文本長度: ${pageInfo.textLength}`);
  console.log(`   Canvas: ${pageInfo.canvasCount} 個`);

  // 保存詳細日誌到文件
  const report = {
    timestamp: new Date().toISOString(),
    url: gameUrl,
    apiCalls: apiCalls.map(call => ({
      status: call.status,
      url: call.url,
      hasVocabularyItems: !!call.body?.vocabularyItems,
      vocabularyItemsCount: call.body?.vocabularyItems?.length || 0,
      firstItem: call.body?.vocabularyItems?.[0] || null
    })),
    consoleLogs: keyLogs,
    pageInfo: pageInfo
  };

  fs.writeFileSync('game-diagnosis-report.json', JSON.stringify(report, null, 2));
  console.log('\n\n✅ 詳細報告已保存到: game-diagnosis-report.json');

  await browser.close();
}

main().catch(console.error);

