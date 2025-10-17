import { test, expect } from '@playwright/test';

test.describe('調試複製活動功能', () => {
  test('測試複製活動並查看數據結構', async ({ page }) => {
    // 監聽所有 console 日誌
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('瀏覽器 Console:', text);
    });

    // 監聽網絡請求
    const apiRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('API 請求:', request.method(), request.url());
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          postData: request.postData(),
        });
      }
    });

    // 監聽網絡響應
    const apiResponses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.json();
        } catch (e) {
          body = await response.text();
        }
        console.log('API 響應:', response.url(), status, body);
        apiResponses.push({
          url: response.url(),
          status,
          body,
        });
      }
    });

    // 1. 訪問登入頁面
    console.log('\n=== 步驟 1: 訪問登入頁面 ===');
    await page.goto('https://edu-create.vercel.app/auth/signin');
    await page.waitForLoadState('networkidle');

    // 2. 登入
    console.log('\n=== 步驟 2: 登入 ===');
    await page.fill('input[name="email"]', 'nteverysome@gmail.com');
    await page.fill('input[name="password"]', 'Aa123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ 登入成功');

    // 3. 訪問遊戲頁面
    console.log('\n=== 步驟 3: 訪問遊戲頁面 ===');
    const gameUrl = 'https://edu-create.vercel.app/games/switcher?game=vocabulary&activityId=cmgtdqovz0001l404h67nm7qg';
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');
    console.log('✅ 遊戲頁面已載入');

    // 4. 等待活動信息框出現
    console.log('\n=== 步驟 4: 等待活動信息框 ===');
    await page.waitForSelector('text=複製並編輯', { timeout: 10000 });
    console.log('✅ 找到「複製並編輯」按鈕');

    // 5. 截圖
    await page.screenshot({ path: 'EduCreate-Test-Videos/debug-before-copy.png', fullPage: true });
    console.log('✅ 截圖已保存: debug-before-copy.png');

    // 6. 點擊複製按鈕
    console.log('\n=== 步驟 5: 點擊複製按鈕 ===');
    await page.click('button:has-text("複製並編輯")');
    console.log('✅ 已點擊複製按鈕');

    // 7. 等待複製完成（可能會跳轉或顯示提示）
    console.log('\n=== 步驟 6: 等待複製完成 ===');
    await page.waitForTimeout(3000); // 等待 3 秒讓 API 完成

    // 8. 查找複製 API 的請求和響應
    console.log('\n=== 步驟 7: 分析 API 請求和響應 ===');
    const copyRequest = apiRequests.find(req => req.url.includes('/api/activities/copy'));
    const copyResponse = apiResponses.find(res => res.url.includes('/api/activities/copy'));

    if (copyRequest) {
      console.log('\n📤 複製 API 請求:');
      console.log(JSON.stringify(copyRequest, null, 2));
    } else {
      console.log('\n❌ 未找到複製 API 請求');
    }

    if (copyResponse) {
      console.log('\n📥 複製 API 響應:');
      console.log(JSON.stringify(copyResponse, null, 2));
    } else {
      console.log('\n❌ 未找到複製 API 響應');
    }

    // 9. 查找活動數據 API 的請求和響應
    console.log('\n=== 步驟 8: 查找活動數據 API ===');
    const activityRequest = apiRequests.find(req => req.url.includes('/api/activities/cmgtdqovz0001l404h67nm7qg'));
    const activityResponse = apiResponses.find(res => res.url.includes('/api/activities/cmgtdqovz0001l404h67nm7qg'));

    if (activityResponse) {
      console.log('\n📥 活動數據 API 響應:');
      console.log(JSON.stringify(activityResponse.body, null, 2));
    }

    // 10. 截圖最終狀態
    await page.screenshot({ path: 'EduCreate-Test-Videos/debug-after-copy.png', fullPage: true });
    console.log('✅ 截圖已保存: debug-after-copy.png');

    // 11. 輸出所有 console 日誌
    console.log('\n=== 所有瀏覽器 Console 日誌 ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });

    // 12. 總結
    console.log('\n=== 測試總結 ===');
    console.log(`總共捕獲 ${apiRequests.length} 個 API 請求`);
    console.log(`總共捕獲 ${apiResponses.length} 個 API 響應`);
    console.log(`總共捕獲 ${consoleLogs.length} 條 console 日誌`);
  });
});

