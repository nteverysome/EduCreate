'use client';

import React from 'react';
import FormattableInput from './FormattableInput';

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
  // 新增：加入聲音功能
  onAddSoundClick?: () => void;
  hasAudio?: boolean;
  audioUrl?: string;
  onAudioThumbnailClick?: () => void;
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
  onAddSoundClick,
  hasAudio = false,
  audioUrl,
  onAudioThumbnailClick
}: InputWithImageProps) {
  // 計算左側 padding（根據是否有語音和圖片）
  const leftPadding = audioUrl && imageUrl ? 'pl-20' : (audioUrl || imageUrl ? 'pl-12' : 'pl-3');

  return (
    <div className="relative w-full">
      {/* 可格式化輸入框 */}
      <FormattableInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        leftPadding={leftPadding}
        className={className}
      />

      {/* 左側語音縮圖（添加語音後顯示） */}
      {audioUrl && (
        <button
          type="button"
          onClick={onAudioThumbnailClick}
          disabled={disabled}
          className={`
            absolute ${imageUrl ? 'left-11' : 'left-2'} top-1/2 -translate-y-1/2
            w-8 h-8 rounded overflow-hidden
            border-2 border-green-500 hover:border-green-600
            bg-green-50
            transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-green-500
            flex items-center justify-center
          `}
          title="點擊播放語音"
          aria-label="播放語音"
        >
          <span className="text-lg">🔊</span>
        </button>
      )}

      {/* 左側圖片縮圖（選擇圖片後顯示） */}
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
      
      {/* 右側按鈕組 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* 加入聲音按鈕（只在沒有語音時顯示） */}
        {onAddSoundClick && !audioUrl && (
          <button
            type="button"
            onClick={onAddSoundClick}
            disabled={disabled}
            className={`
              w-6 h-6 flex items-center justify-center
              text-gray-400
              hover:text-blue-500
              transition-colors duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            `}
            title="加入聲音"
            aria-label="加入聲音"
          >
            <span className="text-xl">🔊</span>
          </button>
        )}

        {/* 圖片圖標（只在沒有圖片時顯示） */}
        {!imageUrl && (
          <button
            type="button"
            onClick={onImageIconClick}
            disabled={disabled}
            className={`
              w-6 h-6 flex items-center justify-center
              text-gray-400 hover:text-blue-500
              transition-colors duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            `}
            title="添加圖片"
            aria-label="添加圖片"
          >
            <span className="text-xl">🖼️</span>
          </button>
        )}
      </div>
    </div>
  );
}

