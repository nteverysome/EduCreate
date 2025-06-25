import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  QuestionMarkCircleIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  RectangleStackIcon,
  PuzzlePieceIcon,
  CubeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button, SearchInput } from '@/components/ui';
import { Template, TemplateType } from '@/types';
import { useAuth } from '@/store/authStore';

/**
 * 創建活動頁面 - 選擇遊戲模板
 */
const CreateActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 模擬模板數據
  useEffect(() => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'Quiz',
        type: 'QUIZ' as TemplateType,
        description: '創建多選題測驗，支持圖片和音頻內容',
        iconUrl: '/icons/quiz.svg',
        config: {
          maxQuestions: 20,
          questionTypes: ['multiple_choice', 'true_false'],
          supportMedia: ['image', 'audio'],
          features: ['timer', 'scoring', 'feedback'],
        },
        defaultSettings: {
          timeLimit: 300,
          randomOrder: false,
          showCorrectAnswer: true,
          allowRetry: false,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Match Up',
        type: 'MATCH_UP' as TemplateType,
        description: '拖拽配對遊戲，將相關項目進行配對',
        iconUrl: '/icons/match-up.svg',
        config: {
          maxPairs: 10,
          layoutTypes: ['grid', 'list', 'scattered'],
          supportMedia: ['image', 'text'],
          features: ['drag_drop', 'auto_check', 'hints'],
        },
        defaultSettings: {
          layout: 'grid',
          dragMode: 'snap',
          showHints: false,
          autoCheck: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Spin the Wheel',
        type: 'SPIN_WHEEL' as TemplateType,
        description: '轉盤遊戲，隨機選擇答案或獎品',
        iconUrl: '/icons/spin-wheel.svg',
        config: {
          maxSegments: 12,
          customColors: true,
          supportMedia: ['text', 'image'],
          features: ['animation', 'sound', 'probability'],
        },
        defaultSettings: {
          spinDuration: 3000,
          showPointer: true,
          allowMultipleSpin: true,
          enableSound: true,
        },
        isActive: true,
        isPremium: false,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Group Sort',
        type: 'GROUP_SORT' as TemplateType,
        description: '分組排序遊戲，將項目分類到正確組別',
        iconUrl: '/icons/group-sort.svg',
        config: {
          maxGroups: 6,
          maxItemsPerGroup: 10,
          supportMedia: ['text', 'image'],
          features: ['drag_drop', 'auto_sort', 'validation'],
        },
        defaultSettings: {
          maxItemsPerGroup: null,
          allowEmptyGroups: false,
          showGroupLabels: true,
          autoValidate: true,
        },
        isActive: true,
        isPremium: true,
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setTemplates(mockTemplates);
    setFilteredTemplates(mockTemplates);
    setLoading(false);
  }, []);

  // 搜索和篩選
  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.type === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  const handleTemplateSelect = (template: Template) => {
    // 檢查是否需要高級訂閱
    if (template.isPremium && user?.subscriptionType === 'FREE') {
      // 顯示升級提示
      alert('此模板需要高級訂閱才能使用');
      return;
    }

    // 導航到模板編輯器
    navigate(`/create/${template.type.toLowerCase()}`, {
      state: { template }
    });
  };

  const getTemplateIcon = (type: TemplateType) => {
    const iconClass = "h-8 w-8";
    
    switch (type) {
      case 'QUIZ':
        return <QuestionMarkCircleIcon className={iconClass} />;
      case 'MATCH_UP':
        return <ArrowsRightLeftIcon className={iconClass} />;
      case 'SPIN_WHEEL':
        return <ArrowPathIcon className={iconClass} />;
      case 'GROUP_SORT':
        return <Squares2X2Icon className={iconClass} />;
      case 'FLASH_CARDS':
        return <RectangleStackIcon className={iconClass} />;
      case 'ANAGRAM':
        return <PuzzlePieceIcon className={iconClass} />;
      case 'FIND_MATCH':
        return <CubeIcon className={iconClass} />;
      case 'OPEN_BOX':
        return <SparklesIcon className={iconClass} />;
      default:
        return <QuestionMarkCircleIcon className={iconClass} />;
    }
  };

  const getTemplateColor = (type: TemplateType) => {
    switch (type) {
      case 'QUIZ':
        return 'from-blue-500 to-blue-400';
      case 'MATCH_UP':
        return 'from-emerald-500 to-emerald-400';
      case 'SPIN_WHEEL':
        return 'from-amber-500 to-amber-400';
      case 'GROUP_SORT':
        return 'from-purple-500 to-purple-400';
      case 'FLASH_CARDS':
        return 'from-red-500 to-red-400';
      case 'ANAGRAM':
        return 'from-cyan-500 to-cyan-400';
      case 'FIND_MATCH':
        return 'from-pink-500 to-pink-400';
      case 'OPEN_BOX':
        return 'from-lime-500 to-lime-400';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">載入模板中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            選擇遊戲模板
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            從多種互動式遊戲模板中選擇，創建引人入勝的教育活動
          </p>
        </div>

        {/* 搜索和篩選 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="搜索模板..."
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedCategory('QUIZ')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'QUIZ'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                測驗
              </button>
              <button
                onClick={() => setSelectedCategory('MATCH_UP')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'MATCH_UP'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                配對
              </button>
            </div>
          </div>
        </div>

        {/* 模板網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* 模板頭部 */}
              <div className={`h-2 bg-gradient-to-r ${getTemplateColor(template.type)} rounded-t-xl`} />
              
              <div className="p-6">
                {/* 圖標和標題 */}
                <div className="flex items-center mb-4">
                  <div className={`h-12 w-12 bg-gradient-to-r ${getTemplateColor(template.type)} rounded-lg flex items-center justify-center text-white mr-3`}>
                    {getTemplateIcon(template.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {template.name}
                    </h3>
                    {template.isPremium && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                        高級版
                      </span>
                    )}
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* 功能標籤 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.config.features?.slice(0, 3).map((feature: string) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 選擇按鈕 */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="group-hover:scale-105 transition-transform"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  選擇此模板
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空狀態 */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <QuestionMarkCircleIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              沒有找到匹配的模板
            </h3>
            <p className="text-gray-600">
              請嘗試調整搜索條件或選擇不同的分類
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateActivityPage;
