/**
 * 內容驗證器測試
 * 測試內容驗證、錯誤檢測、遊戲兼容性等功能
 */

import { ContentValidator } from '../../lib/content/ContentValidator';
import { UniversalContent, UniversalContentItem } from '../../lib/content/UniversalContentManager';

describe('ContentValidator', () => {
  let validContent: UniversalContent;
  let validItems: UniversalContentItem[];

  beforeEach(() => {
    validItems = [
      { id: '1', term: '蘋果', definition: '一種紅色或綠色的圓形水果' },
      { id: '2', term: '香蕉', definition: '一種黃色的彎曲水果' },
      { id: '3', term: '橘子', definition: '一種橙色的柑橘類水果' },
      { id: '4', term: '葡萄', definition: '一種小而圓的水果，通常成串生長' }
    ];

    validContent = {
      id: 'test_content',
      title: '水果詞彙學習',
      description: '學習各種水果的名稱和特徵',
      items: validItems,
      tags: ['水果', '詞彙'],
      language: 'zh-TW',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user'
    };
  });

  describe('基本內容驗證', () => {
    test('應該驗證有效內容', () => {
      const result = ContentValidator.validateContent(validContent);

      expect(result.isValid).toBe(true);
      expect(result.canPublish).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missingFields).toHaveLength(0);
    });

    test('應該檢測缺少標題', () => {
      const invalidContent = { ...validContent, title: '' };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(false);
      expect(result.canPublish).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].severity).toBe('error');
      expect(result.missingFields).toContain('title');
    });

    test('應該檢測缺少內容項目', () => {
      const invalidContent = { ...validContent, items: [] };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(false);
      expect(result.canPublish).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('items');
      expect(result.errors[0].severity).toBe('error');
      expect(result.missingFields).toContain('items');
    });

    test('應該檢測標題過長', () => {
      const longTitle = 'a'.repeat(101);
      const invalidContent = { ...validContent, title: longTitle };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(true); // 警告不影響有效性
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('title');
      expect(result.warnings[0].severity).toBe('warning');
    });

    test('應該檢測描述過長', () => {
      const longDescription = 'a'.repeat(501);
      const invalidContent = { ...validContent, description: longDescription };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('description');
    });

    test('應該檢測標籤過多', () => {
      const manyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      const invalidContent = { ...validContent, tags: manyTags };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('tags');
    });

    test('應該檢測內容項目過多', () => {
      const manyItems = Array.from({ length: 101 }, (_, i) => ({
        id: `item_${i}`,
        term: `詞彙${i}`,
        definition: `定義${i}`
      }));
      const invalidContent = { ...validContent, items: manyItems };
      const result = ContentValidator.validateContent(invalidContent);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('items');
    });
  });

  describe('內容項目驗證', () => {
    test('應該驗證有效的內容項目', () => {
      const errors = ContentValidator.validateContentItem(validItems[0], 0);

      expect(errors).toHaveLength(0);
    });

    test('應該檢測空的詞彙/問題', () => {
      const invalidItem = { id: '1', term: '', definition: '定義' };
      const errors = ContentValidator.validateContentItem(invalidItem, 0);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('items[0].term');
      expect(errors[0].severity).toBe('error');
    });

    test('應該檢測空的定義/答案', () => {
      const invalidItem = { id: '1', term: '詞彙', definition: '' };
      const errors = ContentValidator.validateContentItem(invalidItem, 0);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('items[0].definition');
      expect(errors[0].severity).toBe('error');
    });

    test('應該檢測過長的詞彙', () => {
      const longTerm = 'a'.repeat(201);
      const invalidItem = { id: '1', term: longTerm, definition: '定義' };
      const errors = ContentValidator.validateContentItem(invalidItem, 0);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('items[0].term');
      expect(errors[0].severity).toBe('warning');
    });

    test('應該檢測過長的定義', () => {
      const longDefinition = 'a'.repeat(501);
      const invalidItem = { id: '1', term: '詞彙', definition: longDefinition };
      const errors = ContentValidator.validateContentItem(invalidItem, 0);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('items[0].definition');
      expect(errors[0].severity).toBe('warning');
    });
  });

  describe('重複項目檢查', () => {
    test('應該檢測重複的詞彙', () => {
      const duplicateItems = [
        { id: '1', term: '蘋果', definition: '定義1' },
        { id: '2', term: '蘋果', definition: '定義2' },
        { id: '3', term: '香蕉', definition: '定義3' }
      ];

      const errors = ContentValidator.checkDuplicateItems(duplicateItems);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('items[0,1].term');
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toContain('蘋果');
    });

    test('應該忽略大小寫差異', () => {
      const duplicateItems = [
        { id: '1', term: '蘋果', definition: '定義1' },
        { id: '2', term: '蘋果', definition: '定義2' }
      ];

      const errors = ContentValidator.checkDuplicateItems(duplicateItems);

      expect(errors).toHaveLength(1);
    });

    test('應該處理沒有重複的情況', () => {
      const errors = ContentValidator.checkDuplicateItems(validItems);

      expect(errors).toHaveLength(0);
    });
  });

  describe('遊戲兼容性驗證', () => {
    test('應該驗證 Quiz 遊戲兼容性', () => {
      const errors = ContentValidator.validateGameCompatibility(validContent, 'quiz');

      expect(errors).toHaveLength(0);
    });

    test('應該檢測項目數量不足', () => {
      const insufficientContent = { ...validContent, items: [validItems[0]] };
      const errors = ContentValidator.validateGameCompatibility(insufficientContent, 'whack-a-mole');

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('至少需要 5 個項目');
    });

    test('應該檢測項目數量過多', () => {
      const manyItems = Array.from({ length: 51 }, (_, i) => ({
        id: `item_${i}`,
        term: `詞彙${i}`,
        definition: `定義${i}`
      }));
      const excessiveContent = { ...validContent, items: manyItems };
      const errors = ContentValidator.validateGameCompatibility(excessiveContent, 'quiz');

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toContain('最多支持 50 個項目');
    });

    test('應該檢測需要偶數項目的遊戲', () => {
      const oddContent = { ...validContent, items: validItems.slice(0, 3) }; // 3個項目
      const errors = ContentValidator.validateGameCompatibility(oddContent, 'memory-cards');

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('需要偶數個項目');
    });
  });

  describe('遊戲要求獲取', () => {
    test('應該獲取 Quiz 遊戲要求', () => {
      const requirements = ContentValidator.getGameRequirements('quiz');

      expect(requirements.name).toBe('測驗問答');
      expect(requirements.minItems).toBe(1);
      expect(requirements.maxItems).toBe(50);
      expect(requirements.requiresEvenItems).toBe(false);
    });

    test('應該獲取記憶卡片遊戲要求', () => {
      const requirements = ContentValidator.getGameRequirements('memory-cards');

      expect(requirements.name).toBe('記憶卡片');
      expect(requirements.minItems).toBe(4);
      expect(requirements.maxItems).toBe(24);
      expect(requirements.requiresEvenItems).toBe(true);
    });

    test('應該處理未知遊戲類型', () => {
      const requirements = ContentValidator.getGameRequirements('unknown' as any);

      expect(requirements.name).toBe('未知遊戲');
      expect(requirements.minItems).toBe(1);
      expect(requirements.maxItems).toBe(50);
    });
  });

  describe('修復建議生成', () => {
    test('應該生成修復建議', () => {
      const invalidContent = { ...validContent, title: '', items: [] };
      const result = ContentValidator.validateContent(invalidContent);
      const suggestions = ContentValidator.generateFixSuggestions(result);

      expect(suggestions).toContain('添加一個描述性的活動標題');
      expect(suggestions).toContain('添加至少一個問題和答案對');
    });

    test('應該為有效內容生成空建議', () => {
      const result = ContentValidator.validateContent(validContent);
      const suggestions = ContentValidator.generateFixSuggestions(result);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('錯誤消息格式化', () => {
    test('應該格式化單個錯誤', () => {
      const errors = [
        { field: 'title', message: '標題是必需的', severity: 'error' as const }
      ];
      const message = ContentValidator.formatErrorMessage(errors);

      expect(message).toBe('標題是必需的');
    });

    test('應該格式化多個錯誤', () => {
      const errors = [
        { field: 'title', message: '標題是必需的', severity: 'error' as const },
        { field: 'items', message: '至少需要1個項目', severity: 'error' as const }
      ];
      const message = ContentValidator.formatErrorMessage(errors);

      expect(message).toContain('發現 2 個錯誤');
      expect(message).toContain('1. 標題是必需的');
      expect(message).toContain('2. 至少需要1個項目');
    });

    test('應該處理空錯誤列表', () => {
      const message = ContentValidator.formatErrorMessage([]);

      expect(message).toBe('');
    });

    test('應該只格式化錯誤，忽略警告', () => {
      const errors = [
        { field: 'title', message: '標題是必需的', severity: 'error' as const },
        { field: 'description', message: '描述過長', severity: 'warning' as const }
      ];
      const message = ContentValidator.formatErrorMessage(errors);

      expect(message).toBe('標題是必需的');
    });
  });
});
