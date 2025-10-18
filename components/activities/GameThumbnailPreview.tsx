'use client';

import React from 'react';

interface GameThumbnailPreviewProps {
  gameType: string;
  vocabularyItems?: Array<{
    english: string;
    chinese: string;
  }>;
  activityTitle?: string;
}

/**
 * 遊戲縮略圖預覽組件
 * 根據遊戲類型和詞彙生成動態的遊戲預覽畫面
 */
const GameThumbnailPreview: React.FC<GameThumbnailPreviewProps> = ({
  gameType,
  vocabularyItems = [],
  activityTitle = ''
}) => {
  // 獲取前3個詞彙用於預覽
  const previewWords = vocabularyItems.slice(0, 3);

  // Shimozurdo Game 預覽（深色背景 + Logo + 單字）
  const renderShimozurdoPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">SHIMOZURDO</span>
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded transform rotate-45"></div>
        </div>
        <div className="text-white/60 text-xs text-center mt-1">GAMES</div>
      </div>

      {/* 單字預覽 */}
      {previewWords.length > 0 && (
        <div className="relative z-10 flex flex-col gap-1.5 w-full max-w-[200px]">
          {previewWords.map((word, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded px-3 py-1.5 flex items-center justify-between"
              style={{
                animation: `fadeIn 0.5s ease-in-out ${index * 0.2}s both`
              }}
            >
              <span className="text-white text-xs font-medium truncate">{word.english}</span>
              <span className="text-white/70 text-xs ml-2 truncate">{word.chinese}</span>
            </div>
          ))}
        </div>
      )}

      {/* 如果沒有單字，顯示佔位符 */}
      {previewWords.length === 0 && (
        <div className="relative z-10 text-white/40 text-xs text-center">
          點擊開始遊戲
        </div>
      )}
    </div>
  );

  // Quiz 測驗預覽
  const renderQuizPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-3xl mb-3">❓</div>
      {previewWords.length > 0 && (
        <div className="w-full max-w-[200px] space-y-2">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="text-xs font-medium text-gray-800 text-center">{previewWords[0].english}</div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {previewWords.slice(0, 2).map((word, index) => (
              <div key={index} className="bg-white/80 rounded px-2 py-1 text-xs text-center border border-gray-200">
                {word.chinese}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Matching 配對遊戲預覽
  const renderMatchingPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
        {previewWords.slice(0, 2).map((word, index) => (
          <React.Fragment key={index}>
            <div className="bg-white rounded-lg p-2 shadow-sm border border-purple-200 text-xs text-center font-medium">
              {word.english}
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border border-pink-200 text-xs text-center">
              {word.chinese}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Flashcards 單字卡片預覽
  const renderFlashcardsPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="relative">
        {previewWords.slice(0, 3).map((word, index) => (
          <div
            key={index}
            className="absolute bg-white rounded-lg shadow-lg border-2 border-amber-300 p-4 w-32 h-20 flex flex-col items-center justify-center"
            style={{
              transform: `rotate(${(index - 1) * 5}deg) translateY(${index * 2}px)`,
              zIndex: 3 - index,
            }}
          >
            <div className="text-sm font-bold text-gray-800">{word.english}</div>
            <div className="text-xs text-gray-600 mt-1">{word.chinese}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Hangman 猜字遊戲預覽
  const renderHangmanPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="text-3xl mb-3">🎯</div>
      {previewWords.length > 0 && (
        <div className="flex gap-1 mb-2">
          {previewWords[0].english.split('').slice(0, 6).map((_, index) => (
            <div key={index} className="w-4 h-6 border-b-2 border-gray-400"></div>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-600 mt-2">猜字遊戲</div>
    </div>
  );

  // Airplane 飛機遊戲預覽
  const renderAirplanePreview = () => (
    <div className="w-full h-full bg-gradient-to-b from-sky-200 to-sky-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="text-4xl mb-2">✈️</div>
      {previewWords.length > 0 && (
        <div className="space-y-1">
          {previewWords.map((word, index) => (
            <div key={index} className="bg-white/90 rounded px-2 py-1 text-xs text-center shadow-sm">
              {word.english}
            </div>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-600"></div>
    </div>
  );

  // Memory Cards 記憶卡片預覽
  const renderMemoryCardsPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-3 gap-1.5">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="w-10 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded shadow-md flex items-center justify-center"
          >
            {index < 2 && previewWords[index] && (
              <span className="text-white text-xs font-bold">?</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Vocabulary 詞彙遊戲預覽（通用）
  const renderVocabularyPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-cyan-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="text-3xl mb-3">📝</div>
      {previewWords.length > 0 && (
        <div className="w-full max-w-[200px] space-y-1.5">
          {previewWords.map((word, index) => (
            <div key={index} className="bg-white rounded-lg px-3 py-1.5 shadow-sm border border-cyan-200 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-800">{word.english}</span>
              <span className="text-xs text-gray-600">{word.chinese}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 默認預覽
  const renderDefaultPreview = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <div className="text-4xl mb-2">{getGameTypeInfo(gameType).icon}</div>
      <div className="text-xs text-gray-600 text-center font-medium">{getGameTypeInfo(gameType).name}</div>
      {previewWords.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          {previewWords.length} 個詞彙
        </div>
      )}
    </div>
  );

  // 根據遊戲類型選擇預覽樣式
  const renderPreview = () => {
    const gameTypeKey = gameType?.toLowerCase() || '';
    
    // Shimozurdo Game
    if (gameTypeKey.includes('shimozurdo') || gameTypeKey === 'vocabulary' || gameTypeKey === '詞彙遊戲') {
      return renderShimozurdoPreview();
    }
    
    // Quiz
    if (gameTypeKey.includes('quiz') || gameTypeKey === '測驗') {
      return renderQuizPreview();
    }
    
    // Matching
    if (gameTypeKey.includes('match') || gameTypeKey === '配對遊戲') {
      return renderMatchingPreview();
    }
    
    // Flashcards
    if (gameTypeKey.includes('flashcard') || gameTypeKey === '單字卡片') {
      return renderFlashcardsPreview();
    }
    
    // Hangman
    if (gameTypeKey.includes('hangman') || gameTypeKey === '猜字遊戲') {
      return renderHangmanPreview();
    }
    
    // Airplane
    if (gameTypeKey.includes('airplane') || gameTypeKey === '飛機遊戲') {
      return renderAirplanePreview();
    }
    
    // Memory Cards
    if (gameTypeKey.includes('memory') || gameTypeKey === '記憶卡片') {
      return renderMemoryCardsPreview();
    }
    
    // Default
    return renderDefaultPreview();
  };

  // 輔助函數：獲取遊戲類型信息
  const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
    const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
      'quiz': { icon: '❓', name: '測驗' },
      'matching': { icon: '🔗', name: '配對遊戲' },
      'flashcards': { icon: '📚', name: '單字卡片' },
      'vocabulary': { icon: '📝', name: '詞彙遊戲' },
      'hangman': { icon: '🎯', name: '猜字遊戲' },
      'airplane': { icon: '✈️', name: '飛機遊戲' },
      'memory-cards': { icon: '🧠', name: '記憶卡片' },
    };
    
    return gameTypeMap[gameType] || { icon: '🎮', name: gameType || '遊戲' };
  };

  return (
    <div className="w-full h-full">
      {renderPreview()}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GameThumbnailPreview;

