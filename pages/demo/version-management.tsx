/**
 * 版本管理演示頁面
 * 展示活動歷史、版本對比、版本恢復、協作者追蹤等功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import Layout from '../../components/Layout';
import ActivityVersionHistory from '../../components/version/ActivityVersionHistory';

interface VersionManagementDemoProps {
  userId: string;
}

export default function VersionManagementDemo({ userId }: VersionManagementDemoProps) {
  const [selectedActivity, setSelectedActivity] = useState<string>('demo_activity_123');
  const [currentVersion, setCurrentVersion] = useState<string>('1.2.3');
  const [activities, setActivities] = useState([
    {
      id: 'demo_activity_123',
      title: '英語配對遊戲',
      description: '學習英語單詞的配對遊戲',
      currentVersion: '1.2.3'
    },
    {
      id: 'demo_activity_456',
      title: '數學計算練習',
      description: '基礎數學運算練習',
      currentVersion: '2.1.0'
    },
    {
      id: 'demo_activity_789',
      title: '科學知識問答',
      description: '科學常識問答遊戲',
      currentVersion: '1.0.5'
    }
  ]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 處理版本恢復
  const handleVersionRestore = (version: string) => {
    setNotification({
      type: 'success',
      message: `成功恢復到版本 ${version}`
    });
    
    // 更新當前版本
    setCurrentVersion(version);
    
    // 3秒後清除通知
    setTimeout(() => setNotification(null), 3000);
  };

  // 處理版本比較
  const handleVersionCompare = (sourceVersion: string, targetVersion: string) => {
    setNotification({
      type: 'info',
      message: `正在比較版本 ${sourceVersion} 和 ${targetVersion}`
    });
    
    // 3秒後清除通知
    setTimeout(() => setNotification(null), 3000);
  };

  // 創建新版本（演示用）
  const createDemoVersion = async () => {
    try {
      const response = await fetch(`/api/activities/${selectedActivity}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            title: '演示內容',
            description: '這是一個演示版本',
            gameType: 'matching',
            difficulty: 0.6,
            words: [
              { english: 'hello', chinese: '你好' },
              { english: 'world', chinese: '世界' },
              { english: 'game', chinese: '遊戲' }
            ],
            timestamp: new Date().toISOString()
          },
          type: 'manual',
          title: `演示版本 - ${new Date().toLocaleString()}`,
          description: '手動創建的演示版本',
          tags: ['演示', '測試']
        }),
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: '成功創建新版本'
        });
      } else {
        throw new Error('創建版本失敗');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: '創建版本失敗'
      });
    }

    // 3秒後清除通知
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            版本管理演示
          </h1>
          <p className="text-gray-600">
            展示完整的變更追蹤、版本對比、歷史回滾、變更日誌、協作者追蹤等版本控制功能
          </p>
        </div>

        {/* 通知 */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 側邊欄 - 活動選擇和操作 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 活動選擇 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇活動</h3>
              
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedActivity === activity.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedActivity(activity.id);
                      setCurrentVersion(activity.currentVersion);
                    }}
                  >
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      當前版本: {activity.currentVersion}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              
              <div className="space-y-3">
                <button
                  onClick={createDemoVersion}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  創建新版本
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  刷新歷史
                </button>
              </div>
            </div>

            {/* 功能說明 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">功能特色</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <div className="font-medium text-gray-900 mb-1">📚 版本歷史</div>
                  <div>完整的版本記錄和變更追蹤</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">🔍 版本比較</div>
                  <div>詳細的版本差異分析和對比</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">⏪ 版本恢復</div>
                  <div>安全的版本回滾和恢復機制</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">👥 協作追蹤</div>
                  <div>協作者活動記錄和變更歷史</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">🏷️ 版本標籤</div>
                  <div>版本分類和標籤管理</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 mb-1">🔒 權限控制</div>
                  <div>基於角色的版本管理權限</div>
                </div>
              </div>
            </div>
          </div>

          {/* 主要內容 - 版本歷史組件 */}
          <div className="lg:col-span-3">
            <ActivityVersionHistory
              activityId={selectedActivity}
              currentVersion={currentVersion}
              onVersionRestore={handleVersionRestore}
              onVersionCompare={handleVersionCompare}
              readOnly={false}
            />
          </div>
        </div>

        {/* 技術架構展示 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">技術架構特色</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-blue-900 mb-2">自動版本控制</h3>
              <p className="text-sm text-blue-700">
                智能檢測內容變更，自動創建版本快照
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-green-900 mb-2">差異分析</h3>
              <p className="text-sm text-green-700">
                精確的內容差異檢測和可視化對比
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-purple-900 mb-2">快速恢復</h3>
              <p className="text-sm text-purple-700">
                一鍵版本恢復，支持選擇性和合併恢復
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-yellow-900 mb-2">協作追蹤</h3>
              <p className="text-sm text-yellow-700">
                實時協作者活動監控和變更歸屬
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-red-900 mb-2">安全備份</h3>
              <p className="text-sm text-red-700">
                自動備份機制，確保數據安全和完整性
              </p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-indigo-900 mb-2">版本分析</h3>
              <p className="text-sm text-indigo-700">
                版本統計分析和使用模式洞察
              </p>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">使用說明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本操作</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-semibold">1.</span>
                  <span>選擇要查看的活動</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-semibold">2.</span>
                  <span>瀏覽版本歷史記錄</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-semibold">3.</span>
                  <span>點擊版本進行選擇</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-semibold">4.</span>
                  <span>選擇兩個版本進行比較</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-semibold">5.</span>
                  <span>使用恢復功能回滾版本</span>
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">高級功能</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">🔍</span>
                  <span>版本差異可視化對比</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⏪</span>
                  <span>選擇性內容恢復</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔀</span>
                  <span>版本合併和衝突解決</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">👥</span>
                  <span>協作者活動追蹤</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🏷️</span>
                  <span>版本標籤和分類</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>版本統計和分析</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: session.user.id,
    },
  };
};
