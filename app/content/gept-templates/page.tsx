/**
 * GEPT分級和內容模板系統頁面
 * 展示完整的GEPT分級模板、內容驗證和詞彙瀏覽功能
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GEPTTemplateManager from '../../../components/gept/GEPTTemplateManager';
import GEPTVocabularyBrowser from '../../../components/gept/GEPTVocabularyBrowser';
import QuickInsertPanel from '../../../components/gept/QuickInsertPanel';
import { ValidationResult, GEPTWord, GEPTLevel } from '../../../lib/gept/GEPTManager';

export default function GEPTTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'vocabulary' | 'quick-insert'>('templates');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedWord, setSelectedWord] = useState<GEPTWord | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentLevel, setCurrentLevel] = useState<GEPTLevel>('elementary');
  const [insertedContent, setInsertedContent] = useState<string[]>([]);

  const handleTemplateApply = (content: string) => {
    setGeneratedContent(content);
    console.log('模板應用完成:', content);
  };

  const handleValidationResult = (result: ValidationResult) => {
    setValidationResult(result);
    console.log('驗證結果:', result);
  };

  const handleWordSelect = (word: GEPTWord) => {
    setSelectedWord(word);
    console.log('選中詞彙:', word);
  };

  const handleQuickInsert = (content: string, type: string) => {
    setInsertedContent(prev => [content, ...prev.slice(0, 9)]); // 保留最近10個插入項目
    setGeneratedContent(prev => prev + (prev ? '\n\n' : '') + content);
    console.log('快速插入:', { content, type });
  };

  const clearInsertedContent = () => {
    setInsertedContent([]);
    setGeneratedContent('');
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
            GEPT分級和內容模板系統
          </h1>
          <p className="text-gray-600 text-lg">
            完整的GEPT分級模板管理、內容驗證和詞彙瀏覽功能，支持三個級別的英語學習
          </p>
        </div>

        {/* 功能特色 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">📚</div>
              <div>
                <h3 className="font-medium text-gray-900">GEPT分級</h3>
                <p className="text-sm text-gray-600">初級、中級、中高級三個級別</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">📝</div>
              <div>
                <h3 className="font-medium text-gray-900">內容模板</h3>
                <p className="text-sm text-gray-600">詞彙、語法、閱讀等模板</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">✅</div>
              <div>
                <h3 className="font-medium text-gray-900">內容驗證</h3>
                <p className="text-sm text-gray-600">GEPT合規性檢查</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-xl">🔍</div>
              <div>
                <h3 className="font-medium text-gray-900">詞彙瀏覽</h3>
                <p className="text-sm text-gray-600">分級詞彙搜索和管理</p>
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
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('templates')}
                data-testid="templates-tab"
              >
                模板管理
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vocabulary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('vocabulary')}
                data-testid="vocabulary-tab"
              >
                詞彙瀏覽
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quick-insert'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('quick-insert')}
                data-testid="quick-insert-tab"
              >
                快速插入
              </button>
            </nav>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-3">
            {activeTab === 'templates' && (
              <GEPTTemplateManager
                onTemplateApply={handleTemplateApply}
                onValidationResult={handleValidationResult}
                data-testid="main-template-manager"
              />
            )}

            {activeTab === 'vocabulary' && (
              <GEPTVocabularyBrowser
                onWordSelect={handleWordSelect}
                data-testid="main-vocabulary-browser"
              />
            )}

            {activeTab === 'quick-insert' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 快速插入面板 */}
                <div>
                  <QuickInsertPanel
                    onInsert={handleQuickInsert}
                    targetLevel={currentLevel}
                    data-testid="quick-insert-panel"
                  />
                </div>

                {/* 插入內容預覽 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">插入內容預覽</h3>
                    <button
                      onClick={clearInsertedContent}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      data-testid="clear-content-btn"
                    >
                      清空
                    </button>
                  </div>

                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">生成的內容</h4>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {generatedContent}
                        </pre>
                      </div>

                      {/* 最近插入的項目 */}
                      {insertedContent.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">最近插入</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {insertedContent.map((content, index) => (
                              <div
                                key={index}
                                className="p-2 bg-blue-50 rounded text-sm text-blue-800 cursor-pointer hover:bg-blue-100"
                                onClick={() => handleQuickInsert(content, 'repeat')}
                                data-testid={`recent-item-${index}`}
                              >
                                {content.length > 50 ? `${content.substring(0, 50)}...` : content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>選擇左側的內容進行快速插入</p>
                      <p className="text-sm mt-1">插入的內容將在這裡顯示</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 側邊欄 - 狀態和信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'templates' ? '驗證狀態' : '詞彙信息'}
              </h3>
              
              {activeTab === 'templates' ? (
                /* 模板驗證狀態 */
                <div className="template-status space-y-4" data-testid="template-status">
                  {validationResult ? (
                    <>
                      {/* 驗證結果 */}
                      <div className={`p-3 rounded-lg ${
                        validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {validationResult.isValid ? '✅' : '❌'}
                          </span>
                          <span className={`font-medium text-sm ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                            {validationResult.isValid ? '驗證通過' : '驗證失敗'}
                          </span>
                        </div>
                      </div>

                      {/* GEPT合規性分數 */}
                      <div className="gept-score">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">GEPT合規性</span>
                          <span className={`text-sm font-bold ${
                            validationResult.geptCompliance.score >= 80 ? 'text-green-600' : 
                            validationResult.geptCompliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {validationResult.geptCompliance.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              validationResult.geptCompliance.score >= 80 ? 'bg-green-500' : 
                              validationResult.geptCompliance.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${validationResult.geptCompliance.score}%` }}
                          />
                        </div>
                      </div>

                      {/* 錯誤和警告統計 */}
                      <div className="stats space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">錯誤:</span>
                          <span className="text-red-600 font-medium">{validationResult.errors.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">警告:</span>
                          <span className="text-yellow-600 font-medium">{validationResult.warnings.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">建議:</span>
                          <span className="text-blue-600 font-medium">{validationResult.suggestions.length}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-sm">應用模板並驗證內容後，這裡會顯示驗證結果</p>
                    </div>
                  )}

                  {/* 生成內容預覽 */}
                  {generatedContent && (
                    <div className="generated-preview mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">生成內容預覽</h4>
                      <div className="text-sm text-blue-800 max-h-32 overflow-y-auto">
                        {generatedContent.substring(0, 200)}
                        {generatedContent.length > 200 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 詞彙信息 */
                <div className="vocabulary-info" data-testid="vocabulary-info">
                  {selectedWord ? (
                    <div className="space-y-4">
                      {/* 選中詞彙 */}
                      <div className="selected-word p-3 bg-blue-50 rounded border border-blue-200">
                        <h4 className="font-bold text-blue-900 text-lg">{selectedWord.word}</h4>
                        <p className="text-blue-800 text-sm">{selectedWord.definition}</p>
                      </div>

                      {/* 詞彙統計 */}
                      <div className="word-stats space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">級別:</span>
                          <span className="font-medium">
                            {selectedWord.level === 'elementary' ? '初級' : 
                             selectedWord.level === 'intermediate' ? '中級' : '中高級'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">詞性:</span>
                          <span className="font-medium">{selectedWord.partOfSpeech}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">頻率:</span>
                          <span className="font-medium">{selectedWord.frequency}/10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">難度:</span>
                          <span className="font-medium">{selectedWord.difficulty}/10</span>
                        </div>
                      </div>

                      {/* 例句 */}
                      <div className="example p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-gray-700 mb-1">例句</h5>
                        <p className="text-sm text-gray-600 italic">"{selectedWord.example}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📖</div>
                      <p className="text-sm">選擇詞彙查看詳細信息</p>
                    </div>
                  )}
                </div>
              )}

              {/* 快速操作 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">快速操作</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab(activeTab === 'templates' ? 'vocabulary' : 'templates')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    data-testid="switch-tab-btn"
                  >
                    🔄 切換到{activeTab === 'templates' ? '詞彙瀏覽' : '模板管理'}
                  </button>
                  
                  {activeTab === 'templates' && generatedContent && (
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedContent)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      data-testid="copy-content-btn"
                    >
                      📋 複製生成內容
                    </button>
                  )}
                  
                  {activeTab === 'vocabulary' && selectedWord && (
                    <button
                      onClick={() => navigator.clipboard.writeText(`${selectedWord.word}: ${selectedWord.definition}`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      data-testid="copy-word-btn"
                    >
                      📋 複製詞彙信息
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GEPT級別說明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GEPT級別說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="gept-level p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">初級 (Elementary)</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 基礎詞彙約2,000字</li>
                <li>• 簡單句型結構</li>
                <li>• 日常生活對話</li>
                <li>• 適合國中程度</li>
              </ul>
            </div>
            
            <div className="gept-level p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">中級 (Intermediate)</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 詞彙量約4,000字</li>
                <li>• 複合句型運用</li>
                <li>• 工作場合溝通</li>
                <li>• 適合高中程度</li>
              </ul>
            </div>
            
            <div className="gept-level p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">中高級 (High-Intermediate)</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• 詞彙量約6,000字</li>
                <li>• 複雜語法結構</li>
                <li>• 學術和專業討論</li>
                <li>• 適合大學程度</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">使用說明</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>在「模板管理」中選擇適合的GEPT級別和內容類型模板</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>填寫模板變量，應用模板生成內容</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>使用內容驗證功能檢查GEPT合規性</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>在「詞彙瀏覽」中搜索和學習分級詞彙</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>根據驗證結果調整內容以符合目標級別要求</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
