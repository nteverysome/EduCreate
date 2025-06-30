/**
 * 增強版創建活動頁面
 * 集成34個遊戲模板和記憶增強系統
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { gameTemplateManager, GameTemplateInfo } from '../lib/game-templates/GameTemplateManager';
import GameRenderer from '../components/games/GameRenderer';
import { MemoryConfigurationManager } from '../lib/memory-enhancement/MemoryConfigurationManager';

interface CreateStep {
  id: number;
  title: string;
  description: string;
}

export default function CreateEnhancedActivity() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplateInfo | null>(null);
  const [activityData, setActivityData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    timeLimit: 0,
    memoryOptimization: true
  });
  const [gameData, setGameData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMemoryType, setFilterMemoryType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState(0);

  const memoryManager = new MemoryConfigurationManager();

  // 檢查用戶登入狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent('/create-enhanced'));
    }
  }, [status, router]);

  // 從URL獲取模板參數
  useEffect(() => {
    if (router.query.template) {
      const template = gameTemplateManager.getTemplate(router.query.template as string);
      if (template) {
        setSelectedTemplate(template);
        setCurrentStep(2);
      }
    }
  }, [router.query]);

  const steps: CreateStep[] = [
    {
      id: 1,
      title: '選擇遊戲模板',
      description: '從34個基於記憶科學的遊戲模板中選擇'
    },
    {
      id: 2,
      title: '配置活動信息',
      description: '設置活動標題、描述和基本參數'
    },
    {
      id: 3,
      title: '設計遊戲內容',
      description: '創建具體的遊戲內容和題目'
    },
    {
      id: 4,
      title: '預覽和發布',
      description: '預覽遊戲效果並發布活動'
    }
  ];

  // 獲取篩選後的模板
  const getFilteredTemplates = (): GameTemplateInfo[] => {
    let templates = gameTemplateManager.getImplementedTemplates();

    // 搜索篩選
    if (searchQuery) {
      templates = gameTemplateManager.searchTemplates(searchQuery);
    }

    // 類別篩選
    if (filterCategory !== 'all') {
      templates = templates.filter(t => t.category === filterCategory);
    }

    // 記憶類型篩選
    if (filterMemoryType !== 'all') {
      templates = templates.filter(t => t.memoryType === filterMemoryType);
    }

    // 難度篩選
    if (filterDifficulty > 0) {
      templates = templates.filter(t => t.difficultyLevel === filterDifficulty);
    }

    return templates;
  };

  // 獲取所有類別
  const getCategories = (): string[] => {
    const categories = new Set(gameTemplateManager.getAllTemplates().map(t => t.category));
    return Array.from(categories);
  };

  // 獲取所有記憶類型
  const getMemoryTypes = (): string[] => {
    const memoryTypes = new Set(gameTemplateManager.getAllTemplates().map(t => t.memoryType));
    return Array.from(memoryTypes);
  };

  // 處理模板選擇
  const handleTemplateSelect = (template: GameTemplateInfo) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  // 處理活動信息提交
  const handleActivityInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityData.title.trim()) {
      alert('請輸入活動標題');
      return;
    }
    setCurrentStep(3);
  };

  // 處理遊戲內容設計
  const handleGameContentSubmit = (content: any) => {
    setGameData(content);
    setCurrentStep(4);
  };

  // 處理活動發布
  const handlePublishActivity = async () => {
    try {
      const activityPayload = {
        title: activityData.title,
        description: activityData.description,
        templateId: selectedTemplate?.id,
        gameData,
        difficulty: activityData.difficulty,
        timeLimit: activityData.timeLimit,
        memoryOptimization: activityData.memoryOptimization
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityPayload)
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/activity/${result.id}`);
      } else {
        throw new Error('Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('創建活動失敗，請重試');
    }
  };

  // 渲染步驟指示器
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染模板選擇步驟
  const renderTemplateSelection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">選擇遊戲模板</h2>
      
      {/* 篩選器 */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">類別</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有類別</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">記憶類型</label>
            <select
              value={filterMemoryType}
              onChange={(e) => setFilterMemoryType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有類型</option>
              {getMemoryTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">難度</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>所有難度</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>難度 {level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 模板網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredTemplates().map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{template.displayName}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.cognitiveLoad === 'low' ? 'bg-green-100 text-green-800' :
                    template.cognitiveLoad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {template.cognitiveLoad === 'low' ? '低負荷' :
                     template.cognitiveLoad === 'medium' ? '中負荷' : '高負荷'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    難度 {template.difficultyLevel}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {template.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{template.features.length - 3} 更多
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                記憶類型: {template.memoryType} | 類別: {template.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到匹配的模板</h3>
          <p className="text-gray-600">請嘗試調整篩選條件</p>
        </div>
      )}
    </div>
  );

  // 渲染活動信息配置步驟
  const renderActivityInfo = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">配置活動信息</h2>
      
      {selectedTemplate && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">已選擇模板: {selectedTemplate.displayName}</h3>
          <p className="text-blue-800 text-sm">{selectedTemplate.description}</p>
        </div>
      )}

      <form onSubmit={handleActivityInfoSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活動標題 *</label>
          <input
            type="text"
            value={activityData.title}
            onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="輸入活動標題..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活動描述</label>
          <textarea
            value={activityData.description}
            onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="描述這個活動的目標和內容..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">難度級別</label>
            <select
              value={activityData.difficulty}
              onChange={(e) => setActivityData(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>難度 {level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">時間限制 (分鐘)</label>
            <input
              type="number"
              value={activityData.timeLimit}
              onChange={(e) => setActivityData(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
              min="0"
              placeholder="0 = 無限制"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={activityData.memoryOptimization}
              onChange={(e) => setActivityData(prev => ({ ...prev, memoryOptimization: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">啟用記憶增強優化</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            基於記憶科學原理自動優化遊戲配置，提高學習效果
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            上一步
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            下一步
          </button>
        </div>
      </form>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>創建活動 - EduCreate</title>
        <meta name="description" content="使用34個基於記憶科學的遊戲模板創建教育活動" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderStepIndicator()}

          <div className="bg-white rounded-lg shadow-lg p-8">
            {currentStep === 1 && renderTemplateSelection()}
            {currentStep === 2 && renderActivityInfo()}
            {currentStep === 3 && selectedTemplate && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">設計遊戲內容</h2>
                <GameRenderer
                  templateId={selectedTemplate.id}
                  gameData={gameData}
                  onGameComplete={(score, time, stats) => {
                    console.log('Game completed:', { score, time, stats });
                  }}
                />
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">預覽和發布</h2>
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">活動準備就緒！</h3>
                  <p className="text-green-800 text-sm">您的活動已配置完成，可以發布了。</p>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handlePublishActivity}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    發布活動
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
