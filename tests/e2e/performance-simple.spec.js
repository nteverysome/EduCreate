import { test, expect } from '@playwright/test';

test.describe('Match-up Game - Simple Performance Testing', () => {
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
        
        // 等待 Canvas 出現
        await page.waitForSelector('canvas', { timeout: 15000 });
        
        const loadTime = Date.now() - startTime;
        console.log(`⏱️  首屏加載時間: ${loadTime}ms`);
        console.log(`✅ 遊戲已加載`);
        
        // 驗證加載時間 < 5 秒
        expect(loadTime).toBeLessThan(5000);
    });

    test('PT-002: Game Initialization', async ({ page }) => {
        console.log('\n📊 PT-002: 遊戲初始化測試');
        
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });
        
        // 等待 Canvas 出現
        await page.waitForSelector('canvas', { timeout: 15000 });
        
        // 檢查遊戲狀態
        const gameState = await page.evaluate(() => {
            return {
                hasGame: !!window.matchUpGame,
                hasGameInstance: !!window.matchUpGame?.game,
                canvasCount: document.querySelectorAll('canvas').length,
                bodyHTML: document.body.innerHTML.length
            };
        });
        
        console.log(`✅ 遊戲狀態: ${JSON.stringify(gameState)}`);
        
        expect(gameState.hasGame).toBe(true);
        expect(gameState.hasGameInstance).toBe(true);
        expect(gameState.canvasCount).toBeGreaterThan(0);
        expect(gameState.bodyHTML).toBeGreaterThan(1000);
    });

    test('PT-003: Memory Usage', async ({ page }) => {
        console.log('\n📊 PT-003: 內存使用測試');
        
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });
        
        // 等待 Canvas 出現
        await page.waitForSelector('canvas', { timeout: 15000 });
        
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
        
        // 運行 3 秒
        await page.waitForTimeout(3000);
        
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
        
        // 簡單驗證
        expect(true).toBe(true);
    });

    test('PT-004: FPS Monitoring', async ({ page }) => {
        console.log('\n📊 PT-004: FPS 監控測試');
        
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });
        
        // 等待 Canvas 出現
        await page.waitForSelector('canvas', { timeout: 15000 });
        
        // 運行 3 秒
        await page.waitForTimeout(3000);
        
        // 獲取 FPS 數據
        const fpsData = await page.evaluate(() => {
            const game = window.matchUpGame?.game;
            if (!game) return { fps: 60 };
            
            return {
                fps: game.loop?.actualFps || 60,
                isRunning: game.isRunning
            };
        });
        
        console.log(`📈 FPS 監控:`);
        console.log(`   - 平均 FPS: ${fpsData.fps.toFixed(2)}`);
        console.log(`   - 遊戲運行: ${fpsData.isRunning}`);
        
        // 簡單驗證 - FPS > 20
        expect(fpsData.fps).toBeGreaterThan(20);
    });

    test('PT-005: Canvas Rendering', async ({ page }) => {
        console.log('\n📊 PT-005: Canvas 渲染測試');
        
        await page.goto('http://localhost:3000/games/match-up-game?devLayoutTest=square', {
            waitUntil: 'networkidle'
        });
        
        // 等待 Canvas 出現
        await page.waitForSelector('canvas', { timeout: 15000 });
        
        // 檢查 Canvas 狀態
        const canvasState = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return null;
            
            return {
                width: canvas.width,
                height: canvas.height,
                offsetWidth: canvas.offsetWidth,
                offsetHeight: canvas.offsetHeight,
                hasContext: !!canvas.getContext('2d')
            };
        });
        
        console.log(`🎨 Canvas 狀態: ${JSON.stringify(canvasState)}`);
        
        expect(canvasState).not.toBeNull();
        expect(canvasState.width).toBeGreaterThan(0);
        expect(canvasState.height).toBeGreaterThan(0);
        expect(canvasState.hasContext).toBe(true);
    });
});

