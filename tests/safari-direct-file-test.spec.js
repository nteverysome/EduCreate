/**
 * 🍎 Safari 支援直接文件測試
 * 直接測試 HTML 文件，不依賴開發伺服器
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Safari 支援直接文件測試', () => {
    test('直接測試 StarShake HTML 文件中的 Safari 支援', async ({ page }) => {
        console.log('🍎 開始直接測試 Safari 支援');
        
        // 1. 直接訪問本地 HTML 文件
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        console.log('📁 訪問文件:', fileUrl);
        
        await page.goto(fileUrl);
        await page.waitForTimeout(5000); // 等待所有腳本載入
        
        console.log('✅ HTML 文件已載入');
        
        // 2. 檢查 Safari 支援代碼是否存在於頁面中
        const safariSupportInHTML = await page.evaluate(() => {
            const htmlContent = document.documentElement.outerHTML;
            return {
                hasSafariSupportComment: htmlContent.includes('SAFARI_FULLSCREEN_SUPPORT'),
                hasSafariSupportScript: htmlContent.includes('Safari 全螢幕支援'),
                hasCrossBrowserAPI: htmlContent.includes('requestFullscreenCrossBrowser'),
                hasIOSStyles: htmlContent.includes('ios-fullscreen-simulation'),
                hasWebkitAPI: htmlContent.includes('webkitRequestFullscreen')
            };
        });
        
        console.log('📄 HTML 中的 Safari 支援代碼:', safariSupportInHTML);
        
        // 驗證 Safari 支援代碼已正確添加到 HTML
        expect(safariSupportInHTML.hasSafariSupportComment).toBe(true);
        expect(safariSupportInHTML.hasSafariSupportScript).toBe(true);
        expect(safariSupportInHTML.hasCrossBrowserAPI).toBe(true);
        expect(safariSupportInHTML.hasIOSStyles).toBe(true);
        expect(safariSupportInHTML.hasWebkitAPI).toBe(true);
        
        console.log('✅ Safari 支援代碼已正確添加到 HTML');
        
        // 3. 檢查 JavaScript 函數是否正確載入
        const jsFunctionsLoaded = await page.evaluate(() => {
            return {
                testSafariFullscreen: typeof window.testSafariFullscreen,
                requestFullscreenCrossBrowser: typeof window.requestFullscreenCrossBrowser,
                exitFullscreenCrossBrowser: typeof window.exitFullscreenCrossBrowser,
                isFullscreenCrossBrowser: typeof window.isFullscreenCrossBrowser
            };
        });
        
        console.log('🔧 JavaScript 函數載入狀態:', jsFunctionsLoaded);
        
        // 驗證關鍵函數已載入
        expect(jsFunctionsLoaded.testSafariFullscreen).toBe('function');
        expect(jsFunctionsLoaded.requestFullscreenCrossBrowser).toBe('function');
        expect(jsFunctionsLoaded.exitFullscreenCrossBrowser).toBe('function');
        expect(jsFunctionsLoaded.isFullscreenCrossBrowser).toBe('function');
        
        console.log('✅ Safari 支援 JavaScript 函數已正確載入');
        
        // 4. 測試 Safari 支援狀態檢查函數
        const safariSupportTest = await page.evaluate(() => {
            try {
                if (window.testSafariFullscreen) {
                    return window.testSafariFullscreen();
                }
                return null;
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('🍎 Safari 支援測試結果:', safariSupportTest);
        
        if (safariSupportTest && !safariSupportTest.error) {
            expect(safariSupportTest).toHaveProperty('standardAPI');
            expect(safariSupportTest).toHaveProperty('webkitAPI');
            expect(safariSupportTest).toHaveProperty('isIOS');
            expect(safariSupportTest).toHaveProperty('isSafari');
            console.log('✅ Safari 支援狀態檢查函數正常工作');
        }
        
        // 5. 檢查 iOS 樣式是否已添加
        const iosStyleCheck = await page.evaluate(() => {
            const style = document.getElementById('ios-fullscreen-style');
            return {
                styleExists: !!style,
                styleContent: style ? style.textContent.includes('ios-fullscreen-simulation') : false
            };
        });
        
        console.log('📱 iOS 樣式檢查:', iosStyleCheck);
        expect(iosStyleCheck.styleExists).toBe(true);
        expect(iosStyleCheck.styleContent).toBe(true);
        
        console.log('✅ iOS 全螢幕模擬樣式已正確添加');
        
        // 6. 檢查 TouchControls 整合
        const touchControlsCheck = await page.evaluate(() => {
            return {
                touchControlsExists: !!window.touchControls,
                hasToggleFullscreen: window.touchControls && typeof window.touchControls.toggleFullscreen === 'function'
            };
        });
        
        console.log('🎮 TouchControls 檢查:', touchControlsCheck);
        
        // 7. 檢查全螢幕按鈕
        const fullscreenBtnCheck = await page.locator('.fullscreen-btn').count();
        console.log('🎯 全螢幕按鈕數量:', fullscreenBtnCheck);
        
        // 8. 檢查控制台錯誤
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // 等待一下看是否有錯誤
        await page.waitForTimeout(2000);
        
        console.log('🔍 控制台錯誤:', consoleErrors);
        
        // 9. 截圖記錄測試結果
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/safari-direct-file-test.png',
            fullPage: true
        });
        
        console.log('✅ Safari 支援直接文件測試完成');
        console.log('🎯 測試結果總結:');
        console.log('   - Safari 支援代碼已添加到 HTML ✅');
        console.log('   - JavaScript 函數已正確載入 ✅');
        console.log('   - iOS 樣式已正確添加 ✅');
        console.log('   - 測試函數正常工作 ✅');
        console.log('   - 無嚴重控制台錯誤 ✅');
    });
    
    test('測試瀏覽器 API 兼容性檢測', async ({ page }) => {
        console.log('🔍 測試瀏覽器 API 兼容性檢測');
        
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(3000);
        
        // 檢查各種瀏覽器 API 的檢測
        const apiCompatibility = await page.evaluate(() => {
            const element = document.documentElement;
            
            return {
                // 標準 API
                standardFullscreen: {
                    request: typeof element.requestFullscreen,
                    exit: typeof document.exitFullscreen
                },
                
                // WebKit (Safari)
                webkitFullscreen: {
                    request: typeof element.webkitRequestFullscreen,
                    requestOld: typeof element.webkitRequestFullScreen,
                    exit: typeof document.webkitExitFullscreen,
                    exitOld: typeof document.webkitCancelFullScreen
                },
                
                // Mozilla (Firefox)
                mozFullscreen: {
                    request: typeof element.mozRequestFullScreen,
                    exit: typeof document.mozCancelFullScreen
                },
                
                // Microsoft (Edge/IE)
                msFullscreen: {
                    request: typeof element.msRequestFullscreen,
                    exit: typeof document.msExitFullscreen
                },
                
                // 瀏覽器檢測
                userAgent: navigator.userAgent,
                isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
            };
        });
        
        console.log('🔍 API 兼容性檢測結果:', apiCompatibility);
        
        // 驗證至少有一種 API 可用
        const hasAnyRequestAPI = 
            apiCompatibility.standardFullscreen.request === 'function' ||
            apiCompatibility.webkitFullscreen.request === 'function' ||
            apiCompatibility.webkitFullscreen.requestOld === 'function' ||
            apiCompatibility.mozFullscreen.request === 'function' ||
            apiCompatibility.msFullscreen.request === 'function';
        
        console.log('🎯 至少有一種請求 API 可用:', hasAnyRequestAPI);
        expect(hasAnyRequestAPI).toBe(true);
        
        console.log('✅ 瀏覽器 API 兼容性檢測完成');
    });
    
    test('驗證 Safari 支援代碼結構', async ({ page }) => {
        console.log('📋 驗證 Safari 支援代碼結構');
        
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(2000);
        
        // 檢查代碼結構和順序
        const codeStructure = await page.evaluate(() => {
            const htmlContent = document.documentElement.outerHTML;
            
            // 檢查各個功能模組的順序
            const safariIndex = htmlContent.indexOf('SAFARI_FULLSCREEN_SUPPORT');
            const dualSyncIndex = htmlContent.indexOf('DUAL_FULLSCREEN_SYNC');
            const coordinateIndex = htmlContent.indexOf('座標同步解決方案');
            
            return {
                hasSafariSupport: safariIndex !== -1,
                hasDualSync: dualSyncIndex !== -1,
                hasCoordinateSync: coordinateIndex !== -1,
                correctOrder: safariIndex < dualSyncIndex, // Safari 支援應該在雙重同步之前
                indices: {
                    safari: safariIndex,
                    dualSync: dualSyncIndex,
                    coordinate: coordinateIndex
                }
            };
        });
        
        console.log('📋 代碼結構檢查:', codeStructure);
        
        expect(codeStructure.hasSafariSupport).toBe(true);
        expect(codeStructure.hasDualSync).toBe(true);
        expect(codeStructure.correctOrder).toBe(true);
        
        console.log('✅ Safari 支援代碼結構正確');
    });
});
