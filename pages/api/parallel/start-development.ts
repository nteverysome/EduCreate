import { NextApiRequest, NextApiResponse } from 'next';
import { ParallelAgentOrchestrator } from '@/lib/parallel/ParallelAgentOrchestrator';
import { ParallelAssetPipeline } from '@/lib/parallel/ParallelAssetPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    console.log('🚀 啟動極限並行化開發 - 10倍加速模式');
    
    const startTime = Date.now();

    // 並行啟動智能體協調器和資產生成流水線
    const [agentResults, assetResults] = await Promise.all([
      ParallelAgentOrchestrator.startUltraParallelDevelopment(),
      ParallelAssetPipeline.startUltraParallelGeneration()
    ]);

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    // 獲取最終統計
    const agentStats = ParallelAgentOrchestrator.getRealtimeStatus();
    const assetStats = ParallelAssetPipeline.getRealtimeStats();

    // 計算加速倍數
    const estimatedSequentialTime = agentStats.totalTasks * 30 + assetStats.totalAssets * 3; // 分鐘
    const actualTime = totalTime / 60; // 分鐘
    const speedupFactor = Math.round(estimatedSequentialTime / actualTime);

    const response = {
      success: true,
      message: '極限並行化開發完成',
      executionTime: totalTime,
      speedupFactor,
      results: {
        agents: {
          totalTasks: agentStats.totalTasks,
          completedTasks: agentStats.completedTasks,
          failedTasks: agentStats.failedTasks,
          successRate: Math.round((agentStats.completedTasks / agentStats.totalTasks) * 100),
          teams: agentStats.teams
        },
        assets: {
          totalAssets: assetStats.totalAssets,
          generatedAssets: assetStats.generatedAssets,
          failedAssets: assetStats.failedAssets,
          successRate: Math.round(((assetStats.generatedAssets - assetStats.failedAssets) / assetStats.totalAssets) * 100),
          throughputPerMinute: assetStats.throughputPerMinute,
          averageGenerationTime: assetStats.averageGenerationTime
        }
      },
      summary: {
        totalDevelopmentTime: `${totalTime.toFixed(1)} 秒`,
        estimatedSequentialTime: `${estimatedSequentialTime.toFixed(1)} 分鐘`,
        actualTime: `${actualTime.toFixed(1)} 分鐘`,
        speedupAchieved: `${speedupFactor}x 加速`,
        tasksCompleted: agentStats.completedTasks + assetStats.generatedAssets,
        overallSuccessRate: Math.round(((agentStats.completedTasks + assetStats.generatedAssets) / (agentStats.totalTasks + assetStats.totalAssets)) * 100)
      },
      achievements: [
        `🎮 完成 ${agentStats.completedTasks} 個遊戲模板開發`,
        `🎨 生成 ${assetStats.generatedAssets} 個遊戲資產`,
        `⚡ 實現 ${speedupFactor}x 開發加速`,
        `🎯 達成 ${Math.round(((agentStats.completedTasks + assetStats.generatedAssets) / (agentStats.totalTasks + assetStats.totalAssets)) * 100)}% 總體成功率`,
        `🚀 並行處理效率提升 ${Math.round(assetStats.throughputPerMinute / 2)}x`
      ]
    };

    console.log('🎉 極限並行化開發完成！');
    console.log(`⏱️ 執行時間: ${totalTime.toFixed(1)} 秒`);
    console.log(`🚀 加速倍數: ${speedupFactor}x`);
    console.log(`📊 總體成功率: ${response.summary.overallSuccessRate}%`);

    res.status(200).json(response);

  } catch (error) {
    console.error('極限並行化開發失敗:', error);
    
    res.status(500).json({
      success: false,
      error: '極限並行化開發失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 獲取實時開發狀態
 */
export async function getRealtimeStatus() {
  try {
    const agentStats = ParallelAgentOrchestrator.getRealtimeStatus();
    const assetStats = ParallelAssetPipeline.getRealtimeStats();

    return {
      agents: agentStats,
      assets: assetStats,
      overall: {
        totalTasks: agentStats.totalTasks + assetStats.totalAssets,
        completedTasks: agentStats.completedTasks + assetStats.generatedAssets,
        progress: Math.round(((agentStats.completedTasks + assetStats.generatedAssets) / (agentStats.totalTasks + assetStats.totalAssets)) * 100),
        isRunning: agentStats.runningTasks > 0 || assetStats.completedBatches < assetStats.totalBatches
      }
    };
  } catch (error) {
    console.error('獲取實時狀態失敗:', error);
    throw error;
  }
}
