'use client';

import React, { useState } from 'react';
import { Bold, Superscript, Subscript, Omega } from 'lucide-react';
import SymbolPicker from './SymbolPicker';

export type FormatType = 'bold' | 'superscript' | 'subscript';

interface FormattingToolbarProps {
  visible: boolean;
  onFormat: (type: FormatType) => void;
  onInsertSymbol: (symbol: string) => void;
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
  onInsertSymbol
}: FormattingToolbarProps) {
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  if (!visible) return null;

  const handleSymbolSelect = (symbol: string) => {
    onInsertSymbol(symbol);
    setShowSymbolPicker(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* 粗體按鈕 */}
      <button
        type="button"
        onClick={() => onFormat('bold')}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        title="粗體 (Ctrl+B)"
      >
        <span className="font-bold text-gray-700">B</span>
      </button>

      {/* 上標按鈕 */}
      <button
        type="button"
        onClick={() => onFormat('superscript')}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        title="上標 (x²)"
      >
        <span className="text-gray-700">
          x<sup className="text-xs">2</sup>
        </span>
      </button>

      {/* 下標按鈕 */}
      <button
        type="button"
        onClick={() => onFormat('subscript')}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        title="下標 (x₂)"
      >
        <span className="text-gray-700">
          x<sub className="text-xs">2</sub>
        </span>
      </button>

      {/* 特殊符號按鈕 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowSymbolPicker(!showSymbolPicker)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          title="特殊符號"
        >
          <span className="text-gray-700 text-lg">Ω</span>
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

