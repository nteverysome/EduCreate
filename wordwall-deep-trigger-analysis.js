#!/usr/bin/env node

/**
 * 🎯 Wordwall 深度觸發測試腳本
 * 專門針對隱藏功能進行深度觸發測試
 * 
 * 重點測試：
 * 1. 自動保存機制觸發 (AutoSaveManager)
 * 2. 內容變更檢測
 * 3. API 調用模式分析
 * 4. 狀態同步機制
 * 5. 錯誤處理和重試邏輯
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordwallDeepTriggerAnalysis {
  constructor() {
    this.browser = null;
    this.page = null;
    this.startTime = Date.now();
    this.triggerData = {
      timestamp: new Date().toISOString(),
      analysisType: 'deep-trigger-analysis',
      autoSaveEvents: [],
      contentChangeEvents: [],
      apiCalls: [],
      userInteractions: [],
      stateChanges: [],
      errorEvents: [],
      performanceMetrics: {}
    };
    this.autoSaveTimer = null;
    this.contentChangeCount = 0;
  }

  async initialize() {
    console.log('🎯 啟動 Wordwall 深度觸發測試');
    console.log('🔍 專注於自動保存和隱藏功能觸發\n');
    
    // 創建結果目錄
    const resultsDir = path.join(process.cwd(), 'test-results', 'wordwall-trigger-analysis');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // 啟動瀏覽器
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 300,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // 設置深度監控
    this.setupDeepMonitoring();
    
    console.log('✅ 瀏覽器已啟動，請登入後按 Enter 開始深度觸發測試...');
    await this.page.goto('https://wordwall.net/login');
    await this.waitForUserInput();
  }

  setupDeepMonitoring() {
    // 監控所有網路請求
    this.page.on('request', request => {
      const url = request.url();
      if (url.includes('wordwall.net')) {
        this.triggerData.apiCalls.push({
          timestamp: Date.now(),
          type: 'request',
          method: request.method(),
          url: url,
          resourceType: request.resourceType(),
          postData: request.postData(),
          headers: request.headers()
        });

        // 特別關注自動保存相關的請求
        if (url.includes('save') || url.includes('ajax') || url.includes('upload') || url.includes('create')) {
          this.triggerData.autoSaveEvents.push({
            timestamp: Date.now(),
            type: 'api-call',
            url: url,
            method: request.method(),
            data: request.postData()
          });
          console.log(`🔍 捕獲自動保存相關請求: ${request.method()} ${url}`);
        }
      }
    });

    // 監控響應
    this.page.on('response', response => {
      const url = response.url();
      if (url.includes('wordwall.net') && (url.includes('ajax') || url.includes('api'))) {
        this.triggerData.apiCalls.push({
          timestamp: Date.now(),
          type: 'response',
          url: url,
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // 監控控制台日誌
    this.page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('save') || msg.text().includes('error')) {
        this.triggerData.errorEvents.push({
          timestamp: Date.now(),
          type: msg.type(),
          text: msg.text()
        });
      }
    });
  }

  async waitForUserInput() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async triggerAutoSaveTests() {
    console.log('\n💾 開始自動保存機制深度觸發測試...');
    
    // 導航到創建頁面
    await this.page.goto('https://wordwall.net/create');
    await this.page.waitForTimeout(3000);

    console.log('📝 Phase 1: 選擇遊戲模板並觸發內容創建...');
    
    // 嘗試點擊第一個可用的遊戲模板
    const templates = await this.page.$$('[class*="template"], [class*="game"], .template-item');
    if (templates.length > 0) {
      console.log(`🎮 發現 ${templates.length} 個模板，點擊第一個...`);
      await templates[0].click();
      await this.page.waitForTimeout(2000);
    }

    // 查找並填寫內容輸入區域
    await this.triggerContentInput();
    
    // 監控自動保存觸發
    await this.monitorAutoSaveTriggers();
    
    // 測試不同的觸發條件
    await this.testVariousTriggers();
  }

  async triggerContentInput() {
    console.log('📝 Phase 2: 觸發內容輸入和變更檢測...');
    
    // 查找所有可能的輸入區域
    const inputSelectors = [
      'textarea',
      'input[type="text"]',
      '[contenteditable="true"]',
      '[class*="input"]',
      '[class*="editor"]',
      '[class*="content"]'
    ];

    for (const selector of inputSelectors) {
      try {
        const elements = await this.page.$$(selector);
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          
          // 檢查元素是否可見和可編輯
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          
          if (isVisible && isEnabled) {
            console.log(`✏️ 在 ${selector} 中輸入測試內容...`);
            
            // 清空並輸入測試內容
            await element.fill('');
            await this.page.waitForTimeout(500);
            
            // 逐字輸入以觸發變更事件
            const testContent = 'Test content for auto-save trigger analysis';
            for (let j = 0; j < testContent.length; j++) {
              await element.type(testContent[j]);
              await this.page.waitForTimeout(100); // 慢速輸入觸發更多事件
              
              this.contentChangeCount++;
              this.triggerData.contentChangeEvents.push({
                timestamp: Date.now(),
                selector: selector,
                contentLength: j + 1,
                character: testContent[j]
              });
            }
            
            console.log(`📊 已輸入 ${testContent.length} 個字符，觸發 ${this.contentChangeCount} 次變更事件`);
            await this.page.waitForTimeout(2000);
          }
        }
      } catch (error) {
        console.log(`⚠️ ${selector} 輸入測試失敗: ${error.message}`);
      }
    }
  }

  async monitorAutoSaveTriggers() {
    console.log('⏱️ Phase 3: 監控自動保存觸發模式...');
    
    // 設置 30 秒監控期
    const monitorDuration = 30000;
    const startTime = Date.now();
    
    console.log('🔍 開始 30 秒自動保存監控...');
    
    while (Date.now() - startTime < monitorDuration) {
      // 每 5 秒檢查一次頁面狀態
      await this.page.waitForTimeout(5000);
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️ 監控進度: ${elapsed}/30 秒`);
      
      // 檢查是否有新的自動保存事件
      const recentSaveEvents = this.triggerData.autoSaveEvents.filter(
        event => event.timestamp > Date.now() - 5000
      );
      
      if (recentSaveEvents.length > 0) {
        console.log(`💾 檢測到 ${recentSaveEvents.length} 個自動保存事件`);
      }
    }
    
    console.log('✅ 自動保存監控完成');
  }

  async testVariousTriggers() {
    console.log('🧪 Phase 4: 測試各種觸發條件...');
    
    // 測試 1: 快速連續輸入
    console.log('🧪 測試 1: 快速連續輸入觸發...');
    await this.testRapidInput();
    
    // 測試 2: 頁面切換觸發
    console.log('🧪 測試 2: 頁面切換觸發...');
    await this.testPageSwitchTrigger();
    
    // 測試 3: 長時間停留觸發
    console.log('🧪 測試 3: 長時間停留觸發...');
    await this.testIdleTrigger();
    
    // 測試 4: 特定操作觸發
    console.log('🧪 測試 4: 特定操作觸發...');
    await this.testSpecificActionTriggers();
  }

  async testRapidInput() {
    const textareas = await this.page.$$('textarea');
    if (textareas.length > 0) {
      const textarea = textareas[0];
      
      // 快速輸入大量文字
      const rapidText = 'Rapid input test '.repeat(20);
      await textarea.fill(rapidText);
      
      this.triggerData.userInteractions.push({
        timestamp: Date.now(),
        type: 'rapid-input',
        contentLength: rapidText.length
      });
      
      await this.page.waitForTimeout(3000);
    }
  }

  async testPageSwitchTrigger() {
    // 嘗試切換到其他頁面然後返回
    const currentUrl = this.page.url();
    
    try {
      await this.page.goto('https://wordwall.net/myactivities');
      await this.page.waitForTimeout(2000);
      
      await this.page.goto(currentUrl);
      await this.page.waitForTimeout(2000);
      
      this.triggerData.userInteractions.push({
        timestamp: Date.now(),
        type: 'page-switch',
        action: 'navigate-away-and-back'
      });
    } catch (error) {
      console.log(`⚠️ 頁面切換測試失敗: ${error.message}`);
    }
  }

  async testIdleTrigger() {
    console.log('⏳ 等待 15 秒測試空閒觸發...');
    
    const idleStart = Date.now();
    await this.page.waitForTimeout(15000);
    
    this.triggerData.userInteractions.push({
      timestamp: Date.now(),
      type: 'idle-period',
      duration: Date.now() - idleStart
    });
  }

  async testSpecificActionTriggers() {
    // 測試特定的 UI 操作
    const actionSelectors = [
      'button',
      '[class*="save"]',
      '[class*="submit"]',
      '[class*="publish"]',
      '[class*="share"]'
    ];

    for (const selector of actionSelectors) {
      try {
        const elements = await this.page.$$(selector);
        for (let i = 0; i < Math.min(elements.length, 2); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          
          if (isVisible) {
            const text = await element.textContent();
            console.log(`🔘 點擊按鈕: ${text?.substring(0, 20) || selector}`);
            
            await element.click();
            await this.page.waitForTimeout(1000);
            
            this.triggerData.userInteractions.push({
              timestamp: Date.now(),
              type: 'button-click',
              selector: selector,
              text: text?.substring(0, 50)
            });
          }
        }
      } catch (error) {
        console.log(`⚠️ ${selector} 點擊測試失敗: ${error.message}`);
      }
    }
  }

  async analyzeResults() {
    console.log('\n📊 分析觸發測試結果...');
    
    const analysis = {
      autoSaveFrequency: this.calculateAutoSaveFrequency(),
      contentChangePattern: this.analyzeContentChangePattern(),
      apiCallPattern: this.analyzeApiCallPattern(),
      triggerEffectiveness: this.calculateTriggerEffectiveness()
    };

    this.triggerData.analysis = analysis;
    
    console.log(`📈 自動保存事件: ${this.triggerData.autoSaveEvents.length} 個`);
    console.log(`📈 內容變更事件: ${this.triggerData.contentChangeEvents.length} 個`);
    console.log(`📈 API 調用: ${this.triggerData.apiCalls.length} 個`);
    console.log(`📈 用戶交互: ${this.triggerData.userInteractions.length} 個`);
    
    return analysis;
  }

  calculateAutoSaveFrequency() {
    if (this.triggerData.autoSaveEvents.length < 2) return 0;
    
    const times = this.triggerData.autoSaveEvents.map(event => event.timestamp);
    const intervals = [];
    
    for (let i = 1; i < times.length; i++) {
      intervals.push(times[i] - times[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round(avgInterval / 1000); // 轉換為秒
  }

  analyzeContentChangePattern() {
    const changes = this.triggerData.contentChangeEvents;
    if (changes.length === 0) return null;
    
    return {
      totalChanges: changes.length,
      averageInterval: changes.length > 1 ? 
        (changes[changes.length - 1].timestamp - changes[0].timestamp) / changes.length : 0,
      peakActivity: this.findPeakActivity(changes)
    };
  }

  analyzeApiCallPattern() {
    const calls = this.triggerData.apiCalls;
    const saveRelatedCalls = calls.filter(call => 
      call.url.includes('save') || call.url.includes('ajax') || call.url.includes('upload')
    );
    
    return {
      totalCalls: calls.length,
      saveRelatedCalls: saveRelatedCalls.length,
      uniqueEndpoints: [...new Set(calls.map(call => call.url))].length
    };
  }

  calculateTriggerEffectiveness() {
    const interactions = this.triggerData.userInteractions.length;
    const autoSaves = this.triggerData.autoSaveEvents.length;
    
    return {
      interactionToSaveRatio: interactions > 0 ? autoSaves / interactions : 0,
      totalEffectiveness: autoSaves > 0 ? 'effective' : 'needs-improvement'
    };
  }

  findPeakActivity(events) {
    // 簡單的峰值活動檢測
    const timeWindows = {};
    const windowSize = 5000; // 5秒窗口
    
    events.forEach(event => {
      const window = Math.floor(event.timestamp / windowSize);
      timeWindows[window] = (timeWindows[window] || 0) + 1;
    });
    
    const maxActivity = Math.max(...Object.values(timeWindows));
    return maxActivity;
  }

  async generateReport() {
    console.log('\n📋 生成深度觸發測試報告...');
    
    this.triggerData.totalDuration = Date.now() - this.startTime;
    
    // 保存 JSON 報告
    const reportPath = 'test-results/wordwall-trigger-analysis/deep-trigger-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.triggerData, null, 2));
    
    // 生成 Markdown 報告
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = 'test-results/wordwall-trigger-analysis/DEEP_TRIGGER_ANALYSIS_REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log(`✅ 深度觸發測試報告已保存: ${reportPath}`);
    console.log(`✅ Markdown 報告已保存: ${markdownPath}`);
  }

  generateMarkdownReport() {
    const analysis = this.triggerData.analysis || {};
    
    return `# Wordwall 深度觸發測試報告

## 📊 測試概要
- **測試時間**: ${this.triggerData.timestamp}
- **總耗時**: ${Math.round(this.triggerData.totalDuration / 1000)} 秒
- **測試類型**: 深度觸發分析

## 🎯 觸發測試結果

### 自動保存機制
- **自動保存事件**: ${this.triggerData.autoSaveEvents.length} 個
- **平均保存間隔**: ${analysis.autoSaveFrequency || 0} 秒
- **觸發效果**: ${analysis.triggerEffectiveness?.totalEffectiveness || 'unknown'}

### 內容變更檢測
- **內容變更事件**: ${this.triggerData.contentChangeEvents.length} 個
- **總字符輸入**: ${this.contentChangeCount} 個
- **峰值活動**: ${analysis.contentChangePattern?.peakActivity || 0} 次/5秒

### API 調用模式
- **總 API 調用**: ${this.triggerData.apiCalls.length} 個
- **保存相關調用**: ${analysis.apiCallPattern?.saveRelatedCalls || 0} 個
- **唯一端點**: ${analysis.apiCallPattern?.uniqueEndpoints || 0} 個

### 用戶交互測試
- **交互操作**: ${this.triggerData.userInteractions.length} 個
- **交互/保存比率**: ${analysis.triggerEffectiveness?.interactionToSaveRatio || 0}

## 🔍 關鍵發現

${this.triggerData.autoSaveEvents.length > 0 ? 
  `### ✅ 自動保存機制已觸發
- 檢測到 ${this.triggerData.autoSaveEvents.length} 次自動保存事件
- 平均間隔: ${analysis.autoSaveFrequency} 秒
- 建議 EduCreate 實現類似的觸發機制` :
  `### ⚠️ 自動保存機制未觸發
- 可能需要更深入的操作或特定條件
- 建議進一步分析觸發條件
- EduCreate 應實現更敏感的自動保存機制`}

## 🚀 EduCreate AutoSaveManager 實現建議

基於觸發測試結果：

### 核心功能
- **觸發條件**: 內容變更 + 時間間隔
- **保存頻率**: ${analysis.autoSaveFrequency || 30} 秒間隔
- **變更檢測**: 字符級別的變更監控
- **API 設計**: RESTful 自動保存端點

### 實現策略
\`\`\`typescript
class AutoSaveManager {
  private saveInterval = ${analysis.autoSaveFrequency || 30}000; // 毫秒
  private contentChangeThreshold = 5; // 字符變更閾值
  private lastSaveTime = 0;
  
  triggerAutoSave(content: string) {
    // 基於 Wordwall 分析的觸發邏輯
  }
}
\`\`\`

---
*深度觸發測試完成時間: ${new Date().toLocaleString('zh-TW')}*`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n🧹 深度觸發測試完成，瀏覽器已關閉');
  }

  async run() {
    try {
      await this.initialize();
      await this.triggerAutoSaveTests();
      await this.analyzeResults();
      await this.generateReport();
      
      console.log('\n🎉 深度觸發測試完成！');
      console.log('📁 查看詳細結果: test-results/wordwall-trigger-analysis/');
      
    } catch (error) {
      console.error('❌ 深度觸發測試失敗:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 執行深度觸發測試
if (require.main === module) {
  const analysis = new WordwallDeepTriggerAnalysis();
  analysis.run().catch(console.error);
}

module.exports = WordwallDeepTriggerAnalysis;
