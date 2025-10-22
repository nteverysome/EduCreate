'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface CompactImagePreviewProps {
  imageUrl: string;
  onEdit: () => void;
  onRemove: () => void;
  alt?: string;
}

/**
 * CompactImagePreview - 緊湊的圖片預覽組件
 * 
 * 特點：
 * - 固定高度（128px）的圖片預覽
 * - Hover 時顯示編輯/刪除按鈕
 * - 平滑的過渡動畫
 * - 響應式設計
 */
export default function CompactImagePreview({ 
  imageUrl, 
  onEdit, 
  onRemove,
  alt = 'preview'
}: CompactImagePreviewProps) {
  return (
    <div className="mt-2 relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden group bg-gray-50">
      {/* 圖片 */}
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
      />
      
      {/* Hover 遮罩層 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100">
        {/* 編輯按鈕 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg transform hover:scale-105"
          title="編輯圖片"
          aria-label="編輯圖片"
        >
          <Edit2 size={16} />
          <span>編輯</span>
        </button>
        
        {/* 刪除按鈕 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg transform hover:scale-105"
          title="刪除圖片"
          aria-label="刪除圖片"
        >
          <Trash2 size={16} />
          <span>刪除</span>
        </button>
      </div>
      
      {/* 圖片加載失敗提示 */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 group-hover:opacity-0">
        <span className="text-gray-400 text-sm">圖片預覽</span>
      </div>
    </div>
  );
}

