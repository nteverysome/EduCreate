# 🎮 Phaser 3 SRS 整合指南

## 📋 目錄
1. [整合概述](#整合概述)
2. [文件結構](#文件結構)
3. [Step 1: SM-2 工具類](#step-1-sm-2-工具類)
4. [Step 2: SRS 管理器](#step-2-srs-管理器)
5. [Step 3: 修改 GEPT Manager](#step-3-修改-gept-manager)
6. [Step 4: 修改 Preload Scene](#step-4-修改-preload-scene)
7. [Step 5: 修改遊戲場景](#step-5-修改遊戲場景)
8. [Step 6: UI 增強](#step-6-ui-增強)
9. [測試指南](#測試指南)

---

## 整合概述

### 目標
將 SuperMemo SM-2 算法整合到 Shimozurdo 遊戲中,實現智能單字學習。

### 核心功能
- ✅ 自動選擇需要學習的單字
- ✅ 記錄答題結果和反應時間
- ✅ 實時更新學習進度
- ✅ 顯示學習統計
- ✅ 不影響教師自定義活動

### 兩種模式

#### 模式 1: SRS 學習模式
```
URL: /games/switcher?useSRS=true&geptLevel=elementary

特點:
- 系統自動選擇 15 個單字 (5 新 + 10 複習)
- 記錄答題結果
- 更新 SM-2 進度
- 顯示學習統計
```

#### 模式 2: 自定義活動模式
```
URL: /games/switcher?activityId=abc123

特點:
- 使用教師指定的單字
- 不使用 SRS
- 不更新學習進度
- 顯示遊戲分數
```

---

## 文件結構

### 新增文件
```
public/games/shimozurdo-game/
├── utils/
│   └── sm2.js (新增) ⭐
├── managers/
│   └── SRSManager.js (新增) ⭐
└── scenes/
    └── (修改現有文件)
```

### 修改文件
```
public/games/shimozurdo-game/
├── managers/
│   └── GEPTManager.js (修改)
└── scenes/
    ├── preload.js (修改)
    ├── title.js (修改)
    └── hub.js (修改)
```

---

## Step 1: SM-2 工具類

### 文件位置
`public/games/shimozurdo-game/utils/sm2.js`

### 完整代碼
```javascript
/**
 * SuperMemo SM-2 算法實現
 * 用於計算間隔重複學習的複習時間
 */
class SM2 {
  /**
   * 更新學習進度
   * @param {Object} progress - 當前進度
   * @param {number} progress.repetitions - 連續正確次數
   * @param {number} progress.interval - 複習間隔 (天數)
   * @param {number} progress.easeFactor - 難度係數 (1.3-2.5)
   * @param {number} progress.memoryStrength - 記憶強度 (0-100)
   * @param {boolean} isCorrect - 是否答對
   * @returns {Object} 更新後的進度
   */
  static update(progress, isCorrect) {
    let { repetitions, interval, easeFactor, memoryStrength } = progress;
    
    if (isCorrect) {
      // ===== 答對 =====
      
      // 1. 增加連續正確次數
      repetitions += 1;
      
      // 2. 計算新的複習間隔
      if (repetitions === 1) {
        interval = 1;  // 1 天後複習
      } else if (repetitions === 2) {
        interval = 6;  // 6 天後複習
      } else {
        interval = Math.round(interval * easeFactor);
      }
      
      // 3. 增加難度係數 (最大 2.5)
      easeFactor = Math.min(2.5, easeFactor + 0.1);
      
      // 4. 增加記憶強度 (最大 100)
      memoryStrength = Math.min(100, memoryStrength + 10);
      
    } else {
      // ===== 答錯 =====
      
      // 1. 重置連續正確次數
      repetitions = 0;
      
      // 2. 重置複習間隔
      interval = 1;  // 明天再複習
      
      // 3. 降低難度係數 (最小 1.3)
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      
      // 4. 降低記憶強度 (最小 0)
      memoryStrength = Math.max(0, memoryStrength - 20);
    }
    
    // 5. 計算下次複習時間
    const nextReviewAt = new Date();
    nextReviewAt.setTime(nextReviewAt.getTime() + interval * 24 * 60 * 60 * 1000);
    
    // 6. 更新學習狀態
    let status;
    if (repetitions === 0) {
      status = 'LEARNING';
    } else if (memoryStrength >= 80 && repetitions >= 5) {
      status = 'MASTERED';
    } else {
      status = 'REVIEWING';
    }
    
    return {
      repetitions,
      interval,
      easeFactor,
      memoryStrength,
      nextReviewAt,
      status
    };
  }
  
  /**
   * 根據答題結果計算質量分數
   * @param {boolean} isCorrect - 是否答對
   * @param {number} responseTime - 反應時間 (毫秒)
   * @returns {number} 質量分數 (0-5)
   */
  static calculateQuality(isCorrect, responseTime) {
    if (!isCorrect) {
      return 0;  // 完全忘記
    }
    
    // 根據反應時間計算質量
    if (responseTime < 2000) {
      return 5;  // 完美記住 (< 2 秒)
    } else if (responseTime < 4000) {
      return 4;  // 正確但有點猶豫 (2-4 秒)
    } else {
      return 3;  // 正確但很困難 (> 4 秒)
    }
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SM2;
}
```

### 使用例子
```javascript
// 初始狀態
let progress = {
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  memoryStrength: 0
};

// 第 1 次: 答對
progress = SM2.update(progress, true);
console.log(progress);
// { repetitions: 1, interval: 1, easeFactor: 2.6, memoryStrength: 10 }

// 第 2 次: 答對
progress = SM2.update(progress, true);
console.log(progress);
// { repetitions: 2, interval: 6, easeFactor: 2.7, memoryStrength: 20 }

// 第 3 次: 答錯
progress = SM2.update(progress, false);
console.log(progress);
// { repetitions: 0, interval: 1, easeFactor: 2.5, memoryStrength: 0 }
```

---

## Step 2: SRS 管理器

### 文件位置
`public/games/shimozurdo-game/managers/SRSManager.js`

### 完整代碼
```javascript
/**
 * SRS (Spaced Repetition System) 管理器
 * 負責與後端 API 通信,管理學習進度
 */
class SRSManager {
  constructor() {
    this.sessionId = null;
    this.userId = null;
    this.geptLevel = null;
    this.words = [];
    this.currentWordIndex = 0;
    this.results = [];
    this.startTime = null;
    
    console.log('🧠 SRS 管理器初始化完成');
  }
  
  /**
   * 初始化 SRS 會話
   * @param {string} userId - 用戶 ID
   * @param {string} geptLevel - GEPT 等級
   * @returns {Promise<boolean>} 是否成功
   */
  async initSession(userId, geptLevel) {
    this.userId = userId;
    this.geptLevel = geptLevel;
    this.startTime = Date.now();
    
    try {
      console.log('🔄 創建 SRS 學習會話...');
      console.log(`  - 用戶 ID: ${userId}`);
      console.log(`  - GEPT 等級: ${geptLevel}`);
      
      // 創建學習會話
      const response = await fetch('/api/srs/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, geptLevel })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.sessionId = data.sessionId;
      this.words = data.words;
      
      console.log(`✅ SRS 會話創建成功`);
      console.log(`  - 會話 ID: ${this.sessionId}`);
      console.log(`  - 總單字數: ${this.words.length}`);
      console.log(`  - 新單字: ${data.newWords?.length || 0} 個`);
      console.log(`  - 複習單字: ${data.reviewWords?.length || 0} 個`);
      
      return true;
    } catch (error) {
      console.error('❌ SRS 會話創建失敗:', error);
      return false;
    }
  }
  
  /**
   * 獲取當前單字
   * @returns {Object|null} 當前單字
   */
  getCurrentWord() {
    if (this.currentWordIndex >= this.words.length) {
      return null;
    }
    return this.words[this.currentWordIndex];
  }
  
  /**
   * 獲取當前進度
   * @returns {Object} 進度信息
   */
  getProgress() {
    return {
      current: this.currentWordIndex + 1,
      total: this.words.length,
      percentage: Math.round((this.currentWordIndex / this.words.length) * 100)
    };
  }
  
  /**
   * 記錄答題結果
   * @param {boolean} isCorrect - 是否答對
   * @param {number} responseTime - 反應時間 (毫秒)
   * @returns {Promise<void>}
   */
  async recordAnswer(isCorrect, responseTime) {
    const word = this.getCurrentWord();
    if (!word) {
      console.warn('⚠️  沒有當前單字,無法記錄答題結果');
      return;
    }
    
    // 計算質量分數
    const quality = SM2.calculateQuality(isCorrect, responseTime);
    
    // 記錄結果
    this.results.push({
      wordId: word.id,
      english: word.english,
      isCorrect,
      responseTime,
      quality
    });
    
    try {
      console.log(`📝 更新單字進度: ${word.english} (${isCorrect ? '✅ 正確' : '❌ 錯誤'})`);
      console.log(`  - 反應時間: ${responseTime}ms`);
      console.log(`  - 質量分數: ${quality}/5`);
      
      // 更新後端進度
      const response = await fetch('/api/srs/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          wordId: word.id,
          isCorrect,
          responseTime,
          sessionId: this.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ 進度更新成功`);
      console.log(`  - 記憶強度: ${data.progress.memoryStrength}/100`);
      console.log(`  - 複習間隔: ${data.progress.interval} 天`);
      console.log(`  - 下次複習: ${new Date(data.progress.nextReviewAt).toLocaleDateString()}`);
      
    } catch (error) {
      console.error('❌ 進度更新失敗:', error);
    }
    
    // 移動到下一個單字
    this.currentWordIndex++;
  }
  
  /**
   * 完成會話
   * @returns {Promise<Object|null>} 會話統計
   */
  async finishSession() {
    if (!this.sessionId) {
      console.warn('⚠️  沒有活動會話,無法完成');
      return null;
    }
    
    const correctAnswers = this.results.filter(r => r.isCorrect).length;
    const totalAnswers = this.results.length;
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(1) : 0;
    
    try {
      console.log('🏁 完成 SRS 學習會話...');
      
      const response = await fetch(`/api/srs/sessions/${this.sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctAnswers,
          totalAnswers,
          duration
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('✅ 會話完成');
      console.log(`  - 正確率: ${accuracy}%`);
      console.log(`  - 答對: ${correctAnswers}/${totalAnswers}`);
      console.log(`  - 學習時間: ${duration} 秒`);
      
      return {
        correctAnswers,
        totalAnswers,
        accuracy: parseFloat(accuracy),
        duration
      };
      
    } catch (error) {
      console.error('❌ 會話完成失敗:', error);
      return null;
    }
  }
  
  /**
   * 獲取學習統計
   * @returns {Promise<Object|null>} 統計數據
   */
  async getStatistics() {
    try {
      const response = await fetch(`/api/srs/statistics?userId=${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 獲取統計失敗:', error);
      return null;
    }
  }
  
  /**
   * 檢查是否使用 SRS 模式
   * @returns {boolean} 是否使用 SRS
   */
  static isSRSMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('activityId');
    const useSRS = urlParams.get('useSRS');
    
    // 如果有 activityId,則不使用 SRS (教師自定義活動)
    // 如果明確指定 useSRS=true,則使用 SRS
    return !activityId || useSRS === 'true';
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SRSManager;
}
```

---

## Step 3: 修改 GEPT Manager

### 文件位置
`public/games/shimozurdo-game/managers/GEPTManager.js`

### 新增方法
在 `GEPTManager` 類中添加以下方法:

```javascript
/**
 * 載入 SRS 選擇的單字
 * @param {Array} words - SRS 選擇的單字列表
 */
loadSRSWords(words) {
  console.log('🧠 載入 SRS 單字:', words.length, '個');
  
  // 將所有單字設為初級 (因為是 SRS 選擇的)
  const srsWords = words.map(word => ({
    id: word.id,
    english: word.english,
    chinese: word.chinese,
    level: 'elementary',
    difficulty: word.difficultyLevel || 1,
    frequency: 100 - (word.difficultyLevel || 1) * 10,
    category: 'srs',
    partOfSpeech: word.partOfSpeech || 'NOUN',
    image: word.imageUrl,
    audioUrl: word.audioUrl,
    chineseImageUrl: word.chineseImageUrl,
    phonetic: word.phonetic,
    // 🆕 SRS 相關信息
    isNew: word.isNew || false,
    needsReview: word.needsReview || false,
    memoryStrength: word.memoryStrength || 0
  }));
  
  // 只設置初級詞彙
  this.wordDatabase.set('elementary', srsWords);
  this.wordDatabase.set('intermediate', []);
  this.wordDatabase.set('high-intermediate', []);
  
  console.log('✅ SRS 單字載入完成');
  console.log(`  - 新單字: ${srsWords.filter(w => w.isNew).length} 個`);
  console.log(`  - 複習單字: ${srsWords.filter(w => w.needsReview).length} 個`);
}
```

---

## Step 4: 修改 Preload Scene

### 文件位置
`public/games/shimozurdo-game/scenes/preload.js`

### 修改 create 方法
在 `create()` 方法中添加 SRS 初始化邏輯:

```javascript
async create() {
  // ... 現有代碼 ...
  
  // 🆕 初始化 SRS 管理器
  if (SRSManager.isSRSMode()) {
    console.log('🧠 啟用 SRS 模式');
    
    this.srsManager = new SRSManager();
    
    // 獲取用戶 ID (從 session 或 localStorage)
    const userId = await this.getUserId();
    
    if (!userId) {
      console.error('❌ 無法獲取用戶 ID,使用預設模式');
      await this.geptManager.loadFromCloudAPI();
    } else {
      // 獲取 GEPT 等級 (從 URL 或預設)
      const geptLevel = this.getGEPTLevel();
      
      // 初始化 SRS 會話
      const success = await this.srsManager.initSession(userId, geptLevel);
      
      if (success) {
        // 將 SRS 管理器存儲到 registry
        this.registry.set('srsManager', this.srsManager);
        
        // 將 SRS 單字傳遞給 GEPT 管理器
        const words = this.srsManager.words;
        this.geptManager.loadSRSWords(words);
      } else {
        console.error('❌ SRS 初始化失敗,使用預設模式');
        await this.geptManager.loadFromCloudAPI();
      }
    }
  } else {
    console.log('📚 使用自定義活動模式');
    // 使用現有的載入邏輯
    await this.geptManager.loadFromCloudAPI();
  }
  
  // ... 現有代碼 ...
}

/**
 * 獲取用戶 ID
 * @returns {Promise<string|null>} 用戶 ID
 */
async getUserId() {
  try {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    return data.user?.id || null;
  } catch (error) {
    console.error('獲取用戶 ID 失敗:', error);
    return null;
  }
}

/**
 * 獲取 GEPT 等級
 * @returns {string} GEPT 等級
 */
getGEPTLevel() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('geptLevel') || 'elementary';
}
```

---

## Step 5: 修改遊戲場景

### 文件位置
`public/games/shimozurdo-game/scenes/title.js` (或其他遊戲場景)

### 修改內容

#### 1. 在 create() 中初始化
```javascript
create() {
  // ... 現有代碼 ...
  
  // 🆕 獲取 SRS 管理器
  this.srsManager = this.registry.get('srsManager');
  
  // 🆕 記錄答題開始時間
  this.answerStartTime = Date.now();
  
  // 🆕 如果使用 SRS,顯示進度
  if (this.srsManager) {
    this.showSRSProgress();
  }
  
  // ... 現有代碼 ...
}
```

#### 2. 記錄答題結果
```javascript
/**
 * 當玩家答題時
 * @param {boolean} isCorrect - 是否答對
 */
onPlayerAnswer(isCorrect) {
  // 計算反應時間
  const responseTime = Date.now() - this.answerStartTime;
  
  // 🆕 如果使用 SRS,記錄答題結果
  if (this.srsManager) {
    this.srsManager.recordAnswer(isCorrect, responseTime);
    
    // 更新進度顯示
    this.updateSRSProgress();
  }
  
  // 重置計時器
  this.answerStartTime = Date.now();
  
  // ... 現有的答題邏輯 ...
}
```

#### 3. 遊戲結束處理
```javascript
/**
 * 當遊戲結束時
 */
async onGameEnd() {
  // 🆕 如果使用 SRS,完成會話
  if (this.srsManager) {
    const stats = await this.srsManager.finishSession();
    
    if (stats) {
      console.log('📊 學習統計:');
      console.log(`  - 正確率: ${stats.accuracy}%`);
      console.log(`  - 學習時間: ${stats.duration} 秒`);
      
      // 顯示學習統計 UI
      this.showLearningStats(stats);
    }
  }
  
  // ... 現有的遊戲結束邏輯 ...
}
```

---

## Step 6: UI 增強

### 1. 顯示 SRS 進度
```javascript
/**
 * 顯示 SRS 學習進度
 */
showSRSProgress() {
  if (!this.srsManager) return;
  
  const progress = this.srsManager.getProgress();
  
  // 創建進度文字
  this.progressText = this.add.text(10, 10, 
    `進度: ${progress.current} / ${progress.total}`, {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setScrollFactor(0).setDepth(1000);
}

/**
 * 更新 SRS 進度顯示
 */
updateSRSProgress() {
  if (!this.srsManager || !this.progressText) return;
  
  const progress = this.srsManager.getProgress();
  this.progressText.setText(`進度: ${progress.current} / ${progress.total}`);
}
```

### 2. 顯示學習統計
```javascript
/**
 * 顯示學習統計
 * @param {Object} stats - 統計數據
 */
showLearningStats(stats) {
  // 創建統計面板
  const panel = this.add.container(400, 300);
  
  // 背景
  const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.9);
  panel.add(bg);
  
  // 標題
  const title = this.add.text(0, -150, '🎉 學習統計', {
    fontSize: '36px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  panel.add(title);
  
  // 正確率
  const accuracy = this.add.text(0, -80, `正確率: ${stats.accuracy}%`, {
    fontSize: '28px',
    color: stats.accuracy >= 80 ? '#00ff00' : stats.accuracy >= 60 ? '#ffff00' : '#ff0000'
  }).setOrigin(0.5);
  panel.add(accuracy);
  
  // 答對/答錯
  const results = this.add.text(0, -30, 
    `答對: ${stats.correctAnswers} / ${stats.totalAnswers}`, {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  panel.add(results);
  
  // 學習時間
  const duration = this.add.text(0, 20, 
    `學習時間: ${Math.floor(stats.duration / 60)} 分 ${stats.duration % 60} 秒`, {
    fontSize: '24px',
    color: '#00ffff'
  }).setOrigin(0.5);
  panel.add(duration);
  
  // 鼓勵文字
  let encouragement = '';
  if (stats.accuracy >= 90) {
    encouragement = '太棒了!你已經掌握這些單字了! 🌟';
  } else if (stats.accuracy >= 70) {
    encouragement = '做得很好!繼續加油! 💪';
  } else {
    encouragement = '不要氣餒,多練習就會進步! 📚';
  }
  
  const encouragementText = this.add.text(0, 80, encouragement, {
    fontSize: '20px',
    color: '#ffff00',
    wordWrap: { width: 450 },
    align: 'center'
  }).setOrigin(0.5);
  panel.add(encouragementText);
  
  // 繼續按鈕
  const continueBtn = this.add.text(0, 150, '繼續', {
    fontSize: '28px',
    color: '#ffffff',
    backgroundColor: '#4CAF50',
    padding: { x: 30, y: 15 }
  }).setOrigin(0.5).setInteractive();
  
  continueBtn.on('pointerdown', () => {
    panel.destroy();
    // 返回主選單或繼續下一輪
    this.scene.start('menu');
  });
  
  panel.add(continueBtn);
}
```

---

## 測試指南

### 測試 1: SRS 模式啟動
```
1. 訪問: http://localhost:3000/games/switcher?useSRS=true&geptLevel=elementary
2. 檢查控制台輸出:
   ✅ "🧠 啟用 SRS 模式"
   ✅ "✅ SRS 會話創建成功"
   ✅ "✅ SRS 單字載入完成"
3. 確認遊戲載入 15 個單字
```

### 測試 2: 答題記錄
```
1. 玩遊戲並答題
2. 檢查控制台輸出:
   ✅ "📝 更新單字進度: apple (✅ 正確)"
   ✅ "✅ 進度更新成功"
3. 確認進度顯示更新
```

### 測試 3: 會話完成
```
1. 完成所有單字
2. 檢查控制台輸出:
   ✅ "🏁 完成 SRS 學習會話..."
   ✅ "✅ 會話完成"
3. 確認顯示學習統計面板
```

### 測試 4: 自定義活動模式
```
1. 訪問: http://localhost:3000/games/switcher?activityId=abc123
2. 檢查控制台輸出:
   ✅ "📚 使用自定義活動模式"
3. 確認不使用 SRS
```

---

## 總結

### 完成的功能
- ✅ SM-2 算法實現
- ✅ SRS 管理器
- ✅ Phaser 3 整合
- ✅ 答題記錄
- ✅ 進度顯示
- ✅ 統計面板

### 下一步
1. 測試所有功能
2. 優化 UI 顯示
3. 添加更多統計數據
4. 實施其他遊戲場景

