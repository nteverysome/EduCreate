/**
 * WordWall 風格模板選擇器組件
 * 模仿 WordWall 的模板選擇界面
 */

'use client';

import React, { useState, useMemo } from 'react';
import { GameCategory, DifficultyLevel } from '@prisma/client';
import { WordWallTemplateManager, GameTemplate } from '@/lib/wordwall/TemplateManager';

interface TemplateSelectorProps {
  onTemplateSelect: (template: GameTemplate) => void;
  selectedTemplateId?: string;
  showPremiumOnly?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  showPremiumOnly = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 獲取所有模板
  const allTemplates = useMemo(() => {
    return showPremiumOnly 
      ? WordWallTemplateManager.getPremiumTemplates()
      : WordWallTemplateManager.getAllTemplates();
  }, [showPremiumOnly]);

  // 過濾模板
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    // 按分類過濾
    if (selectedCategory !== 'ALL') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    // 按難度過濾
    if (selectedDifficulty !== 'ALL') {
      templates = templates.filter(template => template.difficulty === selectedDifficulty);
    }

    // 按搜索查詢過濾
    if (searchQuery.trim()) {
      templates = WordWallTemplateManager.searchTemplates(searchQuery);
    }

    return templates.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allTemplates, selectedCategory, selectedDifficulty, searchQuery]);

  // 分類選項
  const categories = [
    { value: 'ALL', label: '全部分類' },
    { value: 'QUIZ', label: '問答遊戲' },
    { value: 'MATCHING', label: '配對遊戲' },
    { value: 'MEMORY', label: '記憶遊戲' },
    { value: 'ACTION', label: '動作遊戲' },
    { value: 'CREATIVE', label: '創意遊戲' },
    { value: 'WORD_GAMES', label: '文字遊戲' },
    { value: 'MATH_GAMES', label: '數學遊戲' }
  ];

  // 難度選項
  const difficulties = [
    { value: 'ALL', label: '全部難度' },
    { value: 'EASY', label: '簡單' },
    { value: 'MEDIUM', label: '中等' },
    { value: 'HARD', label: '困難' }
  ];

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HARD': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: GameCategory) => {
    switch (category) {
      case 'QUIZ': return 'text-blue-600 bg-blue-100';
      case 'MATCHING': return 'text-purple-600 bg-purple-100';
      case 'MEMORY': return 'text-indigo-600 bg-indigo-100';
      case 'ACTION': return 'text-red-600 bg-red-100';
      case 'CREATIVE': return 'text-pink-600 bg-pink-100';
      case 'WORD_GAMES': return 'text-green-600 bg-green-100';
      case 'MATH_GAMES': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="template-selector bg-white rounded-lg shadow-lg p-6">
      {/* 標題 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">選擇遊戲模板</h2>
        <p className="text-gray-600">選擇一個模板開始創建您的互動教學活動</p>
      </div>

      {/* 搜索和過濾器 */}
      <div className="mb-6 space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 過濾器 */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GameCategory | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 模板網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`
              template-card cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg
              ${selectedTemplateId === template.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* 模板圖標和標題 */}
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">{template.icon}</div>
              <h3 className="font-semibold text-gray-900">{template.displayName}</h3>
            </div>

            {/* 模板描述 */}
            <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden">
              {template.description}
            </p>

            {/* 標籤 */}
            <div className="flex flex-wrap gap-1 mb-3">
              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                {categories.find(c => c.value === template.category)?.label}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                {difficulties.find(d => d.value === template.difficulty)?.label}
              </span>
              {template.isPremium && (
                <span className="px-2 py-1 text-xs rounded-full text-yellow-600 bg-yellow-100">
                  高級
                </span>
              )}
            </div>

            {/* 預估時間 */}
            <div className="text-xs text-gray-500 mb-2">
              ⏱️ {template.estimatedTime}
            </div>

            {/* 功能特色 */}
            <div className="text-xs text-gray-500">
              {template.features.slice(0, 2).join(' • ')}
              {template.features.length > 2 && '...'}
            </div>
          </div>
        ))}
      </div>

      {/* 無結果提示 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">找不到匹配的模板</h3>
          <p className="text-gray-600">請嘗試調整搜索條件或過濾器</p>
        </div>
      )}

      {/* 統計信息 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          顯示 {filteredTemplates.length} 個模板，共 {allTemplates.length} 個可用模板
        </p>
      </div>
    </div>
  );
};
