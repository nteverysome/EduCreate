/**
 * 統一遊戲頁面 - 模仿 wordwall.net 的統一遊戲管理模式
 * 展示如何使用統一內容管理器和遊戲適配器
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import UniversalContentEditor from '../components/content/UniversalContentEditor';
import GameSwitcher from '../components/content/GameSwitcher';
import { UniversalContent, GameType } from '../lib/content/UniversalContentManager';

// 導入現有的遊戲組件
import QuizGame from '../components/games/QuizGame';
import MatchingGame from '../components/games/MatchingGame';
import FlashcardGame from '../components/games/FlashcardGame';
import SpinWheelGame from '../components/games/SpinWheelGame';
import WhackAMoleGame from '../components/games/WhackAMoleGame';

type ViewMode = 'editor' | 'game';

export default function UniversalGamePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [content, setContent] = useState<UniversalContent | null>(null);
  const [currentGameType, setCurrentGameType] = useState<GameType>('quiz');
  const [adaptedContent, setAdaptedContent] = useState<any>(null);
  const [gameKey, setGameKey] = useState(0); // 用於強制重新渲染遊戲

  // 示例內容
  const sampleContent: UniversalContent = {
    id: 'sample_content',
    title: '水果詞彙學習',
    description: '學習各種水果的名稱和特徵',
    items: [
      { id: '1', term: '蘋果', definition: '一種紅色或綠色的圓形水果，味道甜脆' },
      { id: '2', term: '香蕉', definition: '一種黃色的彎曲水果，富含鉀元素' },
      { id: '3', term: '橘子', definition: '一種橙色的柑橘類水果，富含維生素C' },
      { id: '4', term: '葡萄', definition: '一種小而圓的水果，通常成串生長' },
      { id: '5', term: '草莓', definition: '一種紅色的心形水果，表面有小種子' },
      { id: '6', term: '西瓜', definition: '一種大型的綠色水果，內部是紅色多汁的果肉' },
      { id: '7', term: '鳳梨', definition: '一種熱帶水果，外皮粗糙，內部黃色甜美' },
      { id: '8', term: '芒果', definition: '一種熱帶水果，橙黃色，味道香甜' }
    ],
    tags: ['水果', '詞彙', '學習'],
    language: 'zh-TW',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user'
  };

  useEffect(() => {
    // 初始化示例內容
    if (!content) {
      setContent(sampleContent);
    }
  }, []);

  const handleContentChange = (newContent: UniversalContent) => {
    setContent(newContent);
  };

  const handleGameSelect = (gameType: GameType, gameContent: any) => {
    setCurrentGameType(gameType);
    setAdaptedContent(gameContent);
    setViewMode('game');
    setGameKey(prev => prev + 1); // 強制重新渲染
  };

  const handleGameTypeChange = (gameType: GameType, gameContent: any) => {
    setCurrentGameType(gameType);
    setAdaptedContent(gameContent);
    setGameKey(prev => prev + 1); // 強制重新渲染
  };

  const handleBackToEditor = () => {
    setViewMode('editor');
  };

  const handleShare = () => {
    // 實現分享功能
    const shareUrl = `${window.location.origin}/universal-game?shared=true`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('分享鏈接已複製到剪貼板！');
    });
  };

  const renderGame = () => {
    if (!adaptedContent) return null;

    const gameProps = {
      key: gameKey,
      onComplete: (score?: number) => {
        console.log('遊戲完成，分數:', score);
      }
    };

    switch (currentGameType) {
      case 'quiz':
        return <QuizGame questions={adaptedContent} {...gameProps} />;
      
      case 'matching':
        return <MatchingGame items={adaptedContent} {...gameProps} />;
      
      case 'flashcards':
        return <FlashcardGame cards={adaptedContent} {...gameProps} />;
      
      case 'spin-wheel':
        return <SpinWheelGame items={adaptedContent} {...gameProps} />;
      
      case 'whack-a-mole':
        return <WhackAMoleGame items={adaptedContent} {...gameProps} />;
      
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {currentGameType} 遊戲
              </h3>
              <p className="text-gray-600">
                此遊戲類型的組件正在開發中...
              </p>
              <div className="mt-4 p-4 bg-white rounded border">
                <h4 className="font-medium mb-2">適配的遊戲數據：</h4>
                <pre className="text-xs text-left overflow-auto max-h-32">
                  {JSON.stringify(adaptedContent, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>統一遊戲管理器 | EduCreate</title>
        <meta name="description" content="模仿 wordwall.net 的統一內容管理和遊戲切換功能" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {viewMode === 'editor' ? (
          // 編輯器模式
          <div>
            <div className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      統一遊戲管理器
                    </h1>
                    <p className="text-gray-600">
                      輸入內容，一鍵適配所有遊戲類型 - 模仿 wordwall.net 模式
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      靈感來源: wordwall.net
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {content && (
              <UniversalContentEditor
                initialContent={content}
                onContentChange={handleContentChange}
                onGameSelect={handleGameSelect}
              />
            )}
          </div>
        ) : (
          // 遊戲模式
          <div>
            {content && (
              <GameSwitcher
                content={content}
                currentGameType={currentGameType}
                onGameTypeChange={handleGameTypeChange}
                onBack={handleBackToEditor}
                onShare={handleShare}
              />
            )}

            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                {renderGame()}
              </div>
            </div>
          </div>
        )}

        {/* 功能說明 */}
        {viewMode === 'editor' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                🎯 統一內容管理系統特點
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-medium mb-2">✨ 核心功能</h4>
                  <ul className="space-y-1">
                    <li>• 統一內容格式，適配所有遊戲</li>
                    <li>• 一鍵切換遊戲類型</li>
                    <li>• 智能遊戲推薦</li>
                    <li>• 批量內容導入/導出</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎮 支持的遊戲</h4>
                  <ul className="space-y-1">
                    <li>• 測驗問答、配對遊戲、單字卡片</li>
                    <li>• 隨機轉盤、打地鼠、記憶卡片</li>
                    <li>• 單字搜尋、填字遊戲、是非題</li>
                    <li>• 更多遊戲類型持續添加中...</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
