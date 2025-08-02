#!/usr/bin/env node

/**
 * 🔬 Wordwall 專業深度分析工具
 * 15分鐘手動輔助深度分析，專注 EduCreate 核心功能實現
 * 
 * 重點分析領域：
 * 1. 用戶內容輸入系統 (UniversalContentEditor)
 * 2. 遊戲切換機制 (GameSwitcher) 
 * 3. 用戶檔案空間 (MyActivities)
 * 4. 自動保存機制 (AutoSaveManager)
 * 5. 分享管理系統 (ShareManager)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordwallProfessionalDeepAnalysis {
  constructor() {
    this.browser = null;
    this.page = null;
    this.startTime = Date.now();
    this.analysisData = {
      timestamp: new Date().toISOString(),
      analysisType: 'professional-deep-analysis',
      duration: 900000, // 15 minutes
      phases: {
        phase1_contentInput: { duration: 0, findings: {} },
        phase2_gameSwitching: { duration: 0, findings: {} },
        phase3_fileSpace: { duration: 0, findings: {} },
        phase4_autoSave: { duration: 0, findings: {} },
        phase5_sharing: { duration: 0, findings: {} }
      },
      networkRequests: [],
      userInteractions: [],
      performanceMetrics: {},
      implementationPlan: {}
    };
    this.currentPhase = null;
    this.phaseStartTime = null;
  }

  async initialize() {
    console.log('🔬 啟動 Wordwall 專業深度分析工具');
    console.log('⏱️  分析時間: 15 分鐘');
    console.log('👤 需要手動協助登入和操作\n');
    
    // 創建結果目錄
    const resultsDir = path.join(process.cwd(), 'test-results', 'wordwall-deep-analysis');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // 啟動瀏覽器 - 非無頭模式便於手動操作
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // 監聽網路請求
    this.setupNetworkMonitoring();
    
    console.log('✅ 瀏覽器已啟動');
    console.log('🌐 請手動登入 Wordwall 帳號，然後按 Enter 繼續...');
    
    // 導航到登入頁面
    await this.page.goto('https://wordwall.net/login');
    
    // 等待用戶手動登入
    await this.waitForUserInput();
  }

  setupNetworkMonitoring() {
    this.page.on('request', request => {
      if (request.url().includes('wordwall.net')) {
        this.analysisData.networkRequests.push({
          timestamp: Date.now(),
          method: request.method(),
          url: request.url(),
          resourceType: request.resourceType(),
          phase: this.currentPhase
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('wordwall.net') && response.url().includes('ajax')) {
        this.analysisData.networkRequests.push({
          timestamp: Date.now(),
          type: 'response',
          url: response.url(),
          status: response.status(),
          phase: this.currentPhase
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

  startPhase(phaseName) {
    this.currentPhase = phaseName;
    this.phaseStartTime = Date.now();
    console.log(`\n🔍 開始 ${phaseName} 分析階段...`);
  }

  endPhase() {
    if (this.currentPhase && this.phaseStartTime) {
      const duration = Date.now() - this.phaseStartTime;
      this.analysisData.phases[this.currentPhase].duration = duration;
      console.log(`✅ ${this.currentPhase} 階段完成 (${Math.round(duration/1000)}秒)`);
    }
  }

  async phase1_analyzeContentInput() {
    this.startPhase('phase1_contentInput');
    
    console.log('📝 Phase 1: 分析用戶內容輸入系統');
    console.log('🎯 目標: UniversalContentEditor 實現參考');
    console.log('👉 請導航到創建頁面並測試內容輸入功能...');
    
    await this.page.goto('https://wordwall.net/create');
    await this.page.waitForTimeout(3000);
    
    // 分析內容輸入界面
    const contentInputAnalysis = await this.page.evaluate(() => {
      const analysis = {
        textInputs: [],
        imageInputs: [],
        contentAreas: [],
        validationElements: [],
        previewElements: []
      };

      // 文字輸入元素
      document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]').forEach(el => {
        analysis.textInputs.push({
          tagName: el.tagName,
          type: el.type || 'contenteditable',
          placeholder: el.placeholder || '',
          className: el.className,
          id: el.id,
          maxLength: el.maxLength || null,
          required: el.required || false
        });
      });

      // 圖片上傳元素
      document.querySelectorAll('input[type="file"], [class*="upload"], [class*="image"]').forEach(el => {
        analysis.imageInputs.push({
          tagName: el.tagName,
          accept: el.accept || '',
          multiple: el.multiple || false,
          className: el.className,
          id: el.id
        });
      });

      // 內容區域
      document.querySelectorAll('[class*="content"], [class*="editor"], [class*="input-area"]').forEach(el => {
        analysis.contentAreas.push({
          className: el.className,
          id: el.id,
          hasChildren: el.children.length > 0,
          textContent: el.textContent.substring(0, 100)
        });
      });

      return analysis;
    });

    // 截圖保存
    await this.page.screenshot({ 
      path: 'test-results/wordwall-deep-analysis/phase1-content-input.png',
      fullPage: true 
    });

    this.analysisData.phases.phase1_contentInput.findings = contentInputAnalysis;
    
    console.log(`📊 發現 ${contentInputAnalysis.textInputs.length} 個文字輸入元素`);
    console.log(`📊 發現 ${contentInputAnalysis.imageInputs.length} 個圖片輸入元素`);
    console.log('⏸️  請手動測試內容輸入功能，觀察行為，然後按 Enter 繼續...');
    
    await this.waitForUserInput();
    this.endPhase();
  }

  async phase2_analyzeGameSwitching() {
    this.startPhase('phase2_gameSwitching');
    
    console.log('🔄 Phase 2: 分析遊戲切換機制');
    console.log('🎯 目標: GameSwitcher 組件實現參考');
    console.log('👉 請測試在不同遊戲模板間切換...');
    
    const gameSwitchingAnalysis = await this.page.evaluate(() => {
      const analysis = {
        templateSelectors: [],
        switchingButtons: [],
        navigationElements: [],
        statePreservation: []
      };

      // 模板選擇器
      document.querySelectorAll('[class*="template"], [class*="game"], [data-testid*="template"]').forEach(el => {
        const title = el.querySelector('h1, h2, h3, h4, [class*="title"]');
        analysis.templateSelectors.push({
          title: title ? title.textContent.trim() : '',
          className: el.className,
          clickable: el.tagName === 'BUTTON' || el.onclick !== null,
          hasImage: !!el.querySelector('img')
        });
      });

      // 切換按鈕
      document.querySelectorAll('[class*="switch"], [class*="change"], [class*="select"]').forEach(el => {
        analysis.switchingButtons.push({
          text: el.textContent.trim(),
          className: el.className,
          tagName: el.tagName
        });
      });

      return analysis;
    });

    await this.page.screenshot({ 
      path: 'test-results/wordwall-deep-analysis/phase2-game-switching.png',
      fullPage: true 
    });

    this.analysisData.phases.phase2_gameSwitching.findings = gameSwitchingAnalysis;
    
    console.log(`📊 發現 ${gameSwitchingAnalysis.templateSelectors.length} 個遊戲模板`);
    console.log(`📊 發現 ${gameSwitchingAnalysis.switchingButtons.length} 個切換按鈕`);
    console.log('⏸️  請手動測試遊戲切換，觀察內容保持情況，然後按 Enter 繼續...');
    
    await this.waitForUserInput();
    this.endPhase();
  }

  async phase3_analyzeFileSpace() {
    this.startPhase('phase3_fileSpace');
    
    console.log('📁 Phase 3: 分析用戶檔案空間 (My Activities)');
    console.log('🎯 目標: MyActivities 組件實現參考');
    console.log('👉 請導航到 My Activities 並測試檔案管理功能...');
    
    await this.page.goto('https://wordwall.net/myactivities');
    await this.page.waitForTimeout(3000);
    
    const fileSpaceAnalysis = await this.page.evaluate(() => {
      const analysis = {
        folders: [],
        activities: [],
        organizationTools: [],
        viewModes: [],
        actionButtons: []
      };

      // 檔案夾結構
      document.querySelectorAll('[class*="folder"], [data-testid*="folder"]').forEach(el => {
        analysis.folders.push({
          name: el.textContent.trim(),
          className: el.className,
          hasIcon: !!el.querySelector('svg, [class*="icon"]'),
          isExpandable: !!el.querySelector('[class*="expand"], [class*="collapse"]')
        });
      });

      // 活動項目
      document.querySelectorAll('[class*="activity"], [class*="item"], [class*="resource"]').forEach(el => {
        const title = el.querySelector('[class*="title"], h1, h2, h3');
        const thumbnail = el.querySelector('img, [class*="thumb"]');
        analysis.activities.push({
          title: title ? title.textContent.trim() : '',
          hasThumbnail: !!thumbnail,
          className: el.className,
          hasActions: !!el.querySelector('[class*="action"], [class*="menu"]')
        });
      });

      // 組織工具
      document.querySelectorAll('[class*="sort"], [class*="filter"], [class*="search"], [class*="view"]').forEach(el => {
        analysis.organizationTools.push({
          type: el.className.includes('sort') ? 'sort' : 
                el.className.includes('filter') ? 'filter' : 
                el.className.includes('search') ? 'search' : 'view',
          text: el.textContent.trim(),
          className: el.className
        });
      });

      return analysis;
    });

    await this.page.screenshot({ 
      path: 'test-results/wordwall-deep-analysis/phase3-file-space.png',
      fullPage: true 
    });

    this.analysisData.phases.phase3_fileSpace.findings = fileSpaceAnalysis;
    
    console.log(`📊 發現 ${fileSpaceAnalysis.folders.length} 個檔案夾`);
    console.log(`📊 發現 ${fileSpaceAnalysis.activities.length} 個活動`);
    console.log(`📊 發現 ${fileSpaceAnalysis.organizationTools.length} 個組織工具`);
    console.log('⏸️  請手動測試檔案夾操作、搜索、排序等功能，然後按 Enter 繼續...');
    
    await this.waitForUserInput();
    this.endPhase();
  }

  async phase4_analyzeAutoSave() {
    this.startPhase('phase4_autoSave');
    
    console.log('💾 Phase 4: 分析自動保存機制');
    console.log('🎯 目標: AutoSaveManager 實現參考');
    console.log('👉 請創建新活動並觀察自動保存行為...');
    
    // 監控 AJAX 請求
    const autoSaveRequests = [];
    this.page.on('response', response => {
      if (response.url().includes('createajax') || response.url().includes('upload') || response.url().includes('save')) {
        autoSaveRequests.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });

    await this.page.goto('https://wordwall.net/create');
    await this.page.waitForTimeout(3000);

    console.log('⏸️  請開始創建活動，輸入內容，觀察自動保存請求，然後按 Enter 繼續...');
    await this.waitForUserInput();

    this.analysisData.phases.phase4_autoSave.findings = {
      autoSaveRequests,
      requestCount: autoSaveRequests.length,
      saveEndpoints: [...new Set(autoSaveRequests.map(req => req.url))]
    };

    console.log(`📊 捕獲 ${autoSaveRequests.length} 個自動保存請求`);
    this.endPhase();
  }

  async phase5_analyzeSharing() {
    this.startPhase('phase5_sharing');
    
    console.log('🌐 Phase 5: 分析分享管理系統');
    console.log('🎯 目標: ShareManager 組件實現參考');
    console.log('👉 請測試活動分享功能...');
    
    const sharingAnalysis = await this.page.evaluate(() => {
      const analysis = {
        shareButtons: [],
        privacyOptions: [],
        linkGeneration: [],
        socialIntegration: []
      };

      // 分享按鈕
      document.querySelectorAll('[class*="share"], [data-testid*="share"]').forEach(el => {
        analysis.shareButtons.push({
          text: el.textContent.trim(),
          className: el.className,
          hasIcon: !!el.querySelector('svg, [class*="icon"]')
        });
      });

      // 隱私選項
      document.querySelectorAll('[class*="privacy"], [class*="public"], [class*="private"]').forEach(el => {
        analysis.privacyOptions.push({
          text: el.textContent.trim(),
          className: el.className,
          isSelected: el.classList.contains('selected') || el.classList.contains('active')
        });
      });

      return analysis;
    });

    await this.page.screenshot({ 
      path: 'test-results/wordwall-deep-analysis/phase5-sharing.png',
      fullPage: true 
    });

    this.analysisData.phases.phase5_sharing.findings = sharingAnalysis;
    
    console.log(`📊 發現 ${sharingAnalysis.shareButtons.length} 個分享按鈕`);
    console.log(`📊 發現 ${sharingAnalysis.privacyOptions.length} 個隱私選項`);
    console.log('⏸️  請手動測試分享功能，然後按 Enter 完成分析...');
    
    await this.waitForUserInput();
    this.endPhase();
  }

  generateImplementationPlan() {
    console.log('\n💡 生成 EduCreate 實現計劃...');
    
    const plan = {
      contentInput: {
        component: 'components/content/UniversalContentEditor.tsx',
        features: [
          '多媒體內容輸入支持',
          '即時內容驗證',
          '智能內容解析',
          '批量內容處理'
        ],
        priority: 'high',
        estimatedDays: 5
      },
      gameSwitching: {
        component: 'components/content/GameSwitcher.tsx',
        features: [
          '無縫遊戲模板切換',
          '內容狀態保持',
          '智能內容適配',
          '切換動畫效果'
        ],
        priority: 'high',
        estimatedDays: 4
      },
      fileSpace: {
        component: 'components/user/MyActivities.tsx',
        features: [
          '檔案夾層級管理',
          '活動縮圖生成',
          '智能搜索過濾',
          'GEPT 分級組織'
        ],
        priority: 'high',
        estimatedDays: 6
      },
      autoSave: {
        component: 'lib/user/AutoSaveManager.ts',
        features: [
          '30秒自動保存',
          '版本控制',
          '衝突解決',
          '離線支持'
        ],
        priority: 'medium',
        estimatedDays: 3
      },
      sharing: {
        component: 'components/sharing/ShareManager.tsx',
        features: [
          '三層分享模式',
          '權限管理',
          '連結生成',
          '社區整合'
        ],
        priority: 'medium',
        estimatedDays: 4
      }
    };

    this.analysisData.implementationPlan = plan;
    
    Object.entries(plan).forEach(([key, item]) => {
      console.log(`\n📋 ${key.toUpperCase()}`);
      console.log(`   組件: ${item.component}`);
      console.log(`   優先級: ${item.priority}`);
      console.log(`   預估天數: ${item.estimatedDays}`);
      console.log(`   功能: ${item.features.join(', ')}`);
    });
  }

  async generateReport() {
    console.log('\n📊 生成專業分析報告...');
    
    this.analysisData.totalDuration = Date.now() - this.startTime;
    
    // 保存 JSON 報告
    const reportPath = 'test-results/wordwall-deep-analysis/professional-deep-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.analysisData, null, 2));
    
    // 生成詳細 Markdown 報告
    const markdownReport = this.generateDetailedMarkdownReport();
    const markdownPath = 'test-results/wordwall-deep-analysis/PROFESSIONAL_DEEP_ANALYSIS_REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log(`✅ 專業分析報告已保存: ${reportPath}`);
    console.log(`✅ Markdown 報告已保存: ${markdownPath}`);
    console.log(`⏱️  總分析時間: ${Math.round(this.analysisData.totalDuration / 1000)} 秒`);
  }

  generateDetailedMarkdownReport() {
    const phases = this.analysisData.phases;
    
    return `# Wordwall 專業深度分析報告

## 📊 分析概要
- **分析時間**: ${this.analysisData.timestamp}
- **總耗時**: ${Math.round(this.analysisData.totalDuration / 1000)} 秒
- **分析類型**: 專業深度分析 (手動輔助)
- **網路請求**: ${this.analysisData.networkRequests.length} 個

## 🔍 階段性分析結果

### Phase 1: 內容輸入系統 (${Math.round(phases.phase1_contentInput.duration/1000)}秒)
- **文字輸入元素**: ${phases.phase1_contentInput.findings.textInputs?.length || 0}
- **圖片輸入元素**: ${phases.phase1_contentInput.findings.imageInputs?.length || 0}
- **內容區域**: ${phases.phase1_contentInput.findings.contentAreas?.length || 0}

### Phase 2: 遊戲切換機制 (${Math.round(phases.phase2_gameSwitching.duration/1000)}秒)
- **遊戲模板**: ${phases.phase2_gameSwitching.findings.templateSelectors?.length || 0}
- **切換按鈕**: ${phases.phase2_gameSwitching.findings.switchingButtons?.length || 0}

### Phase 3: 檔案空間管理 (${Math.round(phases.phase3_fileSpace.duration/1000)}秒)
- **檔案夾**: ${phases.phase3_fileSpace.findings.folders?.length || 0}
- **活動項目**: ${phases.phase3_fileSpace.findings.activities?.length || 0}
- **組織工具**: ${phases.phase3_fileSpace.findings.organizationTools?.length || 0}

### Phase 4: 自動保存機制 (${Math.round(phases.phase4_autoSave.duration/1000)}秒)
- **自動保存請求**: ${phases.phase4_autoSave.findings.requestCount || 0}
- **保存端點**: ${phases.phase4_autoSave.findings.saveEndpoints?.length || 0}

### Phase 5: 分享管理系統 (${Math.round(phases.phase5_sharing.duration/1000)}秒)
- **分享按鈕**: ${phases.phase5_sharing.findings.shareButtons?.length || 0}
- **隱私選項**: ${phases.phase5_sharing.findings.privacyOptions?.length || 0}

## 🚀 EduCreate 實現計劃

${Object.entries(this.analysisData.implementationPlan).map(([key, item]) => 
  `### ${key.charAt(0).toUpperCase() + key.slice(1)}
- **組件**: \`${item.component}\`
- **優先級**: ${item.priority}
- **預估開發時間**: ${item.estimatedDays} 天
- **核心功能**: ${item.features.join(', ')}
`).join('\n')}

## 📈 網路請求分析
${this.analysisData.networkRequests.slice(0, 10).map(req => 
  `- ${req.method} ${req.url} (${req.phase})`
).join('\n')}

---
*專業深度分析完成時間: ${new Date().toLocaleString('zh-TW')}*`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n🧹 分析完成，瀏覽器已關閉');
  }

  async run() {
    try {
      await this.initialize();
      await this.phase1_analyzeContentInput();
      await this.phase2_analyzeGameSwitching();
      await this.phase3_analyzeFileSpace();
      await this.phase4_analyzeAutoSave();
      await this.phase5_analyzeSharing();
      this.generateImplementationPlan();
      await this.generateReport();
      
      console.log('\n🎉 專業深度分析完成！');
      console.log('📁 查看詳細結果: test-results/wordwall-deep-analysis/');
      
    } catch (error) {
      console.error('❌ 分析過程中發生錯誤:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 執行專業深度分析
if (require.main === module) {
  const analysis = new WordwallProfessionalDeepAnalysis();
  analysis.run().catch(console.error);
}

module.exports = WordwallProfessionalDeepAnalysis;
