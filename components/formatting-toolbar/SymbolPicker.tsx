'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface SymbolPickerProps {
  onSelect: (symbol: string) => void;
  onClose: () => void;
}

// 符號分類
const SYMBOL_CATEGORIES = {
  math: {
    label: '數學符號',
    symbols: ['±', '×', '÷', '√', '∞', '≈', '≠', '≤', '≥', '∑', '∏', '∫', '∂', '∇', '∆']
  },
  greek: {
    label: '希臘字母',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω']
  },
  currency: {
    label: '貨幣符號',
    symbols: ['$', '€', '£', '¥', '₹', '₽', '₩', '₪', '₦', '₨', '฿', '₡', '₱', '₴', '₵']
  },
  other: {
    label: '其他符號',
    symbols: ['©', '®', '™', '°', 'µ', '¶', '§', '†', '‡', '•', '‰', '‱', '′', '″', '‴']
  }
};

/**
 * SymbolPicker - 特殊符號選擇器
 * 
 * 特點:
 * - 分類顯示符號 (數學、希臘字母、貨幣、其他)
 * - 點擊符號插入到輸入框
 * - 點擊外部關閉
 */
export default function SymbolPicker({ onSelect, onClose }: SymbolPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof SYMBOL_CATEGORIES>('math');
  const pickerRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-80"
    >
      {/* 標題欄 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">特殊符號</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 分類標籤 */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 overflow-x-auto">
        {Object.entries(SYMBOL_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as keyof typeof SYMBOL_CATEGORIES)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeCategory === key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* 符號網格 - 手機版調整為 6 列，桌面版 8 列 */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
          {SYMBOL_CATEGORIES[activeCategory].symbols.map((symbol, index) => (
            <button
              key={index}
              onMouseDown={(e) => {
                e.preventDefault(); // 防止失去焦點
                onSelect(symbol);
              }}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
              title={symbol}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

