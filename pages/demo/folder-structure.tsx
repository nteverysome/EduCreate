/**
 * 嵌套檔案夾結構演示頁面
 * 展示無限層級檔案夾的創建、移動、拖拽重組等功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import Layout from '../../components/Layout';
import EnhancedFolderOrganizer from '../../components/content/EnhancedFolderOrganizer';
import DragDropFolderTree from '../../components/content/DragDropFolderTree';
import { FolderTreeNode, FolderManager } from '../../lib/content/FolderManager';

interface FolderStructureDemoProps {
  userId: string;
}

export default function FolderStructureDemo({ userId }: FolderStructureDemoProps) {
  const [folders, setFolders] = useState<FolderTreeNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'organizer' | 'tree'>('organizer');

  // 載入檔案夾數據
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 這裡應該調用實際的API，現在使用模擬數據
      const mockFolders: FolderTreeNode[] = [
        {
          id: 'root_1',
          name: '學科分類',
          userId,
          activityCount: 0,
          subfolderCount: 2,
          totalActivityCount: 5,
          path: [],
          depth: 0,
          color: '#3B82F6',
          icon: '📚',
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [
            {
              id: 'english_1',
              name: '英語',
              parentId: 'root_1',
              userId,
              activityCount: 2,
              subfolderCount: 1,
              totalActivityCount: 3,
              path: ['root_1'],
              depth: 1,
              color: '#10B981',
              icon: '🇬🇧',
              permissions: {
                canRead: true,
                canWrite: true,
                canDelete: true,
                canShare: true,
                canManagePermissions: true
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [
                {
                  id: 'gept_1',
                  name: 'GEPT初級',
                  parentId: 'english_1',
                  userId,
                  activityCount: 1,
                  subfolderCount: 0,
                  totalActivityCount: 1,
                  path: ['root_1', 'english_1'],
                  depth: 2,
                  color: '#F59E0B',
                  icon: '🎯',
                  permissions: {
                    canRead: true,
                    canWrite: true,
                    canDelete: true,
                    canShare: true,
                    canManagePermissions: true
                  },
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  children: []
                }
              ]
            },
            {
              id: 'math_1',
              name: '數學',
              parentId: 'root_1',
              userId,
              activityCount: 2,
              subfolderCount: 0,
              totalActivityCount: 2,
              path: ['root_1'],
              depth: 1,
              color: '#EF4444',
              icon: '🔢',
              permissions: {
                canRead: true,
                canWrite: true,
                canDelete: true,
                canShare: true,
                canManagePermissions: true
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              children: []
            }
          ]
        },
        {
          id: 'personal_1',
          name: '個人收藏',
          userId,
          activityCount: 3,
          subfolderCount: 0,
          totalActivityCount: 3,
          path: [],
          depth: 0,
          color: '#8B5CF6',
          icon: '⭐',
          isShared: true,
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];
      
      setFolders(mockFolders);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入檔案夾失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [userId]);

  // 處理檔案夾移動
  const handleFolderMove = async (folderId: string, targetParentId?: string) => {
    try {
      console.log(`移動檔案夾 ${folderId} 到 ${targetParentId || '根目錄'}`);
      // 這裡應該調用實際的API
      // await FolderManager.moveFolder(folderId, targetParentId);
      
      // 重新載入檔案夾
      await loadFolders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '移動檔案夾失敗');
    }
  };

  // 處理檔案夾選擇
  const handleFolderSelect = (folder: FolderTreeNode) => {
    setSelectedFolder(folder);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            嵌套檔案夾結構演示
          </h1>
          <p className="text-gray-600">
            展示無限層級檔案夾的創建、移動、拖拽重組等功能
          </p>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 視圖模式切換 */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setViewMode('organizer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'organizer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📁 檔案夾管理器
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌳 拖拽樹狀圖
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要內容區域 */}
          <div className="lg:col-span-2">
            {viewMode === 'organizer' ? (
              <EnhancedFolderOrganizer
                userId={userId}
                onFolderSelect={handleFolderSelect}
                onActivityMove={(activityId, folderId) => {
                  console.log(`移動活動 ${activityId} 到檔案夾 ${folderId}`);
                }}
                showStats={true}
                allowBulkOperations={true}
                maxDepth={10}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">拖拽檔案夾樹</h2>
                <DragDropFolderTree
                  folders={folders}
                  onFolderMove={handleFolderMove}
                  onFolderSelect={handleFolderSelect}
                  selectedFolderId={selectedFolder?.id}
                  maxDepth={10}
                  allowDragDrop={true}
                />
              </div>
            )}
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 選中檔案夾信息 */}
            {selectedFolder && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">檔案夾詳情</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3" style={{ color: selectedFolder.color }}>
                      {selectedFolder.icon}
                    </span>
                    <div>
                      <div className="font-medium">{selectedFolder.name}</div>
                      <div className="text-sm text-gray-500">深度: {selectedFolder.depth}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">活動數量</div>
                      <div className="font-medium">{selectedFolder.activityCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">子檔案夾</div>
                      <div className="font-medium">{selectedFolder.subfolderCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">總活動數</div>
                      <div className="font-medium">{selectedFolder.totalActivityCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">是否分享</div>
                      <div className="font-medium">{selectedFolder.isShared ? '是' : '否'}</div>
                    </div>
                  </div>

                  {selectedFolder.path.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">路徑</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        根目錄 → {selectedFolder.path.join(' → ')} → {selectedFolder.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 功能說明 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">功能特色</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  無限層級嵌套結構
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  拖拽重組功能
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  批量操作支持
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  智能搜索過濾
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  權限控制系統
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  統計信息顯示
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
