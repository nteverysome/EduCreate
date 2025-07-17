import React, { useState, useEffect } from 'react';
export interface MemoryCard {
  id: string;
  content: string;
  pairId: string; // 配對的卡片ID
  type: 'text' | 'emoji' | 'image';
}
interface MemoryCardGameProps {
  cards: MemoryCard[];
  timeLimit?: number;
  showTimer?: boolean;
  onComplete?: (results: any) => void;
}
interface CardState {
  id: string;
  isFlipped: boolean;
  isMatched: boolean;
}
export default function MemoryCardGame({
  cards,
  timeLimit = 180,
  showTimer = true,
  onComplete
}: MemoryCardGameProps) {
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  // 初始化卡片狀態
  useEffect(() => {
    if (cards.length > 0) {
      // 洗牌
      const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
      const initialStates = shuffledCards.map(card => ({
        id: card.id,
        isFlipped: false,
        isMatched: false
      }));
      setCardStates(initialStates);
    }
  }, [cards]);
  // 計時器
  useEffect(() => {
    if (!gameStarted || gameCompleted || !showTimer) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, showTimer]);
  // 檢查遊戲是否完成
  useEffect(() => {
    if (matchedPairs.size === cards.length / 2 && cards.length > 0) {
      setGameCompleted(true);
    }
  }, [matchedPairs.size, cards.length]);
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setTimeLeft(timeLimit);
    setScore(0);
    // 重新洗牌
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const initialStates = shuffledCards.map(card => ({
      id: card.id,
      isFlipped: false,
      isMatched: false
    }));
    setCardStates(initialStates);
  };
  // 翻牌
  const flipCard = (cardId: string) => {
    if (!gameStarted || gameCompleted) return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    const cardState = cardStates.find(state => state.id === cardId);
    if (!cardState || cardState.isMatched) return;
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    // 更新卡片狀態
    setCardStates(prev => prev.map(state => 
      state.id === cardId ? { ...state, isFlipped: true } : state
    ));
    // 如果翻了兩張牌，檢查是否配對
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);
      if (card1 && card2 && card1.pairId === card2.id) {
        // 配對成功
        setTimeout(() => {
          setMatchedPairs(prev => new Set([...prev, card1.pairId]));
          setCardStates(prev => prev.map(state => 
            (state.id === card1.id || state.id === card2.id) 
              ? { ...state, isMatched: true }
              : state
          ));
          setFlippedCards([]);
          // 計分：基礎分數 + 時間獎勵 - 移動懲罰
          const baseScore = 100;
          const timeBonus = Math.max(0, timeLeft);
          const movesPenalty = Math.max(0, (moves - cards.length / 2) * 5);
          setScore(prev => prev + baseScore + timeBonus - movesPenalty);
        }, 500);
      } else {
        // 配對失敗
        setTimeout(() => {
          setCardStates(prev => prev.map(state => 
            newFlippedCards.includes(state.id) 
              ? { ...state, isFlipped: false }
              : state
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted && matchedPairs.size > 0) {
      const totalPairs = cards.length / 2;
      const completionRate = Math.round((matchedPairs.size / totalPairs) * 100);
      const timeSpent = timeLimit - timeLeft;
      const efficiency = Math.round((totalPairs / moves) * 100);
      const results = {
        score,
        matchedPairs: matchedPairs.size,
        totalPairs,
        moves,
        timeSpent,
        completionRate,
        efficiency
      };
      onComplete?.(results);
    }
  }, [gameCompleted, matchedPairs.size, score, moves, timeLimit, timeLeft, cards.length, onComplete]);
  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  // 獲取卡片內容
  const getCardContent = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return '';
    if (card.type === 'emoji') {
      return <span className="text-4xl">{card.content}</span>;
    }
    return <span className="text-lg font-bold">{card.content}</span>;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🧠</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">記憶卡片遊戲</h2>
        <p className="text-gray-600 mb-6">
          翻開卡片找到配對。共 {cards.length} 張卡片，{cards.length / 2} 對配對。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-indigo-500 text-white text-xl font-bold rounded-lg hover:bg-indigo-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const totalPairs = cards.length / 2;
    const completionRate = Math.round((matchedPairs.size / totalPairs) * 100);
    const efficiency = Math.round((totalPairs / moves) * 100);
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲完成！</h2>
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">最終得分:</span>
              <span className="font-bold text-green-600">{score} 分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">配對成功:</span>
              <span className="font-bold text-blue-600">{matchedPairs.size}/{totalPairs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">移動次數:</span>
              <span className="font-bold text-purple-600">{moves}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成率:</span>
              <span className="font-bold text-orange-600">{completionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">效率:</span>
              <span className="font-bold text-pink-600">{efficiency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">用時:</span>
              <span className="font-bold text-red-600">{formatTime(timeLimit - timeLeft)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-indigo-600">{matchedPairs.size}/{cards.length / 2}</div>
          <div className="text-sm text-gray-600">配對</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{moves}</div>
          <div className="text-sm text-gray-600">移動</div>
        </div>
        {showTimer && (
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-600">剩餘時間</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
      </div>
      {/* 卡片網格 */}
      <div className={`grid gap-4 ${
        cards.length <= 8 ? 'grid-cols-4' :
        cards.length <= 12 ? 'grid-cols-4' :
        cards.length <= 16 ? 'grid-cols-4' :
        'grid-cols-6'
      }`}>
        {cardStates.map((cardState) => {
          const isFlipped = cardState.isFlipped || cardState.isMatched;
          return (
            <div
              key={cardState.id}
              onClick={() => flipCard(cardState.id)}
              className={`relative w-20 h-20 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                cardState.isMatched ? 'opacity-75' : ''
              }`}
            >
              <div className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}>
                {/* 卡片背面 */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg shadow-lg flex items-center justify-center backface-hidden">
                  <span className="text-white text-2xl">?</span>
                </div>
                {/* 卡片正面 */}
                <div className={`absolute inset-0 w-full h-full rounded-lg shadow-lg flex items-center justify-center backface-hidden rotate-y-180 ${
                  cardState.isMatched ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-gray-200'
                }`}>
                  {getCardContent(cardState.id)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 遊戲提示 */}
      <div className="mt-6 text-center text-gray-600">
        <p>點擊卡片翻開，找到相同的配對！</p>
      </div>
    </div>
  );
}
