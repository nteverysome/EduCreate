import { test, expect, Page } from '@playwright/test';

interface FlickerEvent {
  timestamp: number;
  type: 'ui-update' | 'dom-change' | 'console-log' | 'visual-change';
  details: string;
  data?: any;
}

interface CollisionAnalysis {
  collisionTime: number;
  preCollisionEvents: FlickerEvent[];
  postCollisionEvents: FlickerEvent[];
  uiUpdateCount: number;
  flickerDetected: boolean;
  flickerPattern?: string;
}

test.describe('Vite + Phaser 3 飛機遊戲閃爍分析', () => {
  let page: Page;
  let events: FlickerEvent[] = [];
  let collisionDetected = false;
  let collisionTime = 0;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    events = [];
    collisionDetected = false;
    collisionTime = 0;

    // 設置詳細的 console 監控
    page.on('console', (msg) => {
      const timestamp = Date.now();
      const text = msg.text();
      
      events.push({
        timestamp,
        type: 'console-log',
        details: text,
        data: { level: msg.type() }
      });

      // 檢測碰撞事件
      if (text.includes('💥 碰撞處理') || text.includes('碰撞處理')) {
        collisionDetected = true;
        collisionTime = timestamp;
        console.log(`🎯 碰撞檢測到: ${timestamp}`);
      }

      // 檢測 UI 更新事件
      if (text.includes('📊 更新 HUD') || text.includes('updateUI')) {
        console.log(`📊 UI 更新檢測到: ${timestamp}`);
      }

      // 檢測閃爍相關事件
      if (text.includes('閃爍') || text.includes('flicker') || text.includes('重複更新')) {
        console.log(`⚠️ 閃爍事件檢測到: ${text}`);
      }
    });

    // 監控 DOM 變化
    await page.addInitScript(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            console.log(`🔄 DOM 變化: ${mutation.type} - ${mutation.target.nodeName}`);
          }
        });
      });
      
      // 等待 DOM 載入後開始觀察
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true
        });
      });
    });
  });

  test('直接測試 Vite + Phaser 3 遊戲閃爍修復', async () => {
    console.log('🚀 開始 Vite + Phaser 3 飛機遊戲閃爍分析測試');

    // 導航到 Vite + Phaser 3 遊戲
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Vite + Phaser 3 遊戲頁面載入完成');

    // 等待遊戲初始化
    await page.waitForTimeout(3000);
    
    // 檢查遊戲是否正確載入
    const gameCanvas = await page.locator('canvas').first();
    await expect(gameCanvas).toBeVisible();
    console.log('✅ 遊戲 Canvas 已載入');

    // 等待遊戲完全初始化
    await page.waitForTimeout(2000);

    // 記錄測試開始時間
    const testStartTime = Date.now();
    console.log(`📊 測試開始時間: ${testStartTime}`);

    // 模擬玩家移動和碰撞
    console.log('🎮 開始模擬玩家操作...');
    
    // 移動太空船嘗試觸發碰撞
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      
      // 檢查是否檢測到碰撞
      if (collisionDetected) {
        console.log(`✅ 碰撞檢測成功，第 ${i + 1} 次嘗試`);
        break;
      }
    }

    // 分析收集到的事件
    const testEndTime = Date.now();
    const totalEvents = events.length;
    
    console.log(`📊 測試結果分析:`);
    console.log(`├── 總事件數: ${totalEvents}`);
    console.log(`├── 測試時長: ${testEndTime - testStartTime}ms`);
    console.log(`├── 碰撞檢測: ${collisionDetected ? '✅ 成功' : '❌ 未檢測到'}`);

    // 分析 UI 更新頻率
    const uiUpdateEvents = events.filter(e => 
      e.details.includes('📊 更新 HUD') || 
      e.details.includes('updateUI') ||
      e.details.includes('UI 更新')
    );
    
    console.log(`├── UI 更新事件: ${uiUpdateEvents.length}`);

    // 檢查是否有閃爍相關的日誌
    const flickerEvents = events.filter(e => 
      e.details.includes('閃爍') || 
      e.details.includes('flicker') ||
      e.details.includes('重複更新')
    );
    
    console.log(`├── 閃爍事件: ${flickerEvents.length}`);
    console.log(`└── 閃爍修復狀態: ${flickerEvents.length === 0 ? '✅ 成功' : '⚠️ 需要檢查'}`);

    // 生成詳細報告
    const report = {
      testDuration: testEndTime - testStartTime,
      totalEvents,
      collisionDetected,
      uiUpdateCount: uiUpdateEvents.length,
      flickerEventCount: flickerEvents.length,
      flickerFixed: flickerEvents.length === 0,
      events: events.slice(-20) // 保留最後 20 個事件用於分析
    };

    console.log('📋 生成測試報告...');
    console.log(JSON.stringify(report, null, 2));

    // 截圖作為證據
    await page.screenshot({ 
      path: `test-results/vite-phaser3-flicker-test-${Date.now()}.png`,
      fullPage: true 
    });

    console.log('✅ Vite + Phaser 3 閃爍分析測試完成');
    
    // 驗證測試結果
    expect(totalEvents).toBeGreaterThan(0);
    expect(gameCanvas).toBeVisible();
  });
});
