import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { withErrorHandler } from '../../lib/errorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許GET請求' });
  }

  const startTime = Date.now();
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {}
  };

  try {
    // 檢查數據庫連接
    console.log('🔍 檢查數據庫連接...');
    const dbStart = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        message: '數據庫連接正常'
      };
      console.log('✅ 數據庫連接正常');
    } catch (dbError) {
      console.error('❌ 數據庫連接失敗:', dbError);
      checks.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
        message: '數據庫連接失敗',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      };
      checks.status = 'unhealthy';
    }

    // 檢查環境變數
    console.log('🔍 檢查環境變數...');
    const envStart = Date.now();

    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    checks.checks.environment_variables = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - envStart,
      message: missingEnvVars.length === 0 ? '環境變數配置完整' : `缺少環境變數: ${missingEnvVars.join(', ')}`,
      details: {
        required: requiredEnvVars.length,
        missing: missingEnvVars
      }
    };

    if (missingEnvVars.length > 0) {
      console.log('❌ 缺少環境變數:', missingEnvVars);
      checks.status = 'unhealthy';
    } else {
      console.log('✅ 環境變數配置完整');
    }

    // 計算總響應時間
    checks.totalResponseTime = Date.now() - startTime;

    console.log(`✅ 健康檢查完成 (${checks.totalResponseTime}ms)`);

    // 根據整體狀態返回適當的 HTTP 狀態碼
    const statusCode = checks.status === 'healthy' ? 200 : 503;

    return res.status(statusCode).json({
      success: checks.status === 'healthy',
      data: checks
    });

  } catch (error) {
    console.error('❌ 健康檢查失敗:', error);

    checks.status = 'unhealthy';
    checks.totalResponseTime = Date.now() - startTime;
    checks.error = error instanceof Error ? error.message : 'Unknown error';

    return res.status(503).json({
      success: false,
      data: checks,
      error: {
        message: '健康檢查失敗',
        code: 'HEALTH_CHECK_FAILED'
      }
    });
  }
}

export default withErrorHandler(handler);