#!/usr/bin/env node

/**
 * Phaser 3 自動觸發系統
 * 在每次 AI 回應前自動檢查並觸發 Phaser 3 學習系統
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AutoPhaser3Trigger {
  constructor() {
    this.triggerFile = path.join(__dirname, '../local-memory/phaser3-auto-trigger.json');
    this.lastCheckFile = path.join(__dirname, '../local-memory/phaser3-last-check.json');
    
    // 初始化觸發記錄
    this.initializeTriggerSystem();
  }

  /**
   * 初始化觸發系統
   */
  initializeTriggerSystem() {
    if (!fs.existsSync(this.triggerFile)) {
      const initialData = {
        auto_trigger_enabled: true,
        trigger_keywords: [
          'phaser', 'Phaser', 'phaser3', 'Phaser 3',
          '遊戲', 'game', 'Game', 'sprite', 'scene',
          'AirplaneCollisionGame', 'GameScene', 'GameSwitcher'
        ],
        trigger_count: 0,
        last_triggered: null,
        trigger_history: []
      };
      
      fs.writeFileSync(this.triggerFile, JSON.stringify(initialData, null, 2));
    }
  }

  /**
   * 檢查用戶輸入是否包含 Phaser 3 關鍵詞
   */
  checkUserInput(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return { shouldTrigger: false, reason: 'no_input' };
    }

    const triggerData = this.loadTriggerData();
    if (!triggerData.auto_trigger_enabled) {
      return { shouldTrigger: false, reason: 'disabled' };
    }

    // 檢查關鍵詞
    const lowerInput = userInput.toLowerCase();
    const matchedKeywords = [];
    
    for (const keyword of triggerData.trigger_keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      return {
        shouldTrigger: true,
        reason: 'keywords_matched',
        matchedKeywords,
        confidence: this.calculateConfidence(matchedKeywords)
      };
    }

    return { shouldTrigger: false, reason: 'no_keywords_matched' };
  }

  /**
   * 計算觸發信心度
   */
  calculateConfidence(matchedKeywords) {
    let score = 0;
    for (const keyword of matchedKeywords) {
      if (['phaser', 'Phaser', 'phaser3'].includes(keyword)) {
        score += 10;
      } else if (['AirplaneCollisionGame', 'GameScene'].includes(keyword)) {
        score += 8;
      } else {
        score += 5;
      }
    }
    return Math.min(100, score * 10);
  }

  /**
   * 執行自動觸發
   */
  async executeAutoTrigger(checkResult, userInput) {
    console.log('🚀 自動觸發 Phaser 3 學習系統...');
    
    try {
      // 記錄觸發
      this.recordTrigger(checkResult, userInput);
      
      // 執行 Phaser 3 學習提醒
      console.log('📚 自動載入 Phaser 3 學習記憶...');
      await this.runPhaser3Reminder();
      
      // 顯示觸發信息
      console.log('\n🎯 自動觸發結果:');
      console.log(`匹配關鍵詞: ${checkResult.matchedKeywords.join(', ')}`);
      console.log(`信心度: ${checkResult.confidence}%`);
      console.log(`用戶輸入: "${userInput.substring(0, 100)}..."`);
      
      return { success: true, triggered: true };
      
    } catch (error) {
      console.error('❌ 自動觸發失敗:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 運行 Phaser 3 提醒
   */
  runPhaser3Reminder() {
    return new Promise((resolve, reject) => {
      const reminderScript = path.join(__dirname, 'phaser3-learning-persistence.js');
      const process = spawn('node', [reminderScript, 'reminder'], {
        stdio: 'inherit'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`提醒腳本執行失敗，退出碼: ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 記錄觸發事件
   */
  recordTrigger(checkResult, userInput) {
    const triggerData = this.loadTriggerData();
    const timestamp = new Date().toISOString();
    
    triggerData.trigger_count += 1;
    triggerData.last_triggered = timestamp;
    
    triggerData.trigger_history.push({
      timestamp,
      matched_keywords: checkResult.matchedKeywords,
      confidence: checkResult.confidence,
      user_input_preview: userInput.substring(0, 100),
      trigger_id: `trigger_${Date.now()}`
    });
    
    // 只保留最近 10 次觸發記錄
    if (triggerData.trigger_history.length > 10) {
      triggerData.trigger_history = triggerData.trigger_history.slice(-10);
    }
    
    this.saveTriggerData(triggerData);
  }

  /**
   * 主要檢查方法 - 這是關鍵！
   */
  async autoCheck(userInput) {
    console.log('🔍 自動檢查是否需要觸發 Phaser 3 系統...');
    
    const checkResult = this.checkUserInput(userInput);
    
    if (checkResult.shouldTrigger) {
      console.log(`✅ 檢測到 Phaser 3 相關內容，自動觸發學習系統`);
      return await this.executeAutoTrigger(checkResult, userInput);
    } else {
      console.log(`❌ 未檢測到 Phaser 3 相關內容 (${checkResult.reason})`);
      return { success: true, triggered: false, reason: checkResult.reason };
    }
  }

  /**
   * 獲取觸發統計
   */
  getTriggerStats() {
    const triggerData = this.loadTriggerData();
    return {
      enabled: triggerData.auto_trigger_enabled,
      total_triggers: triggerData.trigger_count,
      last_triggered: triggerData.last_triggered,
      recent_triggers: triggerData.trigger_history.slice(-3)
    };
  }

  /**
   * 啟用/禁用自動觸發
   */
  setAutoTrigger(enabled) {
    const triggerData = this.loadTriggerData();
    triggerData.auto_trigger_enabled = enabled;
    this.saveTriggerData(triggerData);
    
    console.log(`${enabled ? '✅ 啟用' : '❌ 禁用'} Phaser 3 自動觸發系統`);
  }

  // 輔助方法
  loadTriggerData() {
    try {
      return JSON.parse(fs.readFileSync(this.triggerFile, 'utf8'));
    } catch (error) {
      this.initializeTriggerSystem();
      return JSON.parse(fs.readFileSync(this.triggerFile, 'utf8'));
    }
  }

  saveTriggerData(data) {
    fs.writeFileSync(this.triggerFile, JSON.stringify(data, null, 2));
  }
}

// 全域實例 - 這是關鍵！
const globalTrigger = new AutoPhaser3Trigger();

/**
 * 全域檢查函數 - AI 可以在任何時候調用
 */
async function checkAndTriggerPhaser3(userInput) {
  return await globalTrigger.autoCheck(userInput);
}

// 命令行接口
if (require.main === module) {
  const command = process.argv[2];
  const input = process.argv[3];

  switch (command) {
    case 'check':
      if (!input) {
        console.log('請提供用戶輸入');
        console.log('使用方法: node auto-phaser3-trigger.js check "用戶輸入"');
        process.exit(1);
      }
      
      checkAndTriggerPhaser3(input)
        .then(result => {
          console.log('\n📊 自動檢查結果:', JSON.stringify(result, null, 2));
        })
        .catch(error => {
          console.error('❌ 自動檢查失敗:', error);
        });
      break;
      
    case 'stats':
      const stats = globalTrigger.getTriggerStats();
      console.log('📊 觸發統計:', JSON.stringify(stats, null, 2));
      break;
      
    case 'enable':
      globalTrigger.setAutoTrigger(true);
      break;
      
    case 'disable':
      globalTrigger.setAutoTrigger(false);
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node auto-phaser3-trigger.js check "用戶輸入"');
      console.log('  node auto-phaser3-trigger.js stats');
      console.log('  node auto-phaser3-trigger.js enable');
      console.log('  node auto-phaser3-trigger.js disable');
  }
}

// 導出給其他模組使用
module.exports = {
  AutoPhaser3Trigger,
  checkAndTriggerPhaser3,
  globalTrigger
};
