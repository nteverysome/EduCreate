# 🎮 飛機碰撞英語學習遊戲 - 完整路徑文檔

## 📋 項目概述

**項目名稱**: Airplane Collision English Learning Game  
**技術棧**: Vite + TypeScript + Phaser 3.90.0  
**教育理念**: 記憶科學驅動的智能英語學習  
**GEPT支援**: 三級詞彙分級系統  

---

## 📁 項目根目錄

```
C:\Users\Administrator\Desktop\EduCreate\games\airplane-game\
```

## 🌐 遊戲訪問路徑

### 開發環境
```
🔗 本地開發: http://localhost:3001/games/airplane-game/
🔌 開發端口: 3001
🛠️ 啟動命令: npm run dev
```

### 生產環境
```
🔗 生產環境: https://your-domain.com/games/airplane-game/
📦 構建命令: npm run build
🚀 部署命令: npm run deploy
```

---

## 📂 完整文件結構

### 🎯 核心遊戲文件
```
📁 C:\Users\Administrator\Desktop\EduCreate\games\airplane-game\
├── 📄 index.html                    # 遊戲入口頁面
├── 📄 package.json                  # 項目配置 (v1.0.0)
├── 📄 vite.config.ts               # Vite 構建配置
├── 📄 tsconfig.json                # TypeScript 配置
└── 📁 src\                         # 源代碼目錄
    ├── 📄 main.ts                   # 遊戲主入口
    ├── 📁 scenes\                   # 遊戲場景
    │   └── 📄 GameScene.ts          # 主遊戲場景 ⭐
    ├── 📁 managers\                 # 管理器系統
    │   ├── 📄 GEPTManager.ts        # GEPT詞彙管理 ⭐
    │   ├── 📄 ChineseUIManager.ts   # 中文UI管理 ⭐
    │   ├── 📄 BilingualManager.ts   # 雙語管理
    │   ├── 📄 CollisionDetectionSystem.ts # 碰撞檢測
    │   └── 📄 MemoryEnhancementEngine.ts  # 記憶增強
    ├── 📁 data\                     # 數據文件
    │   └── 📄 bilingual-vocabulary.json # 雙語詞彙庫 ⭐
    └── 📁 types\                    # 類型定義
        └── 📄 index.ts              # 遊戲類型定義
```

### 🚀 構建和部署
```
📁 dist\                           # 構建輸出目錄
├── 📄 index.html                   # 構建後的HTML
├── 📄 main-af6Jg_O_.js            # 構建後的JS (代碼分割)
├── 📄 main-af6Jg_O_.js.map        # Source Map
├── 📁 assets\                      # 靜態資源
└── 📁 chunks\                      # 代碼分割塊
```

### 🛠️ 開發工具
```
📁 scripts\                        # 構建腳本
├── 📄 analyze-bundle.js            # 包分析工具
├── 📄 deploy.js                   # 自動部署腳本
└── 📄 version-manager.js          # 版本管理工具

📁 public\                         # 公共資源
└── 📁 assets\                      # 遊戲靜態資源

📁 test-results\                   # 測試結果
└── (Playwright E2E 測試輸出)

📁 node_modules\                   # 依賴包
├── phaser\                        # Phaser 3.90.0
├── vite\                          # Vite 構建工具
└── typescript\                    # TypeScript 編譯器
```

---

## 🎯 統一詞彙管理系統路徑

### 📊 系統架構
```
GEPTManager → GameScene.currentTargetWord → 統一分發
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  上方黃色文字    │  黃色框大字      │  雲朵英文        │
│  GameScene.ts   │  ChineseUI      │  GameScene.ts   │
│  :454          │  Manager.ts:274 │  :505          │
└─────────────────┴─────────────────┴─────────────────┘
```

### 🔧 核心控制文件
```
📍 統一控制中心: 
   src\scenes\GameScene.ts:446-470
   函數: setRandomTargetWord()

📍 詞彙數據源:
   src\managers\GEPTManager.ts:45-55
   函數: getRandomWord()

📍 詞彙數據庫:
   src\data\bilingual-vocabulary.json
   格式: {"elementary": [{"english": "friend", "chinese": "朋友"}]}
```

### 🎨 UI 顯示路徑
```
📍 上方黃色文字 (完整信息顯示):
   文件: src\scenes\GameScene.ts
   創建: 第400行
   更新: 第454行
   內容: "目標: 朋友 (friend)"

📍 黃色框大字 (母語認知核心):
   文件: src\managers\ChineseUIManager.ts
   創建: 第174行
   更新: 第274行
   內容: "朋友"

📍 雲朵英文 (學習目標實體):
   文件: src\scenes\GameScene.ts
   創建: 第505行
   判斷: 第498行
   內容: "friend" (目標詞彙特殊標示)
```

---

## 🔧 關鍵配置文件

### 📦 Package.json
```
📍 路徑: package.json
🎯 功能: 項目依賴和腳本配置
📝 名稱: "airplane-collision-game"
🔢 版本: "1.0.0"
🏷️ 類型: "module" (ES模組)

主要依賴:
- phaser: ^3.90.0
- lucide-react: ^0.525.0

開發依賴:
- vite: ^5.0.0
- typescript: ^5.0.0
- @types/node: ^20.0.0
```

