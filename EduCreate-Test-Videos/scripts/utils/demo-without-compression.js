#!/usr/bin/env node
// scripts/utils/demo-without-compression.js
// EduCreate 測試影片管理系統演示腳本（不包含壓縮功能）

const fs = require('fs');
const path = require('path');
const LocalMemoryManager = require('../core/LocalMemoryManager');
const MCPIntegrationManager = require('../core/MCPIntegrationManager');

class DemoProcessor {
  constructor() {
    this.memoryManager = new LocalMemoryManager();
    this.mcpManager = new MCPIntegrationManager();
  }

  // 演示處理現有的測試影片
  async demonstrateSystem() {
    console.log('🎬 EduCreate 測試影片管理系統演示');
    console.log('   (簡化版本 - 不包含影片壓縮功能)');

    try {
      // 1. 掃描現有的已組織影片
      const videos = await this.scanOrganizedVideos();
      
      if (videos.length === 0) {
        console.log('❌ 沒有找到已組織的測試影片');
        return;
      }

      console.log(`\n📁 發現 ${videos.length} 個已組織的測試影片:`);
      videos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.module}/${video.feature} - ${video.result}`);
      });

      // 2. 為每個影片創建完整的處理記錄
      for (const video of videos) {
        console.log(`\n🎯 處理影片: ${video.fileName}`);
        await this.processVideoDemo(video);
      }

      // 3. 生成演示報告
      await this.generateDemoReport();

      // 4. 顯示系統狀態
      await this.showSystemStatus();

      console.log('\n✅ 演示完成！');
      console.log('\n📋 查看結果:');
      console.log('   本地記憶: EduCreate-Test-Videos/local-memory/');
      console.log('   MCP整合: EduCreate-Test-Videos/mcp-integration/');
      console.log('   報告: EduCreate-Test-Videos/reports/');

    } catch (error) {
      console.error('❌ 演示失敗:', error.message);
      throw error;
    }
  }

  // 掃描已組織的影片
  async scanOrganizedVideos() {
    const videos = [];
    const currentDir = 'EduCreate-Test-Videos/current';

    const results = ['success', 'failure'];
    const modules = ['games', 'content', 'file-space', 'system'];

    for (const result of results) {
      for (const module of modules) {
        const moduleDir = path.join(currentDir, result, module);
        
        if (fs.existsSync(moduleDir)) {
          const features = fs.readdirSync(moduleDir);
          
          for (const feature of features) {
            const featureDir = path.join(moduleDir, feature);
            
            if (fs.statSync(featureDir).isDirectory()) {
              const videoFiles = fs.readdirSync(featureDir)
                .filter(file => file.endsWith('.webm'));
              
              for (const videoFile of videoFiles) {
                const videoPath = path.join(featureDir, videoFile);
                const fileStats = fs.statSync(videoPath);
                
                videos.push({
                  fileName: videoFile,
                  path: videoPath,
                  module,
                  feature,
                  result,
                  size: fileStats.size,
                  modifiedTime: fileStats.mtime
                });
              }
            }
          }
        }
      }
    }

    return videos;
  }

  // 處理單個影片的演示
  async processVideoDemo(video) {
    // 生成模擬的測試元數據
    const metadata = this.generateDemoMetadata(video);
    
    console.log(`   📊 生成元數據: ${metadata.testStages.length} 個測試階段`);

    // 1. 儲存到本地記憶系統
    const memoryId = await this.memoryManager.storeVideoMemory(metadata);
    console.log(`   🧠 記憶ID: ${memoryId}`);

    // 2. 整合 Langfuse MCP
    const langfuseTraceId = await this.mcpManager.integrateWithLangfuse(metadata);
    console.log(`   📈 Langfuse追蹤: ${langfuseTraceId}`);

    // 3. 整合 sequential-thinking
    const sequentialThinkingId = await this.mcpManager.integrateWithSequentialThinking(metadata);
    console.log(`   🧠 邏輯推理: ${sequentialThinkingId}`);

    // 4. 如果是失敗測試，整合反饋收集
    let feedbackId = null;
    if (metadata.result === 'failure') {
      feedbackId = await this.mcpManager.integrateWithFeedbackCollector(metadata);
      if (feedbackId) {
        console.log(`   💬 反饋收集: ${feedbackId}`);
      }
    }

    // 5. 更新 MCP 整合信息
    await this.memoryManager.updateMCPIntegration(memoryId, {
      langfuseTraceId,
      sequentialThinkingId,
      feedbackCollectionId: feedbackId
    });

    // 6. 分析測試模式
    await this.memoryManager.analyzeTestPatterns(metadata);

    // 7. 記錄失敗分析（如果適用）
    if (metadata.result === 'failure') {
      await this.memoryManager.recordFailureAnalysis(metadata);
    }

    console.log(`   ✅ 處理完成`);
  }

  // 生成演示用的元數據
  generateDemoMetadata(video) {
    const now = new Date();
    const videoId = video.fileName.replace('.webm', '');
    
    // 從文件名解析信息
    const parts = videoId.split('_');
    const date = parts[0] || now.toISOString().slice(0, 10).replace(/-/g, '');
    const version = parts[4] || 'v1.0.0';
    const sequence = parts[5] || '001';

    // 生成測試階段
    const testStages = this.generateDemoTestStages(video.module, video.feature, video.result);

    return {
      videoId,
      originalFileName: video.fileName,
      module: video.module,
      feature: video.feature,
      testName: `${video.feature} 測試演示`,
      result: video.result,
      version,
      sequence,
      testDate: video.modifiedTime.toISOString(),
      originalSize: video.size,
      duration: 80, // 假設80秒
      testStages,
      relatedScreenshots: [],
      path: video.path,
      metadata: {
        isMemoryScienceTest: video.module === 'games',
        isGEPTTest: video.feature.includes('gept'),
        isAccessibilityTest: false,
        priority: video.result === 'failure' ? 'high' : 'medium'
      }
    };
  }

  // 生成演示用的測試階段
  generateDemoTestStages(module, feature, result) {
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

      if (feature === 'match-game') {
        baseStages.push(
          { stage: 7, name: '配對邏輯測試', result: 'pass', timestamp: new Date().toISOString() },
          { stage: 8, name: '計分系統', result: 'pass', timestamp: new Date().toISOString() },
          { stage: 9, name: '時間管理', result: 'pass', timestamp: new Date().toISOString() },
          { stage: 10, name: '完成流程', result: 'pass', timestamp: new Date().toISOString() }
        );

        if (result === 'failure') {
          baseStages.push(
            { stage: 11, name: '響應式設計測試', result: 'fail', timestamp: new Date().toISOString(), error: 'game-config element not found in mobile view' },
            { stage: 12, name: '返回配置測試', result: 'fail', timestamp: new Date().toISOString(), error: 'pause overlay blocking other elements' }
          );
        }
      }
    } else if (module === 'content') {
      baseStages.push(
        { stage: 4, name: 'GEPT分級測試', result: 'pass', timestamp: new Date().toISOString() },
        { stage: 5, name: 'AI內容生成', result: result === 'success' ? 'pass' : 'fail', timestamp: new Date().toISOString() }
      );
    }

    return baseStages;
  }

  // 生成演示報告
  async generateDemoReport() {
    console.log('\n📊 生成演示報告...');

    const reportPath = `EduCreate-Test-Videos/reports/daily/demo-report-${new Date().toISOString().slice(0, 10)}.md`;
    
    // 讀取記憶數據
    const videoMemories = JSON.parse(fs.readFileSync('EduCreate-Test-Videos/local-memory/video-memories.json', 'utf8'));
    
    const report = `# EduCreate 測試影片管理系統演示報告

**生成時間**: ${new Date().toLocaleString()}  
**演示版本**: 1.0.0 (簡化版本 - 不包含壓縮功能)

## 📊 演示摘要

- **處理影片數**: ${videoMemories.totalMemories}
- **成功測試**: ${videoMemories.memories.filter(m => m.result === 'success').length}
- **失敗測試**: ${videoMemories.memories.filter(m => m.result === 'failure').length}
- **整體成功率**: ${videoMemories.memoryStats.successRate}%

## 🎯 模組分佈

${Object.entries(videoMemories.memoryStats.moduleBreakdown).map(([module, stats]) => `
### ${module} 模組
- 總測試: ${stats.total}
- 成功: ${stats.success}
- 失敗: ${stats.failure}
- 成功率: ${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%
`).join('')}

## 🧠 記憶洞察

${videoMemories.memories.map(memory => `
### ${memory.feature} 測試記憶
- **記憶ID**: ${memory.memoryId}
- **測試結果**: ${memory.result}
- **關鍵洞察**: ${memory.keyInsights.join(', ')}
- **MCP整合**: 
  - Langfuse: ${memory.mcpIntegration.langfuseTraceId || '未設置'}
  - Sequential Thinking: ${memory.mcpIntegration.sequentialThinkingId || '未設置'}
`).join('')}

## 🔗 MCP 工具整合狀態

### Langfuse MCP 追蹤
- 追蹤文件數: ${fs.readdirSync('EduCreate-Test-Videos/mcp-integration/langfuse-traces').length}
- 位置: EduCreate-Test-Videos/mcp-integration/langfuse-traces/

### Sequential Thinking 記錄
- 思考記錄數: ${this.countFilesInDirectory('EduCreate-Test-Videos/mcp-integration/sequential-thinking')}
- 位置: EduCreate-Test-Videos/mcp-integration/sequential-thinking/

### 反饋收集
- 反饋請求數: ${this.countFilesInDirectory('EduCreate-Test-Videos/mcp-integration/feedback-collection')}
- 位置: EduCreate-Test-Videos/mcp-integration/feedback-collection/

## 💡 系統特色

1. **本地記憶系統**: 完全自主的測試記憶管理，無需外部依賴
2. **MCP 工具整合**: 深度整合 Langfuse 和 Sequential Thinking
3. **智能模式識別**: 自動識別測試失敗模式並提供改進建議
4. **EduCreate 特化**: 針對記憶科學和 GEPT 分級的特殊處理

## 🚀 下一步

1. 安裝 FFmpeg 以啟用影片壓縮功能
2. 添加更多測試影片進行完整演示
3. 設置定期報告生成
4. 配置版本歸檔策略

---
*此報告由 EduCreate 測試影片管理系統自動生成*
`;

    // 確保報告目錄存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`   ✅ 演示報告已生成: ${reportPath}`);
  }

  // 顯示系統狀態
  async showSystemStatus() {
    console.log('\n📊 系統狀態:');

    // 本地記憶統計
    const videoMemories = JSON.parse(fs.readFileSync('EduCreate-Test-Videos/local-memory/video-memories.json', 'utf8'));
    console.log(`   🧠 本地記憶: ${videoMemories.totalMemories} 個記憶`);

    // MCP 整合統計
    const langfuseFiles = fs.readdirSync('EduCreate-Test-Videos/mcp-integration/langfuse-traces').length;
    const sequentialFiles = this.countFilesInDirectory('EduCreate-Test-Videos/mcp-integration/sequential-thinking');
    const feedbackFiles = this.countFilesInDirectory('EduCreate-Test-Videos/mcp-integration/feedback-collection');

    console.log(`   📈 Langfuse 追蹤: ${langfuseFiles} 個文件`);
    console.log(`   🧠 Sequential Thinking: ${sequentialFiles} 個記錄`);
    console.log(`   💬 反饋收集: ${feedbackFiles} 個請求`);

    // 影片統計
    const currentVideos = this.countVideosInDirectory('EduCreate-Test-Videos/current');
    console.log(`   🎬 當前影片: ${currentVideos} 個`);
  }

  // 計算目錄中的文件數量
  countFilesInDirectory(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const scanDir = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else {
            count++;
          }
        });
      } catch (error) {
        // 忽略錯誤
      }
    };
    
    scanDir(dir);
    return count;
  }

  // 計算影片數量
  countVideosInDirectory(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const scanDir = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (item.endsWith('.webm')) {
            count++;
          }
        });
      } catch (error) {
        // 忽略錯誤
      }
    };
    
    scanDir(dir);
    return count;
  }
}

// 主函數
async function main() {
  const demo = new DemoProcessor();
  
  try {
    await demo.demonstrateSystem();
  } catch (error) {
    console.error('❌ 演示失敗:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DemoProcessor;
