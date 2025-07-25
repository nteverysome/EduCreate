# 🎮 EduCreate 智能教育遊戲系列

> **記憶科學驅動的 25 種英語學習遊戲集合**

## 🎯 遊戲總覽

| # | 遊戲名稱 | 狀態 | 技術棧 | 學習類型 | 快速啟動 |
|---|---------|------|--------|----------|----------|
| 1 | 🛩️ [飛機碰撞遊戲](./airplane-game/) | ✅ 完成 | Vite+Phaser3 | 視覺識別 | `cd games/airplane-game && npm run dev` |
| 2 | 🎯 配對記憶遊戲 | 🚧 開發中 | React+Canvas | 空間記憶 | `cd games/matching-game && npm start` |
| 3 | 📝 填空遊戲 | 📋 計劃中 | Vue+WebGL | 語法記憶 | `cd games/fill-blank-game && npm run dev` |
| 4 | 🎪 轉盤遊戲 | 📋 計劃中 | Angular+Three.js | 壓力記憶 | `cd games/spin-wheel-game && npm start` |
| 5 | 🧩 拼圖遊戲 | 📋 計劃中 | Svelte+Pixi.js | 邏輯記憶 | `cd games/puzzle-game && npm run dev` |

## 🚀 統一啟動系統

### 📱 快速啟動任意遊戲
```bash
# 方法1: 直接啟動 (從項目根目錄執行)
cd games/[遊戲名稱]
npm run dev

# 方法2: 完整路徑啟動 (從任意位置執行)
cd C:\Users\Administrator\Desktop\EduCreate\games\[遊戲名稱]
npm run dev

# 方法3: 使用統一腳本 (未來實現)
npm run game:start [遊戲名稱]
npm run game:build [遊戲名稱]
npm run game:deploy [遊戲名稱]
```

### 🌐 統一訪問路徑
```
開發環境: http://localhost:300[X]/games/[遊戲名稱]/
生產環境: https://educreate.com/games/[遊戲名稱]/
```

## 📊 遊戲分類系統

### 🧠 記憶科學分類
```
📚 基礎記憶類 (4種)
├── 🛩️ 飛機碰撞 - 視覺識別記憶
├── 📝 填空遊戲 - 語法結構記憶  
├── 🎯 選擇題 - 概念判斷記憶
└── ✅ 是非題 - 快速反應記憶

🎪 壓力情緒類 (4種)  
├── 🎮 遊戲秀 - 競爭壓力記憶
├── 📦 開箱子 - 驚喜發現記憶
├── 🏆 勝負題 - 成就動機記憶
└── 🎡 轉盤 - 隨機獎勵記憶

🎨 空間視覺類 (5種)
├── 🔄 配對卡 - 空間位置記憶
├── 🔍 找配對 - 視覺搜索記憶
├── 🃏 翻牌 - 序列記憶
├── 🏃 迷宮 - 路徑記憶
└── 🖼️ 圖片題 - 視覺聯想記憶

🧩 重構邏輯類 (4種)
├── 🔤 字母重組 - 拼寫邏輯記憶
├── 📝 句子重組 - 語法邏輯記憶  
├── 📂 分類排序 - 概念分類記憶
└── 🔍 填字遊戲 - 詞彙推理記憶

⚡ 動態反應類 (3種)
├── 🍎 飛行水果 - 動態追蹤記憶
├── 🎈 氣球爆破 - 反應速度記憶
└── ✈️ 飛機遊戲 - 動作協調記憶

🔗 關聯配對類 (3種)
├── 🔗 連線配對 - 關聯建構記憶
├── 👫 配對判斷 - 相似性記憶
└── 🎯 猜詞遊戲 - 提示推理記憶

🔍 搜索發現類 (1種)
└── 🔤 單詞搜索 - 模式識別記憶

🔊 語音聽覺類 (1種)
└── 🗣️ 語音卡片 - 聽覺記憶
```

## 🔧 統一開發規範

