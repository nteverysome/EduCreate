#!/usr/bin/env node

/**
 * Phaser 3 自動檢測腳本
 * 檢測任務或對話是否涉及 Phaser 3，自動觸發相關工作流程
 */

const { spawn } = require('child_process');
const path = require('path');

class Phaser3AutoDetector {
  constructor() {
    this.phaser3Keywords = [
      // 直接關鍵詞
      'phaser', 'Phaser', 'phaser3', 'Phaser 3', 'PHASER',
      
      // 遊戲相關
      '遊戲', 'game', 'Game', 'GAME', 'gaming', 'Gaming',
      'sprite', 'Sprite', 'scene', 'Scene',
      
      // EduCreate 遊戲組件
      'AirplaneCollisionGame', 'GameScene', 'GameSwitcher',
      'MemoryGame', 'FlashcardGame', 'QuizGame',
      
      // 文件路徑模式
      '/games/', 'Game.tsx', 'Game.ts', 'game.js',
      'components/games', 'phaser3-'
    ];
    
    this.phaser3FilePatterns = [
      /\/games\//i,
      /Game\.(tsx|ts|js)$/i,
      /phaser/i,
      /sprite/i,
      /scene/i
    ];
  }

  /**
   * 檢測文本是否涉及 Phaser 3
   */
  detectPhaser3InText(text) {
    if (!text || typeof text !== 'string') {
      return { detected: false, matches: [] };
    }

    const matches = [];
    const lowerText = text.toLowerCase();

    // 檢查關鍵詞
    for (const keyword of this.phaser3Keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches.push({
          type: 'keyword',
          match: keyword,
          context: this.getContext(text, keyword)
        });
      }
    }

    // 檢查文件路徑模式
    for (const pattern of this.phaser3FilePatterns) {
      const patternMatches = text.match(pattern);
      if (patternMatches) {
        matches.push({
          type: 'file_pattern',
          match: patternMatches[0],
          context: this.getContext(text, patternMatches[0])
        });
      }
    }

    return {
      detected: matches.length > 0,
      matches,
      confidence: this.calculateConfidence(matches)
    };
  }

  /**
   * 獲取匹配的上下文
   */
  getContext(text, match) {
    const index = text.toLowerCase().indexOf(match.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + match.length + 30);
    
    return text.substring(start, end);
  }

  /**
   * 計算檢測信心度
   */
  calculateConfidence(matches) {
    if (matches.length === 0) return 0;
    
    let score = 0;
    for (const match of matches) {
      if (match.type === 'keyword') {
        if (['phaser', 'Phaser', 'phaser3'].includes(match.match)) {
          score += 10; // 高權重
        } else if (['遊戲', 'game', 'Game'].includes(match.match)) {
          score += 5; // 中權重
        } else {
          score += 3; // 低權重
        }
      } else if (match.type === 'file_pattern') {
        score += 8; // 文件模式權重
      }
    }
    
    return Math.min(100, score * 10); // 轉換為百分比
  }

  /**
   * 檢測任務描述
   */
  async detectInTask(taskDescription) {
    console.log('🔍 檢測任務是否涉及 Phaser 3...');
    
    const result = this.detectPhaser3InText(taskDescription);
    
    if (result.detected) {
      console.log(`✅ 檢測到 Phaser 3 相關內容 (信心度: ${result.confidence}%)`);
      console.log('匹配項目:', result.matches.map(m => m.match).join(', '));
      
      // 自動觸發 Phaser 3 工作流程
      await this.triggerPhaser3Workflow(result);
      
      return { detected: true, ...result };
    } else {
      console.log('❌ 未檢測到 Phaser 3 相關內容');
      return { detected: false };
    }
  }

  /**
   * 觸發 Phaser 3 工作流程
   */
  async triggerPhaser3Workflow(detectionResult) {
    console.log('\n🚀 自動觸發 Phaser 3 學習工作流程...');
    
    try {
      // 1. 運行 Phaser 3 學習提醒
      console.log('📚 載入 Phaser 3 學習記憶...');
      await this.runCommand('node', [
        'EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js',
        'reminder'
      ]);
      
      // 2. 顯示檢測結果
      console.log('\n🎯 Phaser 3 檢測結果:');
      console.log(`信心度: ${detectionResult.confidence}%`);
      console.log('匹配項目:');
      detectionResult.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.match} (${match.type})`);
        console.log(`     上下文: "${match.context}"`);
      });
      
      // 3. 提醒關鍵要點
      console.log('\n🚨 Phaser 3 開發提醒:');
      console.log('1. 不要在 create() 之前訪問 scene 屬性');
      console.log('2. 所有資源必須在 preload() 中載入');
      console.log('3. 物理精靈使用 this.physics.add.sprite()');
      console.log('4. 縮放管理使用內建的 Scale Manager');
      console.log('5. 檢查瀏覽器控制台錯誤');
      
      console.log('\n✅ Phaser 3 工作流程已自動觸發');
      
    } catch (error) {
      console.error('❌ 觸發 Phaser 3 工作流程失敗:', error.message);
    }
  }

  /**
   * 運行命令
   */
  runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`命令執行失敗，退出碼: ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 檢測文件路徑
   */
  detectInFilePaths(filePaths) {
    if (!Array.isArray(filePaths)) {
      filePaths = [filePaths];
    }
    
    const matches = [];
    for (const filePath of filePaths) {
      const result = this.detectPhaser3InText(filePath);
      if (result.detected) {
        matches.push({
          filePath,
          ...result
        });
      }
    }
    
    return {
      detected: matches.length > 0,
      matches
    };
  }

  /**
   * 檢測當前工作目錄的文件
   */
  async detectInCurrentFiles() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const files = fs.readdirSync('.', { recursive: true })
        .filter(file => typeof file === 'string')
        .slice(0, 100); // 限制檢查文件數量
      
      return this.detectInFilePaths(files);
    } catch (error) {
      console.warn('檢測當前文件失敗:', error.message);
      return { detected: false, matches: [] };
    }
  }
}

// 命令行接口
if (require.main === module) {
  const detector = new Phaser3AutoDetector();
  const command = process.argv[2];
  const input = process.argv[3];

  switch (command) {
    case 'detect':
      if (!input) {
        console.log('請提供要檢測的文本');
        console.log('使用方法: node auto-detect-phaser3.js detect "任務描述"');
        process.exit(1);
      }
      
      detector.detectInTask(input)
        .then(result => {
          console.log('\n📊 檢測結果:', JSON.stringify(result, null, 2));
        })
        .catch(error => {
          console.error('❌ 檢測失敗:', error);
        });
      break;
      
    case 'detect-files':
      detector.detectInCurrentFiles()
        .then(result => {
          console.log('📁 文件檢測結果:', JSON.stringify(result, null, 2));
        })
        .catch(error => {
          console.error('❌ 文件檢測失敗:', error);
        });
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node auto-detect-phaser3.js detect "任務描述"');
      console.log('  node auto-detect-phaser3.js detect-files');
  }
}

module.exports = Phaser3AutoDetector;
