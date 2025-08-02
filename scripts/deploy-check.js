#!/usr/bin/env node

/**
 * EduCreate 部署後檢查腳本
 * 驗證生產環境部署是否成功
 */

const https = require('https');
const http = require('http');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          duration: duration
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('請求超時'));
    });
  });
}

async function checkEndpoint(url, name, expectedStatus = 200) {
  try {
    log(`檢查 ${name}: ${url}`, 'blue');
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      logSuccess(`${name} 正常 (${response.statusCode}, ${response.duration}ms)`);
      return { success: true, duration: response.duration, data: response.data };
    } else {
      logWarning(`${name} 狀態碼異常: ${response.statusCode}`);
      return { success: false, statusCode: response.statusCode, duration: response.duration };
    }
  } catch (error) {
    logError(`${name} 檢查失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkHealthEndpoint(baseUrl) {
  const healthUrl = `${baseUrl}/api/monitoring/health`;
  const result = await checkEndpoint(healthUrl, '健康檢查 API');
  
  if (result.success && result.data) {
    try {
      const healthData = JSON.parse(result.data);
      log('\n📊 系統健康狀況:', 'cyan');
      log(`- 狀態: ${healthData.status}`, healthData.status === 'healthy' ? 'green' : 'yellow');
      log(`- 版本: ${healthData.version}`, 'blue');
      log(`- 運行時間: ${Math.round(healthData.uptime)}秒`, 'blue');
      log(`- 環境: ${healthData.environment}`, 'blue');
      
      if (healthData.services) {
        log('\n🔧 服務狀態:', 'cyan');
        Object.entries(healthData.services).forEach(([service, status]) => {
          const color = status === 'healthy' ? 'green' : status === 'unhealthy' ? 'red' : 'yellow';
          log(`- ${service}: ${status}`, color);
        });
      }
      
      if (healthData.metrics) {
        log('\n📈 系統指標:', 'cyan');
        log(`- 內存使用: ${healthData.metrics.memoryUsage.percentage}%`, 'blue');
        log(`- 響應時間: ${Math.round(healthData.metrics.responseTime)}ms`, 'blue');
        log(`- 錯誤率: ${healthData.metrics.errorRate.toFixed(2)}%`, 'blue');
      }
      
      return healthData.status === 'healthy' || healthData.status === 'degraded';
    } catch (error) {
      logWarning('健康檢查數據解析失敗');
      return false;
    }
  }
  
  return result.success;
}

async function main() {
  log('\n🔍 EduCreate 部署檢查開始', 'bright');
  log('=====================================', 'cyan');
  
  // 獲取基礎 URL
  const args = process.argv.slice(2);
  let baseUrl = args[0];
  
  if (!baseUrl) {
    // 嘗試本地環境
    baseUrl = 'http://localhost:3000';
    log(`未提供 URL，使用本地環境: ${baseUrl}`, 'yellow');
  }
  
  // 移除末尾的斜杠
  baseUrl = baseUrl.replace(/\/$/, '');
  
  log(`檢查目標: ${baseUrl}`, 'cyan');
  
  const checks = [];
  
  // 基本端點檢查
  const endpoints = [
    { path: '', name: '主頁', expectedStatus: 200 },
    { path: '/dashboards', name: '儀表板中心', expectedStatus: 200 },
    { path: '/analytics-dashboard', name: '學習分析儀表板', expectedStatus: 200 },
    { path: '/admin-dashboard', name: '企業管理儀表板', expectedStatus: 200 },
    { path: '/performance-dashboard', name: '性能監控儀表板', expectedStatus: 200 },
    { path: '/comprehensive-test', name: '綜合測試', expectedStatus: 200 },
    { path: '/api-test', name: 'API 測試', expectedStatus: 200 },
    { path: '/api/monitoring/health', name: '健康檢查 API', expectedStatus: 200 },
    { path: '/api/websocket', name: 'WebSocket API', expectedStatus: 200 },
    { path: '/api/ai/generate', name: 'AI 生成 API', expectedStatus: 405 }, // POST only
  ];
  
  log('\n🌐 檢查主要端點:', 'cyan');
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint.path}`;
    const result = await checkEndpoint(url, endpoint.name, endpoint.expectedStatus);
    checks.push({ ...endpoint, ...result });
    
    // 添加延遲避免過快請求
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 特殊檢查：健康檢查端點
  log('\n🏥 詳細健康檢查:', 'cyan');
  const healthCheck = await checkHealthEndpoint(baseUrl);
  
  // 統計結果
  const successCount = checks.filter(check => check.success).length;
  const totalCount = checks.length;
  const successRate = (successCount / totalCount * 100).toFixed(1);
  
  log('\n📊 檢查結果統計:', 'cyan');
  log(`- 成功: ${successCount}/${totalCount} (${successRate}%)`, 'green');
  log(`- 失敗: ${totalCount - successCount}/${totalCount}`, 'red');
  log(`- 健康檢查: ${healthCheck ? '通過' : '失敗'}`, healthCheck ? 'green' : 'red');
  
  // 失敗的檢查
  const failedChecks = checks.filter(check => !check.success);
  if (failedChecks.length > 0) {
    log('\n❌ 失敗的檢查:', 'red');
    failedChecks.forEach(check => {
      log(`- ${check.name}: ${check.error || check.statusCode}`, 'red');
    });
  }
  
  // 性能統計
  const successfulChecks = checks.filter(check => check.success && check.duration);
  if (successfulChecks.length > 0) {
    const avgDuration = successfulChecks.reduce((sum, check) => sum + check.duration, 0) / successfulChecks.length;
    const maxDuration = Math.max(...successfulChecks.map(check => check.duration));
    const minDuration = Math.min(...successfulChecks.map(check => check.duration));
    
    log('\n⚡ 性能統計:', 'cyan');
    log(`- 平均響應時間: ${Math.round(avgDuration)}ms`, 'blue');
    log(`- 最快響應: ${minDuration}ms`, 'green');
    log(`- 最慢響應: ${maxDuration}ms`, 'yellow');
  }
  
  // 建議
  log('\n💡 建議:', 'cyan');
  if (successRate >= 90) {
    log('- 部署狀態良好，所有主要功能正常', 'green');
  } else if (successRate >= 70) {
    log('- 部署基本成功，但有部分功能需要檢查', 'yellow');
  } else {
    log('- 部署可能有問題，建議檢查配置和日誌', 'red');
  }
  
  if (!healthCheck) {
    log('- 健康檢查失敗，請檢查服務配置', 'yellow');
  }
  
  log('\n🔗 有用的鏈接:', 'cyan');
  log(`- 主應用: ${baseUrl}`, 'blue');
  log(`- 儀表板中心: ${baseUrl}/dashboards`, 'blue');
  log(`- 健康檢查: ${baseUrl}/api/monitoring/health`, 'blue');
  log(`- 綜合測試: ${baseUrl}/comprehensive-test`, 'blue');
  
  log('\n=====================================', 'cyan');
  log('🎉 部署檢查完成！', 'bright');
  
  // 設置退出碼
  const overallSuccess = successRate >= 80 && healthCheck;
  process.exit(overallSuccess ? 0 : 1);
}

// 處理命令行參數
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('EduCreate 部署檢查工具', 'bright');
  log('\n使用方法:', 'cyan');
  log('  node scripts/deploy-check.js [URL]', 'blue');
  log('\n示例:', 'cyan');
  log('  node scripts/deploy-check.js https://your-app.vercel.app', 'blue');
  log('  node scripts/deploy-check.js http://localhost:3000', 'blue');
  log('\n如果不提供 URL，將檢查本地環境 (http://localhost:3000)', 'yellow');
  process.exit(0);
}

// 運行主函數
if (require.main === module) {
  main().catch(error => {
    logError(`檢查腳本錯誤: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, checkEndpoint, checkHealthEndpoint };
