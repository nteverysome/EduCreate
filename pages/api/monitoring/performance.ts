/**
 * 性能監控 API
 * 收集和分析應用程序性能指標
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface PerformanceMetric {
  id: string;
  type: 'page-load' | 'api-call' | 'user-interaction' | 'resource-load';
  name: string;
  duration: number;
  timestamp: string;
  url: string;
  userId?: string;
  metadata?: any;
}

interface SystemMetric {
  timestamp: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  responseTime: number;
  activeUsers: number;
  errorRate: number;
}

// 內存存儲性能指標（生產環境應使用數據庫）
const performanceMetrics: PerformanceMetric[] = [];
const systemMetrics: SystemMetric[] = [];
const maxMetrics = 10000; // 最多保存 10000 個指標

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      return handlePerformanceReport(req, res);
    }
    
    if (req.method === 'GET') {
      return getPerformanceMetrics(req, res);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('性能監控 API 錯誤:', error);
    return res.status(500).json({
      error: '性能監控服務錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理性能報告
function handlePerformanceReport(req: NextApiRequest, res: NextApiResponse) {
  const {
    type,
    name,
    duration,
    url,
    userId,
    metadata
  } = req.body;

  if (!type || !name || duration === undefined || !url) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['type', 'name', 'duration', 'url']
    });
  }

  const metric: PerformanceMetric = {
    id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    name,
    duration,
    url,
    timestamp: new Date().toISOString(),
    userId,
    metadata
  };

  // 添加到性能指標列表
  performanceMetrics.unshift(metric);
  
  // 保持最大數量限制
  if (performanceMetrics.length > maxMetrics) {
    performanceMetrics.splice(maxMetrics);
  }

  // 記錄系統指標
  recordSystemMetric();

  return res.status(200).json({
    success: true,
    message: '性能指標已記錄',
    metricId: metric.id,
    timestamp: metric.timestamp
  });
}

// 記錄系統指標
function recordSystemMetric() {
  const now = new Date().toISOString();
  
  // 模擬系統指標（實際應用中應該獲取真實的系統指標）
  const systemMetric: SystemMetric = {
    timestamp: now,
    memory: {
      used: Math.floor(Math.random() * 1000) + 500, // MB
      total: 2048, // MB
      percentage: Math.floor(Math.random() * 50) + 30 // 30-80%
    },
    responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
    activeUsers: Math.floor(Math.random() * 100) + 10, // 10-110 users
    errorRate: Math.random() * 5 // 0-5%
  };

  systemMetrics.unshift(systemMetric);
  
  // 只保留最近 1000 個系統指標
  if (systemMetrics.length > 1000) {
    systemMetrics.splice(1000);
  }
}

// 獲取性能指標
function getPerformanceMetrics(req: NextApiRequest, res: NextApiResponse) {
  const {
    type,
    limit = 100,
    since,
    summary = 'false'
  } = req.query;

  if (summary === 'true') {
    return getPerformanceSummary(res);
  }

  let filteredMetrics = [...performanceMetrics];

  // 按類型過濾
  if (type) {
    filteredMetrics = filteredMetrics.filter(metric => 
      metric.type === type
    );
  }

  // 按時間過濾
  if (since) {
    const sinceDate = new Date(since as string);
    filteredMetrics = filteredMetrics.filter(metric => 
      new Date(metric.timestamp) >= sinceDate
    );
  }

  // 限制數量
  const limitNum = parseInt(limit as string, 10);
  filteredMetrics = filteredMetrics.slice(0, limitNum);

  return res.status(200).json({
    success: true,
    data: filteredMetrics,
    total: performanceMetrics.length,
    filtered: filteredMetrics.length,
    timestamp: new Date().toISOString()
  });
}

// 獲取性能摘要
function getPerformanceSummary(res: NextApiResponse) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 最近一小時的指標
  const recentMetrics = performanceMetrics.filter(m => 
    new Date(m.timestamp) >= oneHourAgo
  );

  // 最近一天的指標
  const dailyMetrics = performanceMetrics.filter(m => 
    new Date(m.timestamp) >= oneDayAgo
  );

  // 計算平均值
  const calculateAverage = (metrics: PerformanceMetric[]) => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  };

  // 按類型分組統計
  const typeStats = ['page-load', 'api-call', 'user-interaction', 'resource-load'].map(type => {
    const typeMetrics = recentMetrics.filter(m => m.type === type);
    return {
      type,
      count: typeMetrics.length,
      averageDuration: Math.round(calculateAverage(typeMetrics)),
      maxDuration: typeMetrics.length > 0 ? Math.max(...typeMetrics.map(m => m.duration)) : 0,
      minDuration: typeMetrics.length > 0 ? Math.min(...typeMetrics.map(m => m.duration)) : 0
    };
  });

  // 最新系統指標
  const latestSystemMetric = systemMetrics[0];

  const summary = {
    overview: {
      totalMetrics: performanceMetrics.length,
      recentHourMetrics: recentMetrics.length,
      dailyMetrics: dailyMetrics.length,
      averageResponseTime: Math.round(calculateAverage(recentMetrics)),
    },
    typeBreakdown: typeStats,
    systemHealth: latestSystemMetric || {
      timestamp: new Date().toISOString(),
      memory: { used: 0, total: 0, percentage: 0 },
      responseTime: 0,
      activeUsers: 0,
      errorRate: 0
    },
    trends: {
      hourlyAverage: Math.round(calculateAverage(recentMetrics)),
      dailyAverage: Math.round(calculateAverage(dailyMetrics)),
      improvement: recentMetrics.length > 0 && dailyMetrics.length > 0 
        ? Math.round(((calculateAverage(dailyMetrics) - calculateAverage(recentMetrics)) / calculateAverage(dailyMetrics)) * 100)
        : 0
    },
    alerts: generateAlerts(recentMetrics, latestSystemMetric)
  };

  return res.status(200).json({
    success: true,
    summary,
    timestamp: new Date().toISOString()
  });
}

// 生成警報
function generateAlerts(recentMetrics: PerformanceMetric[], systemMetric?: SystemMetric) {
  const alerts = [];

  // 檢查響應時間
  const avgResponseTime = recentMetrics.length > 0 
    ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length 
    : 0;

  if (avgResponseTime > 1000) {
    alerts.push({
      type: 'performance',
      severity: 'high',
      message: `平均響應時間過高: ${Math.round(avgResponseTime)}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // 檢查內存使用
  if (systemMetric && systemMetric.memory.percentage > 80) {
    alerts.push({
      type: 'memory',
      severity: 'medium',
      message: `內存使用率過高: ${systemMetric.memory.percentage}%`,
      timestamp: new Date().toISOString()
    });
  }

  // 檢查錯誤率
  if (systemMetric && systemMetric.errorRate > 3) {
    alerts.push({
      type: 'error',
      severity: 'high',
      message: `錯誤率過高: ${systemMetric.errorRate.toFixed(2)}%`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}
