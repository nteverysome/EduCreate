/**
 * GEPTTemplateManager - GEPT模板管理組件
 * 支持模板創建、編輯、應用和GEPT分級驗證
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GEPTManager, ContentTemplate, GEPTLevel, ValidationResult } from '../../lib/gept/GEPTManager';

export interface GEPTTemplateManagerProps {
  onTemplateApply?: (content: string) => void;
  onValidationResult?: (result: ValidationResult) => void;
  className?: string;
  'data-testid'?: string;
}

export default function GEPTTemplateManager({
  onTemplateApply,
  onValidationResult,
  className = '',
  'data-testid': testId = 'gept-template-manager'
}: GEPTTemplateManagerProps) {
  const [geptManager] = useState(() => new GEPTManager());
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GEPTLevel>('elementary');
  const [selectedType, setSelectedType] = useState<ContentTemplate['type']>('vocabulary');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'validate'>('browse');

  // 新模板表單狀態
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    level: 'elementary' as GEPTLevel,
    type: 'vocabulary' as ContentTemplate['type'],
    description: '',
    template: '',
    variables: [] as string[]
  });

  // 載入模板
  useEffect(() => {
    setTemplates(geptManager.getAllTemplates());
  }, [geptManager]);

  // 過濾模板
  const filteredTemplates = templates.filter(template => {
    return (selectedLevel === 'elementary' || template.level === selectedLevel) &&
           (selectedType === 'vocabulary' || template.type === selectedType);
  });

  // 選擇模板
  const handleTemplateSelect = useCallback((template: ContentTemplate) => {
    setSelectedTemplate(template);
    
    // 初始化變量
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setTemplateVariables(initialVariables);
    setGeneratedContent('');
    setValidationResult(null);
  }, []);

  // 更新模板變量
  const handleVariableChange = useCallback((variable: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  }, []);

  // 應用模板
  const handleApplyTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    try {
      const content = geptManager.applyTemplate(selectedTemplate.id, templateVariables);
      setGeneratedContent(content);
      onTemplateApply?.(content);
    } catch (error) {
      console.error('應用模板失敗:', error);
      alert('應用模板失敗');
    }
  }, [selectedTemplate, templateVariables, geptManager, onTemplateApply]);

  // 驗證內容
  const handleValidateContent = useCallback(() => {
    if (!generatedContent.trim()) {
      alert('請先生成內容');
      return;
    }

    const result = geptManager.validateContent(generatedContent, selectedLevel);
    setValidationResult(result);
    onValidationResult?.(result);
  }, [generatedContent, selectedLevel, geptManager, onValidationResult]);

  // 創建新模板
  const handleCreateTemplate = useCallback(() => {
    if (!newTemplate.name.trim() || !newTemplate.template.trim()) {
      alert('請填寫模板名稱和內容');
      return;
    }

    try {
      const templateId = geptManager.createTemplate({
        name: newTemplate.name,
        level: newTemplate.level,
        type: newTemplate.type,
        description: newTemplate.description,
        template: newTemplate.template,
        variables: newTemplate.variables,
        examples: []
      });

      // 重新載入模板列表
      setTemplates(geptManager.getAllTemplates());
      
      // 重置表單
      setNewTemplate({
        name: '',
        level: 'elementary',
        type: 'vocabulary',
        description: '',
        template: '',
        variables: []
      });

      alert('模板創建成功');
      setActiveTab('browse');
    } catch (error) {
      console.error('創建模板失敗:', error);
      alert('創建模板失敗');
    }
  }, [newTemplate, geptManager]);

  // 解析模板變量
  const parseTemplateVariables = useCallback((template: string) => {
    const matches = template.match(/{{(\w+)}}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.slice(2, -2)))];
  }, []);

  // 更新新模板的變量
  const handleNewTemplateChange = useCallback((field: string, value: string) => {
    setNewTemplate(prev => {
      const updated = { ...prev, [field]: value };
      
      // 如果是模板內容變更，自動解析變量
      if (field === 'template') {
        updated.variables = parseTemplateVariables(value);
      }
      
      return updated;
    });
  }, [parseTemplateVariables]);

  return (
    <div className={`gept-template-manager bg-white rounded-lg shadow-sm p-6 ${className}`} data-testid={testId}>
      {/* 標籤導航 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('browse')}
              data-testid="browse-tab"
            >
              瀏覽模板
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('create')}
              data-testid="create-tab"
            >
              創建模板
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'validate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('validate')}
              data-testid="validate-tab"
            >
              內容驗證
            </button>
          </nav>
        </div>
      </div>

      {/* 瀏覽模板標籤 */}
      {activeTab === 'browse' && (
        <div className="browse-templates">
          {/* 過濾器 */}
          <div className="filters mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GEPT級別
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as GEPTLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="level-filter"
                >
                  <option value="elementary">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="high-intermediate">中高級</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  內容類型
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ContentTemplate['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="type-filter"
                >
                  <option value="vocabulary">詞彙</option>
                  <option value="grammar">語法</option>
                  <option value="reading">閱讀</option>
                  <option value="listening">聽力</option>
                  <option value="writing">寫作</option>
                  <option value="speaking">口說</option>
                </select>
              </div>
            </div>
          </div>

          {/* 模板列表 */}
          <div className="templates-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`template-card p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateSelect(template)}
                data-testid={`template-${template.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {geptManager.getLevelName(template.level)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {geptManager.getTypeName(template.type)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="text-xs text-gray-500">
                  變量: {template.variables.join(', ') || '無'}
                </div>
              </div>
            ))}
          </div>

          {/* 模板應用區域 */}
          {selectedTemplate && (
            <div className="template-application bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">應用模板: {selectedTemplate.name}</h4>
              
              {/* 變量輸入 */}
              {selectedTemplate.variables.length > 0 && (
                <div className="variables-input mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">填寫變量</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm text-gray-600 mb-1">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={templateVariables[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`輸入 ${variable}`}
                          data-testid={`variable-${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 應用按鈕 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleApplyTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  data-testid="apply-template-btn"
                >
                  應用模板
                </button>
                
                {generatedContent && (
                  <button
                    onClick={handleValidateContent}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    data-testid="validate-content-btn"
                  >
                    驗證內容
                  </button>
                )}
              </div>

              {/* 生成的內容 */}
              {generatedContent && (
                <div className="generated-content mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">生成的內容</h5>
                  <div className="bg-white p-4 border border-gray-200 rounded">
                    <pre className="whitespace-pre-wrap text-sm" data-testid="generated-content">
                      {generatedContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 創建模板標籤 */}
      {activeTab === 'create' && (
        <div className="create-template">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">創建新模板</h3>
          
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板名稱 *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => handleNewTemplateChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入模板名稱"
                  data-testid="new-template-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => handleNewTemplateChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入模板描述"
                  data-testid="new-template-description"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GEPT級別
                </label>
                <select
                  value={newTemplate.level}
                  onChange={(e) => handleNewTemplateChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="new-template-level"
                >
                  <option value="elementary">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="high-intermediate">中高級</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  內容類型
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => handleNewTemplateChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="new-template-type"
                >
                  <option value="vocabulary">詞彙</option>
                  <option value="grammar">語法</option>
                  <option value="reading">閱讀</option>
                  <option value="listening">聽力</option>
                  <option value="writing">寫作</option>
                  <option value="speaking">口說</option>
                </select>
              </div>
            </div>

            {/* 模板內容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模板內容 *
              </label>
              <textarea
                value={newTemplate.template}
                onChange={(e) => handleNewTemplateChange('template', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入模板內容，使用 {{變量名}} 來定義變量"
                data-testid="new-template-content"
              />
              <p className="text-sm text-gray-500 mt-1">
                使用 {`{{變量名}}`} 來定義變量，例如：{`{{word}}`}、{`{{definition}}`}
              </p>
            </div>

            {/* 檢測到的變量 */}
            {newTemplate.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  檢測到的變量
                </label>
                <div className="flex flex-wrap gap-2">
                  {newTemplate.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 創建按鈕 */}
            <div className="flex justify-end">
              <button
                onClick={handleCreateTemplate}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                data-testid="create-template-btn"
              >
                創建模板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 內容驗證標籤 */}
      {activeTab === 'validate' && (
        <div className="content-validation">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">內容驗證</h3>
          
          {validationResult && (
            <div className="validation-results space-y-4">
              {/* 總體結果 */}
              <div className={`p-4 rounded-lg ${
                validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.isValid ? '✅' : '❌'}
                  </span>
                  <span className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {validationResult.isValid ? '內容驗證通過' : '內容驗證未通過'}
                  </span>
                </div>
              </div>

              {/* GEPT合規性 */}
              <div className="gept-compliance bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">GEPT合規性評估</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>目標級別:</span>
                    <span className="font-medium">{geptManager.getLevelName(validationResult.geptCompliance.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>合規分數:</span>
                    <span className={`font-medium ${
                      validationResult.geptCompliance.score >= 80 ? 'text-green-600' : 
                      validationResult.geptCompliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {validationResult.geptCompliance.score}/100
                    </span>
                  </div>
                  {validationResult.geptCompliance.issues.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">問題:</span>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {validationResult.geptCompliance.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 錯誤列表 */}
              {validationResult.errors.length > 0 && (
                <div className="errors bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">錯誤 ({validationResult.errors.length})</h4>
                  <ul className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          error.severity === 'error' ? 'bg-red-500' : 
                          error.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></span>
                        <span className="text-red-800">{error.message}</span>
                        {error.suggestion && (
                          <div className="ml-4 text-red-600">建議: {error.suggestion}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 警告列表 */}
              {validationResult.warnings.length > 0 && (
                <div className="warnings bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">警告 ({validationResult.warnings.length})</h4>
                  <ul className="space-y-2">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        <span className="text-yellow-800">{warning.message}</span>
                        <div className="ml-4 text-yellow-600">建議: {warning.suggestion}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 建議列表 */}
              {validationResult.suggestions.length > 0 && (
                <div className="suggestions bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">改進建議</h4>
                  <ul className="space-y-1">
                    {validationResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-800">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!validationResult && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>請先在「瀏覽模板」標籤中生成內容並進行驗證</p>
            </div>
          )}
        </div>
      )}

      {/* 統計信息 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">統計信息</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
            <div className="text-gray-600">總模板數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredTemplates.length}</div>
            <div className="text-gray-600">符合條件</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {geptManager.getAllGEPTWords().length}
            </div>
            <div className="text-gray-600">GEPT詞彙</div>
          </div>
        </div>
      </div>
    </div>
  );
}
