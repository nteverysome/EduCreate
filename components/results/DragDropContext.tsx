'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DragItem {
  id: string;
  type: 'result' | 'folder';
  data: any;
}

interface DragDropContextType {
  dragItem: DragItem | null;
  isDragging: boolean;
  dragPreview: { x: number; y: number; visible: boolean };
  startDrag: (item: DragItem, event: React.MouseEvent) => void;
  endDrag: () => void;
  updateDragPreview: (x: number, y: number) => void;
  onDrop: (targetId: string, targetType: 'folder' | 'root') => Promise<void>;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

interface DragDropProviderProps {
  children: ReactNode;
  onMoveResult: (resultId: string, folderId: string | null) => Promise<void>;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onMoveResult
}) => {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState({
    x: 0,
    y: 0,
    visible: false
  });

  const startDrag = useCallback((item: DragItem, event: React.MouseEvent) => {
    console.log('🚀 startDrag:', {
      itemId: item.id,
      itemType: item.type,
      clientX: event.clientX,
      clientY: event.clientY
    });

    setDragItem(item);
    setIsDragging(true);
    setDragPreview({
      x: event.clientX,
      y: event.clientY,
      visible: true
    });

    console.log('✅ 拖拽状态已设置:', {
      dragItem: item,
      isDragging: true
    });

    // 添加全局鼠标移动和释放事件监听器
    const handleMouseMove = (e: MouseEvent) => {
      setDragPreview(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    };

    const handleMouseUp = () => {
      endDrag();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const endDrag = useCallback(() => {
    setDragItem(null);
    setIsDragging(false);
    setDragPreview(prev => ({ ...prev, visible: false }));
  }, []);

  const updateDragPreview = useCallback((x: number, y: number) => {
    setDragPreview(prev => ({ ...prev, x, y }));
  }, []);

  const onDrop = useCallback(async (targetId: string, targetType: 'folder' | 'root') => {
    console.log('🎯 DragDropContext onDrop 被调用:', {
      targetId,
      targetType,
      dragItem: dragItem ? { id: dragItem.id, type: dragItem.type } : null,
      isDragging,
      timestamp: Date.now()
    });

    if (!dragItem || dragItem.type !== 'result') {
      console.log('❌ onDrop 条件检查失败:', {
        hasDragItem: !!dragItem,
        dragItemType: dragItem?.type,
        expectedType: 'result'
      });
      return;
    }

    // 保存拖拽项信息，防止在异步操作中丢失
    const dragItemInfo = {
      id: dragItem.id,
      type: dragItem.type
    };

    try {
      console.log('🚀 开始执行拖拽操作:', {
        dragItemId: dragItemInfo.id,
        targetType,
        targetId
      });

      const folderId = targetType === 'folder' ? targetId : null;

      console.log('📡 调用 onMoveResult:', {
        resultId: dragItemInfo.id,
        folderId
      });

      await onMoveResult(dragItemInfo.id, folderId);

      console.log('✅ 拖拽操作成功完成');

    } catch (error) {
      console.error('❌ 拖移失败:', error);
      throw error; // 重新抛出错误，让调用者知道操作失败
    } finally {
      console.log('🔄 结束拖拽状态');
      endDrag();
    }
  }, [dragItem, onMoveResult, endDrag, isDragging]);

  const value: DragDropContextType = {
    dragItem,
    isDragging,
    dragPreview,
    startDrag,
    endDrag,
    updateDragPreview,
    onDrop
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
      {/* 拖移预览 */}
      {dragPreview.visible && dragItem && (
        <div
          className="fixed pointer-events-none z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            opacity: 0.8
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm font-medium text-gray-900 truncate max-w-48">
              {dragItem.data.title || dragItem.data.name}
            </span>
          </div>
        </div>
      )}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};
