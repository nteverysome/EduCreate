import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { PlusIcon, MagnifyingGlassIcon, AdjustmentsVerticalIcon, ClockIcon, ChartBarIcon, DocumentTextIcon, TagIcon, EyeIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/outline';
// framer-motion 已移除，使用 CSS 動畫替代
import BatchOperations from '../components/dashboard/BatchOperations';
import SelectableActivityCard from '../components/dashboard/SelectableActivityCard';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string; // 修改為type以匹配SelectableActivityCard
  templateType: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  views?: number;
  interactions?: number;
  tags?: string[];
  user?: {
    name: string;
  };
}

interface Stats {
  totalActivities: number;
  publishedActivities: number;
  totalViews: number;
  totalInteractions: number;
  recentActivities?: number;
  completionRate?: number;
}

export default function EnhancedDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, drafts
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    publishedActivities: 0,
    totalViews: 0,
    totalInteractions: 0,
    recentActivities: 0,
    completionRate: 0
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('activities'); // activities, stats, favorites
  
  // 批量操作相關狀態
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 獲取用戶活動和統計數據
  // 獲取用戶活動數據
  const fetchUserActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      
      // 根據過濾條件設置參數
      if (filter === 'published') {
        params.append('published', 'true');
      } else if (filter === 'drafts') {
        params.append('published', 'false');
      }
      
      // 設置排序參數
      const sortMapping: Record<string, {sort: string, order: string}> = {
        'newest': {sort: 'createdAt', order: 'desc'},
        'oldest': {sort: 'createdAt', order: 'asc'},
        'popular': {sort: 'views', order: 'desc'}
      };
      
      const sortOption = sortMapping[sortBy] || sortMapping['newest'];
      params.append('sort', sortOption.sort);
      params.append('order', sortOption.order);
      
      // 添加用戶ID參數，只獲取當前用戶的活動
      if (session?.user?.id) {
        params.append('createdBy', session.user.id);
      }
      
      // 如果有選擇標籤，使用高級搜索API
      let endpoint = '/api/search';
      if (selectedTags.length > 0) {
        endpoint = '/api/search/advanced';
        params.append('tags', selectedTags.join(','));
      }
      
      // 添加統計數據參數
      params.append('includeStats', 'true');
      
      // 發送API請求
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`獲取活動失敗: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 格式化API返回的數據以匹配我們的Activity接口
      const formattedActivities = data.activities.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.templateType, // 使用templateType作為type
        templateType: item.templateType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        published: item.published,
        views: item.stats?.views || 0,
        interactions: item.stats?.interactions || 0,
        tags: item.tags || [],
        user: item.user
      }));

      // 計算統計數據
      const totalActivities = data.pagination?.total || formattedActivities.length;
      const publishedActivities = formattedActivities.filter((a: Activity) => a.published).length;
      const totalViews = formattedActivities.reduce((sum: number, a: Activity) => sum + (a.views || 0), 0);
      const totalInteractions = formattedActivities.reduce((sum: number, a: Activity) => sum + (a.interactions || 0), 0);
      
      // 獲取最近30天內創建的活動數量
      const recentActivities = formattedActivities.filter((a: Activity) => {
        const date = new Date(a.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // 最近30天內創建的活動
      }).length;
      
      const completionRate = totalActivities > 0 ? (publishedActivities / totalActivities * 100) : 0;

      // 提取所有可用標籤
      const tags = new Set<string>();
      formattedActivities.forEach((activity: Activity) => {
        activity.tags?.forEach(tag => tags.add(tag));
      });

      setActivities(formattedActivities);
      setStats({
        totalActivities,
        publishedActivities,
        totalViews,
        totalInteractions,
        recentActivities,
        completionRate
      });
      setAvailableTags(Array.from(tags));
      
      // 清除已選擇但不再存在的活動
      setSelectedActivities(prev => 
        prev.filter(id => formattedActivities.some((activity: Activity) => activity.id === id))
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error('獲取活動數據失敗:', error);
      setIsLoading(false);
    }
  }, [session, searchQuery, filter, sortBy, selectedTags]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchUserActivities();
    }
  }, [status, session, fetchUserActivities]);

  // 獲取模板類型的顯示名稱和顏色
  const getTemplateInfo = (type: string) => {
    switch (type) {
      case 'FLASHCARDS':
        return { name: '單字卡片', color: 'bg-blue-100 text-blue-800' };
      case 'MATCHING':
        return { name: '配對遊戲', color: 'bg-purple-100 text-purple-800' };
      case 'QUIZ':
        return { name: '測驗問答', color: 'bg-pink-100 text-pink-800' };
      default:
        return { name: '其他', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 切換標籤選擇
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // 批量操作處理函數
  const handleSelectActivity = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedActivities(prev => [...prev, id]);
    } else {
      setSelectedActivities(prev => prev.filter(activityId => activityId !== id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedActivities.length === 0) return;
    
    if (confirm(`確定要刪除選中的 ${selectedActivities.length} 個活動嗎？`)) {
      try {
        setIsProcessing(true);
        
        // 批量刪除API調用
        const results = await Promise.all(
          selectedActivities.map(id => 
            fetch(`/api/activities/${id}`, { method: 'DELETE' })
              .then(res => res.json())
          )
        );
        
        // 更新活動列表
        setActivities(prevActivities => 
          prevActivities.filter(activity => !selectedActivities.includes(activity.id))
        );
        
        // 清空選擇
        setSelectedActivities([]);
        
        // 顯示成功消息
        alert(`成功刪除 ${selectedActivities.length} 個活動`);
        
        // 重新獲取活動列表
        fetchUserActivities();
      } catch (error) {
        console.error('批量刪除失敗:', error);
        alert('批量刪除失敗，請稍後再試');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBatchPublish = async () => {
    if (selectedActivities.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      // 批量發布API調用
      const results = await Promise.all(
        selectedActivities.map(id => 
          fetch(`/api/activities/${id}?action=publish`, { method: 'POST' })
            .then(res => res.json())
        )
      );
      
      // 更新活動列表
      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (selectedActivities.includes(activity.id)) {
            return { ...activity, published: true };
          }
          return activity;
        })
      );
      
      // 清空選擇
      setSelectedActivities([]);
      
      // 顯示成功消息
      alert(`成功發布 ${selectedActivities.length} 個活動`);
      
      // 重新獲取活動列表
      fetchUserActivities();
    } catch (error) {
      console.error('批量發布失敗:', error);
      alert('批量發布失敗，請稍後再試');
    } finally {
      setIsProcessing(false);
    }
  };

  // 單個活動操作
  const handleEditActivity = (id: string) => {
    router.push(`/editor/${id}`);
  };
  
  const handleDeleteActivity = async (id: string) => {
    if (confirm('確定要刪除此活動嗎？')) {
      try {
        const response = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setActivities(prevActivities => 
            prevActivities.filter(activity => activity.id !== id)
          );
          alert('活動已成功刪除');
        } else {
          throw new Error('刪除失敗');
        }
      } catch (error) {
        console.error('刪除活動失敗:', error);
        alert('刪除活動失敗，請稍後再試');
      }
    }
  };
  
  const handlePublishActivity = async (id: string) => {
    try {
      const response = await fetch(`/api/activities/${id}?action=publish`, { method: 'POST' });
      if (response.ok) {
        setActivities(prevActivities => 
          prevActivities.map(activity => {
            if (activity.id === id) {
              return { ...activity, published: true };
            }
            return activity;
          })
        );
        alert('活動已成功發布');
      } else {
        throw new Error('發布失敗');
      }
    } catch (error) {
      console.error('發布活動失敗:', error);
      alert('發布活動失敗，請稍後再試');
    }
  };

  // 渲染活動卡片
  const renderActivityCard = (activity: Activity) => {
    const isSelected = selectedActivities.includes(activity.id);
    
    return (
      <SelectableActivityCard
        key={activity.id}
        activity={activity}
        isSelected={isSelected}
        onSelect={handleSelectActivity}
        onEdit={handleEditActivity}
        onDelete={handleDeleteActivity}
        onPublish={handlePublishActivity}
      />
    );
  };

  // 渲染統計卡片
  const renderStatCard = (icon: React.ReactNode, title: string, value: string | number, description: string, color: string) => {
    return (
      <div
        className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 animate-fade-in"
      >
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        <p className="text-lg font-medium mb-2">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    );
  };

  // 渲染活動標籤
  const renderTags = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            清除全部
          </button>
        )}
      </div>
    );
  };

  // 渲染活動頁籤
  const renderActivitiesTab = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="搜索活動..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="published">已發布</option>
              <option value="drafts">草稿</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">最新建立</option>
              <option value="oldest">最舊建立</option>
              <option value="popular">最多瀏覽</option>
            </select>
          </div>
        </div>

        {renderTags()}
        
        {/* 批量操作工具欄 */}
        <BatchOperations
          selectedItems={selectedActivities}
          onPublish={handleBatchPublish}
          onDelete={handleBatchDelete}
          onCancel={() => setSelectedActivities([])}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map(activity => renderActivityCard(activity))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到活動</h3>
            <p className="text-gray-500 mb-6">嘗試調整您的搜索條件或創建新活動</p>
            <Link href="/create" className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              創建新活動
            </Link>
          </div>
        )}
      </div>
    );
  };

  // 渲染統計頁籤
  const renderStatsTab = () => {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {renderStatCard(
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />,
            '總活動數',
            stats.totalActivities,
            '您創建的所有活動總數',
            'bg-blue-100'
          )}
          {renderStatCard(
            <BoltIcon className="h-6 w-6 text-green-600" />,
            '已發布活動',
            stats.publishedActivities,
            '已發布並可供學生使用的活動',
            'bg-green-100'
          )}
          {renderStatCard(
            <EyeIcon className="h-6 w-6 text-purple-600" />,
            '總瀏覽量',
            stats.totalViews,
            '所有活動的總瀏覽次數',
            'bg-purple-100'
          )}
          {renderStatCard(
            <UserGroupIcon className="h-6 w-6 text-pink-600" />,
            '互動次數',
            stats.totalInteractions,
            '學生與活動的互動總次數',
            'bg-pink-100'
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">活動完成率</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-primary h-4 rounded-full" 
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>已發布: {stats.publishedActivities}</span>
            <span>完成率: {stats.completionRate?.toFixed(1)}%</span>
            <span>總數: {stats.totalActivities}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">最受歡迎活動</h3>
            <div className="space-y-4">
              {activities
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 3)
                .map(activity => (
                  <div key={activity.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{getTemplateInfo(activity.templateType).name}</p>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span>{activity.views || 0}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">最近活動</h3>
            <div className="space-y-4">
              {activities
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3)
                .map(activity => (
                  <div key={activity.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(activity.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {activity.published ? '已發布' : '草稿'}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Head>
        <title>增強儀表板 - EduCreate</title>
        <meta name="description" content="管理您的教學活動和查看統計數據" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">增強儀表板</h1>
            <p className="text-gray-600 mt-1">管理您的教學活動和查看統計數據</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/create" className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              創建新活動
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                我的活動
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                統計數據
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'activities' ? renderActivitiesTab() : renderStatsTab()}
      </div>
    </div>
  );
}