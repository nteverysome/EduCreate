/**
 * 詞彙整合服務單元測試
 * 測試詞彙數據轉換和整合功能
 */

// 模擬 VocabularyIntegrationService
class MockVocabularyIntegrationService {
  constructor() {
    this.vocabularyDatabase = new Map();
    this.activities = new Map();
  }

  convertTableVocabulary(vocabularyItems) {
    return vocabularyItems.map(item => ({
      id: item.id,
      english: item.english.trim(),
      chinese: item.chinese.trim(),
      level: item.level,
      frequency: this.calculateFrequency(item.level),
      difficulty: this.calculateDifficulty(item.level),
      partOfSpeech: 'noun',
      category: item.category || 'general',
      image: item.image,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  createVocabularyActivity(title, vocabularyItems, description) {
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description?.trim(),
      vocabulary: this.convertTableVocabulary(vocabularyItems),
      geptLevel: this.determineActivityLevel(vocabularyItems),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activities.set(activity.id, activity);
    activity.vocabulary.forEach(word => {
      this.vocabularyDatabase.set(word.id, word);
    });

    return activity;
  }

  convertToGameFormat(vocabulary) {
    return vocabulary.map(word => ({
      id: word.id,
      english: word.english,
      chinese: word.chinese,
      level: word.level,
      frequency: word.frequency,
      difficulty: word.difficulty
    }));
  }

  getGameVocabulary(activityId) {
    const activity = this.activities.get(activityId);
    if (!activity) return [];
    return this.convertToGameFormat(activity.vocabulary);
  }

  calculateFrequency(level) {
    switch (level) {
      case 'elementary': return 80;
      case 'intermediate': return 60;
      case 'high-intermediate': return 40;
      default: return 50;
    }
  }

  calculateDifficulty(level) {
    switch (level) {
      case 'elementary': return 3;
      case 'intermediate': return 6;
      case 'high-intermediate': return 8;
      default: return 5;
    }
  }

  determineActivityLevel(vocabularyItems) {
    const levelCounts = vocabularyItems.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {});

    let maxCount = 0;
    let dominantLevel = 'elementary';
    
    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantLevel = level;
      }
    });

    return dominantLevel;
  }
}

// 測試用例
describe('詞彙整合服務測試', () => {
  let service;

  beforeEach(() => {
    service = new MockVocabularyIntegrationService();
  });

  test('應該正確轉換表格詞彙', () => {
    const vocabularyItems = [
      { id: '1', english: 'apple', chinese: '蘋果', level: 'elementary' },
      { id: '2', english: 'banana', chinese: '香蕉', level: 'elementary' }
    ];

    const converted = service.convertTableVocabulary(vocabularyItems);

    expect(converted).toHaveLength(2);
    expect(converted[0].english).toBe('apple');
    expect(converted[0].chinese).toBe('蘋果');
    expect(converted[0].level).toBe('elementary');
    expect(converted[0].frequency).toBe(80);
    expect(converted[0].difficulty).toBe(3);
  });

  test('應該創建詞彙活動', () => {
    const vocabularyItems = [
      { id: '1', english: 'dog', chinese: '狗', level: 'elementary' },
      { id: '2', english: 'cat', chinese: '貓', level: 'elementary' }
    ];

    const activity = service.createVocabularyActivity(
      '測試活動',
      vocabularyItems,
      '測試描述'
    );

    expect(activity.title).toBe('測試活動');
    expect(activity.description).toBe('測試描述');
    expect(activity.vocabulary).toHaveLength(2);
    expect(activity.geptLevel).toBe('elementary');
    expect(activity.id).toMatch(/^activity_/);
  });

  test('應該轉換為遊戲格式', () => {
    const vocabularyItems = [
      { id: '1', english: 'hello', chinese: '你好', level: 'elementary' }
    ];

    const activity = service.createVocabularyActivity('測試', vocabularyItems);
    const gameVocabulary = service.getGameVocabulary(activity.id);

    expect(gameVocabulary).toHaveLength(1);
    expect(gameVocabulary[0]).toEqual({
      id: '1',
      english: 'hello',
      chinese: '你好',
      level: 'elementary',
      frequency: 80,
      difficulty: 3
    });
  });

  test('應該正確確定活動等級', () => {
    const mixedVocabulary = [
      { id: '1', english: 'apple', chinese: '蘋果', level: 'elementary' },
      { id: '2', english: 'banana', chinese: '香蕉', level: 'elementary' },
      { id: '3', english: 'computer', chinese: '電腦', level: 'intermediate' }
    ];

    const level = service.determineActivityLevel(mixedVocabulary);
    expect(level).toBe('elementary'); // 因為 elementary 出現 2 次，最多
  });

  test('應該處理空詞彙列表', () => {
    const emptyVocabulary = [];
    const level = service.determineActivityLevel(emptyVocabulary);
    expect(level).toBe('elementary'); // 預設等級
  });
});

// 測試詞彙對應關係
describe('詞彙遊戲對應測試', () => {
  test('應該正確映射詞彙到遊戲物件', () => {
    const service = new MockVocabularyIntegrationService();
    
    const vocabularyItems = [
      { id: '1', english: 'cloud', chinese: '雲朵', level: 'elementary' }
    ];

    const activity = service.createVocabularyActivity('映射測試', vocabularyItems);
    const gameVocabulary = service.getGameVocabulary(activity.id);

    // 驗證映射關係
    expect(gameVocabulary[0].english).toBe('cloud'); // 顯示在雲朵上
    expect(gameVocabulary[0].chinese).toBe('雲朵');  // 顯示在提示區域
    
    console.log('🎮 遊戲物件映射驗證:');
    console.log('  詞彙字 (英文) → 雲朵文字:', gameVocabulary[0].english);
    console.log('  答案 (中文) → 提示區域:', gameVocabulary[0].chinese);
  });
});

// 如果在 Node.js 環境中運行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MockVocabularyIntegrationService
  };
}

console.log('✅ 詞彙整合服務測試準備完成');
console.log('🎯 測試涵蓋: 詞彙轉換、活動創建、遊戲格式轉換、等級確定');
console.log('🔗 映射關係: 詞彙字→雲朵文字, 答案→提示區域');
