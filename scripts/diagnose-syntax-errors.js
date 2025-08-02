/**
 * TypeScript 語法錯誤診斷工具
 * 快速識別和分類語法錯誤，提供修復建議
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 錯誤模式分析
const errorPatterns = [
  {
    pattern: /Expected '=>', got '\{'/,
    type: 'MISSING_ARROW_FUNCTION',
    description: '缺少箭頭函數 => 符號',
    autoFixable: true,
    priority: 'HIGH'
  },
  {
    pattern: /Module not found: Can't resolve/,
    type: 'MODULE_NOT_FOUND',
    description: '模組路徑錯誤',
    autoFixable: false,
    priority: 'MEDIUM'
  },
  {
    pattern: /Property '.*' does not exist on type/,
    type: 'TYPE_ERROR',
    description: 'TypeScript 類型錯誤',
    autoFixable: false,
    priority: 'LOW'
  },
  {
    pattern: /Syntax Error/,
    type: 'SYNTAX_ERROR',
    description: '一般語法錯誤',
    autoFixable: false,
    priority: 'HIGH'
  }
];

// 診斷配置
const config = {
  buildCommand: 'npm run build',
  outputFile: './diagnosis-report.json',
  htmlReport: './diagnosis-report.html'
};

// 執行診斷
function runDiagnosis() {
  console.log('🔍 開始 TypeScript 語法錯誤診斷...');
  
  try {
    // 嘗試編譯
    execSync(config.buildCommand, { 
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120000 
    });
    
    console.log('✅ 編譯成功，沒有發現語法錯誤！');
    return { success: true, errors: [] };
    
  } catch (error) {
    const output = error.stdout + error.stderr;
    return analyzeErrors(output);
  }
}

// 分析錯誤
function analyzeErrors(buildOutput) {
  console.log('📋 分析編譯錯誤...');
  
  const lines = buildOutput.split('\n');
  const errors = [];
  let currentError = null;
  
  lines.forEach((line, index) => {
    // 檢測錯誤開始
    if (line.includes('Error:') || line.includes('Failed to compile')) {
      if (currentError) {
        errors.push(currentError);
      }
      currentError = {
        line: index + 1,
        message: line.trim(),
        file: null,
        type: 'UNKNOWN',
        description: '未知錯誤',
        autoFixable: false,
        priority: 'MEDIUM',
        context: []
      };
    }
    
    // 檢測文件路徑
    if (currentError && line.includes('./')) {
      const fileMatch = line.match(/\.\/[^\s]+\.(tsx?|jsx?)/);
      if (fileMatch) {
        currentError.file = fileMatch[0];
      }
    }
    
    // 分析錯誤類型
    if (currentError) {
      errorPatterns.forEach(pattern => {
        if (pattern.pattern.test(line)) {
          currentError.type = pattern.type;
          currentError.description = pattern.description;
          currentError.autoFixable = pattern.autoFixable;
          currentError.priority = pattern.priority;
        }
      });
      
      // 添加上下文
      currentError.context.push(line.trim());
    }
  });
  
  // 添加最後一個錯誤
  if (currentError) {
    errors.push(currentError);
  }
  
  return { success: false, errors };
}

// 生成統計報告
function generateStatistics(errors) {
  const stats = {
    total: errors.length,
    byType: {},
    byPriority: {},
    autoFixable: 0,
    files: new Set()
  };
  
  errors.forEach(error => {
    // 按類型統計
    stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    
    // 按優先級統計
    stats.byPriority[error.priority] = (stats.byPriority[error.priority] || 0) + 1;
    
    // 可自動修復統計
    if (error.autoFixable) {
      stats.autoFixable++;
    }
    
    // 文件統計
    if (error.file) {
      stats.files.add(error.file);
    }
  });
  
  stats.affectedFiles = stats.files.size;
  return stats;
}

// 生成修復建議
function generateFixSuggestions(errors) {
  const suggestions = [];
  
  // 按類型分組錯誤
  const errorsByType = {};
  errors.forEach(error => {
    if (!errorsByType[error.type]) {
      errorsByType[error.type] = [];
    }
    errorsByType[error.type].push(error);
  });
  
  // 為每種錯誤類型生成建議
  Object.entries(errorsByType).forEach(([type, typeErrors]) => {
    switch (type) {
      case 'MISSING_ARROW_FUNCTION':
        suggestions.push({
          type,
          priority: 'HIGH',
          action: 'RUN_AUTO_FIX_SCRIPT',
          description: `運行自動修復腳本: node scripts/fix-arrow-functions.js`,
          affectedFiles: typeErrors.length,
          estimatedTime: '2-5 分鐘'
        });
        break;
        
      case 'MODULE_NOT_FOUND':
        suggestions.push({
          type,
          priority: 'MEDIUM',
          action: 'MANUAL_FIX_IMPORTS',
          description: '手動檢查和修復模組導入路徑',
          affectedFiles: typeErrors.length,
          estimatedTime: '10-30 分鐘'
        });
        break;
        
      default:
        suggestions.push({
          type,
          priority: 'LOW',
          action: 'MANUAL_REVIEW',
          description: '需要手動檢查和修復',
          affectedFiles: typeErrors.length,
          estimatedTime: '未知'
        });
    }
  });
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// 生成 HTML 報告
function generateHtmlReport(diagnosis) {
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduCreate 語法錯誤診斷報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .error-high { border-left: 4px solid #ff4444; }
        .error-medium { border-left: 4px solid #ffaa00; }
        .error-low { border-left: 4px solid #44ff44; }
        .suggestion { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .code { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 EduCreate 語法錯誤診斷報告</h1>
        <p>生成時間: ${new Date().toLocaleString('zh-TW')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>總錯誤數</h3>
            <div style="font-size: 2em; color: #ff4444;">${diagnosis.statistics.total}</div>
        </div>
        <div class="stat-card">
            <h3>可自動修復</h3>
            <div style="font-size: 2em; color: #44ff44;">${diagnosis.statistics.autoFixable}</div>
        </div>
        <div class="stat-card">
            <h3>受影響文件</h3>
            <div style="font-size: 2em; color: #ffaa00;">${diagnosis.statistics.affectedFiles}</div>
        </div>
    </div>
    
    <h2>🚀 修復建議</h2>
    ${diagnosis.suggestions.map(suggestion => `
        <div class="suggestion error-${suggestion.priority.toLowerCase()}">
            <h3>${suggestion.type}</h3>
            <p><strong>動作:</strong> ${suggestion.description}</p>
            <p><strong>影響文件:</strong> ${suggestion.affectedFiles} 個</p>
            <p><strong>預估時間:</strong> ${suggestion.estimatedTime}</p>
        </div>
    `).join('')}
    
    <h2>📋 錯誤詳情</h2>
    ${diagnosis.errors.map(error => `
        <div class="suggestion error-${error.priority.toLowerCase()}">
            <h4>${error.type} - ${error.description}</h4>
            <p><strong>文件:</strong> ${error.file || '未知'}</p>
            <p><strong>可自動修復:</strong> ${error.autoFixable ? '是' : '否'}</p>
            <div class="code">${error.context.slice(0, 3).join('<br>')}</div>
        </div>
    `).join('')}
</body>
</html>`;
  
  return html;
}

// 主函數
function main() {
  console.log('🚀 開始 EduCreate 語法錯誤診斷...');
  
  const diagnosis = runDiagnosis();
  
  if (diagnosis.success) {
    console.log('🎉 恭喜！沒有發現語法錯誤。');
    return;
  }
  
  // 生成統計和建議
  diagnosis.statistics = generateStatistics(diagnosis.errors);
  diagnosis.suggestions = generateFixSuggestions(diagnosis.errors);
  
  // 輸出控制台報告
  console.log('\n📊 診斷結果統計:');
  console.log(`❌ 總錯誤數: ${diagnosis.statistics.total}`);
  console.log(`🔧 可自動修復: ${diagnosis.statistics.autoFixable}`);
  console.log(`📁 受影響文件: ${diagnosis.statistics.affectedFiles}`);
  
  console.log('\n🎯 錯誤類型分布:');
  Object.entries(diagnosis.statistics.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} 個`);
  });
  
  console.log('\n🚀 修復建議 (按優先級排序):');
  diagnosis.suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. [${suggestion.priority}] ${suggestion.description}`);
    console.log(`   影響 ${suggestion.affectedFiles} 個文件，預估 ${suggestion.estimatedTime}`);
  });
  
  // 保存 JSON 報告
  fs.writeFileSync(config.outputFile, JSON.stringify(diagnosis, null, 2));
  console.log(`\n💾 詳細報告已保存: ${config.outputFile}`);
  
  // 生成 HTML 報告
  const htmlReport = generateHtmlReport(diagnosis);
  fs.writeFileSync(config.htmlReport, htmlReport);
  console.log(`📄 HTML 報告已生成: ${config.htmlReport}`);
  
  console.log('\n🎉 診斷完成！');
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = { main, runDiagnosis, analyzeErrors };
