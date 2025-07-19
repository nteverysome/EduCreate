/**
 * RichTextEditor - 完整的富文本編輯器
 * 實現格式化、樣式、表格、列表等功能，支持完整的鍵盤導航和無障礙設計
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface FormatButton {
  command: string;
  icon: string;
  title: string;
  shortcut?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = '開始輸入內容...',
  disabled = false,
  className = '',
  'data-testid': testId = 'rich-text-editor'
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<Record<string, boolean>>({});

  // 格式化按鈕配置
  const formatButtons: FormatButton[] = [
    { command: 'bold', icon: '𝐁', title: '粗體', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: '𝐼', title: '斜體', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: '𝐔', title: '底線', shortcut: 'Ctrl+U' },
    { command: 'strikeThrough', icon: '𝐒', title: '刪除線' },
  ];

  const alignButtons: FormatButton[] = [
    { command: 'justifyLeft', icon: '⬅', title: '靠左對齊' },
    { command: 'justifyCenter', icon: '⬌', title: '置中對齊' },
    { command: 'justifyRight', icon: '➡', title: '靠右對齊' },
    { command: 'justifyFull', icon: '⬍', title: '兩端對齊' },
  ];

  const listButtons: FormatButton[] = [
    { command: 'insertUnorderedList', icon: '•', title: '無序列表' },
    { command: 'insertOrderedList', icon: '1.', title: '有序列表' },
    { command: 'outdent', icon: '⬅', title: '減少縮排' },
    { command: 'indent', icon: '➡', title: '增加縮排' },
  ];

  const styleButtons: FormatButton[] = [
    { command: 'formatBlock', icon: 'H1', title: '標題1' },
    { command: 'formatBlock', icon: 'H2', title: '標題2' },
    { command: 'formatBlock', icon: 'H3', title: '標題3' },
    { command: 'formatBlock', icon: 'P', title: '段落' },
  ];

  const colorButtons = [
    { color: '#000000', title: '黑色' },
    { color: '#FF0000', title: '紅色' },
    { color: '#00FF00', title: '綠色' },
    { color: '#0000FF', title: '藍色' },
    { color: '#FFFF00', title: '黃色' },
    { color: '#FF00FF', title: '紫色' },
  ];

  // 執行格式化命令
  const executeCommand = useCallback((command: string, value?: string) => {
    if (disabled) return;

    document.execCommand(command, false, value);
    updateCurrentFormat();

    // 觸發內容變更
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [disabled, onChange]);

  // 鍵盤快捷鍵處理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    // Ctrl/Cmd + 快捷鍵
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            executeCommand('redo');
          } else {
            executeCommand('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
        case 'k':
          e.preventDefault();
          const url = prompt('請輸入連結網址:');
          if (url) {
            executeCommand('createLink', url);
          }
          break;
      }
    }

    // Tab 鍵處理縮排
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        executeCommand('outdent');
      } else {
        executeCommand('indent');
      }
    }
  }, [disabled, executeCommand]);



  // 更新當前格式狀態
  const updateCurrentFormat = useCallback(() => {
    const formats: Record<string, boolean> = {};
    
    formatButtons.forEach(button => {
      formats[button.command] = document.queryCommandState(button.command);
    });
    
    alignButtons.forEach(button => {
      formats[button.command] = document.queryCommandState(button.command);
    });
    
    listButtons.forEach(button => {
      formats[button.command] = document.queryCommandState(button.command);
    });
    
    setCurrentFormat(formats);
  }, []);

  // 處理編輯器輸入
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateCurrentFormat();
  }, [onChange, updateCurrentFormat]);

  // 插入表格
  const insertTable = useCallback(() => {
    if (disabled) return;

    const rows = prompt('請輸入行數:', '3');
    const cols = prompt('請輸入列數:', '3');
    
    if (rows && cols) {
      const rowCount = parseInt(rows);
      const colCount = parseInt(cols);
      
      if (rowCount > 0 && colCount > 0) {
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        
        for (let i = 0; i < rowCount; i++) {
          tableHTML += '<tr>';
          for (let j = 0; j < colCount; j++) {
            tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
          }
          tableHTML += '</tr>';
        }
        
        tableHTML += '</table>';
        executeCommand('insertHTML', tableHTML);
      }
    }
  }, [disabled, executeCommand]);

  // 插入連結
  const insertLink = useCallback(() => {
    if (disabled) return;
    
    const url = prompt('請輸入連結網址:');
    if (url) {
      executeCommand('createLink', url);
    }
  }, [disabled, executeCommand]);

  // 插入分隔線
  const insertHorizontalRule = useCallback(() => {
    if (disabled) return;
    executeCommand('insertHorizontalRule');
  }, [disabled, executeCommand]);

  // 字體大小選項
  const fontSizes = [
    { value: '1', label: '極小' },
    { value: '2', label: '小' },
    { value: '3', label: '正常' },
    { value: '4', label: '大' },
    { value: '5', label: '極大' },
    { value: '6', label: '超大' },
    { value: '7', label: '最大' },
  ];

  // 字體顏色選項
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#800000', '#000080'
  ];

  // 初始化編輯器內容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 處理焦點事件
  const handleFocus = useCallback(() => {
    setIsEditorFocused(true);
    updateCurrentFormat();
  }, [updateCurrentFormat]);

  const handleBlur = useCallback(() => {
    setIsEditorFocused(false);
  }, []);

  return (
    <div 
      className={`rich-text-editor border border-gray-300 rounded-lg ${className}`}
      data-testid={testId}
    >
      {/* 工具列 */}
      <div className="toolbar border-b border-gray-200 p-2 bg-gray-50">
        {/* 格式化按鈕組 */}
        <div className="toolbar-group inline-flex mr-4">
          {formatButtons.map((button) => (
            <button
              key={button.command}
              type="button"
              className={`toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentFormat[button.command] ? 'bg-blue-200 border-blue-400' : 'bg-white border-gray-300'
              }`}
              onClick={() => executeCommand(button.command)}
              title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
              disabled={disabled}
              aria-label={button.title}
              aria-pressed={currentFormat[button.command]}
              data-testid={`format-${button.command}`}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* 字體大小 */}
        <div className="toolbar-group inline-flex mr-4">
          <select
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            disabled={disabled}
            aria-label="字體大小"
            data-testid="font-size-select"
          >
            <option value="">字體大小</option>
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* 字體顏色 */}
        <div className="toolbar-group inline-flex mr-4">
          <select
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => executeCommand('foreColor', e.target.value)}
            disabled={disabled}
            aria-label="字體顏色"
            data-testid="font-color-select"
          >
            <option value="">字體顏色</option>
            {colors.map((color) => (
              <option key={color} value={color} style={{ color }}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* 對齊按鈕組 */}
        <div className="toolbar-group inline-flex mr-4">
          {alignButtons.map((button) => (
            <button
              key={button.command}
              type="button"
              className={`toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentFormat[button.command] ? 'bg-blue-200 border-blue-400' : 'bg-white border-gray-300'
              }`}
              onClick={() => executeCommand(button.command)}
              title={button.title}
              disabled={disabled}
              aria-label={button.title}
              aria-pressed={currentFormat[button.command]}
              data-testid={`align-${button.command}`}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* 列表按鈕組 */}
        <div className="toolbar-group inline-flex mr-4">
          {listButtons.map((button) => (
            <button
              key={button.command}
              type="button"
              className={`toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentFormat[button.command] ? 'bg-blue-200 border-blue-400' : 'bg-white border-gray-300'
              }`}
              onClick={() => executeCommand(button.command)}
              title={button.title}
              disabled={disabled}
              aria-label={button.title}
              aria-pressed={currentFormat[button.command]}
              data-testid={`list-${button.command}`}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* 樣式按鈕組 */}
        <div className="toolbar-group inline-flex mr-4">
          {styleButtons.map((button) => (
            <button
              key={button.command + button.icon}
              type="button"
              className="toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
              onClick={() => {
                const value = button.icon === 'H1' ? 'h1' :
                             button.icon === 'H2' ? 'h2' :
                             button.icon === 'H3' ? 'h3' : 'p';
                executeCommand(button.command, value);
              }}
              title={button.title}
              disabled={disabled}
              aria-label={button.title}
              data-testid={`style-${button.icon.toLowerCase()}`}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* 表格和特殊功能 */}
        <div className="toolbar-group inline-flex mr-4">
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
            onClick={insertTable}
            title="插入表格"
            disabled={disabled}
            aria-label="插入表格"
            data-testid="insert-table"
          >
            ⊞
          </button>
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
            onClick={insertHorizontalRule}
            title="插入分隔線"
            disabled={disabled}
            aria-label="插入分隔線"
            data-testid="insert-hr"
          >
            ―
          </button>
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
            onClick={() => {
              const url = prompt('請輸入連結網址:');
              if (url) executeCommand('createLink', url);
            }}
            title="插入連結 (Ctrl+K)"
            disabled={disabled}
            aria-label="插入連結"
            data-testid="insert-link"
          >
            🔗
          </button>
        </div>

        {/* 特殊功能按鈕 */}
        <div className="toolbar-group inline-flex">
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border border-gray-300 bg-white rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={insertTable}
            title="插入表格"
            disabled={disabled}
            aria-label="插入表格"
            data-testid="insert-table"
          >
            📊
          </button>
          
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border border-gray-300 bg-white rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={insertLink}
            title="插入連結"
            disabled={disabled}
            aria-label="插入連結"
            data-testid="insert-link"
          >
            🔗
          </button>
          
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border border-gray-300 bg-white rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => executeCommand('undo')}
            title="復原"
            disabled={disabled}
            aria-label="復原"
            data-testid="undo"
          >
            ↶
          </button>
          
          <button
            type="button"
            className="toolbar-btn px-2 py-1 mx-1 border border-gray-300 bg-white rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => executeCommand('redo')}
            title="重做"
            disabled={disabled}
            aria-label="重做"
            data-testid="redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* 編輯區域 */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={`editor-content p-4 min-h-[200px] focus:outline-none ${
          isEditorFocused ? 'ring-2 ring-blue-500' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="textbox"
        aria-multiline="true"
        aria-label="富文本編輯器"
        data-placeholder={placeholder}
        data-testid="editor-content"
        style={{
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      />

      {/* 狀態列 */}
      <div className="status-bar border-t border-gray-200 px-4 py-2 bg-gray-50 text-sm text-gray-600">
        <span data-testid="editor-status">
          {isEditorFocused ? '正在編輯' : '點擊開始編輯'}
          {disabled && ' (已禁用)'}
        </span>
      </div>
    </div>
  );
}

export default RichTextEditor;
