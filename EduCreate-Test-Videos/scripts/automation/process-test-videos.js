#!/usr/bin/env node
// scripts/automation/process-test-videos.js
// EduCreate 測試影片批量處理主腳本

const fs = require('fs');
const path = require('path');
const TestVideoProcessor = require('../core/TestVideoProcessor');
const rule4Checker = require('../utils/rule4-checker');
const ReportGenerator = require('./generate-reports');

class BatchVideoProcessor {
  constructor() {
    this.processor = new TestVideoProcessor();
    this.reportGenerator = new ReportGenerator();
    this.defaultInputDir = 'test-results';
    this.defaultTestResultsDir = 'test-results';
    this.overrides = { module: process.env.MODULE, feature: process.env.FEATURE, version: process.env.VERSION };
  }

  // 主處理函數
  async processAll(options = {}) {
    const {
      inputDir = this.defaultInputDir,
      testResultsDir = this.defaultTestResultsDir,
      generateReports = true,
      cleanupAfter = false,
      verbose = true
    } = options;

    console.log('🎬 EduCreate 測試影片批量處理開始');
    console.log(`   輸入目錄: ${inputDir}`);
    console.log(`   測試結果目錄: ${testResultsDir}`);
    console.log(`   生成報告: ${generateReports ? '是' : '否'}`);
    console.log(`   處理後清理: ${cleanupAfter ? '是' : '否'}`);

    const startTime = Date.now();

    try {
      // 1. 檢查輸入目錄
      if (!fs.existsSync(inputDir)) {
        throw new Error(`輸入目錄不存在: ${inputDir}`);
      }

      // 2. 批量處理影片
      console.log('\n📁 開始批量處理測試影片...');
      // 從當前環境變數計算 overrides（確保在解析 CLI 之後）
      const envOverrides = {
        module: process.env.MODULE,
        feature: process.env.FEATURE,
        version: process.env.VERSION,
      };
      const processingResults = await this.processor.processVideosInDirectory(
        inputDir,
        testResultsDir,
        envOverrides
      );

      // 3. 分析處理結果
      const analysis = this.analyzeResults(processingResults);
      
      // 4. 生成報告（如果需要）
      if (generateReports) {
        console.log('\n📊 生成處理報告...');
        await this.generateProcessingReports(analysis);
      }

      // 5. 清理處理後的文件（如果需要）
      if (cleanupAfter) {
        console.log('\n🧹 清理處理後的文件...');
        await this.cleanupProcessedFiles(inputDir, processingResults);
      }

      // 6. 顯示最終結果
      const totalTime = (Date.now() - startTime) / 1000;
      this.displayFinalResults(analysis, totalTime);

      return {
        success: true,
        results: processingResults,
        analysis,
        totalTime
      };

    } catch (error) {
      console.error('❌ 批量處理失敗:', error.message);
      return {
        success: false,
        error: error.message,
        totalTime: (Date.now() - startTime) / 1000
      };
    }
  }

