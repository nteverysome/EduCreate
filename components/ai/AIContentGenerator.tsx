/**
 * AI 內容生成器組件
 * 提供 AI 自動生成教育內容的用戶界面
 */

import React, { useState, useEffect } from 'react';
import { 
  ContentGenerator, 
  AIGenerationRequest, 
  AIGenerationResult,
  AIModel 
} from '../../lib/ai/ContentGenerator';
import { GameType } from '../../lib/content/UniversalContentManager';

interface AIContentGeneratorProps {
  gameType: GameType;
  onContentGenerated: (content: any[]) => void;
  onClose?: () => void;
}

export default function AIContentGenerator({
  gameType,
  onContentGenerated,
  onClose
}: AIContentGeneratorProps) {
  const [request, setRequest] = useState<Partial<AIGenerationRequest>>({
    type: 'questions',
    gameType,
    topic: '',
    difficulty: 'intermediate',
    count: 5,
    language: 'zh-TW',
    targetAge: '',
    learningObjectives: [],
    customPrompt: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIGenerationResult | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<any[]>([]);

  // 初始化
  useEffect(() => {
    ContentGenerator.initialize();
    const models = ContentGenerator.getAvailableModels();
    setAvailableModels(models);
    if (models.length > 0) {
      setSelectedModel(models[0].id);
    }
  }, []);

  // 生成內容
  const handleGenerate = async () => {
    if (!request.topic?.trim()) {
      alert('請輸入主題');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      if (selectedModel) {
        ContentGenerator.setDefaultModel(selectedModel);
      }

      const generationResult = await ContentGenerator.generateContent(request as AIGenerationRequest);
      setResult(generationResult);
      
      if (generationResult.success) {
        const content = generationResult.items.map(item => item.content);
        setPreviewContent(content);
      }
    } catch (error) {
      console.error('生成失敗:', error);
      alert('生成失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 應用生成的內容
  const handleApplyContent = () => {
    if (previewContent.length > 0) {
      onContentGenerated(previewContent);
      onClose?.();
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    handleGenerate();
  };

  // 更新學習目標
  const updateLearningObjectives = (objectives: string) => {
    const objectiveList = objectives.split('\n').filter(obj => obj.trim());
    setRequest(prev => ({ ...prev, learningObjectives: objectiveList }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 頭部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">🤖 AI 內容生成器</h2>
            <p className="text-purple-100 mt-1">使用 AI 自動生成高質量教育內容</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 配置面板 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">生成配置</h3>
            
            <div className="space-y-4">
              {/* 內容類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  內容類型
                </label>
                <select
                  value={request.type}
                  onChange={(e) => setRequest(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="questions">問題</option>
                  <option value="answers">答案</option>
                  <option value="hints">提示</option>
                  <option value="explanations">解釋</option>
                  <option value="content">通用內容</option>
                </select>
              </div>

              {/* 主題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主題 *
                </label>
                <input
                  type="text"
                  value={request.topic}
                  onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="例如：數學加法、英語動詞、科學實驗"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 難度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  難度級別
                </label>
                <select
                  value={request.difficulty}
                  onChange={(e) => setRequest(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">高級</option>
                </select>
              </div>

              {/* 數量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生成數量
                </label>
                <input
                  type="number"
                  value={request.count}
                  onChange={(e) => setRequest(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 目標年齡 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標年齡
                </label>
                <input
                  type="text"
                  value={request.targetAge}
                  onChange={(e) => setRequest(prev => ({ ...prev, targetAge: e.target.value }))}
                  placeholder="例如：6-8歲、小學生、成人"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* AI 模型選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI 模型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* 學習目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  學習目標
                </label>
                <textarea
                  value={request.learningObjectives?.join('\n') || ''}
                  onChange={(e) => updateLearningObjectives(e.target.value)}
                  placeholder="每行一個學習目標"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 自定義提示 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自定義提示
                </label>
                <textarea
                  value={request.customPrompt}
                  onChange={(e) => setRequest(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="額外的生成要求或限制"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 生成按鈕 */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !request.topic?.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    生成中...
                  </div>
                ) : (
                  '🚀 生成內容'
                )}
              </button>
            </div>
          </div>

          {/* 結果預覽 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">生成結果</h3>
              {result && result.success && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleRegenerate}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                  >
                    🔄 重新生成
                  </button>
                  <button
                    onClick={handleApplyContent}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    ✅ 應用內容
                  </button>
                </div>
              )}
            </div>

            {!result && !isGenerating && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <p className="text-gray-600">配置參數後點擊生成按鈕開始</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI 正在生成內容，請稍候...</p>
              </div>
            )}

            {result && !result.success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">生成失敗</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors?.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result && result.success && (
              <div>
                {/* 生成統計 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">生成統計</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 font-bold">{result.totalGenerated}</div>
                      <div className="text-blue-700">生成數量</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold">{result.processingTime}ms</div>
                      <div className="text-blue-700">處理時間</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold">{result.usage.tokensUsed}</div>
                      <div className="text-blue-700">使用 Token</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold">${result.usage.cost.toFixed(4)}</div>
                      <div className="text-blue-700">估計成本</div>
                    </div>
                  </div>
                </div>

                {/* 生成內容 */}
                <div className="space-y-4">
                  {result.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">內容 {index + 1}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                            item.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            信心度: {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(item.content, null, 2)}
                        </pre>
                      </div>

                      {item.suggestions && item.suggestions.length > 0 && (
                        <div className="text-sm">
                          <h6 className="font-medium text-gray-700 mb-1">建議:</h6>
                          <ul className="text-gray-600 space-y-1">
                            {item.suggestions.map((suggestion, idx) => (
                              <li key={idx}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作欄 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {result && result.success && (
              <span>已生成 {result.totalGenerated} 個內容項目</span>
            )}
          </div>
          <div className="flex space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            )}
            {result && result.success && (
              <button
                onClick={handleApplyContent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                應用生成的內容
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
