#!/usr/bin/env node

/**
 * 🚀 Wordwall 快速分析工具
 * 5分鐘快速分析版本，專注核心功能
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordwallQuickAnalysis {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      analysisType: 'quick-analysis',
      findings: {},
      keyInsights: []
    };
  }

  async initialize() {
    console.log('⚡ 啟動 Wordwall 快速分析 (5分鐘)...\n');
    
    // 創建結果目錄
    const resultsDir = path.join(process.cwd(), 'test-results', 'wordwall-quick');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async quickAnalysis() {
    console.log('🔍 執行快速分析...');
    
    try {
      // 1. 分析首頁
      await this.page.goto('https://wordwall.net', { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);
      
      const homePageData = await this.page.evaluate(() => {
        return {
          title: document.title,
          hasCreateButton: !!document.querySelector('[href*="create"]') || !!Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Create')),
          hasLoginButton: !!document.querySelector('[href*="login"]') || !!Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Login')),
          templateCount: document.querySelectorAll('[class*="template"], [class*="game"]').length
        };
      });

      // 2. 分析創建頁面
      await this.page.goto('https://wordwall.net/create', { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);
      
      const createPageData = await this.page.evaluate(() => {
        const templates = [];
        const templateElements = document.querySelectorAll('[class*="template"], [class*="game"], [data-testid*="template"]');
        
        templateElements.forEach(el => {
          const title = el.querySelector('h1, h2, h3, h4, [class*="title"]');
          if (title) {
            templates.push(title.textContent.trim());
          }
        });

        return {
          templates: templates.slice(0, 10), // 只取前10個
          hasTextInput: !!document.querySelector('textarea, input[type="text"]'),
          hasImageUpload: !!document.querySelector('input[type="file"]'),
          hasPreview: !!document.querySelector('[class*="preview"]')
        };
      });

      // 3. 截圖保存
      await this.page.screenshot({ 
        path: 'test-results/wordwall-quick/create-page-analysis.png',
        fullPage: true 
      });

      this.results.findings = {
        homePage: homePageData,
        createPage: createPageData
      };

      // 生成關鍵洞察
      this.generateKeyInsights();

      console.log('✅ 快速分析完成！');

    } catch (error) {
      console.error('❌ 快速分析失敗:', error.message);
      this.results.error = error.message;
    }
  }

  generateKeyInsights() {
    const insights = [];
    
    if (this.results.findings.createPage?.templates?.length > 0) {
      insights.push({
        category: 'templates',
        insight: `Wordwall 提供 ${this.results.findings.createPage.templates.length}+ 種遊戲模板`,
        recommendation: 'EduCreate 需要實現 25 種基於記憶科學的遊戲模板'
      });
    }

    if (this.results.findings.createPage?.hasTextInput && this.results.findings.createPage?.hasImageUpload) {
      insights.push({
        category: 'content-input',
        insight: 'Wordwall 支持文字和圖片內容輸入',
        recommendation: 'EduCreate 應實現更強大的多媒體內容管理系統'
      });
    }

    if (this.results.findings.createPage?.hasPreview) {
      insights.push({
        category: 'preview',
        insight: 'Wordwall 提供即時預覽功能',
        recommendation: 'EduCreate 需要實現即時預覽和測試功能'
      });
    }

    this.results.keyInsights = insights;

    console.log('\n💡 關鍵洞察:');
    insights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight.insight}`);
      console.log(`   建議: ${insight.recommendation}\n`);
    });
  }

  async generateReport() {
    const reportPath = 'test-results/wordwall-quick/quick-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    const markdownReport = `# Wordwall 快速分析報告

## 📊 分析結果

### 首頁分析
- **標題**: ${this.results.findings.homePage?.title || 'N/A'}
- **有創建按鈕**: ${this.results.findings.homePage?.hasCreateButton ? '✅' : '❌'}
- **有登入按鈕**: ${this.results.findings.homePage?.hasLoginButton ? '✅' : '❌'}

### 創建頁面分析
- **遊戲模板數量**: ${this.results.findings.createPage?.templates?.length || 0}
- **支持文字輸入**: ${this.results.findings.createPage?.hasTextInput ? '✅' : '❌'}
- **支持圖片上傳**: ${this.results.findings.createPage?.hasImageUpload ? '✅' : '❌'}
- **有預覽功能**: ${this.results.findings.createPage?.hasPreview ? '✅' : '❌'}

### 發現的遊戲模板
${this.results.findings.createPage?.templates?.map((template, index) => `${index + 1}. ${template}`).join('\n') || '無'}

## 💡 關鍵洞察
${this.results.keyInsights.map((insight, index) => 
  `### ${index + 1}. ${insight.insight}
**建議**: ${insight.recommendation}
`).join('\n')}

---
*快速分析完成時間: ${new Date().toLocaleString('zh-TW')}*`;

    const markdownPath = 'test-results/wordwall-quick/QUICK_ANALYSIS_REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log(`📊 報告已保存: ${reportPath}`);
    console.log(`📄 Markdown 報告: ${markdownPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.quickAnalysis();
      await this.generateReport();
      console.log('🎉 快速分析完成！');
    } catch (error) {
      console.error('❌ 分析失敗:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 執行分析
if (require.main === module) {
  const analysis = new WordwallQuickAnalysis();
  analysis.run().catch(console.error);
}

module.exports = WordwallQuickAnalysis;
