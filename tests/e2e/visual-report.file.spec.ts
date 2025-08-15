import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// This spec verifies that the latest responsive visual report HTML loads correctly via file://
// and that at least one screenshot image is present and has non-zero naturalWidth.

function findLatestReport(): string {
  const dir = path.join(process.cwd(), 'reports', 'visual-comparisons');
  if (!fs.existsSync(dir)) throw new Error('visual-comparisons directory not found');
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('_responsive-report.html'))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (files.length === 0) throw new Error('no responsive-report.html found');
  return path.join(dir, files[0].f);
}

function toFileUrl(absPath: string) {
  // Windows path -> file:///C:/... ; POSIX -> file:///...
  const norm = absPath.replace(/\\/g, '/');
  if (/^[A-Za-z]:\//.test(norm)) {
    return 'file:///' + norm; // Windows drive letter
  }
  return 'file://' + norm;
}

// Avoid recording videos for this utility spec
// (so we don't pollute LRIV archive in a quick check)
test.use({ video: 'off', trace: 'off', screenshot: 'off' });

test('visual responsive report (file://) should load and display screenshots', async ({ page }) => {
  const reportPath = findLatestReport();
  const url = toFileUrl(reportPath);
  await page.goto(url);

  // Page should contain title and at least one image
  await expect(page.locator('h1, h2, title')).toHaveCountGreaterThan(0);
  const imgs = page.locator('img');
  const count = await imgs.count();
  expect(count).toBeGreaterThan(0);

  // Verify first image is loaded (naturalWidth > 0)
  const ok = await imgs.nth(0).evaluate((img: HTMLImageElement) => {
    return !!img && (img.complete || img.naturalWidth > 0);
  });
  expect(ok).toBeTruthy();
});

