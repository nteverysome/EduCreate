/**
 * 錯誤追蹤 API
 * 收集和管理應用程序錯誤
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

// 內存存儲錯誤報告（生產環境應使用數據庫）
const errorReports: ErrorReport[] = [];
const maxReports = 1000; // 最多保存 1000 個錯誤報告

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      return handleErrorReport(req, res);
    }
    
    if (req.method === 'GET') {
      return getErrorReports(req, res);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('錯誤追蹤 API 錯誤:', error);
    return res.status(500).json({
      error: '錯誤追蹤服務錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理錯誤報告
function handleErrorReport(req: NextApiRequest, res: NextApiResponse) {
  const {
    message,
    stack,
    url,
    userId,
    severity = 'medium',
    context
  } = req.body;

  if (!message || !url) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['message', 'url']
    });
  }

  const errorReport: ErrorReport = {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    stack,
    url,
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: new Date().toISOString(),
    userId,
    severity,
    context
  };

  // 添加到錯誤報告列表
  errorReports.unshift(errorReport);
  
  // 保持最大數量限制
  if (errorReports.length > maxReports) {
    errorReports.splice(maxReports);
  }

  // 記錄到控制台（生產環境可以發送到外部服務）
  console.error('錯誤報告:', {
    id: errorReport.id,
    message: errorReport.message,
    url: errorReport.url,
    severity: errorReport.severity,
    timestamp: errorReport.timestamp
  });

  return res.status(200).json({
    success: true,
    message: '錯誤報告已記錄',
    errorId: errorReport.id,
    timestamp: errorReport.timestamp
  });
}

// 獲取錯誤報告
function getErrorReports(req: NextApiRequest, res: NextApiResponse) {
  const {
    limit = 50,
    severity,
    since
  } = req.query;

  let filteredReports = [...errorReports];

  // 按嚴重程度過濾
  if (severity) {
    filteredReports = filteredReports.filter(report => 
      report.severity === severity
    );
  }

  // 按時間過濾
  if (since) {
    const sinceDate = new Date(since as string);
    filteredReports = filteredReports.filter(report => 
      new Date(report.timestamp) >= sinceDate
    );
  }

  // 限制數量
  const limitNum = parseInt(limit as string, 10);
  filteredReports = filteredReports.slice(0, limitNum);

  // 統計信息
  const stats = {
    total: errorReports.length,
    filtered: filteredReports.length,
    severityBreakdown: {
      critical: errorReports.filter(r => r.severity === 'critical').length,
      high: errorReports.filter(r => r.severity === 'high').length,
      medium: errorReports.filter(r => r.severity === 'medium').length,
      low: errorReports.filter(r => r.severity === 'low').length,
    },
    recentErrors: errorReports.slice(0, 5).map(r => ({
      id: r.id,
      message: r.message,
      severity: r.severity,
      timestamp: r.timestamp
    }))
  };

  return res.status(200).json({
    success: true,
    data: filteredReports,
    stats,
    timestamp: new Date().toISOString()
  });
}
