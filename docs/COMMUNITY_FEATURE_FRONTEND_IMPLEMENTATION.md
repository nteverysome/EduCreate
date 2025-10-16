# EduCreate 社區功能前端實施方案

## 📋 文檔目的

本文檔提供 EduCreate 社區功能的前端實施細節，包括：
- 完整的組件結構
- 狀態管理策略
- 路由設計
- UI/UX 實現細節
- 分階段實施計畫

---

## 🎨 前端架構設計

### 1. 頁面結構

```
app/
├── community/
│   ├── page.tsx                    # 社區首頁
│   ├── activity/
│   │   └── [shareToken]/
│   │       └── page.tsx            # 活動詳情頁
│   ├── author/
│   │   └── [authorId]/
│   │       └── page.tsx            # 作者頁面
│   └── search/
│       └── page.tsx                # 搜尋結果頁
│
components/
├── community/
│   ├── CommunityActivityCard.tsx   # 活動卡片組件
│   ├── CommunityActivityGrid.tsx   # 活動網格組件
│   ├── CommunityFilters.tsx        # 篩選器組件
│   ├── CommunitySearchBar.tsx      # 搜尋欄組件
│   ├── ActivityDetailView.tsx      # 活動詳情組件
│   ├── ActivityStats.tsx           # 統計信息組件
│   ├── ActivityActions.tsx         # 操作按鈕組件（喜歡、收藏、分享）
│   ├── ActivityComments.tsx        # 評論列表組件
│   ├── CommentForm.tsx             # 評論表單組件
│   ├── AuthorCard.tsx              # 作者卡片組件
│   └── PublishToCommunityModal.tsx # 發布到社區的對話框
```

### 2. 狀態管理策略

#### 使用 React Context + Hooks

