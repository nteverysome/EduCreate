'use client';

/**
 * 社區首頁
 *
 * 顯示社區活動列表，支援：
 * - 篩選（分類、標籤、精選）
 * - 搜尋
 * - 排序（熱門、最新、受歡迎、瀏覽）
 * - 分頁
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CommunityActivityCard from '@/components/community/CommunityActivityCard';
import CommunityFilters, { FilterState } from '@/components/community/CommunityFilters';
import { FormattedCommunityActivity } from '@/lib/community/utils';
import { Loader2 } from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<FormattedCommunityActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // 從 URL 參數初始化篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as any) || 'trending',
    featured: searchParams.get('featured') === 'true',
  });

  // 載入活動列表
  const loadActivities = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // 構建查詢參數
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());

      if (filters.category) params.set('category', filters.category);
      if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      if (filters.search) params.set('search', filters.search);
      if (filters.featured) params.set('featured', 'true');
      params.set('sortBy', filters.sortBy);

      // 更新 URL
      router.push(`/community?${params.toString()}`, { scroll: false });

      // 發送請求
      const response = await fetch(`/api/community/activities?${params.toString()}`);

      if (!response.ok) {
        throw new Error('載入活動失敗');
      }

      const data = await response.json();

      setActivities(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('載入活動失敗:', err);
      setError(err instanceof Error ? err.message : '載入活動失敗');
    } finally {
      setLoading(false);
    }
  };

  // 當篩選條件改變時重新載入
  useEffect(() => {
    loadActivities(1);
  }, [filters]);

  // 處理篩選變更
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // 處理分頁
  const handlePageChange = (newPage: number) => {
    loadActivities(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer">
              🌟 EduCreate 社區
            </h1>
          </Link>
          <p className="text-xl text-gray-600">
            探索教育者分享的精彩學習活動
          </p>
        </div>

        {/* 篩選組件 */}
        <CommunityFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />

        {/* 載入狀態 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        )}

        {/* 錯誤狀態 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => loadActivities(pagination.page)}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              重試
            </button>
          </div>
        )}

        {/* 活動列表 */}
        {!loading && !error && (
          <>
            {activities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  沒有找到活動
                </h3>
                <p className="text-gray-600 mb-6">
                  試試調整篩選條件或搜尋關鍵字
                </p>
                <button
                  onClick={() => handleFilterChange({
                    tags: [],
                    search: '',
                    sortBy: 'trending',
                    featured: false,
                  })}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  清除篩選
                </button>
              </div>
            ) : (
              <>
                {/* 結果統計 */}
                <div className="mb-4 text-sm text-gray-600">
                  找到 <span className="font-semibold text-gray-900">{pagination.total}</span> 個活動
                </div>

                {/* 活動網格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {activities.map((activity) => (
                    <CommunityActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>

                {/* 分頁 */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一頁
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              pagination.page === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasMore}
                      className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一頁
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
