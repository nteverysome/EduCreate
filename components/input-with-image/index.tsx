'use client';

import React from 'react';

/**
 * InputWithImage Props
 */
export interface InputWithImageProps {
  value: string;
  onChange: (value: string) => void;
  imageUrl?: string;
  onImageIconClick: () => void;
  onThumbnailClick: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  imageSize?: 'small' | 'medium' | 'large';  // 圖片大小
  onImageSizeChange?: (size: 'small' | 'medium' | 'large') => void;  // 大小變更回調
}

/**
 * InputWithImage - Wordwall 風格的整合圖片功能輸入框
 * 
 * 特點：
 * - 圖片圖標在輸入框內部右側
 * - 圖片縮圖在輸入框內部左側
 * - 不佔用額外的垂直或水平空間
 * - 完全模仿 Wordwall 的設計
 * 
 * 使用方法：
 * ```tsx
 * <InputWithImage
 *   value={text}
 *   onChange={setText}
 *   imageUrl={imageUrl}
 *   onImageIconClick={() => setShowImagePicker(true)}
 *   onThumbnailClick={() => setShowImageEditor(true)}
 *   placeholder="輸入文字..."
 * />
 * ```
 */
export default function InputWithImage({
  value,
  onChange,
  imageUrl,
  onImageIconClick,
  onThumbnailClick,
  placeholder,
  disabled = false,
  className = '',
  imageSize = 'medium',
  onImageSizeChange
}: InputWithImageProps) {
  return (
    <div className="relative w-full space-y-1">
      {/* 輸入框 */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${imageUrl ? 'pl-12' : 'pl-3'}
          pr-10
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
          ${className}
        `}
        aria-label={placeholder}
      />
      
      {/* 左側縮圖（選擇圖片後顯示） */}
      {imageUrl && (
        <button
          type="button"
          onClick={onThumbnailClick}
          disabled={disabled}
          className={`
            absolute left-2 top-1/2 -translate-y-1/2 
            w-8 h-8 rounded overflow-hidden 
            border-2 border-gray-300 hover:border-blue-500 
            transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          title="點擊編輯圖片"
          aria-label="編輯圖片"
        >
          <img 
            src={imageUrl} 
            alt="preview" 
            className="w-full h-full object-cover" 
          />
        </button>
      )}
      
      {/* 右側圖片圖標（始終顯示） */}
      <button
        type="button"
        onClick={onImageIconClick}
        disabled={disabled}
        className={`
          absolute right-2 top-1/2 -translate-y-1/2
          w-6 h-6 flex items-center justify-center
          text-gray-400 hover:text-blue-500
          transition-colors duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        title={imageUrl ? "更換圖片" : "添加圖片"}
        aria-label={imageUrl ? "更換圖片" : "添加圖片"}
      >
        <span className="text-xl">🖼️</span>
      </button>

      {/* 圖片大小選擇器（只在有圖片時顯示） */}
      {imageUrl && onImageSizeChange && (
        <div className="flex items-center gap-1 px-2 py-1">
          <span className="text-xs text-gray-500 mr-1">圖片大小:</span>
          <button
            type="button"
            onClick={() => onImageSizeChange('small')}
            disabled={disabled}
            className={`
              px-2 py-0.5 text-xs rounded
              transition-all duration-200
              ${imageSize === 'small'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            title="小圖片"
          >
            小
          </button>
          <button
            type="button"
            onClick={() => onImageSizeChange('medium')}
            disabled={disabled}
            className={`
              px-2 py-0.5 text-xs rounded
              transition-all duration-200
              ${imageSize === 'medium'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            title="中圖片"
          >
            中
          </button>
          <button
            type="button"
            onClick={() => onImageSizeChange('large')}
            disabled={disabled}
            className={`
              px-2 py-0.5 text-xs rounded
              transition-all duration-200
              ${imageSize === 'large'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            title="大圖片"
          >
            大
          </button>
        </div>
      )}
    </div>
  );
}

