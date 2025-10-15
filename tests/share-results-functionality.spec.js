const { test, expect } = require('@playwright/test');

test.describe('分享結果功能測試', () => {
  test('應該能夠訪問公開分享的結果頁面', async ({ page }) => {
    // 測試分享結果 URL
    const shareUrl = 'https://edu-create.vercel.app/shared/results/hNX79DFe9nuoh1Pv';
    
    // 導航到分享頁面
    await page.goto(shareUrl);
    
    // 等待頁面載入完成
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // 驗證頁面標題
    const pageTitle = await page.locator('h1').textContent();
    expect(pageTitle).toContain('我的测试结果');
    
    // 驗證活動名稱
    const activityName = await page.locator('h1 + p').textContent();
    expect(activityName).toBeTruthy();
    
    // 驗證公開分享狀態
    const publicStatus = await page.locator('text=公開分享的結果').isVisible();
    expect(publicStatus).toBe(true);
    
    // 驗證結果概覽部分
    const overviewHeading = await page.locator('h2:has-text("結果概覽")').isVisible();
    expect(overviewHeading).toBe(true);
    
    // 驗證參與人數
    const participantCount = await page.locator('text=參與人數').isVisible();
    expect(participantCount).toBe(true);
    
    // 驗證創建時間
    const createdTime = await page.locator('text=創建時間').isVisible();
    expect(createdTime).toBe(true);
    
    // 驗證統計數據部分
    const statsHeading = await page.locator('h2:has-text("統計數據")').isVisible();
    expect(statsHeading).toBe(true);
    
    // 驗證總題數
    const totalQuestions = await page.locator('text=總題數').isVisible();
    expect(totalQuestions).toBe(true);
    
    // 驗證平均分數
    const averageScore = await page.locator('text=平均分數').isVisible();
    expect(averageScore).toBe(true);
    
    // 驗證完成率
    const completionRate = await page.locator('text=完成率').isVisible();
    expect(completionRate).toBe(true);
    
    // 驗證參與者結果表格
    const participantsHeading = await page.locator('h2:has-text("參與者結果")').isVisible();
    expect(participantsHeading).toBe(true);
    
    // 驗證表格存在
    const table = await page.locator('table').isVisible();
    expect(table).toBe(true);
    
    // 驗證表格標題行
    const tableHeaders = await page.locator('table thead tr').textContent();
    expect(tableHeaders).toContain('參與者');
    expect(tableHeaders).toContain('分數');
    expect(tableHeaders).toContain('完成時間');
    
    // 驗證至少有一行參與者數據
    const participantRows = await page.locator('table tbody tr').count();
    expect(participantRows).toBeGreaterThan(0);
    
    // 驗證頁腳信息
    const footerText = await page.locator('text=此結果由 EduCreate 平台生成').isVisible();
    expect(footerText).toBe(true);
    
    // 驗證平台連結
    const platformLink = await page.locator('a:has-text("探索 EduCreate 平台")').isVisible();
    expect(platformLink).toBe(true);
    
    console.log('✅ 分享結果功能測試通過');
  });

  test('API 端點應該返回正確的結果數據', async ({ request }) => {
    // 測試 API 端點
    const apiUrl = 'https://edu-create.vercel.app/api/shared/results/hNX79DFe9nuoh1Pv';
    
    const response = await request.get(apiUrl);
    
    // 驗證響應狀態
    expect(response.status()).toBe(200);
    
    // 解析響應數據
    const data = await response.json();
    
    // 驗證必要字段
    expect(data.id).toBeTruthy();
    expect(data.title).toBeTruthy();
    expect(data.activityName).toBeTruthy();
    expect(data.participantCount).toBeGreaterThan(0);
    expect(data.createdAt).toBeTruthy();
    expect(data.status).toBeTruthy();
    expect(data.isPublic).toBe(true);
    
    // 驗證統計數據
    expect(data.totalQuestions).toBeGreaterThan(0);
    expect(data.averageScore).toBeGreaterThanOrEqual(0);
    expect(data.completionRate).toBeGreaterThanOrEqual(0);
    
    // 驗證參與者數據
    expect(Array.isArray(data.participants)).toBe(true);
    expect(data.participants.length).toBeGreaterThan(0);
    
    // 驗證參與者數據結構
    const participant = data.participants[0];
    expect(participant.id).toBeTruthy();
    expect(participant.name).toBeTruthy();
    expect(participant.score).toBeGreaterThanOrEqual(0);
    expect(participant.completedAt).toBeTruthy();
    
    console.log('✅ API 端點測試通過');
    console.log('📊 結果數據:', JSON.stringify(data, null, 2));
  });

  test('無效的分享 ID 應該返回 404 錯誤', async ({ request }) => {
    // 測試無效的分享 ID
    const invalidApiUrl = 'https://edu-create.vercel.app/api/shared/results/invalid-share-id';
    
    const response = await request.get(invalidApiUrl);
    
    // 驗證響應狀態
    expect(response.status()).toBe(404);
    
    // 解析響應數據
    const data = await response.json();
    
    // 驗證錯誤信息
    expect(data.error).toContain('分享的結果不存在');
    
    console.log('✅ 無效分享 ID 測試通過');
  });
});
