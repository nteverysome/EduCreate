#!/usr/bin/env node

/**
 * 🔍 EduCreate Augment 配置狀態檢查工具
 * 檢查當前 Augment 性能配置和優化狀態
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class AugmentStatusChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.status = {
      overall: 'unknown',
      memory: { status: 'unknown', limitMB: 0 },
      vscode: { status: 'unknown', optimized: false },
      fileIndexing: { status: 'unknown', optimized: false },
      performance: { status: 'unknown', score: 0 }
    };
  }

  async checkStatus() {
    console.log('🔍 檢查 EduCreate Augment 狀態...\n');

    try {
      // 1. 檢查記憶體配置
      await this.checkMemoryConfiguration();
      
      // 2. 檢查 VSCode 配置
      await this.checkVSCodeConfiguration();
      
      // 3. 檢查文件索引配置
      await this.checkFileIndexing();
      
      // 4. 評估整體性能
      await this.evaluatePerformance();
      
      // 5. 生成狀態報告
      await this.generateStatusReport();
      
    } catch (error) {
      console.error('❌ 狀態檢查失敗:', error.message);
      process.exit(1);
    }
  }

  async checkMemoryConfiguration() {
    console.log('🧠 檢查記憶體配置...');
    
    const v8 = require('v8');
    const heapStats = v8.getHeapStatistics();
    const maxHeapMB = Math.round(heapStats.heap_size_limit / 1024 / 1024);
    const memoryUsage = process.memoryUsage();
    const currentHeapMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    this.status.memory.limitMB = maxHeapMB;
    
    if (maxHeapMB >= 8000) {
      this.status.memory.status = 'optimized';
      console.log(`  ✅ 記憶體限制已優化: ${maxHeapMB} MB`);
      console.log(`  ✅ 當前使用: ${currentHeapMB} MB`);
    } else {
      this.status.memory.status = 'needs_optimization';
      console.log(`  ⚠️ 記憶體限制較低: ${maxHeapMB} MB (建議 8GB+)`);
      console.log(`  ⚠️ 當前使用: ${currentHeapMB} MB`);
    }
    
    console.log('');
  }

  async checkVSCodeConfiguration() {
    console.log('⚙️ 檢查 VSCode 配置...');
    
    const vscodeSettingsPath = path.join(this.projectRoot, '.vscode', 'settings.json');
    
    if (!fs.existsSync(vscodeSettingsPath)) {
      this.status.vscode.status = 'missing';
      console.log('  ❌ VSCode 設定文件不存在');
      console.log('');
      return;
    }

    try {
      const settings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
      
      // 檢查 Augment 相關配置
      const hasAugmentConfig = !!(
        settings['augment.memoryLimit'] ||
        settings['augment.performance'] ||
        settings['augment.fileIndexing']
      );
      
      // 檢查 MCP 配置
      const mcpServers = settings['mcp.servers'] || {};
      const mcpCount = Object.keys(mcpServers).length;
      
      if (hasAugmentConfig) {
        this.status.vscode.status = 'optimized';
        this.status.vscode.optimized = true;
        console.log('  ✅ Augment 配置已優化');
        console.log(`  ✅ MCP 服務數量: ${mcpCount}`);
      } else {
        this.status.vscode.status = 'basic';
        console.log('  ⚠️ 使用基本配置，建議優化');
        console.log(`  ℹ️ MCP 服務數量: ${mcpCount}`);
      }
      
    } catch (error) {
      this.status.vscode.status = 'error';
      console.log('  ❌ 配置文件解析錯誤:', error.message);
    }
    
    console.log('');
  }

  async checkFileIndexing() {
    console.log('📁 檢查文件索引配置...');
    
    // 檢查 .augmentignore
    const augmentIgnorePath = path.join(this.projectRoot, '.augmentignore');
    const hasAugmentIgnore = fs.existsSync(augmentIgnorePath);
    
    // 統計項目文件數量
    const fileCount = this.countProjectFiles();
    
    if (hasAugmentIgnore) {
      this.status.fileIndexing.status = 'optimized';
      this.status.fileIndexing.optimized = true;
      console.log('  ✅ .augmentignore 已配置');
    } else {
      this.status.fileIndexing.status = 'needs_optimization';
      console.log('  ❌ 缺少 .augmentignore 文件');
    }
    
    console.log(`  📊 項目文件總數: ${fileCount.total}`);
    console.log(`  📊 核心文件數量: ${fileCount.core}`);
    
    console.log('');
  }

  countProjectFiles() {
    let total = 0;
    let core = 0;
    
    const coreExtensions = ['.tsx', '.ts', '.js', '.jsx', '.md'];
    const excludeDirs = ['node_modules', '.next', 'test-results', 'logs'];
    
    const countFiles = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!excludeDirs.includes(item) && !item.startsWith('.')) {
              countFiles(fullPath);
            }
          } else {
            total++;
            const ext = path.extname(item);
            if (coreExtensions.includes(ext)) {
              core++;
            }
          }
        }
      } catch (error) {
        // 忽略權限錯誤
      }
    };
    
    countFiles(this.projectRoot);
    return { total, core };
  }

  async evaluatePerformance() {
    console.log('📊 評估整體性能...');
    
    let score = 0;
    const factors = [];
    
    // 記憶體配置評分 (40%)
    if (this.status.memory.status === 'optimized') {
      score += 40;
      factors.push('✅ 記憶體配置已優化 (+40)');
    } else {
      factors.push('❌ 記憶體配置需要優化 (+0)');
    }
    
    // VSCode 配置評分 (30%)
    if (this.status.vscode.optimized) {
      score += 30;
      factors.push('✅ VSCode 配置已優化 (+30)');
    } else if (this.status.vscode.status === 'basic') {
      score += 15;
      factors.push('⚠️ VSCode 配置基本 (+15)');
    } else {
      factors.push('❌ VSCode 配置問題 (+0)');
    }
    
    // 文件索引評分 (30%)
    if (this.status.fileIndexing.optimized) {
      score += 30;
      factors.push('✅ 文件索引已優化 (+30)');
    } else {
      factors.push('❌ 文件索引未優化 (+0)');
    }
    
    this.status.performance.score = score;
    
    factors.forEach(factor => console.log(`  ${factor}`));
    
    console.log(`\n  🏆 整體評分: ${score}/100`);
    
    if (score >= 80) {
      this.status.overall = 'excellent';
      console.log('  🎉 狀態: 優秀');
    } else if (score >= 60) {
      this.status.overall = 'good';
      console.log('  👍 狀態: 良好');
    } else if (score >= 40) {
      this.status.overall = 'needs_improvement';
      console.log('  ⚠️ 狀態: 需要改進');
    } else {
      this.status.overall = 'poor';
      console.log('  ❌ 狀態: 需要優化');
    }
    
    console.log('');
  }

  async generateStatusReport() {
    console.log('📋 生成狀態報告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      projectName: 'EduCreate',
      status: this.status,
      recommendations: this.generateRecommendations(),
      quickActions: this.generateQuickActions()
    };
    
    // 保存報告
    fs.writeFileSync('augment-status-report.json', JSON.stringify(report, null, 2));
    
    console.log('  ✅ 報告已保存: augment-status-report.json');
    
    // 顯示建議
    if (report.recommendations.length > 0) {
      console.log('\n💡 優化建議:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // 顯示快速操作
    if (report.quickActions.length > 0) {
      console.log('\n🚀 快速操作:');
      report.quickActions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`);
      });
    }
    
    console.log('\n✅ 狀態檢查完成！');
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.status.memory.status !== 'optimized') {
      recommendations.push('使用 --max-old-space-size=8192 參數啟動 Node.js');
    }
    
    if (!this.status.vscode.optimized) {
      recommendations.push('配置 VSCode settings.json 中的 Augment 優化設定');
    }
    
    if (!this.status.fileIndexing.optimized) {
      recommendations.push('創建 .augmentignore 文件以優化文件索引');
    }
    
    if (this.status.performance.score < 60) {
      recommendations.push('執行完整的 Augment 優化流程');
    }
    
    return recommendations;
  }

  generateQuickActions() {
    const actions = [];
    
    if (this.status.performance.score < 60) {
      actions.push('創建 Augment 優化配置文件');
    }
    
    if (!this.status.fileIndexing.optimized) {
      actions.push('創建 .augmentignore 文件');
    }
    
    if (!this.status.vscode.optimized) {
      actions.push('更新 VSCode 設定以啟用 Augment 優化');
    }
    
    return actions;
  }
}

// 執行狀態檢查
if (require.main === module) {
  const checker = new AugmentStatusChecker();
  checker.checkStatus().catch(console.error);
}

module.exports = AugmentStatusChecker;
