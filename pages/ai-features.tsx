import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface AIGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameType: string;
  language: string;
  itemCount: number;
}

interface AIGeneratedContent {
  title: string;
  items: Array<{
    term: string;
    definition: string;
    options?: string[];
  }>;
}

const AIFeaturesPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);
  const [request, setRequest] = useState<AIGenerationRequest>({
    topic: '',
    difficulty: 'medium',
    gameType: 'quiz',
    language: 'zh-TW',
    itemCount: 10
  });

  const handleGenerate = async () => {
    if (!request.topic.trim()) {
      alert('請輸入主題');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
      } else {
        throw new Error('生成失敗');
      }
    } catch (error) {
      console.error('AI 生成錯誤:', error);
      alert('AI 生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateActivity = () => {
    if (generatedContent) {
      // 將生成的內容傳遞到創建頁面
      const contentData = encodeURIComponent(JSON.stringify(generatedContent));
      router.push(`/create?aiContent=${contentData}`);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">載入中...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>AI 功能 | EduCreate</title>
        <meta name="description" content="使用 AI 自動生成教學內容" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">🤖 AI 內容生成</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左側：配置面板 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    學習主題 *
                  </label>
                  <input
                    type="text"
                    value={request.topic}
                    onChange={(e) => setRequest({ ...request, topic: e.target.value })}
                    placeholder="例如：英語動物詞彙、數學基礎運算、科學元素週期表"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    難度等級
                  </label>
                  <select
                    value={request.difficulty}
                    onChange={(e) => setRequest({ ...request, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">初級</option>
                    <option value="medium">中級</option>
                    <option value="hard">高級</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    遊戲類型
                  </label>
                  <select
                    value={request.gameType}
                    onChange={(e) => setRequest({ ...request, gameType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quiz">測驗問答</option>
                    <option value="matching">配對遊戲</option>
                    <option value="flashcards">單字卡片</option>
                    <option value="crossword">填字遊戲</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    內容數量
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={request.itemCount}
                    onChange={(e) => setRequest({ ...request, itemCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    語言
                  </label>
                  <select
                    value={request.language}
                    onChange={(e) => setRequest({ ...request, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">簡體中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !request.topic.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? '🤖 AI 生成中...' : '🚀 開始生成'}
                </button>
              </div>

              {/* 右側：預覽面板 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 生成預覽</h3>
                
                {!generatedContent && !isGenerating && (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-4">🤖</div>
                    <p>配置參數後點擊生成，AI 將為您創建教學內容</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center text-gray-500 py-12">
                    <div className="animate-spin text-4xl mb-4">⚙️</div>
                    <p>AI 正在生成內容，請稍候...</p>
                  </div>
                )}

                {generatedContent && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{generatedContent.title}</h4>
                      <p className="text-sm text-gray-600">共 {generatedContent.items.length} 個項目</p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {generatedContent.items.slice(0, 5).map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-900">{item.term}</div>
                          <div className="text-sm text-gray-600">{item.definition}</div>
                        </div>
                      ))}
                      {generatedContent.items.length > 5 && (
                        <div className="text-center text-gray-500 text-sm">
                          還有 {generatedContent.items.length - 5} 個項目...
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCreateActivity}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      ✨ 創建活動
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI 功能介紹 */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🌟 AI 功能特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold text-gray-900 mb-2">智能內容生成</h3>
                <p className="text-gray-600 text-sm">基於主題自動生成高質量的教學內容</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">個性化難度</h3>
                <p className="text-gray-600 text-sm">根據學習者水平調整內容難度</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-semibold text-gray-900 mb-2">多語言支持</h3>
                <p className="text-gray-600 text-sm">支持多種語言的內容生成</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIFeaturesPage;
