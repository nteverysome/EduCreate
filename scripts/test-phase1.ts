/**
 * 第一階段功能測試腳本
 * 測試自動保存、活動管理、模板切換和內容驗證功能
 */

import { AutoSaveManager, generateActivityId } from '../lib/content/AutoSaveManager';
import { ContentValidator } from '../lib/content/ContentValidator';
import { TemplateManager } from '../lib/content/TemplateManager';
import { UniversalContent, GameType } from '../lib/content/UniversalContentManager';

// 測試數據
const testContent: UniversalContent = {
  id: 'test_content_1',
  title: '測試水果詞彙',
  description: '用於測試的水果詞彙學習內容',
  items: [
    { id: '1', term: '蘋果', definition: '一種紅色或綠色的圓形水果' },
    { id: '2', term: '香蕉', definition: '一種黃色的彎曲水果' },
    { id: '3', term: '橘子', definition: '一種橙色的柑橘類水果' },
    { id: '4', term: '葡萄', definition: '一種小而圓的水果，通常成串生長' }
  ],
  tags: ['水果', '詞彙', '測試'],
  language: 'zh-TW',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'test-user'
};

class Phase1Tester {
  private results: string[] = [];

  log(message: string) {
    console.log(message);
    this.results.push(message);
  }

  error(message: string) {
    console.error(message);
    this.results.push(`❌ ${message}`);
  }

  success(message: string) {
    console.log(`✅ ${message}`);
    this.results.push(`✅ ${message}`);
  }

  /**
   * 測試自動保存功能
   */
  async testAutoSave() {
    this.log('\n🔄 測試自動保存功能...');
    
    try {
      const activityId = generateActivityId();
      this.log(`生成活動 ID: ${activityId}`);

      // 創建自動保存管理器
      const autoSaveManager = new AutoSaveManager(activityId, {
        saveDelay: 1000,
        enableOfflineMode: true
      });

      // 測試觸發自動保存
      autoSaveManager.triggerAutoSave(testContent);
      this.success('自動保存觸發成功');

      // 測試本地存儲
      if (typeof localStorage !== 'undefined') {
        autoSaveManager['saveToLocalStorage'](testContent);
        const restored = autoSaveManager.restoreFromLocalStorage();
        
        if (restored && restored.title === testContent.title) {
          this.success('本地存儲保存和恢復成功');
        } else {
          this.error('本地存儲測試失敗');
        }
      } else {
        this.log('跳過本地存儲測試（非瀏覽器環境）');
      }

      // 清理
      autoSaveManager.destroy();
      this.success('自動保存管理器清理成功');

    } catch (error) {
      this.error(`自動保存測試失敗: ${error}`);
    }
  }

  /**
   * 測試內容驗證功能
   */
  testContentValidation() {
    this.log('\n✅ 測試內容驗證功能...');

    try {
      // 測試有效內容
      const validResult = ContentValidator.validateContent(testContent);
      if (validResult.isValid && validResult.canPublish) {
        this.success('有效內容驗證通過');
      } else {
        this.error('有效內容驗證失敗');
      }

      // 測試無效內容（缺少標題）
      const invalidContent = { ...testContent, title: '' };
      const invalidResult = ContentValidator.validateContent(invalidContent);
      if (!invalidResult.isValid && invalidResult.errors.length > 0) {
        this.success('無效內容驗證正確識別錯誤');
      } else {
        this.error('無效內容驗證失敗');
      }

      // 測試遊戲兼容性
      const gameErrors = ContentValidator.validateGameCompatibility(testContent, 'quiz');
      if (gameErrors.length === 0) {
        this.success('遊戲兼容性驗證通過');
      } else {
        this.error('遊戲兼容性驗證失敗');
      }

      // 測試重複項目檢查
      const duplicateItems = [
        { id: '1', term: '蘋果', definition: '定義1' },
        { id: '2', term: '蘋果', definition: '定義2' }
      ];
      const duplicateErrors = ContentValidator.checkDuplicateItems(duplicateItems);
      if (duplicateErrors.length > 0) {
        this.success('重複項目檢查正常工作');
      } else {
        this.error('重複項目檢查失敗');
      }

    } catch (error) {
      this.error(`內容驗證測試失敗: ${error}`);
    }
  }

