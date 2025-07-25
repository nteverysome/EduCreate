# EduCreate 飛機碰撞遊戲中英文雙語系統需求分析

## 📋 項目概述

### 目標
為 EduCreate 的 Vite + Phaser 3 飛機碰撞遊戲實現完整的中英文雙語顯示系統，提升學習效果和用戶體驗。

### 技術架構
- **基礎**: Vite + TypeScript + Phaser 3 v3.90.0
- **路徑**: `games/airplane-game/src/`
- **主要場景**: `src/scenes/GameScene.ts`

## 🔍 當前狀態分析

### ✅ 已有功能
- Phaser 3 遊戲引擎完整實現
- GEPT 詞彙管理系統 (GEPTManager.ts)
- 記憶增強引擎 (MemoryEnhancementEngine.ts)
- 碰撞檢測系統 (CollisionDetectionSystem.ts)
- 月亮主題視差背景系統
- 英文詞彙雲朵動態生成
- 60fps 穩定性能表現

### ❌ 缺少功能
- 中文提示顯示系統
- 雙語詞彙對應管理
- 中文 UI 界面元素
- 雙語碰撞識別邏輯
- 中文字體渲染優化

## 📊 技術需求詳細分析

### 1. 中文提示位置設計

#### 1.1 位置選項分析
```typescript
interface ChinesePromptPosition {
  // 選項 1: 頂部中央 (推薦)
  topCenter: {
    x: gameWidth / 2,
    y: 50,
    advantages: ['不遮擋遊戲區域', '視覺焦點明確'],
    disadvantages: ['可能與 HUD 重疊']
  },
  
  // 選項 2: 底部中央
  bottomCenter: {
    x: gameWidth / 2,
    y: gameHeight - 50,
    advantages: ['不影響遊戲視野'],
    disadvantages: ['可能被忽略']
  },
  
  // 選項 3: 浮動跟隨
  floating: {
    followTarget: true,
    offset: { x: 0, y: -60 },
    advantages: ['動態提示', '注意力集中'],
    disadvantages: ['可能造成視覺干擾']
  }
}
```

#### 1.2 推薦方案
**頂部中央固定位置** - 平衡可見性和遊戲體驗

### 2. 雙語詞彙對應關係管理

#### 2.1 數據結構設計
```typescript
interface BilingualVocabulary {
  id: string;
  english: string;
  chinese: string;
  geptLevel: 'elementary' | 'intermediate' | 'advanced';
  pronunciation?: string;
  example?: {
    english: string;
    chinese: string;
  };
  difficulty: number; // 1-10
  frequency: number;  // 使用頻率
}
```

#### 2.2 詞彙對應數據庫
```typescript
const bilingualDatabase: BilingualVocabulary[] = [
  {
    id: 'friend_001',
    english: 'friend',
    chinese: '朋友',
    geptLevel: 'elementary',
    pronunciation: 'frend',
    example: {
      english: 'He is my best friend.',
      chinese: '他是我最好的朋友。'
    },
    difficulty: 2,
    frequency: 8
  },
  // ... 更多詞彙
];
```

### 3. GEPT 分級整合需求

#### 3.1 現有 GEPT 系統擴展
```typescript
// 擴展現有 GEPTManager.ts
class EnhancedGEPTManager extends GEPTManager {
  private bilingualDatabase: Map<string, BilingualVocabulary>;
  
  getBilingualVocabulary(level: GEPTLevel): BilingualVocabulary[] {
    return this.bilingualDatabase.values()
      .filter(vocab => vocab.geptLevel === level);
  }
  
  getChineseTranslation(english: string): string {
    return this.bilingualDatabase.get(english)?.chinese || '';
  }
}
```

#### 3.2 分級標準
- **Elementary (初級)**: 基礎生活詞彙，中文提示較大字體
- **Intermediate (中級)**: 學術和工作詞彙，標準字體
- **Advanced (高級)**: 專業和抽象詞彙，較小字體

### 4. 無障礙設計要求

