# 🏗️ 技術架構設計

## 🎯 架構概覽

本項目採用現代化的前後端分離架構，確保高性能、可擴展性和維護性。

## 📐 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                        用戶層                                │
│  Web Browser │ Mobile Browser │ Tablet │ Interactive Board  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        CDN 層                               │
│              Cloudflare CDN (靜態資源分發)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       前端層                                │
│                   React 18 + TypeScript                    │
│              Vercel (靜態網站託管)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API 網關                              │
│                 Express.js + CORS                          │
│              Railway/Render (後端託管)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      應用服務層                              │
│  Authentication │ Game Engine │ Content Management │ WebSocket│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      數據存儲層                              │
│  PostgreSQL (主數據庫) │ Redis (緩存) │ Cloudinary (文件)    │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 前端架構設計

### 技術棧選擇
```typescript
// 核心框架
React 18.2.0          // UI 框架
TypeScript 5.0+       // 類型安全
Vite 4.0+             // 構建工具

// UI 與樣式
Tailwind CSS 3.3+     // 原子化 CSS
Headless UI 1.7+      // 無樣式組件
Framer Motion 10.0+   // 動畫庫
Lucide React 0.263+   // 圖標庫

// 狀態管理
Zustand 4.4+          // 輕量狀態管理
React Query 4.0+      // 服務器狀態管理

// 路由與導航
React Router 6.14+    // 客戶端路由

// 工具庫
Axios 1.4+            // HTTP 客戶端
React Hook Form 7.45+ // 表單處理
Zod 3.21+             // 數據驗證
```

### 組件架構
```
src/
├── components/           # 可重用組件
│   ├── ui/              # 基礎 UI 組件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── layout/          # 佈局組件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── game/            # 遊戲相關組件
│       ├── GameCanvas.tsx
│       ├── GameControls.tsx
│       └── GameResults.tsx
├── pages/               # 頁面組件
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── GamePage.tsx
├── hooks/               # 自定義 Hooks
│   ├── useAuth.ts
│   ├── useGame.ts
│   └── useApi.ts
├── store/               # 狀態管理
│   ├── authStore.ts
│   ├── gameStore.ts
│   └── uiStore.ts
├── services/            # API 服務
│   ├── authService.ts
│   ├── gameService.ts
│   └── apiClient.ts
├── types/               # TypeScript 類型定義
│   ├── auth.ts
│   ├── game.ts
│   └── api.ts
└── utils/               # 工具函數
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

## 🔧 後端架構設計

### 技術棧選擇
```javascript
// 核心框架
Node.js 18+           // 運行環境
Express.js 4.18+      // Web 框架
TypeScript 5.0+       // 類型安全

// 數據庫與 ORM
Prisma 5.0+           // ORM 工具
PostgreSQL 15+        // 主數據庫
Redis 7+              // 緩存數據庫

// 認證與安全
JWT 9.0+              // 身份驗證
bcrypt 5.1+           // 密碼加密
helmet 7.0+           // 安全中間件
cors 2.8+             // 跨域處理

// 實時通信
Socket.io 4.7+        // WebSocket 庫

// 文件處理
Multer 1.4+           // 文件上傳
Cloudinary 1.37+      // 圖片處理

// 工具庫
Joi 17.9+             // 數據驗證
Winston 3.9+          // 日誌記錄
```

### 服務架構
```
src/
├── controllers/         # 控制器層
│   ├── authController.ts
│   ├── gameController.ts
│   ├── userController.ts
│   └── activityController.ts
├── services/            # 業務邏輯層
│   ├── authService.ts
│   ├── gameService.ts
│   ├── emailService.ts
│   └── fileService.ts
├── models/              # 數據模型
│   ├── User.ts
│   ├── Activity.ts
│   ├── Game.ts
│   └── Result.ts
├── middleware/          # 中間件
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── rateLimit.ts
├── routes/              # 路由定義
│   ├── authRoutes.ts
│   ├── gameRoutes.ts
│   ├── userRoutes.ts
│   └── activityRoutes.ts
├── utils/               # 工具函數
│   ├── jwt.ts
│   ├── email.ts
│   ├── upload.ts
│   └── validation.ts
├── config/              # 配置文件
│   ├── database.ts
│   ├── redis.ts
│   └── cloudinary.ts
└── types/               # TypeScript 類型
    ├── auth.ts
    ├── game.ts
    └── api.ts
