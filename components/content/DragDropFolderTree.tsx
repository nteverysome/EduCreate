/**
 * 拖拽重組檔案夾樹組件
 * 支持無限層級嵌套和拖拽重組功能
 */

import React, { useState, useRef, useCallback } from 'react';
import { FolderTreeNode, FolderManager } from '../../lib/content/FolderManager';

interface DragDropFolderTreeProps {
  folders: FolderTreeNode[];
  onFolderMove?: (folderId: string, targetParentId?: string) => void;
  onFolderSelect?: (folder: FolderTreeNode) => void;
  selectedFolderId?: string;
  maxDepth?: number;
  allowDragDrop?: boolean;
}

interface DragState {
  draggedFolderId: string | null;
  dragOverFolderId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

export const DragDropFolderTree = ({
  folders,
  onFolderMove,
  onFolderSelect,
  selectedFolderId,
  maxDepth = 10,
  allowDragDrop = true
}: DragDropFolderTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<DragState>({
    draggedFolderId: null,
    dragOverFolderId: null,
    dropPosition: null
  });
  
  const dragCounter = useRef(0);
  const dropIndicatorRef = useRef<HTMLDivElement>(null);

  // 切換檔案夾展開狀態
  const toggleExpanded = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // 拖拽開始
  const handleDragStart = useCallback((e: React.DragEvent, folder: FolderTreeNode) => {
    if (!allowDragDrop) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folder.id);
    
    setDragState(prev => ({
      ...prev,
      draggedFolderId: folder.id
    }));
    
    // 設置拖拽圖像
    const dragImage = document.createElement('div');
    dragImage.textContent = `📁 ${folder.name}`;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.background = '#3B82F6';
    dragImage.style.color = 'white';
    dragImage.style.padding = '8px 12px';
    dragImage.style.borderRadius = '6px';
    dragImage.style.fontSize = '14px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [allowDragDrop]);

  // 拖拽結束
  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedFolderId: null,
      dragOverFolderId: null,
      dropPosition: null
    });
    dragCounter.current = 0;
  }, []);

  // 拖拽進入
  const handleDragEnter = useCallback((e: React.DragEvent, folder: FolderTreeNode) => {
    e.preventDefault();
    dragCounter.current++;
    
    if (dragState.draggedFolderId === folder.id) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverFolderId: folder.id
    }));
  }, [dragState.draggedFolderId]);

  // 拖拽懸停
  const handleDragOver = useCallback((e: React.DragEvent, folder: FolderTreeNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedFolderId === folder.id) return;
    
    // 計算放置位置
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }
    
    // 檢查深度限制
    if (position === 'inside' && folder.depth >= maxDepth - 1) {
      position = 'after';
    }
    
    setDragState(prev => ({
      ...prev,
      dragOverFolderId: folder.id,
      dropPosition: position
    }));
  }, [dragState.draggedFolderId, maxDepth]);

  // 拖拽離開
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setDragState(prev => ({
        ...prev,
        dragOverFolderId: null,
        dropPosition: null
      }));
    }
  }, []);

  // 放置
  const handleDrop = useCallback((e: React.DragEvent, targetFolder: FolderTreeNode) => {
    e.preventDefault();
    
    const draggedFolderId = e.dataTransfer.getData('text/plain');
    if (!draggedFolderId || draggedFolderId === targetFolder.id) return;
    
    let targetParentId: string | undefined;
    
    switch (dragState.dropPosition) {
      case 'inside':
        targetParentId = targetFolder.id;
        break;
      case 'before':
      case 'after':
        targetParentId = targetFolder.parentId;
        break;
    }
    
    onFolderMove?.(draggedFolderId, targetParentId);
    
    setDragState({
      draggedFolderId: null,
      dragOverFolderId: null,
      dropPosition: null
    });
    dragCounter.current = 0;
  }, [dragState.dropPosition, onFolderMove]);

  // 渲染檔案夾節點
  const renderFolderNode = useCallback((folder: FolderTreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isDragged = dragState.draggedFolderId === folder.id;
    const isDragOver = dragState.dragOverFolderId === folder.id;
    const hasChildren = folder.children.length > 0;
    
    return (
      <div key={folder.id} className="select-none">
        {/* 拖拽指示器 - before */}
        {isDragOver && dragState.dropPosition === 'before' && (
          <div className="h-0.5 bg-blue-500 mx-2 rounded" />
        )}
        
        <div
          className={`
            flex items-center py-2 px-3 mx-2 rounded-lg cursor-pointer transition-all duration-200
            ${isSelected ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-gray-50'}
            ${isDragged ? 'opacity-50 scale-95' : ''}
            ${isDragOver && dragState.dropPosition === 'inside' ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}
          `}
          style={{ 
            paddingLeft: `${level * 20 + 12}px`,
            marginLeft: `${level * 8}px`
          }}
          draggable={allowDragDrop}
          onDragStart={(e) => handleDragStart(e, folder)}
          onDragEnd={handleDragEnd}
          onDragEnter={(e) => handleDragEnter(e, folder)}
          onDragOver={(e) => handleDragOver(e, folder)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder)}
          onClick={() => onFolderSelect?.(folder)}
        >
          {/* 展開/收起按鈕 */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(folder.id);
              }}
              className="mr-2 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {/* 檔案夾圖標 */}
          <span 
            className="mr-3 text-lg transition-transform duration-200 hover:scale-110" 
            style={{ color: folder.color }}
          >
            {folder.icon || '📁'}
          </span>
          
          {/* 檔案夾名稱 */}
          <span className="flex-1 text-sm font-medium truncate">
            {folder.name}
          </span>
          
          {/* 統計信息 */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {folder.subfolderCount > 0 && (
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {folder.subfolderCount}
              </span>
            )}
            {folder.activityCount > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {folder.activityCount}
              </span>
            )}
            {folder.isShared && (
              <span className="text-green-600" title="已分享">
                🔗
              </span>
            )}
          </div>
          
          {/* 拖拽手柄 */}
          {allowDragDrop && (
            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* 拖拽指示器 - after */}
        {isDragOver && dragState.dropPosition === 'after' && (
          <div className="h-0.5 bg-blue-500 mx-2 rounded" />
        )}
        
        {/* 子檔案夾 */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {folder.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [
    expandedFolders,
    selectedFolderId,
    dragState,
    allowDragDrop,
    toggleExpanded,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFolderSelect
  ]);

  return (
    <div className="space-y-1">
      {folders.map(folder => renderFolderNode(folder))}
      
      {/* 全局拖拽指示器 */}
      <div
        ref={dropIndicatorRef}
        className="fixed pointer-events-none z-50 h-0.5 bg-blue-500 rounded transition-all duration-200"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DragDropFolderTree;
