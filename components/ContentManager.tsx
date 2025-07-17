import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './PerformanceOptimizer';
interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  content: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: any;
  changes: string;
  createdAt: string;
  createdBy: string;
}
export default function ContentManager() {
  const [templates, setTemplates] = useLocalStorage<ContentTemplate[]>('content_templates', []);
  const [versions, setVersions] = useLocalStorage<ContentVersion[]>('content_versions', []);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  // 創建新模板
  const createTemplate = (templateData: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ContentTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, newTemplate]);
    createVersion(newTemplate.id, newTemplate.content, '創建模板');
  };
  // 更新模板
  const updateTemplate = (templateId: string, updates: Partial<ContentTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    ));
    if (updates.content) {
      createVersion(templateId, updates.content, '更新內容');
    }
  };
  // 創建版本記錄
  const createVersion = (contentId: string, content: any, changes: string) => {
    const existingVersions = versions.filter(v => v.contentId === contentId);
    const newVersion: ContentVersion = {
      id: `version-${Date.now()}`,
      contentId,
      version: existingVersions.length + 1,
      content: JSON.parse(JSON.stringify(content)),
      changes,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    setVersions(prev => [...prev, newVersion]);
  };
  // 恢復到指定版本
  const restoreVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      updateTemplate(version.contentId, { content: version.content });
    }
  };
  // 批量導入
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.name && item.content) {
            createTemplate({
              name: item.name,
              description: item.description || '',
              type: item.type || 'quiz',
              content: item.content,
              tags: item.tags || []
            });
          }
        });
        setShowImportModal(false);
        setImportData('');
      }
    } catch (error) {
      alert('導入失敗：JSON 格式錯誤');
    }
  };
  // 批量導出
  const handleExport = () => {
    const exportData = templates.map(template => ({
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
      tags: template.tags
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // 複製模板
  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      createTemplate({
        name: `${template.name} (副本)`,
        description: template.description,
        type: template.type,
        content: template.content,
        tags: template.tags
      });
    }
  };
  // 刪除模板
  const deleteTemplate = (templateId: string) => {
    if (confirm('確定要刪除這個模板嗎？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setVersions(prev => prev.filter(v => v.contentId !== templateId));
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📚 內容管理</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📥 批量導入
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            📤 批量導出
          </button>
          <button
            onClick={() => createTemplate({
              name: '新模板',
              description: '',
              type: 'quiz',
              content: {},
              tags: []
            })}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            ➕ 新建模板
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 模板列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">模板庫</h2>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>還沒有內容模板</p>
                <p className="text-sm">創建第一個模板開始吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>類型: {template.type}</span>
                          <span>更新: {new Date(template.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          📋
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 詳細信息和版本歷史 */}
        <div>
          {selectedTemplate ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">模板詳情</h2>
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📜 版本歷史
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模板名稱
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => updateTemplate(selectedTemplate.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={selectedTemplate.description}
                    onChange={(e) => updateTemplate(selectedTemplate.id, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    標籤 (用逗號分隔)
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.tags.join(', ')}
                    onChange={(e) => updateTemplate(selectedTemplate.id, { 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              {showVersionHistory && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">版本歷史</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {versions
                      .filter(v => v.contentId === selectedTemplate.id)
                      .sort((a, b) => b.version - a.version)
                      .map(version => (
                        <div
                          key={version.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <div className="text-sm font-medium">v{version.version}</div>
                            <div className="text-xs text-gray-600">{version.changes}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(version.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => restoreVersion(version.id)}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            恢復
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">👈</div>
              <p>選擇一個模板查看詳情</p>
            </div>
          )}
        </div>
      </div>
      {/* 導入模態框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">批量導入模板</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON 數據
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder='[{"name": "模板名稱", "description": "描述", "type": "quiz", "content": {...}, "tags": ["標籤1", "標籤2"]}]'
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  導入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
