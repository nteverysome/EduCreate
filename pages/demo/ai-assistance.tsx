/**
 * AI智能輔助演示頁面
 * 展示內容推薦、難度調整、個人化學習和無障礙輔助功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import Layout from '../../components/Layout';
import IntelligentAssistancePanel from '../../components/ai/IntelligentAssistancePanel';

interface AIAssistanceDemoProps {
  userId: string;
}

export default function AIAssistanceDemo({ userId }: AIAssistanceDemoProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [difficultyAdjustment, setDifficultyAdjustment] = useState<any>(null);
  const [contentAdaptation, setContentAdaptation] = useState<any>(null);
  const [currentContent, setCurrentContent] = useState<any>({
    title: '英語學習遊戲',
    description: '這是一個幫助學習英語詞彙的配對遊戲',
    type: 'matching',
    difficulty: 0.6,
    content: {
      text: '請將英語單詞與中文意思配對',
      images: ['word1.jpg', 'word2.jpg'],
      audio: 'pronunciation.mp3'
    },
    buttons: [
      { id: 'start', label: '開始遊戲', size: 'medium' },
      { id: 'help', label: '幫助', size: 'small' }
    ]
  });

  // 處理推薦選擇
  const handleRecommendationSelect = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    console.log('選擇推薦:', recommendation);
  };

  // 處理難度調整
  const handleDifficultyAdjust = (adjustment: any) => {
    setDifficultyAdjustment(adjustment);
    
    // 應用難度調整到當前內容
    if (adjustment.adjustmentType !== 'maintain') {
      setCurrentContent(prev => ({
        ...prev,
        difficulty: adjustment.recommendedDifficulty
      }));
    }
    
    console.log('難度調整:', adjustment);
  };

  // 處理內容適配
  const handleContentAdapt = (adaptation: any) => {
    setContentAdaptation(adaptation);
    
    // 應用內容適配
    setCurrentContent(adaptation.adaptedContent);
    
    console.log('內容適配:', adaptation);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI智能輔助演示
          </h1>
          <p className="text-gray-600">
            體驗智能內容推薦、自適應難度調整、個人化學習路徑和無障礙輔助功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI輔助面板 */}
          <div className="lg:col-span-2">
            <IntelligentAssistancePanel
              userId={userId}
              currentContent={currentContent}
              onRecommendationSelect={handleRecommendationSelect}
              onDifficultyAdjust={handleDifficultyAdjust}
              onContentAdapt={handleContentAdapt}
            />
          </div>

          {/* 側邊欄 - 當前狀態和結果 */}
          <div className="space-y-6">
            {/* 當前內容狀態 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">當前內容狀態</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">標題:</span>
                  <div className="font-medium">{currentContent.title}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">類型:</span>
                  <div className="font-medium">{currentContent.type}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">難度:</span>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${currentContent.difficulty * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(currentContent.difficulty * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">描述:</span>
                  <div className="text-sm text-gray-700">{currentContent.description}</div>
                </div>
              </div>
            </div>

            {/* 選中的推薦 */}
            {selectedRecommendation && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  🎯 選中的推薦
                </h3>
                
                <div className="space-y-2">
                  <div className="font-medium text-blue-900">
                    {selectedRecommendation.title}
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedRecommendation.description}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">
                      預估時間: {selectedRecommendation.estimatedTime} 分鐘
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      信心度: {(selectedRecommendation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  {selectedRecommendation.reasoning && (
                    <div className="mt-3">
                      <div className="text-xs text-blue-600 mb-1">推薦理由:</div>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {selectedRecommendation.reasoning.map((reason: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 難度調整結果 */}
            {difficultyAdjustment && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  📊 難度調整結果
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">調整類型:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      difficultyAdjustment.adjustmentType === 'increase' ? 'bg-red-100 text-red-800' :
                      difficultyAdjustment.adjustmentType === 'decrease' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {difficultyAdjustment.adjustmentType === 'increase' ? '增加難度' :
                       difficultyAdjustment.adjustmentType === 'decrease' ? '降低難度' : '維持難度'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">調整幅度:</span>
                    <span className="text-sm font-medium text-green-900">
                      {difficultyAdjustment.magnitude}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">信心度:</span>
                    <span className="text-sm font-medium text-green-900">
                      {(difficultyAdjustment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-green-700">調整原因:</span>
                    <div className="text-sm text-green-800 mt-1">
                      {difficultyAdjustment.adjustmentReason}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-green-700">預期效果:</span>
                    <div className="text-sm text-green-800 mt-1">
                      {difficultyAdjustment.expectedImpact}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 內容適配結果 */}
            {contentAdaptation && (
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  ♿ 內容適配結果
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">無障礙分數:</span>
                    <span className="text-sm font-medium text-purple-900">
                      {(contentAdaptation.accessibilityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">WCAG等級:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      contentAdaptation.wcagCompliance.level === 'AAA' ? 'bg-green-100 text-green-800' :
                      contentAdaptation.wcagCompliance.level === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {contentAdaptation.wcagCompliance.level}
                    </span>
                  </div>
                  
                  {contentAdaptation.adaptations.length > 0 && (
                    <div>
                      <span className="text-sm text-purple-700">應用的適配:</span>
                      <ul className="text-xs text-purple-800 mt-1 space-y-1">
                        {contentAdaptation.adaptations.map((adaptation: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{adaptation.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {contentAdaptation.wcagCompliance.violations.length > 0 && (
                    <div>
                      <span className="text-sm text-purple-700">需要改進:</span>
                      <ul className="text-xs text-purple-800 mt-1 space-y-1">
                        {contentAdaptation.wcagCompliance.violations.map((violation: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">⚠️</span>
                            <span>{violation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 功能說明 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">功能說明</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <div className="font-medium text-gray-900 mb-1">🎯 智能推薦</div>
                  <div>基於學習歷史和偏好生成個人化內容推薦</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">📊 難度調整</div>
                  <div>實時分析學習表現，智能調整內容難度</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">🛤️ 學習路徑</div>
                  <div>生成個人化學習路徑和進度追蹤</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">♿ 無障礙輔助</div>
                  <div>智能檢測需求並適配內容以提升可訪問性</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 技術特色展示 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-blue-900 mb-2">機器學習</h3>
            <p className="text-sm text-blue-700">
              基於用戶行為數據的智能學習算法
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-green-900 mb-2">實時適配</h3>
            <p className="text-sm text-green-700">
              即時分析學習狀態並動態調整內容
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-purple-900 mb-2">個人化</h3>
            <p className="text-sm text-purple-700">
              為每個學習者量身定制的學習體驗
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">♿</div>
            <h3 className="font-semibold text-orange-900 mb-2">無障礙</h3>
            <p className="text-sm text-orange-700">
              智能無障礙支持，確保人人可用
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: session.user.id,
    },
  };
};
