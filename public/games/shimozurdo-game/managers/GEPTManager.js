/**
 * GEPT 詞彙管理器
 * 管理 GEPT 三級詞彙分級系統
 */
class GEPTManager {
  constructor() {
    this.currentLevel = 'elementary';
    this.wordDatabase = new Map();
    this.initializeDatabase();
    console.log('📚 GEPT 詞彙管理器初始化完成');
  }

  /**
   * 初始化詞彙數據庫
   */
  initializeDatabase() {
    // 初級詞彙（GEPT Elementary）
    const elementaryWords = [
      { id: '1', english: 'friend', chinese: '朋友', level: 'elementary' },
      { id: '2', english: 'family', chinese: '家庭', level: 'elementary' },
      { id: '3', english: 'school', chinese: '學校', level: 'elementary' },
      { id: '4', english: 'teacher', chinese: '老師', level: 'elementary' },
      { id: '5', english: 'student', chinese: '學生', level: 'elementary' },
      { id: '6', english: 'book', chinese: '書', level: 'elementary' },
      { id: '7', english: 'pen', chinese: '筆', level: 'elementary' },
      { id: '8', english: 'desk', chinese: '桌子', level: 'elementary' },
      { id: '9', english: 'chair', chinese: '椅子', level: 'elementary' },
      { id: '10', english: 'door', chinese: '門', level: 'elementary' },
      { id: '11', english: 'window', chinese: '窗戶', level: 'elementary' },
      { id: '12', english: 'apple', chinese: '蘋果', level: 'elementary' },
      { id: '13', english: 'banana', chinese: '香蕉', level: 'elementary' },
      { id: '14', english: 'water', chinese: '水', level: 'elementary' },
      { id: '15', english: 'milk', chinese: '牛奶', level: 'elementary' }
    ];

    // 中級詞彙（GEPT Intermediate）
    const intermediateWords = [
      { id: '16', english: 'environment', chinese: '環境', level: 'intermediate' },
      { id: '17', english: 'technology', chinese: '科技', level: 'intermediate' },
      { id: '18', english: 'education', chinese: '教育', level: 'intermediate' },
      { id: '19', english: 'government', chinese: '政府', level: 'intermediate' },
      { id: '20', english: 'society', chinese: '社會', level: 'intermediate' },
      { id: '21', english: 'culture', chinese: '文化', level: 'intermediate' },
      { id: '22', english: 'economy', chinese: '經濟', level: 'intermediate' },
      { id: '23', english: 'politics', chinese: '政治', level: 'intermediate' },
      { id: '24', english: 'science', chinese: '科學', level: 'intermediate' },
      { id: '25', english: 'history', chinese: '歷史', level: 'intermediate' }
    ];

    // 高級詞彙（GEPT High-Intermediate）
    const highIntermediateWords = [
      { id: '26', english: 'phenomenon', chinese: '現象', level: 'high-intermediate' },
      { id: '27', english: 'hypothesis', chinese: '假設', level: 'high-intermediate' },
      { id: '28', english: 'methodology', chinese: '方法論', level: 'high-intermediate' },
      { id: '29', english: 'infrastructure', chinese: '基礎設施', level: 'high-intermediate' },
      { id: '30', english: 'sustainability', chinese: '永續性', level: 'high-intermediate' }
    ];

    this.wordDatabase.set('elementary', elementaryWords);
    this.wordDatabase.set('intermediate', intermediateWords);
    this.wordDatabase.set('high-intermediate', highIntermediateWords);

    console.log('📊 詞彙數據庫初始化完成');
    console.log(`  - 初級: ${elementaryWords.length} 個詞彙`);
    console.log(`  - 中級: ${intermediateWords.length} 個詞彙`);
    console.log(`  - 高級: ${highIntermediateWords.length} 個詞彙`);
  }

  /**
   * 設置當前 GEPT 等級
   */
  setLevel(level) {
    if (this.wordDatabase.has(level)) {
      this.currentLevel = level;
      console.log(`📊 設置 GEPT 等級: ${level}`);
    } else {
      console.warn(`⚠️ 無效的 GEPT 等級: ${level}`);
    }
  }

  /**
   * 獲取當前等級
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * 獲取指定等級的詞彙
   */
  getWordsForLevel(level) {
    return this.wordDatabase.get(level) || [];
  }

  /**
   * 獲取當前等級的詞彙
   */
  getCurrentLevelWords() {
    return this.getWordsForLevel(this.currentLevel);
  }

  /**
   * 獲取隨機詞彙
   */
  getRandomWord(level) {
    const targetLevel = level || this.currentLevel;
    const words = this.getWordsForLevel(targetLevel);
    
    if (words.length === 0) {
      console.warn(`⚠️ 沒有找到 ${targetLevel} 等級的詞彙`);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

  /**
   * 獲取多個隨機詞彙
   */
  getRandomWords(count, level) {
    const targetLevel = level || this.currentLevel;
    const words = this.getWordsForLevel(targetLevel);
    
    if (words.length === 0) return [];

    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * 添加新詞彙
   */
  addWord(word) {
    const words = this.wordDatabase.get(word.level);
    if (!words) {
      console.warn(`⚠️ 無效的 GEPT 等級: ${word.level}`);
      return false;
    }

    // 檢查是否已存在
    const exists = words.some(w => w.english.toLowerCase() === word.english.toLowerCase());
    if (exists) {
      console.warn(`⚠️ 詞彙 "${word.english}" 已存在`);
      return false;
    }

    words.push(word);
    console.log(`✅ 添加詞彙: ${word.english} (${word.level})`);
    return true;
  }

  /**
   * 獲取詞彙總數
   */
  getTotalWordCount() {
    let total = 0;
    this.wordDatabase.forEach(words => {
      total += words.length;
    });
    return total;
  }

  /**
   * 獲取統計信息
   */
  getStatistics() {
    return {
      elementary: this.getWordsForLevel('elementary').length,
      intermediate: this.getWordsForLevel('intermediate').length,
      'high-intermediate': this.getWordsForLevel('high-intermediate').length,
      total: this.getTotalWordCount()
    };
  }
}

// 導出為全局變量
window.GEPTManager = GEPTManager;

