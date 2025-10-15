'use client';

import React from 'react';
import { useDragDrop } from './DragDropContext';

interface DragToRootAreaProps {
  currentFolderId: string | null;
  onBackToRoot: () => void;
}

export const DragToRootArea: React.FC<DragToRootAreaProps> = ({ 
  currentFolderId, 
  onBackToRoot 
}) => {
  const dragDropContext = useDragDrop();

  const handleClick = async (event: React.MouseEvent) => {
    console.log('🎯 DragToRootArea handleClick 被调用:', {
      hasOnDrop: !!dragDropContext?.onDrop,
      isDragging: dragDropContext?.isDragging,
      dragItemType: dragDropContext?.dragItem?.type,
      dragItemId: dragDropContext?.dragItem?.id,
      allConditionsMet: dragDropContext?.onDrop && dragDropContext.isDragging && dragDropContext.dragItem?.type === 'result'
    });

    // 如果正在拖拽，优先处理拖拽逻辑
    if (dragDropContext?.onDrop && dragDropContext.isDragging && dragDropContext.dragItem?.type === 'result') {
      event.preventDefault();
      event.stopPropagation();

      try {
        console.log('🚀 执行拖拽到根目录操作...');
        await dragDropContext.onDrop(null, 'root');  // 使用 null 而不是 ''
        console.log('✅ 拖拽到根目录成功');
      } catch (error) {
        console.error('❌ 拖拽到根目錄失敗:', error);
      }
    } else {
      // 如果没有拖拽，执行普通的返回根目录操作
      console.log('🔄 执行普通的返回根目录操作...');
      onBackToRoot();
    }
  };

  if (!currentFolderId) return null;

  return (
    <div
      className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center text-gray-600">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        拖拽結果到此處以移回上一層
      </div>
    </div>
  );
};

export default DragToRootArea;
