# 🛩️ Canyon Runner → 飛機詞彙遊戲 完整改造計劃

## 📋 項目概述

### 🎯 項目目標
將 Canyon Runner 跑酷遊戲改造成基於記憶科學的 GEPT 分級飛機詞彙學習遊戲，整合 EduCreate 完整基礎設施。

### 🏆 核心價值主張
- **保持遊戲樂趣**：維持原版流暢的遊戲體驗
- **教育價值最大化**：整合記憶科學和 GEPT 詞彙系統
- **技術領先性**：展示 EduCreate 平台的強大整合能力

## 📊 Phase 1 成果總結

### ✅ 已完成的重大成就
```
✅ Phase 1.1: Canyon Runner 代碼庫完整下載和驗證
✅ Phase 1.2: Phaser.js 架構深度分析和可行性確認
✅ Phase 1.3: EduCreate Week 1 & Week 2 基礎設施完美整合
✅ Phase 1.4: 所有核心功能和整合功能 100% 驗證成功
✅ Phase 1.5: 技術文檔和改造計劃制定
```

### 🔧 技術基礎已建立
```javascript
// 已驗證的技術棧
✅ Phaser.js v2.1.3 - 穩定可靠的遊戲引擎
✅ JavaScript ES5 - 廣泛兼容的開發語言
✅ EduCreate 基礎設施 - 完整的檔案管理和自動保存系統
✅ 響應式設計 - 桌面和移動設備完美支援
✅ 模組化架構 - 易於擴展和維護

// 已整合的 EduCreate 功能
✅ 檔案管理系統 (FileManager)
✅ 自動保存系統 (AutoSaveManager) 
✅ 內容管理系統 (ContentManager)
✅ 同步管理系統 (SyncManager)
✅ 縮圖管理系統 (ThumbnailManager)
✅ 檔案瀏覽系統 (FileBrowser)
✅ 分享管理系統 (ShareManager)
```

## 🚀 Phase 2: 遊戲核心改造計劃

### 🎨 視覺資源改造 (Day 1-2)

#### **1. 飛機精靈圖設計**
```javascript
// 飛機狀態設計
const airplaneStates = {
  normal: 'airplane-normal.png',      // 正常飛行
  up: 'airplane-up.png',              // 向上飛行（傾斜）
  down: 'airplane-down.png',          // 向下飛行（傾斜）
  boost: 'airplane-boost.png',        // 加速狀態
  damaged: 'airplane-damaged.png'     // 受損狀態
};

// 飛機動畫序列
const airplaneAnimations = {
  fly: ['airplane-1', 'airplane-2', 'airplane-3'], // 飛行動畫
  engine: ['engine-1', 'engine-2', 'engine-3']     // 引擎火焰動畫
};
```

#### **2. 天空背景系統**
```javascript
// 背景層次設計
const skyLayers = {
  background: 'sky-gradient.png',     // 天空漸層
  clouds: 'clouds-layer.png',         // 雲朵層
  mountains: 'mountains-far.png',     // 遠山層
  sun: 'sun-element.png'              // 太陽元素
};

// 視差滾動效果
const parallaxSpeeds = {
  background: 0.1,    // 背景最慢
  clouds: 0.3,        // 雲朵中等
  mountains: 0.5,     // 山脈較快
  obstacles: 1.0      // 障礙物最快
};
```

#### **3. 詞彙雲朵設計**
```javascript
// 雲朵類型設計
const vocabularyClouds = {
  easy: {
    sprite: 'cloud-white.png',
    textColor: '#333333',
    difficulty: 1
  },
  medium: {
    sprite: 'cloud-gray.png', 
    textColor: '#ffffff',
    difficulty: 2
  },
  hard: {
    sprite: 'cloud-dark.png',
    textColor: '#ffff00',
    difficulty: 3
  }
};
```

### 🎮 遊戲邏輯改造 (Day 3-4)

#### **1. 飛機控制系統**
```javascript
// 保持原版控制邏輯，調整物理參數
CanyonRunner.Level1.prototype.updateAirplane = function() {
  // 原版控制邏輯保持
  if (this.cursors.up.isDown) {
    this.airplane.body.velocity.y = -this.airplaneSpeed;
    this.airplane.angle = -5;  // 向上傾斜
  }
  if (this.cursors.down.isDown) {
    this.airplane.body.velocity.y = this.airplaneSpeed;
    this.airplane.angle = 5;   // 向下傾斜
  }
  
  // 新增：自動回正
  if (!this.cursors.up.isDown && !this.cursors.down.isDown) {
    this.airplane.angle = 0;   // 水平飛行
  }
};
```

