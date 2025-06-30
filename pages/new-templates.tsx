import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  memoryType: string;
  features: string[];
  status: 'available' | 'coming-soon' | 'beta';
  estimatedTime: string;
}

export default function NewTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);

  const newTemplates: GameTemplate[] = [
    {
      id: 'hangman',
      name: '猜字遊戲 (Hangman)',
      description: '經典的猜字遊戲，學生通過猜測字母來完成單詞',
      icon: '🎯',
      difficulty: 'medium',
      memoryType: '拼寫記憶',
      features: ['字母提示', '進度顯示', '錯誤限制', '詞彙學習'],
      status: 'available',
      estimatedTime: '3-5分鐘'
    },
    {
      id: 'image-quiz',
      name: '圖片問答 (Image Quiz)',
      description: '基於圖片的問答遊戲，提升視覺學習效果',
      icon: '🖼️',
      difficulty: 'easy',
      memoryType: '視覺記憶',
      features: ['圖片展示', '多選題', '即時反饋', 'AI圖片生成'],
      status: 'available',
      estimatedTime: '2-4分鐘'
    },
    {
      id: 'true-false',
      name: '是非題 (True/False)',
      description: '簡單直接的是非判斷題，適合快速測驗',
      icon: '✅',
      difficulty: 'easy',
      memoryType: '判斷記憶',
      features: ['快速作答', '即時判斷', '解釋說明', '統計分析'],
      status: 'available',
      estimatedTime: '1-3分鐘'
    },
    {
      id: 'whack-a-mole',
      name: '打地鼠 (Whack-a-mole)',
      description: '反應速度遊戲，訓練快速識別和反應能力',
      icon: '🔨',
      difficulty: 'hard',
      memoryType: '反應記憶',
      features: ['時間限制', '速度挑戰', '分數累積', '難度遞增'],
      status: 'beta',
      estimatedTime: '2-3分鐘'
    },
    {
      id: 'balloon-pop',
      name: '氣球爆破 (Balloon Pop)',
      description: '點擊正確答案的氣球，增加遊戲趣味性',
      icon: '🎈',
      difficulty: 'medium',
      memoryType: '選擇記憶',
      features: ['動畫效果', '音效反饋', '多層難度', '成就系統'],
      status: 'beta',
      estimatedTime: '3-4分鐘'
    },
    {
      id: 'word-search',
      name: '找字遊戲 (Word Search)',
      description: '在字母網格中尋找隱藏的單詞',
      icon: '🔍',
      difficulty: 'medium',
      memoryType: '搜索記憶',
      features: ['網格生成', '方向搜索', '提示功能', '計時挑戰'],
      status: 'coming-soon',
      estimatedTime: '5-8分鐘'
    },
    {
      id: 'crossword',
      name: '填字遊戲 (Crossword)',
      description: '經典填字遊戲，提升詞彙和邏輯思維',
      icon: '📝',
      difficulty: 'hard',
      memoryType: '邏輯記憶',
      features: ['自動生成', '提示系統', '難度調節', '進度保存'],
      status: 'coming-soon',
      estimatedTime: '10-15分鐘'
    },
    {
      id: 'memory-cards',
      name: '記憶卡片 (Memory Cards)',
      description: '翻牌記憶遊戲，訓練短期記憶能力',
      icon: '🃏',
      difficulty: 'medium',
      memoryType: '短期記憶',
      features: ['配對挑戰', '記憶訓練', '難度等級', '時間記錄'],
      status: 'available',
      estimatedTime: '3-6分鐘'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">可用</span>;
      case 'beta':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">測試版</span>;
      case 'coming-soon':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">即將推出</span>;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const startTemplate = (template: GameTemplate) => {
    if (template.status === 'coming-soon') {
      alert('此模板即將推出，敬請期待！');
      return;
    }
    
    // 跳轉到統一內容管理器
    window.open('/unified-content-manager.html', '_blank');
  };

  return (
    <>
      <Head>
        <title>新遊戲模板 - EduCreate</title>
        <meta name="description" content="探索 EduCreate 的全新遊戲模板，包括猜字遊戲、圖片問答、是非題等" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="text-xl font-bold text-gray-900">EduCreate</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/games-showcase" className="text-gray-600 hover:text-gray-900">
                  遊戲展示
                </Link>
                <Link href="/new-templates" className="text-purple-600 font-semibold">
                  新模板
                </Link>
                <Link href="/unified-content-manager.html" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  開始創建
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 全新遊戲模板
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              探索我們最新推出的遊戲模板，為您的教學帶來更多創新和樂趣
            </p>
            <div className="mt-6 flex justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>可用 ({newTemplates.filter(t => t.status === 'available').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>測試版 ({newTemplates.filter(t => t.status === 'beta').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                <span>即將推出 ({newTemplates.filter(t => t.status === 'coming-soon').length})</span>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{template.icon}</div>
                  {getStatusBadge(template.status)}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {template.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">難度:</span>
                    <span className={`font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty === 'easy' ? '簡單' : 
                       template.difficulty === 'medium' ? '中等' : '困難'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">記憶類型:</span>
                    <span className="font-medium text-gray-700">{template.memoryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">預估時間:</span>
                    <span className="font-medium text-gray-700">{template.estimatedTime}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startTemplate(template);
                    }}
                    disabled={template.status === 'coming-soon'}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      template.status === 'coming-soon'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {template.status === 'coming-soon' ? '即將推出' : '開始使用'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">{selectedTemplate.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                {getStatusBadge(selectedTemplate.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">遊戲特色</h3>
                  <ul className="space-y-2">
                    {selectedTemplate.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">遊戲信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">難度等級:</span>
                      <span className={`font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                        {selectedTemplate.difficulty === 'easy' ? '簡單' : 
                         selectedTemplate.difficulty === 'medium' ? '中等' : '困難'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">記憶機制:</span>
                      <span className="font-medium text-gray-900">{selectedTemplate.memoryType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">預估時間:</span>
                      <span className="font-medium text-gray-900">{selectedTemplate.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">狀態:</span>
                      {getStatusBadge(selectedTemplate.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => startTemplate(selectedTemplate)}
                  disabled={selectedTemplate.status === 'coming-soon'}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    selectedTemplate.status === 'coming-soon'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {selectedTemplate.status === 'coming-soon' ? '即將推出' : '🚀 立即體驗'}
                </button>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">想要更多模板？</h2>
              <p className="text-purple-100 mb-6">
                我們持續開發新的遊戲模板，為您的教學帶來更多可能性
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/unified-content-manager.html" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                  開始創建
                </Link>
                <Link href="/games-showcase" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600">
                  查看所有模板
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
