/**
 * TTSPlayer - 高級 TTS 播放器組件
 * 
 * 功能:
 * 1. 完整的播放控制 (播放/暫停/停止)
 * 2. 音量控制
 * 3. 播放速度控制
 * 4. 播放列表支持
 * 5. 自動播放下一個
 * 
 * 使用方法:
 * ```tsx
 * <TTSPlayer 
 *   items={[
 *     { text: 'hello', language: 'en-US', voice: 'en-US-Neural2-D' },
 *     { text: 'world', language: 'en-US', voice: 'en-US-Neural2-D' }
 *   ]}
 *   autoPlay={true}
 *   showControls={true}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTTS, TTSOptions } from '@/hooks/useTTS';

export interface TTSPlayerProps {
  items: TTSOptions[];
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  showPlaylist?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function TTSPlayer({
  items,
  autoPlay = false,
  loop = false,
  showControls = true,
  showPlaylist = true,
  className = '',
  onComplete,
}: TTSPlayerProps) {
  const {
    play,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentText,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
  } = useTTS();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // 播放當前項目
  const playCurrent = async () => {
    if (currentIndex < items.length) {
      await play(items[currentIndex]);
      setHasStarted(true);
    }
  };

  // 播放下一個
  const playNext = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < items.length) {
      setCurrentIndex(nextIndex);
      await play(items[nextIndex]);
    } else if (loop) {
      setCurrentIndex(0);
      await play(items[0]);
    } else {
      onComplete?.();
    }
  };

  // 播放上一個
  const playPrevious = async () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      await play(items[prevIndex]);
    }
  };

  // 跳轉到指定項目
  const playAt = async (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
      await play(items[index]);
    }
  };

  // 自動播放
  useEffect(() => {
    if (autoPlay && !hasStarted && items.length > 0) {
      playCurrent();
    }
  }, [autoPlay, hasStarted, items]);

  // 自動播放下一個
  useEffect(() => {
    if (!isPlaying && !isPaused && hasStarted && currentText) {
      // 播放結束,自動播放下一個
      playNext();
    }
  }, [isPlaying, isPaused, hasStarted, currentText]);

  return (
    <div className={`tts-player bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* 當前播放信息 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          正在播放 {currentIndex + 1} / {items.length}
        </div>
        <div className="text-lg font-medium text-gray-800">
          {currentText || items[currentIndex]?.text || '無內容'}
        </div>
        {error && (
          <div className="text-sm text-red-500 mt-1">
            錯誤: {error}
          </div>
        )}
      </div>

      {/* 播放控制 */}
      {showControls && (
        <div className="space-y-4">
          {/* 主要控制按鈕 */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={playPrevious}
              disabled={currentIndex === 0 || isLoading}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="上一個"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {!isPlaying || isPaused ? (
              <button
                onClick={isPaused ? resume : playCurrent}
                disabled={isLoading}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                aria-label="播放"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={pause}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                aria-label="暫停"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            )}

            <button
              onClick={stop}
              disabled={!isPlaying && !isPaused}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="停止"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>

            <button
              onClick={playNext}
              disabled={currentIndex === items.length - 1 || isLoading}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="下一個"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
              </svg>
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
              aria-label="音量"
            />
            <span className="text-sm text-gray-600 w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* 播放速度控制 */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
            </svg>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="flex-1"
              aria-label="播放速度"
            />
            <span className="text-sm text-gray-600 w-12 text-right">
              {playbackRate.toFixed(1)}x
            </span>
          </div>
        </div>
      )}

      {/* 播放列表 */}
      {showPlaylist && items.length > 1 && (
        <div className="mt-4 border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">播放列表</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => playAt(index)}
                className={`
                  w-full text-left px-3 py-2 rounded text-sm
                  transition-colors duration-200
                  ${index === currentIndex
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                {index + 1}. {item.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TTSPlayer;

