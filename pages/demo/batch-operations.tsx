/**
 * 批量操作演示頁面
 * 展示批量操作功能：多選、批量處理、進度監控等
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import Layout from '../../components/Layout';
import BatchOperationPanel from '../../components/batch/BatchOperationPanel';
import { BatchOperation, BatchOperationType } from '../../lib/batch/BatchOperationManager';

interface BatchOperationsDemoProps {
  userId: string;
}

interface DemoItem {
  id: string;
  type: 'activity' | 'folder';
  name: string;
  path: string;
  size: number;
  createdAt: Date;
  tags: string[];
}

export default function BatchOperationsDemo({ userId }: BatchOperationsDemoProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 演示數據
  const [demoItems] = useState<DemoItem[]>([
    {
      id: 'activity_1',
      type: 'activity',
      name: '英語配對遊戲',
      path: '/學習活動/英語/配對遊戲',
      size: 1024000,
      createdAt: new Date('2024-01-15'),
      tags: ['英語', '配對', 'GEPT初級']
    },
    {
      id: 'activity_2',
      type: 'activity',
      name: '數學計算練習',
      path: '/學習活動/數學/計算練習',
      size: 512000,
      createdAt: new Date('2024-01-16'),
      tags: ['數學', '計算', '基礎']
    },
    {
      id: 'folder_1',
      type: 'folder',
      name: '英語學習資料夾',
      path: '/學習活動/英語',
      size: 5120000,
      createdAt: new Date('2024-01-10'),
      tags: ['英語', '資料夾']
    },
    {
      id: 'activity_3',
      type: 'activity',
      name: '科學知識問答',
      path: '/學習活動/科學/問答',
      size: 768000,
      createdAt: new Date('2024-01-17'),
      tags: ['科學', '問答', '知識']
    },
    {
      id: 'activity_4',
      type: 'activity',
      name: '歷史時間軸',
      path: '/學習活動/歷史/時間軸',
      size: 2048000,
      createdAt: new Date('2024-01-18'),
      tags: ['歷史', '時間軸', '排序']
    },
    {
      id: 'folder_2',
      type: 'folder',
      name: '數學練習資料夾',
      path: '/學習活動/數學',
      size: 3072000,
      createdAt: new Date('2024-01-12'),
      tags: ['數學', '資料夾']
    }
  ]);

  // 處理項目選擇
  const handleItemSelection = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 處理全選
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(demoItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // 更新全選狀態
  useEffect(() => {
    setSelectAll(selectedItems.length === demoItems.length);
  }, [selectedItems, demoItems.length]);

  // 處理批量操作開始
  const handleOperationStart = async (type: BatchOperationType, options: any) => {
    try {
      const items = selectedItems.map(id => {
        const item = demoItems.find(i => i.id === id)!;
        return {
          id: item.id,
          type: item.type,
          path: item.path,
          name: item.name,
          size: item.size
        };
      });

      const response = await fetch('/api/batch/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          items,
          options
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: `批量${getOperationDisplayName(type)}操作已開始`
        });
        
        // 刷新操作列表
        await fetchOperations();
      } else {
        throw new Error(data.message || '操作失敗');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : '操作失敗'
      });
    }

    // 3秒後清除通知
    setTimeout(() => setNotification(null), 3000);
  };

  // 處理操作取消
  const handleOperationCancel = async (operationId: string) => {
    try {
      const response = await fetch(`/api/batch/operations?operationId=${operationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: '操作已取消'
        });
        
        // 刷新操作列表
        await fetchOperations();
      } else {
        throw new Error(data.message || '取消失敗');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : '取消失敗'
      });
    }

    // 3秒後清除通知
    setTimeout(() => setNotification(null), 3000);
  };

  // 獲取操作列表
  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/batch/operations');
      const data = await response.json();

      if (data.success) {
        setOperations(data.data.operations || []);
      }
    } catch (error) {
      console.error('獲取操作列表失敗:', error);
    }
  };

  // 定期刷新操作狀態
  useEffect(() => {
    fetchOperations();
    const interval = setInterval(fetchOperations, 2000);
    return () => clearInterval(interval);
  }, []);

  // 格式化操作類型顯示名稱
  const getOperationDisplayName = (type: BatchOperationType): string => {
    const names = {
      [BatchOperationType.MOVE]: '移動',
      [BatchOperationType.COPY]: '複製',
      [BatchOperationType.DELETE]: '刪除',
      [BatchOperationType.SHARE]: '分享',
      [BatchOperationType.TAG]: '標籤',
      [BatchOperationType.EXPORT]: '導出',
      [BatchOperationType.IMPORT]: '導入',
      [BatchOperationType.ARCHIVE]: '歸檔',
      [BatchOperationType.RESTORE]: '恢復',
      [BatchOperationType.DUPLICATE]: '複製'
    };
    return names[type] || type;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            批量操作演示
          </h1>
          <p className="text-gray-600">
            展示批量操作功能：多選、移動、複製、刪除、分享、標籤管理等批量處理能力
          </p>
        </div>

        {/* 通知 */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`} data-testid="notification">
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

        {/* 操作工具欄 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6" data-testid="operation-toolbar">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="select-all-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">全選</span>
              </label>

              <span className="text-sm text-gray-600" data-testid="selection-count">
                已選擇 {selectedItems.length} / {demoItems.length} 個項目
              </span>
            </div>

            <button
              onClick={() => setShowBatchPanel(true)}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="open-batch-panel-button"
            >
              批量操作
            </button>
          </div>
        </div>

        {/* 項目列表 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" data-testid="items-container">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">學習活動和資料夾</h3>
          </div>

          <div className="divide-y divide-gray-200" data-testid="items-list">
            {demoItems.map((item) => (
              <div
                key={item.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                }`}
                data-testid={`item-${item.id}`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid={`item-checkbox-${item.id}`}
                  />
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {item.type === 'folder' ? (
                          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900" data-testid={`item-name-${item.id}`}>{item.name}</h4>
                            <p className="text-sm text-gray-500" data-testid={`item-path-${item.id}`}>{item.path}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-900" data-testid={`item-size-${item.id}`}>{formatFileSize(item.size)}</p>
                            <p className="text-sm text-gray-500" data-testid={`item-date-${item.id}`}>{item.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1" data-testid={`item-tags-${item.id}`}>
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              data-testid={`item-tag-${item.id}-${tag}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 批量操作面板 */}
        <BatchOperationPanel
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onOperationStart={handleOperationStart}
          onOperationCancel={handleOperationCancel}
          operations={operations}
          isVisible={showBatchPanel}
          onClose={() => setShowBatchPanel(false)}
        />

        {/* 功能特色展示 */}
        <div className="mt-12" data-testid="feature-showcase">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">批量操作功能特色</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="feature-grid">
            <div className="bg-blue-50 rounded-lg p-6" data-testid="feature-intelligent-processing">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-blue-900 mb-2">智能批量處理</h3>
              <p className="text-sm text-blue-700">
                支持移動、複製、刪除、分享、標籤等多種批量操作
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6" data-testid="feature-progress-monitoring">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-green-900 mb-2">實時進度監控</h3>
              <p className="text-sm text-green-700">
                實時顯示操作進度，支持暫停、恢復、取消操作
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6" data-testid="feature-high-performance">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-purple-900 mb-2">高效能處理</h3>
              <p className="text-sm text-purple-700">
                支持1000+項目的批量處理，智能佇列管理
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6" data-testid="feature-security-protection">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-yellow-900 mb-2">安全保護機制</h3>
              <p className="text-sm text-yellow-700">
                衝突檢測、備份創建、錯誤恢復等安全機制
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6" data-testid="feature-flexible-options">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-red-900 mb-2">靈活配置選項</h3>
              <p className="text-sm text-red-700">
                豐富的操作選項和配置，滿足不同使用需求
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6" data-testid="feature-history-tracking">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-indigo-900 mb-2">操作歷史追蹤</h3>
              <p className="text-sm text-indigo-700">
                完整的操作歷史記錄和結果分析
              </p>
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
