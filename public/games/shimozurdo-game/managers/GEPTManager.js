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
   * 初始化詞彙數據庫 - 支援雲端載入
   */
  async initializeDatabase() {
    // 🌐 第一優先：嘗試從雲端載入詞彙
    console.log('🌐 嘗試從雲端載入詞彙...');
    const cloudLoaded = await this.loadFromCloud();
    if (cloudLoaded) {
      console.log('✅ 使用雲端詞彙');
      return;
    }

    // 💾 第二優先：檢查是否有本地自定義詞彙
    const customVocabulary = this.getCustomVocabulary();
    if (customVocabulary.length > 0) {
      console.log('🎯 使用本地自定義詞彙:', customVocabulary.length, '個詞彙');

      // 使用自定義詞彙替換初級詞彙
      this.wordDatabase.set('elementary', customVocabulary);
      this.wordDatabase.set('intermediate', []);
      this.wordDatabase.set('high-intermediate', []);

      console.log('📊 本地自定義詞彙數據庫初始化完成');
      console.log(`  - 自定義: ${customVocabulary.length} 個詞彙`);
      return;
    }

    // 📚 第三優先：使用預設詞彙
    console.log('📚 使用預設詞彙');
    this.loadDefaultVocabulary();
  }

  /**
   * 🌐 從雲端 API 載入詞彙
   */
  async loadFromCloud() {
    try {
      console.log('🌐 正在從雲端 API 載入詞彙...');

      // 檢查 URL 參數中是否有 activityId
      const urlParams = new URLSearchParams(window.location.search);
      const activityId = urlParams.get('activityId');

      let apiUrl = '/api/vocabulary/sets';
      if (activityId) {
        // 如果有 activityId，只載入該活動的詞彙
        apiUrl = `/api/activities/${activityId}/vocabulary`;
        console.log('🎯 載入特定活動的詞彙:', activityId);
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 雲端 API 響應:', result);

      // 檢查是否是單個活動的響應格式
      if (activityId && result.vocabularyItems) {
        // 處理單個活動的詞彙
        console.log(`🎯 載入活動詞彙: ${result.activity.title} (${result.vocabularyItems.length} 個詞彙)`);

        // 清空現有詞彙數據庫
        this.wordDatabase.clear();

        // 將所有詞彙設為初級（因為是用戶自定義的）
        const customWords = result.vocabularyItems.map(item => ({
          id: item.id,
          english: item.english,
          chinese: item.chinese,
          level: 'elementary',
          difficulty: item.difficultyLevel || 1,
          frequency: 100 - (item.difficultyLevel || 1) * 10,
          category: 'custom',
          partOfSpeech: item.partOfSpeech || 'NOUN',
          image: item.imageUrl,
          phonetic: item.phonetic
        }));

        // 只設置初級詞彙，其他級別為空
        this.wordDatabase.set('elementary', customWords);
        this.wordDatabase.set('intermediate', []);
        this.wordDatabase.set('high-intermediate', []);

        console.log(`✅ 自定義活動詞彙載入完成，總共 ${customWords.length} 個詞彙`);
        console.log('📊 自定義詞彙數據庫統計:');
        console.log(`  - 自定義: ${customWords.length} 個詞彙`);
        return true;
      }

      // 處理所有詞彙集合的響應格式
      if (result.success && result.data && result.data.length > 0) {
        // 清空現有詞彙數據庫
        this.wordDatabase.clear();

        // 初始化各級別詞彙數組
        const levelWords = {
          'elementary': [],
          'intermediate': [],
          'high-intermediate': []
        };

        let totalWords = 0;

        // 處理每個詞彙集合
        result.data.forEach(set => {
          console.log(`📚 處理詞彙集合: ${set.title} (${set.items.length} 個詞彙)`);

          set.items.forEach(item => {
            const word = {
              id: item.id,
              english: item.english,
              chinese: item.chinese,
              level: this.mapGeptLevel(set.geptLevel),
              difficulty: item.difficultyLevel || 1,
              frequency: 100 - (item.difficultyLevel || 1) * 10,
              category: 'cloud',
              partOfSpeech: item.partOfSpeech || 'NOUN',
              image: item.imageUrl,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            };

            // 根據等級分類詞彙
            const level = word.level;
            if (levelWords[level]) {
              levelWords[level].push(word);
              totalWords++;
            }
          });
        });

        // 設置詞彙數據庫
        this.wordDatabase.set('elementary', levelWords.elementary);
        this.wordDatabase.set('intermediate', levelWords.intermediate);
        this.wordDatabase.set('high-intermediate', levelWords['high-intermediate']);

        console.log(`✅ 雲端詞彙載入完成，總共 ${totalWords} 個詞彙`);
        console.log('📊 雲端詞彙數據庫統計:');
        console.log(`  - 初級: ${levelWords.elementary.length} 個詞彙`);
        console.log(`  - 中級: ${levelWords.intermediate.length} 個詞彙`);
        console.log(`  - 高級: ${levelWords['high-intermediate'].length} 個詞彙`);

        return true;
      } else {
        console.log('⚠️ 雲端沒有詞彙數據');
        return false;
      }

    } catch (error) {
      console.error('❌ 雲端詞彙載入失敗:', error);
      return false;
    }
  }

  /**
   * 🗺️ 映射 GEPT 等級
   */
  mapGeptLevel(geptLevel) {
    const levelMap = {
      'ELEMENTARY': 'elementary',
      'INTERMEDIATE': 'intermediate',
      'ADVANCED': 'high-intermediate'
    };
    return levelMap[geptLevel] || 'elementary';
  }

  /**
   * 📚 載入預設詞彙
   */
  loadDefaultVocabulary() {
    // 初級詞彙（GEPT Elementary）- 預設詞彙
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

    console.log('📊 預設詞彙數據庫初始化完成');
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

  /**
   * 🆕 獲取自定義詞彙 - 從 localStorage 載入用戶自定義的詞彙
   */
  getCustomVocabulary() {
    try {
      const data = localStorage.getItem('vocabulary_integration_data');
      if (!data) {
        console.log('❌ 沒有找到自定義詞彙數據');
        return [];
      }

      const parsed = JSON.parse(data);
      if (!parsed.vocabulary || !Array.isArray(parsed.vocabulary)) {
        console.log('❌ 詞彙數據格式不正確');
        return [];
      }

      // 轉換為 GEPTManager 格式
      const customVocabulary = parsed.vocabulary.map((item, index) => ({
        id: (index + 1000).toString(),
        english: item.english,
        chinese: item.chinese,
        level: item.level || 'elementary',
        frequency: item.frequency || 80,
        difficulty: item.difficulty || 3,
        partOfSpeech: item.partOfSpeech || 'noun',
        category: item.category || 'custom'
      }));

      console.log('🎯 載入自定義詞彙:', customVocabulary);
      return customVocabulary;
    } catch (error) {
      console.error('❌ 載入自定義詞彙時發生錯誤:', error);
      return [];
    }
  }
}

// 導出為全局變量
window.GEPTManager = GEPTManager;

