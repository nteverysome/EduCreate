/**
 * TTSButton - TTS 播放按鈕組件
 * 
 * 功能:
 * 1. 點擊播放 TTS 音頻
 * 2. 顯示播放狀態 (播放中/加載中/錯誤)
 * 3. 支持自定義樣式
 * 4. 支持無障礙設計
 * 
 * 使用方法:
 * ```tsx
 * <TTSButton 
 *   text="hello" 
 *   language="en-US" 
 *   voice="en-US-Neural2-D"
 *   size="md"
 *   variant="primary"
 * />
 * ```
 */

'use client';

import React from 'react';
import { useTTS, TTSOptions } from '@/hooks/useTTS';

export interface TTSButtonProps extends TTSOptions {
  // 樣式選項
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  
  // 圖標選項
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  
  // 文字選項
  showText?: boolean;
  playText?: string;
  loadingText?: string;
  
  // 回調函數
  onPlay?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function TTSButton({
  text,
  language,
  voice,
  geptLevel,
  size = 'md',
  variant = 'primary',
  className = '',
  showIcon = true,
  iconPosition = 'left',
  showText = false,
  playText = '播放',
  loadingText = '加載中...',
  onPlay,
  onEnd,
  onError,
}: TTSButtonProps) {
  const { play, isPlaying, isLoading, error } = useTTS();

  const handleClick = async () => {
    try {
      onPlay?.();
      await play({ text, language, voice, geptLevel });
      onEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '播放失敗';
      onError?.(errorMessage);
    }
  };

  // 尺寸樣式
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  // 變體樣式
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };

  // 圖標 SVG
  const SpeakerIcon = () => (
    <svg
      className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );

  const LoadingIcon = () => (
    <svg
      className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} animate-spin`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const PlayingIcon = () => (
    <svg
      className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );

  // 渲染圖標
  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (isLoading) return <LoadingIcon />;
    if (isPlaying) return <PlayingIcon />;
    return <SpeakerIcon />;
  };

  // 渲染文字
  const renderText = () => {
    if (!showText) return null;
    
    if (isLoading) return <span>{loadingText}</span>;
    return <span>{playText}</span>;
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isPlaying}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-md font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={`播放 ${text}`}
      title={error || `播放 ${text}`}
    >
      {iconPosition === 'left' && renderIcon()}
      {renderText()}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
}

export default TTSButton;

