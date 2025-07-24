# AirplaneCollisionGame 技術文檔

## 🎯 概述

AirplaneCollisionGame 是基於記憶科學原理的英語詞彙學習遊戲，採用 Phaser 3 遊戲引擎和 Vite + TypeScript 架構，通過飛機碰撞雲朵的方式實現主動回憶學習。

## 🏗️ 技術架構

### 核心技術棧
```
Frontend Framework: Next.js 14 + TypeScript
Game Engine: Phaser 3.90.0 (WebGL + Web Audio)
Build Tool: Vite 5.4.19
Development: TypeScript + ESLint + Prettier
Deployment: Vercel Platform
Testing: Playwright E2E Testing
```

### 架構設計
```
┌─────────────────────────────────────────────────────────┐
│                 EduCreate Platform                      │
├─────────────────────────────────────────────────────────┤
│  Next.js Application (localhost:3000)                  │
│  ├── /games/airplane (遊戲頁面)                          │
│  ├── AirplaneCollisionGame 組件                         │
│  └── iframe 嵌入機制                                     │
├─────────────────────────────────────────────────────────┤
│  Vite Game Server (localhost:3001)                     │
│  ├── /games/airplane-game/ (獨立遊戲)                   │
│  ├── Phaser 3 遊戲引擎                                   │
│  ├── TypeScript 遊戲邏輯                                 │
│  └── 自動化構建流程                                       │
└─────────────────────────────────────────────────────────┘
```

## 📁 專案結構

### 主要目錄結構
```
EduCreate/
├── components/games/AirplaneCollisionGame/
│   ├── index.tsx                    # 主組件
│   ├── ModifiedGameScene.ts         # 修改後的遊戲場景
│   ├── CollisionDetectionSystem.ts  # 碰撞檢測系統
│   ├── GEPTManager.ts              # GEPT 詞彙管理
│   └── MemoryEnhancementEngine.ts  # 記憶增強引擎
├── games/airplane-game/             # Vite 子專案
│   ├── src/
│   │   ├── main.ts                 # 遊戲入口
│   │   ├── scenes/GameScene.ts     # 遊戲場景
│   │   ├── managers/               # 管理器模組
│   │   └── types/                  # 類型定義
│   ├── public/assets/              # 遊戲資源
│   ├── vite.config.ts             # Vite 配置
│   └── package.json               # 依賴管理
├── app/games/airplane/page.tsx     # Next.js 遊戲頁面
└── public/games/airplane-game/     # 構建輸出
```

### 核心組件說明

#### 1. AirplaneCollisionGame 主組件
```typescript
// components/games/AirplaneCollisionGame/index.tsx
interface AirplaneCollisionGameProps {
  geptLevel: 'elementary' | 'intermediate' | 'advanced';
  onGameComplete?: (results: GameResults) => void;
  onScoreUpdate?: (score: number) => void;
}
```

**功能特性**:
- ✅ 記憶科學原理整合 (主動回憶 + 視覺記憶)
- ✅ GEPT 分級詞彙支援 (Elementary/Intermediate/Advanced)
- ✅ 即時碰撞檢測和反饋
- ✅ 中英文雙語顯示
- ✅ 無障礙設計支援

#### 2. ModifiedGameScene 遊戲場景
```typescript
// components/games/AirplaneCollisionGame/ModifiedGameScene.ts
class ModifiedGameScene extends Phaser.Scene {
  // 核心系統
  private collisionDetectionSystem: CollisionDetectionSystem;
  private geptManager: GEPTManager;
  private memoryEngine: MemoryEnhancementEngine;
  
  // 遊戲物件
  private player: Phaser.Physics.Arcade.Sprite;
  private clouds: Phaser.Physics.Arcade.Group;
  private backgroundLayers: Phaser.GameObjects.TileSprite[];
}
```

**核心功能**:
- ✅ 視差背景系統 (60fps 流暢更新)
- ✅ 雲朵生成和管理
- ✅ 玩家飛機控制 (WASD/方向鍵)
- ✅ 碰撞檢測和處理
- ✅ HUD 和 UI 管理

