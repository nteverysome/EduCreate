/**
 * 第二階段演示頁面
 * 展示增強功能：豐富視覺樣式、詳細遊戲選項、完整文件夾系統等
 */

import React, { useState } from 'react';
import Head from 'next/head';
import VisualStyleSelector from '../components/content/VisualStyleSelector';
import GameOptionsConfigurator from '../components/content/GameOptionsConfigurator';
import EnhancedFolderOrganizer from '../components/content/EnhancedFolderOrganizer';
import ShareDialog from '../components/content/ShareDialog';
import ShortcutsHelpDialog from '../components/ux/ShortcutsHelpDialog';
import { VisualStyleManager } from '../lib/content/VisualStyleManager';
import { GameOptionsManager, GameOptions } from '../lib/content/GameOptionsManager';
import { GameType } from '../lib/content/UniversalContentManager';
import { KeyboardShortcuts } from '../lib/ux/KeyboardShortcuts';
import { PerformanceMonitor } from '../lib/ux/PerformanceMonitor';

type DemoMode = 'overview' | 'styles' | 'options' | 'folders' | 'sharing' | 'ux';

export default function Phase2Demo() {
  const [activeMode, setActiveMode] = useState<DemoMode>('overview');
  const [selectedStyleId, setSelectedStyleId] = useState('classic');
  const [selectedGameType, setSelectedGameType] = useState<GameType>('quiz');
  const [gameOptions, setGameOptions] = useState<GameOptions | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showOptionsConfigurator, setShowOptionsConfigurator] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  const demoModes = [
    { id: 'overview', name: '功能概覽', icon: '📋', description: '第二階段新功能總覽' },
    { id: 'styles', name: '視覺樣式', icon: '🎨', description: '30+ 豐富主題樣式' },
    { id: 'options', name: '遊戲選項', icon: '⚙️', description: '詳細遊戲配置選項' },
    { id: 'folders', name: '文件夾系統', icon: '📁', description: '完整文件夾組織功能' },
    { id: 'sharing', name: '分享功能', icon: '🔗', description: '公開分享和嵌入' },
    { id: 'ux', name: '用戶體驗', icon: '✨', description: '界面和性能優化' }
  ];

  const phase2Features = [
    {
      category: '視覺樣式系統',
      icon: '🎨',
      features: [
        '30+ 精美主題樣式',
        '6大樣式類別（經典、現代、趣味、專業、主題、季節）',
        '完整顏色調色板配置',
        '字體和動畫效果選擇',
        '實時預覽和應用',
        '自定義 CSS 變量生成'
      ]
    },
    {
      category: '詳細遊戲選項',
      icon: '⚙️',
      features: [
        '計時器配置（正計時、倒計時、每題計時）',
        '計分系統（積分、百分比、星級、自定義）',
        '生命值機制和難度調節',
        '音效和視覺效果設置',
        '無障礙功能支持',
        '遊戲特定選項配置'
      ]
    },
    {
      category: '完整文件夾系統',
      icon: '📁',
      features: [
        '無限嵌套文件夾結構',
        '拖拽移動和組織',
        '批量操作（移動、複製、刪除）',
        '文件夾分享和權限控制',
        '搜索和統計功能',
        '文件夾樹狀視圖'
      ]
    },
    {
      category: '分享和嵌入',
      icon: '🔗',
      features: [
        '公開分享鏈接生成',
        '嵌入代碼自動生成',
        '權限控制（查看、編輯、複製）',
        '分享統計和分析',
        '過期時間設置',
        '社交媒體分享'
      ]
    },
    {
      category: '用戶體驗優化',
      icon: '✨',
      features: [
        '響應式設計優化',
        '快捷鍵支持',
        '加載性能提升',
        '無障礙功能增強',
        '多語言支持',
        '離線功能改進'
      ]
    },
    {
      category: '高級內容管理',
      icon: '📊',
      features: [
        '內容模板系統',
        '批量導入/導出',
        '內容版本控制',
        '協作編輯功能',
        '內容標籤和分類',
        '智能推薦系統'
      ]
    }
  ];

  // 應用視覺樣式
  const applyVisualStyle = (styleId: string) => {
    setSelectedStyleId(styleId);
    const style = VisualStyleManager.getStyle(styleId);
    if (style) {
      const cssVariables = VisualStyleManager.generateCSSVariables(style);
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  };

  // 應用遊戲選項
  const applyGameOptions = (options: GameOptions) => {
    setGameOptions(options);
    console.log('應用遊戲選項:', options);
  };

  // 初始化快捷鍵和性能監控
  React.useEffect(() => {
    KeyboardShortcuts.initialize();
    KeyboardShortcuts.setContext('demo');

    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.startMonitoring();

    // 監聽快捷鍵事件
    const handleShortcutHelp = () => setShowShortcutsHelp(true);
    window.addEventListener('shortcut:show-help', handleShortcutHelp);

    // 定期更新性能報告
    const updatePerformance = () => {
      const report = performanceMonitor.getPerformanceReport();
      setPerformanceReport(report);
    };

    updatePerformance();
    const performanceInterval = setInterval(updatePerformance, 5000);

    return () => {
      performanceMonitor.stopMonitoring();
      window.removeEventListener('shortcut:show-help', handleShortcutHelp);
      clearInterval(performanceInterval);
    };
  }, []);

  return (
    <>
      <Head>
        <title>第二階段演示 - 增強功能 | EduCreate</title>
        <meta name="description" content="展示第二階段的增強功能和用戶體驗優化" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 頂部導航 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  🚀 第二階段演示
                </h1>
                <div className="ml-4 text-sm text-gray-500">
                  增強功能和用戶體驗優化
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-green-600 font-medium">
                  ✅ 第一階段完成
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  🚧 第二階段開發中
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 模式選擇標籤 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {demoModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as DemoMode)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeMode === mode.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{mode.icon}</span>
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeMode === 'overview' && (
            <div>
              {/* 歡迎區域 */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  🎉 歡迎來到第二階段
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  在第一階段成功實現核心功能的基礎上，第二階段專注於增強功能和用戶體驗優化，
                  讓 EduCreate 成為更加完善和專業的教育遊戲平台。
                </p>
              </div>

              {/* 功能展示網格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {phase2Features.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">{category.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                    </div>
                    
                    <ul className="space-y-2">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 快速操作 */}
              <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🚀 快速體驗
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveMode('styles')}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    🎨 體驗視覺樣式
                  </button>
                  <button
                    onClick={() => setActiveMode('options')}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    ⚙️ 配置遊戲選項
                  </button>
                  <button
                    onClick={() => setActiveMode('folders')}
                    className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    📁 管理文件夾
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'styles' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎨 視覺樣式系統</h2>
                    <p className="text-gray-600 mt-1">選擇和預覽 30+ 精美主題樣式</p>
                  </div>
                  <button
                    onClick={() => setShowStyleSelector(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    選擇樣式
                  </button>
                </div>

                {/* 當前樣式展示 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">當前樣式</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-lg mr-4" style={{ 
                        background: `linear-gradient(135deg, var(--color-primary, #3B82F6), var(--color-secondary, #64748B))` 
                      }}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedStyleId}</h4>
                        <p className="text-sm text-gray-600">當前應用的視覺樣式</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 樣式特性展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">顏色系統</h4>
                    <p className="text-sm opacity-90">完整的顏色調色板配置</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">字體樣式</h4>
                    <p className="text-sm opacity-90">多種字體和排版選擇</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">動畫效果</h4>
                    <p className="text-sm opacity-90">豐富的過渡和動畫</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">響應式設計</h4>
                    <p className="text-sm opacity-90">適配所有設備尺寸</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'options' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">⚙️ 遊戲選項配置</h2>
                    <p className="text-gray-600 mt-1">為每種遊戲類型配置詳細選項</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedGameType}
                      onChange={(e) => setSelectedGameType(e.target.value as GameType)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="quiz">Quiz 測驗</option>
                      <option value="matching">Matching 配對</option>
                      <option value="flashcards">Flashcards 單字卡</option>
                      <option value="spin-wheel">Spin Wheel 轉盤</option>
                      <option value="whack-a-mole">Whack-a-mole 打地鼠</option>
                      <option value="memory-cards">Memory Cards 記憶卡</option>
                    </select>
                    <button
                      onClick={() => setShowOptionsConfigurator(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      配置選項
                    </button>
                  </div>
                </div>

                {/* 選項類別展示 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: '計時器', icon: '⏱️', desc: '正計時、倒計時、每題計時' },
                    { name: '計分', icon: '🏆', desc: '積分、百分比、星級評分' },
                    { name: '生命值', icon: '❤️', desc: '生命值機制和難度調節' },
                    { name: '音效', icon: '🔊', desc: '背景音樂和音效設置' },
                    { name: '視覺', icon: '✨', desc: '動畫和粒子效果' },
                    { name: '無障礙', icon: '♿', desc: '高對比度和大字體' },
                    { name: '遊戲玩法', icon: '🎮', desc: '隨機化和提示設置' },
                    { name: '特殊選項', icon: '⚙️', desc: '遊戲特定配置' }
                  ].map((category, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h4 className="font-medium text-gray-900 mb-1">{category.name}</h4>
                      <p className="text-xs text-gray-600">{category.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 當前配置預覽 */}
                {gameOptions && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">當前配置預覽</h3>
                    <div className="text-sm text-blue-700">
                      <p>計時器: {gameOptions.timer.type}</p>
                      <p>計分: {gameOptions.scoring.type}</p>
                      <p>音效: {gameOptions.audio.soundEffects?.enabled ? '啟用' : '禁用'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMode === 'folders' && (
            <div>
              <EnhancedFolderOrganizer
                userId="demo-user"
                showStats={true}
                allowBulkOperations={true}
                maxDepth={10}
              />
            </div>
          )}

          {activeMode === 'sharing' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🔗 分享和嵌入功能</h2>
                    <p className="text-gray-600 mt-1">公開分享活動，生成嵌入代碼</p>
                  </div>
                  <button
                    onClick={() => setShowShareDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    體驗分享功能
                  </button>
                </div>

                {/* 分享功能特性 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🔗 公開分享</h4>
                    <p className="text-sm text-blue-700">生成分享鏈接，任何人都可以訪問</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">📋 嵌入代碼</h4>
                    <p className="text-sm text-green-700">生成響應式嵌入代碼，集成到網站</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">📱 社交分享</h4>
                    <p className="text-sm text-purple-700">一鍵分享到各大社交媒體平台</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">📊 分享統計</h4>
                    <p className="text-sm text-orange-700">詳細的訪問和使用統計數據</p>
                  </div>
                </div>

                {/* 分享設置選項 */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">分享設置選項</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>權限控制</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>密碼保護</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>過期時間</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>訪問限制</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'ux' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">✨ 用戶體驗優化</h2>
                    <p className="text-gray-600 mt-1">快捷鍵、性能監控、無障礙功能</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowShortcutsHelp(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      查看快捷鍵
                    </button>
                  </div>
                </div>

                {/* 用戶體驗功能 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">⌨️ 鍵盤快捷鍵</h3>
                    <p className="text-purple-700 mb-4">提供全面的鍵盤快捷鍵支持，提升操作效率</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>顯示幫助</span>
                        <kbd className="px-2 py-1 bg-purple-200 rounded">Ctrl + Shift + ?</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>搜索</span>
                        <kbd className="px-2 py-1 bg-purple-200 rounded">Ctrl + K</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>保存</span>
                        <kbd className="px-2 py-1 bg-purple-200 rounded">Ctrl + S</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">📊 性能監控</h3>
                    <p className="text-green-700 mb-4">實時監控應用性能，提供優化建議</p>
                    {performanceReport && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>性能分數</span>
                          <span className={`font-bold ${
                            performanceReport.score >= 80 ? 'text-green-600' :
                            performanceReport.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {performanceReport.score}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>頁面加載</span>
                          <span>{Math.round(performanceReport.metrics.pageLoad?.loadComplete || 0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>內存使用</span>
                          <span>{Math.round(performanceReport.metrics.runtime?.memoryUsage || 0)}MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 無障礙功能 */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">♿ 無障礙功能</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>鍵盤導航</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>屏幕閱讀器</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>高對比度</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>大字體模式</span>
                    </div>
                  </div>
                </div>

                {/* 性能優化建議 */}
                {performanceReport && performanceReport.recommendations.length > 0 && (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">💡 優化建議</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {performanceReport.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 視覺樣式選擇器 */}
        {showStyleSelector && (
          <VisualStyleSelector
            currentStyleId={selectedStyleId}
            onStyleChange={applyVisualStyle}
            onClose={() => setShowStyleSelector(false)}
          />
        )}

        {/* 遊戲選項配置器 */}
        {showOptionsConfigurator && (
          <GameOptionsConfigurator
            gameType={selectedGameType}
            currentOptions={gameOptions || undefined}
            onOptionsChange={applyGameOptions}
            onClose={() => setShowOptionsConfigurator(false)}
          />
        )}

        {/* 分享對話框 */}
        {showShareDialog && (
          <ShareDialog
            activityId="demo-activity"
            activityTitle="水果詞彙學習"
            activityDescription="學習各種水果的名稱和特徵"
            onClose={() => setShowShareDialog(false)}
          />
        )}

        {/* 快捷鍵幫助對話框 */}
        <ShortcutsHelpDialog
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </div>
    </>
  );
}
