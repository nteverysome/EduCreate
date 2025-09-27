# 🚀 EduCreate 開發參考指南

## 📋 概述

這個文檔是 EduCreate 項目的開發參考指南，整合了所有重要的技術文檔和開發資源，方便團隊成員快速找到所需的技術資料。

## 🎮 遊戲開發核心文檔

### 1. 全螢幕通信系統 🆕 **重點推薦**
- **文檔**: [Phaser 遊戲全螢幕按鈕與虛擬搖桿通信系統](PHASER_FULLSCREEN_COMMUNICATION_README.md)
- **用途**: 實現 Phaser 遊戲的全螢幕功能和虛擬控制
- **適用場景**: 
  - 新遊戲需要全螢幕功能
  - 移動設備觸摸控制整合
  - iframe 與父頁面通信
  - 跨瀏覽器兼容性處理
- **包含內容**:
  - 完整的實現步驟（7個步驟）
  - 代碼範例和最佳實踐
  - 故障排除和調試工具
  - 瀏覽器兼容性指南

### 2. TouchControls 整合
- **實現範例**: [Starshake 遊戲](../public/games/starshake-game/dist/index.html)
- **測試腳本**: [移動設備測試](../tests/starshake-touchcontrols-final-integration-test.spec.js)
- **整合工具**: [TouchControls 整合腳本](../integrate-touchcontrols-final.js)

### 3. 遊戲切換器系統
- **技術文檔**: [GameSwitcher 技術文檔](game-switcher-technical-documentation.md)
- **E2E 測試**: [GameSwitcher 測試](../tests/game-switcher.spec.ts)
- **用途**: 統一遊戲管理和切換

### 4. 飛機碰撞遊戲
- **技術文檔**: [AirplaneCollisionGame 技術文檔](airplane-collision-game-technical-documentation.md)
- **API 文檔**: [API 接口文檔](airplane-collision-game-api-documentation.md)
- **部署指南**: [部署指南](airplane-collision-game-deployment-guide.md)

## 🏗️ 架構設計文檔

### 前後端分離架構
- **CDN 實施**: [CDN 實施總結](iframe-cdn-implementation-summary.md)
- **缺口分析**: [實施缺口分析](cdn-implementation-gap-analysis.md)
- **行動計劃**: [實施行動計劃](cdn-implementation-action-plan.md)

### 響應式設計
- **響應式工作流程**: [響應式工作流程指南](responsive-workflow-guide.md)
- **Phaser3 響應式**: [Phaser3 響應式全螢幕指南](phaser3-responsive-fullscreen-complete-guide.md)

## 🧪 測試和性能

### 測試框架
- **E2E 測試**: 使用 Playwright 進行端到端測試
- **性能測試**: [性能優化文檔](performance-optimization.md)
- **移動設備測試**: 專門的移動設備測試套件

### 性能基準
- **60fps 穩定運行**
- **記憶體使用 < 5.5%**
- **遊戲切換時間 < 100ms**

## 📚 開發工作流程

### 新遊戲開發流程
1. **參考全螢幕通信系統文檔**
2. **使用 GameSwitcher 架構**
3. **整合 TouchControls（如需要）**
4. **添加 E2E 測試**
5. **性能優化和測試**
6. **文檔更新**

### 代碼規範
- **TypeScript 嚴格模式**
- **ESLint 和 Prettier 規則**
- **詳細註釋和文檔**
- **測試覆蓋率 > 80%**

## 🔧 常用開發工具

### 調試工具
```javascript
// 全螢幕通信診斷
window.getPostMessageDiagnostic();

// TouchControls 狀態檢查
window.testTouchControls();

// 性能監控
window.monitorCommStatus();
```

### 測試命令
```bash
# E2E 測試
npm run test:e2e

# 性能測試
npm run test:performance

# 移動設備測試
npm run test:mobile
```

## 🚀 部署參考

### Vercel 部署
```bash
vercel --prod
```

### 本地開發
```bash
npm run dev
```

### 測試環境
- **主應用**: https://edu-create.vercel.app
- **遊戲切換器**: https://edu-create.vercel.app/games/switcher
- **Starshake 遊戲**: https://edu-create.vercel.app/games/starshake-game

## 📖 快速參考

### 重要文件位置
- **全螢幕通信系統**: `docs/PHASER_FULLSCREEN_COMMUNICATION_README.md`
- **遊戲目錄**: `public/games/`
- **測試目錄**: `tests/`
- **組件目錄**: `components/games/`

### 關鍵組件
- **GameSwitcher**: `components/games/GameSwitcher.tsx`
- **TouchControls**: 整合在各遊戲的 HTML 文件中
- **PostMessage 通信**: 跨 iframe 通信系統

## 🎯 開發優先級

### 高優先級
1. **全螢幕通信系統** - 新遊戲必須參考
2. **TouchControls 整合** - 移動設備支援
3. **GameSwitcher 架構** - 統一遊戲管理

### 中優先級
1. **性能優化** - 維持 60fps 標準
2. **測試覆蓋** - 確保功能穩定性
3. **文檔更新** - 保持文檔同步

### 低優先級
1. **UI 美化** - 在功能完成後進行
2. **額外功能** - 非核心功能開發

## 🤝 團隊協作

### 開發前必讀
1. **閱讀全螢幕通信系統文檔**
2. **了解現有遊戲架構**
3. **熟悉測試流程**
4. **掌握調試工具**

### 代碼提交前檢查
- [ ] 功能測試通過
- [ ] 性能指標達標
- [ ] 移動設備兼容
- [ ] 文檔已更新
- [ ] 代碼已註釋

---

## 🎉 重要提醒

**在開發任何新的 Phaser 遊戲功能時，請務必參考 [全螢幕通信系統文檔](PHASER_FULLSCREEN_COMMUNICATION_README.md)，這是我們最完整和最新的技術實現指南！**

這個文檔包含了所有必要的代碼範例、最佳實踐和故障排除方法，可以大大加速開發進程並確保代碼質量。
