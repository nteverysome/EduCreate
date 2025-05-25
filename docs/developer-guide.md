# EduCreate 開發者文檔

## 目錄

1. [介紹](#介紹)
2. [項目架構](#項目架構)
3. [開發環境設置](#開發環境設置)
4. [開發工作流程](#開發工作流程)
5. [代碼規範](#代碼規範)
6. [API 參考](#api-參考)
7. [測試](#測試)
8. [部署](#部署)
9. [貢獻指南](#貢獻指南)

## 介紹

EduCreate 是一個互動式教育資源創建平台，使用 Next.js 框架開發。本文檔旨在幫助開發者了解項目架構、設置開發環境，以及參與項目開發的流程和規範。

## 項目架構

### 技術棧

- **前端框架**：Next.js (React)
- **樣式**：TailwindCSS
- **數據庫**：PostgreSQL
- **ORM**：Prisma
- **認證**：NextAuth.js
- **支付處理**：Stripe
- **容器化**：Docker
- **CI/CD**：GitHub Actions
- **監控**：Prometheus

### 目錄結構

```
EduCreate/
├── .github/                # GitHub Actions 工作流配置
├── components/             # React 組件
│   ├── Auth/               # 認證相關組件
│   ├── H5P/                # H5P 相關組件
│   ├── Payment/            # 支付相關組件
│   ├── editor/             # 編輯器組件
│   ├── games/              # 遊戲組件
│   └── templates/          # 模板組件
├── docs/                   # 文檔
├── hooks/                  # 自定義 React Hooks
├── lib/                    # 工具函數和庫
├── middleware/             # Next.js 中間件
├── models/                 # 數據模型
├── monitoring/             # 監控配置
├── pages/                  # Next.js 頁面
│   ├── api/                # API 路由
│   ├── activities/         # 活動相關頁面
│   ├── activity/           # 活動詳情頁面
│   ├── admin/              # 管理員頁面
│   ├── editor/             # 編輯器頁面
│   ├── h5p/                # H5P 相關頁面
│   ├── payment/            # 支付相關頁面
│   ├── preview/            # 預覽頁面
│   └── subscription/       # 訂閱相關頁面
├── prisma/                 # Prisma 配置和遷移
├── public/                 # 靜態資源
├── scripts/                # 實用腳本
├── store/                  # 狀態管理
├── styles/                 # 全局樣式
├── types/                  # TypeScript 類型定義
├── __tests__/              # 測試文件
├── .env.example            # 環境變量示例
├── .env.prod.example       # 生產環境變量示例
├── Dockerfile              # Docker 配置
├── Dockerfile.prod         # 生產環境 Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── docker-compose.prod.yml # 生產環境 Docker Compose 配置
├── jest.config.js          # Jest 配置
├── next.config.js          # Next.js 配置
├── package.json            # 依賴和腳本
└── README.md               # 項目說明
```

### 核心模塊

#### 認證系統

認證系統基於 NextAuth.js 實現，支持電子郵件/密碼登錄、社交媒體登錄和權限管理。

主要文件：
- `components/Auth/AuthProvider.jsx`：認證上下文提供者
- `components/Auth/RegistrationForm.jsx`：用戶註冊表單
- `lib/auth.ts`：認證相關工具函數
- `middleware/withAuth.ts`：認證中間件
- `pages/api/auth/`：認證 API 路由

#### 編輯器系統

編輯器系統允許用戶創建和編輯互動式教育活動，支持拖放功能和版本控制。

主要文件：
- `components/editor/`：編輯器相關組件
- `store/editorStore.ts`：編輯器狀態管理
- `pages/editor/`：編輯器頁面

#### H5P 整合

H5P 整合模塊允許用戶導入、編輯和導出 H5P 內容。

主要文件：
- `components/H5P/`：H5P 相關組件
- `lib/h5p.ts`：H5P 工具函數
- `pages/api/h5p/`：H5P API 路由
- `pages/h5p/`：H5P 相關頁面

#### 支付系統

支付系統基於 Stripe 實現，支持訂閱計劃管理和支付處理。

主要文件：
- `components/Payment/StripeSubscription.jsx`：Stripe 訂閱組件
- `pages/api/payment/`：支付 API 路由
- `pages/payment/`：支付相關頁面
- `pages/subscription/`：訂閱相關頁面

## 開發環境設置

### 前提條件

- Node.js (v14 或更高版本)
- npm 或 yarn
- Docker 和 Docker Compose
- PostgreSQL (如果不使用 Docker)

### 設置步驟

1. **克隆倉庫**

```bash
git clone https://github.com/your-organization/educreate.git
cd educreate
```

2. **安裝依賴**

```bash
npm install
# 或
yarn install
```

3. **環境變量設置**

複製 `.env.example` 文件並重命名為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，設置必要的環境變量：

```
# 數據庫
DATABASE_URL=postgresql://postgres:password@localhost:5432/educreate

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# 其他配置
...
```

4. **使用 Docker 啟動開發環境**

```bash
docker-compose up -d
```

這將啟動 PostgreSQL 數據庫和其他必要的服務。

5. **數據庫遷移**

```bash
npx prisma migrate dev
```

6. **啟動開發服務器**

```bash
npm run dev
# 或
yarn dev
```

現在，您可以在瀏覽器中訪問 http://localhost:3000 查看應用程序。

## 開發工作流程

### 分支策略

我們使用 GitHub Flow 作為分支策略：

1. `main` 分支始終包含穩定的代碼
2. 為每個新功能或修復創建一個新分支
3. 提交更改並推送到遠程分支
4. 創建 Pull Request 進行代碼審查
5. 合併到 `main` 分支

### 開發流程

1. **領取任務**：從項目看板或問題跟踪器中領取一個任務
2. **創建分支**：為任務創建一個新分支
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-fix-name
   ```
3. **開發**：實現功能或修復問題
4. **測試**：編寫和運行測試
   ```bash
   npm run test
   # 或
   yarn test
   ```
5. **提交**：提交更改並推送到遠程分支
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```
6. **創建 Pull Request**：在 GitHub 上創建 Pull Request
7. **代碼審查**：等待代碼審查並根據反饋進行修改
8. **合併**：通過代碼審查後，將分支合併到 `main`

## 代碼規範

### JavaScript/TypeScript 規範

我們使用 ESLint 和 Prettier 來確保代碼質量和一致性：

- 使用 TypeScript 進行類型檢查
- 遵循 Airbnb JavaScript 風格指南
- 使用 async/await 處理異步操作
- 使用 ES6+ 特性

### React/Next.js 規範

- 使用函數組件和 React Hooks
- 使用 TypeScript 定義 props 和狀態類型
- 將大型組件拆分為小型、可重用的組件
- 使用 Next.js 的 API 路由處理後端邏輯

### CSS 規範

- 使用 TailwindCSS 進行樣式設計
- 遵循 BEM 命名約定（如果使用自定義 CSS）
- 確保響應式設計

### 提交信息規範

我們遵循 Conventional Commits 規範：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

類型（type）包括：
- `feat`：新功能
- `fix`：錯誤修復
- `docs`：文檔更改
- `style`：不影響代碼含義的更改（空格、格式等）
- `refactor`：既不修復錯誤也不添加功能的代碼更改
- `perf`：提高性能的代碼更改
- `test`：添加或修正測試
- `chore`：對構建過程或輔助工具的更改

## API 參考

詳細的 API 文檔請參考 [API 文檔](./api-documentation.md)。

## 測試

### 測試框架

我們使用以下工具進行測試：

- Jest：JavaScript 測試框架
- React Testing Library：React 組件測試
- Cypress：端到端測試

### 運行測試

**單元測試和集成測試**

```bash
npm run test
# 或
yarn test
```

**端到端測試**

```bash
npm run cypress
# 或
yarn cypress
```

### 測試覆蓋率

```bash
npm run test:coverage
# 或
yarn test:coverage
```

## 部署

### CI/CD 流程

我們使用 GitHub Actions 進行持續集成和部署：

1. 每次推送到 `main` 分支時，自動運行測試
2. 測試通過後，自動部署到測試環境
3. 手動批准後，部署到生產環境

### 部署環境

- **開發環境**：本地開發服務器
- **測試環境**：用於測試新功能和修復
- **生產環境**：面向用戶的正式環境

### 部署步驟

**使用 Docker 部署**

1. 構建生產 Docker 鏡像
   ```bash
   docker build -f Dockerfile.prod -t educreate:latest .
   ```

2. 使用 Docker Compose 啟動服務
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

**手動部署**

1. 構建生產版本
   ```bash
   npm run build
   # 或
   yarn build
   ```

2. 啟動生產服務器
   ```bash
   npm run start
   # 或
   yarn start
   ```

## 貢獻指南

### 如何貢獻

1. Fork 倉庫
2. 創建功能分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request

### Pull Request 流程

1. 確保 PR 描述清楚地說明了更改的內容和原因
2. 確保所有測試都通過
3. 確保代碼符合代碼規範
4. 等待代碼審查
5. 根據反饋進行修改
6. 合併 PR

### 報告問題

如果您發現錯誤或有功能請求，請在 GitHub 問題跟踪器中創建一個新問題，並提供以下信息：

- 問題的詳細描述
- 重現問題的步驟（如果適用）
- 預期行為和實際行為
- 截圖（如果適用）
- 環境信息（瀏覽器、操作系統等）

---

感謝您對 EduCreate 的貢獻！如果您有任何問題或需要幫助，請隨時聯繫開發團隊。