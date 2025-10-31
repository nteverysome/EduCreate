const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('\n🔍 檢查遊戲 DOM 和 CSS\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 收集日誌
  const logs = [];
  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // 訪問遊戲頁面
  const gameUrl = 'https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94';
  console.log(`📍 訪問: ${gameUrl}\n`);
  
  await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 檢查 Canvas 和文本元素
  const analysis = await page.evaluate(() => {
    const result = {
      canvasCount: document.querySelectorAll('canvas').length,
      textElements: [],
      gameContainer: null,
      windowData: {}
    };

    // 查找所有文本元素
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const text = el.innerText || el.textContent;
      if (text && text.trim().length > 0 && text.trim().length < 100) {
        const style = window.getComputedStyle(el);
        result.textElements.push({
          tag: el.tagName,
          text: text.substring(0, 50),
          color: style.color,
          opacity: style.opacity,
          display: style.display,
          visibility: style.visibility,
          zIndex: style.zIndex
        });
      }
    });

    // 查找遊戲容器
    const gameDiv = document.querySelector('[id*="game"], [class*="game"], canvas');
    if (gameDiv) {
      const style = window.getComputedStyle(gameDiv);
      result.gameContainer = {
        tag: gameDiv.tagName,
        id: gameDiv.id,
        class: gameDiv.className,
        width: gameDiv.offsetWidth,
        height: gameDiv.offsetHeight,
        opacity: style.opacity,
        display: style.display
      };
    }

    // 檢查 window 對象中的遊戲數據
    if (window.matchUpAudioDiagnostics) {
      result.windowData.matchUpAudioDiagnostics = window.matchUpAudioDiagnostics;
    }

    return result;
  });

  console.log('📊 分析結果:');
  console.log(JSON.stringify(analysis, null, 2));

  // 保存報告
  const report = {
    timestamp: new Date().toISOString(),
    url: gameUrl,
    analysis: analysis,
    consoleLogs: logs.slice(0, 50)
  };

  fs.writeFileSync('dom-analysis.json', JSON.stringify(report, null, 2));
  console.log('\n✅ 報告已保存到: dom-analysis.json');

  await browser.close();
}

main().catch(console.error);

