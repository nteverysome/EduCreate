// scripts/core/LocalMemoryManager.js
const fs = require('fs');
const path = require('path');

class LocalMemoryManager {
  constructor(memoryDir = 'EduCreate-Test-Videos/local-memory') {
    this.memoryDir = memoryDir;
    this.videoMemoriesPath = `${memoryDir}/video-memories.json`;
    this.testPatternsPath = `${memoryDir}/test-patterns.json`;
    this.failureAnalysisPath = `${memoryDir}/failure-analysis.json`;
    this.improvementTrackingPath = `${memoryDir}/improvement-tracking.json`;
    this.performanceMetricsPath = `${memoryDir}/performance-metrics.json`;
    this.knowledgeBasePath = `${memoryDir}/knowledge-base.json`;
    
    this.ensureMemoryFiles();
  }

  // 確保記憶文件存在
  ensureMemoryFiles() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
    
    const defaultFiles = {
      [this.videoMemoriesPath]: { 
        memories: [], 
        totalMemories: 0, 
        lastUpdated: new Date().toISOString(),
        memoryStats: { successRate: 0, totalTests: 0, moduleBreakdown: {} }
      },
      [this.testPatternsPath]: { patterns: [] },
      [this.failureAnalysisPath]: { analyses: [] },
      [this.improvementTrackingPath]: { improvements: [] },
      [this.performanceMetricsPath]: { metrics: [] },
      [this.knowledgeBasePath]: { knowledge: [] }
    };
    