  // 分析處理結果
  analyzeResults(results) {
    const total = results.length;
    const successful = results.filter(r => !r.error).length;
    const failed = total - successful;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

    // 按模組分組統計
    const moduleStats = {};
    const featureStats = {};
    const resultStats = { success: 0, failure: 0 };

    results.forEach(result => {
      if (!result.error) {
        // 從文件路徑或結果中提取模組和功能信息
        const pathParts = result.organizedPath?.split('/') || [];
        const module = pathParts[pathParts.length - 3] || 'unknown';
        const feature = pathParts[pathParts.length - 2] || 'unknown';
        const testResult = pathParts[pathParts.length - 4] || 'unknown';

        // 模組統計
        if (!moduleStats[module]) {
          moduleStats[module] = { total: 0, success: 0, failure: 0 };
        }
        moduleStats[module].total++;
        if (testResult === 'success') {
          moduleStats[module].success++;
          resultStats.success++;
        } else {
          moduleStats[module].failure++;
          resultStats.failure++;
        }

        // 功能統計
        if (!featureStats[feature]) {
          featureStats[feature] = { total: 0, success: 0, failure: 0 };
        }
        featureStats[feature].total++;
        if (testResult === 'success') {
          featureStats[feature].success++;
        } else {
          featureStats[feature].failure++;
        }
      }
    });

    // 計算處理時間統計
    const processingTimes = results
      .filter(r => !r.error && r.processingTime)
      .map(r => r.processingTime);
    
    const avgProcessingTime = processingTimes.length > 0 
      ? (processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length / 1000).toFixed(1)
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: parseFloat(successRate),
      moduleStats,
      featureStats,
      resultStats,
      avgProcessingTime: parseFloat(avgProcessingTime),
      errors: results.filter(r => r.error).map(r => ({
        file: path.basename(r.videoPath || 'unknown'),
        error: r.error
      }))
    };
  }

  // 生成處理報告
  async generateProcessingReports(analysis) {
    try {
      // 生成每日報告
      await this.reportGenerator.generateDailyReport();
      
      // 生成儀表板數據
      await this.reportGenerator.generateDashboardData();
      
      // 生成批量處理專用報告
      const batchReportPath = `EduCreate-Test-Videos/reports/daily/batch-processing-${new Date().toISOString().slice(0, 10)}.json`;
      
      const batchReport = {
        reportType: 'batch_processing',
        generatedAt: new Date().toISOString(),
        summary: {
          totalFiles: analysis.total,
          successfulProcessing: analysis.successful,
          failedProcessing: analysis.failed,
          successRate: analysis.successRate,
          averageProcessingTime: analysis.avgProcessingTime
        },
        moduleBreakdown: analysis.moduleStats,
        featureBreakdown: analysis.featureStats,
        errors: analysis.errors,
        recommendations: this.generateBatchRecommendations(analysis)
      };

      fs.writeFileSync(batchReportPath, JSON.stringify(batchReport, null, 2));
      console.log(`   ✅ 批量處理報告已生成: ${batchReportPath}`);

    } catch (error) {
      console.error('   ❌ 生成報告失敗:', error.message);
    }
  }

  // 生成批量處理建議
  generateBatchRecommendations(analysis) {
    const recommendations = [];

    if (analysis.successRate < 90) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: `處理成功率 ${analysis.successRate}% 偏低，建議檢查失敗原因並改進處理流程`
      });
    }

    if (analysis.errors.length > 0) {
      const commonErrors = this.findCommonErrors(analysis.errors);
      if (commonErrors.length > 0) {
        recommendations.push({
          type: 'error_pattern',
          priority: 'medium',
          message: `發現常見錯誤模式: ${commonErrors.join(', ')}，建議統一修復`
        });
      }
    }

    if (analysis.avgProcessingTime > 30) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `平均處理時間 ${analysis.avgProcessingTime} 秒較長，建議優化處理流程`
      });
    }

    // 模組特定建議
    Object.entries(analysis.moduleStats).forEach(([module, stats]) => {
      const moduleSuccessRate = (stats.success / stats.total * 100).toFixed(1);
      if (moduleSuccessRate < 80) {
        recommendations.push({
          type: 'module_quality',
          priority: 'medium',
          message: `${module} 模組成功率 ${moduleSuccessRate}% 偏低，建議重點關注`
        });
      }
    });

    return recommendations;
  }

  // 查找常見錯誤
  findCommonErrors(errors) {
    const errorCounts = {};
    
    errors.forEach(error => {
      const errorType = this.categorizeError(error.error);
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .filter(([_, count]) => count > 1)
      .map(([errorType, _]) => errorType);
  }

  // 錯誤分類
  categorizeError(errorMessage) {
    if (errorMessage.includes('文件不存在') || errorMessage.includes('not found')) {
      return '文件不存在';
    }
    if (errorMessage.includes('權限') || errorMessage.includes('permission')) {
      return '權限問題';
    }
    if (errorMessage.includes('壓縮') || errorMessage.includes('compression')) {
      return '壓縮失敗';
    }
    if (errorMessage.includes('解析') || errorMessage.includes('parse')) {
      return '解析錯誤';
    }
    return '其他錯誤';
  }

  // 清理處理後的文件
  async cleanupProcessedFiles(inputDir, results) {
    const successfulFiles = results
      .filter(r => !r.error)
      .map(r => r.originalPath || r.videoPath);

    let cleanedCount = 0;

    for (const filePath of successfulFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`   ⚠️ 清理文件失敗 ${path.basename(filePath)}: ${error.message}`);
      }
    }

    console.log(`   ✅ 已清理 ${cleanedCount} 個處理成功的原始文件`);

    // 清理空目錄
    try {
      const items = fs.readdirSync(inputDir);
      if (items.length === 0) {
        console.log(`   📁 輸入目錄已清空: ${inputDir}`);
      }
    } catch (error) {
      // 忽略目錄檢查錯誤
    }
  }

  // 顯示最終結果
  displayFinalResults(analysis, totalTime) {
    console.log('\n🎉 批量處理完成！');
    console.log('\n📊 處理統計:');
    console.log(`   總文件數: ${analysis.total}`);
    console.log(`   成功處理: ${analysis.successful}`);
    console.log(`   處理失敗: ${analysis.failed}`);
    console.log(`   成功率: ${analysis.successRate}%`);
    console.log(`   總耗時: ${totalTime.toFixed(1)} 秒`);
    console.log(`   平均處理時間: ${analysis.avgProcessingTime} 秒/文件`);

    if (Object.keys(analysis.moduleStats).length > 0) {
      console.log('\n🎯 模組統計:');
      Object.entries(analysis.moduleStats).forEach(([module, stats]) => {
        const successRate = ((stats.success / stats.total) * 100).toFixed(1);
        console.log(`   ${module}: ${stats.total} 個 (成功率: ${successRate}%)`);
      });
    }

    if (analysis.errors.length > 0) {
      console.log('\n❌ 處理錯誤:');
      analysis.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }

    console.log('\n📁 文件位置:');
    console.log('   原始影片: EduCreate-Test-Videos/current/');
    console.log('   壓縮影片: EduCreate-Test-Videos/compressed/current/');
    console.log('   本地記憶: EduCreate-Test-Videos/local-memory/');
    console.log('   MCP整合: EduCreate-Test-Videos/mcp-integration/');
    console.log('   報告: EduCreate-Test-Videos/reports/');
  }

  // 監控模式 - 持續監控並處理新文件
  async startMonitorMode(options = {}) {
    const {
      inputDir = this.defaultInputDir,
      interval = 30000, // 30秒檢查一次
      maxRetries = 3
    } = options;

    console.log('👁️ 啟動監控模式');
    console.log(`   監控目錄: ${inputDir}`);
    console.log(`   檢查間隔: ${interval / 1000} 秒`);

    let retryCount = 0;

    const checkAndProcess = async () => {
      try {
        if (!fs.existsSync(inputDir)) {
          console.log(`⏳ 等待目錄創建: ${inputDir}`);
          return;
        }

        const videoFiles = fs.readdirSync(inputDir)
          .filter(file => file.endsWith('.webm'))
          .map(file => path.join(inputDir, file));

        if (videoFiles.length > 0) {
          console.log(`\n🔍 發現 ${videoFiles.length} 個新影片文件`);
          
          const result = await this.processAll({
            inputDir,
            generateReports: true,
            cleanupAfter: true,
            verbose: false
          });

          if (result.success) {
            console.log('✅ 批量處理完成，繼續監控...');
            retryCount = 0; // 重置重試計數
          } else {
            throw new Error(result.error);
          }
        }

      } catch (error) {
        retryCount++;
        console.error(`❌ 監控處理失敗 (${retryCount}/${maxRetries}): ${error.message}`);
        
        if (retryCount >= maxRetries) {
          console.error('❌ 達到最大重試次數，退出監控模式');
          process.exit(1);
        }
      }
    };

    // 立即執行一次檢查
    await checkAndProcess();

    // 設置定時檢查
    setInterval(checkAndProcess, interval);

    console.log('👁️ 監控模式已啟動，按 Ctrl+C 停止');
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const processor = new BatchVideoProcessor();

  // 解析命令行參數
  const options = {
    inputDir: 'test-results',
    testResultsDir: 'test-results',
    generateReports: true,
    cleanupAfter: false,
    verbose: true
  };

  let mode = 'batch'; // 默認批量模式

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--input':
      case '-i':
        options.inputDir = args[++i];
        break;
      case '--test-results':
      case '-t':
        options.testResultsDir = args[++i];
        break;
      case '--module':
        process.env.MODULE = args[++i];
        break;
      case '--feature':
        process.env.FEATURE = args[++i];
        break;
      case '--version':
        process.env.VERSION = args[++i];
        break;
      case '--mode':
        mode = args[++i] || 'batch'; // 支援 archive/batch
        break;
      case '--no-reports':
        options.generateReports = false;
        break;
      case '--cleanup':
      case '-c':
        options.cleanupAfter = true;
        break;
      case '--quiet':
      case '-q':
        options.verbose = false;
        break;
      case '--monitor':
      case '-m':
        mode = 'monitor';
        break;
      case '--help':
      case '-h':
        console.log(`
EduCreate 測試影片批量處理工具

使用方法:
  node process-test-videos.js [選項]

選項:
  -i, --input <目錄>        輸入目錄 (默認: test-results)
  -t, --test-results <目錄>  測試結果目錄 (默認: test-results)
  --module <name>           模組覆蓋（如 games）
  --feature <name>          功能覆蓋（如 AirplaneLRIV）
  --version <semver>        版本覆蓋（如 v1.0.1）
  --mode <batch|archive>    模式（為相容保留 archive，行為等同 batch）
  --no-reports              不生成報告
  -c, --cleanup             處理後清理原始文件
  -q, --quiet               靜默模式
  -m, --monitor             監控模式 (持續監控新文件)
  -h, --help                顯示幫助信息

示例:
  node process-test-videos.js                                    # 批量處理 test-results 目錄
  node process-test-videos.js -i ./videos -c --module games       # 指定模組並清理
  node process-test-videos.js --mode archive --feature AirplaneLRIV --version v1.0.1
        `);
        process.exit(0);
        break;
    }
  }

  try {
    if (mode === 'monitor') {
      await processor.startMonitorMode(options);
    } else {
      const result = await processor.processAll(options);
      process.exit(result.success ? 0 : 1);
    }
  } catch (error) {
    console.error('❌ 程序執行失敗:', error.message);
    process.exit(1);
  }
}

// 處理程序退出信號
process.on('SIGINT', () => {
  console.log('\n👋 收到退出信號，正在安全退出...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 收到終止信號，正在安全退出...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = BatchVideoProcessor;