```typescript
// contexts/CommunityContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface CommunityContextType {
  // 活動列表狀態
  activities: Activity[];
  loading: boolean;
  error: string | null;
  
  // 篩選和分頁
  filters: CommunityFilters;
  pagination: Pagination;
  
  // 操作方法
  loadActivities: () => Promise<void>;
  setFilters: (filters: CommunityFilters) => void;
  setPage: (page: number) => void;
  likeActivity: (activityId: string) => Promise<void>;
  bookmarkActivity: (activityId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CommunityFilters>({
    category: '',
    tags: [],
    sortBy: 'latest',
    search: '',
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.tags.length > 0 && { tags: filters.tags.join(',') }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/community/activities?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities);
        setPagination(data.pagination);
      } else {
        setError(data.error || '載入失敗');
      }
    } catch (err) {
      setError('網絡錯誤');
      console.error('載入社區活動失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  const likeActivity = useCallback(async (activityId: string) => {
    try {
      const response = await fetch(`/api/community/activities/${activityId}/like`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // 更新本地狀態
        setActivities(prev => prev.map(activity => 
          activity.id === activityId
            ? { ...activity, stats: { ...activity.stats, likes: data.totalLikes } }
            : activity
        ));
      }
    } catch (err) {
      console.error('喜歡活動失敗:', err);
    }
  }, []);

  const bookmarkActivity = useCallback(async (activityId: string) => {
    try {
      const response = await fetch(`/api/community/activities/${activityId}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // 更新本地狀態
        setActivities(prev => prev.map(activity => 
          activity.id === activityId
            ? { ...activity, stats: { ...activity.stats, bookmarks: data.totalBookmarks } }
            : activity
        ));
      }
    } catch (err) {
      console.error('收藏活動失敗:', err);
    }
  }, []);

  return (
    <CommunityContext.Provider
      value={{
        activities,
        loading,
        error,
        filters,
        pagination,
        loadActivities,
        setFilters,
        setPage: (page) => setPagination(prev => ({ ...prev, page })),
        likeActivity,
        bookmarkActivity,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
```

### 3. 社區首頁實現 (app/community/page.tsx)

```typescript
'use client';

import { useEffect } from 'react';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import CommunityActivityGrid from '@/components/community/CommunityActivityGrid';
import CommunityFilters from '@/components/community/CommunityFilters';
import CommunitySearchBar from '@/components/community/CommunitySearchBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function CommunityPageContent() {
  const {
    activities,
    loading,
    error,
    filters,
    pagination,
    loadActivities,
    setFilters,
    setPage,
  } = useCommunity();

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">社區活動</h1>
          <p className="mt-2 text-gray-600">
            探索教師們分享的精彩學習活動
          </p>
        </div>
      </div>

      {/* 搜尋欄 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunitySearchBar
          value={filters.search}
          onChange={(search) => setFilters({ ...filters, search })}
        />
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* 側邊欄篩選器 */}
          <div className="hidden lg:block lg:col-span-1">
            <CommunityFilters
              filters={filters}
              onChange={setFilters}
            />
          </div>

          {/* 活動網格 */}
          <div className="lg:col-span-3">
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}
            {!loading && !error && (
              <CommunityActivityGrid
                activities={activities}
                pagination={pagination}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <CommunityProvider>
      <CommunityPageContent />
    </CommunityProvider>
  );
}
```

### 4. 活動卡片組件 (components/community/CommunityActivityCard.tsx)

```typescript
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { HeartIcon, BookmarkIcon, PlayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface CommunityActivityCardProps {
  activity: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    tags: string[];
    gameType: string;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
    stats: {
      views: number;
      likes: number;
      bookmarks: number;
      plays: number;
    };
    shareUrl: string;
  };
}

export default function CommunityActivityCard({ activity }: CommunityActivityCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localStats, setLocalStats] = useState(activity.stats);

  const handleLike = async () => {
    if (!session) {
      // 提示用戶登入
      alert('請先登入');
      return;
    }

    try {
      const response = await fetch(`/api/community/activities/${activity.id}/like`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsLiked(data.liked);
        setLocalStats(prev => ({ ...prev, likes: data.totalLikes }));
      }
    } catch (error) {
      console.error('喜歡活動失敗:', error);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      alert('請先登入');
      return;
    }

    try {
      const response = await fetch(`/api/community/activities/${activity.id}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsBookmarked(data.bookmarked);
        setLocalStats(prev => ({ ...prev, bookmarks: data.totalBookmarks }));
      }
    } catch (error) {
      console.error('收藏活動失敗:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 縮圖 */}
      <Link href={activity.shareUrl}>
        <div className="relative h-48 bg-gray-100 cursor-pointer">
          {activity.thumbnailUrl ? (
            <Image
              src={activity.thumbnailUrl}
              alt={activity.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PlayIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
          {/* 遊戲類型標籤 */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {activity.gameType}
          </div>
        </div>
      </Link>

      {/* 內容 */}
      <div className="p-4">
        {/* 標題 */}
        <Link href={activity.shareUrl}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 cursor-pointer">
            {activity.title}
          </h3>
        </Link>

        {/* 作者 */}
        <Link href={`/community/author/${activity.author.id}`}>
          <div className="flex items-center mt-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            {activity.author.image ? (
              <Image
                src={activity.author.image}
                alt={activity.author.name}
                width={20}
                height={20}
                className="rounded-full mr-2"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-300 mr-2" />
            )}
            <span>由 {activity.author.name}</span>
          </div>
        </Link>

        {/* 分類和標籤 */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            {activity.category}
          </span>
          {activity.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {activity.tags.length > 2 && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              +{activity.tags.length - 2}
            </span>
          )}
        </div>

        {/* 統計和操作 */}
        <div className="mt-4 flex items-center justify-between">
          {/* 統計 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              <span>{localStats.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayIcon className="w-4 h-4" />
              <span>{localStats.plays}</span>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-600" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{localStats.likes}</span>
            </button>
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-5 h-5 text-blue-600" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```


