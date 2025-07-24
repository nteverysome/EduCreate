import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore, EditorElement } from '../../store/editorStore';

interface DraggableItemProps {
  element: EditorElement;
  isSelected: boolean;
}

// 可拖動的元素組件
const DraggableItem = ({ element, isSelected }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id: element.id });
  const removeElement = useEditorStore(state => state.removeElement);
  const selectElement = useEditorStore(state => state.selectElement);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 0.2s',
    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    backgroundColor: 'white',
  };

  // 處理點擊選中元素
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  // 處理刪除元素
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  // 根據元素類型渲染不同的內容
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <div className="p-3">{element.content || '文字元素'}</div>;
      case 'image':
        return (
          <div className="p-3 flex justify-center items-center">
            {element.content ? (
              <Image src={element.content} alt="圖片" width={200} height={150} className="max-w-full max-h-full" />
            ) : (
              <div className="text-gray-400">圖片元素</div>
            )}
          </div>
        );
      case 'question':
        return <div className="p-3 bg-blue-50">問題: {element.content || '問題內容'}</div>;
      case 'answer':
        return <div className="p-3 bg-green-50">答案: {element.content || '答案內容'}</div>;
      case 'card':
        return (
          <div className="p-3 bg-yellow-50">
            <div>正面: {element.content || '卡片正面'}</div>
            <div>背面: {element.properties?.back || '卡片背面'}</div>
          </div>
        );
      case 'quiz-item':
        return (
          <div className="p-3 bg-purple-50">
            <div>問題: {element.content || '測驗問題'}</div>
            <div>選項數: {element.properties?.options?.length || 0}</div>
          </div>
        );
      default:
        return <div className="p-3">未知元素類型</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md shadow-sm mb-3 relative group"
      onClick={handleSelect}
      {...attributes}
      {...listeners}
    >
      {renderContent()}
      <button
        onClick={handleDelete}
        className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="刪除元素"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

interface DragDropEditorProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  onDragEnd?: (event: DragEndEvent) => void;
}

const DragDropEditor = ({ elements, selectedElementId, onDragEnd }: DragDropEditorProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectElement = useEditorStore(state => state.selectElement);
  
  // 配置拖放感應器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 需要移動5像素才會觸發拖動
      },
    })
  );

  // 處理拖動開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    selectElement(active.id as string);
  }, [selectElement]);

  // 處理拖動結束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      // 如果有碰撞的目標元素且不是自己，則觸發拖動結束回調
      if (onDragEnd) {
        onDragEnd(event);
      }
    }
  }, [onDragEnd]);

  // 處理畫布點擊（取消選中）
  const handleCanvasClick = () => {
    selectElement(null);
  };

  return (
    <div 
      className="bg-gray-100 min-h-[500px] p-4 rounded-lg border border-gray-300"
      onClick={handleCanvasClick}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={elements.map(el => el.id)}>
          <div className="space-y-3">
            {elements.map(element => (
              <DraggableItem
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
              />
            ))}
            {elements.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                從側邊欄拖動元素到此處開始創建活動
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default DraggableItem;