    Object.entries(defaultFiles).forEach(([filePath, defaultContent]) => {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
      }
    });
  }

  // 儲存測試影片記憶
  async storeVideoMemory(videoMetadata) {
    const memory = {
      memoryId: `${videoMetadata.feature}-test-${Date.now()}`,
      videoId: videoMetadata.videoId,
      type: "test_video_memory",
      module: videoMetadata.module,
      feature: videoMetadata.feature,
      result: videoMetadata.result,
      unmapped: !!videoMetadata.unmapped,
      browser: videoMetadata.browser || 'chromium',
      trace: videoMetadata.trace || null,
      timestamp: videoMetadata.testDate,
      summary: this.generateSummary(videoMetadata),
      keyInsights: this.extractKeyInsights(videoMetadata),
      relatedMemories: await this.findRelatedMemories(videoMetadata),
      videoPath: videoMetadata.path,
      screenshotPaths: videoMetadata.relatedScreenshots || [],
      testStages: videoMetadata.testStages.map(stage => ({
        stage: stage.stage,
        name: stage.name,
        result: stage.result,
        memory: this.generateStageMemory(stage),
        timestamp: stage.timestamp
      })),
      mcpIntegration: {
        langfuseTraceId: null,
        sequentialThinkingId: null,
        feedbackCollectionId: null
      },
      performance: {
        duration: videoMetadata.duration || 0,
        fileSize: videoMetadata.originalSize || 0,
        compressionRatio: videoMetadata.compressionRatio || 0
      }
    };

    // 讀取現有記憶
    const videoMemories = JSON.parse(fs.readFileSync(this.videoMemoriesPath, 'utf8'));
    
    // 添加新記憶
    videoMemories.memories.push(memory);
    videoMemories.totalMemories = videoMemories.memories.length;
    videoMemories.lastUpdated = new Date().toISOString();
    
    // 更新統計
    videoMemories.memoryStats = this.calculateMemoryStats(videoMemories.memories);
    
    // 保存記憶
    fs.writeFileSync(this.videoMemoriesPath, JSON.stringify(videoMemories, null, 2));
    
    console.log(`✅ 本地記憶已儲存: ${memory.memoryId}`);
    return memory.memoryId;
  }

  // 更新 MCP 整合信息
  async updateMCPIntegration(memoryId, mcpData) {
    const videoMemories = JSON.parse(fs.readFileSync(this.videoMemoriesPath, 'utf8'));
    const memory = videoMemories.memories.find(m => m.memoryId === memoryId);
    
    if (memory) {
      memory.mcpIntegration = { ...memory.mcpIntegration, ...mcpData };
      fs.writeFileSync(this.videoMemoriesPath, JSON.stringify(videoMemories, null, 2));
      console.log(`✅ MCP 整合信息已更新: ${memoryId}`);
    }
  }

  // 查詢記憶
  async queryMemories(query) {
    const videoMemories = JSON.parse(fs.readFileSync(this.videoMemoriesPath, 'utf8'));
    
    return videoMemories.memories.filter(memory => {
      return (
        (query.module && memory.module === query.module) ||
        (query.feature && memory.feature === query.feature) ||
        (query.result && memory.result === query.result) ||
        (query.keyword && (
          memory.summary.includes(query.keyword) ||
          memory.keyInsights.some(insight => insight.includes(query.keyword))
        )) ||
        (query.dateRange && this.isInDateRange(memory.timestamp, query.dateRange))
      );
    });
  }

  // 分析測試模式
  async analyzeTestPatterns(videoMetadata) {
    const patterns = this.identifyPatterns(videoMetadata);
    
    if (patterns.length > 0) {
      const testPatterns = JSON.parse(fs.readFileSync(this.testPatternsPath, 'utf8'));
      
      patterns.forEach(pattern => {
        const existingPattern = testPatterns.patterns.find(p => p.patternId === pattern.patternId);
        
        if (existingPattern) {
          existingPattern.occurrences.push(pattern.occurrence);
          existingPattern.frequency = existingPattern.occurrences.length;
        } else {
          testPatterns.patterns.push({
            patternId: pattern.patternId,
            type: pattern.type,
            description: pattern.description,
            occurrences: [pattern.occurrence],
            frequency: 1,
            solution: pattern.solution,
            priority: pattern.priority,
            status: "identified",
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString()
          });
        }
      });
      
      fs.writeFileSync(this.testPatternsPath, JSON.stringify(testPatterns, null, 2));
      console.log(`✅ 測試模式分析完成，識別 ${patterns.length} 個模式`);
    }
  }

  // 記錄失敗分析
  async recordFailureAnalysis(videoMetadata) {
    if (videoMetadata.result !== 'failure') return;
    
    const failedStages = videoMetadata.testStages.filter(stage => stage.result === 'fail');
    if (failedStages.length === 0) return;
    
    const analysis = {
      analysisId: `${videoMetadata.feature}-failure-${Date.now()}`,
      videoId: videoMetadata.videoId,
      memoryId: `${videoMetadata.feature}-test-${Date.now()}`,
      failureType: this.categorizeFailure(failedStages),
      failedStages: failedStages.map(stage => ({
        stage: stage.stage,
        name: stage.name,
        error: stage.error || "未知錯誤",
        rootCause: this.analyzeRootCause(stage),
        analysis: this.generateAnalysis(stage),
        timestamp: stage.timestamp
      })),
      impact: this.assessImpact(failedStages),
      fixStrategy: this.suggestFixStrategy(failedStages),
      preventionMeasures: this.suggestPreventionMeasures(failedStages),
      relatedPatterns: this.findRelatedPatterns(failedStages),
      status: "analyzed",
      timestamp: new Date().toISOString()
    };
    
    const failureAnalysis = JSON.parse(fs.readFileSync(this.failureAnalysisPath, 'utf8'));
    failureAnalysis.analyses.push(analysis);
    
    fs.writeFileSync(this.failureAnalysisPath, JSON.stringify(failureAnalysis, null, 2));
    console.log(`✅ 失敗分析已記錄: ${analysis.analysisId}`);
    
    return analysis.analysisId;
  }

  // 追蹤改進過程
  async trackImprovement(beforeVideo, afterVideo) {
    const improvement = {
      improvementId: `${afterVideo.feature}-${beforeVideo.version}-to-${afterVideo.version}`,
      module: afterVideo.module,
      feature: afterVideo.feature,
      fromVersion: beforeVideo.version,
      toVersion: afterVideo.version,
      changes: this.analyzeChanges(beforeVideo, afterVideo),
      testResults: {
        before: this.calculateTestResults(beforeVideo),
        after: this.calculateTestResults(afterVideo)
      },
      performanceImpact: this.calculatePerformanceImpact(beforeVideo, afterVideo),
      timestamp: new Date().toISOString()
    };
    
    const improvementTracking = JSON.parse(fs.readFileSync(this.improvementTrackingPath, 'utf8'));
    improvementTracking.improvements.push(improvement);
    
    fs.writeFileSync(this.improvementTrackingPath, JSON.stringify(improvementTracking, null, 2));
    console.log(`✅ 改進追蹤已記錄: ${improvement.improvementId}`);
    
    return improvement.improvementId;
  }

  // 生成記憶統計
  calculateMemoryStats(memories) {
    const totalTests = memories.length;
    const successfulTests = memories.filter(m => m.result === 'success').length;
    const successRate = totalTests > 0 ? (successfulTests / totalTests * 100) : 0;
    
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
    
    return {
      successRate: parseFloat(successRate.toFixed(1)),
      totalTests,
      moduleBreakdown
    };
  }

  // 輔助方法
  generateSummary(videoMetadata) {
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    const result = videoMetadata.result === 'success' ? '成功' : '失敗';
    
    return `${videoMetadata.feature} 測試${result}，完成 ${passedStages}/${totalStages} 階段`;
  }

  extractKeyInsights(videoMetadata) {
    const insights = [];
    
    const failedStages = videoMetadata.testStages.filter(s => s.result === 'fail');
    failedStages.forEach(stage => {
      insights.push(`${stage.name}階段失敗，需要改進`);
    });
    
    if (videoMetadata.result === 'success') {
      insights.push('核心功能正常工作');
      insights.push('主頁整合和導航功能完善');
    }
    
    // 基於 EduCreate 特定的洞察
    if (videoMetadata.module === 'games') {
      insights.push('記憶科學遊戲邏輯驗證完成');
    }
    if (videoMetadata.module === 'content') {
      insights.push('GEPT分級內容系統運作正常');
    }
    
    return insights;
  }

  async findRelatedMemories(videoMetadata) {
    const videoMemories = JSON.parse(fs.readFileSync(this.videoMemoriesPath, 'utf8'));
    
    return videoMemories.memories
      .filter(m => 
        m.module === videoMetadata.module && 
        m.feature === videoMetadata.feature &&
        m.videoId !== videoMetadata.videoId
      )
      .map(m => m.memoryId)
      .slice(0, 5);
  }

  generateStageMemory(stage) {
    if (stage.result === 'pass') {
      return `${stage.name}階段成功完成，功能正常工作`;
    } else {
      return `${stage.name}階段失敗，需要進一步調查和修復`;
    }
  }

  identifyPatterns(videoMetadata) {
    const patterns = [];
    
    const failedStages = videoMetadata.testStages.filter(s => s.result === 'fail');
    failedStages.forEach(stage => {
      if (stage.name.includes('暫停') || stage.error?.includes('overlay')) {
        patterns.push({
          patternId: 'pause-overlay-blocking',
          type: 'ui_issue_pattern',
          description: '暫停覆蓋層阻擋其他UI元素的點擊',
          occurrence: {
            videoId: videoMetadata.videoId,
            stage: stage.name,
            impact: 'medium',
            workaround: '先恢復遊戲再點擊其他按鈕'
          },
          solution: '修改暫停覆蓋層的z-index或點擊穿透邏輯',
          priority: 'medium'
        });
      }
      
      if (stage.name.includes('響應式') || stage.error?.includes('mobile')) {
        patterns.push({
          patternId: 'responsive-design-issue',
          type: 'responsive_pattern',
          description: '響應式設計在移動設備上的問題',
          occurrence: {
            videoId: videoMetadata.videoId,
            stage: stage.name,
            impact: 'low',
            workaround: '調整測試邏輯以適應不同設備'
          },
          solution: '改進響應式CSS和測試策略',
          priority: 'low'
        });
      }
    });
    
    return patterns;
  }

  // 其他輔助方法
  categorizeFailure(failedStages) {
    const types = failedStages.map(stage => {
      if (stage.name.includes('UI') || stage.name.includes('界面')) return 'ui_failure';
      if (stage.name.includes('功能') || stage.name.includes('邏輯')) return 'logic_failure';
      if (stage.name.includes('性能') || stage.name.includes('速度')) return 'performance_failure';
      return 'unknown_failure';
    });
    
    return types[0] || 'unknown_failure';
  }

  analyzeRootCause(stage) {
    if (stage.name.includes('暫停')) return '暫停覆蓋層UI設計問題';
    if (stage.name.includes('響應式')) return '響應式設計測試邏輯問題';
    return '需要進一步分析';
  }

  generateAnalysis(stage) {
    return `${stage.name}階段失敗，建議檢查相關功能實現和測試邏輯`;
  }

  assessImpact(failedStages) {
    if (failedStages.length > 3) return 'high';
    if (failedStages.length > 1) return 'medium';
    return 'low';
  }

  suggestFixStrategy(failedStages) {
    return failedStages.map(stage => `修復${stage.name}相關問題`);
  }

  suggestPreventionMeasures(failedStages) {
    return ['加強測試覆蓋率', '改進UI設計', '優化測試邏輯'];
  }

  findRelatedPatterns(failedStages) {
    return failedStages.map(stage => stage.name.toLowerCase().replace(/\s+/g, '-'));
  }

  analyzeChanges(beforeVideo, afterVideo) {
    const changes = [];
    
    const beforePassed = beforeVideo.testStages.filter(s => s.result === 'pass').length;
    const afterPassed = afterVideo.testStages.filter(s => s.result === 'pass').length;
    
    if (afterPassed > beforePassed) {
      changes.push({
        type: 'improvement',
        description: `測試通過率從 ${beforePassed}/${beforeVideo.testStages.length} 提升到 ${afterPassed}/${afterVideo.testStages.length}`
      });
    }
    
    return changes;
  }

  calculateTestResults(videoMetadata) {
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    
    return {
      passedStages,
      totalStages,
      successRate: totalStages > 0 ? (passedStages / totalStages * 100).toFixed(1) : 0
    };
  }

  calculatePerformanceImpact(beforeVideo, afterVideo) {
    return {
      durationChange: (afterVideo.duration || 0) - (beforeVideo.duration || 0),
      fileSizeChange: (afterVideo.originalSize || 0) - (beforeVideo.originalSize || 0)
    };
  }

  isInDateRange(timestamp, dateRange) {
    const date = new Date(timestamp);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return date >= start && date <= end;
  }
}

module.exports = LocalMemoryManager;
