/**
 * AI輔助內容生成系統頁面
 * 基於記憶科學原理的AI內容生成，支持多語言翻譯和個性化學習建議
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  aiContentGenerator,
  AIGenerationRequest,
  GeneratedContent,
  Language,
  ContentType,
  DifficultyLevel,
  MemoryTechnique,
  TranslationRequest,
  TranslationResult,
  PersonalizationSuggestion,
  LearnerProfile
} from '../../../lib/ai/AIContentGenerator';

export default function AIContentGenerationPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'translate' | 'personalize'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [suggestions, setSuggestions] = useState<PersonalizationSuggestion[]>([]);

  // 生成請求狀態
  const [request, setRequest] = useState<AIGenerationRequest>({
    type: 'vocabulary',
    topic: '日常生活',
    language: 'zh-TW',
    difficulty: 'intermediate',
    memoryTechniques: ['spaced-repetition', 'active-recall'],
    wordCount: 300,
    keywords: ['學習', '記憶', '教育']
  });

  // 翻譯請求狀態
  const [translationRequest, setTranslationRequest] = useState<TranslationRequest>({
    text: '歡迎使用 EduCreate AI 內容生成系統！這個系統基於記憶科學原理，能夠生成個性化的學習內容。',
    sourceLanguage: 'zh-TW',
    targetLanguage: 'en-US',
    preserveFormatting: true,
    culturalAdaptation: false
  });

  // 模擬學習者檔案
  const demoLearnerProfile: LearnerProfile = {
    id: 'demo_learner',
    name: '演示學習者',
    nativeLanguage: 'zh-TW',
    targetLanguages: ['en-US', 'ja-JP'],
    currentLevel: 'intermediate',
    learningGoals: ['提升詞彙量', '改善語法', '增強聽力'],
    strengths: ['記憶力好', '學習積極'],
    weaknesses: ['語法薄弱', '口語不足'],
    preferredMemoryTechniques: ['spaced-repetition', 'mnemonics'],
    learningStyle: 'visual',
    attentionSpan: 25,
    sessionFrequency: 5,
    lastActivity: Date.now()
  };

  // 處理內容生成
  const handleGenerateContent = useCallback(async () => {
    setIsGenerating(true);
    try {
      const content = await aiContentGenerator.generateContent(request);
      setGeneratedContent(content);
      console.log('內容生成成功:', content);
    } catch (error) {
      console.error('內容生成失敗:', error);
      alert('內容生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  }, [request]);

  // 處理翻譯
  const handleTranslate = useCallback(async () => {
    setIsTranslating(true);
    try {
      const result = await aiContentGenerator.translateText(translationRequest);
      setTranslationResult(result);
      console.log('翻譯成功:', result);
    } catch (error) {
      console.error('翻譯失敗:', error);
      alert('翻譯失敗，請稍後再試');
    } finally {
      setIsTranslating(false);
    }
  }, [translationRequest]);

  // 生成個性化建議
  const handleGeneratePersonalization = useCallback(() => {
    // 添加學習者檔案
    aiContentGenerator.addLearnerProfile(demoLearnerProfile);

    // 生成建議
    const newSuggestions = aiContentGenerator.generatePersonalizationSuggestions(demoLearnerProfile.id);
    setSuggestions(newSuggestions);
    console.log('個性化建議:', newSuggestions);
  }, []);

  // 更新請求字段
  const updateRequest = useCallback((field: keyof AIGenerationRequest, value: any) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  }, []);

  // 更新翻譯請求字段
  const updateTranslationRequest = useCallback((field: keyof TranslationRequest, value: any) => {
    setTranslationRequest(prev => ({ ...prev, [field]: value }));
  }, []);

  // 獲取語言名稱
  const getLanguageName = (language: Language): string => {
    const names = {
      'zh-TW': '繁體中文',
      'zh-CN': '簡體中文',
      'en-US': '英語',
      'ja-JP': '日語',
      'ko-KR': '韓語',
      'es-ES': '西班牙語',
      'fr-FR': '法語',
      'de-DE': '德語'
    };
    return names[language] || language;
  };

  // 獲取內容類型名稱
  const getContentTypeName = (type: ContentType): string => {
    const names = {
      vocabulary: '詞彙學習',
      grammar: '語法學習',
      reading: '閱讀理解',
      listening: '聽力練習',
      writing: '寫作練習',
      speaking: '口語練習',
      quiz: '測驗',
      exercise: '練習'
    };
    return names[type] || type;
  };

  // 獲取難度名稱
  const getDifficultyName = (difficulty: DifficultyLevel): string => {
    const names = {
      beginner: '初學者',
      elementary: '初級',
      intermediate: '中級',
      'upper-intermediate': '中高級',
      advanced: '高級'
    };
    return names[difficulty] || difficulty;
  };

  // 獲取記憶技巧名稱
  const getMemoryTechniqueName = (technique: MemoryTechnique): string => {
    const names = {
      'spaced-repetition': '間隔重複',
      'active-recall': '主動回憶',
      'elaborative-rehearsal': '精緻化複述',
      'mnemonics': '記憶術',
      'chunking': '組塊化',
      'interleaving': '交錯練習'
    };
    return names[technique] || technique;
  };

  // 格式化時間
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="home-link"
              >
                ← 返回主頁
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="dashboard-link"
              >
                功能儀表板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            AI輔助內容生成系統
          </h1>
          <p className="text-gray-600 text-lg">
            基於記憶科學原理的AI內容生成，支持多語言翻譯和個性化學習建議
          </p>
        </div>

        {/* 功能特色 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">🧠</div>
              <div>
                <h3 className="font-medium text-gray-900">記憶科學</h3>
                <p className="text-sm text-gray-600">基於6種記憶技巧生成內容</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">🌍</div>
              <div>
                <h3 className="font-medium text-gray-900">多語言支持</h3>
                <p className="text-sm text-gray-600">支持8種語言翻譯</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">🎯</div>
              <div>
                <h3 className="font-medium text-gray-900">個性化學習</h3>
                <p className="text-sm text-gray-600">根據學習者特點定制內容</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-xl">⚡</div>
              <div>
                <h3 className="font-medium text-gray-900">智能生成</h3>
                <p className="text-sm text-gray-600">AI自動生成高質量內容</p>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('generate')}
                data-testid="generate-tab"
              >
                內容生成
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'translate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('translate')}
                data-testid="translate-tab"
              >
                多語言翻譯
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personalize'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('personalize')}
                data-testid="personalize-tab"
              >
                個性化建議
              </button>
            </nav>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm" data-testid="ai-content-generator">
              {/* 內容生成標籤 */}
              {activeTab === 'generate' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI內容生成</h3>

                  {/* 生成參數 */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          內容類型
                        </label>
                        <select
                          value={request.type}
                          onChange={(e) => updateRequest('type', e.target.value as ContentType)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="content-type-select"
                        >
                          <option value="vocabulary">詞彙學習</option>
                          <option value="grammar">語法學習</option>
                          <option value="reading">閱讀理解</option>
                          <option value="listening">聽力練習</option>
                          <option value="writing">寫作練習</option>
                          <option value="speaking">口語練習</option>
                          <option value="quiz">測驗</option>
                          <option value="exercise">練習</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          語言
                        </label>
                        <select
                          value={request.language}
                          onChange={(e) => updateRequest('language', e.target.value as Language)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="language-select"
                        >
                          {aiContentGenerator.getSupportedLanguages().map(lang => (
                            <option key={lang} value={lang}>
                              {getLanguageName(lang)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          難度級別
                        </label>
                        <select
                          value={request.difficulty}
                          onChange={(e) => updateRequest('difficulty', e.target.value as DifficultyLevel)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="difficulty-select"
                        >
                          <option value="beginner">初學者</option>
                          <option value="elementary">初級</option>
                          <option value="intermediate">中級</option>
                          <option value="upper-intermediate">中高級</option>
                          <option value="advanced">高級</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          字數
                        </label>
                        <input
                          type="number"
                          value={request.wordCount || 300}
                          onChange={(e) => updateRequest('wordCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="300"
                          min="50"
                          max="2000"
                          data-testid="word-count-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        學習主題
                      </label>
                      <input
                        type="text"
                        value={request.topic}
                        onChange={(e) => updateRequest('topic', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：日常生活、商務英語、科學知識"
                        data-testid="topic-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        記憶技巧（可多選）
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {aiContentGenerator.getSupportedMemoryTechniques().map(technique => (
                          <label key={technique} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={request.memoryTechniques.includes(technique)}
                              onChange={(e) => {
                                const techniques = e.target.checked
                                  ? [...request.memoryTechniques, technique]
                                  : request.memoryTechniques.filter(t => t !== technique);
                                updateRequest('memoryTechniques', techniques);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              data-testid={`memory-technique-${technique}`}
                            />
                            <span className="text-sm text-gray-700">
                              {getMemoryTechniqueName(technique)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        關鍵詞（用逗號分隔）
                      </label>
                      <input
                        type="text"
                        value={request.keywords?.join(', ') || ''}
                        onChange={(e) => updateRequest('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="學習, 記憶, 教育"
                        data-testid="keywords-input"
                      />
                    </div>
                  </div>

                  {/* 生成按鈕 */}
                  <button
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !request.topic.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    data-testid="generate-content-btn"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>AI正在生成內容...</span>
                      </div>
                    ) : (
                      '🤖 生成AI內容'
                    )}
                  </button>

                  {/* 生成結果 */}
                  {generatedContent && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg" data-testid="generated-content">
                      <h4 className="font-medium text-gray-900 mb-3">生成的內容</h4>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-lg font-semibold text-gray-800">{generatedContent.title}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>類型: {getContentTypeName(generatedContent.type)}</span>
                            <span>語言: {getLanguageName(generatedContent.language)}</span>
                            <span>難度: {getDifficultyName(generatedContent.difficulty)}</span>
                          </div>
                        </div>

                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700">
                            {generatedContent.content}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">字數</div>
                            <div className="text-gray-600">{generatedContent.metadata.wordCount}</div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">閱讀時間</div>
                            <div className="text-gray-600">{generatedContent.metadata.readingTime} 分鐘</div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">認知負荷</div>
                            <div className="text-gray-600">{generatedContent.metadata.cognitiveLoad}/10</div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">記憶效果</div>
                            <div className="text-gray-600">{generatedContent.metadata.memoryEffectiveness}/10</div>
                          </div>
                        </div>

                        {generatedContent.exercises.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">配套練習</h5>
                            <div className="space-y-2">
                              {generatedContent.exercises.map((exercise, index) => (
                                <div key={exercise.id} className="bg-white p-3 rounded border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">練習 {index + 1}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {getMemoryTechniqueName(exercise.memoryTechnique)}
                                    </span>
                                  </div>
                                  <div className="text-gray-700">{exercise.question}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 翻譯標籤 */}
              {activeTab === 'translate' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">多語言翻譯</h3>

                  {/* 翻譯參數 */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          源語言
                        </label>
                        <select
                          value={translationRequest.sourceLanguage}
                          onChange={(e) => updateTranslationRequest('sourceLanguage', e.target.value as Language)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="source-language-select"
                        >
                          {aiContentGenerator.getSupportedLanguages().map(lang => (
                            <option key={lang} value={lang}>
                              {getLanguageName(lang)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          目標語言
                        </label>
                        <select
                          value={translationRequest.targetLanguage}
                          onChange={(e) => updateTranslationRequest('targetLanguage', e.target.value as Language)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="target-language-select"
                        >
                          {aiContentGenerator.getSupportedLanguages().map(lang => (
                            <option key={lang} value={lang}>
                              {getLanguageName(lang)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        要翻譯的文本
                      </label>
                      <textarea
                        value={translationRequest.text}
                        onChange={(e) => updateTranslationRequest('text', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="輸入要翻譯的文本..."
                        data-testid="translation-text-input"
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={translationRequest.preserveFormatting}
                          onChange={(e) => updateTranslationRequest('preserveFormatting', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          data-testid="preserve-formatting-checkbox"
                        />
                        <span className="text-sm text-gray-700">保持格式</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={translationRequest.culturalAdaptation}
                          onChange={(e) => updateTranslationRequest('culturalAdaptation', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          data-testid="cultural-adaptation-checkbox"
                        />
                        <span className="text-sm text-gray-700">文化適應</span>
                      </label>
                    </div>
                  </div>

                  {/* 翻譯按鈕 */}
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !translationRequest.text.trim()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    data-testid="translate-btn"
                  >
                    {isTranslating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>AI正在翻譯...</span>
                      </div>
                    ) : (
                      '🌍 開始翻譯'
                    )}
                  </button>

                  {/* 翻譯結果 */}
                  {translationResult && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg" data-testid="translation-result">
                      <h4 className="font-medium text-gray-900 mb-3">翻譯結果</h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              原文 ({getLanguageName(translationResult.sourceLanguage)})
                            </h5>
                            <div className="bg-white p-3 rounded border text-gray-700">
                              {translationResult.originalText}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              譯文 ({getLanguageName(translationResult.targetLanguage)})
                            </h5>
                            <div className="bg-white p-3 rounded border text-gray-700">
                              {translationResult.translatedText}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            翻譯時間: {formatTime(translationResult.timestamp)}
                          </span>
                          <span className={`font-medium ${
                            translationResult.confidence > 0.8 ? 'text-green-600' :
                            translationResult.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            信心度: {(translationResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>

                        {translationResult.alternatives.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">替代翻譯</h5>
                            <div className="space-y-2">
                              {translationResult.alternatives.map((alt, index) => (
                                <div key={index} className="bg-white p-2 rounded border text-sm text-gray-600">
                                  {alt}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {translationResult.culturalNotes && translationResult.culturalNotes.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">文化注釋</h5>
                            <div className="space-y-1">
                              {translationResult.culturalNotes.map((note, index) => (
                                <div key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                                  💡 {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 個性化建議標籤 */}
              {activeTab === 'personalize' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">個性化學習建議</h3>

                  {/* 學習者檔案 */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">演示學習者檔案</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">姓名:</span> {demoLearnerProfile.name}
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">母語:</span> {getLanguageName(demoLearnerProfile.nativeLanguage)}
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">目標語言:</span> {demoLearnerProfile.targetLanguages.map(lang => getLanguageName(lang)).join(', ')}
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">當前水平:</span> {getDifficultyName(demoLearnerProfile.currentLevel)}
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">學習風格:</span> {demoLearnerProfile.learningStyle}
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">注意力持續時間:</span> {demoLearnerProfile.attentionSpan} 分鐘
                      </div>
                    </div>
                  </div>

                  {/* 生成建議按鈕 */}
                  <button
                    onClick={handleGeneratePersonalization}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors mb-6"
                    data-testid="generate-personalization-btn"
                  >
                    🎯 生成個性化建議
                  </button>

                  {/* 個性化建議結果 */}
                  {suggestions.length > 0 && (
                    <div className="space-y-4" data-testid="personalization-suggestions">
                      <h4 className="font-medium text-gray-900">個性化建議</h4>

                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            suggestion.priority === 'high' ? 'border-red-500 bg-red-50' :
                            suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                            'border-green-500 bg-green-50'
                          }`}
                          data-testid={`suggestion-${index}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                            <span className={`px-2 py-1 text-xs rounded ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority === 'high' ? '高優先級' :
                               suggestion.priority === 'medium' ? '中優先級' : '低優先級'}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-3">{suggestion.description}</p>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">原因:</span> {suggestion.reasoning}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">實施方法:</span> {suggestion.implementation}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">預期效果:</span> {suggestion.expectedBenefit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {suggestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500" data-testid="no-suggestions">
                      <div className="text-4xl mb-2">🎯</div>
                      <p>點擊上方按鈕生成個性化學習建議</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'generate' ? '生成統計' :
                 activeTab === 'translate' ? '翻譯統計' : '學習分析'}
              </h3>

              {activeTab === 'generate' && (
                <div className="space-y-4" data-testid="generation-stats">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {aiContentGenerator.getGenerationHistory().length}
                    </div>
                    <div className="text-gray-600">總生成次數</div>
                  </div>

                  {generatedContent && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {generatedContent.metadata.memoryEffectiveness}/10
                        </div>
                        <div className="text-gray-600">記憶效果評分</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {generatedContent.exercises.length}
                        </div>
                        <div className="text-gray-600">配套練習數量</div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'translate' && (
                <div className="space-y-4" data-testid="translation-stats">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {aiContentGenerator.getSupportedLanguages().length}
                    </div>
                    <div className="text-gray-600">支持語言數</div>
                  </div>

                  {translationResult && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {(translationResult.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-gray-600">翻譯信心度</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {translationResult.alternatives.length}
                        </div>
                        <div className="text-gray-600">替代翻譯</div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'personalize' && (
                <div className="space-y-4" data-testid="personalization-stats">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {suggestions.length}
                    </div>
                    <div className="text-gray-600">個性化建議</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {aiContentGenerator.getSupportedMemoryTechniques().length}
                    </div>
                    <div className="text-gray-600">記憶技巧</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {demoLearnerProfile.attentionSpan}
                    </div>
                    <div className="text-gray-600">注意力時長(分)</div>
                  </div>
                </div>
              )}

              {/* 快速操作 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">快速操作</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab(activeTab === 'generate' ? 'translate' : 'generate')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    data-testid="switch-tab-btn"
                  >
                    🔄 切換到{activeTab === 'generate' ? '翻譯' : '生成'}
                  </button>

                  {generatedContent && (
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedContent.content)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      data-testid="copy-content-btn"
                    >
                      📋 複製生成內容
                    </button>
                  )}

                  {translationResult && (
                    <button
                      onClick={() => navigator.clipboard.writeText(translationResult.translatedText)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      data-testid="copy-translation-btn"
                    >
                      📋 複製翻譯結果
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 記憶科學原理說明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">記憶科學原理</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="memory-principle p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">間隔重複</h3>
              <p className="text-sm text-blue-800">根據遺忘曲線安排複習時間，在記憶即將遺忘時進行複習，提高長期記憶效果。</p>
            </div>

            <div className="memory-principle p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">主動回憶</h3>
              <p className="text-sm text-green-800">通過測試和問答強化記憶，比被動閱讀更有效地鞏固知識。</p>
            </div>

            <div className="memory-principle p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">精緻化複述</h3>
              <p className="text-sm text-purple-800">將新信息與已知知識建立聯繫，形成更豐富的記憶網絡。</p>
            </div>

            <div className="memory-principle p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">記憶術</h3>
              <p className="text-sm text-yellow-800">使用記憶技巧和聯想方法，如首字母縮寫、視覺化等提高記憶效率。</p>
            </div>

            <div className="memory-principle p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">組塊化</h3>
              <p className="text-sm text-red-800">將信息分組為有意義的單位，減少認知負荷，提高處理效率。</p>
            </div>

            <div className="memory-principle p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">交錯練習</h3>
              <p className="text-sm text-indigo-800">混合不同類型的練習，提高學習的靈活性和遷移能力。</p>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">使用說明</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>在「內容生成」中設置學習主題、語言和難度，選擇記憶技巧</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>點擊生成按鈕，AI會基於記憶科學原理創建個性化內容</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>在「多語言翻譯」中輸入文本，選擇源語言和目標語言</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>在「個性化建議」中查看基於學習者特點的優化建議</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>使用側邊欄的快速操作複製內容或切換功能</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}