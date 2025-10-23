'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import VocabularyItemWithImage, { VocabularyItemData } from './index';
import DragHandle from '../drag-handle';
import DuplicateButton from '../duplicate-button';

interface SortableVocabularyItemProps {
  item: VocabularyItemData;
  index: number;
  onChange: (item: VocabularyItemData) => void;
  onRemove: () => void;
  onDuplicate: () => void; // 新增: 複製功能
  minItems: number;
  totalItems: number;
}

/**
 * SortableVocabularyItem - 可排序的詞彙項目組件
 * 
 * 特點:
 * - 使用 @dnd-kit 實現拖移排序
 * - 整合 VocabularyItemWithImage 組件
 * - 添加拖移按鈕和刪除按鈕
 * - Wordwall 風格的布局
 */
export default function SortableVocabularyItem({
  item,
  index,
  onChange,
  onRemove,
  onDuplicate, // 新增
  minItems,
  totalItems,
}: SortableVocabularyItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 relative"
    >
      {/* 項目編號 */}
      <div className="flex-shrink-0 w-8 pt-2 text-gray-600 font-medium">
        {index + 1}.
      </div>

      {/* 詞彙項目 */}
      <div className="flex-1">
        <VocabularyItemWithImage
          item={item}
          index={index}
          onChange={onChange}
          onRemove={onRemove}
          minItems={minItems}
          totalItems={totalItems}
        />
      </div>

      {/* 右側按鈕組 - Wordwall 順序: [刪除] [複製] [拖移] */}
      <div className="flex-shrink-0 flex items-center gap-0 pt-2">
        {/* 刪除按鈕 */}
        <button
          onClick={onRemove}
          disabled={totalItems <= minItems}
          className="w-8 h-11 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="刪除項目"
          type="button"
        >
          {/* Font Awesome trash icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="w-4 h-4"
            fill="currentColor"
          >
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
          </svg>
        </button>

        {/* 複製按鈕 */}
        <DuplicateButton onClick={onDuplicate} />

        {/* 拖移按鈕 */}
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
}

