import { useCallback } from 'react';
import { useEditorStore, EditorElement } from '../../store/editorStore';
import { useDraggable } from '@dnd-kit/core';
import H5PElement from './H5PElement';

interface EditorCanvasProps {
  elements: EditorElement[];
  selectedElementId: string | null;
}

// 可拖動的編輯器元素
function DraggableElement({ element, isSelected }: { element: EditorElement; isSelected: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
  });

  const selectElement = useEditorStore(state => state.selectElement);
  const updateElement = useEditorStore(state => state.updateElement);
  const removeElement = useEditorStore(state => state.removeElement);

  // 處理元素點擊
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  // 處理選擇元素（不需要事件參數）
  const handleSelect = () => {
    selectElement(element.id);
  };

  // 處理內容變更
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateElement(element.id, { content: e.target.value });
  };

  // 處理刪除元素
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  // 根據元素類型渲染不同的內容
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <textarea
            value={element.content}
            onChange={handleContentChange}
            className="w-full h-full resize-none border-0 bg-transparent focus:outline-none"
            placeholder="輸入文字..."
            onClick={(e) => e.stopPropagation()}
          />
        );

      case 'question':
      case 'answer':
        return (
          <input
            type="text"
            value={element.content}
            onChange={handleContentChange}
            className="w-full border-0 bg-transparent focus:outline-none"
            placeholder={element.type === 'question' ? '輸入問題...' : '輸入答案...'}
            onClick={(e) => e.stopPropagation()}
          />
        );

      case 'card':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-2 border-b">
              <input
                type="text"
                value={element.content}
                onChange={handleContentChange}
                className="w-full border-0 bg-transparent focus:outline-none"
                placeholder="卡片正面..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex-1 p-2">
              <input
                type="text"
                value={element.properties?.back || ''}
                onChange={(e) => updateElement(element.id, { 
                  properties: { ...element.properties, back: e.target.value } 
                })}
                className="w-full border-0 bg-transparent focus:outline-none"
                placeholder="卡片背面..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        );

      case 'h5p':
        return (
          <H5PElement
            element={element}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
        
      case 'quiz-item':
        return (
          <div className="flex flex-col h-full">
            <input
              type="text"
              value={element.content}
              onChange={handleContentChange}
              className="w-full border-0 bg-transparent focus:outline-none font-medium"
              placeholder="輸入問題..."
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-2 space-y-1">
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
                    placeholder={`選項 ${index + 1}...`}
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

      default:
        return <div>{element.content}</div>;
    }
  };

  // 計算元素樣式
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    top: element.position.y,
    left: element.position.x,
    width: element.size?.width || 'auto',
    height: element.size?.height || 'auto',
  };

  // 根據元素類型設置不同的樣式
  const getElementClassName = () => {
    let baseClass = 'absolute p-3 bg-white rounded-md shadow-md';
    
    if (isSelected) {
      baseClass += ' ring-2 ring-blue-500';
    } else {
      baseClass += ' hover:ring-1 hover:ring-blue-300';
    }
    
    switch (element.type) {
      case 'question':
        return `${baseClass} border-l-4 border-blue-500`;
      case 'answer':
        return `${baseClass} border-l-4 border-green-500`;
      case 'card':
        return `${baseClass} border border-gray-200`;
      case 'quiz-item':
        return `${baseClass} border border-gray-200`;
      default:
        return baseClass;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={getElementClassName()}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {renderElementContent()}
      
      {isSelected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}

const EditorCanvas = ({ elements, selectedElementId }: EditorCanvasProps) => {
  const selectElement = useEditorStore(state => state.selectElement);

  // 處理畫布點擊，取消選中元素
  const handleCanvasClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  return (
    <div
      className="flex-1 bg-gray-100 relative overflow-auto"
      onClick={handleCanvasClick}
    >
      <div className="absolute inset-0 min-h-full min-w-full">
        {elements.map(element => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
          />
        ))}
      </div>
    </div>
  );
}

export default handleClick;