#### **2. 碰撞處理改造**
```javascript
// 從遊戲結束改為詞彙問題
CanyonRunner.Level1.prototype.handleVocabularyCollision = function(airplane, cloud) {
  // 暫停遊戲
  this.game.paused = true;
  
  // 獲取雲朵上的詞彙
  const vocabulary = cloud.getData('vocabulary');
  
  // 顯示詞彙問題面板
  this.showVocabularyQuestion(vocabulary);
  
  // 移除已碰撞的雲朵
  cloud.destroy();
};

CanyonRunner.Level1.prototype.showVocabularyQuestion = function(vocabulary) {
  // 創建問題面板
  this.vocabularyPanel = new VocabularyQuestionPanel({
    vocabulary: vocabulary,
    onAnswer: this.handleVocabularyAnswer.bind(this),
    gameState: this
  });
};
```

## 📚 Phase 3: 詞彙系統整合計劃

### 🗃️ GEPT 詞彙數據庫 (Day 1)

#### **1. 詞彙數據結構**
```javascript
// GEPT 分級詞彙結構
const GEPTVocabulary = {
  level1: [
    {
      id: 'gept1_001',
      english: 'airplane',
      chinese: '飛機',
      phonetic: '/ˈɛrˌpleɪn/',
      difficulty: 1,
      category: 'transportation',
      frequency: 'high',
      examples: [
        'The airplane flies in the sky.',
        '飛機在天空中飛行。'
      ]
    },
    // ... 更多 Level 1 詞彙
  ],
  level2: [
    // Level 2 詞彙
  ],
  level3: [
    // Level 3 詞彙
  ]
};
```

#### **2. 詞彙管理系統**
```javascript
class VocabularyManager {
  constructor() {
    this.vocabulary = GEPTVocabulary;
    this.currentLevel = 1;
    this.usedWords = new Set();
    this.correctAnswers = new Map();
    this.wrongAnswers = new Map();
  }
  
  getRandomWord(level = this.currentLevel) {
    const levelWords = this.vocabulary[`level${level}`];
    const availableWords = levelWords.filter(word => 
      !this.usedWords.has(word.id)
    );
    
    if (availableWords.length === 0) {
      this.usedWords.clear(); // 重置已使用詞彙
      return this.getRandomWord(level);
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];
    this.usedWords.add(selectedWord.id);
    
    return selectedWord;
  }
  
  generateQuestion(word) {
    const questionTypes = ['translation', 'multiple_choice', 'fill_blank'];
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    return this.createQuestion(word, randomType);
  }
}
```

### 🧠 記憶科學算法 (Day 2)

#### **1. 間隔重複算法**
```javascript
class MemoryScienceEngine {
  constructor() {
    this.forgettingCurve = {
      // 基於 Ebbinghaus 遺忘曲線
      intervals: [1, 3, 7, 14, 30, 90, 180], // 天數
      retention: [0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1] // 保留率
    };
  }
  
  calculateNextReview(word, isCorrect, responseTime) {
    const currentInterval = word.interval || 1;
    const difficulty = word.difficulty || 2.5;
    
    if (isCorrect) {
      // 正確答案：增加間隔
      word.interval = Math.min(currentInterval * difficulty, 180);
      word.easeFactor = Math.min(word.easeFactor + 0.1, 3.0);
    } else {
      // 錯誤答案：重置間隔
      word.interval = 1;
      word.easeFactor = Math.max(word.easeFactor - 0.2, 1.3);
    }
    
    // 考慮反應時間
    if (responseTime > 10000) { // 超過10秒
      word.interval *= 0.8; // 減少間隔
    }
    
    word.nextReview = Date.now() + (word.interval * 24 * 60 * 60 * 1000);
    return word;
  }
  
  getWordsForReview() {
    return this.vocabulary.filter(word => 
      word.nextReview <= Date.now()
    );
  }
}
```

