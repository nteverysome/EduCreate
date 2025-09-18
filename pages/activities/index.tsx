import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, ChevronDownIcon, EyeIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
// framer-motion 已移除，使用 CSS 動畫替代

interface Activity {
  id: string;
  title: string;
  description?: string;
  templateType: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  views?: number;
  interactions?: number;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
}

export default function ActivitiesBrowse() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTemplateTypes, setSelectedTemplateTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, oldest
  const [showFilters, setShowFilters] = useState(false);

  // 獲取活動數據
  useEffect(() => {
    // 在實際應用中，這裡會從API獲取數據
    const mockActivities: Activity[] = [
      {
        id: '1',
        title: '英語詞彙學習',
        description: '基礎英語詞彙學習卡片，適合初學者使用。包含常用詞彙和例句，幫助快速掌握基礎詞彙。',
        templateType: 'FLASHCARDS',
        createdAt: '2023-10-15T10:30:00Z',
        updatedAt: '2023-10-16T08:45:00Z',
        published: true,
        views: 1250,
        interactions: 450,
        tags: ['英語', '詞彙', '初級'],
        author: {
          name: '王老師',
          avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
        },
        thumbnail: '/templates/vocab-flashcards.jpg'
      },
      {
        id: '2',
        title: '數學概念配對',
        description: '數學術語與定義配對練習，幫助學生理解和記憶重要的數學概念和術語。',
        templateType: 'MATCHING',
        createdAt: '2023-10-10T14:20:00Z',
        updatedAt: '2023-10-12T11:30:00Z',
        published: true,
        views: 985,
        interactions: 320,
        tags: ['數學', '概念', '中級'],
        author: {
          name: '李教授',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        thumbnail: '/templates/math-matching.jpg'
      },
      {
        id: '3',
        title: '歷史知識測驗',
        description: '中國古代歷史知識測驗，涵蓋朝代、重要事件和歷史人物，適合高中學生複習使用。',
        templateType: 'QUIZ',
        createdAt: '2023-10-05T09:15:00Z',
        updatedAt: '2023-10-05T09:15:00Z',
        published: true,
        views: 750,
        interactions: 280,
        tags: ['歷史', '測驗', '高級'],
        author: {
          name: '張老師',
          avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
        },
        thumbnail: '/templates/history-quiz.jpg'
      },
      {
        id: '4',
        title: '科學實驗記錄',
        description: '物理實驗步驟和結果記錄模板，幫助學生系統性地記錄實驗過程和分析結果。',
        templateType: 'QUIZ',
        createdAt: '2023-10-01T15:45:00Z',
        updatedAt: '2023-10-03T10:20:00Z',
        published: true,
        views: 650,
        interactions: 180,
        tags: ['科學', '物理', '實驗'],
        author: {
          name: '陳教授',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        thumbnail: '/templates/science-experiment.jpg'
      },
      {
        id: '5',
        title: '地理位置學習',
        description: '世界主要國家和城市位置學習，通過互動式地圖幫助學生記憶地理位置。',
        templateType: 'MATCHING',
        createdAt: '2023-09-25T13:10:00Z',
        updatedAt: '2023-09-27T09:30:00Z',
        published: true,
        views: 1100,
        interactions: 400,
        tags: ['地理', '位置', '中級'],
        author: {
          name: '林老師',
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
        },
        thumbnail: '/templates/geography-map.jpg'
      },
      {
        id: '6',
        title: '語法結構練習',
        description: '英語語法結構練習，包含句型變換、時態練習等多種題型。',
        templateType: 'QUIZ',
        createdAt: '2023-09-20T11:25:00Z',
        updatedAt: '2023-09-22T14:15:00Z',
        published: true,
        views: 820,
        interactions: 290,
        tags: ['英語', '語法', '中級'],
        author: {
          name: '王老師',
          avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
        },
        thumbnail: '/templates/grammar-practice.jpg'
      },
      {
        id: '7',
        title: '化學元素週期表',
        description: '互動式化學元素週期表學習工具，幫助學生記憶元素符號、原子量和特性。',
        templateType: 'FLASHCARDS',
        createdAt: '2023-09-15T09:40:00Z',
        updatedAt: '2023-09-17T16:30:00Z',
        published: true,
        views: 930,
        interactions: 350,
        tags: ['化學', '元素', '高級'],
        author: {
          name: '陳教授',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        thumbnail: '/templates/chemistry-elements.jpg'
      },
      {
        id: '8',
        title: '文學作品分析',
        description: '中國古典文學作品分析練習，包含詩詞鑒賞、文本解讀等內容。',
        templateType: 'QUIZ',
        createdAt: '2023-09-10T13:50:00Z',
        updatedAt: '2023-09-12T10:20:00Z',
        published: true,
        views: 680,
        interactions: 210,
        tags: ['文學', '分析', '高級'],
        author: {
          name: '李教授',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        thumbnail: '/templates/literature-analysis.jpg'
      }
    ];

    // 提取所有可用標籤
    const allTags = mockActivities.flatMap(a => a.tags || []);
    const uniqueTags = [...new Set(allTags)];
    setAvailableTags(uniqueTags);

    // 提取所有模板類型
    const allTemplateTypes = mockActivities.map(a => a.templateType);
    const uniqueTemplateTypes = [...new Set(allTemplateTypes)];
    setSelectedTemplateTypes(uniqueTemplateTypes);

    // 模擬API請求延遲
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 500);
  }, []);

  // 過濾和排序活動
  const filteredActivities = activities
    .filter(activity => {
      // 搜索過濾
      const matchesSearch = searchQuery === '' || 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 標籤過濾
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => activity.tags?.includes(tag));

      // 模板類型過濾
      const matchesTemplateType = selectedTemplateTypes.length === 0 ||
        selectedTemplateTypes.includes(activity.templateType);

      return matchesSearch && matchesTags && matchesTemplateType;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

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

  // 切換模板類型選擇
  const toggleTemplateType = (type: string) => {
    if (selectedTemplateTypes.includes(type)) {
      setSelectedTemplateTypes(selectedTemplateTypes.filter(t => t !== type));
    } else {
      setSelectedTemplateTypes([...selectedTemplateTypes, type]);
    }
  };

  // 渲染網格視圖的活動卡片
  const renderGridCard = (activity: Activity) => {
    const templateInfo = getTemplateInfo(activity.templateType);

    return (
      <div
        key={activity.id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in"
      >
        <Link href={`/activities/${activity.id}`} className="block">
          <div className="relative h-48 overflow-hidden">
            <Image 
              src={activity.thumbnail || '/templates/placeholder.svg'} 
              alt={activity.title} 
              width={400}
              height={192}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${templateInfo.color}`}>
                {templateInfo.name}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-1">{activity.title}</h3>
            {activity.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mb-3">
              {activity.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center">
                {activity.author?.avatar && (
                  <Image 
                    src={activity.author.avatar} 
                    alt={activity.author.name} 
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <span>{activity.author?.name}</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{activity.views || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  // 渲染列表視圖的活動項目
  const renderListItem = (activity: Activity) => {
    const templateInfo = getTemplateInfo(activity.templateType);

    return (
      <div
        key={activity.id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in"
      >
        <Link href={`/activities/${activity.id}`} className="block p-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/4 mb-4 md:mb-0 md:mr-4">
              <div className="relative h-32 md:h-24 overflow-hidden rounded-lg">
                <Image 
                  src={activity.thumbnail || '/templates/placeholder.svg'} 
                  alt={activity.title} 
                  width={200}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-3/4">
              <div className="flex flex-wrap justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${templateInfo.color}`}>
                  {templateInfo.name}
                </span>
              </div>
              {activity.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {activity.tags?.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  {activity.author?.avatar && (
                    <Image 
                      src={activity.author.avatar} 
                      alt={activity.author.name} 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span>{activity.author?.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{formatDate(activity.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span>{activity.views || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>{activity.interactions || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Head>
        <title>瀏覽活動 - EduCreate</title>
        <meta name="description" content="瀏覽和發現教育工作者創建的互動式教學活動" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">瀏覽活動</h1>
            <p className="text-gray-600 mt-1">發現和使用由教育工作者創建的互動式教學活動</p>
          </div>
        </div>

        {/* 搜索和過濾區域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                <span>過濾</span>
                <ChevronDownIcon className={`h-5 w-5 ml-1 text-gray-500 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="popular">最受歡迎</option>
                <option value="newest">最新發布</option>
                <option value="oldest">最早發布</option>
              </select>
            </div>
          </div>

          {/* 過濾選項 */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">模板類型</h3>
                <div className="flex flex-wrap gap-2">
                  {['FLASHCARDS', 'MATCHING', 'QUIZ'].map(type => {
                    const info = getTemplateInfo(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleTemplateType(type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTemplateTypes.includes(type) ? info.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {info.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">標籤</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 活動列表 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
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
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map(activity => renderGridCard(activity))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredActivities.map(activity => renderListItem(activity))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <svg className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到活動</h3>
            <p className="text-gray-500 mb-6">嘗試調整您的搜索條件或過濾選項</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
                setSelectedTemplateTypes(['FLASHCARDS', 'MATCHING', 'QUIZ']);
                setSortBy('popular');
              }}
              className="btn-primary"
            >
              重置過濾條件
            </button>
          </div>
        )}

        {/* 分頁 */}
        {!isLoading && filteredActivities.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                上一頁
              </button>
              <button className="px-3 py-1 rounded bg-primary text-white">
                1
              </button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                8
              </button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                下一頁
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}