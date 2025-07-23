# 🛩️ Phaser 3 飛機選擇器

現代化的飛行射擊遊戲，從 Phaser 2 完全升級到 Phaser 3，具備完整的 TypeScript 支援和現代化開發工具鏈。

## ✨ 特色功能

### 🎮 遊戲特色
- **7 種真實飛機**：B-17、BF-109E、雙翼機、TBM-3、Hawker Tempest、JU-87B2、Blenheim
- **詳細飛機繪圖**：每架飛機都有獨特的手繪圖形和性能參數
- **現代化 UI**：響應式設計，支援多種輸入方式
- **性能優化**：Phaser 3 高效渲染引擎，流暢的 60fps 體驗

### 🛠️ 技術特色
- **Phaser 3.90.0**：最新版本的 HTML5 遊戲引擎
- **TypeScript**：完整的類型安全和 IntelliSense 支援
- **Vite**：極速的開發服務器和建置工具
- **模組化架構**：易於維護和擴展的代碼結構

## 🚀 快速開始

### 環境要求
- Node.js 16.0.0 或更高版本
- npm 8.0.0 或更高版本

### 安裝和運行
```bash
# 克隆專案
git clone <repository-url>
cd phaser3-plane-selector

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

遊戲將在 `http://localhost:3000` 啟動。

### 建置生產版本
```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 🎯 遊戲操作

### 基本控制
- **移動**：方向鍵 ↑↓←→ 或 WASD
- **射擊**：空白鍵或滑鼠左鍵
- **重新開始**：R 鍵
- **飛機選擇**：數字鍵 1-7

### 開發者快捷鍵
- **F12**：切換調試面板
- **Ctrl+R**：重新載入場景
- **Ctrl+D**：切換物理調試
- **Ctrl+G**：切換網格顯示
- **Ctrl+P**：暫停/恢復遊戲

## 📁 專案結構

```
phaser3-plane-selector/
├── public/                 # 靜態資源
│   ├── assets/            # 遊戲資源
│   └── index.html         # 主 HTML 檔案
├── src/                   # 源代碼
│   ├── game/              # 遊戲核心
│   │   ├── scenes/        # Phaser 3 場景
│   │   ├── systems/       # 遊戲系統
│   │   └── config/        # 遊戲配置
│   ├── planes/            # 飛機系統
│   │   ├── configs/       # 飛機配置
│   │   └── graphics/      # 飛機繪圖
│   ├── ui/                # UI 組件
│   │   └── components/    # 可重用組件
│   ├── utils/             # 工具函數
│   └── types/             # TypeScript 類型
├── scripts/               # 建置腳本
└── tests/                 # 測試檔案
```

## 🎨 飛機介紹

### B-17 Flying Fortress
- **類型**：重型轟炸機
- **特色**：四引擎設計，強大火力
- **速度**：250 | **射擊頻率**：300ms | **生命值**：150

### Messerschmitt BF-109E
- **類型**：戰鬥機
- **特色**：德國單引擎戰鬥機，機動性極佳
- **速度**：350 | **射擊頻率**：150ms | **生命值**：80

### 雙翼戰鬥機
- **類型**：經典雙翼機
- **特色**：操控靈活，復古設計
- **速度**：200 | **射擊頻率**：400ms | **生命值**：60

### TBM-3 Avenger
- **類型**：魚雷轟炸機
- **特色**：美國海軍艦載轟炸機
- **速度**：280 | **射擊頻率**：250ms | **生命值**：120

### Hawker Tempest MKII
- **類型**：高速戰鬥機
- **特色**：英國高速戰鬥機
- **速度**：400 | **射擊頻率**：100ms | **生命值**：90

### Junkers JU-87B2 Stuka
- **類型**：俯衝轟炸機
- **特色**：德國俯衝轟炸機，精確打擊
- **速度**：220 | **射擊頻率**：350ms | **生命值**：100

### Bristol Blenheim
- **類型**：中型轟炸機
- **特色**：英國雙引擎中型轟炸機
- **速度**：260 | **射擊頻率**：280ms | **生命值**：110

## 🧪 開發和測試

### 開發命令
```bash
npm run dev          # 啟動開發服務器
npm run build        # 完整建置流程
npm run build:only   # 僅建置（跳過測試）
npm run preview      # 預覽生產版本
npm run type-check   # TypeScript 類型檢查
npm run lint         # ESLint 代碼檢查
npm run format       # Prettier 代碼格式化
```

### 測試命令
```bash
npm run test         # 運行測試
npm run test:watch   # 監視模式測試
npm run test:ui      # 測試 UI 界面
npm run coverage     # 測試覆蓋率報告
```

## 🏗️ 技術架構

### 核心技術棧
- **Phaser 3.90.0** - HTML5 遊戲引擎
- **TypeScript 5.8.3** - 類型安全的 JavaScript
- **Vite 4.5.14** - 現代化建置工具
- **Vitest** - 快速的單元測試框架

### 架構設計
- **Scene 系統**：LoadingScene → MenuScene → GameScene
- **模組化設計**：PlaneManager、InputManager、AssetLoader
- **組件化 UI**：Button、Panel、PlaneSelector、GameHUD
- **事件驅動**：統一的事件系統和狀態管理

## 📊 性能優化

### 建置優化
- **代碼分割**：Phaser、遊戲邏輯、飛機系統分別打包
- **資源優化**：圖片壓縮、字體子集化
- **快取策略**：長期快取靜態資源

### 運行時優化
- **物件池**：子彈和敵機重用
- **紋理快取**：飛機圖形快取機制
- **性能監控**：開發模式下的實時性能監控

## 🔧 開發工具

### 調試功能
- **實時調試面板**：FPS、記憶體、物件數量監控
- **物理調試**：碰撞邊界可視化
- **網格顯示**：對齊輔助線
- **場景重載**：快速測試功能

### 代碼品質
- **ESLint**：代碼風格和品質檢查
- **Prettier**：自動代碼格式化
- **TypeScript**：編譯時類型檢查
- **Vitest**：單元測試覆蓋

## 🚀 部署

### 生產建置
```bash
npm run build
```

建置後的檔案在 `dist/` 目錄中，可以部署到任何靜態檔案服務器。

### 建置統計
- **總大小**：約 2.8MB（包含 Phaser 3）
- **載入時間**：< 2秒（快速網絡）
- **支援瀏覽器**：Chrome 80+、Firefox 75+、Safari 13+

## 📝 更新日誌

### v1.0.0 (2024-01-XX)
- ✨ 完整的 Phaser 2 到 Phaser 3 升級
- 🎨 7 種飛機的詳細手繪圖形
- 🛠️ 現代化開發工具鏈
- 🧪 完整的測試覆蓋
- 📱 響應式設計支援
- 🎮 多種輸入方式支援

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🙏 致謝

- Phaser 3 團隊提供優秀的遊戲引擎
- 歷史飛機資料和圖片參考
- 開源社區的各種工具和庫
