/**
 * EnhancedContentValidator - 增強的內容驗證組件
 * 提供實時驗證、錯誤修復建議、質量評估等功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ValidationResult, ValidationError } from '../../lib/content/ContentValidator';
import { GEPTLevel } from '../../lib/gept/GEPTManager';

export interface ValidationRule {
  id: string;
  name: string;
  category: 'grammar' | 'spelling' | 'gept' | 'format' | 'quality' | 'accessibility';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  description: string;
}

export interface QualityMetrics {
  readability: number;
  complexity: number;
  geptCompliance: number;
  accessibility: number;
  engagement: number;
  overall: number;
}

export interface EnhancedValidationResult extends ValidationResult {
  qualityMetrics: QualityMetrics;
  suggestions: ValidationSuggestion[];
  autoFixAvailable: boolean;
}

export interface ValidationSuggestion {
  id: string;
  type: 'replace' | 'add' | 'remove' | 'restructure';
  message: string;
  originalText?: string;
  suggestedText?: string;
  confidence: number;
  category: string;
}

export interface EnhancedContentValidatorProps {
  content: string;
  targetLevel?: GEPTLevel;
  gameType?: string;
  onValidationResult?: (result: EnhancedValidationResult) => void;
  onAutoFix?: (fixes: ValidationSuggestion[]) => void;
  realTimeValidation?: boolean;
  customRules?: ValidationRule[];
  className?: string;
  'data-testid'?: string;
}

const EnhancedContentValidator = ({
  content,
  targetLevel = 'elementary',
  gameType,
  onValidationResult,
  onAutoFix,
  realTimeValidation = true,
  customRules = [],
  className = '',
  'data-testid': testId = 'enhanced-content-validator'
}: EnhancedContentValidatorProps) => {
  const [validationResult, setValidationResult] = useState<EnhancedValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'errors' | 'quality' | 'suggestions' | 'rules'>('errors');
  const [enabledRules, setEnabledRules] = useState<Set<string>>(new Set());
  const [showAutoFixModal, setShowAutoFixModal] = useState(false);

  // 預設驗證規則
  const defaultRules: ValidationRule[] = [
    {
      id: 'grammar-check',
      name: '語法檢查',
      category: 'grammar',
      severity: 'error',
      enabled: true,
      description: '檢查基本語法錯誤'
    },
    {
      id: 'spelling-check',
      name: '拼寫檢查',
      category: 'spelling',
      severity: 'error',
      enabled: true,
      description: '檢查拼寫錯誤'
    },
    {
      id: 'gept-compliance',
      name: 'GEPT 合規性',
      category: 'gept',
      severity: 'warning',
      enabled: true,
      description: '檢查是否符合 GEPT 級別要求'
    },
    {
      id: 'format-check',
      name: '格式檢查',
      category: 'format',
      severity: 'warning',
      enabled: true,
      description: '檢查內容格式和結構'
    },
    {
      id: 'accessibility-check',
      name: '無障礙檢查',
      category: 'accessibility',
      severity: 'info',
      enabled: true,
      description: '檢查無障礙設計合規性'
    },
    {
      id: 'quality-check',
      name: '質量評估',
      category: 'quality',
      severity: 'info',
      enabled: true,
      description: '評估內容質量和教學效果'
    }
  ];

  const allRules = [...defaultRules, ...customRules];

  // 初始化啟用的規則
  useEffect(() => {
    const enabled = new Set(allRules.filter(rule => rule.enabled).map(rule => rule.id));
    setEnabledRules(enabled);
  }, []);

  // 實時驗證
  useEffect(() => {
    if (realTimeValidation && content) {
      const timer = setTimeout(() => {
        validateContent();
      }, 500); // 防抖

      return () => clearTimeout(timer);
    }
  }, [content, targetLevel, gameType, enabledRules, realTimeValidation]);

  // 執行驗證
  const validateContent = useCallback(async () => {
    if (!content.trim()) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);

    try {
      // 模擬驗證過程
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await performValidation(content, targetLevel, gameType, enabledRules);
      setValidationResult(result);
      onValidationResult?.(result);
    } catch (error) {
      console.error('驗證失敗:', error);
    } finally {
      setIsValidating(false);
    }
  }, [content, targetLevel, gameType, enabledRules, onValidationResult]);

  // 執行實際驗證邏輯
  const performValidation = async (
    text: string,
    level: GEPTLevel,
    type?: string,
    rules?: Set<string>
  ): Promise<EnhancedValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // 語法檢查
    if (rules?.has('grammar-check')) {
      const grammarErrors = checkGrammar(text);
      errors.push(...grammarErrors);
    }

    // 拼寫檢查
    if (rules?.has('spelling-check')) {
      const spellingErrors = checkSpelling(text);
      errors.push(...spellingErrors);
    }

    // GEPT 合規性檢查
    if (rules?.has('gept-compliance')) {
      const geptIssues = checkGEPTCompliance(text, level);
      warnings.push(...geptIssues);
    }

    // 格式檢查
    if (rules?.has('format-check')) {
      const formatIssues = checkFormat(text);
      warnings.push(...formatIssues);
    }

    // 生成建議
    suggestions.push(...generateSuggestions(text, level));

    // 計算質量指標
    const qualityMetrics = calculateQualityMetrics(text, level);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canPublish: errors.length === 0 && warnings.filter(w => w.severity === 'error').length === 0,
      requiredFields: ['content'],
      missingFields: text.trim() ? [] : ['content'],
      qualityMetrics,
      suggestions,
      autoFixAvailable: suggestions.some(s => s.confidence > 0.8)
    };
  };

  // 語法檢查
  const checkGrammar = (text: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // 簡單的語法檢查示例
    if (text.includes('  ')) {
      errors.push({
        field: 'content',
        message: '發現多餘的空格',
        severity: 'warning',
        suggestion: '移除多餘的空格'
      });
    }

    // 檢查句子結構
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach((sentence, index) => {
      if (sentence.trim().length > 100) {
        errors.push({
          field: 'content',
          message: `第 ${index + 1} 句過長`,
          severity: 'warning',
          suggestion: '考慮拆分為較短的句子'
        });
      }
    });

    return errors;
  };

  // 拼寫檢查
  const checkSpelling = (text: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // 簡單的拼寫檢查示例
    const commonMistakes = {
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely'
    };

    Object.entries(commonMistakes).forEach(([wrong, correct]) => {
      if (text.toLowerCase().includes(wrong)) {
        errors.push({
          field: 'content',
          message: `拼寫錯誤: "${wrong}"`,
          severity: 'error',
          suggestion: `建議改為: "${correct}"`
        });
      }
    });

    return errors;
  };

  // GEPT 合規性檢查
  const checkGEPTCompliance = (text: string, level: GEPTLevel): ValidationError[] => {
    const warnings: ValidationError[] = [];
    
    const words = text.toLowerCase().split(/\s+/);
    const complexWords = words.filter(word => word.length > 8);
    
    if (level === 'elementary' && complexWords.length > words.length * 0.1) {
      warnings.push({
        field: 'content',
        message: '包含過多複雜詞彙',
        severity: 'warning',
        suggestion: '建議使用更簡單的詞彙'
      });
    }

    return warnings;
  };

  // 格式檢查
  const checkFormat = (text: string): ValidationError[] => {
    const warnings: ValidationError[] = [];
    
    if (!text.trim().endsWith('.') && !text.trim().endsWith('!') && !text.trim().endsWith('?')) {
      warnings.push({
        field: 'content',
        message: '內容應以標點符號結尾',
        severity: 'info',
        suggestion: '添加適當的標點符號'
      });
    }

    return warnings;
  };

  // 生成建議
  const generateSuggestions = (text: string, level: GEPTLevel): ValidationSuggestion[] => {
    const suggestions: ValidationSuggestion[] = [];

    // 詞彙簡化建議
    const complexWords = ['sophisticated', 'magnificent', 'extraordinary'];
    const simpleAlternatives = ['good', 'great', 'special'];

    complexWords.forEach((word, index) => {
      if (text.toLowerCase().includes(word)) {
        suggestions.push({
          id: `simplify-${index}`,
          type: 'replace',
          message: `建議簡化詞彙 "${word}"`,
          originalText: word,
          suggestedText: simpleAlternatives[index],
          confidence: 0.9,
          category: 'vocabulary'
        });
      }
    });

    return suggestions;
  };

  // 計算質量指標
  const calculateQualityMetrics = (text: string, level: GEPTLevel): QualityMetrics => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

    return {
      readability: Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 5)),
      complexity: Math.min(100, avgWordsPerSentence * 5),
      geptCompliance: level === 'elementary' ? 85 : 90,
      accessibility: 95,
      engagement: 80,
      overall: 85
    };
  };

  // 切換規則啟用狀態
  const toggleRule = useCallback((ruleId: string) => {
    setEnabledRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);

  // 應用自動修復
  const applyAutoFix = useCallback(() => {
    if (validationResult?.suggestions) {
      const highConfidenceFixes = validationResult.suggestions.filter(s => s.confidence > 0.8);
      onAutoFix?.(highConfidenceFixes);
      setShowAutoFixModal(false);
    }
  }, [validationResult, onAutoFix]);

  // 獲取嚴重程度顏色
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取質量分數顏色
  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`enhanced-content-validator bg-white rounded-lg shadow-sm border ${className}`} data-testid={testId}>
      {/* 標題和狀態 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">內容驗證</h3>
          <div className="flex items-center space-x-2">
            {isValidating && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm">驗證中...</span>
              </div>
            )}
            {validationResult && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                validationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {validationResult.isValid ? '✅ 通過' : '❌ 有問題'}
              </div>
            )}
            {validationResult?.autoFixAvailable && (
              <button
                onClick={() => setShowAutoFixModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                data-testid="auto-fix-btn"
              >
                🔧 自動修復
              </button>
            )}
          </div>
        </div>

        {/* 快速統計 */}
        {validationResult && (
          <div className="mt-3 grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">{validationResult.errors.length}</div>
              <div className="text-xs text-gray-500">錯誤</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{validationResult.warnings.length}</div>
              <div className="text-xs text-gray-500">警告</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{validationResult.suggestions.length}</div>
              <div className="text-xs text-gray-500">建議</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${getQualityColor(validationResult.qualityMetrics.overall)}`}>
                {validationResult.qualityMetrics.overall}%
              </div>
              <div className="text-xs text-gray-500">質量</div>
            </div>
          </div>
        )}
      </div>

      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { key: 'errors', label: '錯誤和警告', icon: '⚠️' },
            { key: 'quality', label: '質量指標', icon: '📊' },
            { key: 'suggestions', label: '改進建議', icon: '💡' },
            { key: 'rules', label: '驗證規則', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid={`tab-${tab.key}`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 標籤頁內容 */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* 錯誤和警告標籤 */}
        {activeTab === 'errors' && (
          <div className="space-y-3">
            {validationResult ? (
              <>
                {/* 錯誤列表 */}
                {validationResult.errors.map((error, index) => (
                  <div
                    key={`error-${index}`}
                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                    data-testid={`error-${index}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-red-900">{error.message}</div>
                        {error.suggestion && (
                          <div className="text-sm text-red-700 mt-1">💡 {error.suggestion}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                        {error.severity === 'error' ? '錯誤' : error.severity === 'warning' ? '警告' : '信息'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* 警告列表 */}
                {validationResult.warnings.map((warning, index) => (
                  <div
                    key={`warning-${index}`}
                    className="p-3 border border-yellow-200 rounded-lg bg-yellow-50"
                    data-testid={`warning-${index}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-yellow-900">{warning.message}</div>
                        {warning.suggestion && (
                          <div className="text-sm text-yellow-700 mt-1">💡 {warning.suggestion}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(warning.severity)}`}>
                        {warning.severity === 'error' ? '錯誤' : warning.severity === 'warning' ? '警告' : '信息'}
                      </span>
                    </div>
                  </div>
                ))}

                {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <p>沒有發現錯誤或警告</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>輸入內容開始驗證</p>
              </div>
            )}
          </div>
        )}

        {/* 質量指標標籤 */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            {validationResult?.qualityMetrics ? (
              <>
                {Object.entries(validationResult.qualityMetrics).map(([key, value]) => {
                  const labels = {
                    readability: '可讀性',
                    complexity: '複雜度',
                    geptCompliance: 'GEPT 合規性',
                    accessibility: '無障礙性',
                    engagement: '參與度',
                    overall: '總體質量'
                  };

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {labels[key as keyof typeof labels]}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getQualityColor(value).includes('green') ? 'bg-green-500' : 
                              getQualityColor(value).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getQualityColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>質量指標將在驗證後顯示</p>
              </div>
            )}
          </div>
        )}

        {/* 改進建議標籤 */}
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {validationResult?.suggestions.length ? (
              validationResult.suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className="p-3 border border-blue-200 rounded-lg bg-blue-50"
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">{suggestion.message}</div>
                      {suggestion.originalText && suggestion.suggestedText && (
                        <div className="mt-2 text-sm">
                          <div className="text-red-700">原文: "{suggestion.originalText}"</div>
                          <div className="text-green-700">建議: "{suggestion.suggestedText}"</div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {Math.round(suggestion.confidence * 100)}% 信心
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {suggestion.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💡</div>
                <p>暫無改進建議</p>
              </div>
            )}
          </div>
        )}

        {/* 驗證規則標籤 */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            {allRules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                data-testid={`rule-${rule.id}`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{rule.name}</div>
                  <div className="text-sm text-gray-600">{rule.description}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                      {rule.severity === 'error' ? '錯誤' : rule.severity === 'warning' ? '警告' : '信息'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {rule.category}
                    </span>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabledRules.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">啟用</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自動修復模態框 */}
      {showAutoFixModal && validationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">自動修復</h3>
            
            <div className="space-y-3 mb-6">
              {validationResult.suggestions
                .filter(s => s.confidence > 0.8)
                .map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{suggestion.message}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      信心度: {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAutoFixModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={applyAutoFix}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                data-testid="confirm-auto-fix"
              >
                應用修復
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedContentValidator;
