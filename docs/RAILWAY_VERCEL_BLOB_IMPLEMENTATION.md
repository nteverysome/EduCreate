# Railway 截圖服務 + Vercel Blob Storage 實施方案

## 📋 方案概述

### 架構
```
用戶創建活動
   ↓
EduCreate API 調用 Railway 截圖服務
   ↓
Railway 使用 Puppeteer 截圖
   ↓
Railway 返回截圖（PNG Buffer）
   ↓
EduCreate API 上傳到 Vercel Blob
   ↓
Vercel Blob 返回 CDN URL
   ↓
EduCreate 保存 URL 到資料庫
   ↓
活動卡片顯示 Vercel Blob CDN 圖片
```

### 成本
- **Railway**：$5/月
- **Vercel Blob**：免費（1 GB）
- **總成本**：$5/月

### 優點
- ✅ 穩定可靠（無冷啟動）
- ✅ 性能優秀（24/7 運行）
- ✅ 簡單整合（與 EduCreate 同平台）
- ✅ 成本合理（$5/月）
- ✅ 可擴展（支援 3.3 萬張圖片）

---

## 🚀 實施步驟

### 階段 1：創建 Railway 截圖服務（1 小時）

#### 1.1 創建項目結構
```bash
mkdir screenshot-service
cd screenshot-service
npm init -y
npm install express puppeteer
```

#### 1.2 創建服務代碼
```javascript
// screenshot-service/index.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 截圖端點
app.post('/screenshot', async (req, res) => {
  try {
    const { url, width = 400, height = 300 } = req.body;
    
    console.log(`截圖請求: ${url}`);
    
    // 啟動瀏覽器
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width, height });
    
    // 訪問頁面
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // 等待遊戲載入
    await page.waitForTimeout(2000);
    
    // 截圖
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });
    
    await browser.close();
    
    console.log(`截圖成功: ${screenshot.length} bytes`);
    
    // 返回截圖
    res.set('Content-Type', 'image/png');
    res.send(screenshot);
    
  } catch (error) {
    console.error('截圖失敗:', error);
    res.status(500).json({
      error: '截圖失敗',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`截圖服務運行在端口 ${PORT}`);
});
```

#### 1.3 創建 package.json
```json
{
  "name": "screenshot-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "puppeteer": "^21.0.0"
  }
}
```

---

### 階段 2：部署到 Railway（30 分鐘）

#### 2.1 推送代碼到 GitHub
```bash
git init
git add .
git commit -m "Initial commit: Railway screenshot service"
git remote add origin https://github.com/your-username/screenshot-service.git
git push -u origin main
```

#### 2.2 在 Railway 創建項目
1. 訪問 https://railway.app
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇 screenshot-service 倉庫
5. Railway 自動檢測並部署

#### 2.3 獲取服務 URL
- Railway 會自動生成 URL：`https://your-service.railway.app`
- 記錄此 URL，稍後需要配置到 EduCreate

---

### 階段 3：添加 thumbnailUrl 欄位（30 分鐘）

#### 3.1 修改 Prisma Schema
```prisma
// prisma/schema.prisma
model Activity {
  id              String   @id @default(cuid())
  title           String
  description     String?
  content         Json?
  elements        Json     @default("[]")
  type            String
  templateType    String?
  thumbnailUrl    String?  // 新增欄位
  // ... 其他欄位
}
```

#### 3.2 執行遷移
```bash
npx prisma db push
```

---

### 階段 4：安裝 Vercel Blob SDK（10 分鐘）

#### 4.1 安裝依賴
```bash
npm install @vercel/blob
```

#### 4.2 配置環境變數
```env
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
RAILWAY_SCREENSHOT_SERVICE_URL=https://your-service.railway.app
```

#### 4.3 獲取 Vercel Blob Token
1. 訪問 https://vercel.com/dashboard
2. 選擇 EduCreate 項目
3. 進入 Storage → Blob
4. 創建新的 Blob Store
5. 複製 Read/Write Token

---

### 階段 5：創建截圖生成 API（1 小時）

