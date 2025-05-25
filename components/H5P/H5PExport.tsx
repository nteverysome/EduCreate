import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DownloadIcon } from '@heroicons/react/24/outline';

interface H5PExportProps {
  contentId: string;
  title?: string;
  className?: string;
}

/**
 * H5P內容導出組件
 * 提供用戶導出H5P內容的界面
 */
export default function H5PExport({ contentId, title, className = '' }: H5PExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  // 處理導出H5P內容
  const handleExport = async () => {
    if (!contentId || isExporting) return;

    setIsExporting(true);
    try {
      // 調用導出API
      const response = await fetch('/api/h5p/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '導出失敗');
      }

      // 獲取blob數據
      const blob = await response.blob();
      
      // 創建下載鏈接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title || 'h5p-content'}.h5p`;
      document.body.appendChild(a);
      
      // 觸發下載
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('H5P內容導出成功');
    } catch (error) {
      console.error('導出H5P內容失敗:', error);
      toast.error(error instanceof Error ? error.message : '導出H5P內容失敗');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="導出H5P內容"
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
          <DownloadIcon className="-ml-0.5 mr-2 h-4 w-4" />
          導出H5P
        </>
      )}
    </button>
  );
}