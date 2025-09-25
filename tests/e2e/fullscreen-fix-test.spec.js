const { test, expect } = require('@playwright/test');

test.describe('全螢幕功能修復測試', () => {
    test('測試遊戲全螢幕功能是否正確工作', async ({ page }) => {
        console.log('🚀 開始測試全螢幕功能修復');
        
        // 設置手機視窗大小
        await page.setViewportSize({ width: 375, height: 667 });
        
        // 導航到測試頁面
        await page.goto('http://localhost:8000/mobile-postmessage-test.html');
        
        // 等待頁面載入
        await page.waitForTimeout(3000);
        
        // 截圖：初始狀態
        await page.screenshot({ 
            path: 'EduCreate-Test-Videos/current/success/20250125_全螢幕修復_初始狀態_v1_01.png',
            fullPage: true 
        });
        
        // 等待 iframe 載入
        const iframe = page.frameLocator('#gameIframe');
        await iframe.locator('canvas').waitFor({ timeout: 10000 });
        
        console.log('✅ 遊戲 iframe 已載入');
        
        // 截圖：遊戲載入完成
        await page.screenshot({ 
            path: 'EduCreate-Test-Videos/current/success/20250125_全螢幕修復_遊戲載入_v1_02.png',
            fullPage: true 
        });
        
        // 點擊遊戲內的全螢幕按鈕
        console.log('🎯 尋找並點擊遊戲內的全螢幕按鈕');
        
        // 等待遊戲完全載入
        await page.waitForTimeout(2000);
        
        // 在 iframe 內尋找全螢幕按鈕
        const fullscreenButton = iframe.locator('button').filter({ hasText: /全螢幕|fullscreen/i }).first();
        
        // 如果找不到文字按鈕，嘗試尋找可能的全螢幕圖標按鈕
        const buttonExists = await fullscreenButton.count() > 0;
        
        if (!buttonExists) {
            console.log('🔍 未找到文字全螢幕按鈕，嘗試尋找圖標按鈕');
            
            // 嘗試點擊右上角可能的全螢幕按鈕
            const canvasElement = iframe.locator('canvas').first();
            await canvasElement.click({ position: { x: 300, y: 50 } });
            
            console.log('🎯 點擊了 canvas 右上角位置');
        } else {
            await fullscreenButton.click();
            console.log('🎯 點擊了全螢幕按鈕');
        }
        
        // 等待全螢幕效果
        await page.waitForTimeout(2000);
        
        // 截圖：全螢幕狀態
        await page.screenshot({ 
            path: 'EduCreate-Test-Videos/current/success/20250125_全螢幕修復_全螢幕狀態_v1_03.png',
            fullPage: true 
        });
        
        // 檢查是否只有遊戲 iframe 可見
        const testToolsVisible = await page.locator('h1').isVisible();
        const iframeVisible = await page.locator('#gameIframe').isVisible();
        
        console.log(`📊 測試工具可見性: ${testToolsVisible}`);
        console.log(`📊 遊戲 iframe 可見性: ${iframeVisible}`);
        
        // 驗證全螢幕效果
        if (!testToolsVisible && iframeVisible) {
            console.log('✅ 全螢幕功能正常：測試工具已隱藏，只顯示遊戲');
        } else {
            console.log('❌ 全螢幕功能異常：測試工具仍然可見');
        }
        
        // 檢查 iframe 是否佔滿整個螢幕
        const iframeBox = await page.locator('#gameIframe').boundingBox();
        const viewportSize = page.viewportSize();
        
        console.log(`📊 iframe 尺寸: ${iframeBox?.width}x${iframeBox?.height}`);
        console.log(`📊 視窗尺寸: ${viewportSize?.width}x${viewportSize?.height}`);
        
        // 等待一段時間觀察全螢幕效果
        await page.waitForTimeout(3000);
        
        // 嘗試退出全螢幕（再次點擊或按 ESC）
        console.log('🔄 嘗試退出全螢幕');
        
        if (!buttonExists) {
            // 再次點擊 canvas 右上角
            const canvasElement = iframe.locator('canvas').first();
            await canvasElement.click({ position: { x: 300, y: 50 } });
        } else {
            await fullscreenButton.click();
        }
        
        // 等待退出全螢幕效果
        await page.waitForTimeout(2000);
        
        // 截圖：退出全螢幕狀態
        await page.screenshot({ 
            path: 'EduCreate-Test-Videos/current/success/20250125_全螢幕修復_退出全螢幕_v1_04.png',
            fullPage: true 
        });
        
        // 檢查是否恢復正常顯示
        const testToolsVisibleAfter = await page.locator('h1').isVisible();
        const iframeVisibleAfter = await page.locator('#gameIframe').isVisible();
        
        console.log(`📊 退出後測試工具可見性: ${testToolsVisibleAfter}`);
        console.log(`📊 退出後遊戲 iframe 可見性: ${iframeVisibleAfter}`);
        
        // 驗證退出全螢幕效果
        if (testToolsVisibleAfter && iframeVisibleAfter) {
            console.log('✅ 退出全螢幕功能正常：測試工具和遊戲都可見');
        } else {
            console.log('❌ 退出全螢幕功能異常');
        }
        
        console.log('🎉 全螢幕功能修復測試完成');
    });
});
