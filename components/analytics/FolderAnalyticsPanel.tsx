/**
 * 檔案夾統計分析面板組件
 * 提供檔案夾統計數據的可視化展示
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FolderStatistics, AnalyticsFilter } from '@/lib/analytics/FolderAnalyticsManager';

interface FolderAnalyticsPanelProps {
  folderId: string;
  folderName: string;
  statistics?: FolderStatistics;
  onFilterChange?: (filter: AnalyticsFilter) => void;
  className?: string;
  showAdvanced?: boolean;
}

export default function FolderAnalyticsPanel({
  folderId,
  folderName,
  statistics,
  onFilterChange,
  className = '',
  showAdvanced = false
}: FolderAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'usage' | 'collaboration' | 'trends'>('overview');
  const [filter, setFilter] = useState<AnalyticsFilter>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');

  // 處理過濾器變更
  const handleFilterChange = (newFilter: Partial<AnalyticsFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilterChange?.(updatedFilter);
  };

  // 格式化數字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化百分比
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  // 獲取健康度顏色
  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 獲取健康度描述
  const getHealthDescription = (score: number): string => {
    if (score >= 80) return '優秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '需要改善';
  };

  if (!statistics) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} data-testid="folder-analytics-panel">
      {/* 標題和操作 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800" data-testid="analytics-title">
              {folderName} - 統計分析
            </h2>
            <p className="text-sm text-gray-600 mt-1" data-testid="analytics-description">
              檔案夾詳細統計數據和學習分析
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="export-button"
            >
              導出數據
            </button>
            {showAdvanced && (
              <button
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="advanced-settings-button"
              >
                高級設定
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'overview', label: '總覽', testId: 'overview-tab' },
          { key: 'learning', label: '學習數據', testId: 'learning-tab' },
          { key: 'usage', label: '使用統計', testId: 'usage-tab' },
          { key: 'collaboration', label: '協作分析', testId: 'collaboration-tab' },
          { key: 'trends', label: '趨勢分析', testId: 'trends-tab' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            data-testid={tab.testId}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <div className="p-6">
        {/* 總覽標籤 */}
        {activeTab === 'overview' && (
          <div className="space-y-6" data-testid="overview-content">
            {/* 基本統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4" data-testid="total-activities-card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">總活動數</p>
                    <p className="text-2xl font-bold text-blue-800">{formatNumber(statistics.totalActivities)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4" data-testid="total-size-card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">總大小</p>
                    <p className="text-2xl font-bold text-green-800">{formatFileSize(statistics.totalSize)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4" data-testid="average-score-card">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">平均分數</p>
                    <p className="text-2xl font-bold text-purple-800">{statistics.learningStatistics.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4" data-testid="health-score-card">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">健康度</p>
                    <p className="text-2xl font-bold text-orange-800">{statistics.healthMetrics.overallHealth.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* GEPT 等級分布 */}
            <div className="bg-gray-50 rounded-lg p-4" data-testid="gept-distribution">
              <h3 className="text-lg font-medium text-gray-800 mb-4">GEPT 等級分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.geptLevelDistribution.elementary}</div>
                  <div className="text-sm text-gray-600">初級</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.geptLevelDistribution.intermediate}</div>
                  <div className="text-sm text-gray-600">中級</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statistics.geptLevelDistribution['high-intermediate']}</div>
                  <div className="text-sm text-gray-600">中高級</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{statistics.geptLevelDistribution.unspecified}</div>
                  <div className="text-sm text-gray-600">未指定</div>
                </div>
              </div>
            </div>

            {/* 健康度指標 */}
            <div className="bg-gray-50 rounded-lg p-4" data-testid="health-metrics">
              <h3 className="text-lg font-medium text-gray-800 mb-4">健康度指標</h3>
              <div className="space-y-3">
                {[
                  { label: '活動新鮮度', value: statistics.healthMetrics.activityFreshness, key: 'freshness' },
                  { label: '學習參與度', value: statistics.healthMetrics.learningEngagement, key: 'engagement' },
                  { label: '協作健康度', value: statistics.healthMetrics.collaborationHealth, key: 'collaboration' },
                  { label: '內容品質', value: statistics.healthMetrics.contentQuality, key: 'quality' }
                ].map(metric => (
                  <div key={metric.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.value >= 80 ? 'bg-green-500' :
                            metric.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getHealthColor(metric.value)}`}>
                        {metric.value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 學習數據標籤 */}
        {activeTab === 'learning' && (
          <div className="space-y-6" data-testid="learning-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-600 mb-2">完成率</h4>
                <p className="text-2xl font-bold text-blue-800">
                  {formatPercentage(statistics.learningStatistics.averageCompletionRate)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-600 mb-2">記憶保持率</h4>
                <p className="text-2xl font-bold text-green-800">
                  {formatPercentage(statistics.learningStatistics.averageRetentionRate)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-600 mb-2">總學習時間</h4>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.round(statistics.learningStatistics.totalTimeSpent)} 分鐘
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 使用統計標籤 */}
        {activeTab === 'usage' && (
          <div className="space-y-6" data-testid="usage-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-600 mb-2">總瀏覽量</h4>
                <p className="text-2xl font-bold text-indigo-800">
                  {formatNumber(statistics.usageStatistics.totalViews)}
                </p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-pink-600 mb-2">總編輯次數</h4>
                <p className="text-2xl font-bold text-pink-800">
                  {formatNumber(statistics.usageStatistics.totalEdits)}
                </p>
              </div>
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-teal-600 mb-2">分享次數</h4>
                <p className="text-2xl font-bold text-teal-800">
                  {formatNumber(statistics.usageStatistics.totalShares)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 協作分析標籤 */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6" data-testid="collaboration-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-cyan-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-cyan-600 mb-2">協作者數量</h4>
                <p className="text-2xl font-bold text-cyan-800">
                  {statistics.collaborationStatistics.totalCollaborators}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-emerald-600 mb-2">共享活動</h4>
                <p className="text-2xl font-bold text-emerald-800">
                  {statistics.collaborationStatistics.sharedActivities}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-amber-600 mb-2">公開活動</h4>
                <p className="text-2xl font-bold text-amber-800">
                  {statistics.collaborationStatistics.publicActivities}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 趨勢分析標籤 */}
        {activeTab === 'trends' && (
          <div className="space-y-6" data-testid="trends-content">
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">趨勢分析圖表</h3>
              <p className="text-gray-600">趨勢分析功能正在開發中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 導出模態框 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">導出統計數據</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">導出格式</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="export-format-select"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  // 實際導出邏輯
                  console.log(`導出為 ${exportFormat} 格式`);
                  setShowExportModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                data-testid="export-confirm"
              >
                導出
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                data-testid="export-cancel"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