#### 4.1 視覺無障礙
```typescript
interface AccessibilityConfig {
  fontSize: {
    small: 16,
    medium: 20,
    large: 24,
    extraLarge: 28
  },
  contrast: {
    normal: { background: '#000000', text: '#FFFFFF' },
    high: { background: '#000000', text: '#FFFF00' },
    reverse: { background: '#FFFFFF', text: '#000000' }
  },
  fontFamily: {
    chinese: 'Microsoft YaHei, SimHei, sans-serif',
    english: 'Arial, Helvetica, sans-serif'
  }
}
```

#### 4.2 操作無障礙
- 鍵盤導航支援
- 螢幕閱讀器相容性
- 語音提示功能
- 觸控設備優化

## 🎨 UI/UX 設計需求

### 1. 中文提示框設計
```typescript
interface ChinesePromptStyle {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: { x: 16, y: 8 },
    border: '2px solid #FFD700'
  },
  text: {
    fontSize: 24,
    fontFamily: 'Microsoft YaHei',
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  animation: {
    fadeIn: { duration: 300, ease: 'Power2.easeOut' },
    fadeOut: { duration: 200, ease: 'Power2.easeIn' }
  }
}
```

### 2. 遊戲 HUD 雙語化
- 分數顯示：「分數: 100」
- 生命值顯示：「生命值: 3」
- 目標提示：「尋找: 朋友 (friend)」
- 遊戲狀態：「遊戲進行中」

## ⚡ 性能優化需求

### 1. 中文字體載入優化
```typescript
// 預載入中文字體
const fontConfig = {
  key: 'chinese-font',
  url: 'assets/fonts/chinese.woff2',
  format: 'woff2',
  preload: true
};
```

### 2. 渲染性能優化
- 中文文字物件池化
- 動態文字更新優化
- 記憶體使用監控

## 🔧 技術實施架構

### 1. 新增檔案結構
```
games/airplane-game/src/
├── managers/
│   ├── BilingualManager.ts          # 雙語管理器
│   ├── ChineseUIManager.ts          # 中文 UI 管理器
│   └── AccessibilityManager.ts     # 無障礙管理器
├── data/
│   └── bilingual-vocabulary.json   # 雙語詞彙數據
├── assets/
│   └── fonts/
│       └── chinese.woff2           # 中文字體
└── types/
    └── bilingual.ts                # 雙語類型定義
```

### 2. 核心類別設計
```typescript
// BilingualManager.ts
export class BilingualManager {
  private vocabulary: Map<string, BilingualVocabulary>;
  private currentPrompt: Phaser.GameObjects.Container;
  
  showChinesePrompt(english: string): void;
  hideChinesePrompt(): void;
  updateTargetWord(english: string): void;
}

// ChineseUIManager.ts
export class ChineseUIManager {
  private scene: Phaser.Scene;
  private promptContainer: Phaser.GameObjects.Container;
  
  createPromptUI(): void;
  updatePromptText(chinese: string): void;
  applyAccessibilitySettings(): void;
}
```

## 📋 驗收標準

### 功能性需求
- [ ] 中文提示正確顯示目標詞彙的中文翻譯
- [ ] 雙語詞彙對應準確無誤
- [ ] GEPT 分級系統完整整合
- [ ] 碰撞檢測支援雙語識別
- [ ] 遊戲 HUD 完全中文化

### 性能需求
- [ ] 60fps 穩定運行（包含中文渲染）
- [ ] 中文字體載入時間 < 2 秒
- [ ] 記憶體使用增加 < 50MB
- [ ] 文字更新延遲 < 16ms

### 無障礙需求
- [ ] 支援 3 種字體大小
- [ ] 支援高對比度模式
- [ ] 鍵盤導航完整支援
- [ ] 螢幕閱讀器相容

### 整合需求
- [ ] GameSwitcher 無縫整合
- [ ] 與現有 React 版本功能對等
- [ ] 跨瀏覽器相容性
- [ ] 移動設備適配

## 🚀 下一步行動

1. **立即開始**: Task 1.5.2 設計中英文詞彙管理系統
2. **並行準備**: 收集和整理雙語詞彙數據
3. **技術準備**: 研究 Phaser 3 中文字體最佳實踐
4. **測試準備**: 設計雙語功能測試用例

---

**文檔版本**: v1.0  
**創建日期**: 2025-07-24  
**負責人**: EduCreate 開發團隊  
**審核狀態**: 待審核
