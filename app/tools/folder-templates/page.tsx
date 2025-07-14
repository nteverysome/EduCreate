'use client';

import React, { useState, useEffect } from 'react';
import { FolderIcon, PlusIcon, BookOpenIcon, AcademicCapIcon, BeakerIcon, GlobeAltIcon, StarIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

interface FolderTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  structure: FolderStructure[];
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
}

interface FolderStructure {
  name: string;
  description?: string;
  subfolders?: FolderStructure[];
}

const defaultTemplates: FolderTemplate[] = [
  {
    id: 'template_1',
    name: '英語學習模板',
    description: '完整的英語學習檔案夾結構，包含聽說讀寫四個技能分類',
    category: '語言學習',
    icon: 'GlobeAltIcon',
    color: 'blue',
    isDefault: true,
    usageCount: 156,
    createdAt: '2024-01-15',
    structure: [
      {
        name: '聽力練習',
        description: '聽力相關的學習活動',
        subfolders: [
          { name: '基礎聽力' },
          { name: '進階聽力' },
          { name: '聽力測驗' }
        ]
      },
      {
        name: '口說練習',
        description: '口說相關的學習活動',
        subfolders: [
          { name: '發音練習' },
          { name: '對話練習' },
          { name: '演講練習' }
        ]
      },
      {
        name: '閱讀理解',
        description: '閱讀相關的學習活動',
        subfolders: [
          { name: '短文閱讀' },
          { name: '長文閱讀' },
          { name: '閱讀測驗' }
        ]
      },
      {
        name: '寫作練習',
        description: '寫作相關的學習活動',
        subfolders: [
          { name: '基礎寫作' },
          { name: '創意寫作' },
          { name: '學術寫作' }
        ]
      }
    ]
  },
  {
    id: 'template_2',
    name: '數學課程模板',
    description: '數學課程的完整檔案夾結構，按照學習主題分類',
    category: '數學',
    icon: 'AcademicCapIcon',
    color: 'green',
    isDefault: true,
    usageCount: 89,
    createdAt: '2024-01-20',
    structure: [
      {
        name: '基礎運算',
        description: '基本數學運算練習',
        subfolders: [
          { name: '加法練習' },
          { name: '減法練習' },
          { name: '乘法練習' },
          { name: '除法練習' }
        ]
      },
      {
        name: '幾何圖形',
        description: '幾何相關的學習內容',
        subfolders: [
          { name: '平面圖形' },
          { name: '立體圖形' },
          { name: '圖形測量' }
        ]
      },
      {
        name: '應用題',
        description: '數學應用題練習',
        subfolders: [
          { name: '生活應用' },
          { name: '邏輯推理' },
          { name: '綜合練習' }
        ]
      }
    ]
  },
  {
    id: 'template_3',
    name: '科學實驗模板',
    description: '科學實驗課程的檔案夾結構，包含實驗設計和記錄',
    category: '科學',
    icon: 'BeakerIcon',
    color: 'purple',
    isDefault: true,
    usageCount: 67,
    createdAt: '2024-01-25',
    structure: [
      {
        name: '實驗設計',
        description: '實驗設計相關資料',
        subfolders: [
          { name: '假設建立' },
          { name: '變數控制' },
          { name: '實驗步驟' }
        ]
      },
      {
        name: '實驗記錄',
        description: '實驗過程記錄',
        subfolders: [
          { name: '觀察記錄' },
          { name: '數據收集' },
          { name: '結果分析' }
        ]
      },
      {
        name: '實驗報告',
        description: '實驗報告撰寫',
        subfolders: [
          { name: '報告草稿' },
          { name: '最終報告' },
          { name: '同儕評議' }
        ]
      }
    ]
  }
];

export default function FolderTemplatesPage() {
  const [templates, setTemplates] = useState<FolderTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<FolderTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '語言學習', '數學', '科學', '社會', '藝術', '體育', '其他'];

  // 過濾模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 使用模板創建檔案夾
  const handleUseTemplate = async (template: FolderTemplate) => {
    try {
      // 這裡會調用 API 創建檔案夾結構
      console.log('使用模板創建檔案夾:', template);
      
      // 更新使用次數
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ));
      
      alert(`成功使用模板 "${template.name}" 創建檔案夾結構！`);
    } catch (error) {
      console.error('創建檔案夾失敗:', error);
      alert('創建檔案夾失敗，請稍後再試');
    }
  };

  // 刪除模板
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('確定要刪除這個模板嗎？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  // 渲染檔案夾結構
  const renderFolderStructure = (folders: FolderStructure[], level = 0) => {
    return folders.map((folder, index) => (
      <div key={index} className={`ml-${level * 4}`}>
        <div className="flex items-center py-1">
          <FolderIcon className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium">{folder.name}</span>
          {folder.description && (
            <span className="text-xs text-gray-500 ml-2">- {folder.description}</span>
          )}
        </div>
        {folder.subfolders && renderFolderStructure(folder.subfolders, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="folder-templates-title">
                檔案夾模板系統
              </h1>
              <p className="mt-2 text-gray-600">
                使用預設模板快速創建檔案夾結構，或創建自己的模板
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              data-testid="create-template-button"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              創建新模板
            </button>
          </div>
        </div>

        {/* 搜索和過濾 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              data-testid="search-templates"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              data-testid="category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <RectangleStackIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">總模板數</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="total-templates">
                  {templates.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">預設模板</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="default-templates">
                  {templates.filter(t => t.isDefault).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">總使用次數</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid="total-usage">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 模板列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              data-testid={`template-card-${template.id}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                      {template.icon === 'GlobeAltIcon' && <GlobeAltIcon className={`h-6 w-6 text-${template.color}-600`} />}
                      {template.icon === 'AcademicCapIcon' && <AcademicCapIcon className={`h-6 w-6 text-${template.color}-600`} />}
                      {template.icon === 'BeakerIcon' && <BeakerIcon className={`h-6 w-6 text-${template.color}-600`} />}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  {template.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      預設
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">檔案夾結構預覽:</h4>
                  <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                    {renderFolderStructure(template.structure.slice(0, 2))}
                    {template.structure.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ...還有 {template.structure.length - 2} 個檔案夾
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>使用次數: {template.usageCount}</span>
                  <span>創建於: {template.createdAt}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    data-testid={`use-template-${template.id}`}
                  >
                    使用模板
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    data-testid={`preview-template-${template.id}`}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      data-testid={`delete-template-${template.id}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到模板</h3>
            <p className="mt-1 text-sm text-gray-500">
              嘗試調整搜索條件或創建新的模板
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
