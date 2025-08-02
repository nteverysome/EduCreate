/**
 * 規則4自動檢查器
 * 掃描輸出中的錯誤關鍵詞並提醒執行規則4
 */

const fs = require('fs');
const path = require('path');

class Rule4Checker {
  constructor() {
    this.errorKeywords = [
      'Error:',
      'Failed',
      'timeout',
      'did not find',
      'Test timeout',
      'locator',
      'Exception',
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'AssertionError',
      'TimeoutError'
    ];
    
    this.checkCount = 0;
    this.errorsFound = [];
  }

  /**
   * 檢查文本中是否包含錯誤關鍵詞
   */
  checkForErrors(text) {
    this.checkCount++;
    const foundErrors = [];
    
    for (const keyword of this.errorKeywords) {
      if (text.includes(keyword)) {
        foundErrors.push({
          keyword,
          line: this.extractErrorLine(text, keyword),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (foundErrors.length > 0) {
      this.errorsFound.push(...foundErrors);
      this.triggerRule4(foundErrors);
    }
    
    return foundErrors;
  }

  /**
   * 提取包含錯誤的行
   */
  extractErrorLine(text, keyword) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes(keyword)) {
        return line.trim();
      }
    }
    return '';
  }

  /**
   * 觸發規則4執行提醒
   */
  triggerRule4(errors) {
    console.log('\n🚨 規則4觸發器：檢測到錯誤！');
    console.log('=' .repeat(50));
    
    errors.forEach((error, index) => {
      console.log(`${index + 1}. 錯誤關鍵詞: "${error.keyword}"`);
      console.log(`   錯誤行: ${error.line}`);
      console.log(`   時間: ${error.timestamp}`);
    });
    
    console.log('\n🔧 立即執行規則4：');
    console.log('1. diagnostics [file-paths] - 檢查語法錯誤');
    console.log('2. codebase-retrieval [error-analysis] - 理解代碼結構');
    console.log('3. view [specific-files] - 查看具體文件內容');
    console.log('4. 分析根本原因');
    console.log('5. 實施修復方案');
    console.log('6. 重新測試驗證');
    console.log('=' .repeat(50));
  }

  /**
   * 生成檢查報告
   */
  generateReport() {
    const report = {
      totalChecks: this.checkCount,
      errorsFound: this.errorsFound.length,
      errors: this.errorsFound,
      lastCheck: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, '../reports/rule4-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 規則4檢查報告已生成: ${reportPath}`);
    console.log(`總檢查次數: ${report.totalChecks}`);
    console.log(`發現錯誤數: ${report.errorsFound}`);
    
    return report;
  }

  /**
   * 重置檢查器
   */
  reset() {
    this.checkCount = 0;
    this.errorsFound = [];
    console.log('🔄 規則4檢查器已重置');
  }
}

// 導出檢查器實例
const rule4Checker = new Rule4Checker();

// 如果直接運行此腳本，進行測試
if (require.main === module) {
  console.log('🧪 測試規則4檢查器...');
  
  // 測試正常文本
  rule4Checker.checkForErrors('這是正常的輸出文本');
  
  // 測試錯誤文本
  rule4Checker.checkForErrors(`
    Error: locator.selectOption: Test timeout of 180000ms exceeded.
    Call log:
      - waiting for getByTestId('save-interval-select')
        - did not find some options
  `);
  
  // 生成報告
  rule4Checker.generateReport();
}

module.exports = rule4Checker;
