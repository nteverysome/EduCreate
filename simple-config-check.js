const { chromium } = require('playwright');

async function simpleConfigCheck() {
    console.log('🔗 連接到 Chrome...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    
    const contexts = browser.contexts();
    const pages = [];
    for (const context of contexts) {
        pages.push(...context.pages());
    }
    
    const gamePage = pages.find(page => 
        page.url().includes('games/switcher') && 
        page.url().includes('match-up-game')
    );
    
    if (!gamePage) {
        console.log('❌ 未找到遊戲頁面');
        return;
    }
    
    console.log('✅ 找到遊戲頁面');
    
    // 檢查 iframe URL 和參數
    const iframeUrl = await gamePage.evaluate(() => {
        const iframe = document.querySelector('iframe');
        return iframe ? iframe.src : null;
    });
    
    console.log('iframe URL:', iframeUrl);
    
    if (iframeUrl) {
        const url = new URL(iframeUrl);
        console.log('\n參數:');
        for (const [key, value] of url.searchParams) {
            console.log(`${key}: ${value}`);
        }
    }
    
    await browser.close();
    console.log('\n✅ 檢查完成');
}

simpleConfigCheck().catch(console.error);