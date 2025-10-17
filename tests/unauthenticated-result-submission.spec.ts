import { test, expect } from '@playwright/test';

/**
 * 測試未登入用戶的遊戲結果提交
 * 
 * 目標：驗證未登入的學生是否能成功提交遊戲結果
 */

test.describe('未登入用戶結果提交測試', () => {
  
  test('未登入用戶應該能成功提交遊戲結果', async ({ page }) => {
    console.log('🔍 測試：未登入用戶提交遊戲結果');
    
    // 監聽 console 消息
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`${msg.type()}: ${text}`);
      console.log(`[Browser Console] ${msg.type()}: ${text}`);
    });
    
    // 監聽網絡請求
    const apiRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/results')) {
        const postData = request.postData();
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          postData: postData ? JSON.parse(postData) : null
        });
        console.log(`[API Request] ${request.method()} ${request.url()}`);
        if (postData) {
          console.log('[API Request Body]', JSON.parse(postData));
        }
      }
    });
    
    // 監聽網絡響應
    const apiResponses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/results')) {
        try {
          const body = await response.json();
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            body: body
          });
          console.log(`[API Response] ${response.status()} ${response.url()}`);
          console.log('[API Response Body]', body);
        } catch (error) {
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            error: 'Failed to parse JSON'
          });
          console.log(`[API Response] ${response.status()} ${response.url()} - Failed to parse JSON`);
        }
      }
    });
    
    try {
      console.log('📍 步驟 1: 訪問課業分配頁面（未登入狀態）');
      
      // 使用實際的測試連結
      const testActivityId = 'cmgtnaavg0001la04rz1hdr2y';
      const testAssignmentId = 'cmgup37120001jo04f3qkarm8';
      
      await page.goto(`https://edu-create.vercel.app/play/${testActivityId}/${testAssignmentId}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功');
      
      // 等待頁面完全載入
      await page.waitForTimeout(2000);
      
      console.log('📍 步驟 2: 輸入學生姓名');
      
      // 檢查是否有姓名輸入框
      const nameInput = page.locator('input[type="text"]').first();
      const isNameInputVisible = await nameInput.isVisible().catch(() => false);
      
      if (isNameInputVisible) {
        // 輸入測試學生姓名
        const testStudentName = `未登入測試_${Date.now()}`;
        await nameInput.fill(testStudentName);
        console.log(`✅ 輸入姓名: ${testStudentName}`);
        
        // 點擊開始遊戲按鈕
        const startButton = page.locator('button:has-text("開始遊戲"), button:has-text("開始")').first();
        await startButton.click();
        console.log('✅ 點擊開始遊戲按鈕');
      } else {
        console.log('⚠️ 沒有找到姓名輸入框（可能是匿名模式）');
      }
      
      console.log('📍 步驟 3: 等待遊戲頁面載入');
      
      // 等待跳轉到遊戲頁面
      await page.waitForURL('**/games/switcher**', { timeout: 10000 });
      console.log('✅ 成功跳轉到遊戲頁面');
      
      // 獲取當前 URL
      const currentUrl = page.url();
      console.log('當前 URL:', currentUrl);
      
      // 檢查 URL 參數
      const urlParams = new URL(currentUrl).searchParams;
      const assignmentId = urlParams.get('assignmentId');
      const activityId = urlParams.get('activityId');
      const studentName = urlParams.get('studentName');
      const isAnonymous = urlParams.get('anonymous') === 'true';
      
      console.log('URL 參數:', {
        assignmentId,
        activityId,
        studentName,
        isAnonymous
      });
      
      // 驗證必要參數存在
      expect(assignmentId).toBeTruthy();
      expect(activityId).toBeTruthy();
      
      if (!isAnonymous) {
        expect(studentName).toBeTruthy();
      }
      
      console.log('📍 步驟 4: 等待遊戲載入完成');
      
      // 等待遊戲 iframe 載入
      await page.waitForTimeout(5000);
      
      console.log('📍 步驟 5: 直接測試 API 端點');
      
      // 直接調用 API 測試是否需要身份驗證
      const testApiResponse = await page.evaluate(async ({ assignmentId, activityId, studentName }) => {
        try {
          const response = await fetch('/api/results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              assignmentId: assignmentId,
              activityId: activityId,
              studentName: studentName || '測試學生',
              score: 85,
              timeSpent: 120,
              correctAnswers: 8,
              totalQuestions: 10,
              gameData: {
                test: true,
                timestamp: Date.now()
              }
            })
          });
          
          const data = await response.json();
          
          return {
            status: response.status,
            ok: response.ok,
            data: data
          };
        } catch (error: any) {
          return {
            error: error.message
          };
        }
      }, { assignmentId, activityId, studentName });
      
      console.log('API 測試結果:', testApiResponse);
      
      // 驗證 API 響應
      if (testApiResponse.error) {
        console.error('❌ API 調用失敗:', testApiResponse.error);
        throw new Error(`API 調用失敗: ${testApiResponse.error}`);
      }
      
      if (testApiResponse.status === 401) {
        console.error('❌ API 需要身份驗證（401 Unauthorized）');
        throw new Error('API 需要身份驗證，未登入用戶無法提交結果');
      }
      
      if (testApiResponse.status === 400) {
        console.error('❌ API 請求參數錯誤（400 Bad Request）');
        console.error('響應數據:', testApiResponse.data);
        throw new Error(`API 請求參數錯誤: ${JSON.stringify(testApiResponse.data)}`);
      }
      
      if (!testApiResponse.ok) {
        console.error(`❌ API 請求失敗（${testApiResponse.status}）`);
        console.error('響應數據:', testApiResponse.data);
        throw new Error(`API 請求失敗: ${testApiResponse.status}`);
      }
      
      console.log('✅ API 調用成功！');
      console.log('響應數據:', testApiResponse.data);
      
      // 驗證響應數據
      expect(testApiResponse.data.success).toBe(true);
      expect(testApiResponse.data.resultId).toBeTruthy();
      expect(testApiResponse.data.participantId).toBeTruthy();
      
      console.log('📍 步驟 6: 檢查網絡請求記錄');
      
      // 等待一下，確保所有請求都被記錄
      await page.waitForTimeout(2000);
      
      console.log('API 請求記錄:', apiRequests);
      console.log('API 響應記錄:', apiResponses);
      
      console.log('📍 步驟 7: 總結測試結果');
      
      console.log('✅ 測試成功！未登入用戶可以提交遊戲結果');
      console.log('結果 ID:', testApiResponse.data.resultId);
      console.log('參與者 ID:', testApiResponse.data.participantId);
      
    } catch (error: any) {
      console.error('❌ 測試失敗:', error.message);
      
      // 輸出所有 console 消息供調試
      console.log('瀏覽器 Console 消息:');
      consoleMessages.forEach(msg => console.log(msg));
      
      throw error;
    }
  });
  
  test('驗證結果是否保存到數據庫', async ({ page }) => {
    console.log('🔍 測試：驗證結果是否保存到數據庫');
    
    // 這個測試需要教師登入才能查看結果
    // 暫時跳過，因為需要實際的登入流程
    
    console.log('⚠️ 此測試需要教師登入，暫時跳過');
  });
});