```

## 🗄️ 數據庫架構設計

### PostgreSQL 主數據庫
```sql
-- 核心表結構
users                    -- 用戶表
activities              -- 活動表
templates               -- 模板表
game_results            -- 遊戲結果表
assignments             -- 作業表
user_sessions           -- 用戶會話表
audit_logs              -- 審計日誌表
```

### Redis 緩存策略
```javascript
// 緩存鍵命名規範
user:session:{userId}           // 用戶會話
activity:data:{activityId}      // 活動數據
game:state:{gameId}            // 遊戲狀態
leaderboard:{activityId}       // 排行榜
rate_limit:{ip}:{endpoint}     // 速率限制
```

## 🌐 API 設計規範

### RESTful API 結構
```
GET    /api/v1/auth/me                    # 獲取當前用戶
POST   /api/v1/auth/login                 # 用戶登入
POST   /api/v1/auth/register              # 用戶註冊
POST   /api/v1/auth/logout                # 用戶登出

GET    /api/v1/activities                 # 獲取活動列表
POST   /api/v1/activities                 # 創建新活動
GET    /api/v1/activities/:id             # 獲取特定活動
PUT    /api/v1/activities/:id             # 更新活動
DELETE /api/v1/activities/:id             # 刪除活動

GET    /api/v1/templates                  # 獲取模板列表
GET    /api/v1/templates/:id              # 獲取特定模板

POST   /api/v1/games/:id/start            # 開始遊戲
POST   /api/v1/games/:id/submit           # 提交答案
GET    /api/v1/games/:id/results          # 獲取結果
```

### WebSocket 事件設計
```typescript
// 客戶端到服務器事件
interface ClientToServerEvents {
  'game:join': (gameId: string) => void;
  'game:start': (gameId: string) => void;
  'game:answer': (data: AnswerData) => void;
  'game:leave': (gameId: string) => void;
}

// 服務器到客戶端事件
interface ServerToClientEvents {
  'game:started': (gameState: GameState) => void;
  'game:updated': (gameState: GameState) => void;
  'game:finished': (results: GameResults) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
}
```

## 🔒 安全架構設計

### 認證與授權
```typescript
// JWT Token 結構
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  iat: number;
  exp: number;
}

// 權限控制
enum Permission {
  READ_ACTIVITY = 'read:activity',
  WRITE_ACTIVITY = 'write:activity',
  DELETE_ACTIVITY = 'delete:activity',
  MANAGE_USERS = 'manage:users',
  VIEW_ANALYTICS = 'view:analytics'
}
```

### 安全措施
- **HTTPS**: 強制使用 SSL/TLS 加密
- **CORS**: 配置跨域資源共享
- **Rate Limiting**: API 速率限制
- **Input Validation**: 輸入數據驗證
- **SQL Injection Prevention**: 使用 Prisma ORM 防護
- **XSS Protection**: 內容安全策略 (CSP)

## 📊 性能優化策略

### 前端優化
- **代碼分割**: React.lazy() + Suspense
- **圖片優化**: WebP 格式 + 懶加載
- **緩存策略**: Service Worker + HTTP 緩存
- **Bundle 優化**: Tree shaking + 壓縮

### 後端優化
- **數據庫優化**: 索引優化 + 查詢優化
- **緩存策略**: Redis 緩存熱點數據
- **連接池**: 數據庫連接池管理
- **壓縮**: Gzip 響應壓縮

### 基礎設施優化
- **CDN**: 全球內容分發網絡
- **負載均衡**: 多實例部署
- **數據庫讀寫分離**: 主從複製
- **監控告警**: 實時性能監控

## 🧪 測試架構設計

### 測試金字塔
```
                    E2E Tests (Cypress)
                   ┌─────────────────┐
                  ┌─────────────────────┐
                 │  Integration Tests   │
                ┌─────────────────────────┐
               │      Unit Tests (Jest)    │
              └─────────────────────────────┘
```

### 測試策略
- **單元測試**: 函數和組件級別測試
- **集成測試**: API 和數據庫集成測試
- **端到端測試**: 完整用戶流程測試
- **性能測試**: 負載和壓力測試

---

**狀態**: ⏳ 計劃中
**負責人**: 架構師
**預計完成**: 第 1 天
**依賴項**: 項目總覽完成
