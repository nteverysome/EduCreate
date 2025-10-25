'use client';

import React, { useState } from 'react';
import { Bold, Superscript, Subscript, Omega } from 'lucide-react';
import SymbolPicker from './SymbolPicker';

export type FormatType = 'bold' | 'superscript' | 'subscript';

interface FormattingToolbarProps {
  visible: boolean;
  onFormat: (type: FormatType) => void;
  onInsertSymbol: (symbol: string) => void;
  activeFormats?: Set<FormatType>;
}

/**
 * FormattingToolbar - Wordwall 風格的格式化工具欄
 * 
 * 特點:
 * - 只在輸入框獲得焦點時顯示
 * - 支持粗體、上標、下標、特殊符號
 * - 與 Wordwall 設計一致
 */
export default function FormattingToolbar({
  visible,
  onFormat,
  onInsertSymbol,
  activeFormats = new Set()
}: FormattingToolbarProps) {
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  if (!visible) return null;

  const handleSymbolSelect = (symbol: string) => {
    onInsertSymbol(symbol);
    setShowSymbolPicker(false);
  };

  // 獲取按鈕的樣式類名
  const getButtonClassName = (formatType: FormatType) => {
    const isActive = activeFormats.has(formatType);
    return `
      w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded transition-colors
      ${isActive
        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        : 'hover:bg-gray-100 text-gray-700'
      }
    `;
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* 粗體按鈕 */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // 防止失去焦點
          onFormat('bold');
        }}
        className={getButtonClassName('bold')}
        title="粗體 (Ctrl+B)"
      >
        <span className="font-bold text-sm sm:text-base">B</span>
      </button>

      {/* 上標按鈕 */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // 防止失去焦點
          onFormat('superscript');
        }}
        className={getButtonClassName('superscript')}
        title="上標 (x²)"
      >
        <span className="text-sm sm:text-base">
          x<sup className="text-xs">2</sup>
        </span>
      </button>

      {/* 下標按鈕 */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // 防止失去焦點
          onFormat('subscript');
        }}
        className={getButtonClassName('subscript')}
        title="下標 (x₂)"
      >
        <span className="text-sm sm:text-base">
          x<sub className="text-xs">2</sub>
        </span>
      </button>

      {/* 特殊符號按鈕 */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // 防止失去焦點
            setShowSymbolPicker(!showSymbolPicker);
          }}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          title="特殊符號"
        >
          <span className="text-gray-700 text-base sm:text-lg">Ω</span>
        </button>

        {/* 符號選擇器 */}
        {showSymbolPicker && (
          <SymbolPicker
            onSelect={handleSymbolSelect}
            onClose={() => setShowSymbolPicker(false)}
          />
        )}
      </div>
    </div>
  );
}

