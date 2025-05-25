import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface H5PBatchExportProps {
  contentIds: string[];
  disabled?: boolean;
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

/**
 * H5P內容批量導出組件
 * 提供用戶批量導出多個H5P內容的界面
 */
export default function H5PBatchExport({ 
  contentIds, 
  disabled = false, 
  className = '',
  onExportStart,
  onExportComplete
}: H5PBatchExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  // 處理批量導出H5P內容
  const handleBatchExport = async () => {
    if (contentIds.length === 0 || isExporting || disabled) return;

    setIsExporting(true);
    onExportStart?.();

    try {
      // 調用批量導出API
      const response = await fetch('/api/h5p/batch-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '批量導出失敗');
      }

      // 獲取blob數據
      const blob = await response.blob();
      
      // 創建下載鏈接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // 使用時間戳命名文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `h5p-contents-${timestamp}.zip`;
      
      document.body.appendChild(a);
      
      // 觸發下載
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`成功導出 ${contentIds.length} 個H5P內容`);
      onExportComplete?.();
    } catch (error) {
      console.error('批量導出H5P內容失敗:', error);
      toast.error(error instanceof Error ? error.message : '批量導出H5P內容失敗');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleBatchExport}
      disabled={isExporting || disabled || contentIds.length === 0}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={`批量導出 ${contentIds.length} 個H5P內容`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          導出中...
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" />
          批量導出 ({contentIds.length})
        </>
      )}
    </button>
  );
}