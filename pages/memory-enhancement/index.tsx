/**
 * 記憶增強系統主頁面
 * 基於 25 個 WordWall 模板分析的記憶科學原理
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MemoryEnhancementDashboard from '../../components/memory-enhancement/MemoryEnhancementDashboard';
import MemoryAnalysisChart from '../../components/memory-enhancement/MemoryAnalysisChart';

export default function MemoryEnhancementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>('dashboard');
  const [selectedChartType, setSelectedChartType] = useState<'memory-distribution' | 'cognitive-load' | 'difficulty-analysis' | 'enhancement-features'>('memory-distribution');

  const handleTemplateSelect = (templateId: string) => {
    // 導航到模板創建頁面
    router.push(`/create?template=${templateId}`);
  };

  const tabs = [
    { id: 'dashboard', name: '記憶增強儀表板', icon: '🧠' },
    { id: 'analysis', name: '記憶科學分析', icon: '📊' }
  ];

  const chartTypes = [
    { id: 'memory-distribution', name: '記憶類型分布' },
    { id: 'cognitive-load', name: '認知負荷分析' },
    { id: 'difficulty-analysis', name: '難度級別分析' },
    { id: 'enhancement-features', name: '增強特性分析' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">EduCreate 記憶增強系統</h1>
                  <p className="mt-2 text-gray-600">
                    基於 25 個 WordWall 模板分析的記憶科學原理，提供個性化學習體驗
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    25 個模板已分析
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    73.5% 完成度
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {activeTab === 'dashboard' && (
            <div>
              <MemoryEnhancementDashboard onTemplateSelect={handleTemplateSelect} />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* 圖表類型選擇 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">選擇分析類型</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {chartTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedChartType(type.id as any)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedChartType === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 分析圖表 */}
              <MemoryAnalysisChart chartType={selectedChartType} />

              {/* 記憶科學洞察 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">記憶科學洞察</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">🧠 神經科學基礎</h3>
                    <p className="text-blue-800 text-sm">
                      基於海馬體、前額葉皮層、杏仁核等腦區的記憶機制，設計針對性的學習體驗。
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">⚡ 認知負荷優化</h3>
                    <p className="text-green-800 text-sm">
                      通過調節認知負荷，確保學習者在最佳狀態下進行記憶編碼和檢索。
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">🎯 個性化適應</h3>
                    <p className="text-purple-800 text-sm">
                      根據學習者的能力水平和偏好，動態調整模板配置和難度級別。
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">🔄 間隔重複</h3>
                    <p className="text-orange-800 text-sm">
                      基於遺忘曲線理論，實現智能的間隔重複算法，最大化記憶保持效果。
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">⏱️ 時間壓力效應</h3>
                    <p className="text-red-800 text-sm">
                      適度的時間壓力激活壓力激素，增強記憶鞏固效果。
                    </p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <h3 className="font-semibold text-cyan-900 mb-2">🏆 競爭機制</h3>
                    <p className="text-cyan-800 text-sm">
                      競爭環境激發多巴胺釋放，提高學習動機和記憶效果。
                    </p>
                  </div>
                </div>
              </div>

              {/* WordWall 分析總結 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">WordWall 分析總結</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">🔬 科學發現</h3>
                    <ul className="space-y-1 text-sm opacity-90">
                      <li>• 25 種不同記憶類型的完整覆蓋</li>
                      <li>• 認知負荷的精確控制機制</li>
                      <li>• 多感官學習體驗的設計原理</li>
                      <li>• 情緒記憶增強的有效策略</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🚀 技術優勢</h3>
                    <ul className="space-y-1 text-sm opacity-90">
                      <li>• 基於神經科學的模板設計</li>
                      <li>• 個性化學習路徑生成</li>
                      <li>• 實時記憶效果監測</li>
                      <li>• 智能難度調節算法</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm opacity-90">
                    通過深度分析 WordWall 的 25 個模板，我們構建了一個基於記憶科學的完整學習系統，
                    為 EduCreate 用戶提供最優化的學習體驗。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
