'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';

interface ContentItem {
  id: string;
  keyword: string;
  definition: string;
  keywordImage?: string;
  definitionImage?: string;
}

// 遊戲模板配置
const gameTemplateConfig = {
  'balloon-pop': {
    name: '刺破氣球',
    description: '彈出氣球，將每個關鍵字放到其匹配內容上。',
    icon: '🎈',
    keywordLabel: '關鍵字',
    keywordDescription: '這些將掛在氣球上',
    definitionLabel: '定義',
    definitionDescription: '這些將出現在火車上',
    minItems: 5,
    maxItems: 100
  },
  'quiz': {
    name: '測驗',
    description: '一系列多選題。點擊正確答案繼續。',
    icon: '📝',
    keywordLabel: '問題',
    keywordDescription: '測驗問題',
    definitionLabel: '答案',
    definitionDescription: '正確答案',
    minItems: 5,
    maxItems: 50
  },
  'match-game': {
    name: '匹配遊戲',
    description: '將每個關鍵字拖放到其定義旁邊。',
    icon: '🔗',
    keywordLabel: '關鍵字',
    keywordDescription: '要匹配的項目',
    definitionLabel: '定義',
    definitionDescription: '對應的定義',
    minItems: 5,
    maxItems: 20
  }
  // 可以添加更多遊戲配置
};

export default function CreateGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  
  // 獲取遊戲配置
  const gameConfig = gameTemplateConfig[templateId as keyof typeof gameTemplateConfig];
  
  const [activityTitle, setActivityTitle] = useState('無標題活動');
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: '1', keyword: '', definition: '' },
    { id: '2', keyword: '', definition: '' },
    { id: '3', keyword: '', definition: '' },
    { id: '4', keyword: '', definition: '' },
    { id: '5', keyword: '', definition: '' },
  ]);
  const [showInstructions, setShowInstructions] = useState(false);

  // 如果未登入，顯示登入提示
  if (status === 'loading') {
    return <div className="p-8">載入中...</div>;
  }

  if (!session) {
    return <LoginPrompt />;
  }

  // 如果遊戲模板不存在，重定向到選擇頁面
  if (!gameConfig) {
    router.push('/create');
    return <div className="p-8">重定向中...</div>;
  }

  const addNewItem = () => {
    if (contentItems.length < gameConfig.maxItems) {
      const newId = (contentItems.length + 1).toString();
      setContentItems([...contentItems, { id: newId, keyword: '', definition: '' }]);
    }
  };

  const removeItem = (id: string) => {
    if (contentItems.length > gameConfig.minItems) {
      setContentItems(contentItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: 'keyword' | 'definition', value: string) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const swapColumns = () => {
    setContentItems(contentItems.map(item => ({
      ...item,
      keyword: item.definition,
      definition: item.keyword,
      keywordImage: item.definitionImage,
      definitionImage: item.keywordImage,
    })));
  };

  const handleComplete = async () => {
    // 過濾掉空的項目
    const validItems = contentItems.filter(item => 
      item.keyword.trim() !== '' && item.definition.trim() !== ''
    );

    if (validItems.length < gameConfig.minItems) {
      alert(`至少需要 ${gameConfig.minItems} 個有效的${gameConfig.keywordLabel}-${gameConfig.definitionLabel}配對`);
      return;
    }

    try {
      // 創建活動數據
      const activityData = {
        title: activityTitle,
        gameType: templateId,
        content: validItems,
        difficulty: 'ELEMENTARY',
        isPublic: false,
      };

      // 這裡可以調用 API 保存活動
      console.log('創建活動:', activityData);
      
      // 跳轉到遊戲頁面或我的活動頁面
      router.push('/my-activities');
    } catch (error) {
      console.error('創建活動失敗:', error);
      alert('創建活動失敗，請重試');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">EduCreate</h1>
                <span className="ml-2 text-sm text-gray-500">更快地創建更好的課程</span>
              </div>
              <a href="/create" className="text-blue-600 hover:text-blue-800">創建活動</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/community" className="text-gray-600 hover:text-gray-800">👥 社區</a>
              <a href="/my-activities" className="text-gray-600 hover:text-gray-800">我的活動</a>
              <a href="/my-results" className="text-gray-600 hover:text-gray-800">我的結果</a>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{session.user?.name}</span>
                <button className="text-gray-600 hover:text-gray-800">▼</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 遊戲類型展示 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{gameConfig.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{gameConfig.name}</h2>
              <p className="text-gray-600">{gameConfig.description}</p>
            </div>
          </div>
          
          {/* 進度指示器 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="text-blue-600">選擇範本</span>
            <span>→</span>
            <span className="text-blue-600 font-medium">輸入內容</span>
            <span>→</span>
            <span>播放</span>
          </div>
        </div>

        {/* 活動標題 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">活動標題</label>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 內容輸入區域 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 操作說明 */}
          <div className="mb-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>📋</span>
              <span>操作說明</span>
            </button>
            {showInstructions && (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                <p>1. 在左欄輸入{gameConfig.keywordLabel}，在右欄輸入對應的{gameConfig.definitionLabel}</p>
                <p>2. 可以為每個項目添加圖片</p>
                <p>3. 至少需要 {gameConfig.minItems} 個項目，最多 {gameConfig.maxItems} 個</p>
                <p>4. 點擊「交換列」可以交換{gameConfig.keywordLabel}和{gameConfig.definitionLabel}的位置</p>
              </div>
            )}
          </div>

          {/* 欄位標題和交換按鈕 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{gameConfig.keywordLabel}</h3>
              <p className="text-sm text-gray-500">{gameConfig.keywordDescription}</p>
            </div>
            <button
              onClick={swapColumns}
              className="mx-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              交換列
            </button>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{gameConfig.definitionLabel}</h3>
              <p className="text-sm text-gray-500">{gameConfig.definitionDescription}</p>
            </div>
          </div>

          {/* 內容項目列表 */}
          <div className="space-y-4">
            {contentItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="w-8 text-center text-sm text-gray-500">
                  {index + 1}.
                </div>
                
                {/* 關鍵字欄位 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1">
                      添加圖像
                    </button>
                    <input
                      type="text"
                      value={item.keyword}
                      onChange={(e) => updateItem(item.id, 'keyword', e.target.value)}
                      placeholder={`輸入${gameConfig.keywordLabel}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 定義欄位 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1">
                      添加圖像
                    </button>
                    <input
                      type="text"
                      value={item.definition}
                      onChange={(e) => updateItem(item.id, 'definition', e.target.value)}
                      placeholder={`輸入${gameConfig.definitionLabel}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 刪除按鈕 */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={contentItems.length <= gameConfig.minItems}
                  className={`p-2 rounded ${
                    contentItems.length <= gameConfig.minItems 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                  }`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* 新增項目按鈕 */}
          <div className="mt-6">
            <button
              onClick={addNewItem}
              disabled={contentItems.length >= gameConfig.maxItems}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                contentItems.length >= gameConfig.maxItems
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <span className="text-xl">+</span>
              <span>新增項目</span>
              <span className="text-sm text-gray-500">最小{gameConfig.minItems} 最大{gameConfig.maxItems}</span>
            </button>
          </div>

          {/* 完成按鈕 */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
