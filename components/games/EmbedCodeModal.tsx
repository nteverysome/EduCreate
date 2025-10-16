'use client';

import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  isOpen,
  onClose,
  activityId,
  activityTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [embedSize, setEmbedSize] = useState<'small' | 'medium' | 'large'>('medium');

  const sizes = {
    small: { width: 500, height: 400 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 },
  };

  const currentSize = sizes[embedSize];
  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/games/switcher?game=shimozurdo-game&activityId=${activityId}`;
  
  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="${currentSize.width}" 
  height="${currentSize.height}" 
  frameborder="0" 
  allowfullscreen
  title="${activityTitle}"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">嵌入代碼</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 內容 */}
        <div className="p-6">
          {/* 尺寸選擇 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              選擇嵌入尺寸
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setEmbedSize('small')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  embedSize === 'small'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                小 (500×400)
              </button>
              <button
                onClick={() => setEmbedSize('medium')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  embedSize === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                中 (800×600)
              </button>
              <button
                onClick={() => setEmbedSize('large')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  embedSize === 'large'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                大 (1200×800)
              </button>
            </div>
          </div>

          {/* 嵌入代碼 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              嵌入代碼
            </label>
            <div className="relative">
              <pre className="bg-gray-50 border border-gray-300 rounded-md p-4 text-sm text-gray-800 overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>複製</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 預覽 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              預覽
            </label>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-center" style={{ aspectRatio: `${currentSize.width}/${currentSize.height}` }}>
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🎮</div>
                  <p className="text-sm">嵌入預覽</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentSize.width} × {currentSize.height}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 使用說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">使用說明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 複製上方的嵌入代碼</li>
              <li>• 將代碼貼到您的網站 HTML 中</li>
              <li>• 遊戲將以 iframe 形式嵌入您的網站</li>
              <li>• 支援全螢幕模式和響應式設計</li>
            </ul>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeModal;

