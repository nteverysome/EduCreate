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

  // 生成每日報告（擴充：每日資料夾 + index.html + artifacts.csv + 儀表板欄位）
  async generateDailyReport(date = null) {
    const reportDate = date || new Date().toISOString().slice(0, 10);
    const dailyDir = `${this.reportsDir}/daily/${reportDate}`;
    const jsonPath = `${dailyDir}/summary.json`;
    const htmlPath = `${dailyDir}/index.html`;
    const csvPath = `${dailyDir}/artifacts.csv`;

    console.log(`📊 生成每日報告: ${reportDate}`);

    try {
      // 收集數據
      const testData = await this.collectDailyTestData(reportDate);
      const memoryData = await this.collectMemoryData();
      const compressionData = this.compressionManager.getCompressionStats();
      const systemData = await this.collectSystemData();

      // unmapped success 估算（從本地記憶）
      const videoMemoriesPath = 'EduCreate-Test-Videos/local-memory/video-memories.json';
      let unmappedSuccess = 0,
          totalTests = testData.totalTests,
          passed = testData.successfulTests,
          failed = testData.failedTests;
      if (fs.existsSync(videoMemoriesPath)) {
        try {
          const vm = JSON.parse(fs.readFileSync(videoMemoriesPath, 'utf8'));
          const todays = vm.memories.filter(m => (m.timestamp||'').startsWith(reportDate));
          unmappedSuccess = todays.filter(m => m.unmapped && m.result==='success').length;
          totalTests = todays.length;
          passed = todays.filter(m => m.result==='success').length;
          failed = todays.filter(m => m.result!=='success').length;
        } catch {}
      }

      const report = {
        reportType: 'daily',
        reportDate,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTests,
          successfulTests: passed,
          failedTests: failed,
          successRate: totalTests>0? (passed/totalTests*100).toFixed(1): 0,
          totalProcessingTime: testData.totalProcessingTime,
          averageProcessingTime: testData.averageProcessingTime,
          unmappedSuccess,
          avgDurationMs: 0,
          largestArtifactMB: 0
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

      // 從當日 memories 估算 avgDurationMs / largestArtifactMB
      try {
        const vm = JSON.parse(fs.readFileSync('EduCreate-Test-Videos/local-memory/video-memories.json','utf8'));
        const todays = vm.memories.filter(m => (m.timestamp||'').startsWith(reportDate));
        if (todays.length>0) {
          const avgDur = todays.reduce((s,m)=> s + (m.performance?.duration||0), 0) / todays.length;
          const largest = todays.reduce((mx,m)=> Math.max(mx, m.performance?.fileSize||0), 0);
          report.summary.avgDurationMs = Math.round(avgDur || 0);
          report.summary.largestArtifactMB = Number((largest/1024/1024).toFixed(2));
        }
      } catch {}


      fs.mkdirSync(dailyDir, { recursive: true });
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

      // 生成 artifacts.csv（掃描當日 current 目錄）
      const currentRoot = 'EduCreate-Test-Videos/current';
      const rows = ['path,bytes,durationMs,mappedGame,unmapped'];
      let largest = 0;
      const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const fp = path.join(dir, e.name);
          if (e.isDirectory()) walk(fp);
          else if (e.isFile() && fp.toLowerCase().endsWith('.webm')) {
            const st = fs.statSync(fp);
            largest = Math.max(largest, st.size);
            rows.push([
              path.relative('EduCreate-Test-Videos', fp).replace(/,/g,';'),
              st.size,
              0,
              '',
              fp.includes('/unknown/') ? 'true' : 'false'
            ].join(','));
          }
        }
      };
      walk(currentRoot);
      fs.writeFileSync(csvPath, rows.join('\n'));

      // index.html（使用相對路徑，從 daily/<date>/ 指向專案根）
      const baseFromDaily = path.relative(path.dirname(htmlPath), 'EduCreate-Test-Videos').replace(/\\/g,'/');
      const htmlRows = rows.slice(1).map(line => {
        const [p, bytes] = line.split(',');
        return `<tr><td><a href='${baseFromDaily}/${p}'>${p}</a></td><td>${(bytes/1024/1024).toFixed(2)} MB</td></tr>`;
      }).join('\n');
      const html = `<!doctype html><html><head><meta charset='utf-8'><title>Daily ${reportDate}</title><style>table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body><h1>Daily ${reportDate}</h1><ul><li>Total: ${totalTests}</li><li>Passed: ${passed}</li><li>Failed: ${failed}</li><li>Unmapped Success: ${unmappedSuccess}</li><li>Largest Artifact(MB): ${(largest/1024/1024).toFixed(2)}</li></ul><table><thead><tr><th>Artifact</th><th>Size</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
      fs.writeFileSync(htmlPath, html);

      console.log(`✅ 每日報告已生成: ${htmlPath}`);
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

  // 生成報告入口首頁 reports/index.html
  async generateReportsHome() {
    const homePath = `${this.reportsDir}/index.html`;
    const dailyRoot = `${this.reportsDir}/daily`;
    const currentRoot = 'EduCreate-Test-Videos/current';
    const homeDir = path.dirname(homePath);

    // 最近 7 天的日報資料夾
    let recentDays = [];
    try {
      if (fs.existsSync(dailyRoot)) {
        const entries = fs.readdirSync(dailyRoot, { withFileTypes: true })
          .filter(e => e.isDirectory())
          .map(e => e.name)
          .filter(n => /\d{4}-\d{2}-\d{2}/.test(n))
          .sort((a,b) => a < b ? 1 : -1);
        recentDays = entries.slice(0, 7);
      }
    } catch {}

    // 今日快捷連結
    const today = new Date().toISOString().slice(0,10);
    const todayIndex = `${dailyRoot}/${today}/index.html`;
    const todayCsv = `${dailyRoot}/${today}/artifacts.csv`;
    const todaySummary = `${dailyRoot}/${today}/summary.json`;
    const dashboardJson = `${this.reportsDir}/dashboard/dashboard-data.json`;

    const toHref = (absPath) => path.relative(homeDir, absPath).replace(/\\/g,'/');
    const link = (p, text) => fs.existsSync(p)
      ? `<a href='${toHref(p)}'>${text}</a>`
      : `<span style='color:#999'>${text}（尚未生成）</span>`;

    // 最新 10 個影片與對應 trace
    const artifacts = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp);
        else if (e.isFile() && fp.toLowerCase().endsWith('.webm')) {
          const st = fs.statSync(fp);
          artifacts.push({ path: fp, size: st.size, mtime: st.mtimeMs });
        }
      }
    };
    walk(currentRoot);
    artifacts.sort((a,b) => b.mtime - a.mtime);
    const latest = artifacts.slice(0, 10).map(a => {
      const rel = path.relative('EduCreate-Test-Videos', a.path).replace(/\\/g,'/');
      const targetAbs = path.join('EduCreate-Test-Videos', rel);
      const artHref = path.relative(homeDir, targetAbs).replace(/\\/g,'/');
      const zip = a.path.replace(/\.webm$/i, '.zip');
      const zipRel = path.relative('EduCreate-Test-Videos', zip).replace(/\\/g,'/');
      const zipAbs = path.join('EduCreate-Test-Videos', zipRel);
      const zipHref = fs.existsSync(zip) ? path.relative(homeDir, zipAbs).replace(/\\/g,'/') : '';
      const sizeMB = (a.size/1024/1024).toFixed(2);
      const zipLink = zipHref ? `<a href='${zipHref}'>trace</a>` : '';
      return `<tr><td><a href='${artHref}'>${rel}</a></td><td>${sizeMB} MB</td><td>${zipLink}</td></tr>`;
    }).join('\n');

    const recentList = recentDays.map(d => {
      const p = `${dailyRoot}/${d}/index.html`;
      return `<li>${link(p, d)}</li>`;
    }).join('\n');

    const html = `<!doctype html>
<html><head><meta charset='utf-8'><title>EduCreate Reports Home</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
.card{border:1px solid #ddd;padding:12px;border-radius:8px;margin:10px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}
 table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px}
</style>
</head>
<body>
<h1>EduCreate Reports Home</h1>
<div class='grid'>
  <div class='card'>
    <h2>今日快捷</h2>
    <ul>
      <li>${link(todayIndex, '今日日報 index.html')}</li>
      <li>${link(todayCsv, '今日 artifacts.csv')}</li>
      <li>${link(todaySummary, '今日 summary.json')}</li>
      <li>${link(dashboardJson, 'Dashboard JSON')}</li>
    </ul>
  </div>
  <div class='card'>
    <h2>最近 7 天</h2>
    <ul>${recentList || '<li>尚無日報</li>'}</ul>
  </div>
</div>

<div class='card'>
  <h2>最新影片（10）</h2>
  <table>
    <thead><tr><th>Artifact</th><th>Size</th><th>Trace</th></tr></thead>
    <tbody>${latest || ''}</tbody>
  </table>
</div>

<p style='color:#777'>此頁面由 generate-reports.js 自動生成。若用 file:// 開啟，連結已改為相對路徑，亦可改用 VSCode Live Server 或 localhost 靜態伺服器。</p>
</body></html>`;

    fs.mkdirSync(this.reportsDir, { recursive: true });
    fs.writeFileSync(homePath, html);
    console.log(`✅ 報告首頁已生成: ${homePath}`);
    return homePath;
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
        await generator.generateReportsHome();
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