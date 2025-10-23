'use client';

import React from 'react';

interface DragHandleProps {
  listeners?: any;
  attributes?: any;
}

/**
 * DragHandle - Wordwall 風格的拖移按鈕
 * 
 * 特點:
 * - 使用 fa-sort 圖標 (⇅)
 * - 游標為 move
 * - 尺寸 32×44px
 * - 位於項目右側
 */
export default function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <button
      className="w-8 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-move active:cursor-grabbing"
      {...listeners}
      {...attributes}
      type="button"
      title="拖動重新排序"
    >
      {/* Font Awesome sort icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
        className="w-4 h-4"
        fill="currentColor"
      >
        <path d="M137.4 41.4c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9s-16.6 19.8-29.6 19.8H32c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9l128-128zm0 429.3l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0z"/>
      </svg>
    </button>
  );
}

