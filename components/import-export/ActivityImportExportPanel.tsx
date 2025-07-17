/**
 * 活動導入導出面板組件
 * 支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useRef } from 'react';

interface ActivityImportExportPanelProps {
  userId: string;
  supportedImportFormats?: string[];
  supportedExportFormats?: string[];
  enableBatchProcessing?: boolean;
  enableGeptIntegration?: boolean;
  enableMemoryScience?: boolean;
}

interface ImportResult {
  success: boolean;
  message: string;
  activitiesImported?: number;
  errors?: string[];
  geptLevels?: {
    elementary: number;
    intermediate: number;
    'high-intermediate': number;
  };
}

interface ExportOptions {
  format: 'json' | 'csv' | 'zip';
  includeProgress: boolean;
  includeGeptData: boolean;
  includeMemoryScience: boolean;
  selectedActivities: string[];
}

interface Activity {
  id: string;
  name: string;
  type: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
  memoryScience: string[];
}

export const ActivityImportExportPanel: React.FC<ActivityImportExportPanelProps> = ({
  userId,
  supportedImportFormats = ['json', 'csv', 'wordwall'],
  supportedExportFormats = ['json', 'csv', 'zip'],
  enableBatchProcessing = true,
  enableGeptIntegration = true,
  enableMemoryScience = true
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeProgress: true,
    includeGeptData: true,
    includeMemoryScience: true,
    selectedActivities: []
  });
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 'act-1',
      name: '英語基礎測驗',
      type: 'quiz',
      geptLevel: 'elementary',
      createdAt: new Date('2025-07-15'),
      status: 'published',
      memoryScience: ['主動回憶', '間隔重複']
    },
    {
      id: 'act-2',
      name: '中級閱讀理解',
      type: 'reading',
      geptLevel: 'intermediate',
      createdAt: new Date('2025-07-14'),
      status: 'draft',
      memoryScience: ['語境記憶', '邏輯推理']
    },
    {
      id: 'act-3',
      name: '高級寫作練習',
      type: 'writing',
      geptLevel: 'high-intermediate',
      createdAt: new Date('2025-07-13'),
      status: 'published',
      memoryScience: ['批判思維', '創意表達']
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      // 模擬批量導入處理
      let totalActivities = 0;
      let geptLevels = { elementary: 0, intermediate: 0, 'high-intermediate': 0 };
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 模擬文件處理
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬導入結果
        const activitiesInFile = Math.floor(Math.random() * 10) + 1;
        totalActivities += activitiesInFile;
        
        // 模擬 GEPT 等級分布
        geptLevels.elementary += Math.floor(activitiesInFile * 0.4);
        geptLevels.intermediate += Math.floor(activitiesInFile * 0.4);
        geptLevels['high-intermediate'] += Math.floor(activitiesInFile * 0.2);
        
        // 模擬一些錯誤
        if (Math.random() < 0.1) {
          errors.push(`文件 ${file.name}: 部分內容格式不正確`);
        }
      }

      const result: ImportResult = {
        success: true,
        message: `成功導入 ${totalActivities} 個活動`,
        activitiesImported: totalActivities,
        errors: errors,
        geptLevels: geptLevels
      };

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: '導入失敗：' + (error as Error).message,
        errors: ['文件格式不支援', '文件損壞或不完整']
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    if (exportOptions.selectedActivities.length === 0) {
      alert('請選擇要導出的活動');
      return;
    }

    setIsExporting(true);

    try {
      // 模擬導出處理
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬文件下載
      const selectedActivitiesData = activities.filter(act => 
        exportOptions.selectedActivities.includes(act.id)
      );

      let exportData: any = {
        activities: selectedActivitiesData,
        exportedAt: new Date().toISOString(),
        format: exportOptions.format
      };

      if (exportOptions.includeGeptData) {
        exportData.geptStatistics = {
          elementary: selectedActivitiesData.filter(a => a.geptLevel === 'elementary').length,
          intermediate: selectedActivitiesData.filter(a => a.geptLevel === 'intermediate').length,
          'high-intermediate': selectedActivitiesData.filter(a => a.geptLevel === 'high-intermediate').length
        };
      }

      if (exportOptions.includeMemoryScience) {
        exportData.memoryScienceData = {
          techniques: [...new Set(selectedActivitiesData.flatMap(a => a.memoryScience))],
          distribution: selectedActivitiesData.reduce((acc, act) => {
            act.memoryScience.forEach(technique => {
              acc[technique] = (acc[technique] || 0) + 1;
            });
            return acc;
          }, {} as Record<string, number>)
        };
      }

      // 創建下載連結
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-export-${Date.now()}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`成功導出 ${exportOptions.selectedActivities.length} 個活動`);
    } catch (error) {
      alert('導出失敗：' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleActivitySelection = (activityId: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityId)
        ? prev.selectedActivities.filter(id => id !== activityId)
        : [...prev.selectedActivities, activityId]
    }));
  };

  const selectAllActivities = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedActivities: activities.map(a => a.id)
    }));
  };

  const clearSelection = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedActivities: []
    }));
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGeptLevelName = (level: string) => {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6" data-testid="activity-import-export-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="import-tab"
        >
          📥 導入活動
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="export-tab"
        >
          📤 導出活動
        </button>
      </div>

      {/* 導入標籤內容 */}
      {activeTab === 'import' && (
        <div data-testid="import-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">導入活動</h3>
          
          {/* 支持格式說明 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">支持的導入格式：</h4>
            <div className="flex flex-wrap gap-2">
              {supportedImportFormats.map(format => (
                <span
                  key={format}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {format.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* 文件上傳區域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple={enableBatchProcessing}
              accept=".json,.csv,.wordwall"
              onChange={(e) => e.target.files && handleImport(e.target.files)}
              className="hidden"
              data-testid="file-input"
            />
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-4">
              {enableBatchProcessing ? '拖拽文件到此處或點擊選擇多個文件' : '拖拽文件到此處或點擊選擇文件'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              data-testid="select-files-button"
            >
              {isImporting ? '導入中...' : '選擇文件'}
            </button>
          </div>

          {/* 導入結果 */}
          {importResult && (
            <div className={`rounded-lg p-4 mb-4 ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                importResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                導入結果
              </h4>
              <p className={`mb-2 ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </p>
              
              {importResult.success && importResult.geptLevels && enableGeptIntegration && (
                <div className="mt-3">
                  <h5 className="font-medium text-green-900 mb-2">GEPT 等級分布：</h5>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-700">初級: {importResult.geptLevels.elementary}</span>
                    <span className="text-green-700">中級: {importResult.geptLevels.intermediate}</span>
                    <span className="text-green-700">中高級: {importResult.geptLevels['high-intermediate']}</span>
                  </div>
                </div>
              )}
              
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-orange-900 mb-2">警告：</h5>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 導出標籤內容 */}
      {activeTab === 'export' && (
        <div data-testid="export-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">導出活動</h3>
          
          {/* 導出選項 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">導出選項</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">導出格式：</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  data-testid="export-format-select"
                >
                  {supportedExportFormats.map(format => (
                    <option key={format} value={format}>{format.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeProgress}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeProgress: e.target.checked }))}
                    className="mr-2"
                    data-testid="include-progress-checkbox"
                  />
                  <span className="text-sm text-gray-700">包含學習進度</span>
                </label>
                {enableGeptIntegration && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeGeptData}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeGeptData: e.target.checked }))}
                      className="mr-2"
                      data-testid="include-gept-checkbox"
                    />
                    <span className="text-sm text-gray-700">包含 GEPT 數據</span>
                  </label>
                )}
                {enableMemoryScience && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMemoryScience}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeMemoryScience: e.target.checked }))}
                      className="mr-2"
                      data-testid="include-memory-science-checkbox"
                    />
                    <span className="text-sm text-gray-700">包含記憶科學數據</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 活動選擇 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">選擇要導出的活動</h4>
              <div className="space-x-2">
                <button
                  onClick={selectAllActivities}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  data-testid="select-all-button"
                >
                  全選
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  data-testid="clear-selection-button"
                >
                  清除
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportOptions.selectedActivities.includes(activity.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleActivitySelection(activity.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.selectedActivities.includes(activity.id)}
                        onChange={() => toggleActivitySelection(activity.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">{activity.name}</h5>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>類型: {activity.type}</span>
                          <span>•</span>
                          <span>創建: {activity.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(activity.geptLevel)}`}>
                        {getGeptLevelName(activity.geptLevel)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  {enableMemoryScience && activity.memoryScience.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activity.memoryScience.map((technique, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 導出按鈕 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              已選擇 {exportOptions.selectedActivities.length} 個活動
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || exportOptions.selectedActivities.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              data-testid="export-button"
            >
              {isExporting ? '導出中...' : '開始導出'}
            </button>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 導入：支持 JSON、CSV、Wordwall 格式，自動檢測 GEPT 等級和記憶科學元素</p>
          <p>• 導出：可選擇多種格式，包含完整的學習數據和進度信息</p>
          <p>• 批量處理：支持同時處理多個文件，提高工作效率</p>
          <p>• GEPT 整合：自動分析和保持 GEPT 等級信息</p>
          <p>• 記憶科學：保留間隔重複、主動回憶等記憶科學設置</p>
        </div>
      </div>
    </div>
  );
};
