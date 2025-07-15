/**
 * GEPTVocabularyBrowser - GEPT詞彙瀏覽器組件
 * 支持詞彙搜索、分級瀏覽和詳細信息查看
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GEPTManager, GEPTWord, GEPTLevel } from '../../lib/gept/GEPTManager';

export interface GEPTVocabularyBrowserProps {
  onWordSelect?: (word: GEPTWord) => void;
  className?: string;
  'data-testid'?: string;
}

export default function GEPTVocabularyBrowser({
  onWordSelect,
  className = '',
  'data-testid': testId = 'gept-vocabulary-browser'
}: GEPTVocabularyBrowserProps) {
  const [geptManager] = useState(() => new GEPTManager());
  const [allWords, setAllWords] = useState<GEPTWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<GEPTWord[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<GEPTLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<GEPTWord | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'difficulty' | 'alphabetical'>('frequency');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 載入詞彙
  useEffect(() => {
    const words = geptManager.getAllGEPTWords();
    setAllWords(words);
    setFilteredWords(words);
  }, [geptManager]);

  // 過濾和排序詞彙
  useEffect(() => {
    let filtered = allWords;

    // 級別過濾
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(word => word.level === selectedLevel);
    }

    // 搜索過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(query) ||
        word.definition.includes(searchQuery) ||
        word.example.toLowerCase().includes(query) ||
        word.partOfSpeech.toLowerCase().includes(query)
      );
    }

    // 排序
    switch (sortBy) {
      case 'frequency':
        filtered.sort((a, b) => b.frequency - a.frequency);
        break;
      case 'difficulty':
        filtered.sort((a, b) => a.difficulty - b.difficulty);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
    }

    setFilteredWords(filtered);
  }, [allWords, selectedLevel, searchQuery, sortBy]);

  // 選擇詞彙
  const handleWordSelect = useCallback((word: GEPTWord) => {
    setSelectedWord(word);
    onWordSelect?.(word);
  }, [onWordSelect]);

  // 獲取級別顏色
  const getLevelColor = (level: GEPTLevel): string => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取難度顏色
  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-600';
    if (difficulty <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 獲取頻率星級
  const getFrequencyStars = (frequency: number): string => {
    return '★'.repeat(Math.min(5, Math.max(1, Math.round(frequency / 2))));
  };

  return (
    <div className={`gept-vocabulary-browser bg-white rounded-lg shadow-sm p-6 ${className}`} data-testid={testId}>
      {/* 標題 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">GEPT詞彙瀏覽器</h3>
        <p className="text-gray-600">瀏覽和搜索GEPT分級詞彙，支持多種過濾和排序方式</p>
      </div>

      {/* 控制面板 */}
      <div className="controls mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索詞彙
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索單字、定義或例句..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="search-input"
            />
          </div>

          {/* 級別過濾 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GEPT級別
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as GEPTLevel | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="level-filter"
            >
              <option value="all">所有級別</option>
              <option value="elementary">初級</option>
              <option value="intermediate">中級</option>
              <option value="high-intermediate">中高級</option>
            </select>
          </div>

          {/* 排序方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'frequency' | 'difficulty' | 'alphabetical')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="sort-select"
            >
              <option value="frequency">使用頻率</option>
              <option value="difficulty">難度等級</option>
              <option value="alphabetical">字母順序</option>
            </select>
          </div>

          {/* 視圖模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              視圖模式
            </label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                className={`flex-1 px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('grid')}
                data-testid="grid-view-btn"
              >
                網格
              </button>
              <button
                className={`flex-1 px-3 py-2 text-sm border-l border-gray-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
                data-testid="list-view-btn"
              >
                列表
              </button>
            </div>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span data-testid="word-count">
              顯示 {filteredWords.length} / {allWords.length} 個詞彙
            </span>
            <span data-testid="level-distribution">
              初級: {allWords.filter(w => w.level === 'elementary').length} | 
              中級: {allWords.filter(w => w.level === 'intermediate').length} | 
              中高級: {allWords.filter(w => w.level === 'high-intermediate').length}
            </span>
          </div>
        </div>
      </div>

      {/* 詞彙列表 */}
      <div className="vocabulary-content grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 詞彙列表區域 */}
        <div className="lg:col-span-2">
          {filteredWords.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="no-words">
              <div className="text-4xl mb-2">📚</div>
              <p>沒有找到符合條件的詞彙</p>
              <p className="text-sm mt-1">嘗試調整搜索條件或過濾器</p>
            </div>
          ) : (
            <div className={`words-container ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' 
                : 'space-y-2'
            }`} data-testid="words-container">
              {filteredWords.map((word) => (
                <div
                  key={word.word}
                  className={`word-card cursor-pointer transition-all ${
                    viewMode === 'grid'
                      ? `p-4 border rounded-lg hover:shadow-md ${
                          selectedWord?.word === word.word
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`
                      : `p-3 border-l-4 hover:bg-gray-50 ${
                          selectedWord?.word === word.word
                            ? 'border-l-blue-500 bg-blue-50'
                            : 'border-l-transparent hover:border-l-gray-300'
                        }`
                  }`}
                  onClick={() => handleWordSelect(word)}
                  data-testid={`word-${word.word}`}
                >
                  {viewMode === 'grid' ? (
                    /* 網格視圖 */
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{word.word}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${getLevelColor(word.level)}`}>
                          {geptManager.getLevelName(word.level)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">詞性:</span> {word.partOfSpeech}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">定義:</span> {word.definition}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>頻率: {getFrequencyStars(word.frequency)}</span>
                          <span className={`font-medium ${getDifficultyColor(word.difficulty)}`}>
                            難度: {word.difficulty}/10
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 列表視圖 */
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{word.word}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${getLevelColor(word.level)}`}>
                            {geptManager.getLevelName(word.level)}
                          </span>
                          <span className="text-sm text-gray-600">{word.partOfSpeech}</span>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">{word.definition}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{getFrequencyStars(word.frequency)}</span>
                        <span className={`font-medium ${getDifficultyColor(word.difficulty)}`}>
                          {word.difficulty}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 詞彙詳情區域 */}
        <div className="lg:col-span-1">
          <div className="word-details bg-gray-50 rounded-lg p-4 sticky top-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              {selectedWord ? '詞彙詳情' : '選擇詞彙查看詳情'}
            </h4>
            
            {selectedWord ? (
              <div className="space-y-4" data-testid="word-details">
                {/* 基本信息 */}
                <div>
                  <h5 className="text-2xl font-bold text-gray-900 mb-2">{selectedWord.word}</h5>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-sm rounded ${getLevelColor(selectedWord.level)}`}>
                      {geptManager.getLevelName(selectedWord.level)}
                    </span>
                    <span className="px-2 py-1 text-sm bg-gray-200 text-gray-800 rounded">
                      {selectedWord.partOfSpeech}
                    </span>
                  </div>
                </div>

                {/* 定義 */}
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">定義</h6>
                  <p className="text-gray-900">{selectedWord.definition}</p>
                </div>

                {/* 例句 */}
                <div>
                  <h6 className="font-medium text-gray-700 mb-1">例句</h6>
                  <p className="text-gray-700 italic">"{selectedWord.example}"</p>
                </div>

                {/* 統計信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-gray-700 mb-1">使用頻率</h6>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">{getFrequencyStars(selectedWord.frequency)}</span>
                      <span className="text-sm text-gray-600">{selectedWord.frequency}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-gray-700 mb-1">難度等級</h6>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < selectedWord.difficulty
                                ? selectedWord.difficulty <= 3 ? 'bg-green-500' : selectedWord.difficulty <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{selectedWord.difficulty}/10</span>
                    </div>
                  </div>
                </div>

                {/* 學習建議 */}
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <h6 className="font-medium text-blue-900 mb-2">學習建議</h6>
                  <div className="text-sm text-blue-800 space-y-1">
                    {selectedWord.difficulty <= 3 && (
                      <p>• 這是一個基礎詞彙，適合初學者學習</p>
                    )}
                    {selectedWord.difficulty > 6 && (
                      <p>• 這是一個進階詞彙，建議在掌握基礎詞彙後學習</p>
                    )}
                    {selectedWord.frequency >= 8 && (
                      <p>• 這是一個高頻詞彙，建議優先掌握</p>
                    )}
                    <p>• 多練習造句來加深理解</p>
                    <p>• 注意詞彙在不同語境中的用法</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500" data-testid="no-selection">
                <div className="text-4xl mb-2">📖</div>
                <p>點擊左側詞彙查看詳細信息</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
