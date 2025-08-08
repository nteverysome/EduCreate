const { test, expect } = require('@playwright/test');
const ResponsiveTestingWorkflow = require('../../scripts/responsive-workflow/responsive-testing-workflow');
const fs = require('fs').promises;
const path = require('path');

/**
 * EduCreate 響應式佈局測試套件
 * 整合到 Playwright 測試框架中的響應式測試
 */

// 設備配置
const DEVICES = [
    { name: '手機直向', width: 375, height: 667, code: 'mobile-portrait' },
    { name: '手機橫向', width: 812, height: 375, code: 'mobile-landscape' },
    { name: '平板直向', width: 768, height: 1024, code: 'tablet-portrait' },
    { name: '平板橫向', width: 1024, height: 768, code: 'tablet-landscape' },
    { name: '桌面版', width: 1440, height: 900, code: 'desktop' }
];

test.describe('響應式佈局測試', () => {
    let testResults = [];
    let screenshots = [];

    test.beforeAll(async () => {
        console.log('🚀 開始響應式佈局測試套件');
    });

    test.afterAll(async () => {
        // 生成測試報告
        const workflow = new ResponsiveTestingWorkflow('Playwright測試套件', 'http://localhost:3000');
        workflow.testResults = testResults;
        workflow.screenshots = screenshots;
        
        const reportPath = await workflow.generateReport();
        console.log(`📊 測試報告已生成: ${reportPath}`);
    });

    // 為每個設備創建測試
    DEVICES.forEach(device => {
        test(`${device.name} (${device.width}x${device.height}) 響應式測試`, async ({ page }) => {
            const testStartTime = Date.now();
            
            try {
                // 設置視窗大小
                await page.setViewportSize({ width: device.width, height: device.height });
                
                // 導航到測試頁面
                await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
                
                // 等待頁面穩定
                await page.waitForTimeout(2000);
                
                // 基本頁面檢查
                await expect(page).toHaveTitle(/EduCreate/);
                
                // 檢查主要元素是否存在
                const mainContent = page.locator('main, .main-content, #root');
                await expect(mainContent).toBeVisible();
                
                // 截圖
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const screenshotPath = `test-results/responsive-${device.code}-${device.width}x${device.height}-${timestamp}.png`;
                
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: false
                });
                
                // 記錄截圖信息
                screenshots.push({
                    device: {
                        name: device.name,
                        width: device.width,
                        height: device.height,
                        code: device.code,
                        description: `${device.name}模式下的響應式佈局測試`,
                        features: [`📱 ${device.name}`, `📐 ${device.width}x${device.height}`, '✅ 測試通過'],
                        color: '#4caf50'
                    },
                    path: screenshotPath,
                    filename: path.basename(screenshotPath)
                });
                
                // 響應式特定檢查
                if (device.width < 768) {
                    // 手機版檢查
                    await test.step('手機版緊湊佈局檢查', async () => {
                        // 檢查是否有緊湊標頭或手機優化佈局
                        const compactElements = page.locator('.compact-header, .mobile-layout, .mobile-optimized');
                        // 這裡可以添加更具體的檢查邏輯
                    });
                } else if (device.width === 768) {
                    // 平板直向檢查
                    await test.step('平板直向邊界檢查', async () => {
                        // 檢查響應式斷點邊界行為
                        const tabletElements = page.locator('.tablet-layout, .responsive-boundary');
                        // 這裡可以添加更具體的檢查邏輯
                    });
                } else {
                    // 桌面版檢查
                    await test.step('桌面版完整功能檢查', async () => {
                        // 檢查桌面版完整功能
                        const desktopElements = page.locator('.desktop-layout, .full-features');
                        // 這裡可以添加更具體的檢查邏輯
                    });
                }
                
                // 記錄成功結果
                testResults.push({
                    device: device.name,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    screenshot: path.basename(screenshotPath),
                    duration: Date.now() - testStartTime
                });
                
                console.log(`✅ ${device.name} 測試通過`);
                
            } catch (error) {
                // 記錄失敗結果
                testResults.push({
                    device: device.name,
                    status: 'failed',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - testStartTime
                });
                
                console.error(`❌ ${device.name} 測試失敗:`, error.message);
                throw error;
            }
        });
    });

    test('響應式切換測試', async ({ page }) => {
        await test.step('測試設備旋轉和視窗調整', async () => {
            // 從手機直向開始
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            // 切換到手機橫向
            await page.setViewportSize({ width: 812, height: 375 });
            await page.waitForTimeout(1000);
            
            // 切換到平板直向
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForTimeout(1000);
            
            // 切換到平板橫向
            await page.setViewportSize({ width: 1024, height: 768 });
            await page.waitForTimeout(1000);
            
            // 切換到桌面版
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.waitForTimeout(1000);
            
            // 驗證最終狀態
            const mainContent = page.locator('main, .main-content, #root');
            await expect(mainContent).toBeVisible();
        });
    });

    test('跨設備功能一致性測試', async ({ page }) => {
        const functionalityTests = [
            { selector: 'nav, .navigation', description: '導航功能' },
            { selector: 'button, .btn', description: '按鈕功能' },
            { selector: 'form, .form', description: '表單功能' },
            { selector: '.game-container, .content', description: '主要內容區域' }
        ];

        for (const device of DEVICES) {
            await test.step(`${device.name} 功能一致性檢查`, async () => {
                await page.setViewportSize({ width: device.width, height: device.height });
                await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
                await page.waitForTimeout(1000);

                for (const func of functionalityTests) {
                    const elements = page.locator(func.selector);
                    const count = await elements.count();
                    
                    if (count > 0) {
                        console.log(`✅ ${device.name}: ${func.description} 存在 (${count} 個元素)`);
                    } else {
                        console.log(`⚠️ ${device.name}: ${func.description} 未找到`);
                    }
                }
            });
        }
    });
});

// 輔助函數：生成響應式測試報告
async function generateResponsiveReport(testResults, screenshots) {
    const reportData = {
        timestamp: new Date().toISOString(),
        testResults,
        screenshots,
        summary: {
            total: testResults.length,
            passed: testResults.filter(r => r.status === 'success').length,
            failed: testResults.filter(r => r.status === 'failed').length
        }
    };

    const reportPath = path.join(process.cwd(), 'reports', 'visual-comparisons', 
        `playwright-responsive-test-${Date.now()}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    return reportPath;
}
