/**
 * 修復 CSS 選擇器語法錯誤
 * 移除屬性選擇器中的引號
 */

const fs = require('fs');

const filePath = 'tests/day13-14-share-system-deep-test.spec.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 修復 data-testid 屬性選擇器
content = content.replace(/\[data-testid\*="([^"]+)"\]/g, '[data-testid*=$1]');

// 修復 class 屬性選擇器  
content = content.replace(/\[class\*="([^"]+)"\]/g, '[class*=$1]');

// 移除不必要的 await 在 locator 調用上
content = content.replace(/const (\w+) = await page\.locator\(/g, 'const $1 = page.locator(');

fs.writeFileSync(filePath, content);
console.log('✅ CSS 選擇器語法錯誤已修復');
