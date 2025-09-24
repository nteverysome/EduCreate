const { test, expect } = require('@playwright/test');

test.describe('Starshake TouchControls 最終整合測試', () => {
    test('驗證 TouchControls 與 Phaser 遊戲完整整合', async ({ page }) => {
        console.log('🎯 開始最終 TouchControls 整合測試...');
        
        // 設置控制台監聽
        const consoleMessages = [];
        const pageErrors = [];
        
        page.on('console', msg => {
            consoleMessages.push(`📝 控制台 (${msg.type()}): ${msg.text()}`);
            console.log(`📝 控制台 (${msg.type()}): ${msg.text()}`);
        });
        
        page.on('pageerror', error => {
            pageErrors.push(error.message);
            console.log(`❌ 頁面錯誤: ${error.message}`);
        });
        
        // 1. 導航到遊戲頁面
        console.log('🌐 導航到 Starshake 遊戲頁面...');
        await page.goto('http://localhost:3000/games/starshake-game');
        
        // 2. 等待遊戲載入
        console.log('⏱️ 等待遊戲完全載入...');
        await page.waitForTimeout(3000);
        
        // 3. 檢查基本對象存在
        console.log('🔍 檢查基本對象存在性...');
        const gameContainer = await page.locator('#game-container').count();
        const touchControls = await page.evaluate(() => !!window.touchControls);
        const phaser = await page.evaluate(() => !!window.Phaser);
        
        console.log(`🎮 遊戲容器: ${gameContainer > 0 ? '✅' : '❌'}`);
        console.log(`📱 TouchControls: ${touchControls ? '✅' : '❌'}`);
        console.log(`🎯 Phaser: ${phaser ? '✅' : '❌'}`);
        
        // 4. 檢查 TouchControls 功能
        console.log('🕹️ 測試 TouchControls 功能...');
        const touchControlsTest = await page.evaluate(() => {
            if (!window.touchControls) return { error: 'TouchControls 不存在' };
            
            try {
                const state = window.touchControls.getInputState();
                return {
                    hasGetInputState: typeof window.touchControls.getInputState === 'function',
                    initialState: state,
                    hasDirection: state && typeof state.direction === 'object',
                    hasShooting: state && typeof state.shooting === 'boolean'
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('📊 TouchControls 測試結果:', touchControlsTest);
        
        // 5. 模擬移動設備並測試觸摸控制
        console.log('📱 模擬移動設備...');
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone 尺寸
        await page.reload();
        await page.waitForTimeout(2000);
        
        // 6. 檢查 TouchControls 是否在移動設備上顯示
        console.log('👀 檢查 TouchControls 在移動設備上的顯示...');
        const touchControlsVisible = await page.evaluate(() => {
            const joystick = document.querySelector('.virtual-joystick');
            const shootButton = document.querySelector('.shoot-button');
            const fullscreenButton = document.querySelector('.fullscreen-button');
            
            return {
                joystick: joystick ? {
                    exists: true,
                    visible: window.getComputedStyle(joystick).display !== 'none',
                    opacity: window.getComputedStyle(joystick).opacity
                } : { exists: false },
                shootButton: shootButton ? {
                    exists: true,
                    visible: window.getComputedStyle(shootButton).display !== 'none',
                    opacity: window.getComputedStyle(shootButton).opacity
                } : { exists: false },
                fullscreenButton: fullscreenButton ? {
                    exists: true,
                    visible: window.getComputedStyle(fullscreenButton).display !== 'none',
                    opacity: window.getComputedStyle(fullscreenButton).opacity
                } : { exists: false }
            };
        });
        
        console.log('🎮 TouchControls 顯示狀態:', touchControlsVisible);
        
        // 7. 測試觸摸事件
        console.log('👆 測試觸摸事件...');
        
        // 測試虛擬搖桿
        if (touchControlsVisible.joystick.exists) {
            console.log('🕹️ 測試虛擬搖桿觸摸...');
            await page.locator('.virtual-joystick').tap();
            await page.waitForTimeout(500);
            
            // 檢查觸摸後的狀態
            const stateAfterJoystick = await page.evaluate(() => {
                return window.touchControls ? window.touchControls.getInputState() : null;
            });
            console.log('🎯 搖桿觸摸後狀態:', stateAfterJoystick);
        }
        
        // 測試射擊按鈕
        if (touchControlsVisible.shootButton.exists) {
            console.log('🚀 測試射擊按鈕觸摸...');
            await page.locator('.shoot-button').tap();
            await page.waitForTimeout(500);
            
            // 檢查觸摸後的狀態
            const stateAfterShoot = await page.evaluate(() => {
                return window.touchControls ? window.touchControls.getInputState() : null;
            });
            console.log('🎯 射擊按鈕觸摸後狀態:', stateAfterShoot);
        }
        
        // 8. 測試遊戲整合
        console.log('🎮 測試遊戲整合...');
        
        // 點擊開始遊戲
        await page.click('body'); // 點擊啟動遊戲
        await page.waitForTimeout(2000);
        
        // 檢查遊戲是否正在運行
        const gameRunning = await page.evaluate(() => {
            // 檢查是否有遊戲場景
            return document.querySelector('canvas') !== null;
        });
        
        console.log(`🎯 遊戲運行狀態: ${gameRunning ? '✅' : '❌'}`);
        
        // 9. 最終統計
        console.log('📊 最終測試統計:');
        console.log(`  - 頁面錯誤: ${pageErrors.length}`);
        console.log(`  - 控制台錯誤: ${consoleMessages.filter(msg => msg.includes('error')).length}`);
        console.log(`  - 控制台警告: ${consoleMessages.filter(msg => msg.includes('warning')).length}`);
        console.log(`  - 控制台日誌: ${consoleMessages.filter(msg => msg.includes('log')).length}`);
        
        if (pageErrors.length > 0) {
            console.log('❌ 發現的頁面錯誤:');
            pageErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // 10. 截圖記錄
        await page.screenshot({ 
            path: `EduCreate-Test-Videos/current/success/20250924_starshake_touchcontrols_final_integration_success_v1_001.png`,
            fullPage: true 
        });
        
        console.log('🎉 最終 TouchControls 整合測試完成！');
        
        // 基本斷言
        expect(gameContainer).toBeGreaterThan(0);
        expect(touchControls).toBe(true);
        expect(phaser).toBe(true);
        expect(pageErrors.length).toBe(0); // 不應該有頁面錯誤
    });
});