#### 3. CollisionDetectionSystem 碰撞系統
```typescript
// components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts
class CollisionDetectionSystem {
  handlePlayerCloudCollision(
    player: Phaser.Physics.Arcade.Sprite,
    cloud: CloudSprite
  ): void;
  
  checkTargetMatch(cloudWord: string): boolean;
  updateScore(isCorrect: boolean): void;
}
```

**檢測機制**:
- ✅ 即時碰撞檢測 (Phaser 物理引擎)
- ✅ 目標詞彙匹配驗證
- ✅ 正確/錯誤反饋處理
- ✅ 分數和生命值管理

#### 4. GEPTManager 詞彙管理
```typescript
// components/games/AirplaneCollisionGame/GEPTManager.ts
class GEPTManager {
  setGEPTLevel(level: 'elementary' | 'intermediate' | 'advanced'): void;
  getRandomWord(): { english: string; chinese: string };
  getWordsByLevel(level: string): WordPair[];
}
```

**詞彙系統**:
- ✅ GEPT 三級分級 (Elementary: 1000字, Intermediate: 2000字, Advanced: 3000字)
- ✅ 中英文對應詞彙對
- ✅ 隨機詞彙選擇算法
- ✅ 詞彙頻率權重支援

## ⚡ 性能規格

### 性能基準 (已驗證)
| 指標 | 規格要求 | 實際表現 | 狀態 |
|------|----------|----------|------|
| **FPS** | ≥ 60 fps | 60 fps | ✅ 達標 |
| **記憶體使用** | < 500 MB | 210-223 MB | ✅ 優秀 |
| **載入時間** | < 2000 ms | 805 ms | ✅ 優秀 |
| **記憶體使用率** | < 20% | 5.1-5.4% | ✅ 優秀 |

### 相容性支援
| 平台 | 瀏覽器 | 版本 | 狀態 |
|------|--------|------|------|
| **Desktop** | Chrome | 138+ | ✅ 已測試 |
| **Desktop** | Firefox | 最新 | ⏳ 待測試 |
| **Desktop** | Safari | 最新 | ⏳ 待測試 |
| **Desktop** | Edge | 最新 | ⏳ 待測試 |

## 🔧 開發環境設置

### 前置要求
```bash
Node.js: >= 18.0.0
npm: >= 9.0.0
Git: 最新版本
```

### 安裝步驟
```bash
# 1. 克隆專案
git clone https://github.com/your-repo/EduCreate.git
cd EduCreate

# 2. 安裝主專案依賴
npm install

# 3. 安裝遊戲子專案依賴
cd games/airplane-game
npm install

# 4. 返回主目錄
cd ../..
```

### 開發模式啟動
```bash
# 終端 1: 啟動 Next.js 開發服務器
npm run dev
# 訪問: http://localhost:3000

# 終端 2: 啟動 Vite 遊戲服務器
cd games/airplane-game
npm run dev
# 訪問: http://localhost:3001/games/airplane-game/
```

### 構建和部署
```bash
# 1. 構建遊戲
cd games/airplane-game
npm run build

# 2. 部署到主專案
npm run deploy

# 3. 構建主專案
cd ../..
npm run build
```

## 🎮 遊戲機制

### 核心玩法
1. **飛機控制**: 使用 WASD 或方向鍵控制飛機移動
2. **目標識別**: 螢幕上方顯示中文目標詞彙
3. **雲朵碰撞**: 飛機碰撞顯示對應英文的雲朵
4. **分數系統**: 正確碰撞 +10 分，錯誤碰撞 -10 生命值
5. **詞彙學習**: 通過主動回憶強化記憶

### 記憶科學原理
- **主動回憶**: 玩家需主動識別目標詞彙
- **視覺記憶**: 結合飛行和碰撞的視覺體驗
- **即時反饋**: 立即的正確/錯誤反饋
- **間隔重複**: 錯誤詞彙會更頻繁出現

### 難度調整
```typescript
// GEPT 等級設定
elementary: {
  vocabulary: 1000, // 基礎 1000 字
  cloudSpeed: 100,  // 雲朵移動速度
  spawnRate: 2000   // 生成間隔 (ms)
},
intermediate: {
  vocabulary: 2000, // 進階 2000 字
  cloudSpeed: 150,  // 更快速度
  spawnRate: 1500   // 更頻繁生成
},
advanced: {
  vocabulary: 3000, // 高級 3000 字
  cloudSpeed: 200,  // 最快速度
  spawnRate: 1000   // 最頻繁生成
}
```

