import { test, expect } from '@playwright/test';

test.describe('📱 手機直向佈局調試', () => {
    test('應該在手機直向模式下收集調試信息', async ({ browser }) => {
        // 創建手機直向設備上下文
        const context = await browser.createContext({
            viewport: { width: 375, height: 667 },
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        });

        const page = await context.newPage();

        // 導航到遊戲頁面
        console.log('🔗 導航到遊戲頁面...');
        try {
            await page.goto(
                'https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true',
                { waitUntil: 'domcontentloaded', timeout: 30000 }
            );
        } catch (error) {
            console.log('⚠️ 頁面加載超時，繼續...');
        }

        console.log('✅ 頁面已加載');

        // 等待遊戲初始化
        console.log('⏳ 等待遊戲初始化...');
        await page.waitForTimeout(8000);

        // 收集 Console 日誌
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push(text);
            console.log(`[${msg.type()}] ${text}`);
        });

        // 等待更多日誌
        await page.waitForTimeout(3000);

        // 從 Console 日誌中提取信息
        console.log('\n=== 📊 收集到的信息 ===\n');

        // 查找圖片檢測日誌
        const imageDetectionLog = consoleLogs.find(log => log.includes('詳細圖片檢測'));
        if (imageDetectionLog) {
            console.log('🔍 圖片檢測日誌:');
            console.log(imageDetectionLog);
        }

        // 查找佈局日誌
        const layoutLogs = consoleLogs.filter(log => 
            log.includes('正方形卡片佈局') || log.includes('長方形卡片佈局')
        );
        if (layoutLogs.length > 0) {
            console.log('\n📐 卡片佈局日誌:');
            layoutLogs.forEach(log => console.log(log));
        }

        // 查找詞彙數據日誌
        const vocabularyLog = consoleLogs.find(log => log.includes('詞彙數據轉換完成'));
        if (vocabularyLog) {
            console.log('\n📚 詞彙數據日誌:');
            console.log(vocabularyLog);
        }

        // 從頁面中提取遊戲狀態
        console.log('\n=== 🎮 遊戲狀態 ===\n');

        const gameState = await page.evaluate(() => {
            const gameScene = (window as any).matchUpGame?.scene?.scenes?.[1];
            
            if (!gameScene) {
                return { error: '遊戲未加載' };
            }

            const pairs = gameScene.pairs || [];
            const hasImages = pairs.length > 0 && pairs.some((pair: any) =>
                pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
            );

            const firstPair = pairs[0];

            return {
                gameLoaded: true,
                totalPairs: pairs.length,
                itemsPerPage: gameScene.itemsPerPage,
                totalPages: gameScene.totalPages,
                currentPage: gameScene.currentPage,
                layout: gameScene.layout,
                hasImages,
                firstPair: {
                    id: firstPair?.id,
                    english: firstPair?.english || firstPair?.question,
                    chinese: firstPair?.chinese || firstPair?.answer,
                    imageUrl: firstPair?.imageUrl,
                    chineseImageUrl: firstPair?.chineseImageUrl,
                    audioUrl: firstPair?.audioUrl
                }
            };
        });

        console.log('遊戲狀態:', JSON.stringify(gameState, null, 2));

        // 驗證結果
        if (gameState.error) {
            console.error('❌ 錯誤:', gameState.error);
        } else {
            console.log('\n=== ✅ 調試信息收集完成 ===\n');
            console.log('📊 摘要:');
            console.log(`- 總卡片數: ${gameState.totalPairs}`);
            console.log(`- 每頁卡片數: ${gameState.itemsPerPage}`);
            console.log(`- 總頁數: ${gameState.totalPages}`);
            console.log(`- 有圖片: ${gameState.hasImages ? '✅ 是' : '❌ 否'}`);
            console.log(`- 第一個卡片 imageUrl: ${gameState.firstPair.imageUrl || 'null'}`);
            console.log(`- 第一個卡片 chineseImageUrl: ${gameState.firstPair.chineseImageUrl || 'null'}`);
        }

        await context.close();
    });
});

