/**
 * 檔案夾權限系統演示頁面
 * 展示四級權限控制和權限繼承機制
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import Layout from '../../components/Layout';
import FolderPermissionManager from '../../components/permissions/FolderPermissionManager';
import { FolderPermissionLevel } from '../../lib/permissions/FolderPermissionManager';

interface FolderPermissionsDemoProps {
  userId: string;
}

interface DemoFolder {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children: DemoFolder[];
}

export default function FolderPermissionsDemo({ userId }: FolderPermissionsDemoProps) {
  const [selectedFolder, setSelectedFolder] = useState<DemoFolder | null>(null);
  const [showPermissionManager, setShowPermissionManager] = useState(false);
  const [demoFolders] = useState<DemoFolder[]>([
    {
      id: 'demo_folder_1',
      name: '學科分類',
      description: '主要學科分類檔案夾',
      children: [
        {
          id: 'demo_folder_2',
          name: '英語',
          description: '英語學習資源',
          parentId: 'demo_folder_1',
          children: [
            {
              id: 'demo_folder_3',
              name: 'GEPT初級',
              description: 'GEPT初級考試資源',
              parentId: 'demo_folder_2',
              children: []
            }
          ]
        },
        {
          id: 'demo_folder_4',
          name: '數學',
          description: '數學學習資源',
          parentId: 'demo_folder_1',
          children: []
        }
      ]
    },
    {
      id: 'demo_folder_5',
      name: '個人收藏',
      description: '個人收藏的學習資源',
      children: []
    }
  ]);

  // 權限級別說明
  const permissionLevelDescriptions = {
    [FolderPermissionLevel.VIEW]: {
      name: '查看權限',
      description: '只能查看檔案夾內容，無法修改',
      color: 'bg-blue-100 text-blue-800',
      permissions: ['查看檔案夾', '查看活動列表']
    },
    [FolderPermissionLevel.EDIT]: {
      name: '編輯權限',
      description: '可以編輯檔案夾內容和創建子檔案夾',
      color: 'bg-green-100 text-green-800',
      permissions: ['查看檔案夾', '編輯內容', '創建子檔案夾', '複製檔案']
    },
    [FolderPermissionLevel.SHARE]: {
      name: '分享權限',
      description: '可以分享檔案夾和移動檔案',
      color: 'bg-yellow-100 text-yellow-800',
      permissions: ['查看檔案夾', '編輯內容', '分享檔案夾', '移動檔案', '複製檔案']
    },
    [FolderPermissionLevel.MANAGE]: {
      name: '管理權限',
      description: '完全控制檔案夾，包括權限管理',
      color: 'bg-red-100 text-red-800',
      permissions: ['所有操作', '刪除檔案夾', '管理權限', '設置繼承規則']
    }
  };

  // 渲染檔案夾樹
  const renderFolderTree = (folders: DemoFolder[], level: number = 0) => {
    return folders.map((folder) => (
      <div key={folder.id} className="ml-4">
        <div
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            selectedFolder?.id === folder.id
              ? 'bg-blue-100 border-2 border-blue-300'
              : 'hover:bg-gray-50 border border-gray-200'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedFolder(folder)}
        >
          <span className="mr-3 text-lg">📁</span>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{folder.name}</div>
            <div className="text-sm text-gray-500">{folder.description}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFolder(folder);
              setShowPermissionManager(true);
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            管理權限
          </button>
        </div>
        {folder.children.length > 0 && (
          <div className="mt-2">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            檔案夾權限系統演示
          </h1>
          <p className="text-gray-600">
            展示四級權限控制：查看、編輯、分享、管理，以及權限繼承機制
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 檔案夾樹 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">檔案夾結構</h2>
              <div className="space-y-2">
                {renderFolderTree(demoFolders)}
              </div>
            </div>

            {/* 選中檔案夾詳情 */}
            {selectedFolder && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  檔案夾詳情: {selectedFolder.name}
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">描述:</span>
                    <span className="ml-2 text-gray-600">{selectedFolder.description}</span>
                  </div>
                  <div>
                    <span className="font-medium">ID:</span>
                    <span className="ml-2 text-gray-600 font-mono text-sm">{selectedFolder.id}</span>
                  </div>
                  {selectedFolder.parentId && (
                    <div>
                      <span className="font-medium">父檔案夾:</span>
                      <span className="ml-2 text-gray-600">{selectedFolder.parentId}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">子檔案夾數量:</span>
                    <span className="ml-2 text-gray-600">{selectedFolder.children.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 權限說明 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">權限級別說明</h3>
              <div className="space-y-4">
                {Object.entries(permissionLevelDescriptions).map(([level, info]) => (
                  <div key={level} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${info.color}`}>
                        {info.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-700">包含權限:</div>
                      {info.permissions.map((permission, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {permission}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 功能特色 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">功能特色</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  四級權限控制系統
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  權限繼承機制
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  權限過期時間設置
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  批量權限管理
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  權限覆蓋規則
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  實時權限檢查
                </li>
              </ul>
            </div>

            {/* 使用說明 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用說明</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex">
                  <span className="mr-2 font-medium">1.</span>
                  點擊檔案夾選擇要管理的檔案夾
                </li>
                <li className="flex">
                  <span className="mr-2 font-medium">2.</span>
                  點擊「管理權限」按鈕打開權限管理器
                </li>
                <li className="flex">
                  <span className="mr-2 font-medium">3.</span>
                  添加用戶並設置相應的權限級別
                </li>
                <li className="flex">
                  <span className="mr-2 font-medium">4.</span>
                  子檔案夾會自動繼承父檔案夾的權限
                </li>
                <li className="flex">
                  <span className="mr-2 font-medium">5.</span>
                  可以設置權限過期時間和覆蓋規則
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* 權限管理器對話框 */}
        {showPermissionManager && selectedFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    權限管理 - {selectedFolder.name}
                  </h2>
                  <button
                    onClick={() => setShowPermissionManager(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <FolderPermissionManager
                  folderId={selectedFolder.id}
                  currentUserId={userId}
                  onPermissionChange={(permissions) => {
                    console.log('權限已更新:', permissions);
                  }}
                />
              </div>
            </div>
          </div>
        )}
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
