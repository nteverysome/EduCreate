/**
 * 活動模板和快速創建面板組件
 * 展示基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ActivityTemplatesPanelProps {
  userId: string;
  showGeptLevels?: boolean;
  showQuickCreate?: boolean;
  enableBatchCreate?: boolean;
  enablePreview?: boolean;
}

interface GameTemplate {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  difficulty: number;
  estimatedTime: number;
  memoryScience: string[];
  features: string[];
  isPopular: boolean;
}

interface CreatedActivity {
  id: string;
  templateId: string;
  name: string;
  type: string;
  geptLevel: string;
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
}

export const ActivityTemplatesPanel: React.FC<ActivityTemplatesPanelProps> = ({
  userId,
  showGeptLevels = true,
  showQuickCreate = true,
  enableBatchCreate = false,
  enablePreview = true
}) => {
  const [activeGeptLevel, setActiveGeptLevel] = useState<'elementary' | 'intermediate' | 'high-intermediate'>('elementary');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [createdActivities, setCreatedActivities] = useState<CreatedActivity[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showCreated, setShowCreated] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [activeGeptLevel]);

  const loadTemplates = async () => {
    setIsLoading(true);
    
    // 模擬數據載入
    setTimeout(() => {
      const allTemplates: GameTemplate[] = [
        // Elementary 模板
        {
          id: 'quiz-elem',
          name: '基礎測驗問答',
          type: 'quiz',
          icon: '❓',
          description: '適合初學者的簡單問答遊戲',
          geptLevel: 'elementary',
          difficulty: 3,
          estimatedTime: 10,
          memoryScience: ['主動回憶', '間隔重複'],
          features: ['圖片提示', '音效回饋', '進度追蹤'],
          isPopular: true
        },
        {
          id: 'match-elem',
          name: '圖文配對',
          type: 'matching',
          icon: '🔗',
          description: '圖片與文字的配對練習',
          geptLevel: 'elementary',
          difficulty: 2,
          estimatedTime: 8,
          memoryScience: ['視覺記憶', '關聯學習'],
          features: ['拖拽操作', '即時反饋', '錯誤提示'],
          isPopular: true
        },
        {
          id: 'flashcard-elem',
          name: '基礎記憶卡片',
          type: 'flashcard',
          icon: '📚',
          description: '翻轉式記憶卡片練習',
          geptLevel: 'elementary',
          difficulty: 2,
          estimatedTime: 12,
          memoryScience: ['間隔重複', '主動回憶'],
          features: ['自動翻轉', '難度標記', '複習提醒'],
          isPopular: false
        },
        // Intermediate 模板
        {
          id: 'quiz-inter',
          name: '進階選擇題',
          type: 'quiz',
          icon: '❓',
          description: '多選題和複雜情境問答',
          geptLevel: 'intermediate',
          difficulty: 5,
          estimatedTime: 15,
          memoryScience: ['邏輯推理', '情境記憶'],
          features: ['多選支持', '解析說明', '時間限制'],
          isPopular: true
        },
        {
          id: 'fill-inter',
          name: '情境填空',
          type: 'fill-blank',
          icon: '✏️',
          description: '基於真實情境的填空練習',
          geptLevel: 'intermediate',
          difficulty: 6,
          estimatedTime: 18,
          memoryScience: ['語境記憶', '應用練習'],
          features: ['智能提示', '語法檢查', '同義詞建議'],
          isPopular: false
        },
        // High-Intermediate 模板
        {
          id: 'debate-high',
          name: '辯論遊戲',
          type: 'debate',
          icon: '🎭',
          description: '角色扮演辯論練習',
          geptLevel: 'high-intermediate',
          difficulty: 8,
          estimatedTime: 25,
          memoryScience: ['批判思維', '論證結構'],
          features: ['角色分配', '論點評分', '反駁機制'],
          isPopular: true
        }
      ];

      // 根據選擇的 GEPT 等級過濾模板
      const filteredTemplates = allTemplates.filter(template => template.geptLevel === activeGeptLevel);
      setTemplates(filteredTemplates);

      // 模擬已創建的活動
      setCreatedActivities([
        {
          id: 'created-1',
          templateId: 'quiz-elem',
          name: '我的英語測驗',
          type: 'quiz',
          geptLevel: 'elementary',
          createdAt: new Date('2025-07-15'),
          status: 'published'
        },
        {
          id: 'created-2',
          templateId: 'match-elem',
          name: '動物配對遊戲',
          type: 'matching',
          geptLevel: 'elementary',
          createdAt: new Date('2025-07-14'),
          status: 'draft'
        }
      ]);

      setIsLoading(false);
    }, 1500);
  };

  const handleQuickCreate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newActivity: CreatedActivity = {
        id: `created-${Date.now()}`,
        templateId: templateId,
        name: `新的${template.name}`,
        type: template.type,
        geptLevel: template.geptLevel,
        createdAt: new Date(),
        status: 'draft'
      };
      setCreatedActivities([newActivity, ...createdActivities]);
      alert(`成功創建：${newActivity.name}`);
    }
  };

  const handleBatchCreate = () => {
    if (selectedTemplates.length === 0) {
      alert('請先選擇要批量創建的模板');
      return;
    }

    const newActivities = selectedTemplates.map(templateId => {
      const template = templates.find(t => t.id === templateId);
      return {
        id: `created-${Date.now()}-${templateId}`,
        templateId: templateId,
        name: `批量創建-${template?.name}`,
        type: template?.type || 'unknown',
        geptLevel: template?.geptLevel || 'elementary',
        createdAt: new Date(),
        status: 'draft' as const
      };
    });

    setCreatedActivities([...newActivities, ...createdActivities]);
    setSelectedTemplates([]);
    alert(`成功批量創建 ${newActivities.length} 個活動`);
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
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

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(Math.min(difficulty, 5));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入活動模板中...</p>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="activity-templates-panel">
      {/* GEPT 等級選擇 */}
      {showGeptLevels && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">選擇 GEPT 等級</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveGeptLevel('elementary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeGeptLevel === 'elementary'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              data-testid="elementary-level-button"
            >
              初級 (Elementary)
            </button>
            <button
              onClick={() => setActiveGeptLevel('intermediate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeGeptLevel === 'intermediate'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
              data-testid="intermediate-level-button"
            >
              中級 (Intermediate)
            </button>
            <button
              onClick={() => setActiveGeptLevel('high-intermediate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeGeptLevel === 'high-intermediate'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
              data-testid="high-intermediate-level-button"
            >
              中高級 (High-Intermediate)
            </button>
          </div>
        </div>
      )}

      {/* 功能切換 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreated(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showCreated
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="templates-view-button"
          >
            🚀 模板庫 ({templates.length})
          </button>
          <button
            onClick={() => setShowCreated(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showCreated
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="created-activities-button"
          >
            📝 已創建 ({createdActivities.length})
          </button>
        </div>

        {/* 批量操作 */}
        {enableBatchCreate && !showCreated && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              已選擇 {selectedTemplates.length} 個模板
            </span>
            <button
              onClick={handleBatchCreate}
              disabled={selectedTemplates.length === 0}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300"
              data-testid="batch-create-button"
            >
              批量創建
            </button>
          </div>
        )}
      </div>

      {/* 模板庫視圖 */}
      {!showCreated && (
        <div data-testid="templates-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border-2 ${
                  selectedTemplates.includes(template.id) ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isPopular && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          熱門
                        </span>
                      )}
                    </div>
                  </div>
                  {enableBatchCreate && (
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => toggleTemplateSelection(template.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>難度: {getDifficultyStars(template.difficulty)}</span>
                    <span>預估時間: {template.estimatedTime}分鐘</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.memoryScience.map((science, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {science}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {showQuickCreate && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickCreate(template.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      data-testid={`quick-create-${template.id}`}
                    >
                      快速創建
                    </button>
                    {enablePreview && (
                      <button
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        data-testid={`preview-${template.id}`}
                      >
                        預覽
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已創建活動視圖 */}
      {showCreated && (
        <div data-testid="created-activities-content">
          <div className="space-y-4">
            {createdActivities.map((activity) => (
              <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{activity.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(activity.geptLevel)}`}>
                      {getGeptLevelName(activity.geptLevel)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>類型: {activity.type}</span>
                  <span>創建於: {activity.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• GEPT 等級選擇：根據學習者程度選擇合適的模板等級</p>
          <p>• 快速創建：點擊「快速創建」按鈕即可基於模板創建新活動</p>
          <p>• 批量創建：選擇多個模板後可以一次性創建多個活動</p>
          <p>• 記憶科學：每個模板都整合了相應的記憶科學原理</p>
        </div>
      </div>
    </div>
  );
};
