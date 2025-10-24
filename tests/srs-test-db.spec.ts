import { test, expect } from '@playwright/test';

/**
 * SRS 資料庫測試端點自動化測試
 * 
 * 測試目標:
 * 1. 登入 EduCreate
 * 2. 訪問 /api/srs/test-db 端點
 * 3. 獲取並分析測試結果
 * 4. 保存結果到文件
 */

test.describe('SRS Database Test Endpoint', () => {
  test('should test SRS database connection and operations', async ({ page }) => {
    console.log('🚀 開始 SRS 資料庫測試...\n');

    // 1. 訪問首頁
    console.log('📍 步驟 1: 訪問首頁');
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    console.log('✅ 首頁載入完成\n');

    // 2. 檢查是否已登入
    console.log('📍 步驟 2: 檢查登入狀態');
    const isLoggedIn = await page.locator('text=登出').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('⚠️  未登入,嘗試登入...');
      
      // 尋找登入按鈕
      const loginButton = page.locator('text=登入').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 已點擊登入按鈕\n');
      }
    } else {
      console.log('✅ 已登入\n');
    }

    // 3. 訪問測試端點
    console.log('📍 步驟 3: 訪問測試端點');
    const testUrl = 'https://edu-create.vercel.app/api/srs/test-db';
    console.log(`   URL: ${testUrl}`);
    
    const response = await page.goto(testUrl);
    console.log(`   HTTP 狀態碼: ${response?.status()}\n`);

    // 4. 獲取回應內容
    console.log('📍 步驟 4: 獲取回應內容');
    const content = await page.content();
    
    // 嘗試解析 JSON
    let testResults: any = null;
    try {
      // 從 <pre> 標籤中提取 JSON (瀏覽器可能會格式化 JSON)
      const preContent = await page.locator('pre').textContent().catch(() => null);
      if (preContent) {
        testResults = JSON.parse(preContent);
      } else {
        // 嘗試從 body 中提取
        const bodyContent = await page.locator('body').textContent();
        testResults = JSON.parse(bodyContent);
      }
      
      console.log('✅ 成功解析 JSON 回應\n');
    } catch (error) {
      console.error('❌ 無法解析 JSON:', error);
      console.log('原始內容:', content.substring(0, 500));
    }

    // 5. 分析測試結果
    if (testResults) {
      console.log('📊 測試結果分析:\n');
      console.log('=' .repeat(60));
      
      // 顯示時間戳
      if (testResults.timestamp) {
        console.log(`⏰ 測試時間: ${testResults.timestamp}`);
      }
      
      // 顯示摘要
      if (testResults.summary) {
        console.log(`\n📋 測試摘要:`);
        console.log(`   總測試數: ${testResults.summary.totalTests}`);
        console.log(`   通過測試: ${testResults.summary.passedTests}`);
        console.log(`   全部通過: ${testResults.summary.allTestsPassed ? '✅ 是' : '❌ 否'}`);
      }
      
      // 顯示各項測試結果
      if (testResults.tests) {
        console.log(`\n🔍 詳細測試結果:`);
        console.log('=' .repeat(60));
        
        for (const [testName, result] of Object.entries(testResults.tests)) {
          const testResult = result as any;
          const icon = testResult.success ? '✅' : '❌';
          console.log(`\n${icon} ${testName}`);
          
          if (testResult.success) {
            // 顯示成功的詳細信息
            if (testName === 'authentication' && testResult.userId) {
              console.log(`   用戶 ID: ${testResult.userId}`);
              console.log(`   用戶郵箱: ${testResult.userEmail}`);
            } else if (testName === 'userExists' && testResult.user) {
              console.log(`   用戶: ${JSON.stringify(testResult.user)}`);
            } else if (testName === 'ttsCacheQuery' && testResult.elementaryCount !== undefined) {
              console.log(`   ELEMENTARY 單字數: ${testResult.elementaryCount}`);
            } else if (testName === 'userWordProgressQuery' && testResult.count !== undefined) {
              console.log(`   學習進度記錄數: ${testResult.count}`);
            } else if (testName === 'getWordsToReview') {
              console.log(`   獲取單字數: ${testResult.wordsCount}`);
              console.log(`   新單字數: ${testResult.newWordsCount}`);
              console.log(`   複習單字數: ${testResult.reviewWordsCount}`);
            }
          } else {
            // 顯示失敗的錯誤信息
            if (testResult.error) {
              console.log(`   ❌ 錯誤: ${testResult.error}`);
            }
            if (testResult.stack) {
              console.log(`   堆疊追蹤: ${testResult.stack.substring(0, 200)}...`);
            }
          }
        }
      }
      
      // 顯示錯誤信息
      if (testResults.error) {
        console.log(`\n❌ 整體錯誤: ${testResults.error}`);
        if (testResults.details) {
          console.log(`   詳情: ${testResults.details}`);
        }
      }
      
      console.log('\n' + '='.repeat(60));
      
      // 6. 保存結果到文件
      const fs = require('fs');
      const resultsPath = 'test-results/srs-test-db-results.json';
      fs.mkdirSync('test-results', { recursive: true });
      fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
      console.log(`\n💾 測試結果已保存到: ${resultsPath}`);
      
      // 7. 生成 Markdown 報告
      const reportPath = 'test-results/srs-test-db-report.md';
      const report = generateMarkdownReport(testResults);
      fs.writeFileSync(reportPath, report);
      console.log(`📄 測試報告已保存到: ${reportPath}\n`);
      
      // 8. 驗證測試結果
      if (testResults.summary) {
        expect(testResults.summary.allTestsPassed).toBe(true);
      }
    } else {
      console.error('❌ 無法獲取測試結果');
      throw new Error('Failed to get test results');
    }
  });
});