#### **2. 學習進度追蹤**
```javascript
class LearningProgressTracker {
  constructor() {
    this.learningData = {
      totalWords: 0,
      masteredWords: 0,
      reviewWords: 0,
      newWords: 0,
      accuracy: 0,
      averageResponseTime: 0,
      studyStreak: 0,
      lastStudyDate: null
    };
  }
  
  updateProgress(word, isCorrect, responseTime) {
    // 更新準確率
    this.updateAccuracy(isCorrect);
    
    // 更新反應時間
    this.updateResponseTime(responseTime);
    
    // 更新詞彙狀態
    this.updateWordStatus(word, isCorrect);
    
    // 更新學習連續天數
    this.updateStudyStreak();
    
    // 保存進度
    this.saveProgress();
  }
  
  generatePersonalizedRecommendations() {
    const recommendations = [];
    
    if (this.learningData.accuracy < 0.7) {
      recommendations.push({
        type: 'difficulty',
        message: '建議降低難度，專注於基礎詞彙',
        action: 'reduce_difficulty'
      });
    }
    
    if (this.learningData.averageResponseTime > 8000) {
      recommendations.push({
        type: 'speed',
        message: '建議多練習以提高反應速度',
        action: 'speed_training'
      });
    }
    
    return recommendations;
  }
}
```

## 🔧 Phase 4: EduCreate 整合優化

### 📁 基礎設施擴展
```javascript
// 擴展現有的 EduCreate 整合
class AirplaneVocabularyIntegration extends CanyonRunner.EduCreateIntegration {
  constructor(gameState) {
    super(gameState);
    
    // 新增詞彙學習專用功能
    this.vocabularyManager = new VocabularyManager();
    this.memoryScienceEngine = new MemoryScienceEngine();
    this.progressTracker = new LearningProgressTracker();
  }
  
  saveVocabularyProgress() {
    const progressData = {
      id: `vocabulary-progress-${Date.now()}`,
      type: 'vocabulary-learning',
      progress: this.progressTracker.learningData,
      vocabulary: this.vocabularyManager.getProgress(),
      timestamp: new Date()
    };
    
    this.fileManager.saveGameSession(progressData);
  }
  
  generateLearningReport() {
    const report = {
      totalWordsLearned: this.progressTracker.learningData.masteredWords,
      accuracy: this.progressTracker.learningData.accuracy,
      studyTime: this.calculateStudyTime(),
      recommendations: this.progressTracker.generatePersonalizedRecommendations()
    };
    
    return report;
  }
}
```

## 🧪 Phase 5: 測試和優化計劃

### 📊 測試策略

#### **1. 功能測試**
```javascript
// 自動化測試套件
describe('Airplane Vocabulary Game', () => {
  describe('Core Game Functions', () => {
    it('should maintain original flight controls', () => {
      // 測試飛機控制
    });
    
    it('should handle vocabulary collisions correctly', () => {
      // 測試詞彙碰撞
    });
  });
  
  describe('Vocabulary System', () => {
    it('should generate appropriate questions', () => {
      // 測試問題生成
    });
    
    it('should track learning progress', () => {
      // 測試進度追蹤
    });
  });
  
  describe('Memory Science', () => {
    it('should calculate review intervals correctly', () => {
      // 測試間隔重複算法
    });
  });
});
```

#### **2. 性能基準**
```javascript
// 性能目標
const performanceTargets = {
  gameLoadTime: 3000,        // 3秒內載入
  frameRate: 60,             // 60 FPS
  memoryUsage: 100,          // < 100MB
  vocabularyResponseTime: 500, // 詞彙系統響應 < 500ms
  autoSaveDelay: 100         // 自動保存延遲 < 100ms
};
```

### 🎯 成功標準

#### **技術指標**
- ✅ 遊戲流暢度：60 FPS
- ✅ 載入時間：< 3 秒
- ✅ 記憶體使用：< 100MB
- ✅ 詞彙系統準確率：> 99%
- ✅ EduCreate 整合穩定性：> 99.9%

#### **教育指標**
- ✅ 詞彙記憶效果：> 80% 長期保留率
- ✅ 學習參與度：> 90% 完成率
- ✅ 難度適應性：自動調整準確率 70-85%
- ✅ 個人化推薦：> 85% 用戶滿意度

#### **用戶體驗指標**
- ✅ 遊戲樂趣：> 4.5/5 評分
- ✅ 學習效果：> 4.0/5 評分
- ✅ 易用性：> 90% 用戶能順利使用
- ✅ 無障礙性：WCAG 2.1 AA 合規

