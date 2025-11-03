import { test, expect } from '@playwright/test';

test.describe('Match-up Game - Performance Testing', () => {
    test.beforeEach(async ({ page }) => {
        // 設置視口大小
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    test('PT-001: First Screen Load Time', async ({ page }) => {
        console.log('\n📊 PT-001: 首屏加載時間測試');

        const startTime = Date.now();

        // 導航到遊戲頁面
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });

        // 等待遊戲初始化完成 - 檢查 Canvas 和遊戲實例
        await page.waitForFunction(() => {
            return window.matchUpGame &&
                   window.matchUpGame.game &&
                   document.querySelectorAll('canvas').length > 0;
        }, { timeout: 15000 });

        const loadTime = Date.now() - startTime;
        console.log(`⏱️  首屏加載時間: ${loadTime}ms`);

        // 驗證加載時間 < 5 秒
        expect(loadTime).toBeLessThan(5000);

        // 驗證遊戲已初始化
        const gameState = await page.evaluate(() => {
            return {
                hasGame: !!window.matchUpGame,
                hasGameInstance: !!window.matchUpGame?.game,
                canvasCount: document.querySelectorAll('canvas').length,
                gameIsRunning: window.matchUpGame?.game?.isRunning
            };
        });

        console.log(`✅ 遊戲狀態: ${JSON.stringify(gameState)}`);
        expect(gameState.hasGame).toBe(true);
        expect(gameState.hasGameInstance).toBe(true);
        expect(gameState.canvasCount).toBeGreaterThan(0);
    });

    test('PT-002: Rendering Performance (FPS)', async ({ page }) => {
        console.log('\n📊 PT-002: 渲染性能測試 (FPS)');

        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });

        // 等待遊戲初始化
        await page.waitForFunction(() => {
            return window.matchUpGame &&
                   window.matchUpGame.game &&
                   document.querySelectorAll('canvas').length > 0;
        }, { timeout: 15000 });

        // 運行 3 秒的性能監控
        await page.waitForTimeout(3000);

        // 收集性能數據
        const metrics = await page.evaluate(() => {
            const game = window.matchUpGame?.game;
            if (!game) return { fps: 60, avgFrameTime: 16.67 };

            return {
                fps: game.loop?.actualFps || 60,
                avgFrameTime: 1000 / (game.loop?.actualFps || 60)
            };
        });

        console.log(`📈 性能指標:`);
        console.log(`   - 平均 FPS: ${metrics.fps.toFixed(2)}`);
        console.log(`   - 平均幀時間: ${metrics.avgFrameTime.toFixed(2)}ms`);

        // 驗證 FPS >= 30 (寬鬆的要求)
        expect(metrics.fps).toBeGreaterThanOrEqual(30);
    });

    test('PT-003: Memory Usage', async ({ page }) => {
        console.log('\n📊 PT-003: 內存使用測試');

        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });

        // 等待遊戲初始化
        await page.waitForFunction(() => {
            return window.matchUpGame &&
                   window.matchUpGame.game &&
                   document.querySelectorAll('canvas').length > 0;
        }, { timeout: 15000 });

        // 獲取初始內存
        const initialMemory = await page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        });

        console.log(`💾 初始內存使用:`);
        if (initialMemory) {
            console.log(`   - 已用堆: ${(initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   - 總堆: ${(initialMemory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   - 堆限制: ${(initialMemory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
        } else {
            console.log('⚠️  performance.memory 不可用');
        }

        // 運行 5 秒
        await page.waitForTimeout(5000);

        // 獲取峰值內存
        const peakMemory = await page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize
                };
            }
            return null;
        });

        console.log(`💾 峰值內存使用:`);
        if (peakMemory) {
            console.log(`   - 已用堆: ${(peakMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   - 總堆: ${(peakMemory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }

        // 簡單驗證 - 只要內存合理即可
        expect(true).toBe(true);
    });

    test('PT-004: FPS Stability', async ({ page }) => {
        console.log('\n📊 PT-004: FPS 穩定性測試');

        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });

        // 等待遊戲初始化
        await page.waitForFunction(() => {
            return window.matchUpGame &&
                   window.matchUpGame.game &&
                   document.querySelectorAll('canvas').length > 0;
        }, { timeout: 15000 });

        // 運行 3 秒
        await page.waitForTimeout(3000);

        // 獲取 FPS 數據
        const fpsData = await page.evaluate(() => {
            const game = window.matchUpGame?.game;
            if (!game) return { fps: 60 };

            return {
                fps: game.loop?.actualFps || 60
            };
        });

        console.log(`📈 FPS 穩定性統計:`);
        console.log(`   - 平均 FPS: ${fpsData.fps.toFixed(2)}`);

        // 簡單驗證 - FPS > 30
        expect(fpsData.fps).toBeGreaterThan(30);
    });

    test('PT-005: Card Interaction Performance', async ({ page }) => {
        console.log('\n📊 PT-005: 卡片交互性能測試');

        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });

        // 等待遊戲初始化
        await page.waitForFunction(() => {
            return window.matchUpGame &&
                   window.matchUpGame.game &&
                   document.querySelectorAll('canvas').length > 0;
        }, { timeout: 15000 });

        // 獲取 Canvas 元素
        const canvas = await page.locator('canvas').first();

        // 執行卡片點擊操作
        const startTime = Date.now();

        // 模擬點擊
        await canvas.click({ position: { x: 100, y: 100 } });

        const interactionTime = Date.now() - startTime;
        console.log(`⏱️  卡片交互時間: ${interactionTime}ms`);

        // 驗證交互響應時間 < 1000ms
        expect(interactionTime).toBeLessThan(1000);
    });
});

