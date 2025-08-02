#!/usr/bin/env node
// scripts/utils/initialize-system.js
// EduCreate 測試影片管理系統初始化腳本

const fs = require('fs');
const path = require('path');

class SystemInitializer {
  constructor() {
    this.baseDir = '.'; // 當前目錄就是 EduCreate-Test-Videos
  }

  // 初始化整個系統
  async initialize() {
    console.log('🚀 初始化 EduCreate 測試影片管理系統...');

    try {
      // 1. 初始化本地記憶系統
      await this.initializeLocalMemory();
      
      // 2. 初始化元數據文件
      await this.initializeMetadata();
      
      // 3. 創建示例配置
      await this.createSampleConfig();
      
      // 4. 驗證系統完整性
      await this.verifySystem();
      
      console.log('✅ 系統初始化完成！');
      console.log('\n📋 下一步操作：');
      console.log('1. 將測試影片放入 test-results/ 目錄');
      console.log('2. 運行: node EduCreate-Test-Videos/scripts/automation/process-test-videos.js');
      console.log('3. 查看報告: EduCreate-Test-Videos/reports/');
      
    } catch (error) {
      console.error('❌ 系統初始化失敗:', error.message);
      process.exit(1);
    }
  }

  // 初始化本地記憶系統
  async initializeLocalMemory() {
    console.log('🧠 初始化本地記憶系統...');
    
    const memoryDir = `${this.baseDir}/local-memory`;
    
    // 確保目錄存在
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }

    const memoryFiles = {
      'video-memories.json': {
        memories: [],
        totalMemories: 0,
        lastUpdated: new Date().toISOString(),
        memoryStats: {
          successRate: 0,
          totalTests: 0,
          moduleBreakdown: {}
        }
      },
      'test-patterns.json': {
        patterns: []
      },
      'failure-analysis.json': {
        analyses: []
      },
      'improvement-tracking.json': {
        improvements: []
      },
      'performance-metrics.json': {
        metrics: []
      },
      'knowledge-base.json': {
        knowledge: []
      }
    };

