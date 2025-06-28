/**
 * 模板管理器測試
 * 測試模板獲取、推薦、樣式管理、選項配置等功能
 */

import { TemplateManager } from '../../lib/content/TemplateManager';
import { GameType } from '../../lib/content/UniversalContentManager';

describe('TemplateManager', () => {
  describe('模板獲取', () => {
    test('應該獲取所有可用模板', () => {
      const templates = TemplateManager.getAllTemplates();

      expect(templates).toHaveLength(6);
      expect(templates.map(t => t.id)).toContain('quiz');
      expect(templates.map(t => t.id)).toContain('matching');
      expect(templates.map(t => t.id)).toContain('flashcards');
      expect(templates.map(t => t.id)).toContain('spin-wheel');
      expect(templates.map(t => t.id)).toContain('whack-a-mole');
      expect(templates.map(t => t.id)).toContain('memory-cards');
    });

    test('應該根據類別獲取模板', () => {
      const quizTemplates = TemplateManager.getTemplatesByCategory('quiz');
      const actionTemplates = TemplateManager.getTemplatesByCategory('action');

      expect(quizTemplates).toHaveLength(1);
      expect(quizTemplates[0].id).toBe('quiz');

      expect(actionTemplates).toHaveLength(2);
      expect(actionTemplates.map(t => t.id)).toContain('spin-wheel');
      expect(actionTemplates.map(t => t.id)).toContain('whack-a-mole');
    });

    test('應該獲取特定模板', () => {
      const quizTemplate = TemplateManager.getTemplate('quiz');

      expect(quizTemplate).toBeDefined();
      expect(quizTemplate!.id).toBe('quiz');
      expect(quizTemplate!.name).toBe('測驗問答');
      expect(quizTemplate!.difficulty).toBe('easy');
    });

    test('應該處理不存在的模板', () => {
      const nonExistentTemplate = TemplateManager.getTemplate('non-existent' as GameType);

      expect(nonExistentTemplate).toBeUndefined();
    });
  });

  describe('模板推薦', () => {
    test('應該根據項目數量推薦模板', () => {
      const recommendations = TemplateManager.getRecommendedTemplates(5);

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(template => {
        expect(template.minItems).toBeLessThanOrEqual(5);
        expect(template.maxItems).toBeGreaterThanOrEqual(5);
      });
    });

    test('應該優先推薦簡單的遊戲', () => {
      const recommendations = TemplateManager.getRecommendedTemplates(10);

      // 第一個推薦應該是簡單難度
      expect(recommendations[0].difficulty).toBe('easy');
    });

    test('應該排除需要偶數項目但提供奇數項目的模板', () => {
      const recommendations = TemplateManager.getRecommendedTemplates(5); // 奇數

      const memoryCardsTemplate = recommendations.find(t => t.id === 'memory-cards');
      expect(memoryCardsTemplate).toBeUndefined();
    });

    test('應該包含需要偶數項目且提供偶數項目的模板', () => {
      const recommendations = TemplateManager.getRecommendedTemplates(6); // 偶數

      const memoryCardsTemplate = recommendations.find(t => t.id === 'memory-cards');
      expect(memoryCardsTemplate).toBeDefined();
    });

    test('應該限制推薦數量', () => {
      const recommendations = TemplateManager.getRecommendedTemplates(10);

      expect(recommendations.length).toBeLessThanOrEqual(6);
    });
  });

  describe('視覺樣式管理', () => {
    test('應該獲取 Quiz 模板的樣式', () => {
      const styles = TemplateManager.getTemplateStyles('quiz');

      expect(styles.length).toBeGreaterThan(3);
      expect(styles.map(s => s.id)).toContain('classic');
      expect(styles.map(s => s.id)).toContain('classroom');
      expect(styles.map(s => s.id)).toContain('tv-gameshow');
      expect(styles.map(s => s.id)).toContain('blackboard');
    });

    test('應該獲取 Matching 模板的樣式', () => {
      const styles = TemplateManager.getTemplateStyles('matching');

      expect(styles.length).toBeGreaterThan(3);
      expect(styles.map(s => s.id)).toContain('classic');
      expect(styles.map(s => s.id)).toContain('wooden-desk');
    });

    test('應該為未知模板返回通用樣式', () => {
      const styles = TemplateManager.getTemplateStyles('unknown' as GameType);

      expect(styles.length).toBe(3); // 只有通用樣式
      expect(styles.map(s => s.id)).toContain('classic');
      expect(styles.map(s => s.id)).toContain('classroom');
      expect(styles.map(s => s.id)).toContain('clouds');
    });

    test('樣式應該包含完整的顏色配置', () => {
      const styles = TemplateManager.getTemplateStyles('quiz');
      const classicStyle = styles.find(s => s.id === 'classic');

      expect(classicStyle).toBeDefined();
      expect(classicStyle!.colors).toHaveProperty('primary');
      expect(classicStyle!.colors).toHaveProperty('secondary');
      expect(classicStyle!.colors).toHaveProperty('background');
      expect(classicStyle!.colors).toHaveProperty('text');
    });
  });

  describe('遊戲選項管理', () => {
    test('應該獲取 Quiz 模板的選項', () => {
      const options = TemplateManager.getTemplateOptions('quiz');

      expect(options.length).toBeGreaterThan(4);
      
      const timerOption = options.find(o => o.id === 'timer');
      expect(timerOption).toBeDefined();
      expect(timerOption!.type).toBe('radio');
      expect(timerOption!.options).toContain('none');
      expect(timerOption!.options).toContain('countUp');
      expect(timerOption!.options).toContain('countDown');

      const livesOption = options.find(o => o.id === 'lives');
      expect(livesOption).toBeDefined();
      expect(livesOption!.type).toBe('slider');
      expect(livesOption!.min).toBe(0);
      expect(livesOption!.max).toBe(10);
    });

    test('應該獲取 Matching 模板的選項', () => {
      const options = TemplateManager.getTemplateOptions('matching');

      const layoutOption = options.find(o => o.id === 'layout');
      expect(layoutOption).toBeDefined();
      expect(layoutOption!.options).toContain('grid');
      expect(layoutOption!.options).toContain('columns');
      expect(layoutOption!.options).toContain('scattered');
    });

    test('應該為未知模板返回通用選項', () => {
      const options = TemplateManager.getTemplateOptions('unknown' as GameType);

      expect(options.length).toBe(2); // 只有通用選項
      expect(options.map(o => o.id)).toContain('timer');
      expect(options.map(o => o.id)).toContain('shuffleQuestions');
    });
  });

  describe('模板配置管理', () => {
    test('應該創建有效的模板配置', () => {
      const config = TemplateManager.createConfiguration('quiz', 'classic', {
        timer: 'countDown',
        lives: 3
      });

      expect(config.templateId).toBe('quiz');
      expect(config.visualStyle).toBe('classic');
      expect(config.gameOptions.timer).toBe('countDown');
      expect(config.gameOptions.lives).toBe(3);
    });

    test('應該使用默認值創建配置', () => {
      const config = TemplateManager.createConfiguration('quiz');

      expect(config.templateId).toBe('quiz');
      expect(config.visualStyle).toBe('classic');
      expect(config.gameOptions).toHaveProperty('timer');
      expect(config.gameOptions).toHaveProperty('shuffleQuestions');
    });

    test('應該拋出不存在模板的錯誤', () => {
      expect(() => {
        TemplateManager.createConfiguration('non-existent' as GameType);
      }).toThrow('未找到模板: non-existent');
    });

    test('應該合併默認選項和自定義選項', () => {
      const config = TemplateManager.createConfiguration('quiz', 'classic', {
        timer: 'countUp' // 覆蓋默認值
        // lives 使用默認值
      });

      expect(config.gameOptions.timer).toBe('countUp');
      expect(config.gameOptions.lives).toBe(0); // 默認值
    });
  });

  describe('配置驗證', () => {
    test('應該驗證有效配置', () => {
      const config = TemplateManager.createConfiguration('quiz', 'classic', {
        timer: 'countDown',
        lives: 5
      });

      const isValid = TemplateManager.validateConfiguration(config);

      expect(isValid).toBe(true);
    });

    test('應該拒絕不存在的模板', () => {
      const invalidConfig = {
        templateId: 'non-existent' as GameType,
        visualStyle: 'classic',
        gameOptions: {}
      };

      const isValid = TemplateManager.validateConfiguration(invalidConfig);

      expect(isValid).toBe(false);
    });

    test('應該拒絕不存在的視覺樣式', () => {
      const invalidConfig = {
        templateId: 'quiz' as GameType,
        visualStyle: 'non-existent',
        gameOptions: {}
      };

      const isValid = TemplateManager.validateConfiguration(invalidConfig);

      expect(isValid).toBe(false);
    });

    test('應該拒絕無效的選項值', () => {
      const invalidConfig = {
        templateId: 'quiz' as GameType,
        visualStyle: 'classic',
        gameOptions: {
          timer: 'invalid-value', // 無效的 radio 選項
          lives: 15 // 超出範圍的 slider 值
        }
      };

      const isValid = TemplateManager.validateConfiguration(invalidConfig);

      expect(isValid).toBe(false);
    });

    test('應該接受範圍內的 slider 值', () => {
      const validConfig = {
        templateId: 'quiz' as GameType,
        visualStyle: 'classic',
        gameOptions: {
          lives: 5 // 在 0-10 範圍內
        }
      };

      const isValid = TemplateManager.validateConfiguration(validConfig);

      expect(isValid).toBe(true);
    });
  });

  describe('內容兼容性檢查', () => {
    test('應該檢查內容與模板的兼容性', () => {
      const isCompatible = TemplateManager.isContentCompatible('quiz', 10);

      expect(isCompatible).toBe(true);
    });

    test('應該拒絕項目數量不足的內容', () => {
      const isCompatible = TemplateManager.isContentCompatible('whack-a-mole', 3);

      expect(isCompatible).toBe(false);
    });

    test('應該拒絕項目數量過多的內容', () => {
      const isCompatible = TemplateManager.isContentCompatible('spin-wheel', 25);

      expect(isCompatible).toBe(false);
    });

    test('應該檢查偶數項目要求', () => {
      const oddCompatible = TemplateManager.isContentCompatible('memory-cards', 5);
      const evenCompatible = TemplateManager.isContentCompatible('memory-cards', 6);

      expect(oddCompatible).toBe(false);
      expect(evenCompatible).toBe(true);
    });

    test('應該處理不存在的模板', () => {
      const isCompatible = TemplateManager.isContentCompatible('non-existent' as GameType, 10);

      expect(isCompatible).toBe(false);
    });
  });
});
