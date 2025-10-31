const ChromeController = require('./chrome-controller.js');

async function navigateToGame() {
    const controller = new ChromeController();
    
    try {
        console.log('🔗 正在連接到 Chrome...');
        await controller.connect();
        
        // 直接導航到配對遊戲URL
        const gameUrl = 'https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true';
        
        console.log('🎮 導航到配對遊戲...');
        console.log(`URL: ${gameUrl}`);
        
        await controller.navigateToUrl(gameUrl);
        
        // 等待頁面加載
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查頁面狀態
        const pageInfo = await controller.getPageInfo();
        console.log('\n✅ 導航完成！');
        
        // 截圖
        await controller.takeScreenshot('match-up-game-loaded.png');
        
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    } finally {
        await controller.disconnect();
        console.log('🔄 已斷開連接');
    }
}

navigateToGame();