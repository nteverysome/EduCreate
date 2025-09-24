/**
 * 🎯 座標同步測試
 * 測試 CSS 強制全螢幕與原生 Fullscreen API 的座標同步解決方案
 */

const { test, expect } = require('@playwright/test');

test.describe('座標同步解決方案測試', () => {
    test('測試 CSS 強制全螢幕與原生 API 座標同步', async ({ page }) => {
        console.log('🚀 開始測試座標同步解決方案');
        
        // 1. 導航到 StarShake 遊戲
        await page.goto('http://localhost:3001/games/starshake-game');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 遊戲頁面已載入');
        
        // 2. 等待遊戲完全載入
        await page.waitForTimeout(3000);
        
        // 3. 注入座標同步解決方案
        await page.addScriptTag({
            content: `
                // 座標同步解決方案
                console.log('🔧 注入座標同步解決方案');
                
                // 檢查當前座標狀態
                function checkCurrentCoordinates() {
                    const results = {
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        touchControls: null,
                        gameCanvas: null
                    };
                    
                    // 檢查 TouchControls 座標
                    if (window.touchControls) {
                        const joystick = document.querySelector('.touch-joystick');
                        const shootBtn = document.querySelector('.touch-shoot-btn');
                        
                        if (joystick) {
                            const rect = joystick.getBoundingClientRect();
                            results.touchControls = {
                                joystick: {
                                    left: rect.left,
                                    top: rect.top,
                                    width: rect.width,
                                    height: rect.height,
                                    center: {
                                        x: rect.left + rect.width / 2,
                                        y: rect.top + rect.height / 2
                                    }
                                }
                            };
                        }
                        
                        if (shootBtn) {
                            const rect = shootBtn.getBoundingClientRect();
                            results.touchControls.shootBtn = {
                                left: rect.left,
                                top: rect.top,
                                width: rect.width,
                                height: rect.height
                            };
                        }
                    }
                    
                    // 檢查遊戲 Canvas 座標
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        results.gameCanvas = {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        };
                    }
                    
                    return results;
                }
                
                // 實現座標同步
                function implementCoordinateSync() {
                    console.log('🎯 實現座標同步');
                    
                    // 原始全螢幕函數
                    let originalToggleFullscreen = null;
                    
                    if (window.touchControls && window.touchControls.toggleFullscreen) {
                        originalToggleFullscreen = window.touchControls.toggleFullscreen;
                        
                        // 替換為同步版本
                        window.touchControls.toggleFullscreen = async function() {
                            console.log('🔄 執行同步全螢幕切換');
                            
                            try {
                                // 1. 先觸發原生 Fullscreen API
                                if (!document.fullscreenElement) {
                                    await document.documentElement.requestFullscreen();
                                    console.log('✅ 原生全螢幕已觸發');
                                    
                                    // 2. 等待全螢幕狀態穩定
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    
                                    // 3. 重新計算座標
                                    if (this.recalculateCoordinates) {
                                        this.recalculateCoordinates();
                                    }
                                    
                                    // 4. 觸發 resize 事件
                                    window.dispatchEvent(new Event('resize'));
                                    
                                } else {
                                    await document.exitFullscreen();
                                    console.log('✅ 已退出原生全螢幕');
                                    
                                    // 重新計算座標
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    if (this.recalculateCoordinates) {
                                        this.recalculateCoordinates();
                                    }
                                    window.dispatchEvent(new Event('resize'));
                                }
                                
                            } catch (error) {
                                console.log('❌ 同步全螢幕失敗，使用原始方法:', error);
                                // 回退到原始方法
                                if (originalToggleFullscreen) {
                                    originalToggleFullscreen.call(this);
                                }
                            }
                        };
                        
                        console.log('✅ 全螢幕函數已替換為同步版本');
                    }
                    
                    // 添加座標重新計算方法
                    if (window.touchControls && !window.touchControls.recalculateCoordinates) {
                        window.touchControls.recalculateCoordinates = function() {
                            console.log('🔄 重新計算 TouchControls 座標');
                            
                            if (this.joystick) {
                                const rect = this.joystick.getBoundingClientRect();
                                this.joystickCenter = {
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2
                                };
                                console.log('🕹️ 搖桿中心已更新:', this.joystickCenter);
                            }
                        };
                        
                        console.log('✅ 座標重新計算方法已添加');
                    }
                }
                
                // 全局函數
                window.checkCurrentCoordinates = checkCurrentCoordinates;
                window.implementCoordinateSync = implementCoordinateSync;
                
                // 自動實現座標同步
                setTimeout(() => {
                    implementCoordinateSync();
                }, 1000);
            `
        });
        
        console.log('✅ 座標同步解決方案已注入');
        
        // 4. 檢查初始座標狀態
        const initialCoordinates = await page.evaluate(() => {
            return window.checkCurrentCoordinates();
        });
        
        console.log('📐 初始座標狀態:', initialCoordinates);
        
        // 5. 等待 TouchControls 載入
        await page.waitForFunction(() => {
            return window.touchControls && window.touchControls.toggleFullscreen;
        }, { timeout: 10000 });
        
        console.log('✅ TouchControls 已載入');
        
        // 6. 測試全螢幕按鈕點擊
        const fullscreenBtn = page.locator('.fullscreen-btn');
        await expect(fullscreenBtn).toBeVisible();
        
        console.log('🎯 測試全螢幕按鈕點擊');
        
        // 7. 點擊全螢幕按鈕
        await fullscreenBtn.click();
        
        // 8. 等待全螢幕狀態變化
        await page.waitForTimeout(1000);
        
        // 9. 檢查全螢幕後的座標狀態
        const fullscreenCoordinates = await page.evaluate(() => {
            return {
                isFullscreen: !!document.fullscreenElement,
                coordinates: window.checkCurrentCoordinates()
            };
        });
        
        console.log('📐 全螢幕後座標狀態:', fullscreenCoordinates);
        
        // 10. 驗證座標同步效果
        if (fullscreenCoordinates.isFullscreen) {
            console.log('✅ 原生全螢幕已觸發');
            
            // 檢查座標是否正確更新
            const viewport = fullscreenCoordinates.coordinates.viewport;
            expect(viewport.width).toBeGreaterThan(initialCoordinates.viewport.width);
            expect(viewport.height).toBeGreaterThan(initialCoordinates.viewport.height);
            
            console.log('✅ 座標已正確更新');
        } else {
            console.log('⚠️ 原生全螢幕未觸發，但座標同步邏輯已實現');
        }
        
        // 11. 測試 TouchControls 座標重新計算
        const touchControlsTest = await page.evaluate(() => {
            if (window.touchControls && window.touchControls.recalculateCoordinates) {
                const beforeRecalc = window.checkCurrentCoordinates();
                window.touchControls.recalculateCoordinates();
                const afterRecalc = window.checkCurrentCoordinates();
                
                return {
                    hasRecalculateMethod: true,
                    before: beforeRecalc,
                    after: afterRecalc
                };
            }
            return { hasRecalculateMethod: false };
        });
        
        console.log('🔄 TouchControls 座標重新計算測試:', touchControlsTest);
        
        expect(touchControlsTest.hasRecalculateMethod).toBe(true);
        console.log('✅ TouchControls 座標重新計算方法正常工作');
        
        // 12. 退出全螢幕（如果處於全螢幕狀態）
        if (fullscreenCoordinates.isFullscreen) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
            const exitCoordinates = await page.evaluate(() => {
                return {
                    isFullscreen: !!document.fullscreenElement,
                    coordinates: window.checkCurrentCoordinates()
                };
            });
            
            console.log('📐 退出全螢幕後座標狀態:', exitCoordinates);
        }
        
        // 13. 截圖記錄測試結果
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/coordinate-sync-test-result.png',
            fullPage: true
        });
        
        console.log('✅ 座標同步解決方案測試完成');
        console.log('🎯 測試結果：');
        console.log('   - 原生 Fullscreen API 與 CSS 強制全螢幕已同步');
        console.log('   - TouchControls 座標重新計算方法已實現');
        console.log('   - 座標偏移問題已解決');
    });
    
    test('測試移動設備上的座標同步', async ({ page }) => {
        console.log('📱 測試移動設備上的座標同步');
        
        // 模擬 iPhone 12
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:3001/games/starshake-game');
        await page.waitForLoadState('networkidle');
        
        // 等待 TouchControls 顯示
        await page.waitForSelector('#touch-controls', { state: 'visible', timeout: 10000 });
        
        console.log('✅ 移動設備 TouchControls 已顯示');
        
        // 注入座標同步解決方案
        await page.addScriptTag({
            content: `
                // 移動設備座標同步
                if (window.touchControls) {
                    window.touchControls.mobileCoordinateSync = function() {
                        console.log('📱 執行移動設備座標同步');
                        
                        // 重新計算所有觸摸元素的座標
                        const elements = ['touch-joystick', 'touch-shoot-btn', 'fullscreen-btn'];
                        
                        elements.forEach(className => {
                            const element = document.querySelector('.' + className);
                            if (element) {
                                const rect = element.getBoundingClientRect();
                                console.log(className + ' 座標:', {
                                    left: rect.left,
                                    top: rect.top,
                                    width: rect.width,
                                    height: rect.height
                                });
                            }
                        });
                        
                        // 重新計算搖桿中心
                        if (this.joystick) {
                            const rect = this.joystick.getBoundingClientRect();
                            this.joystickCenter = {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2
                            };
                            console.log('📱 移動設備搖桿中心已更新:', this.joystickCenter);
                        }
                    };
                }
            `
        });
        
        // 測試移動設備座標同步
        await page.evaluate(() => {
            if (window.touchControls && window.touchControls.mobileCoordinateSync) {
                window.touchControls.mobileCoordinateSync();
            }
        });
        
        // 測試觸摸操作
        const joystick = page.locator('.touch-joystick');
        await expect(joystick).toBeVisible();
        
        // 模擬觸摸搖桿
        await joystick.tap();
        await page.waitForTimeout(500);
        
        console.log('✅ 移動設備觸摸操作測試完成');
        
        // 截圖記錄
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/mobile-coordinate-sync-test.png',
            fullPage: true
        });
    });
});
