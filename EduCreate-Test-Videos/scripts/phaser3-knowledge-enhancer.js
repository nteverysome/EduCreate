#!/usr/bin/env node

/**
 * Phaser 3 知識增強器
 * 透過 MCP 工具自動獲取官方資源並更新學習系統
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class Phaser3KnowledgeEnhancer {
  constructor() {
    this.persistenceScript = path.join(__dirname, 'phaser3-learning-persistence.js');
    
    // 官方資源 URL 清單
    this.officialResources = {
      tutorials: [
        'https://phaser.io/tutorials/making-your-first-phaser-3-game/part1',
        'https://phaser.io/tutorials/making-your-first-phaser-3-game/part2',
        'https://phaser.io/tutorials/making-your-first-phaser-3-game/part3',
        'https://phaser.io/tutorials/getting-started-with-phaser-launcher'
      ],
      examples: [
        'https://phaser.io/examples/v3.85.0/scalemanager',
        'https://phaser.io/examples/v3.85.0/game-config',
        'https://phaser.io/examples/v3.85.0/physics',
        'https://phaser.io/examples/v3.85.0/input'
      ],
      documentation: [
        'https://docs.phaser.io/api-documentation/class/scale-scalemanager',
        'https://phaser.io/download/stable'
      ]
    };
    
    // 知識分類
    this.knowledgeCategories = {
      scale_manager: 'Scale Manager 縮放管理',
      physics: 'Physics 物理系統',
      input: 'Input 輸入處理',
      assets: 'Assets 資源管理',
      scenes: 'Scenes 場景管理',
      config: 'Config 配置設定'
    };
  }

  /**
   * 執行知識增強流程
   */
  async enhanceKnowledge(category = 'all') {
    console.log('🚀 開始 Phaser 3 知識增強流程...');
    
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      newKnowledge: []
    };

    if (category === 'all') {
      // 處理所有分類
      for (const [cat, urls] of Object.entries(this.officialResources)) {
        console.log(`📚 處理分類: ${cat}`);
        const categoryResults = await this.processCategory(cat, urls);
        this.mergeResults(results, categoryResults);
      }
    } else {
      // 處理特定分類
      const urls = this.officialResources[category];
      if (urls) {
        const categoryResults = await this.processCategory(category, urls);
        this.mergeResults(results, categoryResults);
      }
    }

    console.log('📊 知識增強完成統計:');
    console.log(`  處理項目: ${results.processed}`);
    console.log(`  成功項目: ${results.successful}`);
    console.log(`  失敗項目: ${results.failed}`);
    console.log(`  新增知識: ${results.newKnowledge.length}`);

    return results;
  }

  /**
   * 處理特定分類的資源
   */
  async processCategory(category, urls) {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      newKnowledge: []
    };

    for (const url of urls) {
      results.processed++;
      
      try {
        console.log(`🔍 獲取資源: ${url}`);
        
        // 這裡需要實際的 web-fetch 功能
        // 由於我們在 Node.js 環境中，需要使用適當的方法
        const knowledge = await this.extractKnowledgeFromUrl(url);
        
        if (knowledge) {
          // 記錄到學習系統
          await this.recordKnowledge(category, knowledge);
          results.successful++;
          results.newKnowledge.push(knowledge);
          
          console.log(`✅ 成功記錄知識: ${knowledge.title}`);
        }
        
        // 避免過於頻繁的請求
        await this.delay(1000);
        
      } catch (error) {
        console.log(`❌ 處理失敗: ${url} - ${error.message}`);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * 從 URL 提取知識（模擬實現）
   */
  async extractKnowledgeFromUrl(url) {
    // 這是一個模擬實現
    // 實際應該使用 MCP web-fetch 工具
    
    const urlPatterns = {
      'scalemanager': {
        title: 'Scale Manager 官方範例',
        content: 'Phaser 3 提供完整的 Scale Manager 範例，包含 Envelop、Fit、Resize 等模式',
        category: 'scale_manager'
      },
      'tutorial': {
        title: 'Phaser 3 官方教學',
        content: '官方教學涵蓋基礎配置、場景生命週期、資源載入等核心概念',
        category: 'config'
      },
      'physics': {
        title: 'Physics 物理系統範例',
        content: 'Arcade Physics 和 Matter.js 物理引擎的完整範例和最佳實踐',
        category: 'physics'
      }
    };

    // 根據 URL 模式匹配知識
    for (const [pattern, knowledge] of Object.entries(urlPatterns)) {
      if (url.includes(pattern)) {
        return {
          ...knowledge,
          url,
          timestamp: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * 記錄知識到學習系統
   */
  async recordKnowledge(category, knowledge) {
    const command = `node "${this.persistenceScript}" record-error "${knowledge.category}_official_${Date.now()}" "${knowledge.title}" "${knowledge.content}"`;
    
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * 生成知識增強報告
   */
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_processed: results.processed,
        successful_additions: results.successful,
        failed_attempts: results.failed,
        success_rate: `${((results.successful / results.processed) * 100).toFixed(1)}%`
      },
      new_knowledge: results.newKnowledge.map(k => ({
        title: k.title,
        category: k.category,
        url: k.url
      })),
      recommendations: this.generateRecommendations(results)
    };

    // 保存報告
    const reportPath = path.join(__dirname, '../reports/knowledge-enhancement-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * 生成改進建議
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.failed > 0) {
      recommendations.push('考慮檢查網絡連接或 URL 有效性');
    }

    if (results.successful > 5) {
      recommendations.push('知識庫已大幅增強，建議運行 reminder 腳本查看更新');
    }

    if (results.newKnowledge.length > 0) {
      recommendations.push('新增知識已整合到學習系統，下次對話將自動提醒');
    }

    return recommendations;
  }

  /**
   * 輔助方法
   */
  mergeResults(target, source) {
    target.processed += source.processed;
    target.successful += source.successful;
    target.failed += source.failed;
    target.newKnowledge.push(...source.newKnowledge);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 命令行接口
if (require.main === module) {
  const enhancer = new Phaser3KnowledgeEnhancer();
  const command = process.argv[2] || 'all';

  switch (command) {
    case 'enhance':
      const category = process.argv[3] || 'all';
      enhancer.enhanceKnowledge(category)
        .then(results => {
          const report = enhancer.generateReport(results);
          console.log('\n📋 知識增強報告:');
          console.log(JSON.stringify(report.summary, null, 2));
        })
        .catch(error => {
          console.error('❌ 知識增強失敗:', error.message);
        });
      break;

    case 'categories':
      console.log('📚 可用的知識分類:');
      Object.entries(enhancer.knowledgeCategories).forEach(([key, name]) => {
        console.log(`  ${key}: ${name}`);
      });
      break;

    default:
      console.log('🎯 Phaser 3 知識增強器');
      console.log('使用方法:');
      console.log('  node phaser3-knowledge-enhancer.js enhance [category]  # 增強知識');
      console.log('  node phaser3-knowledge-enhancer.js categories         # 查看分類');
      console.log('');
      console.log('範例:');
      console.log('  node phaser3-knowledge-enhancer.js enhance scale_manager');
      console.log('  node phaser3-knowledge-enhancer.js enhance all');
  }
}

module.exports = Phaser3KnowledgeEnhancer;
