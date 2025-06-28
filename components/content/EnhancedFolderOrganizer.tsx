/**
 * 增強文件夾組織器組件
 * 支持嵌套文件夾、拖拽操作、批量管理等功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderManager, 
  FolderTreeNode, 
  FolderItem, 
  BulkOperation,
  FolderStats 
} from '../../lib/content/FolderManager';

interface EnhancedFolderOrganizerProps {
  userId: string;
  onFolderSelect?: (folder: FolderItem | null) => void;
  onActivityMove?: (activityId: string, folderId: string) => void;
  showStats?: boolean;
  allowBulkOperations?: boolean;
  maxDepth?: number;
}

export default function EnhancedFolderOrganizer({
  userId,
  onFolderSelect,
  onActivityMove,
  showStats = true,
  allowBulkOperations = true,
  maxDepth = 10
}: EnhancedFolderOrganizerProps) {
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [folderStats, setFolderStats] = useState<FolderStats | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    folderId: string;
  } | null>(null);

  // 加載文件夾樹
  const loadFolderTree = useCallback(async () => {
    try {
      const tree = await FolderManager.buildFolderTree(userId);
      setFolderTree(tree);
      
      if (showStats) {
        const stats = await FolderManager.getFolderStats(userId);
        setFolderStats(stats);
      }
    } catch (error) {
      console.error('加載文件夾樹失敗:', error);
    }
  }, [userId, showStats]);

  useEffect(() => {
    loadFolderTree();
  }, [loadFolderTree]);

  // 切換文件夾展開狀態
  const toggleFolderExpansion = (folderId: string) => {
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

  // 選擇文件夾
  const selectFolder = (folder: FolderItem, isMultiSelect = false) => {
    if (isMultiSelect) {
      setSelectedFolders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folder.id)) {
          newSet.delete(folder.id);
        } else {
          newSet.add(folder.id);
        }
        return newSet;
      });
    } else {
      setSelectedFolders(new Set([folder.id]));
      onFolderSelect?.(folder);
    }
  };

  // 創建新文件夾
  const createFolder = async (name: string, parentId?: string) => {
    try {
      await FolderManager.createFolder(name, parentId, { userId });
      await loadFolderTree();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('創建文件夾失敗:', error);
      alert(error instanceof Error ? error.message : '創建文件夾失敗');
    }
  };

  // 拖拽開始
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedItem(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽懸停
  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(folderId);
  };

  // 拖拽離開
  const handleDragLeave = () => {
    setDropTarget(null);
  };

  // 拖拽放下
  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetFolderId) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }

    try {
      await FolderManager.moveFolder(draggedItem, targetFolderId);
      await loadFolderTree();
    } catch (error) {
      console.error('移動文件夾失敗:', error);
      alert(error instanceof Error ? error.message : '移動文件夾失敗');
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  // 批量操作
  const performBulkOperation = async (operation: BulkOperation) => {
    try {
      await FolderManager.performBulkOperation(operation);
      await loadFolderTree();
      setSelectedFolders(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('批量操作失敗:', error);
      alert(error instanceof Error ? error.message : '批量操作失敗');
    }
  };

  // 右鍵菜單
  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId
    });
  };

  // 渲染文件夾節點
  const renderFolderNode = (node: FolderTreeNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFolders.has(node.id);
    const isDraggedOver = dropTarget === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          } ${isDraggedOver ? 'bg-green-100 border-2 border-green-300' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
          onClick={(e) => selectFolder(node, e.ctrlKey || e.metaKey)}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
        >
          {/* 展開/收起按鈕 */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpansion(node.id);
              }}
              className="mr-2 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}

          {/* 文件夾圖標 */}
          <span className="mr-3 text-lg" style={{ color: node.color }}>
            {node.icon || '📁'}
          </span>

          {/* 文件夾名稱 */}
          <span className="flex-1 text-sm font-medium">{node.name}</span>

          {/* 統計信息 */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {node.subfolderCount > 0 && (
              <span className="bg-gray-200 px-2 py-1 rounded">
                {node.subfolderCount} 文件夾
              </span>
            )}
            {node.activityCount > 0 && (
              <span className="bg-blue-200 px-2 py-1 rounded">
                {node.activityCount} 活動
              </span>
            )}
            {node.isShared && (
              <span className="text-green-600">🔗</span>
            )}
          </div>

          {/* 多選框 */}
          {allowBulkOperations && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                selectFolder(node, true);
              }}
              className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
        </div>

        {/* 子文件夾 */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 頭部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">文件夾管理</h2>
          <p className="text-gray-600 text-sm mt-1">組織和管理您的活動文件夾</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {allowBulkOperations && selectedFolders.size > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              批量操作 ({selectedFolders.size})
            </button>
          )}
          
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            + 新建文件夾
          </button>
        </div>
      </div>

      {/* 統計信息 */}
      {showStats && folderStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{folderStats.totalFolders}</div>
            <div className="text-sm text-blue-700">總文件夾</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{folderStats.totalActivities}</div>
            <div className="text-sm text-green-700">總活動</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{folderStats.maxDepth}</div>
            <div className="text-sm text-purple-700">最大深度</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{folderStats.sharedFolders.length}</div>
            <div className="text-sm text-orange-700">共享文件夾</div>
          </div>
        </div>
      )}

      {/* 搜索框 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索文件夾..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 文件夾樹 */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {folderTree.length > 0 ? (
          folderTree.map(node => renderFolderNode(node))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📁</div>
            <p className="text-gray-600">還沒有文件夾</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              創建第一個文件夾
            </button>
          </div>
        )}
      </div>

      {/* 創建文件夾對話框 */}
      {showCreateDialog && (
        <CreateFolderDialog
          onConfirm={createFolder}
          onCancel={() => setShowCreateDialog(false)}
          maxDepth={maxDepth}
        />
      )}

      {/* 批量操作面板 */}
      {showBulkActions && (
        <BulkActionsPanel
          selectedCount={selectedFolders.size}
          onOperation={performBulkOperation}
          onClose={() => setShowBulkActions(false)}
        />
      )}

      {/* 右鍵菜單 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folderId={contextMenu.folderId}
          onClose={() => setContextMenu(null)}
          onAction={(action) => {
            // 處理右鍵菜單操作
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}

// 創建文件夾對話框組件
function CreateFolderDialog({
  onConfirm,
  onCancel,
  maxDepth
}: {
  onConfirm: (name: string, parentId?: string) => void;
  onCancel: () => void;
  maxDepth: number;
}) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">創建新文件夾</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文件夾名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入文件夾名稱"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(name, parentId || undefined)}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            創建
          </button>
        </div>
      </div>
    </div>
  );
}

// 批量操作面板組件
function BulkActionsPanel({
  selectedCount,
  onOperation,
  onClose
}: {
  selectedCount: number;
  onOperation: (operation: BulkOperation) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">
          批量操作 ({selectedCount} 個文件夾)
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => onOperation({ type: 'move', itemIds: [] })}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📁 移動到其他文件夾
          </button>
          
          <button
            onClick={() => onOperation({ type: 'copy', itemIds: [] })}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📋 複製文件夾
          </button>
          
          <button
            onClick={() => onOperation({ type: 'share', itemIds: [] })}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔗 批量分享
          </button>
          
          <button
            onClick={() => onOperation({ type: 'delete', itemIds: [] })}
            className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️ 刪除文件夾
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// 右鍵菜單組件
function ContextMenu({
  x,
  y,
  folderId,
  onClose,
  onAction
}: {
  x: number;
  y: number;
  folderId: string;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => onAction('rename')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        ✏️ 重命名
      </button>
      <button
        onClick={() => onAction('share')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        🔗 分享
      </button>
      <button
        onClick={() => onAction('move')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        📁 移動
      </button>
      <hr className="my-1" />
      <button
        onClick={() => onAction('delete')}
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
      >
        🗑️ 刪除
      </button>
    </div>
  );
}
