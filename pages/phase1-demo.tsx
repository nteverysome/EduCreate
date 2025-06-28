/**
 * 第一階段演示頁面 - wordwall.net 核心功能實現
 * 展示自動保存、活動管理、模板切換和內容驗證功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ActivityManager from '../components/content/ActivityManager';
import EnhancedUniversalContentEditor from '../components/content/EnhancedUniversalContentEditor';
import GameSwitcher from '../components/content/GameSwitcher';
import Phase1FeatureDemo from '../components/demo/Phase1FeatureDemo';
import { UniversalContent, GameType } from '../lib/content/UniversalContentManager';
import { TemplateManager } from '../lib/content/TemplateManager';

type ViewMode = 'manager' | 'editor' | 'game' | 'demo';

export default function Phase1Demo() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('manager');
  const [currentActivity, setCurrentActivity] = useState<UniversalContent | null>(null);
  const [currentGameType, setCurrentGameType] = useState<GameType>('quiz');
  const [adaptedContent, setAdaptedContent] = useState<any>(null);

  // 從 URL 參數恢復狀態
  useEffect(() => {
    const { mode, activityId, gameType } = router.query;
    
    if (mode === 'editor' && activityId) {
      // 加載活動並切換到編輯器
      loadActivity(activityId as string);
    } else if (mode === 'game' && gameType) {
      setCurrentGameType(gameType as GameType);
      setViewMode('game');
    }
  }, [router.query]);

  const loadActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/universal-content/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        setCurrentActivity(activity);
        setViewMode('editor');
      }
    } catch (error) {
      console.error('加載活動失敗:', error);
    }
  };

  const handleCreateNew = () => {
    setCurrentActivity(null);
    setViewMode('editor');
    
    // 更新 URL
    router.push('/phase1-demo?mode=editor', undefined, { shallow: true });
  };

  const handleActivitySelect = (activity: UniversalContent) => {
    setCurrentActivity(activity);
    setViewMode('editor');
    
    // 更新 URL
    router.push(`/phase1-demo?mode=editor&activityId=${activity.id}`, undefined, { shallow: true });
  };

  const handleGameSelect = (gameType: GameType, gameContent: any) => {
    setCurrentGameType(gameType);
    setAdaptedContent(gameContent);
    setViewMode('game');
    
    // 更新 URL
    router.push(`/phase1-demo?mode=game&gameType=${gameType}`, undefined, { shallow: true });
  };

  const handleGameTypeChange = (gameType: GameType, gameContent: any) => {
    setCurrentGameType(gameType);
    setAdaptedContent(gameContent);
    
    // 更新 URL
    router.push(`/phase1-demo?mode=game&gameType=${gameType}`, undefined, { shallow: true });
  };

  const handleBackToManager = () => {
    setViewMode('manager');
    setCurrentActivity(null);
    
    // 更新 URL
    router.push('/phase1-demo', undefined, { shallow: true });
  };

  const handleBackToEditor = () => {
    setViewMode('editor');
    
    // 更新 URL
    router.push(`/phase1-demo?mode=editor&activityId=${currentActivity?.id}`, undefined, { shallow: true });
  };

  const handleSave = async (content: UniversalContent) => {
    try {
      const method = content.id.startsWith('activity_') ? 'POST' : 'PUT';
      const url = method === 'POST' 
        ? '/api/universal-content' 
        : `/api/universal-content/${content.id}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (response.ok) {
        const savedActivity = await response.json();
        setCurrentActivity(savedActivity);
        alert('活動保存成功！');
      } else {
        throw new Error('保存失敗');
      }
    } catch (error) {
      console.error('保存活動失敗:', error);
      alert('保存失敗，請重試');
    }
  };

  return (
    <>
      <Head>
        <title>第一階段演示 - wordwall.net 核心功能 | EduCreate</title>
        <meta name="description" content="展示 wordwall.net 核心功能的第一階段實現" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 頂部導航 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  EduCreate - 第一階段演示
                </h1>
                <div className="ml-4 text-sm text-gray-500">
                  模仿 wordwall.net 核心功能
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* 視圖切換 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBackToManager}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📁 我的活動
                  </button>
                  <button
                    onClick={() => setViewMode('demo')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'demo'
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🎯 功能演示
                  </button>
                  {currentActivity && (
                    <button
                      onClick={handleBackToEditor}
                      className={`px-3 py-1 rounded text-sm ${
                        viewMode === 'editor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      ✏️ 編輯器
                    </button>
                  )}
                  {viewMode === 'game' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      🎮 遊戲模式
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  + 創建新活動
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="max-w-7xl mx-auto">
          {viewMode === 'demo' && (
            <Phase1FeatureDemo />
          )}

          {viewMode === 'manager' && (
            <ActivityManager
              userId="demo-user"
              onActivitySelect={handleActivitySelect}
              onCreateNew={handleCreateNew}
            />
          )}

          {viewMode === 'editor' && (
            <div className="py-6">
              <EnhancedUniversalContentEditor
                initialContent={currentActivity || undefined}
                activityId={currentActivity?.id}
                onGameSelect={handleGameSelect}
                onSave={handleSave}
              />
            </div>
          )}

          {viewMode === 'game' && currentActivity && (
            <div>
              <GameSwitcher
                content={currentActivity}
                currentGameType={currentGameType}
                onGameTypeChange={handleGameTypeChange}
                onBack={handleBackToEditor}
                onShare={() => {
                  const shareUrl = `${window.location.origin}/phase1-demo?mode=game&gameType=${currentGameType}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('分享鏈接已複製到剪貼板！');
                }}
              />
            </div>
          )}
        </div>

        {/* 功能說明 */}
        {viewMode === 'manager' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                🎯 第一階段實現的核心功能
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-medium mb-2">✨ 自動保存機制</h4>
                  <ul className="space-y-1">
                    <li>• 實時自動保存草稿</li>
                    <li>• 離線模式支持</li>
                    <li>• 錯誤恢復機制</li>
                    <li>• 版本控制</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📁 活動管理界面</h4>
                  <ul className="space-y-1">
                    <li>• 搜索和排序功能</li>
                    <li>• 網格/列表視圖</li>
                    <li>• 批量操作</li>
                    <li>• 文件夾組織</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎮 模板切換系統</h4>
                  <ul className="space-y-1">
                    <li>• 基本模板切換</li>
                    <li>• 兼容性檢查</li>
                    <li>• 遊戲選項配置</li>
                    <li>• 視覺樣式選擇</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✅ 內容驗證系統</h4>
                  <ul className="space-y-1">
                    <li>• 實時內容驗證</li>
                    <li>• 錯誤提示和建議</li>
                    <li>• 遊戲兼容性檢查</li>
                    <li>• 發布前驗證</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🚀 使用說明</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. 點擊「創建新活動」開始創建內容</li>
                  <li>2. 輸入標題和內容項目（自動保存生效）</li>
                  <li>3. 查看右側推薦遊戲並選擇遊戲類型</li>
                  <li>4. 在遊戲模式中體驗模板切換功能</li>
                  <li>5. 返回「我的活動」查看已保存的內容</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  return {
    props: {
      session,
    },
  };
};
