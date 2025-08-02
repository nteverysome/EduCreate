// scripts/automation/generate-reports.js
const fs = require('fs');
const path = require('path');
const LocalMemoryManager = require('../core/LocalMemoryManager');
const CompressionManager = require('../core/CompressionManager');

class ReportGenerator {
  constructor() {
    this.memoryManager = new LocalMemoryManager();
    this.compressionManager = new CompressionManager();
    this.reportsDir = 'EduCreate-Test-Videos/reports';
    this.metadataDir = 'EduCreate-Test-Videos/metadata';

    this.ensureReportDirectories();
  }

  // 確保報告目錄存在
  ensureReportDirectories() {
    const directories = [
      `${this.reportsDir}/daily`,
      `${this.reportsDir}/weekly`,
      `${this.reportsDir}/monthly`,
      `${this.reportsDir}/dashboard`
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 生成每日報告
  async generateDailyReport(date = null) {
    const reportDate = date || new Date().toISOString().slice(0, 10);
    const reportPath = `${this.reportsDir}/daily/daily-report-${reportDate}.json`;

    console.log(`📊 生成每日報告: ${reportDate}`);

    try {
      // 收集數據
      const testData = await this.collectDailyTestData(reportDate);
      const memoryData = await this.collectMemoryData();
      const compressionData = this.compressionManager.getCompressionStats();
      const systemData = await this.collectSystemData();

      const report = {
        reportType: 'daily',
        reportDate,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTests: testData.totalTests,
          successfulTests: testData.successfulTests,
          failedTests: testData.failedTests,
          successRate: testData.successRate,
          totalProcessingTime: testData.totalProcessingTime,
          averageProcessingTime: testData.averageProcessingTime
        },
        moduleBreakdown: testData.moduleBreakdown,
        compressionStats: {
          totalCompressions: compressionData.totalStats?.totalCompressions || 0,
          spaceSavedMB: compressionData.totalStats?.totalSpaceSavedMB || 0,
          averageCompressionRatio: compressionData.totalStats?.averageCompressionRatio || 0
        },
        memoryInsights: memoryData.insights,
        systemHealth: systemData,
        recommendations: this.generateDailyRecommendations(testData, memoryData, compressionData)
      };

      // 保存報告
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // 生成 Markdown 版本
      const markdownReport = this.generateDailyMarkdown(report);
      const markdownPath = reportPath.replace('.json', '.md');
      fs.writeFileSync(markdownPath, markdownReport);

      console.log(`✅ 每日報告已生成: ${reportPath}`);
      return report;

    } catch (error) {
      console.error('❌ 生成每日報告失敗:', error);
      throw error;
    }
  }

  // 生成每週報告
  async generateWeeklyReport(weekStart = null) {
    const startDate = weekStart || this.getWeekStart();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const reportPath = `${this.reportsDir}/weekly/weekly-report-${startDate.toISOString().slice(0, 10)}.json`;

    console.log(`📊 生成每週報告: ${startDate.toISOString().slice(0, 10)} 到 ${endDate.toISOString().slice(0, 10)}`);

    try {
      // 收集一週的數據
      const weeklyData = await this.collectWeeklyData(startDate, endDate);
      const trendData = await this.analyzeTrends(startDate, endDate);
      const patternData = await this.analyzeWeeklyPatterns();

      const report = {
        reportType: 'weekly',
        weekStart: startDate.toISOString().slice(0, 10),
        weekEnd: endDate.toISOString().slice(0, 10),
        generatedAt: new Date().toISOString(),
        summary: weeklyData.summary,
        dailyBreakdown: weeklyData.dailyBreakdown,
        modulePerformance: weeklyData.modulePerformance,
        trends: trendData,
        patterns: patternData,
        achievements: this.identifyWeeklyAchievements(weeklyData),
        issues: this.identifyWeeklyIssues(weeklyData),
        recommendations: this.generateWeeklyRecommendations(weeklyData, trendData)
      };

      // 保存報告
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // 生成 Markdown 版本
      const markdownReport = this.generateWeeklyMarkdown(report);
      const markdownPath = reportPath.replace('.json', '.md');
      fs.writeFileSync(markdownPath, markdownReport);

      console.log(`✅ 每週報告已生成: ${reportPath}`);
      return report;

    } catch (error) {
      console.error('❌ 生成每週報告失敗:', error);
      throw error;
    }
  }

  // 生成每月報告
  async generateMonthlyReport(year = null, month = null) {
    const now = new Date();
    const reportYear = year || now.getFullYear();
    const reportMonth = month || now.getMonth() + 1;

    const reportPath = `${this.reportsDir}/monthly/monthly-report-${reportYear}-${reportMonth.toString().padStart(2, '0')}.json`;

    console.log(`📊 生成每月報告: ${reportYear}-${reportMonth}`);

    try {
      const monthlyData = await this.collectMonthlyData(reportYear, reportMonth);
      const performanceData = await this.analyzeMonthlyPerformance(reportYear, reportMonth);
      const improvementData = await this.analyzeImprovements(reportYear, reportMonth);

      const report = {
        reportType: 'monthly',
        year: reportYear,
        month: reportMonth,
        generatedAt: new Date().toISOString(),
        summary: monthlyData.summary,
        weeklyBreakdown: monthlyData.weeklyBreakdown,
        moduleAnalysis: monthlyData.moduleAnalysis,
        performance: performanceData,
        improvements: improvementData,
        qualityMetrics: await this.calculateQualityMetrics(reportYear, reportMonth),
        spaceUsage: await this.analyzeSpaceUsage(),
        goals: this.setNextMonthGoals(monthlyData, performanceData)
      };

      // 保存報告
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // 生成 Markdown 版本
      const markdownReport = this.generateMonthlyMarkdown(report);
      const markdownPath = reportPath.replace('.json', '.md');
      fs.writeFileSync(markdownPath, markdownReport);

      console.log(`✅ 每月報告已生成: ${reportPath}`);
      return report;

    } catch (error) {
      console.error('❌ 生成每月報告失敗:', error);
      throw error;
    }
  }

  // 生成實時儀表板數據
  async generateDashboardData() {
    const dashboardPath = `${this.reportsDir}/dashboard/dashboard-data.json`;

    try {
      const currentData = await this.collectCurrentData();
      const recentTrends = await this.getRecentTrends();
      const alerts = await this.checkSystemAlerts();

      const dashboard = {
        lastUpdated: new Date().toISOString(),
        current: currentData,
        trends: recentTrends,
        alerts: alerts,
        quickStats: {
          todayTests: currentData.todayTests,
          weekTests: currentData.weekTests,
          monthTests: currentData.monthTests,
          successRate: currentData.successRate,
          spaceSaved: currentData.spaceSaved,
          activeIssues: alerts.filter(a => a.severity === 'high').length
        }
      };

      fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
      console.log(`✅ 儀表板數據已更新: ${dashboardPath}`);

      return dashboard;

    } catch (error) {
      console.error('❌ 生成儀表板數據失敗:', error);
      throw error;
    }
  }

  // 收集每日測試數據
  async collectDailyTestData(date) {
    const memories = await this.memoryManager.queryMemories({
      dateRange: {
        start: `${date}T00:00:00.000Z`,
        end: `${date}T23:59:59.999Z`
      }
    });

    const totalTests = memories.length;
    const successfulTests = memories.filter(m => m.result === 'success').length;
    const failedTests = totalTests - successfulTests;
    const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;

    // 按模組分組
    const moduleBreakdown = {};
    memories.forEach(memory => {
      if (!moduleBreakdown[memory.module]) {
        moduleBreakdown[memory.module] = { total: 0, success: 0, failure: 0 };
      }
      moduleBreakdown[memory.module].total++;
      if (memory.result === 'success') {
        moduleBreakdown[memory.module].success++;
      } else {
        moduleBreakdown[memory.module].failure++;
      }
    });

    // 計算處理時間（如果有的話）
    const totalProcessingTime = memories.reduce((sum, m) => {
      return sum + (m.performance?.processingTime || 0);
    }, 0);
    const averageProcessingTime = totalTests > 0 ? (totalProcessingTime / totalTests).toFixed(1) : 0;

    return {
      totalTests,
      successfulTests,
      failedTests,
      successRate: parseFloat(successRate),
      moduleBreakdown,
      totalProcessingTime,
      averageProcessingTime: parseFloat(averageProcessingTime)
    };
  }

  // 收集記憶數據
  async collectMemoryData() {
    const videoMemoriesPath = 'EduCreate-Test-Videos/local-memory/video-memories.json';
    const testPatternsPath = 'EduCreate-Test-Videos/local-memory/test-patterns.json';

    let insights = [];

    if (fs.existsSync(videoMemoriesPath)) {
      const videoMemories = JSON.parse(fs.readFileSync(videoMemoriesPath, 'utf8'));
      insights.push(`總共儲存了 ${videoMemories.totalMemories} 個測試記憶`);
      insights.push(`整體成功率為 ${videoMemories.memoryStats.successRate}%`);
    }

    if (fs.existsSync(testPatternsPath)) {
      const testPatterns = JSON.parse(fs.readFileSync(testPatternsPath, 'utf8'));
      const activePatterns = testPatterns.patterns.filter(p => p.status === 'identified').length;
      if (activePatterns > 0) {
        insights.push(`識別出 ${activePatterns} 個需要關注的測試模式`);
      }
    }

    return { insights };
  }

  // 收集系統數據
  async collectSystemData() {
    const currentDir = 'EduCreate-Test-Videos/current';
    const archiveDir = 'EduCreate-Test-Videos/archive';

    let systemHealth = {
      status: 'healthy',
      issues: [],
      metrics: {}
    };

    try {
      // 檢查當前目錄大小
      if (fs.existsSync(currentDir)) {
        const { execSync } = require('child_process');
        const currentSize = execSync(`du -sb "${currentDir}" | cut -f1`).toString().trim();
        const currentSizeMB = parseInt(currentSize) / (1024 * 1024);

        systemHealth.metrics.currentDirectorySizeMB = currentSizeMB;

        if (currentSizeMB > 10000) { // 10GB
          systemHealth.issues.push('當前目錄大小超過 10GB，建議進行歸檔');
          systemHealth.status = 'warning';
        }
      }

      // 檢查歸檔目錄
      if (fs.existsSync(archiveDir)) {
        const archiveVersions = fs.readdirSync(archiveDir).length;
        systemHealth.metrics.archiveVersions = archiveVersions;

        if (archiveVersions > 20) {
          systemHealth.issues.push('歸檔版本過多，建議清理舊版本');
          if (systemHealth.status === 'healthy') {
            systemHealth.status = 'warning';
          }
        }
      }

    } catch (error) {
      systemHealth.status = 'error';
      systemHealth.issues.push(`系統檢查失敗: ${error.message}`);
    }

    return systemHealth;
  }

  // 生成每日建議
  generateDailyRecommendations(testData, memoryData, compressionData) {
    const recommendations = [];

    if (testData.successRate < 80) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: `測試成功率 ${testData.successRate}% 偏低，建議檢查失敗測試並改進`
      });
    }

    if (testData.totalTests === 0) {
      recommendations.push({
        type: 'activity',
        priority: 'medium',
        message: '今日沒有測試活動，建議檢查測試流程是否正常'
      });
    }

    if (compressionData.totalStats?.averageCompressionRatio < 60) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: '壓縮效率可以進一步優化，建議調整壓縮參數'
      });
    }

    return recommendations;
  }

  // 生成每日 Markdown 報告
  generateDailyMarkdown(report) {
    return `# EduCreate 每日測試報告

**報告日期**: ${report.reportDate}
**生成時間**: ${new Date(report.generatedAt).toLocaleString()}

## 📊 今日摘要

- **總測試數**: ${report.summary.totalTests}
- **成功測試**: ${report.summary.successfulTests}
- **失敗測試**: ${report.summary.failedTests}
- **成功率**: ${report.summary.successRate}%
- **平均處理時間**: ${report.summary.averageProcessingTime} 秒

## 🎯 模組表現

${Object.entries(report.moduleBreakdown).map(([module, data]) => `
### ${module} 模組
- 總測試: ${data.total}
- 成功: ${data.success}
- 失敗: ${data.failure}
- 成功率: ${data.total > 0 ? ((data.success / data.total) * 100).toFixed(1) : 0}%
`).join('')}

## 💾 壓縮統計

- **總壓縮次數**: ${report.compressionStats.totalCompressions}
- **節省空間**: ${report.compressionStats.spaceSavedMB} MB
- **平均壓縮率**: ${report.compressionStats.averageCompressionRatio}%

## 🧠 記憶洞察

${report.memoryInsights.map(insight => `- ${insight}`).join('\n')}

## ⚡ 系統健康

**狀態**: ${report.systemHealth.status}

${report.systemHealth.issues.length > 0 ? `
**問題**:
${report.systemHealth.issues.map(issue => `- ${issue}`).join('\n')}
` : '系統運行正常'}

## 💡 建議

${report.recommendations.map(rec => `
### ${rec.type} (優先級: ${rec.priority})
${rec.message}
`).join('')}

---
*此報告由 EduCreate 測試影片管理系統自動生成*
`;
  }

  // 輔助方法
  getWeekStart(date = new Date()) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // 調整為週一開始
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // 其他方法的占位符（由於字數限制，這裡只提供結構）
  async collectWeeklyData(startDate, endDate) {
    // 收集一週的測試數據
    return {
      summary: {},
      dailyBreakdown: {},
      modulePerformance: {}
    };
  }

  async analyzeTrends(startDate, endDate) {
    // 分析趨勢數據
    return {};
  }

  async analyzeWeeklyPatterns() {
    // 分析週模式
    return {};
  }

  identifyWeeklyAchievements(weeklyData) {
    // 識別週成就
    return [];
  }

  identifyWeeklyIssues(weeklyData) {
    // 識別週問題
    return [];
  }

  generateWeeklyRecommendations(weeklyData, trendData) {
    // 生成週建議
    return [];
  }

  generateWeeklyMarkdown(report) {
    // 生成週 Markdown 報告
    return `# EduCreate 每週測試報告\n\n週報告內容...`;
  }

  async collectMonthlyData(year, month) {
    // 收集月度數據
    return {
      summary: {},
      weeklyBreakdown: {},
      moduleAnalysis: {}
    };
  }

  async analyzeMonthlyPerformance(year, month) {
    // 分析月度性能
    return {};
  }

  async analyzeImprovements(year, month) {
    // 分析改進情況
    return {};
  }

  async calculateQualityMetrics(year, month) {
    // 計算質量指標
    return {};
  }

  async analyzeSpaceUsage() {
    // 分析空間使用
    return {};
  }

  setNextMonthGoals(monthlyData, performanceData) {
    // 設定下月目標
    return {};
  }

  generateMonthlyMarkdown(report) {
    // 生成月 Markdown 報告
    return `# EduCreate 每月測試報告\n\n月報告內容...`;
  }

  async collectCurrentData() {
    // 收集當前數據
    return {
      todayTests: 0,
      weekTests: 0,
      monthTests: 0,
      successRate: 0,
      spaceSaved: 0
    };
  }

  async getRecentTrends() {
    // 獲取最近趨勢
    return {};
  }

  async checkSystemAlerts() {
    // 檢查系統警報
    return [];
  }
}

// 主函數
async function main() {
  const generator = new ReportGenerator();
  const reportType = process.argv[2] || 'daily';

  try {
    switch (reportType) {
      case 'daily':
        await generator.generateDailyReport();
        break;
      case 'weekly':
        await generator.generateWeeklyReport();
        break;
      case 'monthly':
        await generator.generateMonthlyReport();
        break;
      case 'dashboard':
        await generator.generateDashboardData();
        break;
      case 'all':
        await generator.generateDailyReport();
        await generator.generateWeeklyReport();
        await generator.generateDashboardData();
        break;
      default:
        console.log('使用方法: node generate-reports.js [daily|weekly|monthly|dashboard|all]');
        process.exit(1);
    }

    console.log('✅ 報告生成完成');
  } catch (error) {
    console.error('❌ 報告生成失敗:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ReportGenerator;