# EduCreate 錯誤修復方案

根據代碼分析，我發現了幾個需要修復的問題。以下是具體的修復方案和代碼實現。

## 1. 搜索API路徑不一致問題

### 問題描述
在`search.tsx`中，當用戶選擇標籤進行過濾時，代碼使用`/api/search/advanced`端點，但這個端點的實現可能不完整。

### 修復方案
確保前端和後端的API路徑一致，並完善高級搜索API的實現。

```typescript
// 修改 pages/search.tsx 中的API調用邏輯
let endpoint = '/api/search';
if (selectedTags.length > 0) {
  // 確保API路徑一致
  endpoint = '/api/search/advanced';
  // 使用正確的參數格式
  params.append('tags', selectedTags.join(','));
}

// 發送API請求前設置加載狀態
setIsLoading(true);
const response = await fetch(`${endpoint}?${params.toString()}`);
```

## 2. H5P組件路徑引用問題

### 問題描述
H5PEmbed.jsx組件使用固定路徑加載H5P資源，這在不同環境中可能導致問題。

### 修復方案
使用環境變量來設置H5P資源的基礎路徑。

```jsx
// 修改 components/H5P/H5PEmbed.jsx

// 添加基礎路徑配置
const h5pBasePath = process.env.NEXT_PUBLIC_H5P_BASE_PATH || '';

// 在初始化H5P內容時使用
h5pInstanceRef.current = new window.H5P.Standalone(
  containerRef.current,
  {
    h5pJsonPath: `${h5pBasePath}${h5pPath}/h5p.json`,
    librariesPath: `${h5pBasePath}/h5p/libraries`,
    contentPath: `${h5pBasePath}${h5pPath}`,
    frameCss: `${h5pBasePath}/h5p/styles/h5p.css`,
    frameJs: `${h5pBasePath}/h5p/js/h5p-standalone-frame.js`
  }
);
```

## 3. 支付API路徑不匹配問題

### 問題描述
在StripeSubscription.jsx中，API請求發送到`/api/payments/create-subscription`，但項目中缺少相應的入口點文件。

### 修復方案
創建缺失的API入口點文件，確保前後端路徑一致。

```typescript
// 創建 pages/api/payments/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    // 返回支付相關的基本信息
    return res.status(200).json({
      message: '支付API入口點',
      endpoints: [
        '/api/payments/create-subscription',
        '/api/payments/cancel-subscription',
        '/api/payments/update-payment-method'
      ]
    });
  } catch (error) {
    console.error('支付API錯誤:', error);
    return res.status(500).json({ error: '內部服務器錯誤' });
  }
}
```

## 4. 搜索頁面狀態管理問題

### 問題描述
搜索頁面在條件變更時沒有適當的加載狀態管理，可能導致用戶體驗問題。

### 修復方案
改進搜索頁面的狀態管理，確保在每次搜索時正確設置加載狀態。

```typescript
// 修改 pages/search.tsx 中的useEffect
useEffect(() => {
  const fetchActivities = async () => {
    try {
      // 在發起新搜索前設置加載狀態
      setIsLoading(true);
      
      // 構建查詢參數...
      
      // 發送API請求...
      
      // 處理結果...
      
    } catch (error) {
      console.error('獲取活動失敗:', error);
      // 添加錯誤處理和用戶反饋
    } finally {
      // 確保無論成功或失敗都重置加載狀態
      setIsLoading(false);
    }
  };

  fetchActivities();
}, [searchQuery, selectedTags, selectedType, sortBy]);
```

## 實施計劃

1. 首先修復搜索頁面狀態管理問題，因為這是用戶體驗的直接改進
2. 然後解決H5P組件路徑問題，確保在不同環境中正常工作
3. 接著創建缺失的支付API入口點文件
4. 最後確保搜索API路徑一致性

完成這些修復後，應進行全面測試，確保所有功能正常工作，特別是搜索、H5P內容顯示和支付流程。