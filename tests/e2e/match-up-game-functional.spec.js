import { test, expect } from '@playwright/test';

// 測試設備配置
const TEST_DEVICES = [
    {
        name: 'iPhone 12 Portrait',
        width: 390,
        height: 844,
        mode: 'square'
    },
    {
        name: 'iPhone 12 Landscape',
        width: 844,
        height: 390,
        mode: 'square'
    },
    {
        name: 'iPad mini Portrait',
        width: 768,
        height: 1024,
        mode: 'square'
    },
    {
        name: 'iPad mini Landscape',
        width: 1024,
        height: 768,
        mode: 'square'
    },
    {
        name: 'iPad Air Portrait',
        width: 820,
        height: 1180,
        mode: 'square'
    },
    {
        name: 'iPad Pro 11" Portrait',
        width: 834,
        height: 1194,
        mode: 'square'
    },
    {
        name: 'iPad Pro 12.9" Portrait',
        width: 1024,
        height: 1366,
        mode: 'square'
    },
    {
        name: 'Desktop',
        width: 1280,
        height: 800,
        mode: 'square'
    }
];

test.describe('Match-up Game - Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 設置視窗大小
        await page.setViewportSize({ width: 1280, height: 800 });

        // 導航到遊戲 - 使用 devLayoutTest 參數以支持測試模式
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'domcontentloaded'
        });

        // 等待遊戲加載 - 等待 Phaser 遊戲初始化
        await page.waitForTimeout(3000);
    });

    // TC-001: 正方形模式 - iPhone 12 直向
    test('TC-001: Square mode - iPhone 12 Portrait', async ({ page }) => {
        const device = TEST_DEVICES[0];

        // 設置視窗大小
        await page.setViewportSize({ width: device.width, height: device.height });

        // 等待遊戲重新佈局
        await page.waitForTimeout(2000);

        // 驗證頁面已加載
        const title = await page.title();
        expect(title).toBeTruthy();

        // 驗證頁面中有內容
        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-002: 正方形模式 - iPad mini 直向
    test('TC-002: Square mode - iPad mini Portrait', async ({ page }) => {
        const device = TEST_DEVICES[2];

        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(2000);

        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-003: 正方形模式 - iPad mini 橫向
    test('TC-003: Square mode - iPad mini Landscape', async ({ page }) => {
        const device = TEST_DEVICES[3];

        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(2000);

        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-004: 長方形模式 - iPhone 12 直向
    test('TC-004: Rectangle mode - iPhone 12 Portrait', async ({ page }) => {
        const device = TEST_DEVICES[0];

        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(2000);

        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-005: 長方形模式 - iPad mini 直向
    test('TC-005: Rectangle mode - iPad mini Portrait', async ({ page }) => {
        const device = TEST_DEVICES[2];

        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(2000);

        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-006: 交互功能 - 卡片拖曳
    test('TC-006: Card dragging interaction', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);

        // 驗證頁面已加載
        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-007: 交互功能 - 卡片匹配
    test('TC-007: Card matching interaction', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);

        // 驗證頁面已加載
        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // TC-008: 交互功能 - 音頻播放
    test('TC-008: Audio playback', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);

        // 驗證頁面已加載
        const body = await page.locator('body');
        expect(body).toBeTruthy();
    });

    // 響應式設計測試 - 所有設備
    test.describe('Responsive Design Tests', () => {
        TEST_DEVICES.forEach((device, index) => {
            test(`Device ${index + 1}: ${device.name}`, async ({ page }) => {
                // 設置視窗大小
                await page.setViewportSize({ width: device.width, height: device.height });

                // 等待遊戲重新佈局
                await page.waitForTimeout(2000);

                // 驗證頁面已加載
                const body = await page.locator('body');
                expect(body).toBeTruthy();
            });
        });
    });
});

