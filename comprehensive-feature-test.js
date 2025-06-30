#!/usr/bin/env node

/**
 * EduCreate 全功能實地測試腳本
 * 使用 Node.js 和 fetch API 測試所有功能
 */

const https = require('https');
const fs = require('fs');

console.log('🧪 開始 EduCreate 全功能實地測試...\n');

const BASE_URL = 'https://edu-create.vercel.app';
const testResults = [];

// 測試結果記錄函數
function logTest(testName, status, details = '') {
  const result = {
    test: testName,
    status: status,
    details: details,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}: ${status}`);
  if (details) console.log(`   ${details}`);
}

// HTTP 請求函數
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// 測試 1: 主網站基礎功能
async function testMainWebsite() {
  console.log('\n📋 測試 1: 主網站基礎功能');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.statusCode === 200) {
      const hasTitle = response.body.includes('EduCreate');
      const hasFeatures = response.body.includes('AI 內容生成');
      const hasTemplates = response.body.includes('30+ 遊戲模板');
      
      if (hasTitle && hasFeatures && hasTemplates) {
        logTest('主網站訪問', 'PASS', '頁面正常加載，包含所有新功能');
      } else {
        logTest('主網站訪問', 'WARN', '頁面加載但缺少部分功能展示');
      }
    } else {
      logTest('主網站訪問', 'FAIL', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('主網站訪問', 'FAIL', error.message);
  }
}

// 測試 2: AI 功能頁面
async function testAIFeatures() {
  console.log('\n🤖 測試 2: AI 功能系統');
  
  try {
    const response = await makeRequest(`${BASE_URL}/ai-features`);
    
    if (response.statusCode === 200) {
      const hasAIForm = response.body.includes('學習主題');
      const hasGeneration = response.body.includes('AI 生成');
      const hasDifficulty = response.body.includes('難度等級');
      
      if (hasAIForm && hasGeneration && hasDifficulty) {
        logTest('AI 功能頁面', 'PASS', 'AI 功能界面完整');
      } else {
        logTest('AI 功能頁面', 'WARN', '頁面存在但功能不完整');
      }
    } else if (response.statusCode === 404) {
      logTest('AI 功能頁面', 'FAIL', '頁面不存在 (404)');
    } else {
      logTest('AI 功能頁面', 'FAIL', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('AI 功能頁面', 'FAIL', error.message);
  }
}

// 測試 3: 記憶增強系統
async function testMemoryEnhancement() {
  console.log('\n🧠 測試 3: 記憶增強系統');
  
  try {
    const response = await makeRequest(`${BASE_URL}/memory-enhancement`);
    
    if (response.statusCode === 200) {
      const hasAnalysis = response.body.includes('學習分析');
      const hasRecommendations = response.body.includes('推薦練習');
      const hasProgress = response.body.includes('學習目標');
      
      if (hasAnalysis && hasRecommendations && hasProgress) {
        logTest('記憶增強頁面', 'PASS', '記憶增強功能完整');
      } else {
        logTest('記憶增強頁面', 'WARN', '頁面存在但功能不完整');
      }
    } else if (response.statusCode === 404) {
      logTest('記憶增強頁面', 'FAIL', '頁面不存在 (404)');
    } else {
      logTest('記憶增強頁面', 'FAIL', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('記憶增強頁面', 'FAIL', error.message);
  }
}

// 測試 4: 統一內容管理器
async function testUnifiedContentManager() {
  console.log('\n📊 測試 4: 統一內容管理器');
  
  try {
    // 測試新的路由
    const response1 = await makeRequest(`${BASE_URL}/unified-content-manager`);
    
    if (response1.statusCode === 200) {
      logTest('統一內容管理器 (新路由)', 'PASS', '路由修復成功');
    } else {
      logTest('統一內容管理器 (新路由)', 'FAIL', `HTTP ${response1.statusCode}`);
    }
    
    // 測試原始 HTML 文件
    const response2 = await makeRequest(`${BASE_URL}/unified-content-manager.html`);
    
    if (response2.statusCode === 200) {
      const hasContentManager = response2.body.includes('統一內容管理');
      const hasGameSwitcher = response2.body.includes('遊戲選擇');
      
      if (hasContentManager && hasGameSwitcher) {
        logTest('統一內容管理器 (HTML)', 'PASS', '內容管理功能完整');
      } else {
        logTest('統一內容管理器 (HTML)', 'WARN', '文件存在但功能不完整');
      }
    } else {
      logTest('統一內容管理器 (HTML)', 'FAIL', `HTTP ${response2.statusCode}`);
    }
  } catch (error) {
    logTest('統一內容管理器', 'FAIL', error.message);
  }
}

// 測試 5: API 端點
async function testAPIEndpoints() {
  console.log('\n🔗 測試 5: API 端點');
  
  // 測試健康檢查
  try {
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    
    if (healthResponse.statusCode === 200) {
      const healthData = JSON.parse(healthResponse.body);
      if (healthData.status === 'ok') {
        logTest('API 健康檢查', 'PASS', `環境: ${healthData.environment}`);
      } else {
        logTest('API 健康檢查', 'WARN', 'API 響應但狀態異常');
      }
    } else {
      logTest('API 健康檢查', 'FAIL', `HTTP ${healthResponse.statusCode}`);
    }
  } catch (error) {
    logTest('API 健康檢查', 'FAIL', error.message);
  }
  
  // 測試 AI 生成 API (需要認證，預期 401)
  try {
    const aiResponse = await makeRequest(`${BASE_URL}/api/ai/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: '測試主題',
        difficulty: 'medium',
        gameType: 'quiz',
        itemCount: 5
      })
    });
    
    if (aiResponse.statusCode === 401) {
      logTest('AI 生成 API', 'PASS', 'API 存在且正確要求認證');
    } else if (aiResponse.statusCode === 200) {
      logTest('AI 生成 API', 'PASS', 'API 正常響應');
    } else {
      logTest('AI 生成 API', 'WARN', `意外狀態碼: ${aiResponse.statusCode}`);
    }
  } catch (error) {
    logTest('AI 生成 API', 'FAIL', error.message);
  }
  
  // 測試記憶分析 API (需要認證，預期 401)
  try {
    const memoryResponse = await makeRequest(`${BASE_URL}/api/memory/analysis`);
    
    if (memoryResponse.statusCode === 401) {
      logTest('記憶分析 API', 'PASS', 'API 存在且正確要求認證');
    } else if (memoryResponse.statusCode === 200) {
      logTest('記憶分析 API', 'PASS', 'API 正常響應');
    } else {
      logTest('記憶分析 API', 'WARN', `意外狀態碼: ${memoryResponse.statusCode}`);
    }
  } catch (error) {
    logTest('記憶分析 API', 'FAIL', error.message);
  }
}

