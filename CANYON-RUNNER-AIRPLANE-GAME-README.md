# 🎮 Canyon Runner 飛機詞彙遊戲開發計劃

基於開源遊戲 [Canyon Runner](https://github.com/zackproser/CanyonRunner) 改造成 EduCreate 飛機詞彙學習遊戲

## 🎯 項目概述

### 核心理念
將成熟的 Canyon Runner 跑酷遊戲改造成教育性的飛機詞彙學習遊戲，整合 EduCreate 平台的記憶科學算法和 GEPT 詞彙分級系統。

### 改造策略
- **保持遊戲核心架構**：利用 Canyon Runner 穩定的 Phaser.js 架構
- **修改遊戲場景**：從沙漠跑酷改為天空飛行
- **整合教育功能**：添加詞彙學習、記憶科學算法
- **融入 EduCreate**：整合檔案管理、自動保存等基礎設施

## 🚀 開發階段

### Phase 1: Canyon Runner 基礎分析和設置 (2-3天)
- [x] 下載 Canyon Runner 原始代碼
- [ ] 分析遊戲架構和檔案結構
- [ ] 本地環境設置和遊戲運行
- [ ] 核心功能測試和理解
- [ ] 技術文檔和改造計劃

### Phase 2: 遊戲核心改造 (3-4天)
- [ ] 場景改造：沙漠 → 天空
- [ ] 角色改造：跑者 → 飛機
- [ ] 控制改造：左右跑動 → 上下飛行
- [ ] 障礙物改造：岩石 → 雲朵
- [ ] 視覺資源替換

### Phase 3: 詞彙系統整合 (3-4天)
- [ ] GEPT 詞彙數據庫整合
- [ ] 詞彙問題顯示系統
- [ ] 記憶科學算法實現
- [ ] 學習進度追蹤
- [ ] 智能難度調整

### Phase 4: EduCreate 基礎設施整合 (2-3天)
- [ ] 檔案管理系統整合
- [ ] 自動保存功能
- [ ] 縮圖生成系統
- [ ] 分享和協作功能
- [ ] 無障礙設計實現

### Phase 5: 測試和優化 (2-3天)
- [ ] 完整功能測試
- [ ] 性能優化
- [ ] Playwright 自動化測試
- [ ] 三層整合驗證
- [ ] 最終部署準備

## 🎮 原始 Canyon Runner 分析

### 技術棧
- **遊戲引擎**：Phaser.js 2.x
- **語言**：JavaScript (ES5)
- **建置工具**：Node.js + npm
- **授權**：GPL-3.0 (開源)

### 核心功能
- ✅ 玩家控制系統 (鍵盤 + 觸控)
- ✅ 碰撞檢測系統
- ✅ 分數和時間系統
- ✅ 音效和背景音樂
- ✅ 粒子效果系統
- ✅ 本地存儲 (分數、進度)
- ✅ 響應式設計 (桌面/移動)

### 檔案結構
```
CanyonRunner/
├── src/
│   ├── states/          # 遊戲狀態管理
│   │   ├── MainMenu.js
│   │   ├── Level1.js
│   │   ├── Level2.js
│   │   └── Level3.js
│   └── prefabs/         # 遊戲物件
│       ├── Player.js
│       ├── Ground.js
│       └── Rock.js
├── assets/              # 遊戲資源
│   ├── images/
│   ├── audio/
│   └── fonts/
├── css/                 # 樣式文件
├── index.html          # 主頁面
└── package.json        # 依賴管理
```

## 🎯 改造目標

### 遊戲玩法改造
```javascript
// 原來：沙漠跑酷
- 玩家在地面跑步
- 跳躍避開岩石障礙
- 收集金幣增加分數

// 改成：天空飛行詞彙學習
- 飛機在天空飛行
- 上下移動避開雲朵
- 碰撞雲朵觸發詞彙問題
- 正確答案獲得分數
```

### 教育功能整合
```javascript
// 詞彙學習系統
class VocabularyManager {
  loadGEPTWords(level)     // 載入 GEPT 分級詞彙
  getRandomWord()          // 隨機選擇詞彙
  checkAnswer(answer)      // 檢查答案正確性
  trackProgress(word)      // 追蹤學習進度
}

// 記憶科學算法
class MemoryScience {
  calculateNextReview()    // 間隔重複算法
  adjustDifficulty()       // 動態難度調整
  analyzeWeakWords()       // 分析薄弱詞彙
}
```

## 🔧 技術實現

### 核心改造點
1. **Player.js** → **Airplane.js**
   - 修改移動邏輯：水平跑動 → 垂直飛行
   - 更新動畫和精靈圖
   - 調整物理屬性

2. **Ground.js** → **CloudManager.js**
   - 雲朵生成和移動
   - 詞彙數據綁定
   - 碰撞觸發詞彙問題

3. **新增 VocabularySystem.js**
   - GEPT 詞彙管理
   - 問題生成和驗證
   - 學習數據追蹤

### EduCreate 整合
```javascript
// 遊戲狀態與 EduCreate 整合
class GameEduCreateIntegration {
  constructor(gameState) {
    this.fileManager = new EduCreateFileManager();
    this.autoSave = new AutoSaveManager();
    this.analytics = new LearningAnalytics();
  }
  
  saveGameProgress(data) {
    // 自動保存遊戲進度到 EduCreate 系統
  }
  
  loadVocabularySet(setId) {
    // 從 EduCreate 載入詞彙集
  }
}
```

## 📊 預期成果

### 功能目標
- ✅ 流暢的飛機飛行體驗
- ✅ 有趣的詞彙學習互動
- ✅ 智能的學習進度追蹤
- ✅ 完整的 GEPT 詞彙支援
- ✅ 無障礙設計合規

### 性能目標
- 遊戲載入時間：< 3秒
- 飛機響應延遲：< 50ms
- 詞彙問題顯示：< 200ms
- 自動保存延遲：< 100ms
- 支援設備：桌面 + 移動

### 教育目標
- GEPT 三級詞彙完整覆蓋
- 記憶科學算法驗證有效性
- 學習進度可視化追蹤
- 個人化學習路徑推薦

## 🛠️ 開發工具和環境

### 必要工具
- **Node.js** (v16+)
- **Git** (版本控制)
- **VSCode** (推薦編輯器)
- **Chrome DevTools** (調試)

### MCP 工具支援
- **Sequential Thinking**：結構化問題分析
- **Logic Programming**：遊戲邏輯驗證
- **Playwright MCP**：自動化測試
- **Windows MCP**：系統自動化

## 📝 開發日誌

### 2025-01-19
- ✅ 項目計劃創建
- ✅ 任務列表建立
- ✅ README 文檔撰寫
- 🔄 準備開始 Phase 1 實施

## 🎯 下一步行動

1. **立即開始 Phase 1.1**：下載 Canyon Runner 代碼
2. **設置開發環境**：確保所有工具就緒
3. **深度分析代碼**：理解每個核心系統
4. **制定詳細改造方案**：確定具體實施步驟

---

**🚀 讓我們開始這個激動人心的教育遊戲開發之旅！**
