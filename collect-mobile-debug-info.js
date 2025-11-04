/**
 * 收集手機直向環境下的調試信息
 * 使用 Playwright 模擬 iPhone 12 Pro 直向模式
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function collectMobileDebugInfo() {
    const browser = await chromium.launch();
    
    try {
        // 創建 iPhone 12 Pro 直向模式的上下文
        const context = await browser.createContext({
            ...chromium.devices['iPhone 12 Pro'],
            // 強制直向模式
            viewport: {
                width: 390,
                height: 844
            }
        });

        const page = await context.newPage();

        // 設置視窗大小為手機直向（375×667px）
        await page.setViewportSize({ width: 375, height: 667 });

        console.log('📱 設置視窗大小: 375×667px (手機直向)');

        // 導航到遊戲頁面（使用已部署的版本）
        const gameUrl = 'https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true';
        console.log(`🔗 導航到: ${gameUrl}`);

        await page.goto(gameUrl, { waitUntil: 'networkidle' });

        // 等待遊戲加載
        console.log('⏳ 等待遊戲加載...');
        await page.waitForTimeout(3000);

        // 收集調試信息
        console.log('\n🔍 收集調試信息...\n');

        const debugInfo = await page.evaluate(() => {
            const logs = [];

            // 1. 收集圖片檢測信息
            logs.push('=== 🔍 圖片檢測信息 ===');
            
            // 從 console 日誌中提取信息
            const gameScene = window.matchUpGame?.scene?.scenes?.[1]; // GameScene 通常是第二個場景
            
            if (gameScene) {
                logs.push(`✅ 找到 GameScene`);
                logs.push(`📊 總卡片數: ${gameScene.pairs?.length || 'N/A'}`);
                logs.push(`📄 每頁卡片數: ${gameScene.itemsPerPage || 'N/A'}`);
                logs.push(`📑 當前頁: ${gameScene.currentPage || 'N/A'}`);
                logs.push(`📑 總頁數: ${gameScene.totalPages || 'N/A'}`);
                logs.push(`📐 佈局模式: ${gameScene.layout || 'N/A'}`);

                // 第一個卡片的詳細信息
                if (gameScene.pairs && gameScene.pairs.length > 0) {
                    const firstPair = gameScene.pairs[0];
                    logs.push('\n=== 第一個卡片詳細信息 ===');
                    logs.push(`ID: ${firstPair.id}`);
                    logs.push(`英文: ${firstPair.question || firstPair.english || 'N/A'}`);
                    logs.push(`中文: ${firstPair.answer || firstPair.chinese || 'N/A'}`);
                    logs.push(`imageUrl: ${firstPair.imageUrl || 'null'}`);
                    logs.push(`chineseImageUrl: ${firstPair.chineseImageUrl || 'null'}`);
                    logs.push(`imageId: ${firstPair.imageId || 'null'}`);
                    logs.push(`chineseImageId: ${firstPair.chineseImageId || 'null'}`);
                    logs.push(`audioUrl: ${firstPair.audioUrl || 'null'}`);
                    logs.push(`hasImages: ${!!(firstPair.imageUrl || firstPair.chineseImageUrl || firstPair.imageId || firstPair.chineseImageId)}`);
                }
            } else {
                logs.push('❌ 未找到 GameScene');
            }

            return logs;
        });

        // 打印收集到的信息
        debugInfo.forEach(line => console.log(line));

        // 等待 Console 日誌出現
        console.log('\n⏳ 等待 Console 日誌...');
        await page.waitForTimeout(2000);

        // 收集 Console 日誌
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        });

        // 再等待一下以收集更多日誌
        await page.waitForTimeout(2000);

        // 過濾相關的日誌
        console.log('\n=== 📋 Console 日誌 ===');
        const relevantLogs = consoleLogs.filter(log => 
            log.includes('圖片檢測') || 
            log.includes('卡片佈局') ||
            log.includes('frameWidth') ||
            log.includes('cardHeightInFrame') ||
            log.includes('hasImages')
        );

        if (relevantLogs.length > 0) {
            relevantLogs.forEach(log => console.log(log));
        } else {
            console.log('⚠️ 未找到相關的 Console 日誌');
        }

        // 截圖
        const screenshotPath = path.join(__dirname, 'mobile-debug-screenshot.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`\n📸 截圖已保存: ${screenshotPath}`);

        // 保存詳細報告
        const reportPath = path.join(__dirname, 'mobile-debug-report.txt');
        const report = `
=== 手機直向調試報告 ===
時間: ${new Date().toISOString()}
設備: iPhone 12 Pro 直向模式
視窗大小: 375×667px

${debugInfo.join('\n')}

=== Console 日誌 ===
${relevantLogs.join('\n')}
        `;

        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 報告已保存: ${reportPath}`);

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    } finally {
        await browser.close();
    }
}

// 運行
collectMobileDebugInfo().catch(console.error);