/**
 * 生成 Markdown 報告
 */
function generateMarkdownReport(results: any): string {
  const lines: string[] = [];
  
  lines.push('# SRS 資料庫測試報告');
  lines.push('');
  lines.push(`**測試時間**: ${results.timestamp || 'N/A'}`);
  lines.push('');
  
  if (results.summary) {
    lines.push('## 測試摘要');
    lines.push('');
    lines.push(`- **總測試數**: ${results.summary.totalTests}`);
    lines.push(`- **通過測試**: ${results.summary.passedTests}`);
    lines.push(`- **全部通過**: ${results.summary.allTestsPassed ? '✅ 是' : '❌ 否'}`);
    lines.push('');
  }
  
  if (results.tests) {
    lines.push('## 詳細測試結果');
    lines.push('');
    
    for (const [testName, result] of Object.entries(results.tests)) {
      const testResult = result as any;
      const icon = testResult.success ? '✅' : '❌';
      
      lines.push(`### ${icon} ${testName}`);
      lines.push('');
      
      if (testResult.success) {
        lines.push('**狀態**: 通過');
        lines.push('');
        
        // 添加詳細信息
        if (testName === 'authentication') {
          lines.push(`- 用戶 ID: \`${testResult.userId}\``);
          lines.push(`- 用戶郵箱: \`${testResult.userEmail}\``);
        } else if (testName === 'ttsCacheQuery') {
          lines.push(`- ELEMENTARY 單字數: ${testResult.elementaryCount}`);
        } else if (testName === 'getWordsToReview') {
          lines.push(`- 獲取單字數: ${testResult.wordsCount}`);
          lines.push(`- 新單字數: ${testResult.newWordsCount}`);
          lines.push(`- 複習單字數: ${testResult.reviewWordsCount}`);
        }
      } else {
        lines.push('**狀態**: 失敗');
        lines.push('');
        lines.push(`**錯誤**: ${testResult.error || 'Unknown error'}`);
      }
      
      lines.push('');
    }
  }
  
  if (results.error) {
    lines.push('## 整體錯誤');
    lines.push('');
    lines.push(`**錯誤**: ${results.error}`);
    if (results.details) {
      lines.push(`**詳情**: ${results.details}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