// 測試 6: 遊戲模板數量
async function testGameTemplates() {
  console.log('\n🎮 測試 6: 遊戲模板系統');
  
  try {
    const response = await makeRequest(`${BASE_URL}/templates`);
    
    if (response.statusCode === 200) {
      // 檢查是否包含各種遊戲模板
      const templates = [
        'Quiz', 'Matching', 'Flashcard', 'Hangman', 'Whack-a-Mole',
        'Memory', 'Crossword', 'Anagram', 'Image Quiz', 'True or False'
      ];
      
      let foundTemplates = 0;
      templates.forEach(template => {
        if (response.body.includes(template)) {
          foundTemplates++;
        }
      });
      
      if (foundTemplates >= 8) {
        logTest('遊戲模板系統', 'PASS', `發現 ${foundTemplates}+ 個模板`);
      } else {
        logTest('遊戲模板系統', 'WARN', `只發現 ${foundTemplates} 個模板`);
      }
    } else {
      logTest('遊戲模板系統', 'FAIL', `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('遊戲模板系統', 'FAIL', error.message);
  }
}

// 測試 7: 導航和路由
async function testNavigation() {
  console.log('\n🧭 測試 7: 導航和路由');
  
  const routes = [
    { path: '/dashboard', name: '用戶儀表板' },
    { path: '/create', name: '創建活動' },
    { path: '/login', name: '登入頁面' },
    { path: '/register', name: '註冊頁面' }
  ];
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route.path}`);
      
      if (response.statusCode === 200) {
        logTest(`路由: ${route.name}`, 'PASS', '頁面正常訪問');
      } else if (response.statusCode === 302 || response.statusCode === 307) {
        logTest(`路由: ${route.name}`, 'PASS', '正確重定向 (需要認證)');
      } else {
        logTest(`路由: ${route.name}`, 'FAIL', `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      logTest(`路由: ${route.name}`, 'FAIL', error.message);
    }
  }
}

// 生成測試報告
function generateReport() {
  console.log('\n📊 測試報告生成中...');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  const warnTests = testResults.filter(r => r.status === 'WARN').length;
  
  const report = {
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      warnings: warnTests,
      successRate: Math.round((passedTests / totalTests) * 100)
    },
    details: testResults,
    timestamp: new Date().toISOString()
  };
  
  // 保存詳細報告
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎉 測試完成！');
  console.log('==========================================');
  console.log(`📊 總測試數: ${totalTests}`);
  console.log(`✅ 通過: ${passedTests}`);
  console.log(`❌ 失敗: ${failedTests}`);
  console.log(`⚠️ 警告: ${warnTests}`);
  console.log(`🎯 成功率: ${report.summary.successRate}%`);
  console.log('==========================================');
  
  if (report.summary.successRate >= 80) {
    console.log('🎉 系統整體狀態: 優秀');
  } else if (report.summary.successRate >= 60) {
    console.log('⚠️ 系統整體狀態: 良好');
  } else {
    console.log('❌ 系統整體狀態: 需要改進');
  }
  
  console.log('\n📝 詳細報告已保存到: test-report.json');
}

// 主測試函數
async function runAllTests() {
  try {
    await testMainWebsite();
    await testAIFeatures();
    await testMemoryEnhancement();
    await testUnifiedContentManager();
    await testAPIEndpoints();
    await testGameTemplates();
    await testNavigation();
    
    generateReport();
  } catch (error) {
    console.error('❌ 測試執行失敗:', error);
  }
}

// 執行測試
runAllTests();
