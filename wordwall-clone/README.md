# 🎮 Wordwall Clone - 教育遊戲平台

## 📋 項目概述

這是一個功能完整的 Wordwall.net 克隆版本，提供教育工作者創建互動式學習遊戲的平台。

## 🏗️ 項目結構

```
wordwall-clone/
├── frontend/                 # React + TypeScript 前端應用
│   ├── src/
│   │   ├── components/       # 可重用組件
│   │   ├── pages/           # 頁面組件
│   │   ├── hooks/           # 自定義 Hooks
│   │   ├── store/           # 狀態管理
│   │   ├── services/        # API 服務
│   │   ├── types/           # TypeScript 類型
│   │   └── utils/           # 工具函數
│   ├── public/              # 靜態資源
│   └── package.json
├── backend/                  # Node.js + Express 後端 API
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 業務邏輯
│   │   ├── models/          # 數據模型
│   │   ├── middleware/      # 中間件
│   │   ├── routes/          # 路由定義
│   │   ├── utils/           # 工具函數
│   │   └── config/          # 配置文件
│   ├── prisma/              # Prisma 數據庫配置
│   └── package.json
├── shared/                   # 共享代碼和類型
│   ├── types/               # 共享 TypeScript 類型
│   └── utils/               # 共享工具函數
├── docs/                     # 項目文檔
├── scripts/                  # 構建和部署腳本
└── docker-compose.yml        # Docker 配置
```

## 🚀 快速開始

### 前置需求
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm 或 yarn

### 安裝步驟

1. **克隆項目**
```bash
git clone <repository-url>
cd wordwall-clone
```

2. **安裝依賴**
```bash
# 安裝前端依賴
cd frontend
npm install

# 安裝後端依賴
cd ../backend
npm install
```

3. **配置環境變量**
```bash
# 複製環境變量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 編輯配置文件，填入實際值
```

4. **設置數據庫**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **啟動開發服務器**
```bash
# 啟動後端服務器 (終端 1)
cd backend
npm run dev

# 啟動前端服務器 (終端 2)
cd frontend
npm run dev
```

## 🎮 核心功能

### 遊戲模板
- **Quiz** - 多選題測驗遊戲
- **Match Up** - 拖拽配對遊戲
- **Spin the Wheel** - 轉盤遊戲
- **Group Sort** - 分組排序遊戲
- **Flash Cards** - 記憶卡片遊戲
- **Anagram** - 字母重排遊戲

### 用戶功能
- 用戶註冊和登入
- 活動創建和編輯
- 多媒體內容支持
- 實時遊戲體驗
- 結果統計和分析

### 教學管理
- 作業分配系統
- 學生進度追蹤
- 班級管理
- 詳細分析報告

## 🛠️ 技術棧

### 前端
- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Framer Motion** - 動畫庫
- **Zustand** - 狀態管理
- **React Query** - 服務器狀態管理

### 後端
- **Node.js** - 運行環境
- **Express.js** - Web 框架
- **Prisma** - ORM 工具
- **PostgreSQL** - 主數據庫
- **Redis** - 緩存數據庫
- **Socket.io** - 實時通信

### 開發工具
- **Vite** - 前端構建工具
- **ESLint** - 代碼檢查
- **Prettier** - 代碼格式化
- **Jest** - 單元測試
- **Cypress** - 端到端測試

## 📚 文檔

詳細文檔請查看 `docs/` 目錄：

- [項目總覽](../docs/01-project-overview.md)
- [技術架構](../docs/02-technical-architecture.md)
- [數據庫設計](../docs/03-database-design.md)
- [前端開發指南](../docs/frontend/01-setup-react-project.md)
- [執行計劃](../docs/PROJECT_EXECUTION_PLAN.md)

## 🧪 測試

```bash
# 運行前端測試
cd frontend
npm test

# 運行後端測試
cd backend
npm test

# 運行端到端測試
npm run test:e2e
```

## 🚀 部署

### 開發環境
```bash
docker-compose up -d
```

### 生產環境
詳細部署指南請參考 [部署文檔](../docs/deployment/)。

## 📄 許可證

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 支持

如有問題，請查看文檔或提交 Issue。
