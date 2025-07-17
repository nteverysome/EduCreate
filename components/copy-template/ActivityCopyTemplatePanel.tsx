/**
 * 活動複製和模板化面板組件
 * 智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ActivityCopyTemplatePanelProps {
  userId: string;
  enableSmartAdaptation?: boolean;
  enableCrossLevelConversion?: boolean;
  enableTemplateCreation?: boolean;
  enableGeptIntegration?: boolean;
  enableMemoryScience?: boolean;
}

interface Activity {
  id: string;
  name: string;
  type: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
  memoryScience: string[];
  contentItems: number;
  difficulty: number;
  estimatedTime: number;
}

interface CopyOptions {
  type: 'complete' | 'structure' | 'adaptive' | 'template';
  targetGeptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  adaptationSettings: {
    preserveMemoryScience: boolean;
    adjustDifficulty: boolean;
    convertVocabulary: boolean;
    maintainStructure: boolean;
  };
  templateSettings?: {
    name: string;
    description: string;
    isPublic: boolean;
    category: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  geptLevel: string;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  isPublic: boolean;
  memoryScience: string[];
}

export const ActivityCopyTemplatePanel: React.FC<ActivityCopyTemplatePanelProps> = ({
  userId,
  enableSmartAdaptation = true,
  enableCrossLevelConversion = true,
  enableTemplateCreation = true,
  enableGeptIntegration = true,
  enableMemoryScience = true
}) => {
  const [activeTab, setActiveTab] = useState<'copy' | 'template' | 'my-templates'>('copy');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [copyOptions, setCopyOptions] = useState<CopyOptions>({
    type: 'complete',
    adaptationSettings: {
      preserveMemoryScience: true,
      adjustDifficulty: false,
      convertVocabulary: false,
      maintainStructure: true
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // 模擬活動數據
  const [activities] = useState<Activity[]>([
    {
      id: 'act-1',
      name: '英語基礎測驗',
      type: 'quiz',
      geptLevel: 'elementary',
      createdAt: new Date('2025-07-15'),
      status: 'published',
      memoryScience: ['主動回憶', '間隔重複'],
      contentItems: 20,
      difficulty: 3,
      estimatedTime: 15
    },
    {
      id: 'act-2',
      name: '中級閱讀理解',
      type: 'reading',
      geptLevel: 'intermediate',
      createdAt: new Date('2025-07-14'),
      status: 'published',
      memoryScience: ['語境記憶', '邏輯推理'],
      contentItems: 15,
      difficulty: 5,
      estimatedTime: 25
    },
    {
      id: 'act-3',
      name: '高級寫作練習',
      type: 'writing',
      geptLevel: 'high-intermediate',
      createdAt: new Date('2025-07-13'),
      status: 'draft',
      memoryScience: ['批判思維', '創意表達'],
      contentItems: 10,
      difficulty: 7,
      estimatedTime: 40
    }
  ]);

  // 模擬模板數據
  const [templates] = useState<Template[]>([
    {
      id: 'tpl-1',
      name: '基礎詞彙測驗模板',
      description: '適用於初級英語詞彙測試的標準模板',
      category: '測驗',
      geptLevel: 'elementary',
      createdBy: userId,
      createdAt: new Date('2025-07-10'),
      usageCount: 15,
      isPublic: false,
      memoryScience: ['主動回憶', '間隔重複']
    },
    {
      id: 'tpl-2',
      name: '閱讀理解模板',
      description: '中級閱讀理解活動的通用模板',
      category: '閱讀',
      geptLevel: 'intermediate',
      createdBy: userId,
      createdAt: new Date('2025-07-08'),
      usageCount: 8,
      isPublic: true,
      memoryScience: ['語境記憶', '理解策略']
    }
  ]);

  const handleCopyActivity = async () => {
    if (!selectedActivity) {
      alert('請選擇要複製的活動');
      return;
    }

    setIsProcessing(true);
    try {
      // 模擬複製處理
      await new Promise(resolve => setTimeout(resolve, 2000));

      const activity = activities.find(a => a.id === selectedActivity);
      if (!activity) return;

      let message = `成功複製活動「${activity.name}」`;
      
      if (copyOptions.type === 'adaptive' && copyOptions.targetGeptLevel) {
        message += `，並適配到 ${getGeptLevelName(copyOptions.targetGeptLevel)} 等級`;
      }
      
      if (copyOptions.type === 'template' && copyOptions.templateSettings) {
        message = `成功從活動「${activity.name}」創建模板「${copyOptions.templateSettings.name}」`;
      }

      alert(message);
    } catch (error) {
      alert('複製失敗：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGeptLevelName = (level: string) => {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCopyTypeIcon = (type: string) => {
    switch (type) {
      case 'complete': return '📄';
      case 'structure': return '🎯';
      case 'adaptive': return '🔄';
      case 'template': return '📚';
      default: return '📋';
    }
  };

  const getCopyTypeName = (type: string) => {
    switch (type) {
      case 'complete': return '完整複製';
      case 'structure': return '結構複製';
      case 'adaptive': return '適配複製';
      case 'template': return '模板複製';
      default: return '未知';
    }
  };

  return (
    <div className="p-6" data-testid="activity-copy-template-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('copy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'copy'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="copy-tab"
        >
          📋 複製活動
        </button>
        {enableTemplateCreation && (
          <button
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'template'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="template-tab"
          >
            📚 創建模板
          </button>
        )}
        <button
          onClick={() => setActiveTab('my-templates')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'my-templates'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="my-templates-tab"
        >
          🗂️ 我的模板
        </button>
      </div>

      {/* 複製活動標籤 */}
      {activeTab === 'copy' && (
        <div data-testid="copy-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">複製活動</h3>
          
          {/* 活動選擇 */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">選擇要複製的活動</h4>
            <div className="space-y-3">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedActivity === activity.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedActivity(activity.id)}
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedActivity === activity.id}
                        onChange={() => setSelectedActivity(activity.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">{activity.name}</h5>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>類型: {activity.type}</span>
                          <span>•</span>
                          <span>內容項目: {activity.contentItems}</span>
                          <span>•</span>
                          <span>預估時間: {activity.estimatedTime}分鐘</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(activity.geptLevel)}`}>
                        {getGeptLevelName(activity.geptLevel)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  {enableMemoryScience && activity.memoryScience.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activity.memoryScience.map((technique, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 複製選項 */}
          {selectedActivity && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">複製選項</h4>
              
              {/* 複製類型 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">複製類型：</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['complete', 'structure', 'adaptive', 'template'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCopyOptions(prev => ({ ...prev, type: type as any }))}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        copyOptions.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      data-testid={`copy-type-${type}`}
                    >
                      <div className="text-2xl mb-1">{getCopyTypeIcon(type)}</div>
                      <div className="text-sm font-medium">{getCopyTypeName(type)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 跨等級轉換 */}
              {enableCrossLevelConversion && copyOptions.type === 'adaptive' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">目標GEPT等級：</label>
                  <select
                    value={copyOptions.targetGeptLevel || ''}
                    onChange={(e) => setCopyOptions(prev => ({ 
                      ...prev, 
                      targetGeptLevel: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    data-testid="target-gept-level"
                  >
                    <option value="">選擇目標等級</option>
                    <option value="elementary">初級 (Elementary)</option>
                    <option value="intermediate">中級 (Intermediate)</option>
                    <option value="high-intermediate">中高級 (High-Intermediate)</option>
                  </select>
                </div>
              )}

              {/* 模板設置 */}
              {copyOptions.type === 'template' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱：</label>
                    <input
                      type="text"
                      value={copyOptions.templateSettings?.name || ''}
                      onChange={(e) => setCopyOptions(prev => ({
                        ...prev,
                        templateSettings: { ...prev.templateSettings!, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="輸入模板名稱"
                      data-testid="template-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">模板描述：</label>
                    <textarea
                      value={copyOptions.templateSettings?.description || ''}
                      onChange={(e) => setCopyOptions(prev => ({
                        ...prev,
                        templateSettings: { ...prev.templateSettings!, description: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="輸入模板描述"
                      data-testid="template-description"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={copyOptions.templateSettings?.isPublic || false}
                      onChange={(e) => setCopyOptions(prev => ({
                        ...prev,
                        templateSettings: { ...prev.templateSettings!, isPublic: e.target.checked }
                      }))}
                      className="mr-2"
                      data-testid="template-public"
                    />
                    <label className="text-sm text-gray-700">公開模板（其他用戶可以使用）</label>
                  </div>
                </div>
              )}

              {/* 適配設置 */}
              {enableSmartAdaptation && (copyOptions.type === 'adaptive' || copyOptions.type === 'template') && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">適配設置：</h5>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={copyOptions.adaptationSettings.preserveMemoryScience}
                        onChange={(e) => setCopyOptions(prev => ({
                          ...prev,
                          adaptationSettings: { ...prev.adaptationSettings, preserveMemoryScience: e.target.checked }
                        }))}
                        className="mr-2"
                        data-testid="preserve-memory-science"
                      />
                      <span className="text-sm text-gray-700">保留記憶科學設置</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={copyOptions.adaptationSettings.adjustDifficulty}
                        onChange={(e) => setCopyOptions(prev => ({
                          ...prev,
                          adaptationSettings: { ...prev.adaptationSettings, adjustDifficulty: e.target.checked }
                        }))}
                        className="mr-2"
                        data-testid="adjust-difficulty"
                      />
                      <span className="text-sm text-gray-700">自動調整難度</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={copyOptions.adaptationSettings.convertVocabulary}
                        onChange={(e) => setCopyOptions(prev => ({
                          ...prev,
                          adaptationSettings: { ...prev.adaptationSettings, convertVocabulary: e.target.checked }
                        }))}
                        className="mr-2"
                        data-testid="convert-vocabulary"
                      />
                      <span className="text-sm text-gray-700">轉換詞彙等級</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={copyOptions.adaptationSettings.maintainStructure}
                        onChange={(e) => setCopyOptions(prev => ({
                          ...prev,
                          adaptationSettings: { ...prev.adaptationSettings, maintainStructure: e.target.checked }
                        }))}
                        className="mr-2"
                        data-testid="maintain-structure"
                      />
                      <span className="text-sm text-gray-700">保持原始結構</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 複製按鈕 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedActivity ? `已選擇活動：${activities.find(a => a.id === selectedActivity)?.name}` : '請選擇要複製的活動'}
            </div>
            <button
              onClick={handleCopyActivity}
              disabled={!selectedActivity || isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              data-testid="copy-button"
            >
              {isProcessing ? '處理中...' : `開始${getCopyTypeName(copyOptions.type)}`}
            </button>
          </div>
        </div>
      )}

      {/* 我的模板標籤 */}
      {activeTab === 'my-templates' && (
        <div data-testid="my-templates-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">我的模板</h3>
          
          {/* 模板統計 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                <div className="text-blue-800">總模板數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.isPublic).length}
                </div>
                <div className="text-green-800">公開模板</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </div>
                <div className="text-orange-800">總使用次數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(templates.map(t => t.category)).size}
                </div>
                <div className="text-purple-800">模板分類</div>
              </div>
            </div>
          </div>

          {/* 模板列表 */}
          <div className="space-y-4">
            {templates.map(template => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(template.geptLevel)}`}>
                      {getGeptLevelName(template.geptLevel)}
                    </span>
                    {template.isPublic && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        公開
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>分類: {template.category}</span>
                    <span>使用次數: {template.usageCount}</span>
                    <span>創建: {template.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                      使用模板
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                      編輯
                    </button>
                  </div>
                </div>

                {enableMemoryScience && template.memoryScience.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.memoryScience.map((technique, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 完整複製：複製所有內容和設置，適合創建相似活動</p>
          <p>• 結構複製：只複製活動結構，需要重新填入內容</p>
          <p>• 適配複製：智能轉換到不同GEPT等級，自動調整內容難度</p>
          <p>• 模板複製：創建可重複使用的模板，支持參數化配置</p>
          <p>• 記憶科學：保留間隔重複、主動回憶等記憶科學設置</p>
          <p>• GEPT整合：自動檢測和轉換GEPT等級，保持學習連貫性</p>
        </div>
      </div>
    </div>
  );
};