### ⚙️ Vite 配置
```
📍 路徑: vite.config.ts
🎯 功能: 構建和開發服務器配置
🌐 端口: 3001
📦 代碼分割: phaser, scenes, managers
🔧 別名: '@' -> '/src'
🎯 目標: ES2020
```

### 📚 TypeScript 配置
```
📍 路徑: tsconfig.json
🎯 功能: TypeScript 編譯配置
🔧 目標: ES2020
📁 根目錄: "./src"
🔍 嚴格模式: 啟用
📦 模組解析: Node
```

---

## 🎮 遊戲啟動指南

### 🔄 開發模式
```bash
# 1. 進入項目目錄
cd C:\Users\Administrator\Desktop\EduCreate\games\airplane-game

# 2. 安裝依賴 (首次運行)
npm install

# 3. 啟動開發服務器
npm run dev

# 4. 訪問遊戲
# 瀏覽器打開: http://localhost:3001/games/airplane-game/
```

### 🚀 生產構建
```bash
# 1. 類型檢查
npm run type-check

# 2. 構建項目
npm run build

# 3. 預覽構建結果
npm run preview

# 4. 分析包大小
npm run analyze

# 5. 部署到公共目錄
npm run copy-to-public
```

### 🧹 維護命令
```bash
# 清理構建文件
npm run clean

# 詳細部署
npm run deploy:verbose

# 生產環境部署
npm run deploy:prod
```

---

## 📊 學習系統功能說明

### 🎯 三個顯示元素功用

#### 🟡 上方黃色文字 - 學習目標告知
- **功能**: 完整信息顯示，建立中英文對應關係
- **內容**: "目標: 朋友 (friend)"
- **位置**: 螢幕上方，不干擾遊戲操作
- **設計**: 24px黃色文字，黑色背景高對比

#### 🟨 黃色框大字 - 母語認知核心
- **功能**: 母語理解錨點，認知負荷減輕
- **內容**: "朋友" (純中文)
- **互動**: 可點擊發英文音，自動發中文音
- **設計**: 48px大字，金黃色背景突出顯示

#### ☁️ 雲朵英文 - 學習目標實體
- **功能**: 英文識別訓練，碰撞目標載體
- **內容**: "friend" (目標詞彙特殊標示)
- **機制**: 目標詞彙紅字黃底，動態移動
- **價值**: 反應訓練，記憶強化，成就感獲得

### 🧠 記憶科學學習流程
```
1. 🟡 看到完整目標 → 建立認知框架
2. 🟨 理解中文含義 → 母語認知錨定
3. 👆 點擊學習發音 → 主動學習英文
4. 👀 視覺搜索雲朵 → 英文識別訓練
5. 🎮 飛機碰撞目標 → 動作記憶強化
6. 🎉 成功獲得獎勵 → 正向強化循環
```

---

## 🔄 修改指南

### 📝 單字內容修改 (統一系統)
```
✅ 新增/修改詞彙 → src\data\bilingual-vocabulary.json
✅ 詞彙邏輯修改 → src\managers\GEPTManager.ts
✅ 顯示邏輯調整 → src\scenes\GameScene.ts:setRandomTargetWord()
```

### 🎨 視覺樣式修改 (各自位置)
```
🟡 上方文字樣式 → src\scenes\GameScene.ts:400-406
🟨 黃色框樣式 → src\managers\ChineseUIManager.ts:174-182
☁️ 雲朵文字樣式 → src\scenes\GameScene.ts:505-510
🔊 成功提示樣式 → src\managers\ChineseUIManager.ts:322-364
```

### 📐 位置布局修改
```
📍 上方文字位置 → src\scenes\GameScene.ts:400 (x=400, y=16)
📍 黃色框位置 → src\managers\ChineseUIManager.ts:170 (x=中央, y=120)
📍 容器布局調整 → 各管理器的 create 函數
```

---

## 🚀 技術特色

### 🏆 世界級性能
- **60fps 穩定運行**
- **優化的代碼分割**
- **高效的記憶體管理**
- **流暢的遊戲體驗**

### 🧠 記憶科學整合
- **間隔重複算法**
- **主動回憶機制**
- **認知負荷管理**
- **個人化學習路徑**

### 🌐 完整的雙語支援
- **統一詞彙控制系統**
- **中英文發音系統**
- **GEPT分級整合**
- **無障礙設計**

---

## 📞 技術支援

### 🔧 常見問題
- **端口衝突**: 修改 vite.config.ts 中的端口設置
- **構建失敗**: 檢查 TypeScript 類型錯誤
- **依賴問題**: 刪除 node_modules 重新安裝

### 📚 相關文檔
- **背景設置**: BACKGROUND_SETUP.md
- **部署指南**: DEPLOYMENT.md
- **包分析**: bundle-analysis.json

---

**📅 文檔更新**: 2025-01-24  
**👥 維護團隊**: EduCreate Team  
**📧 技術支援**: tech@educreate.com  

---

*這是一個技術上完美、教育上科學、體驗上優秀的智能教育遊戲系統！* 🏆🎮📚