#### 5.1 創建 API Route
```typescript
// app/api/generate-screenshot/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { activityId } = await request.json();
    
    // 1. 獲取活動信息
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });
    
    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }
    
    // 2. 調用 Railway 截圖服務
    const screenshotUrl = `${process.env.RAILWAY_SCREENSHOT_SERVICE_URL}/screenshot`;
    const gameUrl = `${process.env.NEXTAUTH_URL}/play/${activityId}`;
    
    console.log(`請求截圖: ${gameUrl}`);
    
    const response = await fetch(screenshotUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: gameUrl,
        width: 400,
        height: 300
      })
    });
    
    if (!response.ok) {
      throw new Error(`截圖服務失敗: ${response.statusText}`);
    }
    
    const screenshot = await response.arrayBuffer();
    
    console.log(`截圖成功: ${screenshot.byteLength} bytes`);
    
    // 3. 上傳到 Vercel Blob
    const { url } = await put(
      `screenshots/${activityId}.png`,
      screenshot,
      {
        access: 'public',
        addRandomSuffix: false
      }
    );
    
    console.log(`上傳成功: ${url}`);
    
    // 4. 更新活動
    await prisma.activity.update({
      where: { id: activityId },
      data: { thumbnailUrl: url }
    });
    
    return NextResponse.json({
      success: true,
      url,
      activityId
    });
    
  } catch (error) {
    console.error('生成截圖失敗:', error);
    return NextResponse.json(
      {
        error: '生成截圖失敗',
        message: error.message
      },
      { status: 500 }
    );
  }
}
```

---

### 階段 6：修改活動卡片組件（30 分鐘）

#### 6.1 更新 WordwallStyleActivityCard
```typescript
// components/activities/WordwallStyleActivityCard.tsx
import { gamePreviewImages } from '@/lib/og/gamePreviewImages';

export function WordwallStyleActivityCard({ activity }) {
  const gameConfig = gamePreviewImages[activity.content?.gameTemplateId];
  
  // 優先使用 thumbnailUrl
  const thumbnailSrc = activity.thumbnailUrl || gameConfig?.previewImage;
  
  return (
    <div className="activity-card">
      <div className="thumbnail">
        <img
          src={thumbnailSrc}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>
      {/* ... 其他內容 */}
    </div>
  );
}
```

---

### 階段 7：整合到活動創建流程（30 分鐘）

#### 7.1 修改活動創建 API
```typescript
// app/api/activities/route.ts
export async function POST(request: NextRequest) {
  try {
    // ... 創建活動邏輯
    
    const activity = await prisma.activity.create({
      data: {
        title,
        content: { gameTemplateId, vocabularyItems },
        elements: vocabularyItems,
        // ... 其他欄位
      }
    });
    
    // 異步生成截圖（不阻塞響應）
    fetch(`${process.env.NEXTAUTH_URL}/api/generate-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId: activity.id })
    }).catch(error => {
      console.error('生成截圖失敗:', error);
    });
    
    return NextResponse.json({
      id: activity.id,
      title: activity.title,
      message: '活動創建成功'
    });
    
  } catch (error) {
    // ... 錯誤處理
  }
}
```

---

## 📊 實施時間表

| 階段 | 時間 | 任務 |
|------|------|------|
| 階段 1 | 1 小時 | 創建 Railway 截圖服務 |
| 階段 2 | 30 分鐘 | 部署到 Railway |
| 階段 3 | 30 分鐘 | 添加 thumbnailUrl 欄位 |
| 階段 4 | 10 分鐘 | 安裝 Vercel Blob SDK |
| 階段 5 | 1 小時 | 創建截圖生成 API |
| 階段 6 | 30 分鐘 | 修改活動卡片組件 |
| 階段 7 | 30 分鐘 | 整合到活動創建流程 |
| **總計** | **4.5 小時** | 完整實施 |

---

## ✅ 驗證清單

- [ ] Railway 服務成功部署
- [ ] Railway 服務健康檢查通過
- [ ] Prisma schema 更新完成
- [ ] Vercel Blob Token 配置完成
- [ ] 截圖生成 API 測試通過
- [ ] 活動卡片顯示截圖
- [ ] 完整流程測試通過

---

## 🎯 下一步

1. 開始實施階段 1：創建 Railway 截圖服務
2. 測試截圖服務
3. 繼續後續階段

**準備好開始了嗎？**

