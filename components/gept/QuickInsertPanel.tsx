/**
 * QuickInsertPanel - 快速插入面板組件
 * 提供常用內容的快速插入功能，基於 GEPT 分級系統
 */
import React, { useState, useCallback } from 'react';
import { GEPTLevel, GEPTWord, ContentTemplate } from '../../lib/gept/GEPTManager';

export interface QuickInsertItem {
  id: string;
  type: 'word' | 'phrase' | 'template' | 'grammar' | 'pattern';
  level: GEPTLevel;
  category: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  frequency: number;
}

export interface QuickInsertPanelProps {
  onInsert?: (content: string, type: QuickInsertItem['type']) => void;
  targetLevel?: GEPTLevel;
  showCategories?: string[];
  className?: string;
  'data-testid'?: string;
}

const QuickInsertPanel = ({
  onInsert,
  targetLevel = 'elementary',
  showCategories = ['word', 'phrase', 'template', 'grammar'],
  className = '',
  'data-testid': testId = 'quick-insert-panel'
}: QuickInsertPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>(showCategories[0] || 'word');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<GEPTLevel>(targetLevel);

  // 預定義的快速插入項目
  const quickInsertItems: QuickInsertItem[] = [
    // 常用詞彙
    {
      id: 'word-hello',
      type: 'word',
      level: 'elementary',
      category: 'greeting',
      title: 'Hello',
      content: 'hello',
      description: '問候語',
      tags: ['greeting', 'basic'],
      frequency: 10
    },
    {
      id: 'word-thank',
      type: 'word',
      level: 'elementary',
      category: 'courtesy',
      title: 'Thank you',
      content: 'thank you',
      description: '感謝用語',
      tags: ['courtesy', 'polite'],
      frequency: 9
    },
    {
      id: 'word-important',
      type: 'word',
      level: 'intermediate',
      category: 'adjective',
      title: 'Important',
      content: 'important',
      description: '重要的',
      tags: ['adjective', 'common'],
      frequency: 8
    },

    // 常用短語
    {
      id: 'phrase-how-are-you',
      type: 'phrase',
      level: 'elementary',
      category: 'greeting',
      title: 'How are you?',
      content: 'How are you?',
      description: '問候短語',
      tags: ['greeting', 'question'],
      frequency: 10
    },
    {
      id: 'phrase-nice-to-meet',
      type: 'phrase',
      level: 'elementary',
      category: 'greeting',
      title: 'Nice to meet you',
      content: 'Nice to meet you',
      description: '初次見面用語',
      tags: ['greeting', 'introduction'],
      frequency: 8
    },
    {
      id: 'phrase-excuse-me',
      type: 'phrase',
      level: 'elementary',
      category: 'courtesy',
      title: 'Excuse me',
      content: 'Excuse me',
      description: '打擾一下',
      tags: ['courtesy', 'polite'],
      frequency: 7
    },

    // 語法模板
    {
      id: 'grammar-present-simple',
      type: 'grammar',
      level: 'elementary',
      category: 'tense',
      title: '現在簡單式',
      content: 'Subject + Verb (base form) + Object\nExample: I eat breakfast every morning.',
      description: '現在簡單式語法結構',
      tags: ['grammar', 'tense', 'present'],
      frequency: 9
    },
    {
      id: 'grammar-past-simple',
      type: 'grammar',
      level: 'elementary',
      category: 'tense',
      title: '過去簡單式',
      content: 'Subject + Verb (past form) + Object\nExample: I ate breakfast this morning.',
      description: '過去簡單式語法結構',
      tags: ['grammar', 'tense', 'past'],
      frequency: 8
    },
    {
      id: 'grammar-future-will',
      type: 'grammar',
      level: 'intermediate',
      category: 'tense',
      title: '未來式 (will)',
      content: 'Subject + will + Verb (base form) + Object\nExample: I will eat breakfast tomorrow.',
      description: '未來式語法結構',
      tags: ['grammar', 'tense', 'future'],
      frequency: 7
    },

    // 句型模板
    {
      id: 'pattern-question',
      type: 'pattern',
      level: 'elementary',
      category: 'question',
      title: '疑問句模板',
      content: 'What/Where/When/Why/How + do/does + Subject + Verb?\nExample: What do you like?',
      description: 'WH疑問句結構',
      tags: ['pattern', 'question', 'wh-words'],
      frequency: 8
    },
    {
      id: 'pattern-comparison',
      type: 'pattern',
      level: 'intermediate',
      category: 'comparison',
      title: '比較句型',
      content: 'A is [adjective]-er than B\nA is more [adjective] than B\nExample: This book is more interesting than that one.',
      description: '比較級句型',
      tags: ['pattern', 'comparison', 'adjective'],
      frequency: 6
    },

    // 內容模板
    {
      id: 'template-self-intro',
      type: 'template',
      level: 'elementary',
      category: 'speaking',
      title: '自我介紹模板',
      content: 'Hello, my name is [Name]. I am [Age] years old. I am from [Country]. I like [Hobby]. Nice to meet you!',
      description: '基礎自我介紹模板',
      tags: ['template', 'speaking', 'introduction'],
      frequency: 9
    },
    {
      id: 'template-daily-routine',
      type: 'template',
      level: 'elementary',
      category: 'writing',
      title: '日常作息模板',
      content: 'I usually wake up at [Time]. Then I [Activity]. After that, I [Activity]. In the evening, I [Activity]. I go to bed at [Time].',
      description: '描述日常作息的模板',
      tags: ['template', 'writing', 'daily-life'],
      frequency: 7
    }
  ];

  // 過濾項目
  const filteredItems = quickInsertItems.filter(item => {
    const matchesCategory = showCategories.includes(item.type);
    const matchesActiveCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesLevel = selectedLevel === 'elementary' || item.level === selectedLevel;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesActiveCategory && matchesLevel && matchesSearch;
  });

  // 處理插入
  const handleInsert = useCallback((item: QuickInsertItem) => {
    onInsert?.(item.content, item.type);
  }, [onInsert]);

  // 獲取類別圖標
  const getCategoryIcon = (type: string): string => {
    switch (type) {
      case 'word': return '📝';
      case 'phrase': return '💬';
      case 'template': return '📋';
      case 'grammar': return '📚';
      case 'pattern': return '🔄';
      default: return '📄';
    }
  };

  // 獲取級別顏色
  const getLevelColor = (level: GEPTLevel): string => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取級別名稱
  const getLevelName = (level: GEPTLevel): string => {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return level;
    }
  };

  return (
    <div className={`quick-insert-panel bg-white rounded-lg shadow-sm border ${className}`} data-testid={testId}>
      {/* 標題 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">快速插入</h3>
        <p className="text-sm text-gray-600 mt-1">選擇常用內容快速插入到編輯器中</p>
      </div>

      {/* 控制面板 */}
      <div className="p-4 border-b border-gray-200">
        {/* 搜索框 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索內容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="search-input"
          />
        </div>

        {/* 級別選擇 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">GEPT 級別</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as GEPTLevel)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="level-select"
          >
            <option value="elementary">初級</option>
            <option value="intermediate">中級</option>
            <option value="high-intermediate">中高級</option>
          </select>
        </div>

        {/* 類別標籤 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="category-all"
          >
            全部
          </button>
          {showCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid={`category-${category}`}
            >
              {getCategoryIcon(category)} {category}
            </button>
          ))}
        </div>
      </div>

      {/* 內容列表 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredItems.length > 0 ? (
          <div className="p-2">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleInsert(item)}
                data-testid={`insert-item-${item.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(item.type)}</span>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                    {getLevelName(item.level)}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                
                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded font-mono">
                  {item.content.length > 100 
                    ? `${item.content.substring(0, 100)}...` 
                    : item.content
                  }
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span>頻率:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${
                            i < Math.ceil(item.frequency / 2) ? 'bg-yellow-400' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>沒有找到匹配的內容</p>
            <p className="text-sm mt-1">嘗試調整搜索條件或級別設置</p>
          </div>
        )}
      </div>

      {/* 統計信息 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600">
          <span>顯示 {filteredItems.length} 個項目</span>
          <span>級別: {getLevelName(selectedLevel)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickInsertPanel;