### 📁 標準目錄結構
```
games/[遊戲名稱]/
├── README.md                    # 🎮 遊戲專用說明
├── GAME_PATH_DOCUMENTATION.md  # 📚 完整技術文檔
├── package.json                # 📦 依賴配置
├── vite.config.ts              # ⚙️ 構建配置
├── src/
│   ├── main.ts                 # 🚀 遊戲入口
│   ├── scenes/                 # 🎬 遊戲場景
│   ├── managers/               # 🔧 管理器系統
│   ├── data/                   # 📊 遊戲數據
│   └── types/                  # 📝 類型定義
├── public/                     # 🌐 靜態資源
└── dist/                       # 📦 構建輸出
```

### 🎯 統一技術要求
```
✅ 必須支援: GEPT 三級詞彙分級
✅ 必須支援: 中英文雙語 + TTS
✅ 必須支援: 統一詞彙管理系統
✅ 必須支援: 記憶科學學習流程
✅ 必須支援: 60fps 穩定性能
✅ 必須支援: 響應式設計
✅ 必須支援: 無障礙功能
```

### 📋 統一命名規範
```
🎮 遊戲目錄: kebab-case (airplane-game)
📄 文件名稱: PascalCase.ts (GameScene.ts)
🔧 函數名稱: camelCase (setRandomTargetWord)
🎨 CSS類名: kebab-case (game-container)
📊 常數名稱: UPPER_CASE (GEPT_LEVELS)
```

## 🔄 統一修改流程

### 📝 新增遊戲步驟
```bash
# 1. 創建遊戲目錄 (從項目根目錄執行)
mkdir games/new-game-name
cd games/new-game-name

# 2. 複製模板 (以飛機遊戲為模板)
cp -r ../airplane-game/* .

# 3. 修改配置
# - package.json (名稱、描述、端口號)
# - README.md (遊戲說明)
# - vite.config.ts (端口號: 3002, 3003...)

# 4. 更新遊戲總覽表格
# - 編輯 games/README.md
# - 添加新遊戲行: `cd games/new-game-name && npm run dev`

# 5. 開發和測試
npm install
npm run dev
```

### 🎨 修改現有遊戲
```bash
# 1. 進入遊戲目錄 (完整路徑)
cd C:\Users\Administrator\Desktop\EduCreate\games\[遊戲名稱]

# 2. 查看 README.md 了解結構
cat README.md

# 3. 查看完整文檔了解細節
cat GAME_PATH_DOCUMENTATION.md

# 4. 根據修改類型選擇位置
# - 詞彙內容: src/data/bilingual-vocabulary.json
# - 視覺樣式: 各UI創建位置
# - 遊戲邏輯: src/scenes/ 和 src/managers/
```

## 📊 統一監控系統

### 🎯 性能指標
| 指標 | 目標值 | 監控方式 |
|------|--------|----------|
| ⚡ **FPS** | 60fps | 遊戲內監控 |
| 🚀 **載入時間** | <2s | Lighthouse |
| 💾 **包大小** | <10MB | Bundle Analyzer |
| 🎯 **學習準確率** | >95% | 用戶數據分析 |

### 📈 學習效果追蹤
```
✅ 詞彙記憶保持率
✅ 學習時間分析
✅ 錯誤模式識別
✅ 個人化推薦準確度
✅ 跨遊戲學習數據同步
```

## 🔗 相關資源

### 📚 技術文檔
- 🎮 [EduCreate 主項目](../README.md)
- 🧠 [記憶科學原理](../docs/memory-science.md)
- 🌐 [GEPT 分級系統](../docs/gept-system.md)
- 🎨 [UI/UX 設計規範](../docs/design-guidelines.md)

### 🛠️ 開發工具
- 📊 [測試影片管理](../EduCreate-Test-Videos/)
- 🔧 [MCP 工具整合](../docs/mcp-integration.md)
- 📈 [性能監控](../docs/performance-monitoring.md)

---

**📅 最後更新**: 2025-01-24  
**👥 維護團隊**: EduCreate Team  
**📧 技術支援**: tech@educreate.com

---

*25 種記憶科學驅動的智能教育遊戲，為英語學習者提供最佳的學習體驗！* 🎓✨
