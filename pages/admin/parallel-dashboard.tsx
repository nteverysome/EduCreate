import { useState, useEffect } from 'react';
import Head from 'next/head';

interface RealtimeStats {
  agents: {
    totalTasks: number;
    completedTasks: number;
    runningTasks: number;
    failedTasks: number;
    progress: number;
    teams: Array<{
      id: string;
      name: string;
      progress: number;
      completed: number;
      total: number;
      failed: number;
    }>;
  };
  assets: {
    totalBatches: number;
    completedBatches: number;
    totalAssets: number;
    generatedAssets: number;
    failedAssets: number;
    averageGenerationTime: number;
    throughputPerMinute: number;
  };
}

export default function ParallelDashboard() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    // 模擬實時數據更新
    const interval = setInterval(() => {
      if (isRunning) {
        updateMockStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const updateMockStats = () => {
    // 模擬實時統計數據
    setStats({
      agents: {
        totalTasks: 21,
        completedTasks: Math.min(21, Math.floor(Math.random() * 22)),
        runningTasks: Math.floor(Math.random() * 5),
        failedTasks: Math.floor(Math.random() * 2),
        progress: Math.min(100, Math.floor(Math.random() * 101)),
        teams: [
          {
            id: 'game_dev_team',
            name: '遊戲開發團隊',
            progress: Math.min(100, Math.floor(Math.random() * 101)),
            completed: Math.floor(Math.random() * 8),
            total: 8,
            failed: Math.floor(Math.random() * 2)
          },
          {
            id: 'content_team',
            name: '內容處理團隊',
            progress: Math.min(100, Math.floor(Math.random() * 101)),
            completed: Math.floor(Math.random() * 6),
            total: 6,
            failed: 0
          },
          {
            id: 'qa_team',
            name: '質量保證團隊',
            progress: Math.min(100, Math.floor(Math.random() * 101)),
            completed: Math.floor(Math.random() * 4),
            total: 4,
            failed: 0
          },
          {
            id: 'deployment_team',
            name: '部署團隊',
            progress: Math.min(100, Math.floor(Math.random() * 101)),
            completed: Math.floor(Math.random() * 3),
            total: 3,
            failed: 0
          }
        ]
      },
      assets: {
        totalBatches: 8,
        completedBatches: Math.min(8, Math.floor(Math.random() * 9)),
        totalAssets: 156,
        generatedAssets: Math.min(156, Math.floor(Math.random() * 157)),
        failedAssets: Math.floor(Math.random() * 5),
        averageGenerationTime: 2.3 + Math.random() * 0.5,
        throughputPerMinute: 25 + Math.random() * 10
      }
    });
  };

  const startParallelDevelopment = async () => {
    setIsRunning(true);
    setStartTime(new Date());
    
    try {
      // 實際應該調用並行開發 API
      const response = await fetch('/api/parallel/start-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('啟動並行開發失敗');
      }
      
      console.log('🚀 並行開發已啟動');
    } catch (error) {
      console.error('啟動失敗:', error);
      setIsRunning(false);
    }
  };

  const stopParallelDevelopment = () => {
    setIsRunning(false);
    setStartTime(null);
  };

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>極限並行化開發儀表板 - WordWall 仿製品</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* 頂部控制面板 */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">🚀 極限並行化開發儀表板</h1>
              <p className="text-gray-300 mt-2">實時監控多智能體協作開發進度</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">運行時間</p>
                <p className="text-2xl font-mono text-green-400">{getElapsedTime()}</p>
              </div>
              
              {!isRunning ? (
                <button
                  onClick={startParallelDevelopment}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  🚀 啟動並行開發
                </button>
              ) : (
                <button
                  onClick={stopParallelDevelopment}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  ⏹️ 停止開發
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* 總體統計 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">智能體任務</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {stats.agents.completedTasks}/{stats.agents.totalTasks}
                    </p>
                  </div>
                  <div className="text-4xl">🤖</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.agents.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{stats.agents.progress}% 完成</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">資產生成</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {stats.assets.generatedAssets}/{stats.assets.totalAssets}
                    </p>
                  </div>
                  <div className="text-4xl">🎨</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.assets.generatedAssets / stats.assets.totalAssets) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {Math.round((stats.assets.generatedAssets / stats.assets.totalAssets) * 100)}% 完成
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">生成速度</p>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.assets.throughputPerMinute.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">資產/分鐘</p>
                  <p className="text-sm text-green-400">
                    {Math.round(stats.assets.throughputPerMinute / 2)}x 加速
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">運行狀態</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {stats.agents.runningTasks}
                    </p>
                  </div>
                  <div className="text-4xl">🏃‍♂️</div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">活躍任務</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    isRunning ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                    {isRunning ? '運行中' : '已停止'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 團隊進度 */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">🤖 智能體團隊進度</h2>
                <div className="space-y-4">
                  {stats.agents.teams.map((team) => (
                    <div key={team.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-white">{team.name}</h3>
                        <span className="text-sm text-gray-400">
                          {team.completed}/{team.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${team.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{team.progress}% 完成</span>
                        {team.failed > 0 && (
                          <span className="text-red-400">{team.failed} 失敗</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">🎨 資產生成統計</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">總批次</span>
                    <span className="text-white font-medium">{stats.assets.totalBatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">已完成批次</span>
                    <span className="text-green-400 font-medium">{stats.assets.completedBatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">平均生成時間</span>
                    <span className="text-blue-400 font-medium">
                      {stats.assets.averageGenerationTime.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">失敗資產</span>
                    <span className="text-red-400 font-medium">{stats.assets.failedAssets}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">成功率</span>
                      <span className="text-green-400 font-bold text-lg">
                        {Math.round(((stats.assets.generatedAssets - stats.assets.failedAssets) / stats.assets.totalAssets) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 實時日誌 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">📋 實時開發日誌</h2>
            <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              <div className="text-green-400">[{new Date().toLocaleTimeString()}] 🚀 極限並行化開發系統啟動</div>
              <div className="text-blue-400">[{new Date().toLocaleTimeString()}] 🤖 初始化 21 個智能體任務</div>
              <div className="text-purple-400">[{new Date().toLocaleTimeString()}] 🎨 準備生成 156 個遊戲資產</div>
              <div className="text-yellow-400">[{new Date().toLocaleTimeString()}] ⚡ 並行度設置為 10x 加速模式</div>
              {isRunning && (
                <>
                  <div className="text-green-400">[{new Date().toLocaleTimeString()}] ✅ Quiz專家: Quiz模板開發完成</div>
                  <div className="text-green-400">[{new Date().toLocaleTimeString()}] ✅ 圖像生成專家: 批量資產生成完成</div>
                  <div className="text-blue-400">[{new Date().toLocaleTimeString()}] 🔄 配對遊戲專家: 正在開發配對邏輯...</div>
                  <div className="text-purple-400">[{new Date().toLocaleTimeString()}] 🎨 生成打地鼠角色資產中...</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