    // 創建記憶文件
    Object.entries(memoryFiles).forEach(([fileName, content]) => {
      const filePath = path.join(memoryDir, fileName);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`   ✅ 創建: ${fileName}`);
      } else {
        console.log(`   ⏭️ 已存在: ${fileName}`);
      }
    });
  }

  // 初始化元數據文件
  async initializeMetadata() {
    console.log('📊 初始化元數據系統...');
    
    const metadataDir = `${this.baseDir}/metadata`;
    
    const metadataFiles = {
      'test-catalog.json': {
        tests: [],
        lastUpdated: null,
        stats: {
          totalTests: 0,
          successTests: 0,
          failureTests: 0,
          successRate: 0,
          moduleStats: {},
          totalOriginalSizeMB: 0,
          totalCompressedSizeMB: 0,
          totalSpaceSavedMB: 0
        }
      },
      'version-history.json': {
        versions: []
      },
      'compression-stats.json': {
        compressions: [],
        totalStats: {
          totalCompressions: 0,
          totalOriginalSizeMB: 0,
          totalCompressedSizeMB: 0,
          totalSpaceSavedMB: 0,
          averageCompressionRatio: 0,
          averageCompressionTime: 0,
          spaceSavingPercentage: 0,
          lastUpdated: new Date().toISOString()
        },
        qualityStats: {},
        moduleStats: {}
      },
      'cleanup-stats.json': {
        cleanupHistory: [],
        totalStats: {
          totalCleanups: 0,
          totalVersionsDeleted: 0,
          totalSpaceFreedMB: 0,
          lastCleanup: null
        }
      }
    };

    Object.entries(metadataFiles).forEach(([fileName, content]) => {
      const filePath = path.join(metadataDir, fileName);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`   ✅ 創建: ${fileName}`);
      } else {
        console.log(`   ⏭️ 已存在: ${fileName}`);
      }
    });
  }

  // 創建示例配置
  async createSampleConfig() {
    console.log('⚙️ 創建示例配置...');
    
    const configDir = `${this.baseDir}/config`;
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const sampleConfig = {
      system: {
        name: "EduCreate 測試影片管理系統",
        version: "1.0.0",
        description: "基於記憶科學的智能教育遊戲測試影片管理系統"
      },
      compression: {
        defaultQuality: "standard",
        qualities: {
          high: {
            description: "高質量 - 用於失敗測試分析",
            videoBitrate: "1.5M",
            resolution: "1920x1080"
          },
          standard: {
            description: "標準質量 - 日常測試使用",
            videoBitrate: "1M",
            resolution: "1280x720"
          },
          archive: {
            description: "歸檔質量 - 長期保存",
            videoBitrate: "600k",
            resolution: "1280x720"
          }
        }
      },
      modules: {
        games: {
          name: "遊戲模組",
          features: ["match-game", "fill-in-game", "quiz-game", "sequence-game", "flashcard-game"],
          priority: "high",
          memoryScienceFocus: true
        },
        content: {
          name: "內容模組",
          features: ["ai-content-generation", "rich-text-editor", "gept-grading"],
          priority: "high",
          geptIntegration: true
        },
        "file-space": {
          name: "檔案空間模組",
          features: ["file-manager", "auto-save", "sharing"],
          priority: "medium"
        },
        system: {
          name: "系統模組",
          features: ["homepage", "navigation", "dashboard"],
          priority: "medium"
        }
      },
      archiving: {
        keepRecentVersions: 3,
        keepSuccessVersions: 6,
        keepCriticalVersions: 12,
        criticalModules: ["games", "content"]
      },
      reporting: {
        generateDaily: true,
        generateWeekly: true,
        generateMonthly: true,
        dashboardUpdateInterval: 300000
      }
    };

    const configPath = path.join(configDir, 'system-config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));
      console.log(`   ✅ 創建: system-config.json`);
    } else {
      console.log(`   ⏭️ 已存在: system-config.json`);
    }
  }

  // 驗證系統完整性
  async verifySystem() {
    console.log('🔍 驗證系統完整性...');
    
    const requiredDirectories = [
      'current/success/games',
      'current/success/content',
      'current/success/file-space',
      'current/success/system',
      'current/failure/games',
      'current/failure/content',
      'current/failure/file-space',
      'current/failure/system',
      'archive',
      'local-memory',
      'mcp-integration/langfuse-traces',
      'mcp-integration/sequential-thinking',
      'mcp-integration/feedback-collection',
      'metadata',
      'compressed',
      'reports/daily',
      'reports/weekly',
      'reports/monthly',
      'reports/dashboard'
    ];

    const requiredFiles = [
      'scripts/core/LocalMemoryManager.js',
      'scripts/core/MCPIntegrationManager.js',
      'scripts/core/CompressionManager.js',
      'scripts/core/TestVideoProcessor.js',
      'scripts/automation/process-test-videos.js',
      'scripts/automation/generate-reports.js',
      'local-memory/video-memories.json',
      'local-memory/test-patterns.json',
      'metadata/test-catalog.json',
      'metadata/compression-stats.json'
    ];

    let allValid = true;

    // 檢查目錄
    console.log('   檢查必要目錄...');
    requiredDirectories.forEach(dir => {
      const fullPath = path.join(this.baseDir, dir);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${dir}`);
      } else {
        console.log(`   ❌ 缺少目錄: ${dir}`);
        allValid = false;
      }
    });

    // 檢查文件
    console.log('   檢查必要文件...');
    requiredFiles.forEach(file => {
      const fullPath = path.join(this.baseDir, file);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ 缺少文件: ${file}`);
        allValid = false;
      }
    });

    if (!allValid) {
      throw new Error('系統完整性檢查失敗，請檢查缺少的目錄和文件');
    }

    console.log('   ✅ 系統完整性檢查通過');
  }

  // 顯示系統狀態
  async showSystemStatus() {
    console.log('\n📊 系統狀態概覽:');
    
    try {
      // 檢查本地記憶
      const memoryPath = `${this.baseDir}/local-memory/video-memories.json`;
      if (fs.existsSync(memoryPath)) {
        const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        console.log(`   🧠 記憶系統: ${memory.totalMemories} 個記憶`);
      }

      // 檢查測試目錄
      const catalogPath = `${this.baseDir}/metadata/test-catalog.json`;
      if (fs.existsSync(catalogPath)) {
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        console.log(`   📊 測試目錄: ${catalog.tests.length} 個測試`);
      }

      // 檢查當前影片
      const currentSuccessDir = `${this.baseDir}/current/success`;
      const currentFailureDir = `${this.baseDir}/current/failure`;
      
      let totalVideos = 0;
      if (fs.existsSync(currentSuccessDir)) {
        totalVideos += this.countVideosInDirectory(currentSuccessDir);
      }
      if (fs.existsSync(currentFailureDir)) {
        totalVideos += this.countVideosInDirectory(currentFailureDir);
      }
      
      console.log(`   🎬 當前影片: ${totalVideos} 個`);

      // 檢查歸檔版本
      const archiveDir = `${this.baseDir}/archive`;
      if (fs.existsSync(archiveDir)) {
        const versions = fs.readdirSync(archiveDir).length;
        console.log(`   📦 歸檔版本: ${versions} 個`);
      }

    } catch (error) {
      console.log('   ⚠️ 無法獲取完整狀態信息');
    }
  }

  // 計算目錄中的影片數量
  countVideosInDirectory(dir) {
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
        // 忽略讀取錯誤
      }
    };
    
    scanDir(dir);
    return count;
  }
}

// 主函數
async function main() {
  const initializer = new SystemInitializer();
  
  try {
    await initializer.initialize();
    await initializer.showSystemStatus();
  } catch (error) {
    console.error('❌ 初始化失敗:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SystemInitializer;
