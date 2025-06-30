/**
 * 遊戲展示頁面
 * 展示所有已實現的遊戲組件
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { gameTemplateManager } from '../lib/game-templates/GameTemplateManager';
import GameRenderer from '../components/games/GameRenderer';

export default function GamesShowcase() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [gameData, setGameData] = useState<any>(null);

  const implementedTemplates = gameTemplateManager.getImplementedTemplates();
  const statistics = gameTemplateManager.getStatistics();

  // 為每個遊戲準備示例數據
  const getSampleGameData = (templateId: string) => {
    switch (templateId) {
      case 'quiz':
        return {
          questions: [
            {
              id: '1',
              question: '什麼是光合作用的主要產物？',
              options: ['氧氣和葡萄糖', '二氧化碳和水', '氮氣和蛋白質', '氫氣和澱粉'],
              correctAnswer: 0,
              explanation: '光合作用是植物利用陽光、二氧化碳和水製造葡萄糖和氧氣的過程。'
            },
            {
              id: '2',
              question: '地球上最大的海洋是？',
              options: ['大西洋', '印度洋', '太平洋', '北冰洋'],
              correctAnswer: 2,
              explanation: '太平洋是地球上最大的海洋，面積約為1.65億平方公里。'
            }
          ],
          timeLimit: 120
        };

      case 'complete-sentence':
        return {
          sentences: [
            {
              id: '1',
              text: '貓是一種 [BLANK0] 的 [BLANK1]。',
              blanks: [
                {
                  position: 0,
                  correctWord: '可愛',
                  options: ['可愛', '兇猛', '巨大', '微小']
                },
                {
                  position: 1,
                  correctWord: '動物',
                  options: ['動物', '植物', '礦物', '機器']
                }
              ]
            }
          ],
          timeLimit: 60,
          showHints: true
        };

      case 'spell-word':
        return {
          words: [
            {
              id: '1',
              word: 'EDUCATION',
              hint: '學習和教學的過程',
              pronunciation: 'education'
            },
            {
              id: '2',
              word: 'SCIENCE',
              hint: '研究自然現象的學科',
              pronunciation: 'science'
            }
          ],
          inputMode: 'both',
          showHints: true,
          audioEnabled: true
        };

      case 'labelled-diagram':
        return {
          image: '/images/sample-diagram.jpg',
          labels: [
            {
              id: '1',
              text: '心臟',
              x: 50,
              y: 30,
              tolerance: 30
            },
            {
              id: '2',
              text: '肺部',
              x: 30,
              y: 25,
              tolerance: 25
            }
          ],
          zoomEnabled: true,
          showGrid: false
        };

      case 'watch-memorize':
        return {
          sequence: [
            { id: '1', content: '紅色', duration: 1000, type: 'color' },
            { id: '2', content: '藍色', duration: 1000, type: 'color' },
            { id: '3', content: '綠色', duration: 1000, type: 'color' },
            { id: '4', content: '黃色', duration: 1000, type: 'color' }
          ],
          testType: 'order',
          showDuration: 5,
          maxAttempts: 3
        };

      case 'rank-order':
        return {
          items: [
            {
              id: '1',
              content: '種子發芽',
              correctPosition: 1,
              description: '植物生長的第一階段'
            },
            {
              id: '2',
              content: '幼苗生長',
              correctPosition: 2,
              description: '小植物開始長出葉子'
            },
            {
              id: '3',
              content: '開花結果',
              correctPosition: 3,
              description: '植物成熟並產生花朵'
            },
            {
              id: '4',
              content: '種子散播',
              correctPosition: 4,
              description: '新種子被散播到其他地方'
            }
          ],
          criteria: '按照植物生長的正確順序排列',
          allowPartialCredit: true,
          showPositionNumbers: true
        };

      case 'maths-generator':
        return {
          operations: ['add', 'subtract', 'multiply'],
          range: { min: 1, max: 50 },
          questionCount: 5,
          showSteps: true
        };

      case 'word-magnets':
        return {
          words: [
            { word: '貓', type: 'noun' },
            { word: '狗', type: 'noun' },
            { word: '跑', type: 'verb' },
            { word: '睡覺', type: 'verb' },
            { word: '快樂', type: 'adjective' },
            { word: '可愛', type: 'adjective' },
            { word: '在', type: 'preposition' },
            { word: '的', type: 'article' },
            { word: '很', type: 'adverb' }
          ],
          freeMode: true,
          grammarCheck: true
        };

      default:
        return {};
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setGameData(getSampleGameData(templateId));
  };

  const handleGameComplete = (score: number, timeUsed: number, stats: any) => {
    console.log('Game completed:', { score, timeUsed, stats });
    alert(`遊戲完成！得分: ${score}, 用時: ${timeUsed.toFixed(1)}秒`);
  };

  const handleScoreUpdate = (score: number) => {
    console.log('Score updated:', score);
  };

  return (
    <>
      <Head>
        <title>遊戲展示 - EduCreate</title>
        <meta name="description" content="展示所有基於記憶科學的教育遊戲模板" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎮 遊戲展示中心</h1>
            <p className="text-xl text-gray-600 mb-6">
              體驗基於記憶科學的教育遊戲模板
            </p>
            
            {/* 統計信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{statistics.implemented}</div>
                <div className="text-sm text-gray-600">已實現遊戲</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{Object.keys(statistics.byMemoryType).length}</div>
                <div className="text-sm text-gray-600">記憶類型</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(statistics.byCategory).length}</div>
                <div className="text-sm text-gray-600">遊戲類別</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">{statistics.implementationRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">完成度</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 遊戲選擇側邊欄 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">選擇遊戲</h2>
                
                <div className="space-y-2">
                  {implementedTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{template.displayName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.memoryType} | 難度 {template.difficultyLevel}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.cognitiveLoad === 'low' ? 'bg-green-100 text-green-800' :
                          template.cognitiveLoad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.cognitiveLoad === 'low' ? '低負荷' :
                           template.cognitiveLoad === 'medium' ? '中負荷' : '高負荷'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* 記憶類型統計 */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-700 mb-3">記憶類型分布</h3>
                  <div className="space-y-2">
                    {Object.entries(statistics.byMemoryType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 遊戲展示區域 */}
            <div className="lg:col-span-3">
              {selectedTemplateId ? (
                <div className="bg-white rounded-lg shadow">
                  <GameRenderer
                    templateId={selectedTemplateId}
                    gameData={gameData}
                    onGameComplete={handleGameComplete}
                    onScoreUpdate={handleScoreUpdate}
                    className="p-6"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">選擇一個遊戲開始體驗</h3>
                  <p className="text-gray-600">
                    從左側選擇任意遊戲模板，立即開始體驗基於記憶科學的教育遊戲
                  </p>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🧠 記憶科學</h4>
                      <p className="text-blue-800 text-sm">
                        每個遊戲都基於特定的記憶機制設計，提供科學的學習體驗
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">🎯 個性化</h4>
                      <p className="text-green-800 text-sm">
                        根據認知負荷和難度級別，提供適合的學習挑戰
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">📊 數據追蹤</h4>
                      <p className="text-purple-800 text-sm">
                        實時追蹤學習進度和成績，提供詳細的分析報告
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">🚀 高效學習</h4>
                      <p className="text-orange-800 text-sm">
                        通過遊戲化學習，提高學習效率和記憶保持率
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
