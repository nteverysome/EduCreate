# EduCreate - 互動式教育資源創建平台

## 項目概述

EduCreate是一個互動式教育資源創建平台，旨在提供教師創建、分享和使用互動教學活動的工具。平台支持多種活動模板，包括配對遊戲、單字卡片和測驗問答等。

## 技術架構

- **前端**：Next.js, React, TailwindCSS, DnD Kit, Zustand
- **後端**：Next.js API Routes
- **數據庫**：PostgreSQL with Prisma ORM
- **認證**：NextAuth.js
- **支付**：Stripe
- **容器化**：Docker & Docker Compose

## 功能特點

- 用戶註冊和登錄系統
- 基於角色的權限管理系統
- 多種互動教學活動模板
- 拖放式編輯器界面
- 活動分享和協作功能
- 訂閱計劃和支付整合
- H5P內容支持

## 快速開始

### 使用Docker

```bash
# 克隆倉庫
git clone https://github.com/yourusername/educreate.git
cd educreate

# 啟動Docker容器
docker-compose up -d
```

### 手動設置

```bash
# 安裝依賴
npm install

# 設置數據庫
npx prisma migrate dev

# 啟動開發服務器
npm run dev
```

## 角色和權限系統

### 用戶角色

EduCreate 平台支持以下用戶角色：

- **USER**：基本用戶，可以瀏覽活動和模板
- **PREMIUM_USER**：高級用戶，可以創建和發布活動，使用H5P功能
- **TEACHER**：教師用戶，擁有高級用戶的所有權限，並可以管理學生
- **ADMIN**：管理員，擁有所有權限，包括用戶管理

### 權限管理

權限系統基於以下原則：

1. 每個操作都有一個對應的權限常量（例如 `CREATE_ACTIVITY`）
2. 每個角色都有一組預定義的權限
3. 中間件用於保護API端點，確保只有具有適當權限的用戶才能訪問

### 使用權限系統

#### 在API中使用

```typescript
// 使用權限中間件保護API端點
import { withPermission } from '../middleware/withAuth';
import { PERMISSIONS } from '../lib/permissions';

// 只有具有CREATE_ACTIVITY權限的用戶才能訪問此API
export default withPermission(PERMISSIONS.CREATE_ACTIVITY, handler);
```

#### 在前端使用

```tsx
// 使用usePermission hook檢查權限
import { usePermission } from '../hooks/usePermission';

function MyComponent() {
  const { checkPermission, PERMISSIONS } = usePermission();
  
  // 檢查用戶是否有創建活動的權限
  const canCreateActivity = checkPermission(PERMISSIONS.CREATE_ACTIVITY);
  
  return (
    <div>
      {canCreateActivity && (
        <button>創建新活動</button>
      )}
    </div>
  );
}
```

#### 保護路由

```tsx
// 使用ProtectedRoute組件保護頁面
import ProtectedRoute from '../components/ProtectedRoute';
import { PERMISSIONS } from '../lib/permissions';

function CreateActivityPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_ACTIVITY}>
      {/* 頁面內容 */}
    </ProtectedRoute>
  );
}
```

## 開發路線圖

- [x] 基礎架構設置
- [x] 數據庫模型設計
- [ ] 用戶認證系統
- [ ] 活動編輯器
- [ ] 模板系統
- [ ] 支付整合
- [ ] H5P支持
- [ ] 部署流程

## 許可證

MIT