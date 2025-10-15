'use client';

import React, { useRef, useEffect } from 'react';
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
  const dragAreaRef = useRef<HTMLDivElement>(null);

  // 统一的拖拽处理函数
  const handleDragToRoot = async (eventType: string) => {
    console.log('🎯 DragToRootArea handleDragToRoot 被调用:', {
      eventType,
      hasOnDrop: !!dragDropContext?.onDrop,
      isDragging: dragDropContext?.isDragging,
      dragItemType: dragDropContext?.dragItem?.type,
      dragItemId: dragDropContext?.dragItem?.id,
      timestamp: Date.now()
    });

    // 检查拖拽状态
    const currentDragState = {
      hasOnDrop: !!dragDropContext?.onDrop,
      isDragging: dragDropContext?.isDragging,
      dragItemType: dragDropContext?.dragItem?.type,
      dragItemId: dragDropContext?.dragItem?.id
    };

    console.log('🔍 当前拖拽状态:', currentDragState);

    // 如果正在拖拽，执行拖拽到根目录操作
    if (currentDragState.hasOnDrop && currentDragState.isDragging && currentDragState.dragItemType === 'result') {
      try {
        console.log('🚀 执行拖拽到根目录操作...', {
          dragItemId: currentDragState.dragItemId,
          targetType: 'root',
          eventType
        });

        await dragDropContext.onDrop(null, 'root');
        console.log('✅ 拖拽到根目录成功');

        return true; // 表示拖拽操作成功

      } catch (error) {
        console.error('❌ 拖拽到根目錄失敗:', error);
        return false;
      }
    } else {
      console.log('🔄 没有拖拽状态，跳过拖拽操作', {
        reason: !currentDragState.isDragging ? '没有拖拽状态' :
                !currentDragState.hasOnDrop ? '没有onDrop函数' :
                currentDragState.dragItemType !== 'result' ? '拖拽项类型不是result' : '未知原因'
      });
      return false;
    }
  };

  // 点击事件处理器
  const handleClick = async (event: React.MouseEvent) => {
    console.log('🖱️ 点击事件触发');

    const dragSuccess = await handleDragToRoot('click');

    if (!dragSuccess) {
      // 如果没有拖拽操作，执行普通的返回根目录操作
      console.log('🔄 执行普通的返回根目录操作...');
      onBackToRoot();
    }
  };

  // 鼠标抬起事件处理器
  const handleMouseUp = async (event: React.MouseEvent) => {
    console.log('🖱️ 鼠标抬起事件触发');
    await handleDragToRoot('mouseup');
  };

  // 鼠标按下事件处理器（备选）
  const handleMouseDown = async (event: React.MouseEvent) => {
    console.log('🖱️ 鼠标按下事件触发');
    // 延迟一下，让拖拽状态稳定
    setTimeout(async () => {
      await handleDragToRoot('mousedown-delayed');
    }, 100);
  };

  // 使用 useEffect 添加直接的DOM事件监听器作为备选方案
  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea) return;

    const handleDirectClick = async (event: Event) => {
      console.log('🎯 直接DOM事件监听器触发:', event.type);
      await handleDragToRoot('direct-dom-' + event.type);
    };

    // 添加多种事件监听器
    dragArea.addEventListener('click', handleDirectClick);
    dragArea.addEventListener('mouseup', handleDirectClick);

    return () => {
      dragArea.removeEventListener('click', handleDirectClick);
      dragArea.removeEventListener('mouseup', handleDirectClick);
    };
  }, [dragDropContext?.isDragging, dragDropContext?.dragItem]);

  if (!currentFolderId) return null;

  return (
    <div
      ref={dragAreaRef}
      className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      data-drag-target="root"
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
