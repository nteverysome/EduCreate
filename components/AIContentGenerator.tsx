import React, { useState } from 'react';
import { LoadingSpinner } from './PerformanceOptimizer';

interface AIGeneratorProps {
  onContentGenerated: (content: any) => void;
  onClose: () => void;
}

const AIContentGenerator = ({ onContentGenerated, onClose }: AIGeneratorProps) {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    gameType: 'quiz',
    questionCount: 5,
    language: 'zh-TW',
    targetAge: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'questionCount' ? parseInt(value) || 1 : value
    }));
  };

  const generateContent = async () => {
    if (!formData.topic.trim()) {
      setError('請輸入主題');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '生成失敗');
      }

      setGeneratedContent(result.data);
    } catch (err: any) {
      setError(err.message || '生成內容時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const useGeneratedContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      onClose();
    }
  };

  const regenerateContent = () => {
    setGeneratedContent(null);
    generateContent();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🤖 AI 智能內容生成
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {!generatedContent ? (
            /* 生成表單 */
            <div className="space-y-6">
              {/* 基本設置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主題 *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="例如：動物、數學、歷史..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    難度等級
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">簡單 - 適合初學者</option>
                    <option value="medium">中等 - 適合一般學習者</option>
                    <option value="hard">困難 - 適合進階學習者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    遊戲類型
                  </label>
                  <select
                    name="gameType"
                    value={formData.gameType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quiz">測驗問答</option>
                    <option value="match">配對遊戲</option>
                    <option value="flashcard">閃卡學習</option>
                    <option value="wheel">隨機輪盤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    問題數量
                  </label>
                  <input
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 高級設置 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">高級設置</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目標年齡
                    </label>
                    <input
                      type="text"
                      name="targetAge"
                      value={formData.targetAge}
                      onChange={handleInputChange}
                      placeholder="例如：6-8歲、國小、成人"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學科領域
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="例如：自然科學、語文、社會"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      語言
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="zh-TW">繁體中文</option>
                      <option value="zh-CN">簡體中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 錯誤信息 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* 生成按鈕 */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={generateContent}
                  disabled={loading || !formData.topic.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>開始生成</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* 生成結果 */
            <div className="space-y-6">
              {/* 內容預覽 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">
                    ✅ 內容生成成功！
                  </h3>
                  <div className="text-sm text-green-600">
                    生成了 {generatedContent.questions.length} 個問題
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{generatedContent.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{generatedContent.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <div className="text-gray-500">主題</div>
                      <div className="font-medium">{generatedContent.metadata.topic}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-gray-500">難度</div>
                      <div className="font-medium">{generatedContent.metadata.difficulty}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-gray-500">類型</div>
                      <div className="font-medium">{generatedContent.metadata.gameType}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-gray-500">預估時間</div>
                      <div className="font-medium">{generatedContent.metadata.estimatedTime} 分鐘</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 問題預覽 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">問題預覽</h4>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {generatedContent.questions.map((question: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border">
                      <div className="font-medium text-gray-900 mb-2">
                        {index + 1}. {question.question}
                      </div>
                      {question.options && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {question.options.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        解釋: {question.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={regenerateContent}
                  className="px-6 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  🔄 重新生成
                </button>
                <button
                  onClick={useGeneratedContent}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ 使用此內容
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIContentGenerator;
