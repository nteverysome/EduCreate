import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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
  const norm = absPath.replace(/\\/g, '/');
  if (/^[A-Za-z]:\//.test(norm)) return 'file:///' + norm;
  return 'file://' + norm;
}

test.describe('Visual report link sanity (file://)', () => {
  test.use({ video: 'off', trace: 'off', screenshot: 'off' });

  test('anchors point to existing files and can load', async ({ page }) => {
    const reportPath = findLatestReport();
    const reportDir = path.dirname(reportPath);
    await page.goto(toFileUrl(reportPath));

    const hrefs: string[] = await page.$$eval('a[href]', as => as.map(a => (a as HTMLAnchorElement).getAttribute('href') || '').filter(Boolean));
    expect(hrefs.length).toBeGreaterThan(0);

    const checkExt = ['html','csv','json','png','jpg','jpeg','webm','zip'];
    let tested = 0;
    for (const href of hrefs.slice(0, 10)) {
      // skip external links
      if (/^https?:/i.test(href)) continue;
      const abs = path.resolve(reportDir, href);
      expect(fs.existsSync(abs)).toBeTruthy();
      const ext = (abs.split('.').pop() || '').toLowerCase();
      if (checkExt.includes(ext)) {
        const url = toFileUrl(abs);
        // Navigate in the same page for binary may show blank, but no error should be thrown
        await page.goto(url);
        tested++;
      }
    }
    expect(tested).toBeGreaterThan(0);
  });
});

