# Phase 6: 測試和優化 - 實施計劃

## 📋 概述

Phase 6 將進行全面的測試和性能優化，確保系統的穩定性、性能和可訪問性。

---

## 🎯 任務列表

### 6.1 單元測試 ⏳
- API 路由測試
- 組件測試
- 工具函數測試

### 6.2 E2E 測試 ⏳
- 圖片上傳流程
- 圖片搜索流程
- 圖片編輯流程

### 6.3 性能優化 ⏳
- 圖片懶加載
- CDN 緩存優化
- 代碼分割

### 6.4 可訪問性測試 ⏳
- 鍵盤導航測試
- 屏幕閱讀器測試
- 顏色對比度測試

---

## 🧪 6.1 單元測試

### 測試框架

**推薦工具**:
- **Jest**: JavaScript 測試框架
- **React Testing Library**: React 組件測試
- **Supertest**: API 測試

### API 路由測試

**測試文件**: `__tests__/api/images/upload.test.ts`

```typescript
import { POST } from '@/app/api/images/upload/route';

describe('POST /api/images/upload', () => {
  it('should upload image successfully', async () => {
    // 測試邏輯
  });

  it('should reject invalid file type', async () => {
    // 測試邏輯
  });

  it('should reject file too large', async () => {
    // 測試邏輯
  });

  it('should require authentication', async () => {
    // 測試邏輯
  });
});
```

**測試覆蓋**:
- ✅ 成功上傳
- ✅ 文件類型驗證
- ✅ 文件大小驗證
- ✅ 身份驗證
- ✅ 錯誤處理

### 組件測試

**測試文件**: `__tests__/components/ImagePicker.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ImagePicker from '@/components/image-picker';

describe('ImagePicker', () => {
  it('should render three tabs', () => {
    render(<ImagePicker onSelect={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('上傳')).toBeInTheDocument();
    expect(screen.getByText('圖片庫')).toBeInTheDocument();
  });

  it('should switch tabs', () => {
    // 測試邏輯
  });

  it('should select image', () => {
    // 測試邏輯
  });
});
```

**測試覆蓋**:
- ✅ 組件渲染
- ✅ 標籤切換
- ✅ 圖片選擇
- ✅ 搜索功能
- ✅ 上傳功能

---

## 🔄 6.2 E2E 測試

### 測試框架

**推薦工具**:
- **Playwright**: E2E 測試框架
- **Cypress**: 替代方案

### 圖片上傳流程測試

**測試文件**: `e2e/image-upload.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete image upload flow', async ({ page }) => {
  // 1. 登入
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. 打開 ImagePicker
  await page.goto('/create');
  await page.click('button:has-text("選擇圖片")');

  // 3. 切換到上傳標籤
  await page.click('button:has-text("上傳")');

  // 4. 上傳圖片
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-image.jpg');

  // 5. 等待上傳完成
  await page.waitForSelector('.upload-success');

  // 6. 驗證圖片顯示
  const image = await page.locator('img[alt="test-image.jpg"]');
  await expect(image).toBeVisible();
});
```

**測試場景**:
- ✅ 完整上傳流程
- ✅ 批量上傳
- ✅ 拖放上傳
- ✅ 錯誤處理

### 圖片搜索流程測試

**測試文件**: `e2e/image-search.spec.ts`

```typescript
test('search Unsplash images', async ({ page }) => {
  // 1. 打開 ImagePicker
  await page.goto('/create');
  await page.click('button:has-text("選擇圖片")');

  // 2. 搜索圖片
  await page.fill('input[placeholder="搜索圖片..."]', 'cat');
  await page.click('button:has-text("搜索")');

  // 3. 等待結果
  await page.waitForSelector('.image-grid');

  // 4. 驗證結果
  const images = await page.locator('.image-grid img');
  await expect(images).toHaveCount(20);
});
```

### 圖片編輯流程測試

**測試文件**: `e2e/image-edit.spec.ts`

```typescript
test('edit image', async ({ page }) => {
  // 1. 選擇圖片
  await page.goto('/images');
  await page.click('.image-card:first-child');

  // 2. 打開編輯器
  await page.click('button:has-text("編輯")');

  // 3. 裁剪圖片
  await page.click('button:has-text("裁剪")');

  // 4. 應用濾鏡
  await page.selectOption('select[name="filter"]', 'grayscale');

  // 5. 保存
  await page.click('button:has-text("保存")');

  // 6. 驗證保存成功
  await page.waitForSelector('.save-success');
});
```

---

## ⚡ 6.3 性能優化

### 圖片懶加載

**實施方案**:
```typescript
import { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : '/placeholder.jpg'}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### CDN 緩存優化

**Vercel Blob CDN 配置**:
```typescript
// 設置 Cache-Control headers
export async function GET(request: Request) {
  const imageUrl = '...';
  
  return new Response(imageUrl, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

### 代碼分割

**動態導入**:
```typescript
import dynamic from 'next/dynamic';

const ImageEditor = dynamic(() => import('@/components/image-editor'), {
  loading: () => <div>載入中...</div>,
  ssr: false,
});

const ImagePicker = dynamic(() => import('@/components/image-picker'), {
  loading: () => <div>載入中...</div>,
});
```

---

## ♿ 6.4 可訪問性測試

### 鍵盤導航測試

**測試清單**:
- [ ] Tab 鍵可以導航所有可交互元素
- [ ] Enter 鍵可以激活按鈕
- [ ] Escape 鍵可以關閉對話框
- [ ] 箭頭鍵可以導航圖片網格

**實施方案**:
```typescript
function ImageGrid({ images }: { images: Image[] }) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
        // 移動到下一張圖片
        break;
      case 'ArrowLeft':
        // 移動到上一張圖片
        break;
      case 'Enter':
        // 選擇圖片
        break;
    }
  };

  return (
    <div role="grid">
      {images.map((image, index) => (
        <div
          key={image.id}
          role="gridcell"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          <img src={image.url} alt={image.alt} />
        </div>
      ))}
    </div>
  );
}
```

### 屏幕閱讀器測試

**ARIA 屬性**:
```typescript
<button
  aria-label="上傳圖片"
  aria-describedby="upload-help"
>
  上傳
</button>

<div id="upload-help" className="sr-only">
  點擊選擇圖片文件，或拖放圖片到此區域
</div>
```

### 顏色對比度測試

**工具**:
- Chrome DevTools Lighthouse
- axe DevTools
- WAVE

**標準**:
- WCAG AA: 對比度至少 4.5:1
- WCAG AAA: 對比度至少 7:1

---

## 📊 性能指標

### 目標指標

**加載性能**:
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s

**運行時性能**:
- 圖片上傳: < 3s (10MB)
- 圖片搜索: < 1s
- 圖片編輯: < 2s

**可訪問性**:
- Lighthouse Accessibility Score: > 90

---

## 🔧 實施步驟

### Week 1: 單元測試
- Day 1-2: 設置測試環境
- Day 3-4: API 路由測試
- Day 5-6: 組件測試
- Day 7: 測試覆蓋率報告

### Week 2: E2E 測試和優化
- Day 1-2: E2E 測試
- Day 3-4: 性能優化
- Day 5-6: 可訪問性測試
- Day 7: 最終驗收

---

## 📖 相關資源

### 測試工具
- **Jest**: https://jestjs.io/
- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev/
- **Cypress**: https://www.cypress.io/

### 性能工具
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **Chrome DevTools**: https://developer.chrome.com/docs/devtools/

### 可訪問性工具
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/
- **NVDA**: https://www.nvaccess.org/

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-21  
**維護者**: EduCreate Team

