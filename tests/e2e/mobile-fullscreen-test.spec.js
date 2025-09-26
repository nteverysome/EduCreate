const { test, expect, devices } = require('@playwright/test');

test.describe('手機全螢幕功能測試', () => {
    
    test('iPhone Safari 全螢幕測試', async ({ browser }) => {
        console.log('🍎 開始 iPhone Safari 全螢幕測試...');
        
        // 創建 iPhone 12 Pro 環境
        const context = await browser.newContext({
            ...devices['iPhone 12 Pro'],
            permissions: ['camera', 'microphone'],
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        });
        
        const page = await context.newPage();
        
        // 設置視窗大小為 iPhone
        await page.setViewportSize({ width: 390, height: 844 });
        
        console.log('🌐 導航到測試頁面...');
        await page.goto('http://localhost:3000/mobile-postmessage-test.html');
        
        // 等待頁面載入
        await page.waitForLoadState('networkidle');
        
        // 截圖：初始狀態
        await page.screenshot({ 
            path: 'test-results/mobile-01-initial.png',
            fullPage: true 
        });
        
        console.log('⏳ 等待遊戲 iframe 載入...');
        await page.waitForSelector('#gameIframe', { timeout: 30000 });
        
        // 等待遊戲完全載入
        await page.waitForTimeout(5000);
        
        // 截圖：遊戲載入完成
        await page.screenshot({ 
            path: 'test-results/mobile-02-game-loaded.png',
            fullPage: true 
        });
        
        console.log('🎮 尋找遊戲內全螢幕按鈕...');
        
        // 切換到 iframe 內部
        const iframe = page.frameLocator('#gameIframe');
        
        // 等待遊戲完全載入
        await page.waitForTimeout(3000);
        
        // 嘗試多種方式尋找全螢幕按鈕
        const fullscreenSelectors = [
            'button:has-text("⛶")',
            '[onclick*="fullscreen"]',
            '.fullscreen-btn',
            'button[title*="fullscreen"]',
            'button[title*="全螢幕"]'
        ];
        
        let fullscreenBtn = null;
        
        for (const selector of fullscreenSelectors) {
            try {
                fullscreenBtn = iframe.locator(selector).first();
                if (await fullscreenBtn.isVisible({ timeout: 2000 })) {
                    console.log(`✅ 找到全螢幕按鈕: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`⚠️ 未找到按鈕: ${selector}`);
            }
        }
        
        if (!fullscreenBtn || !(await fullscreenBtn.isVisible())) {
            console.log('❌ 無法找到全螢幕按鈕，嘗試手動測試按鈕...');
            
            // 嘗試點擊父頁面的手動測試按鈕
            const manualBtn = page.locator('button:has-text("測試全螢幕請求")');
            if (await manualBtn.isVisible()) {
                console.log('🔧 使用手動測試按鈕...');
                await manualBtn.click();
                await page.waitForTimeout(2000);
                
                // 截圖：手動全螢幕
                await page.screenshot({ 
                    path: 'test-results/mobile-03-manual-fullscreen.png',
                    fullPage: true 
                });
                
                // 再次點擊退出
                await manualBtn.click();
                await page.waitForTimeout(2000);
                
                // 截圖：退出全螢幕
                await page.screenshot({ 
                    path: 'test-results/mobile-04-exit-fullscreen.png',
                    fullPage: true 
                });
            }
        } else {
            console.log('🎯 測試遊戲內全螢幕按鈕...');
            
            // 點擊全螢幕按鈕
            await fullscreenBtn.click();
            
            // 等待全螢幕效果
            await page.waitForTimeout(3000);
            
            // 截圖：進入全螢幕
            await page.screenshot({ 
                path: 'test-results/mobile-03-game-fullscreen.png',
                fullPage: true 
            });
            
            console.log('🔄 測試退出全螢幕...');
            
            // 再次點擊退出全螢幕
            await fullscreenBtn.click();
            
            // 等待退出效果
            await page.waitForTimeout(3000);
            
            // 截圖：退出全螢幕
            await page.screenshot({ 
                path: 'test-results/mobile-04-exit-fullscreen.png',
                fullPage: true 
            });
        }
        
        console.log('📊 檢查日誌輸出...');
        
        // 檢查頁面日誌
        const logContent = await page.locator('#logContent').textContent();
        console.log('📝 頁面日誌:', logContent);
        
        // 截圖：最終狀態
        await page.screenshot({ 
            path: 'test-results/mobile-05-final.png',
            fullPage: true 
        });
        
        console.log('✅ iPhone 測試完成！');
        
        await context.close();
    });
    
    test('Android Chrome 全螢幕測試', async ({ browser }) => {
        console.log('🤖 開始 Android Chrome 全螢幕測試...');
        
        // 創建 Android 環境
        const context = await browser.newContext({
            ...devices['Pixel 5'],
            permissions: ['camera', 'microphone']
        });
        
        const page = await context.newPage();
        
        console.log('🌐 導航到測試頁面...');
        await page.goto('http://localhost:3000/mobile-postmessage-test.html');
        
        // 等待頁面載入
        await page.waitForLoadState('networkidle');
        
        // 截圖：Android 初始狀態
        await page.screenshot({ 
            path: 'test-results/android-01-initial.png',
            fullPage: true 
        });
        
        console.log('⏳ 等待遊戲載入...');
        await page.waitForSelector('#gameIframe', { timeout: 30000 });
        await page.waitForTimeout(5000);
        
        // 測試手動全螢幕按鈕
        const manualBtn = page.locator('button:has-text("測試全螢幕請求")');
        if (await manualBtn.isVisible()) {
            console.log('🔧 測試 Android 手動全螢幕...');
            await manualBtn.click();
            await page.waitForTimeout(2000);
            
            // 截圖：Android 全螢幕
            await page.screenshot({ 
                path: 'test-results/android-02-fullscreen.png',
                fullPage: true 
            });
            
            // 退出全螢幕
            await manualBtn.click();
            await page.waitForTimeout(2000);
            
            // 截圖：Android 退出全螢幕
            await page.screenshot({ 
                path: 'test-results/android-03-exit.png',
                fullPage: true 
            });
        }
        
        console.log('✅ Android 測試完成！');
        
        await context.close();
    });
    
    test('桌面瀏覽器全螢幕測試', async ({ page }) => {
        console.log('💻 開始桌面瀏覽器測試...');
        
        await page.goto('http://localhost:3000/mobile-postmessage-test.html');
        await page.waitForLoadState('networkidle');
        
        // 截圖：桌面初始狀態
        await page.screenshot({ 
            path: 'test-results/desktop-01-initial.png',
            fullPage: true 
        });
        
        // 測試手動全螢幕按鈕
        const manualBtn = page.locator('button:has-text("測試全螢幕請求")');
        if (await manualBtn.isVisible()) {
            console.log('🔧 測試桌面手動全螢幕...');
            await manualBtn.click();
            await page.waitForTimeout(2000);
            
            // 截圖：桌面全螢幕
            await page.screenshot({ 
                path: 'test-results/desktop-02-fullscreen.png',
                fullPage: true 
            });
        }
        
        console.log('✅ 桌面測試完成！');
    });
});

test.beforeAll(async () => {
    // 創建測試結果目錄
    const fs = require('fs');
    const path = require('path');
    
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    console.log('📁 測試結果將保存到:', resultsDir);
});

test.afterAll(async () => {
    console.log('🎉 所有測試完成！');
    console.log('📸 查看測試截圖: test-results/ 目錄');
});
