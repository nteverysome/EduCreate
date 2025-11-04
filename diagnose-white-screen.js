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
    const requests = [];
    page.on('request', req => {
        requests.push({
            url: req.url(),
            method: req.method(),
            resourceType: req.resourceType()
        });
    });

    // 收集所有網絡響應
    const responses = [];
    page.on('response', res => {
        responses.push({
            url: res.url(),
            status: res.status(),
            statusText: res.statusText()
        });
    });

    try {
        console.log('🔍 開始診斷白屏問題...\n');

        // 導航到頁面
        console.log('📍 導航到遊戲頁面...');
        await page.goto('http://localhost:3000/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // 等待一段時間讓頁面加載
        await page.waitForTimeout(3000);

        // 檢查頁面標題
        const title = await page.title();
        console.log(`✅ 頁面標題: ${title}\n`);

        // 檢查 DOM 結構
        console.log('📊 檢查 DOM 結構...');
        const bodyContent = await page.evaluate(() => {
            return {
                bodyHTML: document.body.innerHTML.substring(0, 500),
                bodyClasses: document.body.className,
                bodyStyle: document.body.getAttribute('style'),
                childCount: document.body.children.length,
                children: Array.from(document.body.children).map(el => ({
                    tag: el.tagName,
                    id: el.id,
                    class: el.className
                }))
            };
        });

        console.log(`Body 類名: ${bodyContent.bodyClasses}`);
        console.log(`Body 樣式: ${bodyContent.bodyStyle}`);
        console.log(`子元素數量: ${bodyContent.childCount}`);
        console.log('子元素:');
        bodyContent.children.forEach(child => {
            console.log(`  - <${child.tag}> id="${child.id}" class="${child.class}"`);
        });
        console.log('');

        // 檢查遊戲容器
        console.log('🎮 檢查遊戲容器...');
        const gameContainer = await page.evaluate(() => {
            const container = document.getElementById('game-container');
            if (!container) return { found: false };
            return {
                found: true,
                display: window.getComputedStyle(container).display,
                visibility: window.getComputedStyle(container).visibility,
                width: window.getComputedStyle(container).width,
                height: window.getComputedStyle(container).height,
                backgroundColor: window.getComputedStyle(container).backgroundColor,
                innerHTML: container.innerHTML.substring(0, 200)
            };
        });

        if (gameContainer.found) {
            console.log('✅ 遊戲容器已找到');
            console.log(`   Display: ${gameContainer.display}`);
            console.log(`   Visibility: ${gameContainer.visibility}`);
            console.log(`   Size: ${gameContainer.width} x ${gameContainer.height}`);
            console.log(`   Background: ${gameContainer.backgroundColor}`);
        } else {
            console.log('❌ 遊戲容器未找到！');
        }
        console.log('');

        // 檢查 Phaser 遊戲實例
        console.log('🎯 檢查 Phaser 遊戲實例...');
        const gameInstance = await page.evaluate(() => {
            return {
                hasMatchUpGame: !!window.matchUpGame,
                gameState: window.matchUpGame ? window.matchUpGame.isRunning : null,
                scenes: window.matchUpGame ? window.matchUpGame.scene.scenes.map(s => ({
                    key: s.scene.key,
                    isRunning: s.isRunning()
                })) : null
            };
        });

        if (gameInstance.hasMatchUpGame) {
            console.log('✅ Phaser 遊戲實例已找到');
            console.log(`   遊戲運行狀態: ${gameInstance.gameState}`);
            console.log('   場景:');
            gameInstance.scenes.forEach(scene => {
                console.log(`     - ${scene.key}: ${scene.isRunning ? '運行中' : '已停止'}`);
            });
        } else {
            console.log('❌ Phaser 遊戲實例未找到！');
        }
        console.log('');

        // 檢查控制台錯誤
        console.log('📋 控制台消息:');
        const errors = consoleLogs.filter(log => log.type === 'error');
        const warnings = consoleLogs.filter(log => log.type === 'warning');
        const logs = consoleLogs.filter(log => log.type === 'log');

        if (errors.length > 0) {
            console.log(`❌ 錯誤 (${errors.length}):`, errors.slice(0, 5));
        }
        if (warnings.length > 0) {
            console.log(`⚠️  警告 (${warnings.length}):`, warnings.slice(0, 5));
        }
        console.log(`ℹ️  日誌 (${logs.length})`);
        console.log('');

        // 檢查網絡請求
        console.log('🌐 網絡請求統計:');
        const failedRequests = responses.filter(r => r.status >= 400);
        console.log(`   總請求數: ${responses.length}`);
        console.log(`   失敗請求: ${failedRequests.length}`);
        if (failedRequests.length > 0) {
            console.log('   失敗的請求:');
            failedRequests.forEach(req => {
                console.log(`     - ${req.status} ${req.url}`);
            });
        }
        console.log('');

        // 診斷結論
        console.log('🔍 診斷結論:');
        if (!gameContainer.found) {
            console.log('❌ 問題: 遊戲容器未找到');
            console.log('   可能原因: HTML 結構不正確或容器 ID 錯誤');
        } else if (!gameInstance.hasMatchUpGame) {
            console.log('❌ 問題: Phaser 遊戲實例未初始化');
            console.log('   可能原因: 遊戲腳本未加載或初始化失敗');
        } else if (errors.length > 0) {
            console.log('❌ 問題: 控制台有錯誤');
            console.log('   錯誤詳情:');
            errors.forEach(err => {
                console.log(`     - ${err.text}`);
            });
        } else {
            console.log('✅ 頁面加載正常，可能是渲染問題');
        }

    } catch (error) {
        console.error('❌ 診斷過程出錯:', error.message);
    } finally {
        await browser.close();
    }
}

diagnoseWhiteScreen().catch(console.error);

