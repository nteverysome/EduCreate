/**
 * 第一階段功能演示組件
 * 展示自動保存、活動管理、模板切換和內容驗證的完整集成
 */

import React, { useState, useEffect } from 'react';
import { AutoSaveManager, generateActivityId } from '../../lib/content/AutoSaveManager';
import { ContentValidator } from '../../lib/content/ContentValidator';
import { TemplateManager } from '../../lib/content/TemplateManager';
import { UniversalContent, GameType } from '../../lib/content/UniversalContentManager';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: () => Promise<void> | void;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
}

export default function Phase1FeatureDemo() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demoContent, setDemoContent] = useState<UniversalContent | null>(null);
  const [autoSaveManager, setAutoSaveManager] = useState<AutoSaveManager | null>(null);
  const [demoResults, setDemoResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: 'create-content',
      title: '1. 創建統一內容',
      description: '創建一個包含詞彙項目的統一內容對象',
      action: createDemoContent,
      status: 'pending'
    },
    {
      id: 'setup-autosave',
      title: '2. 設置自動保存',
      description: '初始化自動保存管理器並配置監聽器',
      action: setupAutoSave,
      status: 'pending'
    },
    {
      id: 'validate-content',
      title: '3. 內容驗證',
      description: '驗證內容的完整性和遊戲兼容性',
      action: validateContent,
      status: 'pending'
    },
    {
      id: 'test-templates',
      title: '4. 模板管理',
      description: '測試模板推薦和兼容性檢查',
      action: testTemplates,
      status: 'pending'
    },
    {
      id: 'trigger-autosave',
      title: '5. 觸發自動保存',
      description: '模擬內容變更並觸發自動保存',
      action: triggerAutoSave,
      status: 'pending'
    },
    {
      id: 'test-offline',
      title: '6. 離線模式測試',
      description: '測試離線存儲和恢復功能',
      action: testOfflineMode,
      status: 'pending'
    }
  ]);

  // 添加結果日誌
  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDemoResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // 更新步驟狀態
  const updateStepStatus = (stepId: string, status: DemoStep['status'], result?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, result } : step
    ));
  };

  // 1. 創建演示內容
  async function createDemoContent() {
    updateStepStatus('create-content', 'running');
    
    try {
      const content: UniversalContent = {
        id: generateActivityId(),
        title: '水果詞彙學習',
        description: '學習各種水果的名稱和特徵',
        items: [
          { id: '1', term: '蘋果', definition: '一種紅色或綠色的圓形水果，富含維生素' },
          { id: '2', term: '香蕉', definition: '一種黃色的彎曲水果，富含鉀元素' },
          { id: '3', term: '橘子', definition: '一種橙色的柑橘類水果，富含維生素C' },
          { id: '4', term: '葡萄', definition: '一種小而圓的水果，通常成串生長' },
          { id: '5', term: '草莓', definition: '一種紅色的小型水果，表面有小種子' },
          { id: '6', term: '西瓜', definition: '一種大型的綠色水果，內部是紅色果肉' }
        ],
        tags: ['水果', '詞彙', '教育'],
        language: 'zh-TW',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'demo-user'
      };

      setDemoContent(content);
      addResult(`✅ 成功創建內容: ${content.title} (${content.items.length} 個項目)`);
      updateStepStatus('create-content', 'completed', `創建了包含 ${content.items.length} 個詞彙的內容`);
    } catch (error) {
      addResult(`❌ 創建內容失敗: ${error}`);
      updateStepStatus('create-content', 'error', `錯誤: ${error}`);
    }
  }

  // 2. 設置自動保存
  async function setupAutoSave() {
    if (!demoContent) return;
    
    updateStepStatus('setup-autosave', 'running');
    
    try {
      const manager = new AutoSaveManager(demoContent.id, {
        saveDelay: 1000, // 1秒延遲用於演示
        enableOfflineMode: true
      });

      // 添加狀態監聽器
      manager.addListener((state) => {
        addResult(`🔄 自動保存狀態: ${state.status} ${state.error ? `(錯誤: ${state.error})` : ''}`);
      });

      setAutoSaveManager(manager);
      addResult(`✅ 自動保存管理器已初始化 (ID: ${demoContent.id})`);
      updateStepStatus('setup-autosave', 'completed', '自動保存管理器已配置');
    } catch (error) {
      addResult(`❌ 設置自動保存失敗: ${error}`);
      updateStepStatus('setup-autosave', 'error', `錯誤: ${error}`);
    }
  }

  // 3. 驗證內容
  async function validateContent() {
    if (!demoContent) return;
    
    updateStepStatus('validate-content', 'running');
    
    try {
      const validationResult = ContentValidator.validateContent(demoContent);
      
      addResult(`📋 內容驗證結果:`);
      addResult(`  - 是否有效: ${validationResult.isValid ? '✅' : '❌'}`);
      addResult(`  - 可以發布: ${validationResult.canPublish ? '✅' : '❌'}`);
      addResult(`  - 錯誤數量: ${validationResult.errors.length}`);
      addResult(`  - 警告數量: ${validationResult.warnings.length}`);

      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach(error => {
          addResult(`  ❌ ${error.field}: ${error.message}`);
        });
      }

      // 測試遊戲兼容性
      const gameTypes: GameType[] = ['quiz', 'matching', 'flashcards', 'memory-cards'];
      gameTypes.forEach(gameType => {
        const errors = ContentValidator.validateGameCompatibility(demoContent, gameType);
        const compatible = errors.length === 0;
        addResult(`  🎮 ${gameType}: ${compatible ? '✅ 兼容' : '❌ 不兼容'}`);
      });

      updateStepStatus('validate-content', 'completed', 
        `驗證完成: ${validationResult.isValid ? '通過' : '失敗'} (${validationResult.errors.length} 錯誤)`);
    } catch (error) {
      addResult(`❌ 內容驗證失敗: ${error}`);
      updateStepStatus('validate-content', 'error', `錯誤: ${error}`);
    }
  }

  // 4. 測試模板管理
  async function testTemplates() {
    if (!demoContent) return;
    
    updateStepStatus('test-templates', 'running');
    
    try {
      // 獲取所有模板
      const allTemplates = TemplateManager.getAllTemplates();
      addResult(`📚 可用模板數量: ${allTemplates.length}`);

      // 獲取推薦模板
      const recommendations = TemplateManager.getRecommendedTemplates(demoContent.items.length);
      addResult(`🎯 推薦模板數量: ${recommendations.length}`);
      
      recommendations.forEach(template => {
        addResult(`  - ${template.name} (${template.difficulty})`);
      });

      // 測試模板配置
      const quizConfig = TemplateManager.createConfiguration('quiz', 'classic', {
        timer: 'countDown',
        lives: 3
      });
      
      const isValidConfig = TemplateManager.validateConfiguration(quizConfig);
      addResult(`⚙️ Quiz 配置驗證: ${isValidConfig ? '✅ 有效' : '❌ 無效'}`);

      // 測試內容兼容性
      const compatibleGames = allTemplates.filter(template => 
        TemplateManager.isContentCompatible(template.id, demoContent.items.length)
      );
      
      addResult(`🎮 兼容的遊戲: ${compatibleGames.length}/${allTemplates.length}`);

      updateStepStatus('test-templates', 'completed', 
        `模板測試完成: ${recommendations.length} 個推薦, ${compatibleGames.length} 個兼容`);
    } catch (error) {
      addResult(`❌ 模板測試失敗: ${error}`);
      updateStepStatus('test-templates', 'error', `錯誤: ${error}`);
    }
  }

  // 5. 觸發自動保存
  async function triggerAutoSave() {
    if (!demoContent || !autoSaveManager) return;
    
    updateStepStatus('trigger-autosave', 'running');
    
    try {
      // 模擬內容變更
      const updatedContent = {
        ...demoContent,
        title: demoContent.title + ' (已修改)',
        updatedAt: new Date()
      };

      addResult(`📝 觸發自動保存...`);
      autoSaveManager.triggerAutoSave(updatedContent);

      // 等待自動保存完成
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 測試強制保存
      addResult(`💾 測試強制保存...`);
      await autoSaveManager.forceSave(updatedContent);

      setDemoContent(updatedContent);
      addResult(`✅ 自動保存測試完成`);
      updateStepStatus('trigger-autosave', 'completed', '自動保存和強制保存都成功');
    } catch (error) {
      addResult(`❌ 自動保存測試失敗: ${error}`);
      updateStepStatus('trigger-autosave', 'error', `錯誤: ${error}`);
    }
  }

  // 6. 測試離線模式
  async function testOfflineMode() {
    if (!demoContent || !autoSaveManager) return;
    
    updateStepStatus('test-offline', 'running');
    
    try {
      // 保存到本地存儲
      addResult(`💾 保存到本地存儲...`);
      autoSaveManager['saveToLocalStorage'](demoContent);

      // 從本地存儲恢復
      addResult(`📂 從本地存儲恢復...`);
      const restored = autoSaveManager.restoreFromLocalStorage();

      if (restored && restored.title === demoContent.title) {
        addResult(`✅ 離線存儲測試成功`);
        updateStepStatus('test-offline', 'completed', '離線存儲和恢復功能正常');
      } else {
        throw new Error('恢復的數據不匹配');
      }

      // 清理本地存儲
      autoSaveManager.clearLocalStorage();
      addResult(`🧹 本地存儲已清理`);
    } catch (error) {
      addResult(`❌ 離線模式測試失敗: ${error}`);
      updateStepStatus('test-offline', 'error', `錯誤: ${error}`);
    }
  }

  // 運行所有演示步驟
  const runAllSteps = async () => {
    setIsRunning(true);
    setDemoResults([]);
    
    // 重置所有步驟狀態
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, result: undefined })));
    
    addResult(`🚀 開始第一階段功能演示...`);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      addResult(`\n📍 執行步驟 ${i + 1}: ${step.title}`);
      
      try {
        await step.action();
        await new Promise(resolve => setTimeout(resolve, 500)); // 短暫延遲以便觀察
      } catch (error) {
        addResult(`❌ 步驟 ${i + 1} 失敗: ${error}`);
        break;
      }
    }

    addResult(`\n🎉 演示完成！`);
    setIsRunning(false);
  };

  // 運行單個步驟
  const runStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    setCurrentStep(stepIndex);
    
    addResult(`\n📍 執行步驟 ${stepIndex + 1}: ${step.title}`);
    
    try {
      await step.action();
    } catch (error) {
      addResult(`❌ 步驟執行失敗: ${error}`);
    }
  };

  // 清理資源
  useEffect(() => {
    return () => {
      if (autoSaveManager) {
        autoSaveManager.destroy();
      }
    };
  }, [autoSaveManager]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🎯 第一階段功能演示
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={runAllSteps}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium ${
                isRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? '運行中...' : '運行所有步驟'}
            </button>
            <button
              onClick={() => {
                setDemoResults([]);
                setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, result: undefined })));
              }}
              className="px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
            >
              重置
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 步驟列表 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">演示步驟</h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentStep === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !isRunning && runStep(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'running' ? 'bg-blue-100 text-blue-600' :
                        step.status === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? '✓' :
                         step.status === 'running' ? '⟳' :
                         step.status === 'error' ? '✗' :
                         index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{step.title}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                        {step.result && (
                          <div className="text-xs text-gray-500 mt-1">{step.result}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 結果日誌 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">執行日誌</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {demoResults.length === 0 ? (
                <div className="text-gray-500">點擊「運行所有步驟」開始演示...</div>
              ) : (
                demoResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 當前內容預覽 */}
        {demoContent && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">當前內容預覽</h4>
            <div className="text-sm text-gray-600">
              <div><strong>標題:</strong> {demoContent.title}</div>
              <div><strong>描述:</strong> {demoContent.description}</div>
              <div><strong>項目數量:</strong> {demoContent.items.length}</div>
              <div><strong>最後更新:</strong> {demoContent.updatedAt.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
