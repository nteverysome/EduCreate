/**
 * 完整5遊戲模板架構面板組件
 * Match配對、Fill-in填空、Quiz測驗、Sequence順序、Flashcard閃卡等5種記憶科學遊戲
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useCallback } from 'react';

interface FiveGamesArchitecturePanelProps {
  userId: string;
  enableUnifiedInterface?: boolean;
  enableMemoryScience?: boolean;
  enableGeptIntegration?: boolean;
  enableSmartAdaptation?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableCrossGameSync?: boolean;
  enableAccessibilitySupport?: boolean;
}

interface GameTemplate {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  memoryPrinciple: string;
  geptLevels: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  features: string[];
  isImplemented: boolean;
  demoAvailable: boolean;
}

interface GameConfig {
  gameId: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  enableHints: boolean;
  enableSound: boolean;
  enableAnimation: boolean;
  memoryScience: string[];
}

interface GameStats {
  totalPlayed: number;
  averageScore: number;
  completionRate: number;
  averageTime: number;
  popularityRank: number;
}

export const FiveGamesArchitecturePanel: React.FC<FiveGamesArchitecturePanelProps> = ({
  userId,
  enableUnifiedInterface = true,
  enableMemoryScience = true,
  enableGeptIntegration = true,
  enableSmartAdaptation = true,
  enablePerformanceMonitoring = true,
  enableCrossGameSync = true,
  enableAccessibilitySupport = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'config' | 'analytics'>('overview');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    gameId: '',
    geptLevel: 'intermediate',
    difficulty: 'medium',
    timeLimit: 300,
    enableHints: true,
    enableSound: true,
    enableAnimation: true,
    memoryScience: ['主動回憶', '間隔重複']
  });

  // 5個記憶科學遊戲模板
  const gameTemplates: GameTemplate[] = [
    {
      id: 'match',
      name: 'Match',
      displayName: 'Match配對遊戲',
      icon: '🎯',
      description: '基於視覺記憶和關聯學習的配對遊戲',
      memoryPrinciple: '視覺記憶和關聯學習',
      geptLevels: ['elementary', 'intermediate', 'high-intermediate'],
      difficulty: 'medium',
      estimatedTime: 10,
      features: ['拖拽配對', '視覺記憶', '關聯學習', '空間記憶'],
      isImplemented: true,
      demoAvailable: true
    },
    {
      id: 'fillin',
      name: 'Fill-in',
      displayName: 'Fill-in填空遊戲',
      icon: '📝',
      description: '基於主動回憶和語境記憶的填空遊戲',
      memoryPrinciple: '主動回憶和語境記憶',
      geptLevels: ['elementary', 'intermediate', 'high-intermediate'],
      difficulty: 'medium',
      estimatedTime: 15,
      features: ['主動輸入', '語境理解', '拼寫訓練', '語法應用'],
      isImplemented: true,
      demoAvailable: true
    },
    {
      id: 'quiz',
      name: 'Quiz',
      displayName: 'Quiz測驗遊戲',
      icon: '❓',
      description: '基於選擇判斷和知識檢索的測驗遊戲',
      memoryPrinciple: '選擇判斷和知識檢索',
      geptLevels: ['elementary', 'intermediate', 'high-intermediate'],
      difficulty: 'easy',
      estimatedTime: 12,
      features: ['多選題', '知識檢索', '邏輯推理', '快速反應'],
      isImplemented: true,
      demoAvailable: true
    },
    {
      id: 'sequence',
      name: 'Sequence',
      displayName: 'Sequence順序遊戲',
      icon: '🔢',
      description: '基於邏輯排序和序列記憶的順序遊戲',
      memoryPrinciple: '邏輯排序和序列記憶',
      geptLevels: ['intermediate', 'high-intermediate'],
      difficulty: 'hard',
      estimatedTime: 18,
      features: ['拖拽排序', '邏輯思維', '序列記憶', '時間順序'],
      isImplemented: true,
      demoAvailable: true
    },
    {
      id: 'flashcard',
      name: 'Flashcard',
      displayName: 'Flashcard閃卡遊戲',
      icon: '🃏',
      description: '基於間隔重複和長期記憶的閃卡遊戲',
      memoryPrinciple: '間隔重複和長期記憶',
      geptLevels: ['elementary', 'intermediate', 'high-intermediate'],
      difficulty: 'easy',
      estimatedTime: 8,
      features: ['翻卡記憶', '間隔重複', '長期記憶', '自我評估'],
      isImplemented: true,
      demoAvailable: true
    }
  ];

  // 模擬遊戲統計數據
  const gameStats: Record<string, GameStats> = {
    match: { totalPlayed: 1250, averageScore: 85, completionRate: 92, averageTime: 8.5, popularityRank: 1 },
    fillin: { totalPlayed: 980, averageScore: 78, completionRate: 88, averageTime: 12.3, popularityRank: 3 },
    quiz: { totalPlayed: 1450, averageScore: 82, completionRate: 95, averageTime: 9.8, popularityRank: 2 },
    sequence: { totalPlayed: 650, averageScore: 75, completionRate: 85, averageTime: 15.2, popularityRank: 5 },
    flashcard: { totalPlayed: 890, averageScore: 88, completionRate: 90, averageTime: 6.8, popularityRank: 4 }
  };

  const handleGameSelect = useCallback((gameId: string) => {
    setSelectedGame(gameId);
    setGameConfig(prev => ({ ...prev, gameId }));
  }, []);

  const handleStartGame = useCallback(() => {
    if (!selectedGame) {
      alert('請選擇一個遊戲');
      return;
    }

    const game = gameTemplates.find(g => g.id === selectedGame);
    if (!game) return;

    alert(`即將開始 ${game.displayName}！\n等級：${getGeptLevelName(gameConfig.geptLevel)}\n難度：${getDifficultyName(gameConfig.difficulty)}`);
  }, [selectedGame, gameConfig]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '簡單';
      case 'medium': return '中等';
      case 'hard': return '困難';
      default: return '未知';
    }
  };

  return (
    <div className="p-6" data-testid="five-games-architecture-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="overview-tab"
        >
          🎮 遊戲總覽
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'games'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="games-tab"
        >
          🎯 遊戲選擇
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="config-tab"
        >
          ⚙️ 遊戲配置
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="analytics-tab"
        >
          📊 遊戲分析
        </button>
      </div>

      {/* 遊戲總覽標籤 */}
      {activeTab === 'overview' && (
        <div data-testid="overview-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">5遊戲模板架構總覽</h3>
          
          {/* 架構統計 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameTemplates.length}</div>
                <div className="text-blue-800">遊戲類型</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {gameTemplates.filter(g => g.isImplemented).length}
                </div>
                <div className="text-green-800">已實現</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(gameStats).reduce((sum, s) => sum + s.totalPlayed, 0)}
                </div>
                <div className="text-orange-800">總遊玩次數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(Object.values(gameStats).reduce((sum, s) => sum + s.averageScore, 0) / gameTemplates.length)}
                </div>
                <div className="text-purple-800">平均分數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(Object.values(gameStats).reduce((sum, s) => sum + s.completionRate, 0) / gameTemplates.length)}%
                </div>
                <div className="text-red-800">完成率</div>
              </div>
            </div>
          </div>

          {/* 遊戲卡片展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTemplates.map(game => (
              <div key={game.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{game.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{game.displayName}</h4>
                      <div className="text-sm text-gray-600">{game.memoryPrinciple}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {game.isImplemented && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        已實現
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {game.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                      {getDifficultyName(game.difficulty)}
                    </span>
                    <span>⏱️ {game.estimatedTime}分鐘</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleGameSelect(game.id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      選擇
                    </button>
                    {game.demoAvailable && (
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                        試玩
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 遊戲選擇標籤 */}
      {activeTab === 'games' && (
        <div data-testid="games-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">遊戲選擇</h3>
          
          {/* 遊戲選擇器 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {gameTemplates.map(game => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  selectedGame === game.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                data-testid={`game-${game.id}`}
              >
                <div className="text-3xl mb-2">{game.icon}</div>
                <div className="font-medium text-sm">{game.displayName}</div>
                <div className="text-xs text-gray-600 mt-1">{game.memoryPrinciple}</div>
              </button>
            ))}
          </div>

          {/* 選中遊戲詳情 */}
          {selectedGame && (
            <div className="bg-gray-50 rounded-lg p-4">
              {(() => {
                const game = gameTemplates.find(g => g.id === selectedGame);
                if (!game) return null;
                
                return (
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-3xl">{game.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{game.displayName}</h4>
                        <div className="text-sm text-gray-600">{game.description}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">記憶科學原理：</h5>
                        <p className="text-sm text-gray-600">{game.memoryPrinciple}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">支持的GEPT等級：</h5>
                        <div className="flex flex-wrap gap-1">
                          {game.geptLevels.map(level => (
                            <span
                              key={level}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(level)}`}
                            >
                              {getGeptLevelName(level)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        預估時間：{game.estimatedTime}分鐘 | 難度：{getDifficultyName(game.difficulty)}
                      </div>
                      <button
                        onClick={handleStartGame}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        data-testid="start-game-button"
                      >
                        開始遊戲
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* 遊戲配置標籤 */}
      {activeTab === 'config' && (
        <div data-testid="config-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">遊戲配置</h3>
          
          {selectedGame ? (
            <div className="space-y-6">
              {/* GEPT等級設置 */}
              {enableGeptIntegration && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">GEPT等級設置</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['elementary', 'intermediate', 'high-intermediate'].map(level => (
                      <button
                        key={level}
                        onClick={() => setGameConfig(prev => ({ ...prev, geptLevel: level as any }))}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          gameConfig.geptLevel === level
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        data-testid={`gept-level-${level}`}
                      >
                        <div className="font-medium">{getGeptLevelName(level)}</div>
                        <div className="text-xs text-gray-600">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 難度設置 */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">難度設置</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setGameConfig(prev => ({ ...prev, difficulty: difficulty as any }))}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        gameConfig.difficulty === difficulty
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      data-testid={`difficulty-${difficulty}`}
                    >
                      <div className="font-medium">{getDifficultyName(difficulty)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 遊戲選項 */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">遊戲選項</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">時間限制（秒）</span>
                    <input
                      type="number"
                      value={gameConfig.timeLimit}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="60"
                      max="1800"
                      data-testid="time-limit"
                    />
                  </div>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">啟用提示</span>
                    <input
                      type="checkbox"
                      checked={gameConfig.enableHints}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, enableHints: e.target.checked }))}
                      className="w-4 h-4"
                      data-testid="enable-hints"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">啟用音效</span>
                    <input
                      type="checkbox"
                      checked={gameConfig.enableSound}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, enableSound: e.target.checked }))}
                      className="w-4 h-4"
                      data-testid="enable-sound"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">啟用動畫</span>
                    <input
                      type="checkbox"
                      checked={gameConfig.enableAnimation}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, enableAnimation: e.target.checked }))}
                      className="w-4 h-4"
                      data-testid="enable-animation"
                    />
                  </label>
                </div>
              </div>

              {/* 記憶科學設置 */}
              {enableMemoryScience && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">記憶科學設置</h4>
                  <div className="flex flex-wrap gap-2">
                    {['主動回憶', '間隔重複', '視覺記憶', '語境記憶', '邏輯記憶'].map(technique => (
                      <label key={technique} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={gameConfig.memoryScience.includes(technique)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGameConfig(prev => ({
                                ...prev,
                                memoryScience: [...prev.memoryScience, technique]
                              }));
                            } else {
                              setGameConfig(prev => ({
                                ...prev,
                                memoryScience: prev.memoryScience.filter(t => t !== technique)
                              }));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{technique}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              請先在「遊戲選擇」標籤中選擇一個遊戲
            </div>
          )}
        </div>
      )}

      {/* 遊戲分析標籤 */}
      {activeTab === 'analytics' && (
        <div data-testid="analytics-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">遊戲分析</h3>
          
          {/* 整體統計 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">整體統計</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(gameStats).reduce((sum, s) => sum + s.totalPlayed, 0)}
                </div>
                <div className="text-blue-800">總遊玩次數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(Object.values(gameStats).reduce((sum, s) => sum + s.averageScore, 0) / gameTemplates.length)}
                </div>
                <div className="text-green-800">平均分數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(Object.values(gameStats).reduce((sum, s) => sum + s.completionRate, 0) / gameTemplates.length)}%
                </div>
                <div className="text-orange-800">平均完成率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(Object.values(gameStats).reduce((sum, s) => sum + s.averageTime, 0) / gameTemplates.length * 10) / 10}
                </div>
                <div className="text-purple-800">平均時間（分鐘）</div>
              </div>
            </div>
          </div>

          {/* 各遊戲詳細統計 */}
          <div className="space-y-4">
            {gameTemplates.map(game => {
              const stats = gameStats[game.id];
              return (
                <div key={game.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{game.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{game.displayName}</h4>
                        <div className="text-sm text-gray-600">人氣排名：第{stats.popularityRank}名</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{stats.totalPlayed}</div>
                      <div className="text-gray-600">遊玩次數</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stats.averageScore}</div>
                      <div className="text-gray-600">平均分數</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stats.completionRate}%</div>
                      <div className="text-gray-600">完成率</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stats.averageTime}分鐘</div>
                      <div className="text-gray-600">平均時間</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Match配對：適合視覺學習者，強化記憶關聯</p>
          <p>• Fill-in填空：適合語言學習，訓練主動回憶</p>
          <p>• Quiz測驗：適合知識檢測，快速評估學習效果</p>
          <p>• Sequence順序：適合邏輯訓練，培養序列思維</p>
          <p>• Flashcard閃卡：適合長期記憶，使用間隔重複算法</p>
          <p>• 統一接口：所有遊戲共享配置和數據，無縫切換</p>
        </div>
      </div>
    </div>
  );
};
