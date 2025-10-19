'use client';

import React, { useState, useEffect } from 'react';
import { X, Folder, Home, ChevronRight, ChevronDown } from 'lucide-react';

interface FolderOption {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  path: string | null;
  activityCount?: number;
}

interface MoveActivityModalProps {
  isOpen: boolean;
  activityId: string | null;
  activityTitle: string;
  folders: FolderOption[];
  currentFolderId: string | null;
  onMove: (activityId: string, targetFolderId: string | null) => Promise<void>;
  onClose: () => void;
}

export const MoveActivityModal: React.FC<MoveActivityModalProps> = ({
  isOpen,
  activityId,
  activityTitle,
  folders,
  currentFolderId,
  onMove,
  onClose
}) => {
  const [isMoving, setIsMoving] = React.useState(false);
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // 載入所有資料夾（包括父子關係）
  useEffect(() => {
    if (isOpen) {
      loadAvailableFolders();
    }
  }, [isOpen]);

  const loadAvailableFolders = async () => {
    try {
      setIsLoading(true);
      setError('');

      // 獲取所有資料夾（不包括當前資料夾及其子資料夾）
      const response = await fetch('/api/folders?type=activities');

      if (!response.ok) {
        throw new Error('載入資料夾失敗');
      }

      const allFolders: FolderOption[] = await response.json();

      console.log('📁 [MoveActivityModal] 載入的資料夾:', allFolders);

      setAvailableFolders(allFolders);

      // 默認選中當前資料夾的父資料夾
      setSelectedTargetId(currentFolderId || null);
    } catch (error: any) {
      console.error('載入資料夾失敗:', error);
      setError(error.message || '載入資料夾失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !activityId) return null;

  const handleMoveToFolder = async (targetFolderId: string | null) => {
    if (isMoving) return;

    try {
      setIsMoving(true);
      await onMove(activityId, targetFolderId);
      onClose();
    } catch (error) {
      console.error('移動失敗:', error);
      // 錯誤處理已在父組件中處理
    } finally {
      setIsMoving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 切換資料夾展開/收起狀態
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // 構建資料夾樹狀結構
  const buildFolderTree = () => {
    console.log('🌳 [MoveActivityModal] 開始構建資料夾樹');
    console.log('📁 [MoveActivityModal] 可用資料夾數量:', availableFolders.length);
    console.log('📁 [MoveActivityModal] 可用資料夾:', availableFolders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId, depth: f.depth })));

    const folderMap = new Map<string, FolderOption & { children: FolderOption[] }>();

    // 初始化所有資料夾
    availableFolders.forEach(f => {
      folderMap.set(f.id, { ...f, children: [] });
    });

    // 建立父子關係
    const rootFolders: (FolderOption & { children: FolderOption[] })[] = [];
    availableFolders.forEach(f => {
      const folderWithChildren = folderMap.get(f.id)!;
      if (f.parentId && folderMap.has(f.parentId)) {
        console.log(`📂 [MoveActivityModal] 添加子資料夾: ${f.name} (${f.id}) 到父資料夾 ${f.parentId}`);
        folderMap.get(f.parentId)!.children.push(folderWithChildren);
      } else {
        console.log(`🏠 [MoveActivityModal] 添加根資料夾: ${f.name} (${f.id}), parentId: ${f.parentId}`);
        rootFolders.push(folderWithChildren);
      }
    });

    console.log('🌲 [MoveActivityModal] 根資料夾數量:', rootFolders.length);
    console.log('🌲 [MoveActivityModal] 根資料夾:', rootFolders.map(f => ({ name: f.name, childrenCount: f.children.length })));

    return rootFolders;
  };

  // 遞歸渲染資料夾樹
  const renderFolderTree = (folders: (FolderOption & { children: FolderOption[] })[], level: number = 0) => {
    return folders.map(folder => {
      const hasChildren = folder.children.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedTargetId === folder.id;
      const isCurrent = folder.id === currentFolderId;

      return (
        <div key={folder.id}>
          <button
            onClick={() => {
              if (!isCurrent) {
                setSelectedTargetId(folder.id);
              }
            }}
            disabled={isMoving || isCurrent}
            className={`
              w-full flex items-center gap-2 p-3 rounded-lg border transition-all duration-200
              ${isCurrent
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : isSelected
                  ? 'border-blue-400 bg-blue-50'
                  : isMoving
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }
            `}
            style={{ marginLeft: `${level * 20}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            <div className="flex-shrink-0">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{folder.name}</div>
              <div className="text-sm text-gray-500">
                第 {folder.depth + 1} 層
              </div>
            </div>
            {isCurrent && (
              <div className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                目前位置
              </div>
            )}
          </button>
          {hasChildren && isExpanded && (
            <div>
              {renderFolderTree(folder.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const folderTree = buildFolderTree();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 模態對話框標題 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">移動活動</h2>
            <p className="text-sm text-gray-600 mt-1">
              選擇 "{activityTitle}" 的目標資料夾
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isMoving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 資料夾列表 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">載入資料夾中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-700 mb-4">選擇目標位置</h3>

              <div className="space-y-2">
                {/* 根目錄選項 */}
                <button
                  onClick={() => setSelectedTargetId(null)}
                  disabled={isMoving}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all duration-200
                    ${selectedTargetId === null
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                    ${isMoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex-shrink-0">
                    <Home className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">根目錄</div>
                  </div>
                </button>

                {/* 資料夾樹 */}
                {folderTree.length > 0 ? (
                  <div className="space-y-1">
                    {renderFolderTree(folderTree)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>尚未建立任何資料夾</p>
                    <p className="text-sm mt-1">請先建立資料夾來組織您的活動</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 底部操作區域 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isMoving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={() => handleMoveToFolder(selectedTargetId)}
            disabled={isMoving || selectedTargetId === currentFolderId}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMoving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>移動中...</span>
              </div>
            ) : (
              '確認移動'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
