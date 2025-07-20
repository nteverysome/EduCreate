/**
 * IntelligentActivitySearch.tsx - 智能活動搜索組件
 * 實現全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能，支持實時搜索結果更新
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

// 活動數據接口
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  isShared: boolean;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  learningEffectiveness?: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  templateType?: string;
  learningState?: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  subject?: string;
  author?: string;
  content?: string; // 用於全文搜索
}

// 搜索結果接口
interface SearchResult {
  activity: Activity;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'voice';
  highlights: string[];
  relevanceReason: string;
}

// 搜索配置接口
interface SearchConfig {
  enableFullText: boolean;
  enableFuzzy: boolean;
  enableSemantic: boolean;
  enableVoice: boolean;
  fuzzyThreshold: number;
  semanticThreshold: number;
  maxResults: number;
  searchFields: string[];
  boostFactors: {
    title: number;
    description: number;
    tags: number;
    content: number;
  };
}

// 組件屬性
interface IntelligentActivitySearchProps {
  activities: Activity[];
  onSearchResults: (results: SearchResult[]) => void;
  onSearchConfigChange?: (config: SearchConfig) => void;
  placeholder?: string;
  className?: string;
  showAdvancedOptions?: boolean;
  enableRealTimeSearch?: boolean;
  searchDelay?: number;
}

// 預設搜索配置
const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enableFullText: true,
  enableFuzzy: true,
  enableSemantic: false, // 需要 AI 服務支持
  enableVoice: false, // 需要語音識別支持
  fuzzyThreshold: 0.6,
  semanticThreshold: 0.7,
  maxResults: 50,
  searchFields: ['title', 'description', 'tags', 'content'],
  boostFactors: {
    title: 2.0,
    description: 1.5,
    tags: 1.8,
    content: 1.0
  }
};

export const IntelligentActivitySearch: React.FC<IntelligentActivitySearchProps> = ({
  activities,
  onSearchResults,
  onSearchConfigChange,
  placeholder = '搜索活動...',
  className = '',
  showAdvancedOptions = false,
  enableRealTimeSearch = true,
  searchDelay = 300
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    lastSearchType: '' as 'exact' | 'fuzzy' | 'semantic' | 'voice' | ''
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // 字符串相似度計算（用於模糊匹配）
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }, []);

  // Levenshtein 距離計算
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }, []);

  // 全文搜索
  const performFullTextSearch = useCallback((query: string, activities: Activity[]): SearchResult[] => {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);

    activities.forEach(activity => {
      let score = 0;
      const highlights: string[] = [];
      let matchFound = false;

      // 搜索各個字段
      searchConfig.searchFields.forEach(field => {
        const rawValue = activity[field as keyof Activity];
        const fieldValue = (typeof rawValue === 'string' ? rawValue : String(rawValue || '')).toLowerCase();
        const boost = searchConfig.boostFactors[field as keyof typeof searchConfig.boostFactors] || 1.0;

        // 精確匹配
        if (fieldValue.includes(queryLower)) {
          score += 10 * boost;
          highlights.push(`${field}: 精確匹配`);
          matchFound = true;
        }

        // 詞語匹配
        queryWords.forEach(word => {
          if (fieldValue.includes(word)) {
            score += 5 * boost;
            highlights.push(`${field}: 包含 "${word}"`);
            matchFound = true;
          }
        });
      });

      // 標籤特殊處理
      if (activity.tags) {
        activity.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes(queryLower)) {
            score += 8 * searchConfig.boostFactors.tags;
            highlights.push(`標籤: ${tag}`);
            matchFound = true;
          }
        });
      }

      if (matchFound) {
        results.push({
          activity,
          score,
          matchType: 'exact',
          highlights,
          relevanceReason: `全文搜索匹配 (得分: ${score.toFixed(1)})`
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }, [searchConfig]);

  // 模糊搜索
  const performFuzzySearch = useCallback((query: string, activities: Activity[]): SearchResult[] => {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    activities.forEach(activity => {
      let maxSimilarity = 0;
      let bestMatch = '';
      const highlights: string[] = [];

      // 檢查標題相似度
      const titleSimilarity = calculateSimilarity(queryLower, (activity.title || '').toLowerCase());
      if (titleSimilarity > maxSimilarity) {
        maxSimilarity = titleSimilarity;
        bestMatch = 'title';
      }

      // 檢查描述相似度
      if (activity.description) {
        const descSimilarity = calculateSimilarity(queryLower, activity.description.toLowerCase());
        if (descSimilarity > maxSimilarity) {
          maxSimilarity = descSimilarity;
          bestMatch = 'description';
        }
      }

      // 檢查標籤相似度
      activity.tags.forEach(tag => {
        const tagSimilarity = calculateSimilarity(queryLower, tag.toLowerCase());
        if (tagSimilarity > maxSimilarity) {
          maxSimilarity = tagSimilarity;
          bestMatch = `tag: ${tag}`;
        }
      });

      if (maxSimilarity >= searchConfig.fuzzyThreshold) {
        highlights.push(`最佳匹配: ${bestMatch} (相似度: ${(maxSimilarity * 100).toFixed(1)}%)`);
        
        results.push({
          activity,
          score: maxSimilarity * 100,
          matchType: 'fuzzy',
          highlights,
          relevanceReason: `模糊匹配 (相似度: ${(maxSimilarity * 100).toFixed(1)}%)`
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }, [calculateSimilarity, searchConfig.fuzzyThreshold]);

  // 語義搜索（模擬實現，實際需要 AI 服務）
  const performSemanticSearch = useCallback(async (query: string, activities: Activity[]): Promise<SearchResult[]> => {
    // 這裡是模擬實現，實際需要調用 AI 語義搜索服務
    const results: SearchResult[] = [];
    
    // 簡單的關鍵詞語義映射
    const semanticMappings: { [key: string]: string[] } = {
      '數學': ['計算', '算術', '幾何', '代數', '統計'],
      '英語': ['單詞', '語法', '閱讀', '寫作', '聽力'],
      '科學': ['物理', '化學', '生物', '實驗', '觀察'],
      '遊戲': ['互動', '娛樂', '競賽', '挑戰', '樂趣'],
      '學習': ['教育', '知識', '技能', '練習', '記憶']
    };

    const queryLower = query.toLowerCase();
    const relatedTerms: string[] = [];

    // 查找相關詞彙
    Object.entries(semanticMappings).forEach(([key, terms]) => {
      if (queryLower.includes(key) || terms.some(term => queryLower.includes(term))) {
        relatedTerms.push(...terms, key);
      }
    });

    if (relatedTerms.length > 0) {
      activities.forEach(activity => {
        let semanticScore = 0;
        const highlights: string[] = [];

        // 檢查語義相關性
        const allText = `${activity.title} ${activity.description || ''} ${activity.tags.join(' ')}`.toLowerCase();
        
        relatedTerms.forEach(term => {
          if (allText.includes(term.toLowerCase())) {
            semanticScore += 5;
            highlights.push(`語義相關: ${term}`);
          }
        });

        if (semanticScore >= searchConfig.semanticThreshold * 10) {
          results.push({
            activity,
            score: semanticScore,
            matchType: 'semantic',
            highlights,
            relevanceReason: `語義搜索匹配 (得分: ${semanticScore})`
          });
        }
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }, [searchConfig.semanticThreshold]);

  // 語音搜索
  const startVoiceSearch = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('您的瀏覽器不支持語音搜索功能');
      return;
    }

    try {
      setIsVoiceRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 這裡是模擬實現，實際需要語音識別服務
      setTimeout(() => {
        setIsVoiceRecording(false);
        const mockVoiceResult = '數學遊戲'; // 模擬語音識別結果
        setSearchQuery(mockVoiceResult);
        performSearch(mockVoiceResult);
      }, 3000);

    } catch (error) {
      console.error('語音搜索錯誤:', error);
      setIsVoiceRecording(false);
      alert('無法訪問麥克風，請檢查權限設置');
    }
  }, []);

  // 執行搜索
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      onSearchResults([]);
      setSearchStats({ totalResults: 0, searchTime: 0, lastSearchType: '' });
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();
    let allResults: SearchResult[] = [];

    try {
      // 全文搜索
      if (searchConfig.enableFullText) {
        const fullTextResults = performFullTextSearch(query, activities);
        allResults.push(...fullTextResults);
      }

      // 模糊搜索
      if (searchConfig.enableFuzzy) {
        const fuzzyResults = performFuzzySearch(query, activities);
        allResults.push(...fuzzyResults);
      }

      // 語義搜索
      if (searchConfig.enableSemantic) {
        const semanticResults = await performSemanticSearch(query, activities);
        allResults.push(...semanticResults);
      }

      // 去重和排序
      const uniqueResults = new Map<string, SearchResult>();
      allResults.forEach(result => {
        const existing = uniqueResults.get(result.activity.id);
        if (!existing || result.score > existing.score) {
          uniqueResults.set(result.activity.id, result);
        }
      });

      const finalResults = Array.from(uniqueResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, searchConfig.maxResults);

      const searchTime = Date.now() - startTime;
      
      setSearchStats({
        totalResults: finalResults.length,
        searchTime,
        lastSearchType: finalResults[0]?.matchType || ''
      });

      onSearchResults(finalResults);

      // 添加到搜索歷史
      if (query.trim() && !searchHistory.includes(query.trim())) {
        setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
      }

    } catch (error) {
      console.error('搜索錯誤:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [activities, searchConfig, performFullTextSearch, performFuzzySearch, performSemanticSearch, onSearchResults, searchHistory]);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce(performSearch, searchDelay),
    [performSearch, searchDelay]
  );

  // 處理搜索輸入變化
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (enableRealTimeSearch) {
      debouncedSearch(value);
    }
  }, [enableRealTimeSearch, debouncedSearch]);

  // 處理搜索提交
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    setShowSuggestions(false);
  }, [performSearch, searchQuery]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    onSearchResults([]);
    setSearchStats({ totalResults: 0, searchTime: 0, lastSearchType: '' });
    searchInputRef.current?.focus();
  }, [onSearchResults]);

  // 更新搜索配置
  const updateSearchConfig = useCallback((updates: Partial<SearchConfig>) => {
    const newConfig = { ...searchConfig, ...updates };
    setSearchConfig(newConfig);
    onSearchConfigChange?.(newConfig);
    
    // 如果有搜索查詢，重新搜索
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchConfig, onSearchConfigChange, searchQuery, performSearch]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`intelligent-activity-search ${className}`} data-testid="intelligent-activity-search">
      {/* 搜索輸入區域 */}
      <div className="search-input-container relative">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full px-4 py-3 pl-12 pr-20 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="search-input"
            />
            
            {/* 搜索圖標 */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <span className="text-gray-400">🔍</span>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {/* 語音搜索按鈕 */}
              {searchConfig.enableVoice && (
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  disabled={isVoiceRecording}
                  className={`p-1 rounded hover:bg-gray-100 ${isVoiceRecording ? 'text-red-500' : 'text-gray-400'}`}
                  title="語音搜索"
                  data-testid="voice-search-button"
                >
                  🎤
                </button>
              )}
              
              {/* 清除按鈕 */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400"
                  title="清除搜索"
                  data-testid="clear-search-button"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 搜索按鈕 */}
          <button
            type="submit"
            disabled={isSearching}
            className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="search-submit-button"
          >
            搜索
          </button>
        </form>

        {/* 搜索建議 */}
        {showSuggestions && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10" data-testid="search-suggestions">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2">搜索歷史</div>
              {searchHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(historyItem);
                    performSearch(historyItem);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  🕒 {historyItem}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 搜索統計 */}
      {searchStats.totalResults > 0 && (
        <div className="search-stats mt-2 text-sm text-gray-600" data-testid="search-stats">
          找到 {searchStats.totalResults} 個結果 ({searchStats.searchTime}ms)
          {searchStats.lastSearchType && (
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
              {searchStats.lastSearchType === 'exact' && '精確匹配'}
              {searchStats.lastSearchType === 'fuzzy' && '模糊匹配'}
              {searchStats.lastSearchType === 'semantic' && '語義搜索'}
              {searchStats.lastSearchType === 'voice' && '語音搜索'}
            </span>
          )}
        </div>
      )}

      {/* 高級搜索選項 */}
      {showAdvancedOptions && (
        <div className="advanced-options mt-4 p-4 bg-gray-50 rounded-lg" data-testid="advanced-search-options">
          <h4 className="text-sm font-medium text-gray-700 mb-3">搜索選項</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchConfig.enableFullText}
                  onChange={(e) => updateSearchConfig({ enableFullText: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">全文搜索</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchConfig.enableFuzzy}
                  onChange={(e) => updateSearchConfig({ enableFuzzy: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">模糊匹配</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchConfig.enableSemantic}
                  onChange={(e) => updateSearchConfig({ enableSemantic: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">語義搜索</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchConfig.enableVoice}
                  onChange={(e) => updateSearchConfig({ enableVoice: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">語音搜索</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">
              模糊匹配閾值: {(searchConfig.fuzzyThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.1"
              value={searchConfig.fuzzyThreshold}
              onChange={(e) => updateSearchConfig({ fuzzyThreshold: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="mt-2">
            <label className="block text-sm text-gray-600 mb-1">
              最大結果數: {searchConfig.maxResults}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={searchConfig.maxResults}
              onChange={(e) => updateSearchConfig({ maxResults: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* 語音錄製指示器 */}
      {isVoiceRecording && (
        <div className="voice-recording-indicator mt-2 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="voice-recording-indicator">
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-red-700">正在錄製語音...</span>
          </div>
        </div>
      )}
    </div>
  );
};
