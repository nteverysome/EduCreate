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
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

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

  // 處理格式化
  const handleFormat = (type: FormatType) => {
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
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

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
      />
    </div>
  );
}

