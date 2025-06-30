import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';

interface AssetStats {
  total: number;
  generated: number;
  pending: number;
  byType: Record<string, number>;
  byTemplate: Record<string, number>;
}

interface GeneratedAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  gameTemplate: string;
}

interface GenerationResponse {
  success: boolean;
  message: string;
  generated: GeneratedAsset[];
  errors?: string[];
  stats: AssetStats;
  summary: {
    requested: number;
    successful: number;
    failed: number;
    totalAssets: number;
    completionRate: number;
  };
}

export default function AssetsPage() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const gameTemplates = [
    'quiz', 'whack_mole', 'match_up', 'spin_wheel', 'crossword'
  ];

  useEffect(() => {
    loadAssetStats();
  }, []);

  const loadAssetStats = async () => {
    try {
      const response = await fetch('/api/wordwall/templates');
      if (response.ok) {
        // 這裡應該有一個專門的 API 來獲取資產統計
        // 暫時使用模擬數據
        setStats({
          total: 20,
          generated: 0,
          pending: 20,
          byType: {
            'UI': 8,
            'CHARACTER': 4,
            'ICON': 5,
            'BACKGROUND': 3
          },
          byTemplate: {
            'quiz': 4,
            'whack_mole': 4,
            'match_up': 3,
            'spin_wheel': 2,
            'crossword': 2
          }
        });
      }
    } catch (error) {
      console.error('載入資產統計失敗:', error);
    }
  };

  const generateAssets = async (templateName?: string) => {
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const response = await fetch('/api/wordwall/generate-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          generateAll: !templateName
        }),
      });

      const result: GenerationResponse = await response.json();
      setGenerationResult(result);
      setStats(result.stats);

    } catch (error) {
      console.error('生成資產失敗:', error);
      setGenerationResult({
        success: false,
        message: '生成資產時發生錯誤',
        generated: [],
        errors: [error instanceof Error ? error.message : '未知錯誤'],
        stats: stats!,
        summary: {
          requested: 0,
          successful: 0,
          failed: 1,
          totalAssets: stats?.total || 0,
          completionRate: 0
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>資產管理 - WordWall 仿製品</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🎨 視覺資產管理</h1>
            <p className="mt-2 text-gray-600">
              管理和生成 WordWall 遊戲模板的視覺資產
            </p>
          </div>

          {/* 統計卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">總資產</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">已生成</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.generated}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">待生成</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📈</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">完成率</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((stats.generated / stats.total) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 生成控制面板 */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">🚀 資產生成</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value="">選擇遊戲模板（或生成全部）</option>
                  {gameTemplates.map(template => (
                    <option key={template} value={template}>
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => generateAssets(selectedTemplate || undefined)}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      🎨 生成資產
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 生成結果 */}
          {generationResult && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {generationResult.success ? '✅ 生成結果' : '❌ 生成失敗'}
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{generationResult.message}</p>
                
                {generationResult.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{generationResult.summary.requested}</p>
                      <p className="text-sm text-gray-500">請求生成</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{generationResult.summary.successful}</p>
                      <p className="text-sm text-gray-500">成功生成</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{generationResult.summary.failed}</p>
                      <p className="text-sm text-gray-500">生成失敗</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{generationResult.summary.completionRate}%</p>
                      <p className="text-sm text-gray-500">總完成率</p>
                    </div>
                  </div>
                )}

                {generationResult.generated.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">🎉 成功生成的資產:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generationResult.generated.map((asset) => (
                        <div key={asset.id} className="border rounded-lg p-4">
                          <img 
                            src={asset.url} 
                            alt={asset.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <h4 className="font-medium text-gray-900">{asset.name}</h4>
                          <p className="text-sm text-gray-500">{asset.type} - {asset.gameTemplate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generationResult.errors && generationResult.errors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-red-900 mb-3">❌ 錯誤信息:</h3>
                    <ul className="list-disc list-inside text-red-700">
                      {generationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 資產類型分布 */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">📊 按類型分布</h2>
                </div>
                <div className="p-6">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">🎮 按模板分布</h2>
                </div>
                <div className="p-6">
                  {Object.entries(stats.byTemplate).map(([template, count]) => (
                    <div key={template} className="flex justify-between items-center py-2">
                      <span className="text-gray-700">{template}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // 可以添加管理員權限檢查
  // if (!session || session.user.role !== 'ADMIN') {
  //   return {
  //     redirect: {
  //       destination: '/login',
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {},
  };
};
