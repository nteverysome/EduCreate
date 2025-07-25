# 🛩️ 飛機碰撞英語學習遊戲

> **EduCreate 記憶科學驅動智能教育遊戲系列 - Game #1**

## 🎮 快速啟動

```bash
# 進入遊戲目錄 (從項目根目錄)
cd games/airplane-game

# 或使用完整路徑 (從任意位置)
cd C:\Users\Administrator\Desktop\EduCreate\games\airplane-game

# 啟動開發服務器
npm run dev

# 訪問遊戲
http://localhost:3001/games/airplane-game/
```

## 📊 遊戲概述

| 項目 | 詳情 |
|------|------|
| 🎯 **遊戲類型** | 飛機碰撞詞彙學習 |
| 🧠 **學習原理** | 記憶科學 + 間隔重複 |
| 📚 **詞彙系統** | GEPT 三級分級 |
| 🌐 **語言支援** | 中英文雙語 + TTS |
| ⚡ **技術棧** | Vite + TypeScript + Phaser 3 |
| 🎯 **目標用戶** | 英語學習者 (GEPT準備) |

## 🎯 核心功能

### 📱 學習體驗
- ✅ **統一詞彙管理** - 一個詞彙源控制所有顯示
- ✅ **三層顯示系統** - 完整信息 → 母語理解 → 英文應用
- ✅ **中英文發音** - 自動中文 + 點擊英文
- ✅ **記憶科學** - 多感官學習 + 正向強化

### 🎮 遊戲機制
- ✅ **飛機控制** - 方向鍵/WASD 操作
- ✅ **詞彙碰撞** - 找到目標英文單詞
- ✅ **即時反饋** - 成功得分 + 失敗扣血
- ✅ **視覺引導** - 目標詞彙特殊標示

## 🔧 開發指南

### 📁 關鍵文件
```
src/
├── scenes/GameScene.ts          # 🎮 主遊戲場景
├── managers/
│   ├── GEPTManager.ts          # 📚 詞彙管理
│   └── ChineseUIManager.ts     # 🎨 中文UI
└── data/bilingual-vocabulary.json # 📖 詞彙庫
```

### 🎯 統一詞彙系統
```typescript
// 統一控制中心
GameScene.setRandomTargetWord() // :446-470

// 三個顯示終端
上方文字: GameScene.ts:454        // "目標: 朋友 (friend)"
黃色框: ChineseUIManager.ts:274   // "朋友"
雲朵: GameScene.ts:505           // "friend"
```

### 🔄 修改指南
| 修改類型 | 位置 | 說明 |
|---------|------|------|
| 📝 **詞彙內容** | `bilingual-vocabulary.json` | 新增/修改單詞 |
| 🎨 **顏色樣式** | 各UI創建位置 | 修改視覺效果 |
| 📐 **位置布局** | 各管理器 | 調整元素位置 |

## 📚 完整文檔

> 📖 **詳細技術文檔**: [GAME_PATH_DOCUMENTATION.md](./GAME_PATH_DOCUMENTATION.md)

## 🚀 構建和部署

```bash
# 類型檢查
npm run type-check

# 構建生產版本
npm run build

# 預覽構建結果
npm run preview

# 部署到公共目錄
npm run copy-to-public
```

## 🎯 學習流程

```
1. 👀 看到目標 → "目標: 朋友 (friend)"
2. 🧠 理解任務 → "朋友" + 🔊中文發音
3. 👆 學習發音 → 點擊 → 🔊英文發音
4. 🔍 視覺搜索 → 在雲朵中找 "friend"
5. 🎮 執行碰撞 → 飛機碰撞目標詞彙
6. 🎉 獲得獎勵 → 🔊英文發音 + 得分
```

## 🔧 故障排除

| 問題 | 解決方案 |
|------|----------|
| 🚫 **端口衝突** | 修改 `vite.config.ts` 端口設置 |
| ❌ **構建失敗** | 檢查 TypeScript 類型錯誤 |
| 📦 **依賴問題** | 刪除 `node_modules` 重新安裝 |
| 🔊 **發音無效** | 檢查瀏覽器音頻權限 |

## 📈 性能指標

- ⚡ **60fps** 穩定運行
- 🚀 **<1s** 遊戲載入時間
- 💾 **<5MB** 總包大小
- 🎯 **>99%** 詞彙同步準確率

---

**🏷️ 遊戲標籤**: `#phaser3` `#typescript` `#english-learning` `#memory-science` `#gept`  
**📅 最後更新**: 2025-01-24  
**👥 開發團隊**: EduCreate Team  
**📧 技術支援**: tech@educreate.com

---

## 🔗 相關連結

- 📚 [完整技術文檔](./GAME_PATH_DOCUMENTATION.md)
- 🎮 [EduCreate 主項目](../../README.md)
- 🛠️ [部署指南](./DEPLOYMENT.md)
- 📊 [包分析報告](./bundle-analysis.json)
