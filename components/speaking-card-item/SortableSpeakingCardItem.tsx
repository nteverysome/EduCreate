'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SpeakingCardItem, { SpeakingCardData } from './index';
import DragHandle from '../drag-handle';
import DuplicateButton from '../duplicate-button';

interface SortableSpeakingCardItemProps {
  card: SpeakingCardData;
  index: number;
  onChange: (card: SpeakingCardData) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  minItems: number;
  totalItems: number;
}

/**
 * SortableSpeakingCardItem - 可排序的語音卡片項目組件
 * 
 * 特點:
 * - 使用 @dnd-kit 實現拖移排序
 * - 整合 SpeakingCardItem 組件
 * - 添加拖移按鈕和刪除按鈕
 * - Wordwall 風格的布局
 */
export default function SortableSpeakingCardItem({
  card,
  index,
  onChange,
  onRemove,
  onDuplicate,
  minItems,
  totalItems,
}: SortableSpeakingCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-1 sm:gap-2 relative"
    >
      {/* 項目編號 */}
      <div className="flex-shrink-0 w-6 sm:w-8 pt-2 text-gray-600 font-medium text-sm sm:text-base">
        {index + 1}.
      </div>

      {/* 卡片項目 */}
      <div className="flex-1 min-w-0">
        <SpeakingCardItem
          card={card}
          index={index}
          onChange={onChange}
          onRemove={onRemove}
          minItems={minItems}
          totalItems={totalItems}
        />
      </div>

      {/* 右側按鈕組 - 手機版垂直排列，桌面版水平排列 */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-0 pt-2">
        {/* 刪除按鈕 */}
        <button
          onClick={onRemove}
          disabled={totalItems <= minItems}
          className="w-9 sm:w-7 md:w-8 h-9 sm:h-11 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-md hover:bg-red-50"
          title="刪除項目"
          type="button"
        >
          {/* Font Awesome trash icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="w-4 sm:w-3.5 md:w-4 h-4 sm:h-3.5 md:h-4"
            fill="currentColor"
          >
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
          </svg>
        </button>

        {/* 複製按鈕 */}
        <DuplicateButton onClick={onDuplicate} />

        {/* 拖移按鈕 */}
        <DragHandle attributes={attributes} listeners={listeners} />
      </div>
    </div>
  );
}