## 📅 實施時程

### **Phase 2: 遊戲核心改造 (3-4天)**
- Day 1: 飛機精靈圖和天空背景設計
- Day 2: 視覺資源整合和測試
- Day 3: 飛機控制邏輯調整
- Day 4: 碰撞系統改造和測試

### **Phase 3: 詞彙系統整合 (3-4天)**
- Day 1: GEPT 詞彙數據庫建立
- Day 2: 記憶科學算法實現
- Day 3: 詞彙問題生成系統
- Day 4: 學習進度追蹤系統

### **Phase 4: EduCreate 整合優化 (1-2天)**
- Day 1: 詞彙學習功能整合
- Day 2: 測試和優化

### **Phase 5: 測試和優化 (2-3天)**
- Day 1: 功能測試和修復
- Day 2: 性能優化
- Day 3: 用戶體驗調整

## 🎉 預期成果

### **最終交付物**
1. ✅ 完整的飛機詞彙學習遊戲
2. ✅ GEPT 三級詞彙系統（1000+ 詞彙）
3. ✅ 記憶科學算法實現
4. ✅ EduCreate 基礎設施完整整合
5. ✅ 完整的技術文檔和用戶指南
6. ✅ 自動化測試套件
7. ✅ 性能基準報告

### **創新價值**
- 🌟 首個基於記憶科學的飛行詞彙遊戲
- 🌟 完整的 EduCreate 平台整合示範
- 🌟 開源遊戲教育化改造的最佳實踐
- 🌟 跨平台兼容的現代教育遊戲

## 🔧 技術實施指南

### **開發環境設置**
```bash
# 基於現有的 Canyon Runner 環境
cd EduCreate-CanyonRunner-Integration/CanyonRunner

# 創建改造分支
git checkout -b airplane-vocabulary-game

# 安裝額外依賴（如需要）
npm install --save-dev jest puppeteer
```

### **代碼組織結構**
```
CanyonRunner/
├── src/
│   ├── core/                    # 核心遊戲邏輯
│   │   ├── Level1.js           # 主要遊戲關卡（已整合 EduCreate）
│   │   └── ...
│   ├── vocabulary/              # 詞彙系統（新增）
│   │   ├── VocabularyManager.js
│   │   ├── MemoryScienceEngine.js
│   │   ├── LearningProgressTracker.js
│   │   └── GEPTVocabulary.js
│   ├── ui/                      # UI 組件（新增）
│   │   ├── VocabularyQuestionPanel.js
│   │   └── ProgressDisplay.js
│   └── EduCreate/               # EduCreate 整合（已完成）
│       ├── EduCreateIntegration.js
│       └── EduCreateManagers.js
├── assets/                      # 遊戲資源
│   ├── sprites/
│   │   ├── airplane/            # 飛機精靈圖（新增）
│   │   ├── clouds/              # 詞彙雲朵（新增）
│   │   └── sky/                 # 天空背景（新增）
│   └── audio/                   # 音效文件
└── tests/                       # 測試文件
    ├── unit/
    ├── integration/
    └── e2e/
```

### **關鍵技術決策**

#### **1. 保持向後兼容**
```javascript
// 使用適配器模式保持原版功能
class GameModeAdapter {
  constructor(mode = 'vocabulary') {
    this.mode = mode;
  }

  handleCollision(player, obstacle) {
    if (this.mode === 'original') {
      return this.handleOriginalCollision(player, obstacle);
    } else {
      return this.handleVocabularyCollision(player, obstacle);
    }
  }
}
```

#### **2. 模組化設計**
```javascript
// 每個功能模組獨立，便於測試和維護
const GameModules = {
  vocabulary: new VocabularyManager(),
  memoryScience: new MemoryScienceEngine(),
  progress: new LearningProgressTracker(),
  eduCreate: new EduCreateIntegration()
};
```

### **風險管理策略**

#### **技術風險**
- **風險**：Phaser.js 版本兼容性問題
- **緩解**：保持使用 v2.1.3，避免升級風險

#### **性能風險**
- **風險**：詞彙系統影響遊戲性能
- **緩解**：異步載入、懶加載、對象池

#### **用戶體驗風險**
- **風險**：學習功能影響遊戲樂趣
- **緩解**：可選模式、漸進式引導

**準備開始 Phase 2: 遊戲核心改造！** 🚀✈️📚
