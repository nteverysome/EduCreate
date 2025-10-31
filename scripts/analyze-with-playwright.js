const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('\n🎮 使用 Playwright 分析遊戲問題\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 收集所有日誌
  const logs = [];
  const apiResponses = [];

  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(text);
    console.log(`[${msg.type()}] ${text}`);
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/activities/')) {
      try {
        const body = await response.json();
        apiResponses.push({
          status: response.status(),
          url: url,
          vocabularyItemsCount: body.vocabularyItems?.length || 0,
          hasElements: !!body.elements,
          hasContent: !!body.content,
          firstItem: body.vocabularyItems?.[0] || null
        });
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
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
  await page.waitForTimeout(8000);

  // 分析結果
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 分析結果\n');

  // 1. API 響應
  console.log('1️⃣ API 響應:');
  if (apiResponses.length > 0) {
    apiResponses.forEach((resp, index) => {
      console.log(`\n   [${index + 1}] 狀態: ${resp.status}`);
      console.log(`       vocabularyItems: ${resp.vocabularyItemsCount}`);
      console.log(`       hasElements: ${resp.hasElements}`);
      console.log(`       hasContent: ${resp.hasContent}`);
      
      if (resp.firstItem) {
        console.log(`       第一個詞彙:`);
        console.log(`         english: "${resp.firstItem.english}"`);
        console.log(`         chinese: "${resp.firstItem.chinese}"`);
        console.log(`         imageUrl: ${resp.firstItem.imageUrl ? '✅' : '❌'}`);
        console.log(`         audioUrl: ${resp.firstItem.audioUrl ? '✅' : '❌'}`);
      }
    });
  } else {
    console.log('   ❌ 沒有 API 調用');
  }

  // 2. 關鍵日誌
  console.log('\n\n2️⃣ 關鍵日誌:');
  const keyLogs = logs.filter(log => 
    log.includes('✅') || log.includes('❌') || log.includes('📝') || 
    log.includes('vocabularyItems') || log.includes('vocabularyItemsCount')
  );
  
  if (keyLogs.length > 0) {
    keyLogs.forEach(log => {
      console.log(`   ${log}`);
    });
  } else {
    console.log('   ❌ 沒有找到關鍵日誌');
  }

  // 保存詳細報告
  const report = {
    timestamp: new Date().toISOString(),
    url: gameUrl,
    apiResponses: apiResponses,
    keyLogs: keyLogs,
    allLogs: logs
  };

  fs.writeFileSync('playwright-analysis.json', JSON.stringify(report, null, 2));
  console.log('\n\n✅ 詳細報告已保存到: playwright-analysis.json');

  await browser.close();
}

main().catch(console.error);

