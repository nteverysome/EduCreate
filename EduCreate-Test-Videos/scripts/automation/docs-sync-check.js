#!/usr/bin/env node
// 文檔同步檢查腳本
// 檢查 DOCUMENTATION-INDEX.md 和 automation/README.md 之間的信息一致性

const fs = require('fs');
const path = require('path');

console.log('🔍 開始文檔同步檢查...');

// 文檔路徑
const docsIndexPath = 'EduCreate-Test-Videos/DOCUMENTATION-INDEX.md';
const automationReadmePath = 'EduCreate-Test-Videos/scripts/automation/README.md';

// 檢查結果
let checkResults = {
  mcpToolsCount: { status: 'unknown', details: {} },
  sentryMcpCommands: { status: 'unknown', details: {} },
  lastUpdated: { status: 'unknown', details: {} },
  overallStatus: 'unknown'
};

try {
  // 讀取文檔內容
  console.log('📖 讀取文檔內容...');
  const docsIndexContent = fs.readFileSync(docsIndexPath, 'utf8');
  const automationReadmeContent = fs.readFileSync(automationReadmePath, 'utf8');

  // 檢查 1: MCP 工具數量一致性
  console.log('🔧 檢查 MCP 工具數量一致性...');
  
  // 從 DOCUMENTATION-INDEX.md 提取 MCP 工具數量
  const docsIndexMcpMatch = docsIndexContent.match(/(\d+)個 MCP 工具自動協調/);
  const docsIndexMcpCount = docsIndexMcpMatch ? parseInt(docsIndexMcpMatch[1]) : null;
  
  // 從 automation/README.md 提取 MCP 工具數量（只計算 MCP 工具部分）
  const mcpSectionMatch = automationReadmeContent.match(/#### 自動使用的 (\d+) 個 MCP 工具/);
  const automationMcpCount = mcpSectionMatch ? parseInt(mcpSectionMatch[1]) : null;
  
  checkResults.mcpToolsCount.details = {
    docsIndex: docsIndexMcpCount,
    automation: automationMcpCount,
    match: docsIndexMcpCount === automationMcpCount
  };
  
  if (docsIndexMcpCount === automationMcpCount) {
    checkResults.mcpToolsCount.status = 'pass';
    console.log(`✅ MCP 工具數量一致: ${docsIndexMcpCount} 個`);
  } else {
    checkResults.mcpToolsCount.status = 'fail';
    console.log(`❌ MCP 工具數量不一致: DOCUMENTATION-INDEX.md (${docsIndexMcpCount}) vs automation/README.md (${automationMcpCount})`);
  }

  // 檢查 2: Sentry MCP 命令一致性
  console.log('🚨 檢查 Sentry MCP 命令一致性...');
  
  // 從兩個文檔中提取 Sentry 相關命令
  const sentryCommandPattern = /npm run sentry:(\w+)/g;
  const docsIndexSentryCommands = [...docsIndexContent.matchAll(sentryCommandPattern)].map(match => match[1]);
  const automationSentryCommands = [...automationReadmeContent.matchAll(sentryCommandPattern)].map(match => match[1]);
  
  // 去重並排序
  const uniqueDocsCommands = [...new Set(docsIndexSentryCommands)].sort();
  const uniqueAutomationCommands = [...new Set(automationSentryCommands)].sort();
  
  checkResults.sentryMcpCommands.details = {
    docsIndex: uniqueDocsCommands,
    automation: uniqueAutomationCommands,
    match: JSON.stringify(uniqueDocsCommands) === JSON.stringify(uniqueAutomationCommands)
  };
  
  if (JSON.stringify(uniqueDocsCommands) === JSON.stringify(uniqueAutomationCommands)) {
    checkResults.sentryMcpCommands.status = 'pass';
    console.log(`✅ Sentry MCP 命令一致: ${uniqueDocsCommands.join(', ')}`);
  } else {
    checkResults.sentryMcpCommands.status = 'fail';
    console.log(`❌ Sentry MCP 命令不一致:`);
    console.log(`   DOCUMENTATION-INDEX.md: ${uniqueDocsCommands.join(', ')}`);
    console.log(`   automation/README.md: ${uniqueAutomationCommands.join(', ')}`);
  }

  // 檢查 3: 最後更新時間一致性
  console.log('📅 檢查最後更新時間一致性...');
  
  const updatePattern = /最後更新:\s*(\d{4}-\d{2}-\d{2})/;
  const docsIndexUpdate = docsIndexContent.match(updatePattern);
  const automationUpdate = automationReadmeContent.match(updatePattern);
  
  const docsIndexDate = docsIndexUpdate ? docsIndexUpdate[1] : null;
  const automationDate = automationUpdate ? automationUpdate[1] : null;
  
  checkResults.lastUpdated.details = {
    docsIndex: docsIndexDate,
    automation: automationDate,
    match: docsIndexDate === automationDate
  };
  
  if (docsIndexDate === automationDate) {
    checkResults.lastUpdated.status = 'pass';
    console.log(`✅ 最後更新時間一致: ${docsIndexDate}`);
  } else {
    checkResults.lastUpdated.status = 'fail';
    console.log(`❌ 最後更新時間不一致: DOCUMENTATION-INDEX.md (${docsIndexDate}) vs automation/README.md (${automationDate})`);
  }

  // 計算整體狀態
  const passCount = Object.values(checkResults).filter(result => result.status === 'pass').length;
  const totalChecks = Object.keys(checkResults).length - 1; // 排除 overallStatus
  
  if (passCount === totalChecks) {
    checkResults.overallStatus = 'pass';
    console.log('\n🎉 所有檢查通過！文檔同步狀態良好。');
  } else {
    checkResults.overallStatus = 'fail';
    console.log(`\n⚠️ ${totalChecks - passCount}/${totalChecks} 項檢查失敗，需要修復文檔同步問題。`);
  }

} catch (error) {
  console.error('❌ 文檔同步檢查失敗:', error.message);
  checkResults.overallStatus = 'error';
}

// 生成檢查報告
console.log('\n📊 生成檢查報告...');
const reportPath = 'EduCreate-Test-Videos/reports/docs-sync-check-report.json';

// 確保報告目錄存在
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// 生成詳細報告
const report = {
  timestamp: new Date().toISOString(),
  checkResults: checkResults,
  recommendations: []
};

// 添加修復建議
if (checkResults.mcpToolsCount.status === 'fail') {
  report.recommendations.push({
    issue: 'MCP 工具數量不一致',
    action: '更新 DOCUMENTATION-INDEX.md 中的 MCP 工具數量',
    priority: 'high'
  });
}

if (checkResults.sentryMcpCommands.status === 'fail') {
  report.recommendations.push({
    issue: 'Sentry MCP 命令不一致',
    action: '同步兩個文檔中的 Sentry MCP 命令列表',
    priority: 'medium'
  });
}

if (checkResults.lastUpdated.status === 'fail') {
  report.recommendations.push({
    issue: '最後更新時間不一致',
    action: '同步兩個文檔的最後更新時間',
    priority: 'low'
  });
}

// 保存報告
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`✅ 檢查報告已保存: ${reportPath}`);

// 顯示建議
if (report.recommendations.length > 0) {
  console.log('\n🔧 修復建議:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
    console.log(`   建議: ${rec.action}`);
  });
}

// 返回適當的退出碼
process.exit(checkResults.overallStatus === 'pass' ? 0 : 1);
