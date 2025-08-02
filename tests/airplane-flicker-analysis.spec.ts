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

test.describe('飛機遊戲閃爍問題深度分析', () => {
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
      if (text.includes('📊 更新 HUD') || text.includes('更新 HUD')) {
        events.push({
          timestamp,
          type: 'ui-update',
          details: `UI更新: ${text}`,
          data: { source: 'HUD' }
        });
        console.log(`🔄 UI更新檢測到: ${timestamp}`);
      }
    });

    // 監控 DOM 變化
    await page.addInitScript(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            (window as any).domChangeEvents = (window as any).domChangeEvents || [];
            (window as any).domChangeEvents.push({
              timestamp: Date.now(),
              type: mutation.type,
              target: mutation.target.nodeName,
              changes: mutation.addedNodes.length + mutation.removedNodes.length
            });
          }
        });
      });
      
      // 開始觀察整個文檔
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
      });
    });
  });

  test('自動化碰撞觸發與閃爍分析', async () => {
    console.log('🚀 開始飛機遊戲閃爍分析測試');

    // 導航到飛機遊戲 (Vite + Phaser 3 獨立項目)
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ 遊戲頁面載入完成');

    // 等待遊戲初始化
    await page.waitForTimeout(3000);
    
    // 等待雲朵出現
    console.log('⏳ 等待雲朵出現...');
    await page.waitForTimeout(2000);

    // 記錄碰撞前的基準時間
    const preCollisionTime = Date.now();
    console.log(`📍 碰撞前基準時間: ${preCollisionTime}`);

    // 自動觸發碰撞 - 連續按上箭頭
    console.log('🎯 開始自動觸發碰撞...');
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      
      // 檢查是否已經碰撞
      if (collisionDetected) {
        console.log(`💥 碰撞成功觸發! 第 ${i + 1} 次按鍵後`);
        break;
      }
    }

    // 如果還沒碰撞，嘗試其他方向
    if (!collisionDetected) {
      console.log('🔄 嘗試其他移動方向...');
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        if (collisionDetected) break;
      }
    }

    // 等待碰撞後的事件處理
    if (collisionDetected) {
      console.log('⏳ 等待碰撞後事件處理...');
      await page.waitForTimeout(2000);
    }

    // 收集 DOM 變化事件
    const domEvents = await page.evaluate(() => {
      return (window as any).domChangeEvents || [];
    });

    // 將 DOM 事件添加到事件列表
    domEvents.forEach((event: any) => {
      events.push({
        timestamp: event.timestamp,
        type: 'dom-change',
        details: `DOM變化: ${event.type} on ${event.target}`,
        data: event
      });
    });

    // 分析碰撞事件
    const analysis = analyzeCollisionEvents(events, collisionTime);
    
    // 生成詳細報告
    const report = generateFlickerReport(analysis, events);
    
    console.log('📊 閃爍分析報告:');
    console.log(report);

    // 截圖保存
    await page.screenshot({ 
      path: `test-results/airplane-flicker-analysis-${Date.now()}.png`,
      fullPage: true 
    });

    // 驗證結果
    expect(collisionDetected).toBe(true);
    
    if (analysis.flickerDetected) {
      console.log('⚠️  閃爍問題確認存在!');
      console.log(`閃爍模式: ${analysis.flickerPattern}`);
      console.log(`UI更新次數: ${analysis.uiUpdateCount}`);
    } else {
      console.log('✅ 未檢測到閃爍問題');
    }
  });

  function analyzeCollisionEvents(events: FlickerEvent[], collisionTime: number): CollisionAnalysis {
    if (!collisionTime) {
      return {
        collisionTime: 0,
        preCollisionEvents: [],
        postCollisionEvents: [],
        uiUpdateCount: 0,
        flickerDetected: false
      };
    }

    // 分析碰撞前後 1 秒內的事件
    const timeWindow = 1000; // 1秒
    const preCollisionEvents = events.filter(e => 
      e.timestamp >= collisionTime - timeWindow && e.timestamp < collisionTime
    );
    const postCollisionEvents = events.filter(e => 
      e.timestamp >= collisionTime && e.timestamp <= collisionTime + timeWindow
    );

    // 計算 UI 更新次數
    const uiUpdates = postCollisionEvents.filter(e => e.type === 'ui-update');
    const uiUpdateCount = uiUpdates.length;

    // 檢測閃爍模式
    let flickerDetected = false;
    let flickerPattern = '';

    // 如果在短時間內有多次 UI 更新，可能是閃爍
    if (uiUpdateCount > 1) {
      const updateTimes = uiUpdates.map(e => e.timestamp);
      const intervals = [];
      for (let i = 1; i < updateTimes.length; i++) {
        intervals.push(updateTimes[i] - updateTimes[i-1]);
      }
      
      // 如果更新間隔很短（<100ms），認為是閃爍
      const shortIntervals = intervals.filter(interval => interval < 100);
      if (shortIntervals.length > 0) {
        flickerDetected = true;
        flickerPattern = `${uiUpdateCount}次快速UI更新，間隔: ${intervals.join(', ')}ms`;
      }
    }

    // 檢查 DOM 變化頻率
    const domChanges = postCollisionEvents.filter(e => e.type === 'dom-change');
    if (domChanges.length > 5) {
      flickerDetected = true;
      flickerPattern += ` + ${domChanges.length}次DOM變化`;
    }

    return {
      collisionTime,
      preCollisionEvents,
      postCollisionEvents,
      uiUpdateCount,
      flickerDetected,
      flickerPattern
    };
  }

  function generateFlickerReport(analysis: CollisionAnalysis, allEvents: FlickerEvent[]): string {
    const report = [];
    
    report.push('='.repeat(60));
    report.push('🔍 EduCreate 飛機遊戲閃爍分析報告');
    report.push('='.repeat(60));
    
    if (analysis.collisionTime) {
      report.push(`⏰ 碰撞時間: ${new Date(analysis.collisionTime).toISOString()}`);
      report.push(`📊 碰撞前事件數: ${analysis.preCollisionEvents.length}`);
      report.push(`📊 碰撞後事件數: ${analysis.postCollisionEvents.length}`);
      report.push(`🔄 UI更新次數: ${analysis.uiUpdateCount}`);
      
      if (analysis.flickerDetected) {
        report.push(`⚠️  閃爍檢測: 是`);
        report.push(`🔍 閃爍模式: ${analysis.flickerPattern}`);
      } else {
        report.push(`✅ 閃爍檢測: 否`);
      }
      
      report.push('');
      report.push('📋 碰撞後事件時間線:');
      analysis.postCollisionEvents.forEach((event, index) => {
        const relativeTime = event.timestamp - analysis.collisionTime;
        report.push(`  ${index + 1}. [+${relativeTime}ms] ${event.type}: ${event.details}`);
      });
    } else {
      report.push('❌ 未檢測到碰撞事件');
    }
    
    report.push('');
    report.push(`📈 總事件數: ${allEvents.length}`);
    report.push('='.repeat(60));
    
    return report.join('\n');
  }
});
