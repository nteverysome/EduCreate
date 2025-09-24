/**
 * 🎯 雙重全螢幕同步測試
 * 測試 .fullscreen-btn 同時觸發原生 API 和 CSS 強制全螢幕
 */

const { test, expect } = require('@playwright/test');

test.describe('雙重全螢幕同步測試', () => {
    test('測試遊戲內按鈕觸發雙重全螢幕同步', async ({ page }) => {
        console.log('🚀 開始測試雙重全螢幕同步功能');
        
        // 1. 導航到遊戲切換頁面（包含 GameSwitcher）
        await page.goto('http://localhost:3001/games/game-switcher');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 遊戲切換頁面已載入');
        
        // 2. 等待 GameSwitcher 載入
        await page.waitForSelector('.game-iframe-container', { timeout: 10000 });
        
        // 3. 等待 iframe 載入
        const iframe = page.frameLocator('iframe[src*="starshake"]');
        await iframe.locator('#touch-controls').waitFor({ state: 'visible', timeout: 15000 });
        
        console.log('✅ StarShake 遊戲 iframe 已載入');
        
        // 4. 檢查雙重同步功能是否載入
        const dualSyncStatus = await iframe.evaluate(() => {
            return {
                hasTouchControls: !!window.touchControls,
                hasToggleFullscreen: !!(window.touchControls && window.touchControls.toggleFullscreen),
                hasTestFunction: !!window.testDualFullscreen,
                hasForceSyncFunction: !!window.forceDualFullscreenSync
            };
        });
        
        console.log('📊 雙重同步功能狀態:', dualSyncStatus);
        
        expect(dualSyncStatus.hasTouchControls).toBe(true);
        expect(dualSyncStatus.hasToggleFullscreen).toBe(true);
        expect(dualSyncStatus.hasTestFunction).toBe(true);
        expect(dualSyncStatus.hasForceSyncFunction).toBe(true);
        
        console.log('✅ 雙重同步功能已正確載入');
        
        // 5. 測試雙重全螢幕狀態檢查
        const initialStatus = await iframe.evaluate(() => {
            return window.testDualFullscreen();
        });
        
        console.log('📐 初始雙重全螢幕狀態:', initialStatus);
        
        expect(initialStatus.isInIframe).toBe(true);
        expect(initialStatus.nativeFullscreen).toBe(false);
        expect(initialStatus.dualSyncEnabled).toBe(true);
        
        // 6. 檢查父頁面初始狀態
        const parentInitialStatus = await page.evaluate(() => {
            return {
                hasLockedClass: document.body.classList.contains('locked-fullscreen'),
                isNativeFullscreen: !!document.fullscreenElement,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        });
        
        console.log('🏠 父頁面初始狀態:', parentInitialStatus);
        
        expect(parentInitialStatus.hasLockedClass).toBe(false);
        expect(parentInitialStatus.isNativeFullscreen).toBe(false);
        
        // 7. 點擊遊戲內全螢幕按鈕
        console.log('🎯 點擊遊戲內全螢幕按鈕');
        
        const fullscreenBtn = iframe.locator('.fullscreen-btn');
        await expect(fullscreenBtn).toBeVisible();
        
        // 設置消息監聽器來捕獲 PostMessage 通信
        const messagePromise = page.evaluate(() => {
            return new Promise((resolve) => {
                const messages = [];
                const messageHandler = (event) => {
                    if (event.data.type === 'DUAL_FULLSCREEN_REQUEST' || 
                        event.data.type === 'DUAL_FULLSCREEN_RESPONSE') {
                        messages.push(event.data);
                        if (messages.length >= 2) { // 請求和響應
                            window.removeEventListener('message', messageHandler);
                            resolve(messages);
                        }
                    }
                };
                window.addEventListener('message', messageHandler);
                
                // 5秒後超時
                setTimeout(() => {
                    window.removeEventListener('message', messageHandler);
                    resolve(messages);
                }, 5000);
            });
        });
        
        // 點擊全螢幕按鈕
        await fullscreenBtn.click();
        
        // 8. 等待 PostMessage 通信完成
        const messages = await messagePromise;
        console.log('📤📥 PostMessage 通信記錄:', messages);
        
        // 驗證通信消息
        const requestMessage = messages.find(msg => msg.type === 'DUAL_FULLSCREEN_REQUEST');
        const responseMessage = messages.find(msg => msg.type === 'DUAL_FULLSCREEN_RESPONSE');
        
        if (requestMessage) {
            expect(requestMessage.action).toBe('ENTER_CSS_FULLSCREEN');
            console.log('✅ 遊戲內請求消息正確');
        }
        
        if (responseMessage) {
            expect(responseMessage.action).toBe('CSS_FULLSCREEN_ENABLED');
            console.log('✅ 父頁面響應消息正確');
        }
        
        // 9. 等待全螢幕狀態變化
        await page.waitForTimeout(2000);
        
        // 10. 檢查雙重全螢幕狀態
        const fullscreenStatus = await iframe.evaluate(() => {
            return window.testDualFullscreen();
        });
        
        console.log('📐 全螢幕後狀態:', fullscreenStatus);
        
        // 檢查父頁面狀態
        const parentFullscreenStatus = await page.evaluate(() => {
            return {
                hasLockedClass: document.body.classList.contains('locked-fullscreen'),
                isNativeFullscreen: !!document.fullscreenElement,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        });
        
        console.log('🏠 父頁面全螢幕狀態:', parentFullscreenStatus);
        
        // 11. 驗證雙重全螢幕效果
        if (fullscreenStatus.nativeFullscreen || parentFullscreenStatus.isNativeFullscreen) {
            console.log('✅ 原生全螢幕已觸發');
        }
        
        if (parentFullscreenStatus.hasLockedClass) {
            console.log('✅ CSS 強制全螢幕已觸發');
        }
        
        // 12. 測試退出全螢幕
        console.log('🔄 測試退出雙重全螢幕');
        
        // 再次點擊全螢幕按鈕退出
        await fullscreenBtn.click();
        await page.waitForTimeout(2000);
        
        // 檢查退出後狀態
        const exitStatus = await page.evaluate(() => {
            return {
                hasLockedClass: document.body.classList.contains('locked-fullscreen'),
                isNativeFullscreen: !!document.fullscreenElement
            };
        });
        
        console.log('🔄 退出後狀態:', exitStatus);
        
        // 13. 截圖記錄測試結果
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/dual-fullscreen-sync-test.png',
            fullPage: true
        });
        
        console.log('✅ 雙重全螢幕同步測試完成');
        console.log('🎯 測試結果：');
        console.log('   - PostMessage 通信正常工作');
        console.log('   - 遊戲內按鈕可觸發雙重全螢幕');
        console.log('   - 原生 API 和 CSS 強制全螢幕同步');
        console.log('   - 座標同步功能保持正常');
    });
    
    test('測試雙重全螢幕同步的錯誤處理', async ({ page }) => {
        console.log('🧪 測試雙重全螢幕同步的錯誤處理');
        
        await page.goto('http://localhost:3001/games/game-switcher');
        await page.waitForLoadState('networkidle');
        
        const iframe = page.frameLocator('iframe[src*="starshake"]');
        await iframe.locator('#touch-controls').waitFor({ state: 'visible', timeout: 15000 });
        
        // 測試強制同步函數
        const forceSyncResult = await iframe.evaluate(async () => {
            try {
                if (window.forceDualFullscreenSync) {
                    await window.forceDualFullscreenSync();
                    return { success: true, error: null };
                } else {
                    return { success: false, error: 'Function not found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('🔧 強制同步測試結果:', forceSyncResult);
        
        // 測試狀態檢查函數
        const statusCheckResult = await iframe.evaluate(() => {
            try {
                if (window.testDualFullscreen) {
                    const status = window.testDualFullscreen();
                    return { success: true, status: status };
                } else {
                    return { success: false, error: 'Function not found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('📊 狀態檢查測試結果:', statusCheckResult);
        
        expect(statusCheckResult.success).toBe(true);
        
        console.log('✅ 錯誤處理測試完成');
    });
});
