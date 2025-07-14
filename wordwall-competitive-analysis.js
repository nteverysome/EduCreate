#!/usr/bin/env node

/**
 * 🔍 Wordwall.net 競品分析工具
 * 基於 Playwright 的深度分析，專為 EduCreate 項目設計
 * 
 * 分析重點：
 * 1. 用戶內容輸入系統 (文字/圖片)
 * 2. 25種遊戲模板架構
 * 3. 跨遊戲內容切換機制
 * 4. 社區分享生態系統
 * 5. 用戶檔案空間管理 (My Activities)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordwallCompetitiveAnalysis {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      analysisType: 'competitive-analysis',
      duration: 0,
      findings: {
        contentInputSystem: {},
        gameTemplates: {},
        crossGameSwitching: {},
        sharingEcosystem: {},
        userFileSpace: {},
        technicalArchitecture: {}
      },
      recommendations: [],
      implementationPlan: []
    };
    this.startTime = Date.now();
  }

  async initialize() {
    console.log('🚀 啟動 Wordwall 競品分析...\n');
    
    // 創建結果目錄
    const resultsDir = path.join(process.cwd(), 'test-results', 'wordwall-analysis');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // 啟動瀏覽器
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // 慢速執行以便觀察
    });
    
    this.page = await this.browser.newPage();
    
    // 設置視窗大小
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ 瀏覽器已啟動，開始分析...\n');
  }

  async analyzeContentInputSystem() {
    console.log('📝 分析內容輸入系統...');
    
    try {
      // 訪問 Wordwall 創建頁面
      await this.page.goto('https://wordwall.net/create', { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(3000);

      // 分析內容輸入界面
      const inputElements = await this.page.evaluate(() => {
        const inputs = [];
        
        // 查找文字輸入區域
        const textInputs = document.querySelectorAll('textarea, input[type="text"]');
        textInputs.forEach(input => {
          inputs.push({
            type: 'text',
            placeholder: input.placeholder || '',
            className: input.className,
            id: input.id
          });
        });

        // 查找圖片上傳區域
        const imageInputs = document.querySelectorAll('input[type="file"], [data-testid*="image"], [class*="image"]');
        imageInputs.forEach(input => {
          inputs.push({
            type: 'image',
            accept: input.accept || '',
            className: input.className,
            id: input.id
          });
        });

        return inputs;
      });

      // 截圖保存
      await this.page.screenshot({ 
        path: 'test-results/wordwall-analysis/content-input-system.png',
        fullPage: true 
      });

      this.results.findings.contentInputSystem = {
        inputElements,
        supportsText: inputElements.some(el => el.type === 'text'),
        supportsImages: inputElements.some(el => el.type === 'image'),
        inputCount: inputElements.length,
        analysisComplete: true
      };

      console.log(`  ✅ 發現 ${inputElements.length} 個輸入元素`);
      console.log(`  ✅ 文字輸入支持: ${this.results.findings.contentInputSystem.supportsText}`);
      console.log(`  ✅ 圖片輸入支持: ${this.results.findings.contentInputSystem.supportsImages}\n`);

    } catch (error) {
      console.log(`  ❌ 內容輸入系統分析失敗: ${error.message}\n`);
      this.results.findings.contentInputSystem.error = error.message;
    }
  }

  async analyzeGameTemplates() {
    console.log('🎮 分析遊戲模板系統...');
    
    try {
      // 查找遊戲模板選擇器
      const templates = await this.page.evaluate(() => {
        const templateElements = [];
        
        // 查找模板卡片
        const cards = document.querySelectorAll('[class*="template"], [class*="game"], [data-testid*="template"]');
        cards.forEach(card => {
          const title = card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
          const description = card.querySelector('p, [class*="description"], [class*="desc"]');
          
          templateElements.push({
            title: title ? title.textContent.trim() : '',
            description: description ? description.textContent.trim() : '',
            className: card.className,
            hasImage: !!card.querySelector('img'),
            hasIcon: !!card.querySelector('svg, [class*="icon"]')
          });
        });

        return templateElements;
      });

      // 截圖保存
      await this.page.screenshot({ 
        path: 'test-results/wordwall-analysis/game-templates.png',
        fullPage: true 
      });

      this.results.findings.gameTemplates = {
        templates,
        templateCount: templates.length,
        analysisComplete: true
      };

      console.log(`  ✅ 發現 ${templates.length} 個遊戲模板`);
      templates.slice(0, 5).forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.title}`);
      });
      console.log('');

    } catch (error) {
      console.log(`  ❌ 遊戲模板分析失敗: ${error.message}\n`);
      this.results.findings.gameTemplates.error = error.message;
    }
  }

  async analyzeCrossGameSwitching() {
    console.log('🔄 分析跨遊戲切換機制...');
    
    try {
      // 尋找遊戲切換相關的 UI 元素
      const switchingMechanism = await this.page.evaluate(() => {
        const mechanisms = [];
        
        // 查找切換按鈕或選項
        const switchButtons = document.querySelectorAll('[class*="switch"], [class*="change"], [data-testid*="switch"]');
        switchButtons.forEach(button => {
          mechanisms.push({
            type: 'switch-button',
            text: button.textContent.trim(),
            className: button.className
          });
        });

        // 查找下拉選單
        const dropdowns = document.querySelectorAll('select, [class*="dropdown"], [class*="select"]');
        dropdowns.forEach(dropdown => {
          const options = Array.from(dropdown.querySelectorAll('option')).map(opt => opt.textContent.trim());
          mechanisms.push({
            type: 'dropdown',
            options,
            className: dropdown.className
          });
        });

        return mechanisms;
      });

      this.results.findings.crossGameSwitching = {
        mechanisms: switchingMechanism,
        hasSwitchingUI: switchingMechanism.length > 0,
        analysisComplete: true
      };

      console.log(`  ✅ 發現 ${switchingMechanism.length} 個切換機制`);
      console.log(`  ✅ 支持跨遊戲切換: ${this.results.findings.crossGameSwitching.hasSwitchingUI}\n`);

    } catch (error) {
      console.log(`  ❌ 跨遊戲切換分析失敗: ${error.message}\n`);
      this.results.findings.crossGameSwitching.error = error.message;
    }
  }

  async analyzeSharingEcosystem() {
    console.log('🌐 分析社區分享生態系統...');
    
    try {
      // 查找分享相關功能
      const sharingFeatures = await this.page.evaluate(() => {
        const features = [];
        
        // 查找分享按鈕
        const shareButtons = document.querySelectorAll('[class*="share"], [data-testid*="share"]');
        const shareButtonsWithText = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('Share'));

        [...shareButtons, ...shareButtonsWithText].forEach(button => {
          features.push({
            type: 'share-button',
            text: button.textContent.trim(),
            className: button.className
          });
        });

        // 查找社區相關連結
        const communityLinks = document.querySelectorAll('a[href*="community"], a[href*="public"], [class*="community"]');
        communityLinks.forEach(link => {
          features.push({
            type: 'community-link',
            href: link.href,
            text: link.textContent.trim()
          });
        });

        return features;
      });

      this.results.findings.sharingEcosystem = {
        features: sharingFeatures,
        hasSharing: sharingFeatures.some(f => f.type === 'share-button'),
        hasCommunity: sharingFeatures.some(f => f.type === 'community-link'),
        analysisComplete: true
      };

      console.log(`  ✅ 發現 ${sharingFeatures.length} 個分享功能`);
      console.log(`  ✅ 支持分享: ${this.results.findings.sharingEcosystem.hasSharing}`);
      console.log(`  ✅ 有社區功能: ${this.results.findings.sharingEcosystem.hasCommunity}\n`);

    } catch (error) {
      console.log(`  ❌ 分享生態系統分析失敗: ${error.message}\n`);
      this.results.findings.sharingEcosystem.error = error.message;
    }
  }

  async analyzeUserFileSpace() {
    console.log('📁 分析用戶檔案空間 (My Activities)...');

    try {
      // 嘗試訪問 My Activities 頁面
      console.log('  🔍 正在訪問 My Activities 頁面...');
      await this.page.goto('https://wordwall.net/myactivities', { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(5000);

      // 檢查是否需要登入
      const needsLogin = await this.page.evaluate(() => {
        return document.querySelector('input[type="password"], [class*="login"], [class*="signin"]') !== null;
      });

      if (needsLogin) {
        console.log('  ⚠️ 需要登入才能訪問 My Activities，嘗試分析公開部分...');
        // 嘗試訪問公開的活動頁面
        await this.page.goto('https://wordwall.net/resource', { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);
      }

      const fileSpaceFeatures = await this.page.evaluate(() => {
        const features = {
          folders: [],
          activities: [],
          organizationTools: []
        };

        // 查找檔案夾
        const folderElements = document.querySelectorAll('[class*="folder"], [data-testid*="folder"]');
        folderElements.forEach(folder => {
          features.folders.push({
            name: folder.textContent.trim(),
            className: folder.className
          });
        });

        // 查找活動項目
        const activityElements = document.querySelectorAll('[class*="activity"], [class*="item"], [data-testid*="activity"]');
        activityElements.forEach(activity => {
          const title = activity.querySelector('[class*="title"], h1, h2, h3');
          features.activities.push({
            title: title ? title.textContent.trim() : '',
            className: activity.className
          });
        });

        // 查找組織工具
        const orgTools = document.querySelectorAll('[class*="sort"], [class*="filter"], [class*="search"]');
        orgTools.forEach(tool => {
          features.organizationTools.push({
            type: tool.className.includes('sort') ? 'sort' : 
                  tool.className.includes('filter') ? 'filter' : 'search',
            className: tool.className
          });
        });

        return features;
      });

      // 截圖保存
      await this.page.screenshot({ 
        path: 'test-results/wordwall-analysis/user-file-space.png',
        fullPage: true 
      });

      this.results.findings.userFileSpace = {
        ...fileSpaceFeatures,
        hasFolders: fileSpaceFeatures.folders.length > 0,
        hasActivities: fileSpaceFeatures.activities.length > 0,
        hasOrganizationTools: fileSpaceFeatures.organizationTools.length > 0,
        analysisComplete: true
      };

      console.log(`  ✅ 發現 ${fileSpaceFeatures.folders.length} 個檔案夾`);
      console.log(`  ✅ 發現 ${fileSpaceFeatures.activities.length} 個活動`);
      console.log(`  ✅ 發現 ${fileSpaceFeatures.organizationTools.length} 個組織工具\n`);

    } catch (error) {
      console.log(`  ❌ 用戶檔案空間分析失敗: ${error.message}\n`);
      this.results.findings.userFileSpace.error = error.message;
    }
  }

  generateRecommendations() {
    console.log('💡 生成 EduCreate 實現建議...');
    
    const recommendations = [];

    // 基於內容輸入系統的建議
    if (this.results.findings.contentInputSystem.supportsText && this.results.findings.contentInputSystem.supportsImages) {
      recommendations.push({
        category: 'content-input',
        priority: 'high',
        title: '實現統一內容輸入系統',
        description: 'Wordwall 支持文字和圖片輸入，EduCreate 應實現更強大的多媒體內容輸入系統',
        implementation: 'components/content/UniversalContentEditor.tsx'
      });
    }

    // 基於遊戲模板的建議
    if (this.results.findings.gameTemplates.templateCount > 0) {
      recommendations.push({
        category: 'game-templates',
        priority: 'high',
        title: '建立 25 種記憶遊戲模板系統',
        description: `Wordwall 有 ${this.results.findings.gameTemplates.templateCount} 個模板，EduCreate 需要基於記憶科學的 25 種遊戲`,
        implementation: 'components/games/ 目錄下的各種遊戲組件'
      });
    }

    // 基於跨遊戲切換的建議
    if (this.results.findings.crossGameSwitching.hasSwitchingUI) {
      recommendations.push({
        category: 'cross-game-switching',
        priority: 'medium',
        title: '實現無縫遊戲切換機制',
        description: 'Wordwall 支持遊戲間切換，EduCreate 需要更智能的內容適配切換',
        implementation: 'components/content/GameSwitcher.tsx'
      });
    }

    // 基於分享生態的建議
    if (this.results.findings.sharingEcosystem.hasSharing) {
      recommendations.push({
        category: 'sharing-ecosystem',
        priority: 'medium',
        title: '建立三層分享生態系統',
        description: 'Wordwall 有基本分享功能，EduCreate 需要公開社區 + 私人分享 + 班級群組',
        implementation: 'components/sharing/ 相關組件'
      });
    }

    // 基於檔案空間的建議
    if (this.results.findings.userFileSpace.hasFolders) {
      recommendations.push({
        category: 'file-space',
        priority: 'high',
        title: '實現智能檔案空間管理',
        description: 'Wordwall 有檔案夾組織，EduCreate 需要基於 GEPT 分級的智能組織',
        implementation: 'components/user/MyActivities.tsx'
      });
    }

    this.results.recommendations = recommendations;
    
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`     ${rec.description}`);
      console.log(`     實現位置: ${rec.implementation}\n`);
    });
  }

  async generateReport() {
    console.log('📊 生成分析報告...');
    
    this.results.duration = Date.now() - this.startTime;
    
    // 保存 JSON 報告
    const reportPath = 'test-results/wordwall-analysis/competitive-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // 生成 Markdown 報告
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = 'test-results/wordwall-analysis/COMPETITIVE_ANALYSIS_REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log(`  ✅ JSON 報告已保存: ${reportPath}`);
    console.log(`  ✅ Markdown 報告已保存: ${markdownPath}`);
    console.log(`  ⏱️ 分析耗時: ${Math.round(this.results.duration / 1000)} 秒\n`);
  }

  generateMarkdownReport() {
    return `# Wordwall 競品分析報告

## 📊 分析概要
- **分析時間**: ${this.results.timestamp}
- **分析耗時**: ${Math.round(this.results.duration / 1000)} 秒
- **分析類型**: 競品功能分析

## 🔍 主要發現

### 1. 內容輸入系統
- **文字輸入支持**: ${this.results.findings.contentInputSystem.supportsText ? '✅' : '❌'}
- **圖片輸入支持**: ${this.results.findings.contentInputSystem.supportsImages ? '✅' : '❌'}
- **輸入元素數量**: ${this.results.findings.contentInputSystem.inputCount || 0}

### 2. 遊戲模板系統
- **模板數量**: ${this.results.findings.gameTemplates.templateCount || 0}
- **模板類型**: 多樣化遊戲模板

### 3. 跨遊戲切換
- **支持切換**: ${this.results.findings.crossGameSwitching.hasSwitchingUI ? '✅' : '❌'}
- **切換機制數量**: ${this.results.findings.crossGameSwitching.mechanisms?.length || 0}

### 4. 分享生態系統
- **分享功能**: ${this.results.findings.sharingEcosystem.hasSharing ? '✅' : '❌'}
- **社區功能**: ${this.results.findings.sharingEcosystem.hasCommunity ? '✅' : '❌'}

### 5. 用戶檔案空間
- **檔案夾組織**: ${this.results.findings.userFileSpace.hasFolders ? '✅' : '❌'}
- **活動管理**: ${this.results.findings.userFileSpace.hasActivities ? '✅' : '❌'}
- **組織工具**: ${this.results.findings.userFileSpace.hasOrganizationTools ? '✅' : '❌'}

## 💡 EduCreate 實現建議

${this.results.recommendations.map((rec, index) => 
  `### ${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]
- **類別**: ${rec.category}
- **描述**: ${rec.description}
- **實現位置**: \`${rec.implementation}\`
`).join('\n')}

## 🚀 下一步行動
1. 根據分析結果優先實現高優先級功能
2. 參考 Wordwall 的 UI/UX 設計模式
3. 基於記憶科學原理改進現有功能
4. 建立差異化競爭優勢

---
*報告生成時間: ${new Date().toLocaleString('zh-TW')}*`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 清理完成\n');
  }

  async run() {
    try {
      await this.initialize();
      await this.analyzeContentInputSystem();
      await this.analyzeGameTemplates();
      await this.analyzeCrossGameSwitching();
      await this.analyzeSharingEcosystem();
      await this.analyzeUserFileSpace();
      this.generateRecommendations();
      await this.generateReport();
      
      console.log('🎉 Wordwall 競品分析完成！');
      console.log('📁 查看結果: test-results/wordwall-analysis/');
      
    } catch (error) {
      console.error('❌ 分析過程中發生錯誤:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 執行分析
if (require.main === module) {
  const analysis = new WordwallCompetitiveAnalysis();
  analysis.run().catch(console.error);
}

module.exports = WordwallCompetitiveAnalysis;
