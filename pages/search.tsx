import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SearchIcon, AdjustmentsIcon, FilterIcon, XIcon, ExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { networkMonitor, checkApiHealth } from '../lib/networkMonitor';

interface Activity {
  id: string;
  title: string;
  description?: string;
  templateType: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  author: {
    id: string;
    name: string;
  };
  tags?: string[];
  views?: number;
}

export default function Search() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{
    searchApiStatus: { connected: boolean; responseTime?: number; error?: string };
    advancedSearchApiStatus: { connected: boolean; responseTime?: number; error?: string };
    overallHealth: 'good' | 'degraded' | 'down';
    message: string;
  } | null>(null);
  const [showHealthStatus, setShowHealthStatus] = useState(false);

  // 所有可用標籤
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 檢查API健康狀態
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkApiHealth();
        setApiHealth(health);
        
        // 如果API狀態不佳，自動顯示健康狀態
        if (health.overallHealth !== 'good') {
          setShowHealthStatus(true);
        }
      } catch (error) {
        console.error('檢查API健康狀態失敗:', error);
      }
    };
    
    checkHealth();
  }, []);

  // 導入fetch工具函數
  import { get } from '../lib/fetch';

  // 獲取活動數據
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null); // 重置錯誤狀態
        
        // 構建查詢參數
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('query', searchQuery);
        }
        if (selectedType && selectedType !== 'all') {
          params.append('type', selectedType);
        }
        if (sortBy) {
          // 轉換排序選項為API參數
          const sortMapping: Record<string, {sort: string, order: string}> = {
            'newest': {sort: 'createdAt', order: 'desc'},
            'oldest': {sort: 'createdAt', order: 'asc'},
            'popular': {sort: 'views', order: 'desc'},
            'az': {sort: 'title', order: 'asc'},
            'za': {sort: 'title', order: 'desc'}
          };
          
          const sortOption = sortMapping[sortBy] || sortMapping['newest'];
          params.append('sort', sortOption.sort);
          params.append('order', sortOption.order);
        }
        
        // 如果有選擇標籤，使用高級搜索API
        let endpoint = '/api/search';
        if (selectedTags.length > 0) {
          endpoint = '/api/search/advanced';
          params.append('tags', selectedTags.join(','));
        }
        
        const url = `${endpoint}?${params.toString()}`;
        
        // 記錄請求信息，便於調試
        console.log(`發送請求到: ${url}`);
        
        // 使用網絡監控工具記錄請求開始
        networkMonitor.logRequestStart(url, 'GET');
        
        // 使用增強的fetch工具發送API請求
        const response = await get<any>(url, {
          timeout: 15000, // 15秒超時
          retries: 2,     // 最多重試2次
          retryDelay: 1000 // 重試間隔1秒
        });
        
        // 處理響應結果
        if (response.ok) {
          // 記錄請求成功
          networkMonitor.logRequestSuccess(url, 200);
        } else {
          // 記錄請求失敗
          networkMonitor.logRequestError(url, response.error || '未知錯誤', response.status);
          throw new Error(response.error || '搜索請求失敗');
        }
        
        // 獲取響應數據
        const data = response.data;
        
        // 檢查API返回的數據格式是否正確
        if (!data) {
          throw new Error('API返回的數據為空');
        }
        
        // 檢查activities字段
        if (!data.activities) {
          // 嘗試自動修復數據結構
          if (Array.isArray(data)) {
            // 如果直接返回了數組，將其包裝為預期的格式
            data = { activities: data };
            console.log('自動修復API返回的數據結構');
          } else {
            // 查找可能的替代字段
            const possibleArrayFields = Object.keys(data).find(key => Array.isArray(data[key]));
            if (possibleArrayFields) {
              data = { activities: data[possibleArrayFields] };
              console.log(`使用替代字段 '${possibleArrayFields}' 作為活動數據`);
            } else {
              throw new Error('API返回的數據中找不到活動列表');
            }
          }
        }
        
        if (!Array.isArray(data.activities)) {
          console.error('API返回的數據格式不正確:', data);
          throw new Error(`API返回的數據格式不正確: 預期 'activities' 為數組，但收到 ${typeof data.activities}`);
        }
        
        // 格式化API返回的數據以匹配我們的Activity接口
        const formattedActivities = data.activities.map((item: any) => {
          try {
            // 使用可選鏈和空值合併運算符確保數據的健壯性
            return {
              id: item?.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              title: item?.title || '無標題',
              description: item?.description || '',
              templateType: item?.templateType || item?.type || 'unknown',
              createdAt: item?.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: item?.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
              published: item?.published ?? true,
              author: {
                id: item?.user?.id || '',
                name: item?.user?.name || '未知作者'
              },
              tags: Array.isArray(item?.tags) ? item.tags.filter(tag => tag && typeof tag === 'string') : [],
              views: typeof item?.stats?.views === 'number' ? item.stats.views : 0
            };
          } catch (itemError) {
            console.error('處理活動項目時出錯:', itemError, item);
            // 返回一個基本的活動對象，避免整個映射失敗
            return {
              id: `error-${Math.random().toString(36).substr(2, 9)}`,
              title: '數據錯誤',
              description: '此項目數據格式有誤',
              templateType: 'unknown',
              createdAt: new Date().toISOString(),
              published: false,
              author: {
                id: '',
                name: '未知'
              }
            };
          }
        });
        
        // 提取所有可用標籤
        const tags = new Set<string>();
        formattedActivities.forEach((activity: Activity) => {
          activity.tags?.forEach(tag => {
            if (tag && typeof tag === 'string') {
              tags.add(tag);
            }
          });
        });

        setActivities(formattedActivities);
        setAvailableTags(Array.from(tags));
        setIsLoading(false);
      } catch (error) {
        console.error('獲取活動失敗:', error);
        
        // 獲取詳細的錯誤信息
        let errorMessage = error instanceof Error ? error.message : '搜索過程中發生未知錯誤';
        
        // 檢查API健康狀態，提供更詳細的診斷信息
        checkApiHealth().then(health => {
          setApiHealth(health);
          
          // 如果API狀態不佳，自動顯示健康狀態並提供更具體的錯誤信息
          if (health.overallHealth !== 'good') {
            setShowHealthStatus(true);
            
            // 根據API健康狀態提供更具體的錯誤信息
            if (!health.searchApiStatus.connected && !health.advancedSearchApiStatus.connected) {
              errorMessage = '無法連接到搜索服務。請檢查您的網絡連接或稍後再試。';
            } else if (selectedTags.length > 0 && !health.advancedSearchApiStatus.connected) {
              errorMessage = '高級搜索服務暫時不可用。請嘗試不使用標籤進行基本搜索。';
            } else if (selectedTags.length === 0 && !health.searchApiStatus.connected) {
              errorMessage = '基本搜索服務暫時不可用。請稍後再試。';
            }
          }
          
          setError(errorMessage);
        }).catch(() => {
          // 如果健康檢查也失敗，則可能是網絡連接問題
          setError('無法連接到服務器。請檢查您的網絡連接並重試。');
        });
        
        setActivities([]);
        setIsLoading(false);
      }
    };

    // 添加一個小延遲，避免在用戶快速輸入時發送過多請求
    const debounceTimeout = setTimeout(() => {
      fetchActivities();
    }, 300);
    
    // 添加自定義事件監聽器，用於手動觸發重新獲取數據
    const handleFetchEvent = () => {
      fetchActivities();
    };
    
    window.addEventListener('fetch', handleFetchEvent);

    return () => {
      clearTimeout(debounceTimeout);
      window.removeEventListener('fetch', handleFetchEvent);
    };
  }, [searchQuery, selectedTags, selectedType, sortBy]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 獲取模板類型名稱
  const getTemplateTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'FLASHCARDS': '單字卡片',
      'MATCHING': '配對遊戲',
      'QUIZ': '測驗問答',
      'H5P': 'H5P內容'
    };
    return typeMap[type] || type;
  };

  // 處理標籤選擇
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>搜索活動 - EduCreate</title>
        <meta name="description" content="搜索教學活動和資源" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">搜索教學活動</h1>
            <p className="text-gray-600">搜索並發現適合您需求的互動式學習資源</p>
          </div>
          <div>
            <button
              onClick={() => {
                setShowHealthStatus(true);
                checkApiHealth().then(health => setApiHealth(health));
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              檢查API連接
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-lg"
                placeholder="輸入關鍵詞搜索活動..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {tag}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FilterIcon className="h-5 w-5 inline mr-1" />
                  活動類型
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">所有類型</option>
                  <option value="FLASHCARDS">單字卡片</option>
                  <option value="MATCHING">配對遊戲</option>
                  <option value="QUIZ">測驗問答</option>
                  <option value="H5P">H5P內容</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AdjustmentsIcon className="h-5 w-5 inline mr-1" />
                  排序方式
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="newest">最新發布</option>
                  <option value="oldest">最早發布</option>
                  <option value="popular">最受歡迎</option>
                  <option value="az">標題 A-Z</option>
                  <option value="za">標題 Z-A</option>
                </select>
              </div>
            </div>
            
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">熱門標籤</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag) ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-gray-100 text-gray-800 border-gray-200'} border`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 搜索結果 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              搜索結果 {!isLoading && <span className="text-gray-500 font-normal">({activities.length})</span>}
            </h2>
          </div>

          {/* API健康狀態顯示 */}
        {apiHealth && (apiHealth.overallHealth !== 'good' || showHealthStatus) && (
          <div className={`border px-4 py-3 rounded relative m-4 ${apiHealth.overallHealth === 'good' ? 'bg-green-50 border-green-200 text-green-700' : apiHealth.overallHealth === 'degraded' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`} role="alert">
            <div className="flex items-start">
              {apiHealth.overallHealth === 'good' ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <ExclamationIcon className="h-6 w-6 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="block sm:inline font-medium mb-1">API連接狀態</p>
                <p className="text-sm">{apiHealth.message}</p>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${apiHealth.searchApiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>基本搜索API: {apiHealth.searchApiStatus.connected ? `正常 (${apiHealth.searchApiStatus.responseTime}ms)` : '連接失敗'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${apiHealth.advancedSearchApiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>高級搜索API: {apiHealth.advancedSearchApiStatus.connected ? `正常 (${apiHealth.advancedSearchApiStatus.responseTime}ms)` : '連接失敗'}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end space-x-2">
                  <button 
                    onClick={() => setShowHealthStatus(false)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    關閉
                  </button>
                  <button 
                    onClick={async () => {
                      setApiHealth(null);
                      setShowHealthStatus(true);
                      const health = await checkApiHealth();
                      setApiHealth(health);
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    重新檢查
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="block sm:inline font-medium mb-1">搜索時發生錯誤</p>
                  <p className="text-sm">{error}</p>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => {
                        setError(null);
                        // 觸發重新搜索，但添加一個小延遲以確保狀態已更新
                        setTimeout(() => {
                          // 使用當前的搜索條件重新觸發搜索
                          const fetchEvent = new Event('fetch');
                          window.dispatchEvent(fetchEvent);
                        }, 100);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重試
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4" role="status">
                <span className="sr-only">加載中...</span>
              </div>
              <p className="text-gray-500">正在搜索活動，請稍候...</p>
              <p className="text-gray-400 text-sm mt-2">如果加載時間過長，可能是網絡連接問題</p>
            </div>
          ) : activities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id} className="hover:bg-gray-50 transition duration-150">
                  <Link href={`/activity/${activity.id}`} className="block">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-indigo-600 truncate">{activity.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {getTemplateTypeName(activity.templateType)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{activity.description || '無描述'}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <p>作者: {activity.author.name}</p>
                        <span className="mx-2">•</span>
                        <p>創建於: {formatDate(activity.createdAt)}</p>
                        {activity.views !== undefined && (
                          <>
                            <span className="mx-2">•</span>
                            <p>瀏覽: {activity.views}</p>
                          </>
                        )}
                      </div>
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {activity.tags.map(tag => (
                            <span 
                              key={`${activity.id}-${tag}`} 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!selectedTags.includes(tag)) {
                                  setSelectedTags([...selectedTags, tag]);
                                }
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到符合條件的活動</h3>
              <p className="mt-1 text-sm text-gray-500">嘗試調整您的搜索條件或過濾選項</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                    setSelectedType('all');
                    setSortBy('newest');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  清除所有過濾條件
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}