/**
 * Match配對遊戲頁面
 * 基於記憶科學原理的配對遊戲，支持多種配對模式和智能適配
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import MatchGame from '../../../components/games/MatchGame';
import { 
  MatchGameConfig, 
  MatchGameState, 
  MatchGameResult,
  MatchPair,
  MatchItem,
  MatchMode,
  DifficultyLevel,
  GEPTLevel
} from '../../../lib/games/MatchGameManager';

export default function MatchGamePage() {
  const [gameConfig, setGameConfig] = useState<MatchGameConfig>({
    mode: 'text-text',
    difficulty: 'medium',
    geptLevel: 'intermediate',
    pairCount: 6,
    timeLimit: 120,
    allowHints: true,
    showProgress: true,
    enableSound: true,
    enableAnimation: true,
    shuffleItems: true,
    maxAttempts: undefined,
    penaltyTime: 5,
    bonusPoints: 10
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<MatchGameResult | null>(null);
  const [showConfig, setShowConfig] = useState(true);

  // 示例配對數據
  const samplePairs: MatchPair[] = [
    {
      id: 'pair1',
      leftItem: {
        id: 'left1',
        type: 'text',
        content: 'Apple',
        displayText: 'Apple',
        hint: '一種紅色或綠色的水果',
        geptLevel: 'elementary'
      },
      rightItem: {
        id: 'right1',
        type: 'text',
        content: '蘋果',
        displayText: '蘋果',
        hint: 'Apple的中文翻譯',
        geptLevel: 'elementary'
      }
    },
    {
      id: 'pair2',
      leftItem: {
        id: 'left2',
        type: 'text',
        content: 'Book',
        displayText: 'Book',
        hint: '用來閱讀的物品',
        geptLevel: 'elementary'
      },
      rightItem: {
        id: 'right2',
        type: 'text',
        content: '書',
        displayText: '書',
        hint: 'Book的中文翻譯',
        geptLevel: 'elementary'
      }
    },
    {
      id: 'pair3',
      leftItem: {
        id: 'left3',
        type: 'text',
        content: 'Computer',
        displayText: 'Computer',
        hint: '用來工作和學習的電子設備',
        geptLevel: 'intermediate'
      },
      rightItem: {
        id: 'right3',
        type: 'text',
        content: '電腦',
        displayText: '電腦',
        hint: 'Computer的中文翻譯',
        geptLevel: 'intermediate'
      }
    },
    {
      id: 'pair4',
      leftItem: {
        id: 'left4',
        type: 'text',
        content: 'Education',
        displayText: 'Education',
        hint: '學習和教學的過程',
        geptLevel: 'intermediate'
      },
      rightItem: {
        id: 'right4',
        type: 'text',
        content: '教育',
        displayText: '教育',
        hint: 'Education的中文翻譯',
        geptLevel: 'intermediate'
      }
    },
    {
      id: 'pair5',
      leftItem: {
        id: 'left5',
        type: 'text',
        content: 'Technology',
        displayText: 'Technology',
        hint: '科學和工程的應用',
        geptLevel: 'high-intermediate'
      },
      rightItem: {
        id: 'right5',
        type: 'text',
        content: '科技',
        displayText: '科技',
        hint: 'Technology的中文翻譯',
        geptLevel: 'high-intermediate'
      }
    },
    {
      id: 'pair6',
      leftItem: {
        id: 'left6',
        type: 'text',
        content: 'Innovation',
        displayText: 'Innovation',
        hint: '創新和改進的過程',
        geptLevel: 'high-intermediate'
      },
      rightItem: {
        id: 'right6',
        type: 'text',
        content: '創新',
        displayText: '創新',
        hint: 'Innovation的中文翻譯',
        geptLevel: 'high-intermediate'
      }
    }
  ];

  // 處理遊戲完成
  const handleGameComplete = useCallback((result: MatchGameResult) => {
    setGameResult(result);
    setGameStarted(false);
    console.log('遊戲完成:', result);
  }, []);

  // 處理遊戲狀態變化
  const handleGameStateChange = useCallback((state: MatchGameState) => {
    console.log('遊戲狀態更新:', state);
  }, []);

  // 開始遊戲
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setGameResult(null);
    setShowConfig(false);
  }, []);

  // 返回配置
  const handleBackToConfig = useCallback(() => {
    setGameStarted(false);
    setShowConfig(true);
  }, []);

  // 更新配置
  const updateConfig = useCallback((field: keyof MatchGameConfig, value: any) => {
    setGameConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  // 獲取當前配對數據（根據配置調整）
  const getCurrentPairs = useCallback((): MatchPair[] => {
    const filteredPairs = samplePairs.filter(pair => {
      if (gameConfig.geptLevel) {
        return pair.leftItem.geptLevel === gameConfig.geptLevel || 
               pair.rightItem.geptLevel === gameConfig.geptLevel;
      }
      return true;
    });

    return filteredPairs.slice(0, gameConfig.pairCount);
  }, [gameConfig]);

  // 獲取模式名稱
  const getModeName = (mode: MatchMode): string => {
    const names = {
      'text-text': '文字配對',
      'text-image': '文字圖片',
      'image-image': '圖片配對',
      'audio-text': '音頻文字',
      'text-audio': '文字音頻',
      'mixed': '混合模式'
    };
    return names[mode] || mode;
  };

  // 獲取難度名稱
  const getDifficultyName = (difficulty: DifficultyLevel): string => {
    const names = {
      easy: '簡單',
      medium: '中等',
      hard: '困難',
      expert: '專家'
    };
    return names[difficulty] || difficulty;
  };

  // 獲取GEPT級別名稱
  const getGEPTLevelName = (level: GEPTLevel): string => {
    const names = {
      elementary: '初級',
      intermediate: '中級',
      'high-intermediate': '中高級'
    };
    return names[level] || level;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="home-link"
              >
                ← 返回主頁
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="dashboard-link"
              >
                功能儀表板
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/games" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="games-link"
              >
                遊戲中心
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Match配對遊戲
          </h1>
          <p className="text-gray-600 text-lg">
            基於記憶科學原理的配對遊戲，挑戰你的記憶力和反應速度
          </p>
        </div>

        {/* 遊戲配置 */}
        {showConfig && !gameStarted && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8" data-testid="game-config">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">遊戲設置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 遊戲模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  遊戲模式
                </label>
                <select
                  value={gameConfig.mode}
                  onChange={(e) => updateConfig('mode', e.target.value as MatchMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="mode-select"
                >
                  <option value="text-text">文字配對</option>
                  <option value="text-image">文字圖片</option>
                  <option value="image-image">圖片配對</option>
                  <option value="audio-text">音頻文字</option>
                  <option value="mixed">混合模式</option>
                </select>
              </div>

              {/* 難度級別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  難度級別
                </label>
                <select
                  value={gameConfig.difficulty}
                  onChange={(e) => updateConfig('difficulty', e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="difficulty-select"
                >
                  <option value="easy">簡單</option>
                  <option value="medium">中等</option>
                  <option value="hard">困難</option>
                  <option value="expert">專家</option>
                </select>
              </div>

              {/* GEPT級別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GEPT級別
                </label>
                <select
                  value={gameConfig.geptLevel || ''}
                  onChange={(e) => updateConfig('geptLevel', e.target.value as GEPTLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="gept-level-select"
                >
                  <option value="">不限制</option>
                  <option value="elementary">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="high-intermediate">中高級</option>
                </select>
              </div>

              {/* 配對數量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配對數量
                </label>
                <input
                  type="number"
                  value={gameConfig.pairCount}
                  onChange={(e) => updateConfig('pairCount', parseInt(e.target.value))}
                  min="4"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="pair-count-input"
                />
              </div>

              {/* 時間限制 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時間限制（秒）
                </label>
                <input
                  type="number"
                  value={gameConfig.timeLimit || ''}
                  onChange={(e) => updateConfig('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="30"
                  max="600"
                  placeholder="無限制"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="time-limit-input"
                />
              </div>

              {/* 懲罰時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  錯誤懲罰（秒）
                </label>
                <input
                  type="number"
                  value={gameConfig.penaltyTime || ''}
                  onChange={(e) => updateConfig('penaltyTime', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  max="30"
                  placeholder="無懲罰"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="penalty-time-input"
                />
              </div>
            </div>

            {/* 遊戲選項 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">遊戲選項</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameConfig.allowHints}
                    onChange={(e) => updateConfig('allowHints', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="allow-hints-checkbox"
                  />
                  <span className="text-sm text-gray-700">允許提示</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameConfig.enableSound}
                    onChange={(e) => updateConfig('enableSound', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="enable-sound-checkbox"
                  />
                  <span className="text-sm text-gray-700">音效</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameConfig.enableAnimation}
                    onChange={(e) => updateConfig('enableAnimation', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="enable-animation-checkbox"
                  />
                  <span className="text-sm text-gray-700">動畫效果</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameConfig.shuffleItems}
                    onChange={(e) => updateConfig('shuffleItems', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="shuffle-items-checkbox"
                  />
                  <span className="text-sm text-gray-700">隨機排列</span>
                </label>
              </div>
            </div>

            {/* 開始遊戲按鈕 */}
            <div className="mt-8 text-center">
              <button
                onClick={handleStartGame}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                data-testid="start-game-btn"
              >
                🚀 開始遊戲
              </button>
            </div>
          </div>
        )}

        {/* 遊戲區域 */}
        {gameStarted && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">正在遊戲中...</h2>
              <button
                onClick={handleBackToConfig}
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="back-to-config-btn"
              >
                ← 返回設置
              </button>
            </div>
            
            <MatchGame
              config={gameConfig}
              pairs={getCurrentPairs()}
              onGameComplete={handleGameComplete}
              onGameStateChange={handleGameStateChange}
              data-testid="match-game-component"
            />
          </div>
        )}

        {/* 遊戲結果 */}
        {gameResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8" data-testid="game-result-summary">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">最近遊戲結果</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameResult.score}</div>
                <div className="text-sm text-gray-600">總分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameResult.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">準確率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{gameResult.completionTime.toFixed(1)}s</div>
                <div className="text-sm text-gray-600">完成時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{gameResult.memoryRetention.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">記憶保持率</div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartGame}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                data-testid="play-again-btn"
              >
                🔄 再玩一次
              </button>
            </div>
          </div>
        )}

        {/* 遊戲說明 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">遊戲說明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">遊戲目標</h3>
              <p className="text-gray-600 text-sm mb-4">
                找出左右兩側相關的配對項目，在限定時間內完成所有配對。
              </p>
              
              <h3 className="font-medium text-gray-900 mb-2">操作方式</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• 點擊左側項目，再點擊右側對應項目</li>
                <li>• 正確配對會變成綠色並保持</li>
                <li>• 錯誤配對會短暫顯示然後重置</li>
                <li>• 可以使用提示功能獲得幫助</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">計分規則</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• 正確配對：+100分</li>
                <li>• 連續配對：額外獎勵分數</li>
                <li>• 時間獎勵：剩餘時間轉換為分數</li>
                <li>• 錯誤配對：-10分</li>
                <li>• 使用提示：-20分</li>
              </ul>
              
              <h3 className="font-medium text-gray-900 mb-2 mt-4">記憶科學原理</h3>
              <p className="text-gray-600 text-sm">
                遊戲運用主動回憶、間隔重複等記憶科學原理，提高學習效果和記憶保持率。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
