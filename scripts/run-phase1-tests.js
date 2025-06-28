#!/usr/bin/env node

/**
 * 第一階段測試運行腳本
 * 運行所有第一階段相關的測試並生成報告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始運行第一階段測試...\n');

// 測試配置
const testConfig = {
  // 第一階段測試文件模式
  testPattern: '__tests__/phase1/**/*.test.{js,ts,tsx}',
  
  // 覆蓋率配置
  coverageDir: 'coverage/phase1',
  
  // 第一階段相關文件
  collectCoverageFrom: [
    'lib/content/AutoSaveManager.ts',
    'lib/content/ContentValidator.ts',
    'lib/content/TemplateManager.ts',
    'components/content/ActivityManager.tsx',
    'components/content/EnhancedUniversalContentEditor.tsx',
    'pages/api/universal-content/**/autosave.ts',
    'pages/api/universal-content/**/switch-template.ts',
    'pages/api/universal-content/folders.ts'
  ]
};

// 顏色輸出函數
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

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 檢查測試文件是否存在
function checkTestFiles() {
  const testDir = path.join(__dirname, '..', '__tests__', 'phase1');
  
  if (!fs.existsSync(testDir)) {
    colorLog('red', '❌ 測試目錄不存在: __tests__/phase1');
    process.exit(1);
  }

  const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.ts'));
  
  if (testFiles.length === 0) {
    colorLog('red', '❌ 沒有找到測試文件');
    process.exit(1);
  }

  colorLog('green', `✅ 找到 ${testFiles.length} 個測試文件:`);
  testFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log();
}

// 運行測試
function runTests() {
  try {
    colorLog('blue', '📋 運行單元測試...');
    
    const jestCommand = [
      'npx jest',
      `--testPathPattern="${testConfig.testPattern}"`,
      `--collectCoverageFrom="${testConfig.collectCoverageFrom.join(',')}"`,
      `--coverageDirectory="${testConfig.coverageDir}"`,
      '--coverage',
      '--verbose',
      '--passWithNoTests'
    ].join(' ');

    console.log(`執行命令: ${jestCommand}\n`);
    
    const output = execSync(jestCommand, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });

    colorLog('green', '\n✅ 所有測試通過！');
    return true;

  } catch (error) {
    colorLog('red', '\n❌ 測試失敗！');
    console.error(error.message);
    return false;
  }
}

// 生成測試報告
function generateReport() {
  try {
    colorLog('blue', '\n📊 生成測試報告...');

    const coverageFile = path.join(__dirname, '..', testConfig.coverageDir, 'coverage-summary.json');
    
    if (!fs.existsSync(coverageFile)) {
      colorLog('yellow', '⚠️ 覆蓋率報告文件不存在，跳過報告生成');
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    
    // 生成 Markdown 報告
    const reportContent = generateMarkdownReport(coverage);
    const reportFile = path.join(__dirname, '..', 'docs', 'PHASE1_TEST_REPORT.md');
    
    fs.writeFileSync(reportFile, reportContent);
    colorLog('green', `✅ 測試報告已生成: ${reportFile}`);

  } catch (error) {
    colorLog('red', `❌ 生成報告失敗: ${error.message}`);
  }
}

// 生成 Markdown 測試報告
function generateMarkdownReport(coverage) {
  const timestamp = new Date().toISOString();
  const total = coverage.total;

  return `# 第一階段測試報告

## 📊 測試概覽

**生成時間**: ${timestamp}

## 🎯 覆蓋率統計

| 指標 | 覆蓋率 | 通過/總計 |
|------|--------|-----------|
| 語句覆蓋率 | ${total.statements.pct}% | ${total.statements.covered}/${total.statements.total} |
| 分支覆蓋率 | ${total.branches.pct}% | ${total.branches.covered}/${total.branches.total} |
| 函數覆蓋率 | ${total.functions.pct}% | ${total.functions.covered}/${total.functions.total} |
| 行覆蓋率 | ${total.lines.pct}% | ${total.lines.covered}/${total.lines.total} |

## 📁 文件覆蓋率詳情

${Object.entries(coverage)
  .filter(([key]) => key !== 'total')
  .map(([file, data]) => {
    const fileName = file.replace(process.cwd(), '').replace(/\\/g, '/');
    return `### ${fileName}

| 指標 | 覆蓋率 | 通過/總計 |
|------|--------|-----------|
| 語句 | ${data.statements.pct}% | ${data.statements.covered}/${data.statements.total} |
| 分支 | ${data.branches.pct}% | ${data.branches.covered}/${data.branches.total} |
| 函數 | ${data.functions.pct}% | ${data.functions.covered}/${data.functions.total} |
| 行 | ${data.lines.pct}% | ${data.lines.covered}/${data.lines.total} |
`;
  })
  .join('\n')}

## 🧪 測試文件

- \`__tests__/phase1/AutoSaveManager.test.ts\` - 自動保存管理器測試
- \`__tests__/phase1/ContentValidator.test.ts\` - 內容驗證器測試
- \`__tests__/phase1/TemplateManager.test.ts\` - 模板管理器測試
- \`__tests__/phase1/api.test.ts\` - API 端點集成測試

## 🎯 測試覆蓋的功能

### ✅ 自動保存機制
- 實時自動保存觸發
- 離線模式本地存儲
- 網絡狀態監控
- 錯誤恢復和重試
- 資源清理

### ✅ 內容驗證系統
- 基本內容驗證（標題、項目）
- 字符長度限制檢查
- 重複項目檢測
- 遊戲兼容性驗證
- 錯誤消息格式化

### ✅ 模板管理系統
- 模板獲取和推薦
- 視覺樣式管理
- 遊戲選項配置
- 模板配置驗證
- 內容兼容性檢查

### ✅ API 端點
- 自動保存 API
- 模板切換 API
- 文件夾管理 API
- 錯誤處理機制

## 📈 質量指標

${total.statements.pct >= 80 ? '🟢' : total.statements.pct >= 60 ? '🟡' : '🔴'} **整體覆蓋率**: ${total.statements.pct}%

${total.statements.pct >= 80 
  ? '✅ 覆蓋率達到優秀標準 (≥80%)'
  : total.statements.pct >= 60
  ? '⚠️ 覆蓋率達到良好標準 (≥60%)'
  : '❌ 覆蓋率需要改進 (<60%)'
}

## 🚀 下一步

1. 持續提高測試覆蓋率
2. 添加更多邊界情況測試
3. 完善集成測試
4. 添加性能測試

---

*此報告由自動化測試腳本生成*
`;
}

// 主函數
function main() {
  try {
    // 檢查測試文件
    checkTestFiles();

    // 運行測試
    const testsPassed = runTests();

    // 生成報告
    generateReport();

    // 顯示結果
    if (testsPassed) {
      colorLog('green', '\n🎉 第一階段測試全部通過！');
      colorLog('cyan', '📋 查看詳細報告: docs/PHASE1_TEST_REPORT.md');
      colorLog('cyan', '🌐 查看覆蓋率報告: coverage/phase1/lcov-report/index.html');
    } else {
      colorLog('red', '\n💥 測試失敗，請檢查錯誤並修復');
      process.exit(1);
    }

  } catch (error) {
    colorLog('red', `\n💥 測試運行失敗: ${error.message}`);
    process.exit(1);
  }
}

// 運行主函數
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  generateReport,
  generateMarkdownReport
};
