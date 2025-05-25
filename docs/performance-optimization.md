# EduCreate 性能優化實施方案

## 1. 代碼分割 (Code Splitting)

### 實現方式

在 Next.js 中，我們可以通過以下方式實現代碼分割：

#### 1.1 動態導入 (Dynamic Imports)

```jsx
import dynamic from 'next/dynamic';

// 替代靜態導入
// import HeavyComponent from '../components/HeavyComponent';

// 使用動態導入
const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: true, // 設置為 false 可以禁用服務器端渲染
});
```

#### 1.2 路由級別代碼分割

Next.js 已經在路由級別實現了自動代碼分割，每個頁面都會被打包為獨立的 JavaScript 文件。

#### 1.3 組件懶加載

對於大型組件或不在首屏的組件，可以使用懶加載：

```jsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('../components/LazyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 實施計劃

1. 識別大型組件和不在首屏的組件
2. 將編輯器相關組件改為動態導入
3. 將遊戲模板組件改為動態導入
4. 將 H5P 相關組件改為動態導入

## 2. 圖片和資源優化

### 實現方式

#### 2.1 使用 Next.js Image 組件

```jsx
import Image from 'next/image';

// 替代標準 img 標籤
// <img src="/large-image.jpg" alt="Description" />

// 使用優化的 Image 組件
<Image 
  src="/large-image.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={true} // 對於首屏圖片
/>
```

#### 2.2 圖片格式和壓縮

- 使用 WebP 或 AVIF 格式替代 JPEG 和 PNG
- 使用 Cloudinary 或類似服務進行自動圖片優化
- 實施響應式圖片加載

#### 2.3 字體優化

```jsx
// 在 _document.js 中預加載字體
<link
  rel="preload"
  href="/fonts/my-font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

#### 2.4 CSS 和 JavaScript 優化

- 使用 PurgeCSS 移除未使用的 CSS
- 最小化和壓縮 CSS 和 JavaScript 文件

### 實施計劃

1. 將所有 `<img>` 標籤替換為 Next.js 的 `<Image>` 組件
2. 配置 Cloudinary 或類似服務進行圖片優化
3. 優化字體加載
4. 配置 CSS 和 JavaScript 的最小化和壓縮

## 3. 緩存策略

### 實現方式

#### 3.1 API 路由緩存

```jsx
// 在 API 路由中實現緩存
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=59');
  
  // 處理請求...
  
  res.status(200).json(data);
}
```

#### 3.2 靜態生成與增量靜態再生成 (ISR)

```jsx
// 在頁面組件中使用 ISR
export async function getStaticProps() {
  const data = await fetchData();
  
  return {
    props: { data },
    revalidate: 60, // 每 60 秒重新生成頁面
  };
}

export async function getStaticPaths() {
  // ...
  return {
    paths,
    fallback: 'blocking', // 或 true
  };
}
```

#### 3.3 服務工作者 (Service Worker)

使用 `next-pwa` 包實現 PWA 功能和離線緩存。

#### 3.4 瀏覽器緩存策略

配置適當的 HTTP 緩存頭：

```js
// 在 next.config.js 中配置
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 實施計劃

1. 為 API 路由添加適當的緩存控制頭
2. 將適合的頁面轉換為靜態生成或 ISR
3. 實現 Service Worker 進行資源緩存
4. 配置 HTTP 緩存頭

## 4. 數據庫查詢優化

### 實現方式

#### 4.1 優化 Prisma 查詢

```js
// 優化前
const activities = await prisma.activity.findMany({
  include: {
    user: true,
    templates: true,
    versions: true,
  },
});

// 優化後
const activities = await prisma.activity.findMany({
  select: {
    id: true,
    title: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        name: true,
      },
    },
  },
  take: 10,
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### 4.2 實現數據庫索引

```prisma
// 在 schema.prisma 中添加索引
model Activity {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([createdAt])
}
```

#### 4.3 實現查詢緩存

使用 Redis 或內存緩存來存儲頻繁訪問的數據。

```js
import { createClient } from 'redis';

const redis = createClient();

async function getActivities() {
  // 嘗試從緩存獲取
  const cachedData = await redis.get('recent_activities');
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // 如果緩存中沒有，從數據庫獲取
  const activities = await prisma.activity.findMany({
    // 查詢選項...
  });
  
  // 存入緩存
  await redis.set('recent_activities', JSON.stringify(activities), {
    EX: 300, // 5 分鐘過期
  });
  
  return activities;
}
```

#### 4.4 批量操作優化

```js
// 優化前
for (const item of items) {
  await prisma.item.create({ data: item });
}

// 優化後
await prisma.item.createMany({ data: items });
```

### 實施計劃

1. 審查並優化現有 Prisma 查詢
2. 為頻繁查詢的字段添加數據庫索引
3. 實現 Redis 緩存層
4. 將循環操作改為批量操作

## 5. 服務器端渲染優化

### 實現方式

#### 5.1 選擇適當的渲染策略

- **靜態生成 (SSG)**：適用於內容不常變化的頁面
- **服務器端渲染 (SSR)**：適用於需要實時數據的頁面
- **增量靜態再生成 (ISR)**：結合 SSG 和 SSR 的優點
- **客戶端渲染 (CSR)**：適用於高度交互的頁面

#### 5.2 流式 SSR

在 Next.js 13+ 中使用 React 18 的流式 SSR：

```jsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <h1>My Page</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <SlowComponent />
      </Suspense>
    </>
  );
}
```

#### 5.3 優化 getServerSideProps

```jsx
export async function getServerSideProps() {
  // 並行獲取數據
  const [userData, activityData] = await Promise.all([
    fetchUserData(),
    fetchActivityData(),
  ]);
  
  return {
    props: {
      userData,
      activityData,
    },
  };
}
```

#### 5.4 使用 Edge Runtime

```jsx
export const config = {
  runtime: 'edge',
};

export default function Page() {
  // ...
}
```

### 實施計劃

1. 審查所有頁面並選擇最適合的渲染策略
2. 實現 Suspense 和流式 SSR
3. 優化 getServerSideProps 和 getStaticProps
4. 將適合的 API 路由遷移到 Edge Runtime

## 實施時間表

1. **第一週**：實現代碼分割和圖片資源優化
2. **第二週**：實現緩存策略
3. **第三週**：優化數據庫查詢
4. **第四週**：優化服務器端渲染

## 性能指標

- **首次內容繪製 (FCP)**：< 1.8 秒
- **最大內容繪製 (LCP)**：< 2.5 秒
- **首次輸入延遲 (FID)**：< 100 毫秒
- **累積布局偏移 (CLS)**：< 0.1
- **總阻塞時間 (TBT)**：< 300 毫秒

## 監控工具

- Lighthouse
- Web Vitals
- Sentry Performance
- Prometheus + Grafana