# EduCreate 代碼修復示例

本文檔提供了針對發現問題的具體代碼修復示例，開發團隊可以直接參考這些示例進行實施。

## 1. 搜索頁面狀態管理修復

### 修改 pages/search.tsx

```typescript
// 修改前
useEffect(() => {
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      // ... 其他參數設置 ...
      
      // 發送API請求
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`搜索請求失敗: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ... 處理數據 ...
      
      setActivities(formattedActivities);
      setAvailableTags(Array.from(tags));
      setIsLoading(false);
    } catch (error) {
      console.error('獲取活動失敗:', error);
      setIsLoading(false);
    }
  };

  fetchActivities();
}, [searchQuery, selectedTags, selectedType, sortBy]);

// 修改後
useEffect(() => {
  const fetchActivities = async () => {
    try {
      // 在發起新搜索前設置加載狀態
      setIsLoading(true);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      // ... 其他參數設置 ...
      
      // 如果有選擇標籤，使用高級搜索API
      let endpoint = '/api/search';
      if (selectedTags.length > 0) {
        endpoint = '/api/search/advanced';
        params.append('tags', selectedTags.join(','));
      }
      
      // 發送API請求
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`搜索請求失敗: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ... 處理數據 ...
      
      setActivities(formattedActivities);
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('獲取活動失敗:', error);
      // 添加用戶友好的錯誤提示
      setError('搜索過程中發生錯誤，請稍後再試');
    } finally {
      // 確保無論成功或失敗都重置加載狀態
      setIsLoading(false);
    }
  };

  fetchActivities();
}, [searchQuery, selectedTags, selectedType, sortBy]);
```

## 2. H5P組件路徑引用修復

### 添加環境變量

在 `.env.example` 和 `.env.prod.example` 中添加：

```
NEXT_PUBLIC_H5P_BASE_PATH=""
```

### 修改 components/H5P/H5PEmbed.jsx

```jsx
// 修改前
useEffect(() => {
  // 確保H5P庫已加載
  if (typeof window !== 'undefined' && window.H5P && containerRef.current) {
    // 清除之前的實例
    if (h5pInstanceRef.current) {
      h5pInstanceRef.current.remove();
    }

    // 初始化H5P內容
    try {
      const h5pPath = `${contentPath}/${contentId}`;
      
      // 使用H5P Standalone庫加載內容
      h5pInstanceRef.current = new window.H5P.Standalone(
        containerRef.current,
        {
          h5pJsonPath: `${h5pPath}/h5p.json`,
          librariesPath: '/h5p/libraries',
          contentPath: h5pPath,
          frameCss: '/h5p/styles/h5p.css',
          frameJs: '/h5p/js/h5p-standalone-frame.js'
        }
      );
    } catch (error) {
      console.error('H5P內容加載失敗:', error);
    }
  }

  // 組件卸載時清理
  return () => {
    if (h5pInstanceRef.current) {
      h5pInstanceRef.current.remove();
    }
  };
}, [contentId, contentPath]);

// 修改後
const h5pBasePath = process.env.NEXT_PUBLIC_H5P_BASE_PATH || '';

useEffect(() => {
  // 確保H5P庫已加載
  if (typeof window !== 'undefined' && window.H5P && containerRef.current) {
    // 清除之前的實例
    if (h5pInstanceRef.current) {
      h5pInstanceRef.current.remove();
    }

    // 初始化H5P內容
    try {
      const h5pPath = `${contentPath}/${contentId}`;
      
      // 使用H5P Standalone庫加載內容，添加基礎路徑
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
    } catch (error) {
      console.error('H5P內容加載失敗:', error);
    }
  }

  // 組件卸載時清理
  return () => {
    if (h5pInstanceRef.current) {
      h5pInstanceRef.current.remove();
    }
  };
}, [contentId, contentPath, h5pBasePath]);
```

## 3. 支付API路徑不匹配修復

### 創建 pages/api/payments/index.ts

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * 支付API入口點
 * 提供支付相關API的基本信息
 */
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
      ],
      user: {
        id: session.user.id,
        hasActiveSubscription: session.user.hasSubscription || false
      }
    });
  } catch (error) {
    console.error('支付API錯誤:', error);
    return res.status(500).json({ error: '內部服務器錯誤' });
  }
}
```

### 確認 components/Payment/StripeSubscription.jsx 中的API路徑

```jsx
// 確認API路徑正確
const response = await fetch('/api/payments/create-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentMethodId: paymentMethod.id,
    planId: selectedPlan.id,
    customerId: session.user.stripeCustomerId
  })
});
```

## 4. 搜索API路徑不一致修復

### 確保 pages/api/search/advanced.ts 中的標籤處理邏輯正確

```typescript
// 檢查標籤處理邏輯
if (tags && typeof tags === 'string') {
  const tagList = tags.split(',').map(tag => tag.trim());
  where.tags = {
    hasSome: tagList
  };
}
```

## 測試代碼

### 添加搜索功能的單元測試

```jsx
// __tests__/pages/search.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Search from '../../pages/search';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Search Page', () => {
  beforeEach(() => {
    // 模擬已登入用戶
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });
    
    // 重置fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  it('should show loading state when searching', async () => {
    // 模擬API響應
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activities: [] }),
    });

    render(<Search />);
    
    // 輸入搜索關鍵詞
    const searchInput = screen.getByPlaceholderText('輸入關鍵詞搜索活動...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // 檢查加載狀態
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // 等待搜索完成
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/search?query=test'));
    });
  });

  it('should use advanced search API when tags are selected', async () => {
    // 模擬API響應
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        activities: [{
          id: '1',
          title: 'Test Activity',
          templateType: 'QUIZ',
          createdAt: new Date().toISOString(),
          published: true,
          author: { id: '1', name: 'Author' },
          tags: ['tag1', 'tag2']
        }] 
      }),
    });

    render(<Search />);
    
    // 選擇標籤
    const tagButton = screen.getByText('tag1');
    fireEvent.click(tagButton);
    
    // 等待搜索完成
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/search/advanced?tags=tag1'));
    });
  });
});
```

這些代碼修復示例提供了具體的實施指導，開發團隊可以根據這些示例進行修改，解決EduCreate項目中的問題。每個修復都包含了修改前和修改後的代碼對比，以便清楚地了解需要進行的更改。