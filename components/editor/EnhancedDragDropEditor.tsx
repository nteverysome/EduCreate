import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, Modifier } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore, EditorElement } from '../../store/editorStore';
interface DraggableItemProps {
  element: EditorElement;
  isSelected: boolean;
  isDragging?: boolean;
}
// 可拖動的元素組件
const DraggableItem = ({ element, isSelected, isDragging }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: element.id });
  const removeElement = useEditorStore(state => state.removeElement);
  const selectElement = useEditorStore(state => state.selectElement);
  const updateElement = useEditorStore(state => state.updateElement);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
  // 處理內容變更
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateElement(element.id, { content: e.target.value });
  };
  // 根據元素類型渲染不同的內容
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="p-3">
            <textarea
              value={element.content || ''}
              onChange={handleContentChange}
              className="w-full resize-none border-0 bg-transparent focus:outline-none"
              placeholder="文字元素"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
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
        return (
          <div className="p-3 bg-blue-50">
            <input
              type="text"
              value={element.content || ''}
              onChange={handleContentChange}
              className="w-full border-0 bg-transparent focus:outline-none"
              placeholder="問題內容"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      case 'answer':
        return (
          <div className="p-3 bg-green-50">
            <input
              type="text"
              value={element.content || ''}
              onChange={handleContentChange}
              className="w-full border-0 bg-transparent focus:outline-none"
              placeholder="答案內容"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      case 'card':
        return (
          <div className="p-3 bg-yellow-50">
            <div className="mb-2">
              <input
                type="text"
                value={element.content || ''}
                onChange={handleContentChange}
                className="w-full border-0 bg-transparent focus:outline-none"
                placeholder="卡片正面"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <input
                type="text"
                value={element.properties?.back || ''}
                onChange={(e) => updateElement(element.id, { 
                  properties: { ...element.properties, back: e.target.value } 
                })}
                className="w-full border-0 bg-transparent focus:outline-none"
                placeholder="卡片背面"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        );
      case 'quiz-item':
        return (
          <div className="p-3 bg-purple-50">
            <div className="mb-2">
              <input
                type="text"
                value={element.content || ''}
                onChange={handleContentChange}
                className="w-full border-0 bg-transparent focus:outline-none font-medium"
                placeholder="測驗問題"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              {(element.properties?.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    checked={element.properties?.correctAnswer === index}
                    onChange={() => updateElement(element.id, { 
                      properties: { ...element.properties, correctAnswer: index } 
                    })}
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.properties?.options || [])];
                      newOptions[index] = e.target.value;
                      updateElement(element.id, { 
                        properties: { ...element.properties, options: newOptions } 
                      });
                    }}
                    className="w-full border-0 bg-transparent focus:outline-none"
                    placeholder={`選項 ${index + 1}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newOptions = [...(element.properties?.options || []), ''];
                  updateElement(element.id, { 
                    properties: { ...element.properties, options: newOptions } 
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + 添加選項
              </button>
            </div>
          </div>
        );
      case 'h5p':
        return (
          <div className="p-3 bg-indigo-50">
            <div className="font-medium">{element.content || 'H5P 內容'}</div>
            <div className="text-sm text-gray-500">{element.properties?.contentType || 'H5P 元素'}</div>
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
interface EnhancedDragDropEditorProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  onDragEnd?: (event: DragEndEvent) => void;
  layout?: 'vertical' | 'horizontal' | 'grid';
  allowSorting?: boolean;
}
export default function EnhancedDragDropEditor({
  elements,
  selectedElementId,
  onDragEnd,
  layout = 'vertical',
  allowSorting = true
}: EnhancedDragDropEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectElement = useEditorStore(state => state.selectElement);
  const containerRef = useRef<HTMLDivElement>(null);
  // 配置拖放感應器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 需要移動5像素才會觸發拖動
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // 獲取排序策略
  const getSortingStrategy = () => {
    switch (layout) {
      case 'horizontal':
        return horizontalListSortingStrategy;
      case 'vertical':
      default:
        return verticalListSortingStrategy;
    }
  };
  // 處理拖動開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    selectElement(active.id as string);
  }, [selectElement]);
  // 處理拖動結束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    if (onDragEnd) {
      onDragEnd(event);
    }
  }, [onDragEnd]);
  // 處理畫布點擊（取消選中）
  const handleCanvasClick = () => {
    selectElement(null);
  };
  // 獲取當前拖動的元素
  const activeElement = activeId ? elements.find(el => el.id === activeId) : null;
  // 組合修飾器
  const modifiers: Modifier[] = [restrictToWindowEdges];
  // 獲取容器類名
  const getContainerClassName = () => {
    let className = "bg-gray-100 min-h-[500px] p-4 rounded-lg border border-gray-300";
    if (layout === 'horizontal') {
      className += " flex flex-row space-x-3 overflow-x-auto";
    } else if (layout === 'grid') {
      className += " grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3";
    } else {
      className += " space-y-3";
    }
    return className;
  };
  return (
    <div 
      ref={containerRef}
      className={getContainerClassName()}
      onClick={handleCanvasClick}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={modifiers}
      >
        <SortableContext 
          items={elements.map(el => el.id)}
          strategy={getSortingStrategy()}
        >
          {elements.map(element => (
            <DraggableItem
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              isDragging={element.id === activeId}
            />
          ))}
          {elements.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              從側邊欄拖動元素到此處開始創建活動
            </div>
          )}
        </SortableContext>
        {/* 拖動覆蓋層 */}
        <DragOverlay adjustScale={true} modifiers={[snapCenterToCursor]}>
          {activeElement ? (
            <DraggableItem
              element={activeElement}
              isSelected={true}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