## 🔌 API 接口

### 遊戲事件 API
```typescript
// 遊戲完成事件
interface GameResults {
  score: number;
  wordsLearned: number;
  accuracy: number;
  timeSpent: number;
  geptLevel: string;
}

// 分數更新事件
interface ScoreUpdate {
  currentScore: number;
  health: number;
  streak: number;
}

// 詞彙學習事件
interface LearningEvent {
  word: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: number;
}
```

### 組件 Props API
```typescript
interface AirplaneCollisionGameProps {
  // 必需屬性
  geptLevel: 'elementary' | 'intermediate' | 'advanced';
  
  // 可選屬性
  onGameComplete?: (results: GameResults) => void;
  onScoreUpdate?: (score: ScoreUpdate) => void;
  onLearningEvent?: (event: LearningEvent) => void;
  
  // 遊戲設定
  enableSound?: boolean;
  enableHapticFeedback?: boolean;
  customVocabulary?: WordPair[];
  
  // UI 設定
  showInstructions?: boolean;
  theme?: 'default' | 'dark' | 'colorful';
}
```

## 🧪 測試

### 測試覆蓋率
- **單元測試**: 核心邏輯函數
- **整合測試**: 組件互動
- **E2E 測試**: 完整遊戲流程
- **性能測試**: FPS 和記憶體監控

### 測試命令
```bash
# 單元測試
npm run test

# E2E 測試
npm run test:e2e

# 性能測試
npm run test:performance

# 測試覆蓋率
npm run test:coverage
```

## 🚀 部署

### Vercel 部署
```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署專案
vercel --prod
```

### 環境變數
```bash
# .env.local
NEXT_PUBLIC_GAME_API_URL=https://your-api.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 📊 監控和分析

### 性能監控
- **FPS 追蹤**: 即時幀率監控
- **記憶體使用**: 記憶體洩漏檢測
- **載入時間**: 頁面和資源載入性能
- **錯誤追蹤**: 遊戲錯誤和崩潰監控

### 學習分析
- **詞彙掌握度**: 每個詞彙的學習進度
- **反應時間**: 玩家反應速度分析
- **學習曲線**: 長期學習效果追蹤
- **難度適應**: 動態難度調整建議

## 🔧 故障排除

### 常見問題

#### 1. 遊戲無法載入
```bash
# 檢查服務器狀態
npm run dev  # Next.js 服務器
cd games/airplane-game && npm run dev  # Vite 服務器

# 檢查端口占用
netstat -an | grep 3000
netstat -an | grep 3001
```

#### 2. 性能問題
```bash
# 檢查記憶體使用
# 開啟瀏覽器開發者工具 > Performance 標籤

# 檢查 FPS
# 開啟瀏覽器開發者工具 > Console
# 查看 "🎯 當前 FPS" 日誌
```

#### 3. 詞彙載入失敗
```bash
# 檢查 GEPT 詞彙數據
# 確認 components/games/AirplaneCollisionGame/GEPTManager.ts
# 中的詞彙數據完整性
```

## 📝 更新日誌

### v1.0.0 (2025-07-24)
- ✅ 完成基礎遊戲架構
- ✅ 實現 Vite + Phaser 3 整合
- ✅ 添加 GEPT 詞彙系統
- ✅ 實現碰撞檢測機制
- ✅ 完成性能優化 (60fps)
- ✅ 添加記憶科學原理
- ✅ 完成 E2E 測試套件

### 未來版本規劃
- 🔄 v1.1.0: 多主題支援
- 🔄 v1.2.0: 音效和動畫增強
- 🔄 v1.3.0: 多人對戰模式
- 🔄 v2.0.0: AI 個人化學習

## 👥 貢獻指南

### 開發流程
1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 創建 Pull Request

### 代碼規範
- 使用 TypeScript 嚴格模式
- 遵循 ESLint 和 Prettier 規則
- 添加適當的註釋和文檔
- 確保測試覆蓋率 > 80%

**AirplaneCollisionGame 是一個結合記憶科學和遊戲化學習的創新教育工具，為英語詞彙學習提供了全新的體驗！** 🚀
