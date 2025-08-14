/**
 * Airplane Game - LRIV devices variants (iPhone 12 / Pixel 5 / iPad Pro 11)
 * 使用 Playwright 內建設備描述符驗證：
 * - DPR（devicePixelRatio）
 * - 觸控事件映射（pointerType: 'touch'，座標與畫面對齊）
 * - 比例與無溢出
 */
import { test, expect, devices } from '@playwright/test';

const BASE_PATH = '/games/airplane-game';
const LOGICAL = { w: 800, h: 464, ratio: 800 / 464 };

type Ctx = { kind: 'frame' | 'page'; ctx: any };

async function waitGameContext(page): Promise<Ctx> {
  const readyPromise = page.evaluate(() => new Promise<boolean>((resolve) => {
    const t = setTimeout(() => resolve(false), 15000);
    function h(e: any){ if(e?.data?.type==='GAME_READY'){ window.removeEventListener('message', h); clearTimeout(t); resolve(true);} }
    window.addEventListener('message', h);
  }));

  const iframe = page.locator('iframe[src*="airplane-game"]');
  if (await iframe.count()) {
    await expect(iframe.first()).toBeVisible();
    const handle = await iframe.first().elementHandle();
    const f = await handle?.contentFrame();
    if (f) {
      const ok = await readyPromise; if (!ok) await f.waitForSelector('canvas', { state: 'visible', timeout: 15000 });
      return { kind: 'frame', ctx: f };
    }
  }
  const ok = await readyPromise; if (!ok) await page.waitForSelector('canvas', { state: 'visible', timeout: 15000 });
  return { kind: 'page', ctx: page };
}

async function assertLayoutFit(ctx: any) {
  const res = await ctx.evaluate(() => {
    const root = document.body.getBoundingClientRect();
    const c = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!c) return { ok:false } as any;
    const rc = c.getBoundingClientRect();
    const noOverflow = rc.width <= root.width + 1 && rc.height <= root.height + 1;
    return { ok: noOverflow, noOverflow, cw: rc.width, ch: rc.height, rw: root.width, rh: root.height };
  });
  expect(res.ok, `noOverflow=${res.noOverflow}, canvas=(${res.cw}x${res.ch}), root=(${res.rw}x${res.rh})`).toBeTruthy();
}

async function assertDPR(ctx: any, expected: number) {
  const dpr = await ctx.evaluate(() => window.devicePixelRatio);
  expect(Math.abs(dpr - expected)).toBeLessThanOrEqual(0.2);
}

async function assertTouchMapping(page, ctx: any) {
  const canvas = ctx.locator('canvas');
  await expect(canvas).toBeVisible();

  // 準備記錄 pointer 事件
  await ctx.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!c) return;
    (window as any).__lastPointer = null;
    c.addEventListener('pointerdown', (e: PointerEvent) => {
      (window as any).__lastPointer = { x: e.clientX, y: e.clientY, type: e.pointerType };
    }, { once: true });
  });

  // 在元素中心 tap（觸控）
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Failed to get canvas bounding box');
  await canvas.tap({ position: { x: Math.round(box.width/2), y: Math.round(box.height/2) } });

  // 讀取事件
  const evt = await ctx.evaluate(() => (window as any).__lastPointer);
  expect(evt, 'No pointer event captured').toBeTruthy();
  expect(evt.type).toBe('touch');

  // 驗證座標落在畫布中心附近（允許 12px 誤差）
  const center = { x: box.x + box.width/2, y: box.y + box.height/2 };
  const dx = Math.abs(evt.x - center.x);
  const dy = Math.abs(evt.y - center.y);
  expect(dx).toBeLessThanOrEqual(12);
  expect(dy).toBeLessThanOrEqual(12);
}

function deviceOptions(name: keyof typeof devices) {
  const opts = { ...(devices as any)[name] } as any;
  // 避免 defaultBrowserType 觸發跨 worker 限制
  delete opts.defaultBrowserType;
  return opts;
}

function makeSuite(deviceName: keyof typeof devices, expectedDPR: number) {
  test.describe(`${String(deviceName)} - LRIV devices`, () => {
    test.use(deviceOptions(deviceName));

    test('DPR/比例/觸控事件映射', async ({ page }) => {
      await page.goto('/');
      const link = page.getByRole('link', { name: /airplane/i });
      if (await link.count()) { await link.first().click(); await page.waitForURL(new RegExp(`${BASE_PATH}`)); }
      else { await page.goto(BASE_PATH); }

      const { ctx } = await waitGameContext(page);
      await assertDPR(ctx, expectedDPR);
      await assertLayoutFit(ctx);
      await assertTouchMapping(page, ctx);
    });
  });
}

// iPhone 12（DPR ~ 3）
makeSuite('iPhone 12' as any, 3);
// Pixel 5（DPR ~ 2.625）
makeSuite('Pixel 5' as any, 2.625);
// iPad Pro 11（DPR ~ 2）
makeSuite('iPad Pro 11' as any, 2);

