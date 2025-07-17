/**
 * 記憶增強儀表板組件
 * 基於 25 個 WordWall 模板分析的記憶科學原理
 */
import React, { useState, useEffect } from 'react';
import { MemoryConfigurationManager, TemplateMemoryMapping } from '../../lib/memory-enhancement/MemoryConfigurationManager';
import { MemoryType, MemoryEnhancementEngine } from '../../lib/memory-enhancement/MemoryEnhancementEngine';
interface MemoryEnhancementDashboardProps {
  onTemplateSelect?: (templateId: string) => void;
  userLevel?: number;
  preferredMemoryTypes?: string[];
}
export default function MemoryEnhancementDashboard({ 
  onTemplateSelect, 
  userLevel = 1, 
  preferredMemoryTypes = [] 
}: MemoryEnhancementDashboardProps) {
  const [manager] = useState(() => new MemoryConfigurationManager());
  const [engine] = useState(() => new MemoryEnhancementEngine());
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [showTimeConstraints, setShowTimeConstraints] = useState<boolean>(false);
  const [showCompetitive, setShowCompetitive] = useState<boolean>(false);
  const [recommendedTemplates, setRecommendedTemplates] = useState<TemplateMemoryMapping[]>([]);
  const [allMemoryTypes, setAllMemoryTypes] = useState<MemoryType[]>([]);
  useEffect(() => {
    // 初始化數據
    setAllMemoryTypes(engine.getAllMemoryTypes());
    updateRecommendedTemplates();
  }, []);
  useEffect(() => {
    updateRecommendedTemplates();
  }, [selectedMemoryType, selectedDifficulty, showTimeConstraints, showCompetitive]);
  const updateRecommendedTemplates = () => {
    let templates = manager.getAllTemplateMappings();
    // 根據記憶類型篩選
    if (selectedMemoryType !== 'all') {
      templates = manager.getTemplatesByMemoryType(selectedMemoryType);
    }
    // 根據難度篩選
    if (selectedDifficulty > 0) {
      templates = templates.filter(t => t.optimalConfiguration.difficultyLevel === selectedDifficulty);
    }
    // 根據時間約束篩選
    if (showTimeConstraints) {
      templates = templates.filter(t => t.optimalConfiguration.timeConstraints.enabled);
    }
    // 根據競爭機制篩選
    if (showCompetitive) {
      templates = templates.filter(t => t.optimalConfiguration.competitiveElements.enabled);
    }
    setRecommendedTemplates(templates);
  };
  const getMemoryTypeColor = (memoryType: string): string => {
    const colors: { [key: string]: string } = {
      'recognition': 'bg-blue-100 text-blue-800',
      'generative': 'bg-green-100 text-green-800',
      'reconstructive': 'bg-yellow-100 text-yellow-800',
      'spatial': 'bg-purple-100 text-purple-800',
      'stress-enhanced': 'bg-red-100 text-red-800',
      'associative': 'bg-indigo-100 text-indigo-800',
      'emotional': 'bg-pink-100 text-pink-800',
      'active-recall': 'bg-orange-100 text-orange-800',
      'visual-search': 'bg-teal-100 text-teal-800',
      'reaction-speed': 'bg-red-200 text-red-900',
      'visual-recognition': 'bg-cyan-100 text-cyan-800'
    };
    return colors[memoryType] || 'bg-gray-100 text-gray-800';
  };
  const getDifficultyColor = (level: number): string => {
    const colors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800'];
    return colors[level - 1] || 'bg-gray-100 text-gray-800';
  };
  const getCognitiveLoadIcon = (load: string): string => {
    switch (load) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">記憶增強系統</h2>
        <p className="text-gray-600">基於 25 個 WordWall 模板分析的記憶科學原理</p>
      </div>
      {/* 篩選控制 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">記憶類型</label>
          <select
            value={selectedMemoryType}
            onChange={(e) => setSelectedMemoryType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有類型</option>
            {allMemoryTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">難度級別</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>所有難度</option>
            <option value={1}>初級 (1)</option>
            <option value={2}>中級 (2)</option>
            <option value={3}>高級 (3)</option>
            <option value={4}>專家 (4)</option>
            <option value={5}>大師 (5)</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showTimeConstraints}
              onChange={(e) => setShowTimeConstraints(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">時間壓力</span>
          </label>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showCompetitive}
              onChange={(e) => setShowCompetitive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">競爭機制</span>
          </label>
        </div>
      </div>
      {/* 記憶類型概覽 */}
      {selectedMemoryType !== 'all' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {(() => {
            const memoryType = engine.getMemoryType(selectedMemoryType);
            if (!memoryType) return null;
            return (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getCognitiveLoadIcon(memoryType.cognitiveLoad)} {memoryType.name}
                </h3>
                <p className="text-gray-600 mb-3">{memoryType.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">神經基礎</h4>
                    <div className="flex flex-wrap gap-1">
                      {memoryType.neuralBasis.map((basis, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {basis}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">增強策略</h4>
                    <div className="flex flex-wrap gap-1">
                      {memoryType.enhancementStrategies.map((strategy, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {strategy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {/* 推薦模板 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          推薦模板 ({recommendedTemplates.length})
        </h3>
        {recommendedTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>沒有找到符合條件的模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTemplates.map(template => (
              <div
                key={template.templateId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTemplateSelect?.(template.templateId)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{template.templateName}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(template.optimalConfiguration.difficultyLevel)}`}>
                    難度 {template.optimalConfiguration.difficultyLevel}
                  </span>
                </div>
                <div className="mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${getMemoryTypeColor(template.primaryMemoryType)}`}>
                    {engine.getMemoryType(template.primaryMemoryType)?.name}
                  </span>
                  {template.secondaryMemoryTypes.slice(0, 2).map(type => (
                    <span key={type} className={`ml-1 px-2 py-1 text-xs rounded ${getMemoryTypeColor(type)}`}>
                      {engine.getMemoryType(type)?.name}
                    </span>
                  ))}
                </div>
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">增強特性</h5>
                  <div className="flex flex-wrap gap-1">
                    {template.enhancementFeatures.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex space-x-2">
                    {template.optimalConfiguration.timeConstraints.enabled && (
                      <span className="flex items-center">
                        ⏱️ 時間壓力
                      </span>
                    )}
                    {template.optimalConfiguration.competitiveElements.enabled && (
                      <span className="flex items-center">
                        🏆 競爭
                      </span>
                    )}
                    {template.optimalConfiguration.repetitionSettings.spacedRepetition && (
                      <span className="flex items-center">
                        🔄 間隔重複
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 hover:text-blue-800">
                    選擇模板 →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 記憶科學統計 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">記憶科學統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{allMemoryTypes.length}</div>
            <div className="text-sm text-gray-600">記憶類型</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{manager.getAllTemplateMappings().length}</div>
            <div className="text-sm text-gray-600">分析模板</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{manager.getTimePressureTemplates().length}</div>
            <div className="text-sm text-gray-600">時間壓力</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{manager.getCompetitiveTemplates().length}</div>
            <div className="text-sm text-gray-600">競爭機制</div>
          </div>
        </div>
      </div>
    </div>
  );
}
