/**
 * 遊戲切換器 - 模仿 wordwall.net 的遊戲切換功能
 * 允許用戶在不同遊戲類型間無縫切換，保持內容一致
 */

import React, { useState, useEffect } from 'react';
// 使用簡單的文字圖標替代 lucide-react
const ArrowLeft = () => <span>←</span>;
const RotateCcw = () => <span>🔄</span>;
const Settings = () => <span>⚙️</span>;
const Share2 = () => <span>📤</span>;
const Play = () => <span>▶️</span>;
const Pause = () => <span>⏸️</span>;
const SkipForward = () => <span>⏭️</span>;
import { UniversalContent, GameType, UniversalContentManager } from '../../lib/content/UniversalContentManager';
import { GameAdapters } from '../../lib/content/GameAdapters';
import { TemplateManager } from '../../lib/content/TemplateManager';

interface GameSwitcherProps {
  content: UniversalContent;
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType, adaptedContent: any) => void;
  onBack?: () => void;
  onShare?: () => void;
}

export default function GameSwitcher({
  content,
  currentGameType,
  onGameTypeChange,
  onBack,
  onShare
}: GameSwitcherProps) {
  const [contentManager] = useState(() => new UniversalContentManager());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [gameStats, setGameStats] = useState<any>(null);

  useEffect(() => {
    contentManager.setContent(content);
    const stats = GameAdapters.getGameStats(content, currentGameType);
    setGameStats(stats);
  }, [content, currentGameType, contentManager]);

  // 使用 TemplateManager 獲取可用遊戲和推薦
  const availableGames = TemplateManager.getAllTemplates();
  const recommendedGames = TemplateManager.getRecommendedTemplates(content.items.length);
  const currentTemplate = TemplateManager.getTemplate(currentGameType);
  const currentGameConfig = contentManager.getGameConfig(currentGameType);

  const switchGame = async (newGameType: GameType) => {
    try {
      // 檢查內容兼容性
      if (!TemplateManager.isContentCompatible(newGameType, content.items.length)) {
        const template = TemplateManager.getTemplate(newGameType);
        alert(`內容不兼容 ${template?.name} 遊戲。需要 ${template?.minItems}-${template?.maxItems} 個項目，當前有 ${content.items.length} 個。`);
        return;
      }

      // 如果有活動 ID，調用模板切換 API
      if (content.id && content.id !== 'demo-content') {
        const response = await fetch(`/api/universal-content/${content.id}/switch-template`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: newGameType })
        });

        if (!response.ok) {
          throw new Error('模板切換 API 調用失敗');
        }
      }

      const adaptedContent = GameAdapters.adaptContent(content, newGameType);
      onGameTypeChange(newGameType, adaptedContent);
      setShowGameMenu(false);
      setIsPlaying(false);
    } catch (error) {
      console.error('遊戲切換失敗:', error);
      alert('無法切換到此遊戲類型，請檢查內容是否兼容');
    }
  };

  const restartGame = () => {
    try {
      const adaptedContent = GameAdapters.adaptContent(content, currentGameType);
      onGameTypeChange(currentGameType, adaptedContent);
      setIsPlaying(false);
    } catch (error) {
      console.error('重新開始失敗:', error);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      {/* 主要控制欄 */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* 左側：返回和遊戲信息 */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回編輯
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentGameConfig.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {currentGameConfig.name}
              </h2>
              <p className="text-sm text-gray-600">
                {content.title} • {content.items.length} 項目
              </p>
            </div>
          </div>
        </div>

        {/* 中間：遊戲控制 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={restartGame}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="重新開始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={togglePlay}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isPlaying 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                暫停
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                開始
              </>
            )}
          </button>
        </div>

        {/* 右側：設置和分享 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGameMenu(!showGameMenu)}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            切換遊戲
          </button>
          
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </button>
          )}
          
          <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 遊戲統計信息欄 */}
      {gameStats && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>項目數量: <strong>{gameStats.itemCount}</strong></span>
              <span>預估時間: <strong>{gameStats.estimatedDuration}</strong></span>
              <span>難度: <strong>{gameStats.difficulty}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              {gameStats.features.map((feature: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 遊戲選擇菜單 */}
      {showGameMenu && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold mb-4">選擇遊戲類型</h3>
            
            {/* 推薦遊戲 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">推薦遊戲</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => switchGame(game.id)}
                    className={`flex items-center p-4 border rounded-lg text-left transition-colors ${
                      game.id === currentGameType
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mr-3">{game.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-600">{game.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {game.estimatedTime} • {game.difficulty}
                      </div>
                    </div>
                    {game.id === currentGameType && (
                      <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 所有可用遊戲 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                所有可用遊戲 ({availableGames.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {availableGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => switchGame(game.id)}
                    className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
                      game.id === currentGameType
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    title={game.description}
                  >
                    <span className="text-2xl mb-2">{game.icon}</span>
                    <div className="text-sm font-medium text-center">{game.name}</div>
                    <div className="text-xs text-gray-500 text-center">{game.difficulty}</div>
                    {game.id === currentGameType && (
                      <div className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 關閉按鈕 */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowGameMenu(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 遮罩層 */}
      {showGameMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowGameMenu(false)}
        />
      )}
    </div>
  );
}
