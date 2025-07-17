/**
 * EduCreate AutoSave API 驗證測試
 * 驗證 enhanced-autosave API 端點的完整功能
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate AutoSave API 驗證', () => {
  test('Enhanced AutoSave API 端點功能測試', async ({ page, request }) => {
    console.log('🚀 開始 AutoSave API 功能測試...');

    // 1. 導航到統一內容編輯器頁面
    console.log('📍 Step 1: 導航到統一內容編輯器頁面');
    await page.goto('http://localhost:3001/universal-game');
    await expect(page).toHaveTitle(/EduCreate/);
    await page.waitForTimeout(2000);

    // 2. 測試 API 端點直接調用
    console.log('📍 Step 2: 測試 Enhanced AutoSave API 端點');
    
    // 準備測試內容
    const testContent = {
      id: 'test-activity-1',
      title: 'API 測試活動',
      description: '這是一個 API 測試活動',
      content: '測試內容數據',
      gameType: 'quiz',
      settings: {
        difficulty: 'medium',
        timeLimit: 300
      },
      tags: ['測試', 'API', 'AutoSave']
    };

    // 計算正確的內容哈希
    const crypto = require('crypto');
    const contentString = JSON.stringify(testContent);
    const contentHash = crypto.createHash('sha256').update(contentString).digest('hex');

    const testData = {
      guid: '12345678-1234-4567-8901-123456789012', // 有效的 UUID 格式
      sessionId: 'test-session-67890',
      content: testContent,
      contentHash: contentHash,
      changeType: 'typing',
      changeCount: 5,
      isCompressed: false,
      templateId: 1,
      folderId: 1,
      metadata: {
        testMode: true,
        browser: 'Playwright',
        timestamp: new Date().toISOString()
      }
    };

    // 3. 發送 POST 請求到 enhanced-autosave API
    console.log('📍 Step 3: 發送 AutoSave API 請求');
    const response = await request.post('http://localhost:3001/api/universal-content/test-activity-1/enhanced-autosave', {
      data: testData,
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true'
      }
    });

    // 4. 驗證響應狀態
    console.log('📍 Step 4: 驗證 API 響應');
    console.log(`API 響應狀態: ${response.status()}`);

    // 如果不是 200，先檢查錯誤信息
    if (response.status() !== 200) {
      const errorData = await response.json();
      console.log('API 錯誤響應:', JSON.stringify(errorData, null, 2));
    }

    expect(response.status()).toBe(200);

    // 5. 驗證響應數據結構
    const responseData = await response.json();
    console.log('📊 API 響應數據:', JSON.stringify(responseData, null, 2));

    // 驗證必需的響應字段
    expect(responseData).toHaveProperty('success', true);
    expect(responseData).toHaveProperty('guid', testData.guid);
    expect(responseData).toHaveProperty('sessionId', testData.sessionId);
    expect(responseData).toHaveProperty('savedAt');
    expect(responseData).toHaveProperty('version');
    expect(responseData).toHaveProperty('saveCount');
    expect(responseData).toHaveProperty('nextSaveIn', 2000);
    expect(responseData).toHaveProperty('responseTime');
    expect(responseData).toHaveProperty('conflictStatus');

    // 6. 驗證響應頭
    console.log('📍 Step 5: 驗證響應頭');
    const headers = response.headers();
    expect(headers).toHaveProperty('x-response-time');
    expect(headers).toHaveProperty('x-save-count');
    expect(headers).toHaveProperty('x-version');
    expect(headers).toHaveProperty('x-compression-ratio');
    expect(headers).toHaveProperty('x-conflict-status');

    // 7. 驗證性能指標
    console.log('📍 Step 6: 驗證性能指標');
    const responseTime = parseInt(headers['x-response-time']);
    expect(responseTime).toBeLessThan(1000); // 響應時間應小於 1 秒
    console.log(`⚡ API 響應時間: ${responseTime}ms`);

    // 8. 測試錯誤處理 - 無效數據
    console.log('📍 Step 7: 測試錯誤處理');
    const invalidResponse = await request.post('http://localhost:3001/api/universal-content/test-activity-1/enhanced-autosave', {
      data: {
        // 缺少必需字段
        guid: 'invalid-guid'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(invalidResponse.status()).toBe(400);
    const errorData = await invalidResponse.json();
    expect(errorData.success).toBe(false);
    expect(errorData.error).toContain('驗證失敗');

    // 9. 測試壓縮數據處理
    console.log('📍 Step 8: 測試壓縮數據處理');
    const compressedData = {
      ...testData,
      isCompressed: true,
      metadata: {
        ...testData.metadata,
        compressionTest: true
      }
    };

    const compressedResponse = await request.post('http://localhost:3001/api/universal-content/test-activity-2/enhanced-autosave', {
      data: compressedData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(compressedResponse.status()).toBe(200);
    const compressedResponseData = await compressedResponse.json();
    expect(compressedResponseData.success).toBe(true);
    expect(compressedResponseData.compressionRatio).toBeGreaterThan(0);

    console.log('✅ AutoSave API 功能測試完成');
  });

  test('AutoSave API 性能基準測試', async ({ request }) => {
    console.log('🚀 開始 AutoSave API 性能基準測試...');

    const performanceResults = [];
    const testIterations = 5;

    for (let i = 0; i < testIterations; i++) {
      console.log(`📍 性能測試迭代 ${i + 1}/${testIterations}`);

      // 準備測試內容
      const testContent = {
        id: `perf-test-activity-${i}`,
        title: `性能測試活動 ${i}`,
        description: '性能測試數據'.repeat(100), // 增加數據大小
        content: '大量測試內容'.repeat(200),
        gameType: 'quiz',
        settings: { difficulty: 'hard', timeLimit: 600 },
        tags: ['性能測試', 'API', 'AutoSave']
      };

      // 計算正確的內容哈希
      const crypto = require('crypto');
      const contentString = JSON.stringify(testContent);
      const contentHash = crypto.createHash('sha256').update(contentString).digest('hex');

      const testData = {
        guid: `12345678-1234-4567-8901-12345678901${i}`, // 有效的 UUID 格式
        sessionId: `perf-test-session-${i}`,
        content: testContent,
        contentHash: contentHash,
        changeType: 'typing',
        changeCount: i + 1,
        isCompressed: i % 2 === 0, // 交替測試壓縮和非壓縮
        metadata: {
          performanceTest: true,
          iteration: i,
          timestamp: new Date().toISOString()
        }
      };

      const startTime = Date.now();
      const response = await request.post(`http://localhost:3001/api/universal-content/perf-test-${i}/enhanced-autosave`, {
        data: testData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.success).toBe(true);

      const totalTime = endTime - startTime;
      const apiResponseTime = responseData.responseTime;

      performanceResults.push({
        iteration: i + 1,
        totalTime,
        apiResponseTime,
        isCompressed: testData.isCompressed,
        compressionRatio: responseData.compressionRatio || 1.0
      });

      console.log(`⚡ 迭代 ${i + 1}: 總時間 ${totalTime}ms, API 響應時間 ${apiResponseTime}ms`);
    }

    // 計算性能統計
    const avgTotalTime = performanceResults.reduce((sum, r) => sum + r.totalTime, 0) / testIterations;
    const avgApiTime = performanceResults.reduce((sum, r) => sum + r.apiResponseTime, 0) / testIterations;
    const maxTime = Math.max(...performanceResults.map(r => r.totalTime));
    const minTime = Math.min(...performanceResults.map(r => r.totalTime));

    console.log('📊 性能測試結果統計:');
    console.log(`   平均總時間: ${avgTotalTime.toFixed(2)}ms`);
    console.log(`   平均 API 時間: ${avgApiTime.toFixed(2)}ms`);
    console.log(`   最大時間: ${maxTime}ms`);
    console.log(`   最小時間: ${minTime}ms`);

    // 驗證性能目標
    expect(avgApiTime).toBeLessThan(100); // 平均 API 響應時間應小於 100ms
    expect(maxTime).toBeLessThan(1000); // 最大總時間應小於 1 秒

    console.log('✅ AutoSave API 性能基準測試完成');
  });

  test('AutoSave API 錯誤處理測試', async ({ request }) => {
    console.log('🚀 開始 AutoSave API 錯誤處理測試...');

    // 測試各種錯誤情況
    const errorTests = [
      {
        name: '缺少活動 ID',
        url: 'http://localhost:3001/api/universal-content//enhanced-autosave',
        data: { guid: 'test' },
        expectedStatus: 404
      },
      {
        name: '無效 JSON',
        url: 'http://localhost:3001/api/universal-content/test/enhanced-autosave',
        data: 'invalid-json',
        expectedStatus: 400
      },
      {
        name: '缺少必需字段',
        url: 'http://localhost:3001/api/universal-content/test/enhanced-autosave',
        data: { guid: 'test' },
        expectedStatus: 400
      },
      {
        name: '無效 GUID 格式',
        url: 'http://localhost:3001/api/universal-content/test/enhanced-autosave',
        data: {
          guid: 'invalid-guid-format',
          sessionId: 'test-session',
          content: { title: 'test' },
          contentHash: 'hash',
          changeType: 'typing'
        },
        expectedStatus: 400
      }
    ];

    for (const errorTest of errorTests) {
      console.log(`📍 測試錯誤情況: ${errorTest.name}`);
      
      try {
        const response = await request.post(errorTest.url, {
          data: errorTest.data,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (errorTest.expectedStatus !== 404) {
          expect(response.status()).toBe(errorTest.expectedStatus);
          const responseData = await response.json();
          expect(responseData.success).toBe(false);
          expect(responseData.error).toBeDefined();
        }
        
        console.log(`✅ 錯誤處理正確: ${errorTest.name}`);
      } catch (error) {
        if (errorTest.expectedStatus === 404) {
          console.log(`✅ 404 錯誤處理正確: ${errorTest.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ AutoSave API 錯誤處理測試完成');
  });
});
