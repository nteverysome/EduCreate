'use client';

import React, { useState } from 'react';
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
  onImageUrlChange?: (url: string) => void;  // 🔥 [v63.0] 新增：URL 直接輸入回調
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
  onImageUrlChange,  // 🔥 [v63.0] 新增
  placeholder,
  disabled = false,
  className = '',
  onAddSoundClick,
  hasAudio = false,
  audioUrl,
  onAudioThumbnailClick
}: InputWithImageProps) {
  // 🔥 [v63.0] 新增：URL 輸入框狀態
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // 🔥 [v63.0] 驗證 URL
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL 不能為空');
      return false;
    }
    try {
      new URL(url);
      setUrlError('');
      return true;
    } catch {
      setUrlError('無效的 URL 格式');
      return false;
    }
  };

  // 🔥 [v63.0] 處理 URL 提交
  const handleUrlSubmit = () => {
    if (validateUrl(urlInput)) {
      onImageUrlChange?.(urlInput);
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  // 計算左側 padding（根據是否有語音和圖片）- 手機版增加間距
  const leftPadding = audioUrl && imageUrl
    ? 'pl-20 sm:pl-20'
    : (audioUrl || imageUrl ? 'pl-12 sm:pl-12' : 'pl-3');

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

      {/* 左側語音縮圖（添加語音後顯示）- 手機版增大尺寸 */}
      {audioUrl && (
        <button
          type="button"
          onClick={onAudioThumbnailClick}
          disabled={disabled}
          className={`
            absolute ${imageUrl ? 'left-11 sm:left-11' : 'left-1.5 sm:left-2'} top-1/2 -translate-y-1/2
            w-9 h-9 sm:w-8 sm:h-8 rounded overflow-hidden
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
          <span className="text-lg sm:text-base">🔊</span>
        </button>
      )}

      {/* 左側圖片縮圖（選擇圖片後顯示）- 手機版增大尺寸 */}
      {imageUrl && (
        <button
          type="button"
          onClick={onThumbnailClick}
          disabled={disabled}
          className={`
            absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2
            w-9 h-9 sm:w-8 sm:h-8 rounded overflow-hidden
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
      
      {/* 右側按鈕組 - 手機版增大按鈕尺寸和間距 */}
      <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-1">
        {/* 加入聲音按鈕（只在沒有語音時顯示） */}
        {onAddSoundClick && !audioUrl && (
          <button
            type="button"
            onClick={onAddSoundClick}
            disabled={disabled}
            className={`
              w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center
              text-gray-400
              hover:text-blue-500
              transition-colors duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              rounded-md hover:bg-blue-50
            `}
            title="加入聲音"
            aria-label="加入聲音"
          >
            <span className="text-xl sm:text-lg">🔊</span>
          </button>
        )}

        {/* 圖片圖標（只在沒有圖片時顯示） */}
        {!imageUrl && (
          <div className="flex items-center gap-1">
            {/* 🔥 [v63.0] URL 輸入按鈕 */}
            {onImageUrlChange && (
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                disabled={disabled}
                className={`
                  w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center
                  text-gray-400 hover:text-green-500
                  transition-colors duration-200
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                  rounded-md hover:bg-green-50
                `}
                title="輸入圖片 URL"
                aria-label="輸入圖片 URL"
              >
                <span className="text-xl sm:text-lg">🔗</span>
              </button>
            )}

            <button
              type="button"
              onClick={onImageIconClick}
              disabled={disabled}
              className={`
                w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center
                text-gray-400 hover:text-blue-500
                transition-colors duration-200
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                rounded-md hover:bg-blue-50
              `}
              title="添加圖片"
              aria-label="添加圖片"
            >
              <span className="text-xl sm:text-lg">🖼️</span>
            </button>
          </div>
        )}
      </div>

      {/* 🔥 [v63.0] URL 輸入框 */}
      {showUrlInput && onImageUrlChange && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              輸入圖片 URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {urlError && (
              <p className="text-sm text-red-600">{urlError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                確認
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                  setUrlError('');
                }}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

