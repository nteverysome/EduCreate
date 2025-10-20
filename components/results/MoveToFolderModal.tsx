'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  FolderIcon,
  HomeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';

interface ResultFolder {
  id: string;
  name: string;
  color?: string;
  type: 'ACTIVITIES' | 'RESULTS';
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  depth?: number;
  path?: string | null;
}

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  folderId?: string | null;
}

interface MoveToFolderModalProps {
  result: AssignmentResult;
  folders: ResultFolder[];
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  result,
  folders,
  isOpen,
  onClose,
  onMove
}) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(result.folderId || null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [availableFolders, setAvailableFolders] = useState<ResultFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 載入所有資料夾（包括父子關係）
  useEffect(() => {
    if (isOpen) {
      loadAvailableFolders();
    }
  }, [isOpen]);

  const loadAvailableFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/folders?type=results');
      if (response.ok) {
        const data = await response.json();
        console.log('📁 [MoveToFolderModal] 載入資料夾:', data);
        // 過濾掉當前所在的資料夾
        const filtered = data.filter((folder: ResultFolder) => folder.id !== result.folderId);
        setAvailableFolders(filtered);
      }
    } catch (error) {
      console.error('載入資料夾失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = () => {
    onMove(selectedFolderId);
    onClose();
  };

  if (!isOpen) return null;

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
    console.log('🌳 [MoveToFolderModal] 開始構建資料夾樹');
    console.log('📁 [MoveToFolderModal] 可用資料夾數量:', availableFolders.length);
    console.log('📁 [MoveToFolderModal] 可用資料夾:', availableFolders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId, depth: f.depth })));

    const folderMap = new Map<string, ResultFolder & { children: ResultFolder[] }>();

    // 初始化所有資料夾
    availableFolders.forEach(f => {
      folderMap.set(f.id, { ...f, children: [] });
    });

    // 建立父子關係
    const rootFolders: (ResultFolder & { children: ResultFolder[] })[] = [];
    availableFolders.forEach(f => {
      const folderWithChildren = folderMap.get(f.id)!;
      if (f.parentId && folderMap.has(f.parentId)) {
        console.log(`📂 [MoveToFolderModal] 添加子資料夾: ${f.name} (${f.id}) 到父資料夾 ${f.parentId}`);
        folderMap.get(f.parentId)!.children.push(folderWithChildren);
      } else {
        console.log(`🏠 [MoveToFolderModal] 添加根資料夾: ${f.name} (${f.id}), parentId: ${f.parentId}`);
        rootFolders.push(folderWithChildren);
      }
    });

    console.log('🌲 [MoveToFolderModal] 根資料夾數量:', rootFolders.length);
    console.log('🌲 [MoveToFolderModal] 根資料夾:', rootFolders.map(f => ({ name: f.name, childrenCount: f.children.length })));

    return rootFolders;
  };

  // 遞歸渲染資料夾樹
  const renderFolderTree = (folders: (ResultFolder & { children: ResultFolder[] })[], level: number = 0) => {
    return folders.map(folder => {
      const hasChildren = folder.children.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;

      return (
        <div key={folder.id}>
          <button
            onClick={() => setSelectedFolderId(folder.id)}
            className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              isSelected
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
            }`}
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
            {!hasChildren && <div className="w-6" />}
            <div className="flex-shrink-0">
              <Folder className="w-5 h-5" style={{ color: folder.color || '#8B5CF6' }} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{folder.name}</div>
              <div className="text-sm text-gray-500">
                第 {(folder.depth || 0) + 1} 層
              </div>
            </div>
            {isSelected && (
              <CheckIcon className="w-5 h-5 text-purple-600" />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" />
              移動到資料夾
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">選擇要移動到的目標位置</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* 結果信息 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-purple-100">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <span className="text-xl sm:text-2xl">🎮</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {result.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  活動：{result.activityName}
                </p>
              </div>
            </div>
          </div>

          {/* 目標位置選擇 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              選擇目標位置
            </label>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* 根目錄選項 */}
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  selectedFolderId === null
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">根目錄</p>
                    <p className="text-xs text-gray-500">移動到主目錄</p>
                  </div>
                </div>
                {selectedFolderId === null && (
                  <CheckIcon className="w-5 h-5 text-purple-600" />
                )}
              </button>

              {/* 資料夾樹狀結構 */}
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm">載入資料夾中...</p>
                </div>
              ) : availableFolders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">沒有其他可用的資料夾</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderFolderTree(folderTree)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            取消
          </button>
          <button
            onClick={handleMove}
            disabled={selectedFolderId === result.folderId}
            className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
              selectedFolderId === result.folderId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {selectedFolderId === result.folderId ? '已在此位置' : '移動'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
