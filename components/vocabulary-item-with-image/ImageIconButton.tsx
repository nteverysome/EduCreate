'use client';

import React from 'react';

interface ImageIconButtonProps {
  onClick: () => void;
  hasImage?: boolean;
  disabled?: boolean;
}

/**
 * ImageIconButton - Wordwall 風格的圖片圖標按鈕
 * 
 * 特點：
 * - 極簡設計，只顯示圖標
 * - 有圖片時顯示藍色邊框
 * - Hover 效果
 * - Tooltip 提示
 */
export default function ImageIconButton({ 
  onClick, 
  hasImage = false,
  disabled = false 
}: ImageIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-10 h-10 flex items-center justify-center 
        border-2 rounded-md transition-all duration-200
        ${hasImage 
          ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100' 
          : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      title={hasImage ? "編輯圖片" : "添加圖片"}
      aria-label={hasImage ? "編輯圖片" : "添加圖片"}
    >
      <span className="text-xl" role="img" aria-label="image icon">
        🖼️
      </span>
    </button>
  );
}

