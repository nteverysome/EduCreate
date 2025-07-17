/**
 * 自動保存性能監控組件
 * 基於 Wordwall 深度分析結果，實現實時監控和性能優化
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
interface AutoSaveMetrics {
  saveCount: number;
  avgResponseTime: number;
  compressionRatio: number;
  successRate: number;
  lastSaveTime: Date;
  nextSaveIn: number;
  sessionId: string;
  guid: string;
  changeCount: number;
}
interface AutoSaveMonitorProps {
  activityId: string;
  isVisible?: boolean;
  onMetricsUpdate?: (metrics: AutoSaveMetrics) => void;
}
export const AutoSaveMonitor: React.FC<AutoSaveMonitorProps> = ({
  activityId,
  isVisible = true,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<AutoSaveMetrics>({
    saveCount: 0,
    avgResponseTime: 0,
    compressionRatio: 1,
    successRate: 100,
    lastSaveTime: new Date(),
    nextSaveIn: 2000,
    sessionId: '',
    guid: '',
    changeCount: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  useEffect(() => {
    // 監聽網路狀態
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useEffect(() => {
    // 獲取自動保存指標
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/universal-content/${activityId}/autosave-metrics`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
          onMetricsUpdate?.(data);
        }
      } catch (error) {
        console.error('獲取自動保存指標失敗:', error);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // 每 5 秒更新一次
    return () => clearInterval(interval);
  }, [activityId, onMetricsUpdate]);
  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return '保存中...';
      case 'success': return '已保存';
      case 'error': return '保存失敗';
      default: return '待機中';
    }
  };
  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };
  const formatCompressionRatio = (ratio: number) => {
    if (ratio <= 1) return '無壓縮';
    return `${ratio.toFixed(1)}x`;
  };
  if (!isVisible) return null;
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>自動保存監控</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-gray-600">{getStatusText()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 網路狀態 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">網路狀態</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? '在線' : '離線'}
          </Badge>
        </div>
        {/* 保存統計 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{metrics.saveCount}</div>
            <div className="text-xs text-gray-500">保存次數</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{metrics.changeCount}</div>
            <div className="text-xs text-gray-500">變更次數</div>
          </div>
        </div>
        {/* 性能指標 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">響應時間</span>
            <span className="font-medium">{formatResponseTime(metrics.avgResponseTime)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">壓縮比例</span>
            <span className="font-medium">{formatCompressionRatio(metrics.compressionRatio)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">成功率</span>
            <span className="font-medium">{metrics.successRate.toFixed(1)}%</span>
          </div>
        </div>
        {/* 成功率進度條 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>保存成功率</span>
            <span>{metrics.successRate.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.successRate} className="h-2" />
        </div>
        {/* 下次保存倒計時 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>下次自動保存</span>
            <span>{Math.ceil(metrics.nextSaveIn / 1000)}秒</span>
          </div>
          <Progress 
            value={(2000 - metrics.nextSaveIn) / 2000 * 100} 
            className="h-2" 
          />
        </div>
        {/* 最後保存時間 */}
        <div className="text-xs text-gray-500 text-center">
          最後保存: {metrics.lastSaveTime.toLocaleTimeString()}
        </div>
        {/* 技術詳情 (開發模式) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500">技術詳情</summary>
            <div className="mt-2 space-y-1 text-gray-400">
              <div>GUID: {metrics.guid.substring(0, 8)}...</div>
              <div>Session: {metrics.sessionId.substring(0, 12)}...</div>
              <div>Activity: {activityId}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
/**
 * 簡化版自動保存指示器
 */
export const AutoSaveIndicator: React.FC<{
  status: 'idle' | 'saving' | 'success' | 'error';
  lastSaved?: Date;
}> = ({ status, lastSaved }) => {
  const getIcon = () => {
    switch (status) {
      case 'saving': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '💾';
    }
  };
  const getText = () => {
    switch (status) {
      case 'saving': return '保存中...';
      case 'success': return lastSaved ? `已保存 ${lastSaved.toLocaleTimeString()}` : '已保存';
      case 'error': return '保存失敗';
      default: return '自動保存';
    }
  };
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <span>{getIcon()}</span>
      <span>{getText()}</span>
    </div>
  );
};
/**
 * 自動保存性能分析 Hook
 */
export const useAutoSaveAnalytics = (activityId: string) => {
  const [analytics, setAnalytics] = useState({
    totalSaves: 0,
    avgResponseTime: 0,
    compressionEfficiency: 0,
    errorRate: 0,
    peakSaveTime: '',
    recommendations: [] as string[]
  });
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/universal-content/${activityId}/autosave-analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('獲取自動保存分析失敗:', error);
      }
    };
    fetchAnalytics();
  }, [activityId]);
  return analytics;
};
export default AutoSaveMonitor;
