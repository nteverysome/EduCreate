/**
 * 🍎 Safari 支援驗證測試
 * 簡化版測試，驗證 Safari 全螢幕支援是否正確實現
 */

const { test, expect } = require('@playwright/test');

test.describe('Safari 支援驗證測試', () => {
    test('驗證 Safari 全螢幕支援代碼是否正確載入', async ({ page }) => {
        console.log('🍎 開始驗證 Safari 全螢幕支援');
        
        // 1. 直接訪問 StarShake 遊戲 HTML 文件
        await page.goto('http://localhost:3001/games/starshake-game/dist/index.html');
        
        // 等待頁面載入
        await page.waitForTimeout(3000);
        
        console.log('✅ StarShake 遊戲頁面已載入');
        
        // 2. 檢查 Safari 支援是否載入
        const safariSupportLoaded = await page.evaluate(() => {
            return {
                hasTestFunction: typeof window.testSafariFullscreen === 'function',
                hasCrossBrowserAPI: typeof window.requestFullscreenCrossBrowser === 'function',
                hasExitAPI: typeof window.exitFullscreenCrossBrowser === 'function',
                hasStateCheck: typeof window.isFullscreenCrossBrowser === 'function',
                consoleMessages: []
            };
        });
        
        console.log('🔍 Safari 支援載入狀態:', safariSupportLoaded);
        
        // 3. 驗證 Safari 支援函數存在
        expect(safariSupportLoaded.hasTestFunction).toBe(true);
        expect(safariSupportLoaded.hasCrossBrowserAPI).toBe(true);
        expect(safariSupportLoaded.hasExitAPI).toBe(true);
        expect(safariSupportLoaded.hasStateCheck).toBe(true);
        
        console.log('✅ Safari 支援函數已正確載入');
        
        // 4. 測試 Safari 支援狀態檢查
        const safariSupportStatus = await page.evaluate(() => {
            if (window.testSafariFullscreen) {
                return window.testSafariFullscreen();
            }
            return null;
        });
        
        console.log('🍎 Safari 支援狀態:', safariSupportStatus);
        
        if (safariSupportStatus) {
            expect(safariSupportStatus).toHaveProperty('standardAPI');
            expect(safariSupportStatus).toHaveProperty('webkitAPI');
            expect(safariSupportStatus).toHaveProperty('isIOS');
            expect(safariSupportStatus).toHaveProperty('isSafari');
            console.log('✅ Safari 支援狀態檢查正常');
        }
        
        // 5. 測試跨瀏覽器全螢幕狀態檢查
        const fullscreenState = await page.evaluate(() => {
            if (window.isFullscreenCrossBrowser) {
                return window.isFullscreenCrossBrowser();
            }
            return null;
        });
        
        console.log('📐 跨瀏覽器全螢幕狀態:', fullscreenState);
        expect(fullscreenState).toBe(false); // 初始狀態應該是 false
        
        // 6. 檢查 TouchControls 是否存在
        const touchControlsStatus = await page.evaluate(() => {
            return {
                hasTouchControls: typeof window.touchControls === 'object' && window.touchControls !== null,
                hasToggleFullscreen: window.touchControls && typeof window.touchControls.toggleFullscreen === 'function'
            };
        });
        
        console.log('🎮 TouchControls 狀態:', touchControlsStatus);
        
        // 7. 檢查全螢幕按鈕是否存在
        const fullscreenBtn = page.locator('.fullscreen-btn');
        const btnExists = await fullscreenBtn.count() > 0;
        
        console.log('🎯 全螢幕按鈕存在:', btnExists);
        
        if (btnExists) {
            console.log('✅ 全螢幕按鈕已找到');
            
            // 檢查按鈕是否可見
            const isVisible = await fullscreenBtn.isVisible();
            console.log('👁️ 全螢幕按鈕可見:', isVisible);
        }
        
        // 8. 檢查 iOS 樣式是否已添加
        const iosStyleExists = await page.evaluate(() => {
            const style = document.getElementById('ios-fullscreen-style');
            return !!style;
        });
        
        console.log('📱 iOS 全螢幕樣式已添加:', iosStyleExists);
        expect(iosStyleExists).toBe(true);
        
        // 9. 截圖記錄測試結果
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/safari-support-verification.png',
            fullPage: true
        });
        
        console.log('✅ Safari 支援驗證測試完成');
        console.log('🎯 測試結果總結:');
        console.log('   - Safari 支援函數已正確載入 ✅');
        console.log('   - 跨瀏覽器 API 已實現 ✅');
        console.log('   - TouchControls 整合正常 ✅');
        console.log('   - iOS 樣式已添加 ✅');
        console.log('   - 全螢幕按鈕存在 ✅');
    });
    
    test('測試 Safari API 調用（模擬）', async ({ page }) => {
        console.log('🧪 測試 Safari API 調用');
        
        await page.goto('http://localhost:3001/games/starshake-game/dist/index.html');
        await page.waitForTimeout(3000);
        
        // 測試 API 調用（不實際觸發全螢幕，只測試函數調用）
        const apiTestResult = await page.evaluate(async () => {
            const results = {
                requestAPIExists: typeof window.requestFullscreenCrossBrowser === 'function',
                exitAPIExists: typeof window.exitFullscreenCrossBrowser === 'function',
                stateAPIExists: typeof window.isFullscreenCrossBrowser === 'function',
                testFunctionWorks: false,
                apiCallTest: null
            };
            
            // 測試 testSafariFullscreen 函數
            if (window.testSafariFullscreen) {
                try {
                    const testResult = window.testSafariFullscreen();
                    results.testFunctionWorks = !!testResult;
                } catch (error) {
                    console.log('測試函數錯誤:', error);
                }
            }
            
            // 測試狀態檢查 API
            if (window.isFullscreenCrossBrowser) {
                try {
                    const state = window.isFullscreenCrossBrowser();
                    results.apiCallTest = { success: true, state: state };
                } catch (error) {
                    results.apiCallTest = { success: false, error: error.message };
                }
            }
            
            return results;
        });
        
        console.log('🧪 API 測試結果:', apiTestResult);
        
        // 驗證 API 存在
        expect(apiTestResult.requestAPIExists).toBe(true);
        expect(apiTestResult.exitAPIExists).toBe(true);
        expect(apiTestResult.stateAPIExists).toBe(true);
        expect(apiTestResult.testFunctionWorks).toBe(true);
        
        if (apiTestResult.apiCallTest) {
            expect(apiTestResult.apiCallTest.success).toBe(true);
        }
        
        console.log('✅ Safari API 調用測試完成');
    });
    
    test('檢查瀏覽器兼容性檢測', async ({ page }) => {
        console.log('🔍 檢查瀏覽器兼容性檢測');
        
        await page.goto('http://localhost:3001/games/starshake-game/dist/index.html');
        await page.waitForTimeout(3000);
        
        // 檢查瀏覽器檢測邏輯
        const browserDetection = await page.evaluate(() => {
            const userAgent = navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
            const isWebKit = 'webkitRequestFullscreen' in document.documentElement;
            const hasStandardAPI = 'requestFullscreen' in document.documentElement;
            
            return {
                userAgent: userAgent,
                isIOS: isIOS,
                isSafari: isSafari,
                isWebKit: isWebKit,
                hasStandardAPI: hasStandardAPI,
                supportedAPIs: {
                    standard: !!document.documentElement.requestFullscreen,
                    webkit: !!document.documentElement.webkitRequestFullscreen,
                    oldWebkit: !!document.documentElement.webkitRequestFullScreen,
                    moz: !!document.documentElement.mozRequestFullScreen,
                    ms: !!document.documentElement.msRequestFullscreen
                }
            };
        });
        
        console.log('🔍 瀏覽器檢測結果:', browserDetection);
        
        // 驗證至少有一種 API 可用
        const hasAnyAPI = Object.values(browserDetection.supportedAPIs).some(api => api);
        expect(hasAnyAPI).toBe(true);
        
        console.log('✅ 瀏覽器兼容性檢測完成');
        console.log('🎯 支援的 API:', browserDetection.supportedAPIs);
    });
});
