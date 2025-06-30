import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface MemoryAnalysis {
  userId: string;
  totalActivities: number;
  averageScore: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendedTemplates: string[];
  learningPattern: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  retentionRate: number;
  improvementSuggestions: string[];
}

interface LearningSession {
  id: string;
  activityId: string;
  activityTitle: string;
  score: number;
  timeSpent: number;
  completedAt: Date;
  mistakes: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }>;
}

const MemoryEnhancementPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<MemoryAnalysis | null>(null);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadMemoryAnalysis();
      loadRecentSessions();
    }
  }, [session]);

  const loadMemoryAnalysis = async () => {
    try {
      const response = await fetch('/api/memory/analysis');
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('載入記憶分析失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    try {
      const response = await fetch('/api/memory/sessions');
      if (response.ok) {
        const data = await response.json();
        setRecentSessions(data);
      }
    } catch (error) {
      console.error('載入學習記錄失敗:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">載入中...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>記憶增強系統 | EduCreate</title>
        <meta name="description" content="個性化學習分析與記憶增強建議" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🧠 記憶增強系統</h1>

          {analysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左側：學習分析 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 學習概況 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📊 學習概況</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.totalActivities}</div>
                      <div className="text-sm text-gray-600">完成活動</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analysis.averageScore}%</div>
                      <div className="text-sm text-gray-600">平均分數</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analysis.retentionRate}%</div>
                      <div className="text-sm text-gray-600">記憶保持率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.learningPattern === 'visual' ? '👁️' : 
                         analysis.learningPattern === 'auditory' ? '👂' : 
                         analysis.learningPattern === 'kinesthetic' ? '✋' : '🧠'}
                      </div>
                      <div className="text-sm text-gray-600">學習類型</div>
                    </div>
                  </div>
                </div>

                {/* 強項與弱項 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">💪 學習分析</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3">✅ 強項領域</h3>
                      <div className="space-y-2">
                        {analysis.strongAreas.map((area, index) => (
                          <div key={index} className="bg-green-50 text-green-800 px-3 py-2 rounded-md text-sm">
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600 mb-3">📈 需要加強</h3>
                      <div className="space-y-2">
                        {analysis.weakAreas.map((area, index) => (
                          <div key={index} className="bg-red-50 text-red-800 px-3 py-2 rounded-md text-sm">
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 改進建議 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">💡 改進建議</h2>
                  <div className="space-y-3">
                    {analysis.improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="text-gray-700">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最近學習記錄 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📚 最近學習記錄</h2>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{session.activityTitle}</h3>
                          <div className="text-sm text-gray-500">
                            {new Date(session.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>分數: {session.score}%</span>
                            <span>用時: {Math.round(session.timeSpent / 60)}分鐘</span>
                            <span>錯誤: {session.mistakes.length}個</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            session.score >= 90 ? 'bg-green-100 text-green-800' :
                            session.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.score >= 90 ? '優秀' : session.score >= 70 ? '良好' : '需要改進'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右側：推薦與工具 */}
              <div className="space-y-6">
                {/* 推薦模板 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 推薦練習</h2>
                  <div className="space-y-3">
                    {analysis.recommendedTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => router.push(`/create?template=${template}`)}
                        className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-blue-900">{template}</div>
                        <div className="text-sm text-blue-600">根據您的學習模式推薦</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 記憶技巧 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 記憶技巧</h2>
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">間隔重複</h3>
                      <p className="text-sm text-purple-700">在不同時間間隔重複學習，提高長期記憶</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">聯想記憶</h3>
                      <p className="text-sm text-green-700">將新知識與已知概念建立聯繫</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">多感官學習</h3>
                      <p className="text-sm text-orange-700">結合視覺、聽覺、觸覺等多種感官</p>
                    </div>
                  </div>
                </div>

                {/* 學習目標 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 學習目標</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">本週練習時間</span>
                      <span className="font-semibold">120/180 分鐘</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">平均分數目標</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">開始您的學習之旅</h2>
              <p className="text-gray-600 mb-6">完成一些活動後，我們將為您提供個性化的記憶增強分析</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                開始學習
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MemoryEnhancementPage;
