/**
 * UniversalContentEditorDashboard - 統一內容編輯器儀表板組件
 * 提供詳細的編輯統計、使用分析和功能概覽
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface ContentEditorStats {
  totalDocuments: number;
  totalWords: number;
  totalCharacters: number;
  activeCollaborations: number;
  versionsCreated: number;
  mediaFilesUploaded: number;
  voiceRecordings: number;
  aiGeneratedContent: number;
  geptValidations: number;
  accessibilityOptimizations: number;
  lastActivity: string;
  averageEditingTime: number;
  popularFeatures: { name: string; usage: number }[];
  recentDocuments: { id: string; title: string; lastModified: string; type: string }[];
}

export interface UniversalContentEditorDashboardProps {
  className?: string;
  'data-testid'?: string;
}

const UniversalContentEditorDashboard = ({
  className = '',
  'data-testid': testId = 'universal-content-editor-dashboard'
}: UniversalContentEditorDashboardProps) => {
  const [stats, setStats] = useState<ContentEditorStats>({
    totalDocuments: 156,
    totalWords: 45230,
    totalCharacters: 287450,
    activeCollaborations: 8,
    versionsCreated: 342,
    mediaFilesUploaded: 89,
    voiceRecordings: 23,
    aiGeneratedContent: 67,
    geptValidations: 134,
    accessibilityOptimizations: 45,
    lastActivity: '2 分鐘前',
    averageEditingTime: 18.5,
    popularFeatures: [
      { name: '富文本編輯', usage: 95 },
      { name: 'GEPT分級', usage: 87 },
      { name: '實時協作', usage: 76 },
      { name: 'AI內容生成', usage: 68 },
      { name: '多媒體支持', usage: 54 }
    ],
    recentDocuments: [
      { id: '1', title: '英語學習教材 - 初級', lastModified: '5 分鐘前', type: 'GEPT模板' },
      { id: '2', title: '數學概念解釋', lastModified: '15 分鐘前', type: '富文本' },
      { id: '3', title: '科學實驗指南', lastModified: '1 小時前', type: '多媒體' },
      { id: '4', title: '歷史時間線', lastModified: '2 小時前', type: '協作文檔' },
      { id: '5', title: '語音練習材料', lastModified: '3 小時前', type: '語音錄製' }
    ]
  });

  const [isLoading, setIsLoading] = useState(true);

  // 模擬數據載入
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 格式化數字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 獲取功能圖標
  const getFeatureIcon = (featureName: string): string => {
    const icons: { [key: string]: string } = {
      '富文本編輯': '✏️',
      'GEPT分級': '📚',
      '實時協作': '👥',
      'AI內容生成': '🤖',
      '多媒體支持': '🎬',
      '語音錄製': '🎤',
      '版本管理': '📋',
      '無障礙設計': '♿',
      '內容驗證': '✅'
    };
    return icons[featureName] || '📝';
  };

  // 獲取文檔類型圖標
  const getDocumentTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      'GEPT模板': '📚',
      '富文本': '✏️',
      '多媒體': '🎬',
      '協作文檔': '👥',
      '語音錄製': '🎤',
      'AI生成': '🤖'
    };
    return icons[type] || '📝';
  };

  if (isLoading) {
    return (
      <div className={`universal-content-editor-dashboard ${className}`} data-testid={testId}>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`universal-content-editor-dashboard ${className}`} data-testid={testId}>
      {/* 主要統計卡片 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">統一內容編輯器</h2>
          <Link
            href="/content/universal-editor"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            data-testid="open-editor-btn"
          >
            開啟編輯器
          </Link>
        </div>

        {/* 核心統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="stat-documents">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalDocuments)}</div>
            <div className="text-sm text-blue-800">總文檔數</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="stat-words">
            <div className="text-2xl font-bold text-green-600">{formatNumber(stats.totalWords)}</div>
            <div className="text-sm text-green-800">總字數</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="stat-collaborations">
            <div className="text-2xl font-bold text-purple-600">{stats.activeCollaborations}</div>
            <div className="text-sm text-purple-800">活躍協作</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="stat-versions">
            <div className="text-2xl font-bold text-orange-600">{stats.versionsCreated}</div>
            <div className="text-sm text-orange-800">版本數</div>
          </div>
        </div>

        {/* 功能使用統計 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 border border-gray-200 rounded-lg" data-testid="stat-media">
            <div className="text-lg font-semibold text-gray-900">{stats.mediaFilesUploaded}</div>
            <div className="text-xs text-gray-600">🎬 媒體檔案</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg" data-testid="stat-voice">
            <div className="text-lg font-semibold text-gray-900">{stats.voiceRecordings}</div>
            <div className="text-xs text-gray-600">🎤 語音錄製</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg" data-testid="stat-ai">
            <div className="text-lg font-semibold text-gray-900">{stats.aiGeneratedContent}</div>
            <div className="text-xs text-gray-600">🤖 AI生成</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg" data-testid="stat-gept">
            <div className="text-lg font-semibold text-gray-900">{stats.geptValidations}</div>
            <div className="text-xs text-gray-600">📚 GEPT驗證</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg" data-testid="stat-accessibility">
            <div className="text-lg font-semibold text-gray-900">{stats.accessibilityOptimizations}</div>
            <div className="text-xs text-gray-600">♿ 無障礙</div>
          </div>
        </div>

        {/* 活動狀態 */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>最後活動: {stats.lastActivity}</span>
          <span>平均編輯時間: {stats.averageEditingTime} 分鐘</span>
        </div>
      </div>

      {/* 功能使用排行和最近文檔 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 熱門功能 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門功能</h3>
          <div className="space-y-3">
            {stats.popularFeatures.map((feature, index) => (
              <div key={feature.name} className="flex items-center justify-between" data-testid={`popular-feature-${index}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFeatureIcon(feature.name)}</span>
                  <span className="font-medium text-gray-900">{feature.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${feature.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{feature.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近文檔 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最近文檔</h3>
            <Link
              href="/content/universal-editor/documents"
              className="text-sm text-blue-600 hover:text-blue-800"
              data-testid="view-all-documents"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                data-testid={`recent-document-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getDocumentTypeIcon(doc.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{doc.title}</div>
                    <div className="text-sm text-gray-600">{doc.type}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{doc.lastModified}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/content/rich-text-editor"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            data-testid="quick-rich-text"
          >
            <span className="text-2xl mr-3">✏️</span>
            <span className="text-sm font-medium">富文本編輯</span>
          </Link>
          <Link
            href="/content/gept-templates"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            data-testid="quick-gept"
          >
            <span className="text-2xl mr-3">📚</span>
            <span className="text-sm font-medium">GEPT模板</span>
          </Link>
          <Link
            href="/content/realtime-collaboration"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            data-testid="quick-collaboration"
          >
            <span className="text-2xl mr-3">👥</span>
            <span className="text-sm font-medium">實時協作</span>
          </Link>
          <Link
            href="/content/ai-content-generation"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            data-testid="quick-ai"
          >
            <span className="text-2xl mr-3">🤖</span>
            <span className="text-sm font-medium">AI生成</span>
          </Link>
        </div>
      </div>

      {/* 系統狀態 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">系統狀態</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-green-800">編輯器狀態</span>
            <span className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              正常運行
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-green-800">協作服務</span>
            <span className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              正常運行
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-green-800">AI服務</span>
            <span className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              正常運行
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalContentEditorDashboard;
