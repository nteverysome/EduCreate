'use client';

import React, { useRef, useEffect, useState } from 'react';
import FormattingToolbar, { FormatType } from '../formatting-toolbar';

interface FormattableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  leftPadding?: string;
}

/**
 * FormattableInput - 支持格式化的輸入框
 * 
 * 特點:
 * - 使用 contentEditable 支持富文本
 * - 支持粗體、上標、下標
 * - 支持插入特殊符號
 * - 獲得焦點時顯示格式化工具欄
 */
export default function FormattableInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  leftPadding = 'pl-3'
}: FormattableInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null); // 保存選擇範圍
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set());

  // 初始化內容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setIsEmpty(!value);
    }
  }, [value]);

  // 處理內容變化
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.textContent || '';
      setIsEmpty(!text.trim());
      onChange(html);
    }
  };

  // 保存選擇範圍
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // 恢復選擇範圍
  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }
  };

  // 檢測當前光標位置的格式狀態
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveFormats(new Set());
      return;
    }

    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;

    // 如果是文本節點，獲取其父元素
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    const formats = new Set<FormatType>();

    // 向上遍歷 DOM 樹，檢查是否在格式標籤內
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement) {
        const tagName = node.tagName.toLowerCase();
        if (tagName === 'strong' || tagName === 'b') {
          formats.add('bold');
        } else if (tagName === 'sup') {
          formats.add('superscript');
        } else if (tagName === 'sub') {
          formats.add('subscript');
        }
      }
      node = node.parentNode;
    }

    setActiveFormats(formats);
  };

  // 處理格式化
  const handleFormat = (type: FormatType) => {
    // 恢復之前保存的選擇範圍
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    let element: HTMLElement;

    switch (type) {
      case 'bold':
        element = document.createElement('strong');
        break;
      case 'superscript':
        element = document.createElement('sup');
        break;
      case 'subscript':
        element = document.createElement('sub');
        break;
    }

    element.textContent = selectedText;
    range.deleteContents();
    range.insertNode(element);

    // 更新內容
    handleInput();

    // 恢復焦點
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // 處理插入符號
  const handleInsertSymbol = (symbol: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // 如果沒有選擇,在末尾插入
      editorRef.current.textContent += symbol;
    } else {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(symbol);
      range.insertNode(textNode);
      
      // 移動光標到插入的符號後面
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 更新內容
    handleInput();

    // 恢復焦點
    editorRef.current.focus();
  };

  // 處理焦點
  const handleFocus = () => {
    setIsFocused(true);
    updateActiveFormats();
  };

  const handleBlur = () => {
    // 保存當前選擇範圍
    saveSelection();

    // 延遲隱藏工具欄，讓點擊工具欄按鈕有時間執行
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  // 處理選擇變化
  const handleSelectionChange = () => {
    if (isFocused) {
      updateActiveFormats();
    }
  };

  // 監聽選擇變化
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isFocused]);

  // 處理鍵盤快捷鍵
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+B: 粗體
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      handleFormat('bold');
    }
  };

  return (
    <div className="relative w-full">
      {/* 可編輯區域 */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          w-full py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${leftPadding}
          pr-10
          min-h-[40px]
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
          ${className}
        `}
        role="textbox"
        aria-label={placeholder}
        aria-multiline="false"
      />

      {/* Placeholder */}
      {isEmpty && !isFocused && (
        <div
          className={`absolute top-2 ${leftPadding} text-gray-400 pointer-events-none`}
        >
          {placeholder}
        </div>
      )}

      {/* 格式化工具欄 */}
      <FormattingToolbar
        visible={isFocused && !disabled}
        onFormat={handleFormat}
        onInsertSymbol={handleInsertSymbol}
        activeFormats={activeFormats}
      />
    </div>
  );
}

