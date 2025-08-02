/**
 * EduCreate 功能整合工作流程提醒系統
 * 自動檢查和提醒防止功能孤立的工作流程
 */

const fs = require('fs');
const path = require('path');

class IntegrationWorkflowReminder {
  constructor() {
    this.projectRoot = process.cwd();
    this.checklistPath = path.join(this.projectRoot, 'docs', 'INTEGRATION_WORKFLOW_CHECKLIST.md');
    this.contextRulesPath = path.join(this.projectRoot, 'docs', 'context-rules.md');
  }

  /**
   * 檢查是否存在必要的整合文件
   */
  checkRequiredFiles() {
    const requiredFiles = [
      'app/page.tsx',           // 主頁
      'app/dashboard/page.tsx', // 儀表板
      'docs/INTEGRATION_WORKFLOW_CHECKLIST.md', // 工作流程檢查清單
      'docs/context-rules.md'   // 核心規則
    ];

    const missingFiles = [];
    const existingFiles = [];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    });

    return { existingFiles, missingFiles };
  }

  /**
   * 檢查主頁是否包含功能入口
   */
  checkHomepageIntegration() {
    const homepagePath = path.join(this.projectRoot, 'app', 'page.tsx');
    
    if (!fs.existsSync(homepagePath)) {
      return { status: 'error', message: '主頁文件不存在' };
    }

    const content = fs.readFileSync(homepagePath, 'utf8');
    
    const integrationChecks = {
      hasDashboardLink: content.includes('dashboard') || content.includes('儀表板'),
      hasFeatureCards: content.includes('feature-') || content.includes('功能'),
      hasQuickAccess: content.includes('quick-') || content.includes('快速'),
      hasNavigation: content.includes('nav') || content.includes('導航'),
      hasTestIds: content.includes('data-testid')
    };

    const passedChecks = Object.values(integrationChecks).filter(Boolean).length;
    const totalChecks = Object.keys(integrationChecks).length;

    return {
      status: passedChecks >= totalChecks * 0.8 ? 'good' : 'warning',
      score: `${passedChecks}/${totalChecks}`,
      details: integrationChecks
    };
  }

  /**
   * 檢查儀表板是否存在並包含功能
   */
  checkDashboardIntegration() {
    const dashboardPath = path.join(this.projectRoot, 'app', 'dashboard', 'page.tsx');
    
    if (!fs.existsSync(dashboardPath)) {
      return { status: 'error', message: '儀表板文件不存在' };
    }

    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    const integrationChecks = {
      hasFeatureCards: content.includes('feature-card-') || content.includes('功能卡片'),
      hasStats: content.includes('stats-') || content.includes('統計'),
      hasCategories: content.includes('category-') || content.includes('分類'),
      hasBackToHome: content.includes('back-to-home') || content.includes('返回主頁'),
      hasTestIds: content.includes('data-testid')
    };

    const passedChecks = Object.values(integrationChecks).filter(Boolean).length;
    const totalChecks = Object.keys(integrationChecks).length;

    return {
      status: passedChecks >= totalChecks * 0.8 ? 'good' : 'warning',
      score: `${passedChecks}/${totalChecks}`,
      details: integrationChecks
    };
  }

  /**
   * 檢查是否有 Playwright 測試
   */
  checkPlaywrightTests() {
    const testsDir = path.join(this.projectRoot, 'tests', 'e2e');
    
    if (!fs.existsSync(testsDir)) {
      return { status: 'error', message: 'E2E 測試目錄不存在' };
    }

    const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.spec.ts'));
    
    const integrationTests = testFiles.filter(file => 
      file.includes('integration') || 
      file.includes('journey') || 
      file.includes('complete')
    );

    return {
      status: integrationTests.length > 0 ? 'good' : 'warning',
      totalTests: testFiles.length,
      integrationTests: integrationTests.length,
      files: testFiles
    };
  }

  /**
   * 生成工作流程提醒報告
   */
  generateReport() {
    console.log('\n🔍 EduCreate 功能整合工作流程檢查報告');
    console.log('=' .repeat(60));

    // 檢查必要文件
    const fileCheck = this.checkRequiredFiles();
    console.log('\n📁 必要文件檢查:');
    console.log(`✅ 存在文件: ${fileCheck.existingFiles.length}`);
    fileCheck.existingFiles.forEach(file => console.log(`   ✓ ${file}`));
    
    if (fileCheck.missingFiles.length > 0) {
      console.log(`❌ 缺失文件: ${fileCheck.missingFiles.length}`);
      fileCheck.missingFiles.forEach(file => console.log(`   ✗ ${file}`));
    }

    // 檢查主頁整合
    const homepageCheck = this.checkHomepageIntegration();
    console.log('\n🏠 主頁整合檢查:');
    console.log(`狀態: ${this.getStatusIcon(homepageCheck.status)} (${homepageCheck.score || 'N/A'})`);
    if (homepageCheck.details) {
      Object.entries(homepageCheck.details).forEach(([key, value]) => {
        console.log(`   ${value ? '✓' : '✗'} ${key}`);
      });
    }

    // 檢查儀表板整合
    const dashboardCheck = this.checkDashboardIntegration();
    console.log('\n📊 儀表板整合檢查:');
    console.log(`狀態: ${this.getStatusIcon(dashboardCheck.status)} (${dashboardCheck.score || 'N/A'})`);
    if (dashboardCheck.details) {
      Object.entries(dashboardCheck.details).forEach(([key, value]) => {
        console.log(`   ${value ? '✓' : '✗'} ${key}`);
      });
    }

    // 檢查 Playwright 測試
    const testCheck = this.checkPlaywrightTests();
    console.log('\n🧪 Playwright 測試檢查:');
    console.log(`狀態: ${this.getStatusIcon(testCheck.status)}`);
    console.log(`總測試文件: ${testCheck.totalTests || 0}`);
    console.log(`整合測試文件: ${testCheck.integrationTests || 0}`);

    // 生成建議
    this.generateRecommendations(fileCheck, homepageCheck, dashboardCheck, testCheck);

    // 顯示工作流程提醒
    this.showWorkflowReminder();
  }

  /**
   * 獲取狀態圖標
   */
  getStatusIcon(status) {
    switch (status) {
      case 'good': return '✅ 良好';
      case 'warning': return '⚠️ 需要改善';
      case 'error': return '❌ 錯誤';
      default: return '❓ 未知';
    }
  }

  /**
   * 生成改善建議
   */
  generateRecommendations(fileCheck, homepageCheck, dashboardCheck, testCheck) {
    console.log('\n💡 改善建議:');

    if (fileCheck.missingFiles.length > 0) {
      console.log('📁 文件建議:');
      fileCheck.missingFiles.forEach(file => {
        console.log(`   • 創建缺失文件: ${file}`);
      });
    }

    if (homepageCheck.status !== 'good') {
      console.log('🏠 主頁建議:');
      if (homepageCheck.details) {
        Object.entries(homepageCheck.details).forEach(([key, value]) => {
          if (!value) {
            console.log(`   • 改善主頁 ${key}`);
          }
        });
      }
    }

    if (dashboardCheck.status !== 'good') {
      console.log('📊 儀表板建議:');
      if (dashboardCheck.details) {
        Object.entries(dashboardCheck.details).forEach(([key, value]) => {
          if (!value) {
            console.log(`   • 改善儀表板 ${key}`);
          }
        });
      }
    }

    if (testCheck.status !== 'good') {
      console.log('🧪 測試建議:');
      console.log('   • 創建更多整合測試文件');
      console.log('   • 確保測試覆蓋完整用戶旅程');
    }
  }

  /**
   * 顯示工作流程提醒
   */
  showWorkflowReminder() {
    console.log('\n🎯 防止功能孤立工作流程提醒:');
    console.log('=' .repeat(60));
    
    const reminders = [
      '🏠 主頁優先原則: 每個功能都必須在主頁有明顯入口',
      '📋 五項同步開發: 功能本身 + 主頁入口 + 儀表板整合 + 導航連結 + Playwright測試',
      '🔍 三層整合驗證: 主頁可見性 + 導航流程 + 功能互動',
      '🧪 Playwright 完整流程測試: 從主頁開始的端到端測試',
      '📸 證據收集: 截圖錄影報告作為整合證據'
    ];

    reminders.forEach((reminder, index) => {
      console.log(`${index + 1}. ${reminder}`);
    });

    console.log('\n📚 詳細檢查清單: docs/INTEGRATION_WORKFLOW_CHECKLIST.md');
    console.log('📋 核心規則: docs/context-rules.md');
    
    console.log('\n⚠️ 重要提醒: 開發任何新功能前，請先閱讀並遵循這些規則！');
  }

  /**
   * 運行完整檢查
   */
  run() {
    try {
      this.generateReport();
      return true;
    } catch (error) {
      console.error('❌ 工作流程檢查失敗:', error.message);
      return false;
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const reminder = new IntegrationWorkflowReminder();
  const success = reminder.run();
  process.exit(success ? 0 : 1);
}

module.exports = IntegrationWorkflowReminder;
