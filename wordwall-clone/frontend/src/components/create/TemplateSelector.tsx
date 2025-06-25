import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { 
  gameTemplates, 
  getAvailableTemplates, 
  getTemplatesByCategory,
  GameTemplate,
  GameTemplateType 
} from '@/components/games/GameRegistry';

interface TemplateSelectorProps {
  onSelect: (templateType: GameTemplateType) => void;
  selectedTemplate?: GameTemplateType;
  contentType?: string;
  itemCount?: number;
}

/**
 * 遊戲模板選擇器組件
 * 
 * 功能：
 * - 展示所有可用的遊戲模板
 * - 按分類篩選模板
 * - 顯示模板詳細信息
 * - 推薦合適的模板
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplate,
  contentType = 'text',
  itemCount = 5,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<GameTemplateType | null>(null);

  // 分類定義
  const categories = [
    { id: 'all', name: '全部', icon: '🎮' },
    { id: 'quiz', name: '測驗', icon: '❓' },
    { id: 'matching', name: '配對', icon: '🔗' },
    { id: 'sorting', name: '排序', icon: '📂' },
    { id: 'memory', name: '記憶', icon: '🧠' },
    { id: 'word', name: '文字', icon: '🔤' },
    { id: 'random', name: '隨機', icon: '🎲' },
  ];

  // 獲取篩選後的模板
  const getFilteredTemplates = (): GameTemplate[] => {
    if (selectedCategory === 'all') {
      return getAvailableTemplates();
    }
    return getTemplatesByCategory(selectedCategory);
  };

  // 獲取難度顏色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 檢查模板是否推薦
  const isRecommended = (template: GameTemplate): boolean => {
    if (!template.isAvailable) return false;
    
    // 檢查內容類型支持
    if (!template.supportedContentTypes.includes(contentType)) return false;
    
    // 檢查項目數量範圍
    if (itemCount < template.minItems || itemCount > template.maxItems) return false;
    
    return true;
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          選擇遊戲模板
        </h2>
        <p className="text-lg text-gray-600">
          選擇最適合您內容的互動遊戲模板
        </p>
      </div>

      {/* 分類篩選 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center space-x-2"
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      {/* 模板網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const recommended = isRecommended(template);
          
          return (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredTemplate(template.id)}
              onHoverEnd={() => setHoveredTemplate(null)}
              className={`
                relative bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                ${!template.isAvailable ? 'opacity-60' : ''}
              `}
              onClick={() => template.isAvailable && onSelect(template.id)}
            >
              {/* 推薦標籤 */}
              {recommended && template.isAvailable && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    推薦
                  </div>
                </div>
              )}

              {/* 選中標記 */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
              )}

              {/* 不可用標記 */}
              {!template.isAvailable && (
                <div className="absolute top-3 right-3 z-10">
                  <LockClosedIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}

              <div className="p-6">
                {/* 模板圖標和標題 */}
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{template.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* 難度和時間 */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty === 'easy' ? '簡單' : 
                     template.difficulty === 'medium' ? '中等' : '困難'}
                  </span>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {template.estimatedTime}
                  </div>
                </div>

                {/* 項目範圍 */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {template.minItems}-{template.maxItems} 個項目
                </div>

                {/* 特性列表 */}
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{template.features.length - 3} 更多特性
                    </div>
                  )}
                </div>

                {/* 狀態指示 */}
                {!template.isAvailable && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-500">即將推出</span>
                  </div>
                )}
              </div>

              {/* 懸停詳情 */}
              {hoveredTemplate === template.id && template.isAvailable && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-0 bottom-0 bg-gray-50 border-t border-gray-200 rounded-b-xl p-4"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 mb-2">支持內容類型:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.supportedContentTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {type === 'text' ? '文字' : type === 'image' ? '圖片' : type}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 空狀態 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            該分類下暫無可用模板
          </h3>
          <p className="text-gray-500">
            請選擇其他分類或等待更多模板上線
          </p>
        </div>
      )}

      {/* 幫助信息 */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 選擇建議</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>測驗類型</strong> - 適合知識檢測和評估
          </div>
          <div>
            <strong>配對類型</strong> - 適合關聯性學習
          </div>
          <div>
            <strong>排序類型</strong> - 適合分類和組織學習
          </div>
          <div>
            <strong>記憶類型</strong> - 適合記憶和複習
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
