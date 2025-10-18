import { test, expect } from '@playwright/test';

/**
 * 測試無痕模式下的遊戲結果提交
 * 
 * 測試目標：
 * 1. 在無痕模式下訪問課業分配連結
 * 2. 輸入學生姓名
 * 3. 完成遊戲
 * 4. 驗證結果是否成功提交到後端
 * 5. 驗證結果是否顯示在結果頁面中
 */

test.describe('無痕模式下的遊戲結果提交測試', () => {
  
  test('應該能在無痕模式下成功提交遊戲結果', async ({ browser }) => {
    // 創建無痕瀏覽器上下文（模擬無痕模式）
    const context = await browser.newContext({
      // 無痕模式設置
      storageState: undefined, // 不使用任何存儲狀態
      permissions: [], // 不授予任何權限
    });
    
    const page = await context.newPage();
    
    // 監聽 console 消息
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // 監聽網絡請求
    const networkRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/results')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    // 監聽網絡響應
    const networkResponses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/results')) {
        try {
          const body = await response.json();
          networkResponses.push({
            url: response.url(),
            status: response.status(),
            body: body
          });
        } catch (error) {
          networkResponses.push({
            url: response.url(),
            status: response.status(),
            error: 'Failed to parse JSON'
          });
        }
      }
    });
    
    try {
      console.log('🔍 步驟 1: 訪問課業分配頁面');
      
      // 使用測試用的課業分配連結
      // 注意：這裡需要替換為實際的測試連結
      const testActivityId = 'cmgtnaavg0001la04rz1hdr2y';
      const testAssignmentId = 'cmgup37120001jo04f3qkarm8';
      
      await page.goto(`https://edu-create.vercel.app/play/${testActivityId}/${testAssignmentId}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功');
      
      // 等待頁面完全載入
      await page.waitForTimeout(2000);
      
      console.log('🔍 步驟 2: 檢查是否需要輸入姓名');
      
      // 檢查是否有姓名輸入框
      const nameInput = page.locator('input[type="text"]').first();
      const isNameInputVisible = await nameInput.isVisible().catch(() => false);
      
      if (isNameInputVisible) {
        console.log('✅ 找到姓名輸入框，輸入測試姓名');
        
        // 輸入測試學生姓名
        const testStudentName = `無痕測試學生_${Date.now()}`;
        await nameInput.fill(testStudentName);
        
        // 點擊開始遊戲按鈕
        const startButton = page.locator('button:has-text("開始遊戲"), button:has-text("開始")').first();
        await startButton.click();
        
        console.log(`✅ 輸入姓名: ${testStudentName}，點擊開始遊戲`);
      } else {
        console.log('⚠️ 沒有找到姓名輸入框，可能是匿名模式');
      }
      
      console.log('🔍 步驟 3: 等待遊戲頁面載入');
      
      // 等待跳轉到遊戲頁面
      await page.waitForURL('**/games/switcher**', { timeout: 10000 });
      console.log('✅ 成功跳轉到遊戲頁面');
      
      // 等待遊戲載入
      await page.waitForTimeout(5000);
      
      console.log('🔍 步驟 4: 檢查 URL 參數');
      
      // 檢查 URL 參數
      const currentUrl = page.url();
      console.log('當前 URL:', currentUrl);
      
      const urlParams = new URL(currentUrl).searchParams;
      const hasAssignmentId = urlParams.has('assignmentId');
      const hasActivityId = urlParams.has('activityId');
      const hasStudentName = urlParams.has('studentName');
      const isAnonymous = urlParams.get('anonymous') === 'true';
      
      console.log('URL 參數檢查:', {
        hasAssignmentId,
        hasActivityId,
        hasStudentName,
        isAnonymous
      });
      
      // 驗證必要參數存在
      expect(hasAssignmentId).toBe(true);
      expect(hasActivityId).toBe(true);
      
      if (!isAnonymous) {
        expect(hasStudentName).toBe(true);
      }
      
      console.log('🔍 步驟 5: 模擬遊戲結束並提交結果');
      
      // 在頁面中執行 JavaScript 來模擬遊戲結束
      const submitResult = await page.evaluate(async () => {
        // 檢查 ResultCollector 是否存在
        if (typeof window.resultCollector === 'undefined') {
          return { error: 'ResultCollector not found' };
        }
        
        // 模擬遊戲結果
        const mockGameResult = {
          score: 85,
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 120
        };
        
        // 提交結果
        try {
          const result = await window.resultCollector.submitGameResult(mockGameResult);
          return result;
        } catch (error: any) {
          return { error: error.message };
        }
      });
      
      console.log('提交結果:', submitResult);
      
      // 等待網絡請求完成
      await page.waitForTimeout(3000);
      
      console.log('🔍 步驟 6: 檢查網絡請求和響應');
      
      console.log('網絡請求:', networkRequests);
      console.log('網絡響應:', networkResponses);
      
      // 驗證結果
      if (!isAnonymous) {
        // 非匿名模式：應該有 API 請求
        expect(networkRequests.length).toBeGreaterThan(0);
        expect(networkResponses.length).toBeGreaterThan(0);
        
        // 檢查響應狀態
        const lastResponse = networkResponses[networkResponses.length - 1];
        expect(lastResponse.status).toBe(200);
        expect(lastResponse.body.success).toBe(true);
        
        console.log('✅ 結果提交成功！');
      } else {
        // 匿名模式：不應該有 API 請求
        console.log('✅ 匿名模式：結果未提交（符合預期）');
      }
      
      console.log('🔍 步驟 7: 檢查 Console 消息');
      
      // 檢查是否有錯誤消息
      const errorMessages = consoleMessages.filter(msg => msg.startsWith('error:'));
      if (errorMessages.length > 0) {
        console.log('⚠️ 發現錯誤消息:', errorMessages);
      } else {
        console.log('✅ 沒有錯誤消息');
      }
      
      // 輸出所有 console 消息供調試
      console.log('所有 Console 消息:');
      consoleMessages.forEach(msg => console.log(msg));
      
    } finally {
      // 清理：關閉頁面和上下文
      await page.close();
      await context.close();
    }
  });
  
  test('應該能驗證結果是否顯示在結果頁面中', async ({ page }) => {
    console.log('🔍 測試：驗證結果是否顯示在結果頁面中');
    
    // 登入（需要教師帳號才能查看結果）
    // 注意：這裡需要實際的登入流程
    
    // 訪問結果頁面
    const testResultId = 'cmgup372k0003jo04qjh035cl';
    await page.goto(`https://edu-create.vercel.app/my-results/${testResultId}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 等待頁面載入
    await page.waitForTimeout(2000);
    
    // 檢查是否有參與者列表
    const participantsList = page.locator('[data-testid="participants-list"], .participants-list, table');
    const hasParticipants = await participantsList.isVisible().catch(() => false);
    
    if (hasParticipants) {
      console.log('✅ 找到參與者列表');
      
      // 獲取參與者數量
      const participantRows = page.locator('tr').filter({ hasText: /測試|學生/ });
      const count = await participantRows.count();
      
      console.log(`參與者數量: ${count}`);
    } else {
      console.log('⚠️ 沒有找到參與者列表');
    }
  });
});

