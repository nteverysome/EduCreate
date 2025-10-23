'use client';

import React, { useState, useEffect } from 'react';
import { X, Volume2, Trash2 } from 'lucide-react';

interface AudioPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  text?: string;
  onRemove?: () => void;
}

const AudioPreviewDialog: React.FC<AudioPreviewDialogProps> = ({
  isOpen,
  onClose,
  audioUrl,
  text,
  onRemove,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // 清理音頻元素
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  const handlePlayPreview = () => {
    if (audioUrl) {
      // 停止當前播放
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      // 創建新的音頻元素
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      setIsPlaying(true);

      // 播放音頻
      audio.play();

      // 監聽播放結束
      audio.onended = () => {
        setIsPlaying(false);
      };

      // 監聽錯誤
      audio.onerror = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleStopPreview = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    handleStopPreview();
    onClose();
  };

  const handleRemove = () => {
    handleStopPreview();
    if (onRemove) {
      onRemove();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-green-600" />
            語音預覽
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6">
          {/* 文字信息 */}
          {text && (
            <div className="w-full space-y-2 text-center">
              <p className="text-sm text-gray-500">文字</p>
              <p className="text-lg font-medium text-gray-900">{text}</p>
            </div>
          )}

          {/* 播放按鈕和聲波動畫 */}
          <div className="flex flex-col items-center gap-4">
            {/* 聲波動畫（播放時顯示） */}
            {isPlaying && (
              <div className="flex items-center justify-center gap-1.5 h-20">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-green-400 to-green-600 rounded-full"
                    style={{
                      animation: `wave 0.8s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      height: '20px',
                    }}
                  />
                ))}
              </div>
            )}
            <style jsx>{`
              @keyframes wave {
                0%, 100% {
                  height: 20px;
                }
                50% {
                  height: 60px;
                }
              }
            `}</style>

            {/* 播放按鈕 */}
            <button
              onClick={isPlaying ? handleStopPreview : handlePlayPreview}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } shadow-lg hover:shadow-xl`}
            >
              {isPlaying ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-2 h-8 bg-white rounded-sm mr-2"></div>
                  <div className="w-2 h-8 bg-white rounded-sm"></div>
                </div>
              ) : (
                <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[24px] border-l-white border-b-[16px] border-b-transparent ml-2"></div>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500">
            {isPlaying ? '正在播放...' : '點擊播放語音'}
          </p>
        </div>

        {/* 底部按鈕 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          {/* 移除按鈕 */}
          {onRemove && (
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>移除語音</span>
            </button>
          )}
          
          {/* 關閉按鈕 */}
          <button
            onClick={handleClose}
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
              !onRemove ? 'ml-auto' : ''
            }`}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPreviewDialog;

