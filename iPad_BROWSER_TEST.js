// ============================================================================
// iPad 容器大小動態調整系統 - 瀏覽器模擬測試
// ============================================================================

const { chromium } = require('playwright');
const fs = require('fs');

const testCases = [
    { name: 'iPad mini', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'iPad 標準', width: 810, height: 1080, deviceScaleFactor: 2 },
    { name: 'iPad Air', width: 820, height: 1180, deviceScaleFactor: 2 },
    { name: 'iPad Pro 11"', width: 834, height: 1194, deviceScaleFactor: 2 },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366, deviceScaleFactor: 2 }
];

async function runTests() {
    const browser = await chromium.launch();
    const results = [];

    console.log('='.repeat(100));
    console.log('📱 iPad 容器大小動態調整系統 - 瀏覽器模擬測試');
    console.log('='.repeat(100));

    for (const testCase of testCases) {
        const { name, width, height, deviceScaleFactor } = testCase;
        
        try {
            const context = await browser.createBrowserContext({
                viewport: { width, height },
                deviceScaleFactor: deviceScaleFactor,
                userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
            });

            const page = await context.newPage();
            
            console.log(`\n📱 測試: ${name} (${width}×${height})`);
            console.log('-'.repeat(100));

            // 導航到遊戲頁面
            await page.goto('http://localhost:5173/games/match-up-game', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // 等待遊戲加載
            await page.waitForTimeout(3000);

            // 提取控制台日誌
            const consoleLogs = [];
            page.on('console', msg => {
                if (msg.text().includes('[v42.0]')) {
                    consoleLogs.push(msg.text());
                }
            });

            // 執行 JavaScript 來獲取佈局信息
            const layoutInfo = await page.evaluate(() => {
                // 查找遊戲容器
                const gameContainer = document.querySelector('canvas');
                if (!gameContainer) {
                    return { error: '找不到遊戲容器' };
                }

                return {
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    devicePixelRatio: window.devicePixelRatio,
                    canvasWidth: gameContainer?.width,
                    canvasHeight: gameContainer?.height
                };
            });

            console.log(`  視口大小: ${layoutInfo.windowWidth}×${layoutInfo.windowHeight}`);
            console.log(`  屏幕大小: ${layoutInfo.screenWidth}×${layoutInfo.screenHeight}`);
            console.log(`  設備像素比: ${layoutInfo.devicePixelRatio}`);
            console.log(`  Canvas 大小: ${layoutInfo.canvasWidth}×${layoutInfo.canvasHeight}`);

            // 截圖
            const screenshotPath = `iPad_${name.replace(/"/g, '').replace(/\s+/g, '_')}_${width}x${height}.png`;
            await page.screenshot({ path: screenshotPath });
            console.log(`  ✅ 截圖已保存: ${screenshotPath}`);

            results.push({
                name,
                width,
                height,
                layoutInfo,
                screenshot: screenshotPath
            });

            await context.close();

        } catch (error) {
            console.log(`  ❌ 錯誤: ${error.message}`);
            results.push({
                name,
                width,
                height,
                error: error.message
            });
        }
    }

    await browser.close();

    // 保存結果
    console.log('\n' + '='.repeat(100));
    console.log('✅ 測試完成');
    console.log('='.repeat(100));

    fs.writeFileSync('iPad_TEST_RESULTS.json', JSON.stringify(results, null, 2));
    console.log('\n📊 測試結果已保存到: iPad_TEST_RESULTS.json');
}

runTests().catch(console.error);

