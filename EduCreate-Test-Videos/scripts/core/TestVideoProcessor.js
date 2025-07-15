// scripts/core/TestVideoProcessor.js
const fs = require('fs');
const path = require('path');
const LocalMemoryManager = require('./LocalMemoryManager');
const MCPIntegrationManager = require('./MCPIntegrationManager');
const CompressionManager = require('./CompressionManager');

class TestVideoProcessor {
  constructor() {
    this.memoryManager = new LocalMemoryManager();
    this.mcpManager = new MCPIntegrationManager();
    this.compressionManager = new CompressionManager();
    
    this.ensureDirectories();
  }

  // 確保必要的目錄存在
  ensureDirectories() {
    const directories = [
      'EduCreate-Test-Videos/current/success/games',
      'EduCreate-Test-Videos/current/success/content',
      'EduCreate-Test-Videos/current/success/file-space',
      'EduCreate-Test-Videos/current/success/system',
      'EduCreate-Test-Videos/current/failure/games',
      'EduCreate-Test-Videos/current/failure/content',
      'EduCreate-Test-Videos/current/failure/file-space',
      'EduCreate-Test-Videos/current/failure/system',
      'EduCreate-Test-Videos/compressed/current',
      'EduCreate-Test-Videos/metadata',
      'EduCreate-Test-Videos/reports/daily'
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 處理單個測試影片
  async processVideo(videoPath, testResults = null) {
    try {
      console.log(`🎬 開始處理測試影片: ${path.basename(videoPath)}`);
      
      // 1. 生成基本元數據
      const metadata = await this.generateMetadata(videoPath, testResults);
      console.log(`   模組: ${metadata.module}, 功能: ${metadata.feature}, 結果: ${metadata.result}`);
      
      // 2. 移動影片到適當的目錄
      const organizedPath = await this.organizeVideo(videoPath, metadata);
      metadata.path = organizedPath;
      
      // 3. 壓縮影片
      const compressedPath = await this.compressVideo(organizedPath, metadata);
      metadata.compressedPath = compressedPath;
      
      // 4. 儲存到本地記憶系統
      const memoryId = await this.memoryManager.storeVideoMemory(metadata);
      console.log(`   記憶ID: ${memoryId}`);
      
      // 5. 整合 Langfuse MCP
      const langfuseTraceId = await this.mcpManager.integrateWithLangfuse(metadata);
      console.log(`   Langfuse追蹤: ${langfuseTraceId}`);
      
      // 6. 整合 sequential-thinking
      const sequentialThinkingId = await this.mcpManager.integrateWithSequentialThinking(metadata);
      console.log(`   邏輯推理: ${sequentialThinkingId}`);
      
      // 7. 如果測試失敗，可選擇收集反饋
      let feedbackId = null;
      if (metadata.result === 'failure') {
        feedbackId = await this.mcpManager.integrateWithFeedbackCollector(metadata);
        if (feedbackId) {
          console.log(`   反饋收集: ${feedbackId}`);
        }
      }
      
      // 8. 更新 MCP 整合信息
      await this.memoryManager.updateMCPIntegration(memoryId, {
        langfuseTraceId,
        sequentialThinkingId,
        feedbackCollectionId: feedbackId
      });
      
      // 9. 分析測試模式
      await this.memoryManager.analyzeTestPatterns(metadata);
      
      // 10. 記錄失敗分析（如果適用）
      if (metadata.result === 'failure') {
        await this.memoryManager.recordFailureAnalysis(metadata);
      }
      
      // 11. 更新測試目錄
      await this.updateTestCatalog(metadata);
      
      // 12. 生成處理報告
      const processingReport = {
        videoId: metadata.videoId,
        originalPath: videoPath,
        organizedPath,
        compressedPath,
        memoryId,
        langfuseTraceId,
        sequentialThinkingId,
        feedbackCollectionId: feedbackId,
        processingTime: Date.now() - metadata.processingStartTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ 測試影片處理完成: ${metadata.videoId}`);
      console.log(`   處理耗時: ${(processingReport.processingTime / 1000).toFixed(1)} 秒`);
      
      return processingReport;
      
    } catch (error) {
      console.error(`❌ 處理測試影片失敗: ${path.basename(videoPath)}`, error);
      throw error;
    }
  }

  // 批量處理測試影片
  async processVideosInDirectory(inputDir, testResultsDir = null) {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`輸入目錄不存在: ${inputDir}`);
    }

    const videoFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.webm'))
      .map(file => path.join(inputDir, file));

    if (videoFiles.length === 0) {
      console.log('📁 沒有找到需要處理的影片文件');
      return [];
    }

    console.log(`📁 開始批量處理: ${videoFiles.length} 個影片文件`);
    
    const results = [];
    const startTime = Date.now();

    for (const [index, videoPath] of videoFiles.entries()) {
      console.log(`\n[${index + 1}/${videoFiles.length}] 處理影片: ${path.basename(videoPath)}`);
      
      try {
        // 嘗試加載對應的測試結果
        let testResults = null;
        if (testResultsDir) {
          const testResultPath = path.join(testResultsDir, path.basename(videoPath).replace('.webm', '.json'));
          if (fs.existsSync(testResultPath)) {
            testResults = JSON.parse(fs.readFileSync(testResultPath, 'utf8'));
          }
        }
        
        const result = await this.processVideo(videoPath, testResults);
        results.push(result);
        
      } catch (error) {
        console.error(`跳過文件 ${path.basename(videoPath)}: ${error.message}`);
        results.push({
          videoPath,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.length - successCount;

    console.log(`\n📊 批量處理完成:`);
    console.log(`   總文件數: ${videoFiles.length}`);
    console.log(`   成功處理: ${successCount}`);
    console.log(`   處理失敗: ${errorCount}`);
    console.log(`   總耗時: ${totalTime.toFixed(1)} 秒`);
    console.log(`   平均耗時: ${(totalTime / videoFiles.length).toFixed(1)} 秒/文件`);

    // 生成批量處理報告
    await this.generateBatchReport(results, inputDir);

    return results;
  }

  // 生成影片元數據
  async generateMetadata(videoPath, testResults = null) {
    const fileName = path.basename(videoPath);
    const fileStats = fs.statSync(videoPath);
    
    // 嘗試從文件名解析信息
    const parsedInfo = this.parseVideoFileName(fileName);
    
    // 如果有測試結果，使用測試結果中的信息
    if (testResults) {
      parsedInfo.testStages = testResults.testStages || [];
      parsedInfo.duration = testResults.duration || 0;
      parsedInfo.relatedScreenshots = testResults.screenshots || [];
    }
    
    const metadata = {
      videoId: fileName.replace('.webm', ''),
      originalFileName: fileName,
      module: parsedInfo.module,
      feature: parsedInfo.feature,
      testName: `${parsedInfo.feature} 測試`,
      result: parsedInfo.result,
      version: parsedInfo.version,
      sequence: parsedInfo.sequence,
      testDate: new Date().toISOString(),
      originalSize: fileStats.size,
      duration: parsedInfo.duration,
      testStages: parsedInfo.testStages,
      relatedScreenshots: parsedInfo.relatedScreenshots,
      processingStartTime: Date.now(),
      metadata: {
        isMemoryScienceTest: parsedInfo.module === 'games',
        isGEPTTest: this.isGEPTRelated(parsedInfo.feature),
        isAccessibilityTest: this.isAccessibilityRelated(parsedInfo.feature),
        priority: this.determinePriority(parsedInfo.module, parsedInfo.result)
      }
    };
    
    return metadata;
  }

  // 解析影片文件名
  parseVideoFileName(fileName) {
    // 標準格式: YYYYMMDD_模組_功能_結果_版本_序號.webm
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 4) {
      return {
        date: parts[0],
        module: parts[1],
        feature: parts[2],
        result: parts[3],
        version: parts[4] || 'v1.0.0',
        sequence: parts[5] || '001',
        testStages: this.generateDefaultTestStages(parts[1], parts[2], parts[3]),
        duration: 60, // 默認60秒
        relatedScreenshots: []
      };
    }
    
    // 如果無法解析，嘗試從文件名推斷
    return this.inferFromFileName(fileName);
  }

  // 從文件名推斷信息
  inferFromFileName(fileName) {
    let module = 'system';
    let feature = 'unknown';
    let result = 'unknown';
    
    // 推斷模組
    if (fileName.includes('match') || fileName.includes('game')) {
      module = 'games';
      feature = fileName.includes('match') ? 'match-game' : 'unknown-game';
    } else if (fileName.includes('content') || fileName.includes('ai')) {
      module = 'content';
      feature = fileName.includes('ai') ? 'ai-content-generation' : 'unknown-content';
    } else if (fileName.includes('file') || fileName.includes('space')) {
      module = 'file-space';
      feature = 'file-manager';
    }
    
    // 推斷結果
    if (fileName.includes('success') || fileName.includes('pass')) {
      result = 'success';
    } else if (fileName.includes('fail') || fileName.includes('error')) {
      result = 'failure';
    }
    
    return {
      date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      module,
      feature,
      result,
      version: 'v1.0.0',
      sequence: '001',
      testStages: this.generateDefaultTestStages(module, feature, result),
      duration: 60,
      relatedScreenshots: []
    };
  }

  // 生成默認測試階段
  generateDefaultTestStages(module, feature, result) {
    const baseStages = [
      { stage: 1, name: '主頁導航', result: 'pass', timestamp: new Date().toISOString() },
      { stage: 2, name: '功能入口', result: 'pass', timestamp: new Date().toISOString() },
      { stage: 3, name: '基本功能測試', result: result === 'success' ? 'pass' : 'fail', timestamp: new Date().toISOString() }
    ];
    
    // 根據模組添加特定階段
    if (module === 'games') {
      baseStages.push(
        { stage: 4, name: '遊戲配置', result: 'pass', timestamp: new Date().toISOString() },
        { stage: 5, name: '遊戲玩法', result: result === 'success' ? 'pass' : 'fail', timestamp: new Date().toISOString() },
        { stage: 6, name: '記憶科學驗證', result: result === 'success' ? 'pass' : 'fail', timestamp: new Date().toISOString() }
      );
    } else if (module === 'content') {
      baseStages.push(
        { stage: 4, name: 'GEPT分級測試', result: 'pass', timestamp: new Date().toISOString() },
        { stage: 5, name: 'AI內容生成', result: result === 'success' ? 'pass' : 'fail', timestamp: new Date().toISOString() }
      );
    }
    
    return baseStages;
  }

  // 組織影片到適當目錄
  async organizeVideo(videoPath, metadata) {
    const targetDir = path.join(
      'EduCreate-Test-Videos/current',
      metadata.result,
      metadata.module,
      metadata.feature
    );
    
    // 確保目標目錄存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 生成標準化文件名
    const standardFileName = this.generateStandardFileName(metadata);
    const targetPath = path.join(targetDir, standardFileName);
    
    // 移動文件
    if (videoPath !== targetPath) {
      fs.copyFileSync(videoPath, targetPath);
      console.log(`   📁 影片已組織到: ${path.relative('EduCreate-Test-Videos', targetPath)}`);
    }
    
    return targetPath;
  }

  // 生成標準化文件名
  generateStandardFileName(metadata) {
    const date = metadata.testDate.slice(0, 10).replace(/-/g, '');
    return `${date}_${metadata.module}_${metadata.feature}_${metadata.result}_${metadata.version}_${metadata.sequence}.webm`;
  }

  // 壓縮影片
  async compressVideo(videoPath, metadata) {
    const compressedDir = path.join(
      'EduCreate-Test-Videos/compressed/current',
      metadata.result,
      metadata.module,
      metadata.feature
    );
    
    const compressedFileName = path.basename(videoPath);
    const compressedPath = path.join(compressedDir, compressedFileName);
    
    // 使用智能壓縮
    const compressionResult = await this.compressionManager.smartCompress(videoPath, compressedPath, metadata);
    
    // 更新元數據
    metadata.compressedSize = compressionResult.compressedSize;
    metadata.compressionRatio = compressionResult.compressionRatio;
    metadata.compressionQuality = compressionResult.quality;
    
    return compressedPath;
  }

  // 更新測試目錄
  async updateTestCatalog(metadata) {
    const catalogPath = 'EduCreate-Test-Videos/metadata/test-catalog.json';
    
    let catalog = { tests: [], lastUpdated: null, stats: {} };
    if (fs.existsSync(catalogPath)) {
      catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    }
    
    // 添加或更新測試記錄
    const existingIndex = catalog.tests.findIndex(t => t.videoId === metadata.videoId);
    const testRecord = {
      videoId: metadata.videoId,
      path: metadata.path,
      compressedPath: metadata.compressedPath,
      module: metadata.module,
      feature: metadata.feature,
      result: metadata.result,
      version: metadata.version,
      testDate: metadata.testDate,
      originalSize: metadata.originalSize,
      compressedSize: metadata.compressedSize,
      compressionRatio: metadata.compressionRatio,
      priority: metadata.metadata.priority
    };
    
    if (existingIndex >= 0) {
      catalog.tests[existingIndex] = testRecord;
    } else {
      catalog.tests.push(testRecord);
    }
    
    // 更新統計
    catalog.lastUpdated = new Date().toISOString();
    catalog.stats = this.calculateCatalogStats(catalog.tests);
    
    // 保存目錄
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  }

  // 計算目錄統計
  calculateCatalogStats(tests) {
    const totalTests = tests.length;
    const successTests = tests.filter(t => t.result === 'success').length;
    const failureTests = totalTests - successTests;
    
    const moduleStats = {};
    tests.forEach(test => {
      if (!moduleStats[test.module]) {
        moduleStats[test.module] = { total: 0, success: 0, failure: 0 };
      }
      moduleStats[test.module].total++;
      if (test.result === 'success') {
        moduleStats[test.module].success++;
      } else {
        moduleStats[test.module].failure++;
      }
    });
    
    const totalOriginalSize = tests.reduce((sum, t) => sum + (t.originalSize || 0), 0);
    const totalCompressedSize = tests.reduce((sum, t) => sum + (t.compressedSize || 0), 0);
    
    return {
      totalTests,
      successTests,
      failureTests,
      successRate: totalTests > 0 ? ((successTests / totalTests) * 100).toFixed(1) : 0,
      moduleStats,
      totalOriginalSizeMB: (totalOriginalSize / (1024 * 1024)).toFixed(2),
      totalCompressedSizeMB: (totalCompressedSize / (1024 * 1024)).toFixed(2),
      totalSpaceSavedMB: ((totalOriginalSize - totalCompressedSize) / (1024 * 1024)).toFixed(2)
    };
  }

  // 生成批量處理報告
  async generateBatchReport(results, inputDir) {
    const reportPath = `EduCreate-Test-Videos/reports/daily/batch-report-${new Date().toISOString().slice(0, 10)}.json`;
    
    const report = {
      inputDirectory: inputDir,
      processedAt: new Date().toISOString(),
      totalFiles: results.length,
      successfulProcessing: results.filter(r => !r.error).length,
      failedProcessing: results.filter(r => r.error).length,
      results: results,
      summary: {
        averageProcessingTime: this.calculateAverageProcessingTime(results),
        totalSpaceSaved: this.calculateTotalSpaceSaved(results),
        moduleBreakdown: this.calculateModuleBreakdown(results)
      }
    };
    
    // 確保報告目錄存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 批量處理報告已生成: ${reportPath}`);
  }

  // 輔助方法
  isGEPTRelated(featureName) {
    return featureName.toLowerCase().includes('gept') || 
           featureName.includes('分級') || 
           featureName.includes('詞彙');
  }

  isAccessibilityRelated(featureName) {
    return featureName.includes('accessibility') || 
           featureName.includes('無障礙') || 
           featureName.includes('a11y');
  }

  determinePriority(module, result) {
    if (result === 'failure') return 'high';
    if (module === 'games') return 'high';
    if (module === 'content') return 'medium';
    return 'low';
  }

  calculateAverageProcessingTime(results) {
    const validResults = results.filter(r => !r.error && r.processingTime);
    if (validResults.length === 0) return 0;
    
    const totalTime = validResults.reduce((sum, r) => sum + r.processingTime, 0);
    return (totalTime / validResults.length / 1000).toFixed(1); // 轉換為秒
  }

  calculateTotalSpaceSaved(results) {
    // 這裡需要從壓縮結果中計算，暫時返回0
    return 0;
  }

  calculateModuleBreakdown(results) {
    const breakdown = {};
    results.forEach(result => {
      if (!result.error) {
        // 從結果中提取模組信息，暫時使用占位符
        const module = 'unknown';
        if (!breakdown[module]) {
          breakdown[module] = 0;
        }
        breakdown[module]++;
      }
    });
    return breakdown;
  }
}

module.exports = TestVideoProcessor;
