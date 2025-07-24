/**
 * 測試運行腳本
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 提供統一的測試運行和報告生成
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 測試配置
const TEST_CONFIG = {
  unit: {
    name: '單元測試',
    pattern: 'tests/unit/**/*.test.ts',
    timeout: 30000,
    coverage: true
  },
  integration: {
    name: '整合測試',
    pattern: 'tests/integration/**/*.test.ts',
    timeout: 60000,
    coverage: true
  },
  functional: {
    name: '功能測試',
    pattern: 'tests/functional/**/*.test.ts',
    timeout: 45000,
    coverage: false
  },
  performance: {
    name: '性能測試',
    pattern: 'tests/performance/**/*.test.ts',
    timeout: 120000,
    coverage: false
  },
  accessibility: {
    name: '無障礙測試',
    pattern: 'tests/accessibility/**/*.test.ts',
    timeout: 60000,
    coverage: false
  },
  e2e: {
    name: '端到端測試',
    pattern: 'tests/e2e/**/*.test.ts',
    timeout: 180000,
    coverage: false
  }
};

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 執行測試套件
function runTestSuite(suiteName, config) {
  colorLog(`\n🧪 執行 ${config.name}...`, 'cyan');
  
  try {
    const jestArgs = [
      '--config=tests/jest.config.js',
      `--testPathPattern="${config.pattern}"`,
      `--testTimeout=${config.timeout}`,
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ];
    
    if (config.coverage) {
      jestArgs.push('--coverage');
      jestArgs.push(`--coverageDirectory=coverage/${suiteName}`);
    }
    
    const command = `npx jest ${jestArgs.join(' ')}`;
    
    colorLog(`執行命令: ${command}`, 'blue');
    
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    
    colorLog(`✅ ${config.name} 完成`, 'green');
    return true;
    
  } catch (error) {
    colorLog(`❌ ${config.name} 失敗`, 'red');
    console.error(error.message);
    return false;
  }
}

// 生成測試報告
function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(__dirname, 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r).length,
      failed: Object.values(results).filter(r => !r).length
    },
    details: results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  const reportPath = path.join(reportDir, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  colorLog(`\n📊 測試報告已生成: ${reportPath}`, 'magenta');
  
  return report;
}

// 顯示測試摘要
function displaySummary(report) {
  colorLog('\n📋 測試執行摘要', 'bright');
  colorLog('='.repeat(50), 'blue');
  
  colorLog(`總測試套件: ${report.summary.total}`, 'blue');
  colorLog(`通過: ${report.summary.passed}`, 'green');
  colorLog(`失敗: ${report.summary.failed}`, 'red');
  
  const successRate = (report.summary.passed / report.summary.total * 100).toFixed(1);
  colorLog(`成功率: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  colorLog('\n詳細結果:', 'blue');
  Object.entries(report.details).forEach(([suite, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    colorLog(`  ${status} ${TEST_CONFIG[suite].name}`, color);
  });
  
  colorLog(`\n執行時間: ${report.timestamp}`, 'blue');
  colorLog('='.repeat(50), 'blue');
}

// 主執行函數
function main() {
  const args = process.argv.slice(2);
  const suiteToRun = args[0];
  
  colorLog('🚀 AirplaneCollisionGame 測試套件執行器', 'bright');
  colorLog('Task 1.1.4 - 測試用例設計和實現', 'cyan');
  
  if (suiteToRun && TEST_CONFIG[suiteToRun]) {
    // 執行特定測試套件
    colorLog(`\n🎯 執行特定測試套件: ${TEST_CONFIG[suiteToRun].name}`, 'yellow');
    const result = runTestSuite(suiteToRun, TEST_CONFIG[suiteToRun]);
    
    if (result) {
      colorLog('\n🎉 測試執行成功！', 'green');
      process.exit(0);
    } else {
      colorLog('\n💥 測試執行失敗！', 'red');
      process.exit(1);
    }
    
  } else if (suiteToRun === 'all' || !suiteToRun) {
    // 執行所有測試套件
    colorLog('\n🎯 執行所有測試套件', 'yellow');
    
    const results = {};
    let allPassed = true;
    
    for (const [suiteName, config] of Object.entries(TEST_CONFIG)) {
      const result = runTestSuite(suiteName, config);
      results[suiteName] = result;
      
      if (!result) {
        allPassed = false;
      }
    }
    
    // 生成報告
    const report = generateTestReport(results);
    displaySummary(report);
    
    if (allPassed) {
      colorLog('\n🎉 所有測試套件執行成功！', 'green');
      process.exit(0);
    } else {
      colorLog('\n💥 部分測試套件執行失敗！', 'red');
      process.exit(1);
    }
    
  } else {
    // 顯示使用說明
    colorLog('\n❓ 使用說明:', 'yellow');
    colorLog('node run-tests.js [suite]', 'blue');
    colorLog('\n可用的測試套件:', 'blue');
    
    Object.entries(TEST_CONFIG).forEach(([key, config]) => {
      colorLog(`  ${key.padEnd(12)} - ${config.name}`, 'cyan');
    });
    
    colorLog('\n範例:', 'blue');
    colorLog('  node run-tests.js unit        # 執行單元測試', 'cyan');
    colorLog('  node run-tests.js integration # 執行整合測試', 'cyan');
    colorLog('  node run-tests.js all         # 執行所有測試', 'cyan');
    
    process.exit(1);
  }
}

// 錯誤處理
process.on('uncaughtException', (error) => {
  colorLog('\n💥 未捕獲的異常:', 'red');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  colorLog('\n💥 未處理的 Promise 拒絕:', 'red');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  runTestSuite,
  generateTestReport,
  displaySummary,
  TEST_CONFIG
};
