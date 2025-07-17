import { useState, useEffect } from 'react';
import { EditorElement } from '../../store/editorStore';
import H5PEmbed from '../H5P/H5PEmbed';

interface H5PElementProps {
  element: EditorElement;
  isSelected: boolean;
  onSelect: () => void;
}

const H5PElement = ({ element, isSelected, onSelect }: H5PElementProps) {
  const { id, content, position, size, properties } = element;
  const contentId = properties?.contentId;
  const description = properties?.description;
  
  // 元素樣式
  const elementStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: size?.width ? `${size.width}px` : 'auto',
    height: size?.height ? `${size.height}px` : 'auto',
    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
    overflow: 'hidden',
    position: 'absolute' as const,
    zIndex: isSelected ? 10 : 1,
    cursor: 'move',
  };

  if (!contentId) {
    return (
      <div
        style={elementStyle}
        onClick={onSelect}
        className="flex items-center justify-center p-4"
      >
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2">H5P內容無效</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={elementStyle}
      onClick={onSelect}
      className="h5p-element"
    >
      <div className="h5p-element-header bg-gray-100 px-3 py-2 border-b flex justify-between items-center">
        <div className="font-medium truncate">{content}</div>
        {isSelected && (
          <div className="text-xs text-gray-500">
            {properties?.contentType}
          </div>
        )}
      </div>
      <div className="h5p-element-content" style={{ height: 'calc(100% - 36px)' }}>
        <H5PEmbed
          contentId={contentId}
          contentPath={`/h5p/content/${contentId}`}
          title={content}
          height={size?.height ? size.height - 36 : 300}
          width="100%"
        />
      </div>
    </div>
  );
}

export default H5PElement;