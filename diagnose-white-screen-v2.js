#!/usr/bin/env node

const { chromium } = require('playwright');

async function diagnoseWhiteScreen() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 收集所有控制台消息
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // 收集所有網絡請求
    const networkRequests = [];
    page.on('response', response => {
        networkRequests.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
        });
    });

    try {
        console.log('🔍 開始診斷白屏問題...\n');

        const gameUrl = 'http://localhost:3000/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94';
        console.log(`📍 導航到遊戲頁面: ${gameUrl}`);
        
        await page.goto(gameUrl, { waitUntil: 'networkidle' });
        console.log('✅ 頁面標題:', await page.title());

        // 等待一段時間讓遊戲初始化
        await page.waitForTimeout(3000);

        // 檢查 DOM 結構
        console.log('\n📊 檢查 DOM 結構...');
        const bodyInfo = await page.evaluate(() => {
            const body = document.body;
            return {
                className: body.className,
                childCount: body.children.length,
                children: Array.from(body.children).map(el => ({
                    tag: el.tagName,
                    id: el.id,
                    class: el.className
                }))
            };
        });
        console.log('Body 類名:', bodyInfo.className);
        console.log('子元素數量:', bodyInfo.childCount);

        // 檢查遊戲容器
        console.log('\n🎮 檢查遊戲容器...');
        const gameContainerInfo = await page.evaluate(() => {
            const container = document.getElementById('game-container');
            if (!container) return { found: false };
            
            return {
                found: true,
                id: container.id,
                class: container.className,
                width: container.offsetWidth,
                height: container.offsetHeight,
                display: window.getComputedStyle(container).display,
                visibility: window.getComputedStyle(container).visibility,
                childCount: container.children.length
            };
        });

        if (gameContainerInfo.found) {
            console.log('✅ 遊戲容器已找到:', gameContainerInfo);
        } else {
            console.log('❌ 遊戲容器未找到！');
        }

        // 檢查 Phaser 遊戲實例
        console.log('\n🎯 檢查 Phaser 遊戲實例...');
        const phaserInfo = await page.evaluate(() => {
            return {
                hasPhaser: typeof window.Phaser !== 'undefined',
                hasGame: typeof window.matchUpGame !== 'undefined',
                gameRunning: window.matchUpGame?.isRunning?.() || false,
                gameState: window.matchUpGame?.state || 'unknown'
            };
        });
        console.log('Phaser 信息:', phaserInfo);

        // 檢查控制台消息
        console.log('\n📋 控制台消息:');
        const errorLogs = consoleLogs.filter(m => m.type === 'error');
        const warningLogs = consoleLogs.filter(m => m.type === 'warning');
        const logLogs = consoleLogs.filter(m => m.type === 'log');

        console.log(`❌ 錯誤 (${errorLogs.length}):`);
        errorLogs.forEach((msg, idx) => {
            console.log(`   ${idx + 1}. ${msg.text}`);
        });

        console.log(`⚠️  警告 (${warningLogs.length})`);
        console.log(`ℹ️  日誌 (${logLogs.length})`);

        // 檢查網絡請求
        console.log('\n🌐 網絡請求統計:');
        const failedRequests = networkRequests.filter(r => r.status >= 400);
        console.log(`   總請求數: ${networkRequests.length}`);
        console.log(`   失敗請求: ${failedRequests.length}`);
        if (failedRequests.length > 0) {
            console.log('   失敗的請求:');
            failedRequests.forEach(req => {
                console.log(`     - ${req.status} ${req.url}`);
            });
        }

        // 診斷結論
        console.log('\n🔍 診斷結論:');
        if (!gameContainerInfo.found) {
            console.log('❌ 問題: 遊戲容器未找到');
            console.log('   可能原因: HTML 結構不正確或容器 ID 錯誤');
        } else if (!phaserInfo.hasGame) {
            console.log('❌ 問題: Phaser 遊戲實例未初始化');
            console.log('   可能原因: JavaScript 錯誤或 Phaser 腳本未加載');
        } else if (!phaserInfo.gameRunning) {
            console.log('⚠️  問題: Phaser 遊戲未運行');
            console.log('   可能原因: 遊戲初始化失敗或場景未啟動');
        } else {
            console.log('✅ 遊戲似乎正常運行');
        }

        if (errorLogs.length > 0) {
            console.log('\n❌ 發現 JavaScript 錯誤:');
            errorLogs.slice(0, 5).forEach(msg => {
                console.log(`   - ${msg.text}`);
            });
        }

    } catch (error) {
        console.error('❌ 診斷過程出錯:', error.message);
    } finally {
        await browser.close();
    }
}

diagnoseWhiteScreen();

