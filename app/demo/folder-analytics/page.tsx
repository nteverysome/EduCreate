/**
 * 檔案夾統計分析演示頁面
 * 展示檔案夾統計分析功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import FolderAnalyticsPanel from '@/components/analytics/FolderAnalyticsPanel';
import { 
  FolderStatistics, 
  ActivityItem, 
  FolderItem, 
  AnalyticsFilter 
} from '@/lib/analytics/FolderAnalyticsManager';
import { FolderAnalyticsManagerImpl } from '@/lib/analytics/FolderAnalyticsManagerImpl';

// 模擬數據生成
const generateMockData = (): { activities: ActivityItem[]; folders: FolderItem[] } => {
  const now = new Date();
  
  // 生成模擬活動數據
  const activities: ActivityItem[] = [
    {
      id: 'activity_1',
      name: '基礎單字配對遊戲',
      type: 'activity',
      size: 2048000, // 2MB
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      geptLevel: 'elementary',
      tags: ['英語', '單字', '配對', '初級'],
      learningData: {
        completionRate: 0.85,
        averageScore: 78,
        totalAttempts: 156,
        successfulAttempts: 132,
        timeSpent: 245,
        retentionRate: 0.72,
        difficultyLevel: 3,
        lastStudiedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      usageStats: {
        viewCount: 89,
        editCount: 12,
        shareCount: 5,
        downloadCount: 23,
        favoriteCount: 15,
        commentCount: 8
      },
      collaborationData: {
        collaboratorCount: 3,
        lastCollaboratedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        isShared: true,
        shareType: 'class',
        permissions: ['view', 'edit']
      }
    },
    {
      id: 'activity_2',
      name: '動物名稱記憶卡片',
      type: 'activity',
      size: 1536000, // 1.5MB
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      geptLevel: 'elementary',
      tags: ['英語', '動物', '記憶', '卡片'],
      learningData: {
        completionRate: 0.92,
        averageScore: 85,
        totalAttempts: 203,
        successfulAttempts: 187,
        timeSpent: 312,
        retentionRate: 0.88,
        difficultyLevel: 2,
        lastStudiedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      usageStats: {
        viewCount: 134,
        editCount: 8,
        shareCount: 12,
        downloadCount: 45,
        favoriteCount: 28,
        commentCount: 15
      },
      collaborationData: {
        collaboratorCount: 5,
        lastCollaboratedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        isShared: true,
        shareType: 'public',
        permissions: ['view']
      }
    },
    {
      id: 'activity_3',
      name: '日常對話填空練習',
      type: 'activity',
      size: 3072000, // 3MB
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      geptLevel: 'intermediate',
      tags: ['英語', '對話', '填空', '中級'],
      learningData: {
        completionRate: 0.67,
        averageScore: 72,
        totalAttempts: 98,
        successfulAttempts: 66,
        timeSpent: 189,
        retentionRate: 0.65,
        difficultyLevel: 5,
        lastStudiedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
      },
      usageStats: {
        viewCount: 67,
        editCount: 15,
        shareCount: 3,
        downloadCount: 18,
        favoriteCount: 9,
        commentCount: 4
      },
      collaborationData: {
        collaboratorCount: 2,
        lastCollaboratedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        isShared: false,
        shareType: 'private',
        permissions: ['view', 'edit', 'manage']
      }
    },
    {
      id: 'activity_4',
      name: '商務英語詞彙測驗',
      type: 'activity',
      size: 2560000, // 2.5MB
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      geptLevel: 'high-intermediate',
      tags: ['英語', '商務', '詞彙', '測驗'],
      learningData: {
        completionRate: 0.58,
        averageScore: 68,
        totalAttempts: 76,
        successfulAttempts: 44,
        timeSpent: 156,
        retentionRate: 0.61,
        difficultyLevel: 7,
        lastStudiedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      usageStats: {
        viewCount: 45,
        editCount: 6,
        shareCount: 8,
        downloadCount: 12,
        favoriteCount: 7,
        commentCount: 3
      },
      collaborationData: {
        collaboratorCount: 4,
        lastCollaboratedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        isShared: true,
        shareType: 'class',
        permissions: ['view']
      }
    },
    {
      id: 'activity_5',
      name: '科技詞彙學習',
      type: 'activity',
      size: 1792000, // 1.75MB
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      geptLevel: 'high-intermediate',
      tags: ['英語', '科技', '詞彙', '學習'],
      learningData: {
        completionRate: 0.74,
        averageScore: 81,
        totalAttempts: 54,
        successfulAttempts: 40,
        timeSpent: 98,
        retentionRate: 0.79,
        difficultyLevel: 6,
        lastStudiedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      usageStats: {
        viewCount: 32,
        editCount: 4,
        shareCount: 2,
        downloadCount: 8,
        favoriteCount: 5,
        commentCount: 1
      },
      collaborationData: {
        collaboratorCount: 1,
        isShared: false,
        shareType: 'private',
        permissions: ['view', 'edit', 'manage']
      }
    }
  ];

  // 生成模擬檔案夾數據
  const folders: FolderItem[] = [
    {
      id: 'folder_1',
      name: '初級英語練習',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      color: '#3B82F6',
      icon: 'folder',
      description: '適合初學者的英語練習活動',
      tags: ['初級', '英語', '練習'],
      permissions: {
        owner: 'user_1',
        viewers: ['user_2', 'user_3'],
        editors: ['user_4'],
        managers: []
      },
      shareSettings: {
        isPublic: false,
        shareUrl: 'https://example.com/folder/abc123'
      }
    },
    {
      id: 'folder_2',
      name: '中級英語挑戰',
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      color: '#10B981',
      icon: 'folder',
      description: '中級程度的英語學習挑戰',
      tags: ['中級', '英語', '挑戰'],
      permissions: {
        owner: 'user_1',
        viewers: ['user_5'],
        editors: ['user_6', 'user_7'],
        managers: ['user_8']
      },
      shareSettings: {
        isPublic: true,
        shareUrl: 'https://example.com/folder/def456'
      }
    }
  ];

  return { activities, folders };
};

export default function FolderAnalyticsDemo() {
  const [statistics, setStatistics] = useState<FolderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('folder_1');
  const [filter, setFilter] = useState<AnalyticsFilter>({});

  const analyticsManager = new FolderAnalyticsManagerImpl();

  // 載入統計數據
  useEffect(() => {
    const loadStatistics = async () => {
      setLoading(true);
      try {
        const { activities, folders } = generateMockData();
        
        // 根據選擇的檔案夾過濾活動
        const folderActivities = selectedFolder === 'folder_1' 
          ? activities.filter(a => a.geptLevel === 'elementary')
          : activities.filter(a => a.geptLevel !== 'elementary');

        const stats = await analyticsManager.calculateStatistics(
          folderActivities,
          folders.filter(f => f.id === selectedFolder),
          filter
        );
        
        setStatistics(stats);
      } catch (error) {
        console.error('載入統計數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [selectedFolder, filter]);

  // 處理過濾器變更
  const handleFilterChange = (newFilter: AnalyticsFilter) => {
    setFilter(newFilter);
  };

  // 獲取檔案夾名稱
  const getFolderName = (folderId: string): string => {
    const folderNames: { [key: string]: string } = {
      'folder_1': '初級英語練習',
      'folder_2': '中級英語挑戰'
    };
    return folderNames[folderId] || '未知檔案夾';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="page-title">
            檔案夾統計分析演示
          </h1>
          <p className="text-lg text-gray-600 mb-6" data-testid="page-description">
            體驗檔案夾統計分析功能，包含活動數量、學習數據、使用統計、協作分析等多維度數據展示
          </p>

          {/* 檔案夾選擇 */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">選擇檔案夾</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedFolder('folder_1')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFolder === 'folder_1'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="folder-1-button"
              >
                📁 初級英語練習
              </button>
              <button
                onClick={() => setSelectedFolder('folder_2')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFolder === 'folder_2'
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="folder-2-button"
              >
                📁 中級英語挑戰
              </button>
            </div>
          </div>
        </div>

        {/* 統計分析面板 */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <FolderAnalyticsPanel
            folderId={selectedFolder}
            folderName={getFolderName(selectedFolder)}
            statistics={statistics || undefined}
            onFilterChange={handleFilterChange}
            showAdvanced={true}
          />
        )}

        {/* 技術特色 */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4" data-testid="technical-features">
            檔案夾統計分析技術特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">多維度統計</h3>
              <p className="text-sm text-gray-600">
                支援活動數量、大小、學習數據、使用統計、協作分析等多維度統計
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">學習效果分析</h3>
              <p className="text-sm text-gray-600">
                基於記憶科學原理分析完成率、記憶保持率、學習時間等指標
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">GEPT 分級統計</h3>
              <p className="text-sm text-gray-600">
                按照 GEPT 三級分級系統統計活動分布和學習效果
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">健康度評估</h3>
              <p className="text-sm text-gray-600">
                綜合評估檔案夾的活動新鮮度、學習參與度、協作健康度等指標
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">協作分析</h3>
              <p className="text-sm text-gray-600">
                分析協作者數量、分享活動、公開程度等協作相關數據
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">數據導出</h3>
              <p className="text-sm text-gray-600">
                支援 JSON、CSV、Excel 等多種格式的統計數據導出
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
