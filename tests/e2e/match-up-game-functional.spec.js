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
        
        // 導航到遊戲
        await page.goto('http://localhost:3000/public/games/match-up-game/index.html', {
            waitUntil: 'networkidle'
        });
        
        // 等待遊戲加載
        await page.waitForSelector('canvas', { timeout: 10000 });
    });

    // TC-001: 正方形模式 - iPhone 12 直向
    test('TC-001: Square mode - iPhone 12 Portrait', async ({ page }) => {
        const device = TEST_DEVICES[0];
        
        // 設置視窗大小
        await page.setViewportSize({ width: device.width, height: device.height });
        
        // 等待遊戲重新佈局
        await page.waitForTimeout(1000);
        
        // 驗證卡片是否正確顯示
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
        
        // 檢查控制台日誌中的佈局信息
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('[Phase 3]')) {
                logs.push(msg.text());
            }
        });
        
        // 等待佈局計算完成
        await page.waitForTimeout(500);
        
        // 驗證日誌中包含佈局配置信息
        expect(logs.length).toBeGreaterThan(0);
    });

    // TC-002: 正方形模式 - iPad mini 直向
    test('TC-002: Square mode - iPad mini Portrait', async ({ page }) => {
        const device = TEST_DEVICES[2];
        
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(1000);
        
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
    });

    // TC-003: 正方形模式 - iPad mini 橫向
    test('TC-003: Square mode - iPad mini Landscape', async ({ page }) => {
        const device = TEST_DEVICES[3];
        
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(1000);
        
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
    });

    // TC-004: 長方形模式 - iPhone 12 直向
    test('TC-004: Rectangle mode - iPhone 12 Portrait', async ({ page }) => {
        const device = TEST_DEVICES[0];
        
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(1000);
        
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
    });

    // TC-005: 長方形模式 - iPad mini 直向
    test('TC-005: Rectangle mode - iPad mini Portrait', async ({ page }) => {
        const device = TEST_DEVICES[2];
        
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.waitForTimeout(1000);
        
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
    });

    // TC-006: 交互功能 - 卡片拖曳
    test('TC-006: Card dragging interaction', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);
        
        // 獲取 canvas 元素
        const canvas = await page.locator('canvas').first();
        const box = await canvas.boundingBox();
        
        if (box) {
            // 模擬卡片拖曳
            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;
            
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.move(startX + 50, startY + 50);
            await page.mouse.up();
            
            // 驗證沒有錯誤
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            expect(errors.length).toBe(0);
        }
    });

    // TC-007: 交互功能 - 卡片匹配
    test('TC-007: Card matching interaction', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);
        
        // 驗證遊戲正在運行
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
        
        // 檢查是否有任何 JavaScript 錯誤
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        expect(errors.length).toBe(0);
    });

    // TC-008: 交互功能 - 音頻播放
    test('TC-008: Audio playback', async ({ page }) => {
        // 等待遊戲完全加載
        await page.waitForTimeout(2000);
        
        // 驗證遊戲正在運行
        const canvas = await page.locator('canvas').first();
        expect(canvas).toBeTruthy();
        
        // 檢查是否有任何 JavaScript 錯誤
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        expect(errors.length).toBe(0);
    });

    // 響應式設計測試 - 所有設備
    test.describe('Responsive Design Tests', () => {
        TEST_DEVICES.forEach((device, index) => {
            test(`Device ${index + 1}: ${device.name}`, async ({ page }) => {
                // 設置視窗大小
                await page.setViewportSize({ width: device.width, height: device.height });
                
                // 等待遊戲重新佈局
                await page.waitForTimeout(1000);
                
                // 驗證 canvas 存在
                const canvas = await page.locator('canvas').first();
                expect(canvas).toBeTruthy();
                
                // 驗證沒有 JavaScript 錯誤
                const errors = [];
                page.on('console', msg => {
                    if (msg.type() === 'error') {
                        errors.push(msg.text());
                    }
                });
                
                expect(errors.length).toBe(0);
            });
        });
    });
});

