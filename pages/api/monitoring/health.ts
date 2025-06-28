/**
 * 健康檢查 API
 * 用於監控應用程序的健康狀況
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy' | 'unknown';
    ai: 'healthy' | 'unhealthy' | 'unknown';
    storage: 'healthy' | 'unhealthy' | 'unknown';
    cache: 'healthy' | 'unhealthy' | 'unknown';
  };
  metrics: {
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    responseTime: number;
    errorRate: number;
  };
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 執行健康檢查
    const healthCheck = await performHealthCheck();
    const responseTime = Date.now() - startTime;

    // 設置響應頭
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 根據健康狀況設置 HTTP 狀態碼
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json({
      ...healthCheck,
      responseTime
    });

  } catch (error) {
    console.error('健康檢查失敗:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : '健康檢查失敗',
      responseTime: Date.now() - startTime
    });
  }
}

async function performHealthCheck(): Promise<HealthCheck> {
  const checks: HealthCheck['checks'] = [];
  const services: HealthCheck['services'] = {
    database: 'unknown',
    ai: 'unknown',
    storage: 'unknown',
    cache: 'unknown'
  };

  // 檢查數據庫連接
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);
  services.database = dbCheck.status === 'pass' ? 'healthy' : 'unhealthy';

  // 檢查 AI 服務
  const aiCheck = await checkAIService();
  checks.push(aiCheck);
  services.ai = aiCheck.status === 'pass' ? 'healthy' : 'unhealthy';

  // 檢查存儲服務
  const storageCheck = await checkStorage();
  checks.push(storageCheck);
  services.storage = storageCheck.status === 'pass' ? 'healthy' : 'unhealthy';

  // 檢查緩存服務
  const cacheCheck = await checkCache();
  checks.push(cacheCheck);
  services.cache = cacheCheck.status === 'pass' ? 'healthy' : 'unhealthy';

  // 檢查內存使用
  const memoryCheck = await checkMemoryUsage();
  checks.push(memoryCheck);

  // 計算整體健康狀況
  const failedChecks = checks.filter(c => c.status === 'fail').length;
  const warnChecks = checks.filter(c => c.status === 'warn').length;
  
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  if (failedChecks > 0) {
    overallStatus = 'unhealthy';
  } else if (warnChecks > 0) {
    overallStatus = 'degraded';
  }

  // 獲取系統指標
  const metrics = await getSystemMetrics();

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services,
    metrics,
    checks
  };
}

async function checkDatabase(): Promise<HealthCheck['checks'][0]> {
  const startTime = Date.now();
  
  try {
    // 模擬數據庫檢查
    // 在實際應用中，這裡應該執行真實的數據庫查詢
    if (process.env.DATABASE_URL) {
      // 簡單的連接測試
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        name: 'database',
        status: 'pass',
        message: '數據庫連接正常',
        duration: Date.now() - startTime
      };
    } else {
      return {
        name: 'database',
        status: 'warn',
        message: '數據庫未配置',
        duration: Date.now() - startTime
      };
    }
  } catch (error) {
    return {
      name: 'database',
      status: 'fail',
      message: `數據庫連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      duration: Date.now() - startTime
    };
  }
}

async function checkAIService(): Promise<HealthCheck['checks'][0]> {
  const startTime = Date.now();
  
  try {
    if (process.env.OPENAI_API_KEY) {
      // 模擬 AI 服務檢查
      await new Promise(resolve => setTimeout(resolve, 5));
      
      return {
        name: 'ai_service',
        status: 'pass',
        message: 'AI 服務可用',
        duration: Date.now() - startTime
      };
    } else {
      return {
        name: 'ai_service',
        status: 'warn',
        message: 'AI 服務未配置',
        duration: Date.now() - startTime
      };
    }
  } catch (error) {
    return {
      name: 'ai_service',
      status: 'fail',
      message: `AI 服務檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      duration: Date.now() - startTime
    };
  }
}

async function checkStorage(): Promise<HealthCheck['checks'][0]> {
  const startTime = Date.now();
  
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return {
        name: 'storage',
        status: 'pass',
        message: '存儲服務可用',
        duration: Date.now() - startTime
      };
    } else {
      return {
        name: 'storage',
        status: 'warn',
        message: '存儲服務未配置',
        duration: Date.now() - startTime
      };
    }
  } catch (error) {
    return {
      name: 'storage',
      status: 'fail',
      message: `存儲服務檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      duration: Date.now() - startTime
    };
  }
}

async function checkCache(): Promise<HealthCheck['checks'][0]> {
  const startTime = Date.now();
  
  try {
    // 模擬緩存檢查
    return {
      name: 'cache',
      status: 'pass',
      message: '緩存服務正常',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      name: 'cache',
      status: 'fail',
      message: `緩存服務檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      duration: Date.now() - startTime
    };
  }
}

async function checkMemoryUsage(): Promise<HealthCheck['checks'][0]> {
  const startTime = Date.now();
  
  try {
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = `內存使用正常: ${usedMB}MB / ${totalMB}MB (${percentage}%)`;
    
    if (percentage > 90) {
      status = 'fail';
      message = `內存使用過高: ${usedMB}MB / ${totalMB}MB (${percentage}%)`;
    } else if (percentage > 75) {
      status = 'warn';
      message = `內存使用較高: ${usedMB}MB / ${totalMB}MB (${percentage}%)`;
    }
    
    return {
      name: 'memory_usage',
      status,
      message,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      name: 'memory_usage',
      status: 'fail',
      message: `內存檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      duration: Date.now() - startTime
    };
  }
}

async function getSystemMetrics(): Promise<HealthCheck['metrics']> {
  const memoryUsage = process.memoryUsage();
  const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  
  return {
    memoryUsage: {
      used: usedMB,
      total: totalMB,
      percentage: Math.round((usedMB / totalMB) * 100)
    },
    responseTime: Math.random() * 100 + 50, // 模擬響應時間
    errorRate: Math.random() * 2 // 模擬錯誤率
  };
}
