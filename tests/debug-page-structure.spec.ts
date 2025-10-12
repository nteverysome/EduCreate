import { test, expect } from '@playwright/test';

test('調試頁面結構', async ({ page }) => {
  const testUrl = 'https://edu-create.vercel.app/create/shimozurdo-game';
  
  // 導航到頁面
  await page.goto(testUrl);
  
  // 等待頁面載入
  await page.waitForLoadState('networkidle');
  
  // 截圖
  await page.screenshot({ path: 'debug-page-structure.png', fullPage: true });
  
  // 獲取頁面標題
  const title = await page.title();
  console.log('頁面標題:', title);
  
  // 檢查所有標題元素
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log('找到的標題元素數量:', headings.length);
  
  for (let i = 0; i < headings.length; i++) {
    const text = await headings[i].textContent();
    const tagName = await headings[i].evaluate(el => el.tagName);
    console.log(`標題 ${i + 1}: ${tagName} - "${text}"`);
  }
  
  // 檢查主要容器
  const mainContainers = await page.locator('main, .container, .main-content, [role="main"]').all();
  console.log('找到的主容器數量:', mainContainers.length);
  
  // 檢查表單元素
  const forms = await page.locator('form').all();
  console.log('找到的表單數量:', forms.length);
  
  // 檢查輸入框
  const inputs = await page.locator('input').all();
  console.log('找到的輸入框數量:', inputs.length);
  
  for (let i = 0; i < Math.min(inputs.length, 5); i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const type = await inputs[i].getAttribute('type');
    console.log(`輸入框 ${i + 1}: type="${type}", placeholder="${placeholder}"`);
  }
  
  // 檢查按鈕
  const buttons = await page.locator('button').all();
  console.log('找到的按鈕數量:', buttons.length);
  
  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const text = await buttons[i].textContent();
    console.log(`按鈕 ${i + 1}: "${text}"`);
  }
  
  // 檢查頁面的基本結構
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('頁面 body 的前 500 個字符:');
  console.log(bodyHTML.substring(0, 500));
});
