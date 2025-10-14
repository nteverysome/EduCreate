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
    setDragItem(item);
    setIsDragging(true);
    setDragPreview({
      x: event.clientX,
      y: event.clientY,
      visible: true
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
    if (!dragItem || dragItem.type !== 'result') {
      return;
    }

    try {
      const folderId = targetType === 'folder' ? targetId : null;
      await onMoveResult(dragItem.id, folderId);
    } catch (error) {
      console.error('拖移失败:', error);
    } finally {
      endDrag();
    }
  }, [dragItem, onMoveResult, endDrag]);

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
