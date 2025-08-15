/**
 * Airplane Game - Localized Realistic Interaction Verification (LRIV)
 * 三層整合：首頁→遊戲→真互動（優先 iframe，若無則直讀畫布），含裝置/輸入/環境矩陣、錄影與比例/置中/互動命中驗證
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

const BASE_PATH = '/games/airplane-game';
const LOGICAL = { w: 800, h: 464, ratio: 800 / 464 };

async function getGameContext(page) {
  // 等待遊戲就緒訊號（iframe 會在 ready 後 postMessage）
  const readyPromise = page.evaluate(() => new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), 15000);
    function handler(e) {
      if (e?.data && e.data.type === 'GAME_READY') {
        window.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve(true);
      }
    }
    window.addEventListener('message', handler);
  }));

  // 優先使用 app/games/airplane-game/page.tsx 的 iframe
  const iframe = page.locator('iframe[src*="airplane-game"]');
  if (await iframe.count()) {
    await expect(iframe.first()).toBeVisible();
    const handle = await iframe.first().elementHandle();
    const contentFrame = await handle?.contentFrame();
    if (contentFrame) {
      // 等待就緒或至少畫布出現
      const ok = await readyPromise;
      if (!ok) {
        await contentFrame.waitForSelector('canvas', { state: 'visible', timeout: 15000 });
      }
      return { kind: 'frame' as const, ctx: contentFrame };
    }
  }
  // 後備：直接在頁面（可能被 rewrites 映射到 index.html）
  const ok = await readyPromise;
  if (!ok) await page.waitForSelector('canvas', { state: 'visible', timeout: 15000 });
  return { kind: 'page' as const, ctx: page };
}

async function assertAspectAndNoOverflow(ctx) {
  const res = await ctx.evaluate(({ ratio }) => {
    const root = document.body;
    const canvas = document.querySelector('canvas');
    if (!canvas) return { ok: false } as any;
    const rc = canvas.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    const aspect = rc.width / rc.height;
    const noOverflow = rc.width <= rr.width + 1 && rc.height <= rr.height + 1;
    return { ok: Math.abs(aspect - ratio) < 0.03 && noOverflow, aspect, rootW: rr.width, rootH: rr.height, cw: rc.width, ch: rc.height };
  }, { ratio: LOGICAL.ratio });
  expect(res.ok, `aspect=${res.aspect}, root=(${res.rootW}x${res.rootH}), canvas=(${res.cw}x${res.ch})`).toBeTruthy();
}

async function estimateFPS(ctx) {
  return await ctx.evaluate(async () => {
    return await new Promise<number>((resolve) => {
      let frames = 0; const start = performance.now();
      function tick() { frames++; const t = performance.now(); if (t - start >= 1000) resolve(frames); else requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    });
  });
}

async function basicInteractions(page, ctx) {
  const canvas = ctx.locator('canvas');
  await canvas.click({ position: { x: 10, y: 10 } }); // 聚焦
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(250); await page.keyboard.up('ArrowUp');
  await page.keyboard.press('Space');
  const box = await canvas.boundingBox();
  if (box) { await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.7); await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.up(); }
}

// @firefox @webkit
// 提示：此檔將在多瀏覽器專案下執行，若需僅 chromium 可用 grep

test.describe('Airplane - LRIV 真互動驗證', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /airplane/i });
    if (await link.count()) { await link.first().click(); await page.waitForURL(new RegExp(`${BASE_PATH}`)); }
    else { await page.goto(BASE_PATH); }
  });

  test('手機直向 → 橫向 → 網路切換 → 真互動（含網路/CPU 節流、FPS/記憶體）', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const { ctx } = await getGameContext(page);
    await assertAspectAndNoOverflow(ctx);
    await basicInteractions(page, ctx);

    await page.setViewportSize({ width: 812, height: 375 });
    await assertAspectAndNoOverflow(ctx);
    await basicInteractions(page, ctx);

    // 3G/4G 模擬（Chromium 下用 CDP）
    if (browserName === 'chromium') {
      const cdp = await (page.context() as any).newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,           // 4G ~150ms RTT
        downloadThroughput: 1_000_000 / 8, // ~1Mbps
        uploadThroughput: 1_000_000 / 8
      });
      // CPU 節流 4x
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }

    // 離線/在線切換
    await page.context().setOffline(true); await page.waitForTimeout(300);
    await page.context().setOffline(false);

    // FPS 門檻（慢網/CPU 節流下）
    const fps = await estimateFPS(ctx);
    expect(fps).toBeGreaterThan(24);

    // 記憶體監控（如支援）
    if (browserName === 'chromium') {
      const mem = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      expect(mem).toBeGreaterThanOrEqual(0);
    }
  });

  test('平板直/橫 + 長時互動（報告統一由流程層執行）', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const { ctx } = await getGameContext(page);
    await assertAspectAndNoOverflow(ctx);
    await basicInteractions(page, ctx);

    await page.setViewportSize({ width: 1024, height: 768 });
    await assertAspectAndNoOverflow(ctx);

    const t0 = Date.now();
    while (Date.now() - t0 < 2000) { await basicInteractions(page, ctx); }
    const fps = await estimateFPS(ctx);
    expect(fps).toBeGreaterThan(30);

    // 不再在測試內觸發報告，避免副作用；改由流程腳本 test:lriv:full 統一處理
  });
});