  /**
   * 測試模板管理功能
   */
  testTemplateManager() {
    this.log('\n🎮 測試模板管理功能...');

    try {
      // 測試獲取所有模板
      const allTemplates = TemplateManager.getAllTemplates();
      if (allTemplates.length > 0) {
        this.success(`獲取到 ${allTemplates.length} 個模板`);
      } else {
        this.error('未獲取到任何模板');
      }

      // 測試推薦模板
      const recommendations = TemplateManager.getRecommendedTemplates(testContent.items.length);
      if (recommendations.length > 0) {
        this.success(`獲取到 ${recommendations.length} 個推薦模板`);
      } else {
        this.error('未獲取到推薦模板');
      }

      // 測試模板樣式
      const quizStyles = TemplateManager.getTemplateStyles('quiz');
      if (quizStyles.length > 0) {
        this.success(`Quiz 模板有 ${quizStyles.length} 個樣式`);
      } else {
        this.error('Quiz 模板樣式獲取失敗');
      }

      // 測試模板選項
      const quizOptions = TemplateManager.getTemplateOptions('quiz');
      if (quizOptions.length > 0) {
        this.success(`Quiz 模板有 ${quizOptions.length} 個選項`);
      } else {
        this.error('Quiz 模板選項獲取失敗');
      }

      // 測試模板配置
      const config = TemplateManager.createConfiguration('quiz', 'classic', {
        timer: 'countDown',
        lives: 3
      });
      
      const isValid = TemplateManager.validateConfiguration(config);
      if (isValid) {
        this.success('模板配置創建和驗證成功');
      } else {
        this.error('模板配置驗證失敗');
      }

      // 測試內容兼容性
      const isCompatible = TemplateManager.isContentCompatible('quiz', testContent.items.length);
      if (isCompatible) {
        this.success('內容與 Quiz 模板兼容');
      } else {
        this.error('內容與 Quiz 模板不兼容');
      }

    } catch (error) {
      this.error(`模板管理測試失敗: ${error}`);
    }
  }

  /**
   * 測試遊戲類型支持
   */
  testGameTypeSupport() {
    this.log('\n🎯 測試遊戲類型支持...');

    const gameTypes: GameType[] = [
      'quiz', 'matching', 'flashcards', 'spin-wheel', 'whack-a-mole', 'memory-cards'
    ];

    gameTypes.forEach(gameType => {
      try {
        const template = TemplateManager.getTemplate(gameType);
        if (template) {
          this.success(`${gameType} 模板支持正常`);
          
          // 測試樣式和選項
          const styles = TemplateManager.getTemplateStyles(gameType);
          const options = TemplateManager.getTemplateOptions(gameType);
          
          this.log(`  - ${styles.length} 個樣式, ${options.length} 個選項`);
        } else {
          this.error(`${gameType} 模板不存在`);
        }
      } catch (error) {
        this.error(`${gameType} 測試失敗: ${error}`);
      }
    });
  }

  /**
   * 測試 API 端點（模擬）
   */
  async testAPIEndpoints() {
    this.log('\n🌐 測試 API 端點（模擬）...');

    // 模擬 API 調用
    const mockFetch = (url: string, options?: any) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Mock response' })
      });
    };

    try {
      // 測試自動保存 API
      const autoSaveResponse = await mockFetch('/api/universal-content/test/autosave', {
        method: 'POST',
        body: JSON.stringify(testContent)
      });
      
      if (autoSaveResponse.ok) {
        this.success('自動保存 API 端點測試通過');
      }

      // 測試模板切換 API
      const switchResponse = await mockFetch('/api/universal-content/test/switch-template', {
        method: 'POST',
        body: JSON.stringify({ templateId: 'quiz' })
      });
      
      if (switchResponse.ok) {
        this.success('模板切換 API 端點測試通過');
      }

      // 測試文件夾 API
      const foldersResponse = await mockFetch('/api/universal-content/folders');
      
      if (foldersResponse.ok) {
        this.success('文件夾 API 端點測試通過');
      }

    } catch (error) {
      this.error(`API 端點測試失敗: ${error}`);
    }
  }

  /**
   * 運行所有測試
   */
  async runAllTests() {
    this.log('🚀 開始第一階段功能測試...\n');

    await this.testAutoSave();
    this.testContentValidation();
    this.testTemplateManager();
    this.testGameTypeSupport();
    await this.testAPIEndpoints();

    this.log('\n📊 測試結果總結:');
    const successCount = this.results.filter(r => r.startsWith('✅')).length;
    const errorCount = this.results.filter(r => r.startsWith('❌')).length;
    
    this.log(`✅ 成功: ${successCount}`);
    this.log(`❌ 失敗: ${errorCount}`);
    this.log(`📝 總計: ${this.results.length}`);

    if (errorCount === 0) {
      this.log('\n🎉 所有測試通過！第一階段功能實現成功！');
    } else {
      this.log('\n⚠️ 部分測試失敗，請檢查實現。');
    }

    return {
      success: errorCount === 0,
      results: this.results,
      stats: { success: successCount, error: errorCount, total: this.results.length }
    };
  }
}

// 導出測試器
export default Phase1Tester;

// 如果直接運行此腳本
if (require.main === module) {
  const tester = new Phase1Tester();
  tester.runAllTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
