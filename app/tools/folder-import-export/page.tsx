'use client';

import React, { useState, useRef } from 'react';
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  FolderIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

interface ImportResult {
  success: boolean;
  message: string;
  foldersImported?: number;
  activitiesImported?: number;
  errors?: string[];
}

interface ExportOptions {
  format: 'wordwall' | 'json' | 'zip';
  includeActivities: boolean;
  includeSubfolders: boolean;
  selectedFolders: string[];
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'activity';
  children?: FolderItem[];
  activityCount?: number;
}

const mockFolders: FolderItem[] = [
  {
    id: 'folder_1',
    name: '英語學習資料',
    type: 'folder',
    activityCount: 25,
    children: [
      { id: 'activity_1', name: '基礎詞彙練習', type: 'activity' },
      { id: 'activity_2', name: '語法填空', type: 'activity' },
      { id: 'subfolder_1', name: '進階練習', type: 'folder', activityCount: 8 }
    ]
  },
  {
    id: 'folder_2',
    name: '數學練習',
    type: 'folder',
    activityCount: 18,
    children: [
      { id: 'activity_3', name: '加法練習', type: 'activity' },
      { id: 'activity_4', name: '乘法表', type: 'activity' }
    ]
  },
  {
    id: 'folder_3',
    name: '科學實驗',
    type: 'folder',
    activityCount: 12,
    children: [
      { id: 'activity_5', name: '化學反應', type: 'activity' },
      { id: 'activity_6', name: '物理定律', type: 'activity' }
    ]
  }
];

export default function FolderImportExportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'wordwall',
    includeActivities: true,
    includeSubfolders: true,
    selectedFolders: []
  });
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 處理檔案導入
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬導入結果
      const result: ImportResult = {
        success: true,
        message: '檔案夾導入成功完成！',
        foldersImported: 3,
        activitiesImported: 15,
        errors: []
      };

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: '導入失敗：' + (error as Error).message,
        errors: ['檔案格式不支援', '檔案損壞或不完整']
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 處理檔案夾選擇
  const handleFolderSelection = (folderId: string) => {
    setSelectedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };

  // 處理導出
  const handleExport = async () => {
    if (selectedFolders.length === 0) {
      alert('請選擇要導出的檔案夾');
      return;
    }

    setIsExporting(true);

    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬檔案下載
      const blob = new Blob(['模擬導出數據'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folders-export-${Date.now()}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('導出成功完成！');
    } catch (error) {
      alert('導出失敗：' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // 渲染檔案夾樹
  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map(folder => (
      <div key={folder.id} className={`ml-${level * 4}`}>
        <div className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md">
          <input
            type="checkbox"
            checked={selectedFolders.includes(folder.id)}
            onChange={() => handleFolderSelection(folder.id)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid={`folder-checkbox-${folder.id}`}
          />
          <FolderIcon className="h-5 w-5 text-blue-500 mr-2" />
          <span className="flex-1 text-sm font-medium text-gray-900">
            {folder.name}
          </span>
          {folder.activityCount && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {folder.activityCount} 個活動
            </span>
          )}
        </div>
        {folder.children && renderFolderTree(folder.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="import-export-title">
            檔案夾導入導出
          </h1>
          <p className="mt-2 text-gray-600">
            支援 Wordwall 格式的檔案夾和活動導入導出功能
          </p>
        </div>

        {/* 標籤切換 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('import')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="import-tab"
              >
                <ArrowUpTrayIcon className="h-5 w-5 inline mr-2" />
                導入檔案夾
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="export-tab"
              >
                <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                導出檔案夾
              </button>
            </nav>
          </div>
        </div>

        {/* 導入標籤內容 */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              導入檔案夾和活動
            </h2>

            {/* 支援格式說明 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">支援的檔案格式</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Wordwall 格式</strong> (.wordwall, .zip) - 完整的檔案夾結構和活動</li>
                      <li><strong>JSON 格式</strong> (.json) - EduCreate 標準格式</li>
                      <li><strong>ZIP 壓縮包</strong> (.zip) - 包含多個檔案夾和活動</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 檔案上傳區域 */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".wordwall,.zip,.json"
                onChange={handleFileImport}
                className="hidden"
                data-testid="file-input"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
                data-testid="upload-area"
              >
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">
                    點擊選擇檔案或拖拽檔案到此處
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    支援 .wordwall, .zip, .json 格式，最大 50MB
                  </p>
                </div>
              </div>
            </div>

            {/* 導入進度 */}
            {isImporting && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <span className="text-yellow-800">正在導入檔案夾和活動...</span>
                </div>
              </div>
            )}

            {/* 導入結果 */}
            {importResult && (
              <div className={`p-4 rounded-lg ${
                importResult.success ? 'bg-green-50' : 'bg-red-50'
              }`} data-testid="import-result">
                <div className="flex">
                  {importResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                  )}
                  <div>
                    <h3 className={`text-sm font-medium ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResult.message}
                    </h3>
                    {importResult.success && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>已導入 {importResult.foldersImported} 個檔案夾</p>
                        <p>已導入 {importResult.activitiesImported} 個活動</p>
                      </div>
                    )}
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2 text-sm text-red-700">
                        <p>錯誤詳情：</p>
                        <ul className="list-disc list-inside mt-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 導出標籤內容 */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              導出檔案夾和活動
            </h2>

            {/* 導出選項 */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  導出格式
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    format: e.target.value as 'wordwall' | 'json' | 'zip' 
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  data-testid="export-format-select"
                >
                  <option value="wordwall">Wordwall 格式 (.wordwall)</option>
                  <option value="json">JSON 格式 (.json)</option>
                  <option value="zip">ZIP 壓縮包 (.zip)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeActivities}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeActivities: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid="include-activities-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700">包含活動內容</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSubfolders}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeSubfolders: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid="include-subfolders-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700">包含子檔案夾</span>
                </label>
              </div>
            </div>

            {/* 檔案夾選擇 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                選擇要導出的檔案夾
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                {renderFolderTree(mockFolders)}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                已選擇 {selectedFolders.length} 個檔案夾
              </p>
            </div>

            {/* 導出按鈕 */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                disabled={isExporting || selectedFolders.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="export-button"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    導出中...
                  </>
                ) : (
                  <>
                    <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                    導出檔案夾
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
