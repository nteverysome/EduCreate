import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchCard {
  id: string;
  content: string;
  pairId: string;
  type: 'text' | 'image';
  category?: string;
}

interface FindMatchProps {
  cards: MatchCard[];
  timeLimit?: number;
  maxAttempts?: number;
  showProgress?: boolean;
  gridSize?: 'small' | 'medium' | 'large';
  onComplete: (result: FindMatchResult) => void;
  onMatch?: (pairId: string, attempts: number) => void;
}

interface FindMatchResult {
  score: number;
  totalPairs: number;
  percentage: number;
  timeSpent: number;
  attempts: number;
  matches: Array<{
    pairId: string;
    attempts: number;
    timeSpent: number;
  }>;
}

interface GameCard extends MatchCard {
  isFlipped: boolean;
  isMatched: boolean;
  isSelected: boolean;
}

const FindMatch: React.FC<FindMatchProps> = ({
  cards,
  timeLimit = 0,
  maxAttempts = 0,
  showProgress = true,
  gridSize = 'medium',
  onComplete,
  onMatch
}) => {
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [matchHistory, setMatchHistory] = useState<FindMatchResult['matches']>([]);
  const [pairStartTimes, setPairStartTimes] = useState<Map<string, number>>(new Map());

  // 初始化遊戲卡片
  useEffect(() => {
    const shuffledCards = shuffleArray([...cards]).map(card => ({
      ...card,
      isFlipped: false,
      isMatched: false,
      isSelected: false
    }));
    setGameCards(shuffledCards);
  }, [cards]);

  // 計時器
  useEffect(() => {
    if (timeLimit > 0 && timeRemaining > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timeLimit > 0) {
      finishGame();
    }
  }, [timeRemaining, timeLimit, showResult]);

  // 檢查遊戲是否完成
  useEffect(() => {
    const totalPairs = new Set(cards.map(card => card.pairId)).size;
    if (matchedPairs.size === totalPairs && totalPairs > 0) {
      setTimeout(() => finishGame(), 1000);
    }
  }, [matchedPairs.size, cards]);

  // 檢查最大嘗試次數
  useEffect(() => {
    if (maxAttempts > 0 && attempts >= maxAttempts) {
      finishGame();
    }
  }, [attempts, maxAttempts]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (clickedCard: GameCard) => {
    if (
      isChecking ||
      clickedCard.isMatched ||
      clickedCard.isSelected ||
      selectedCards.length >= 2
    ) {
      return;
    }

    // 記錄配對開始時間
    if (selectedCards.length === 0) {
      setPairStartTimes(prev => new Map(prev).set(clickedCard.pairId, Date.now()));
    }

    const newSelectedCards = [...selectedCards, clickedCard];
    setSelectedCards(newSelectedCards);

    // 更新卡片狀態
    setGameCards(prev => prev.map(card =>
      card.id === clickedCard.id
        ? { ...card, isFlipped: true, isSelected: true }
        : card
    ));

    // 如果選擇了兩張卡片，檢查是否配對
    if (newSelectedCards.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);

      setTimeout(() => {
        checkMatch(newSelectedCards);
      }, 1000);
    }
  };

  const checkMatch = (selectedCards: GameCard[]) => {
    const [card1, card2] = selectedCards;
    const isMatch = card1.pairId === card2.pairId;

    if (isMatch) {
      // 配對成功
      setMatchedPairs(prev => new Set(prev).add(card1.pairId));
      
      setGameCards(prev => prev.map(card =>
        card.pairId === card1.pairId
          ? { ...card, isMatched: true, isSelected: false }
          : card
      ));

      // 記錄配對歷史
      const pairStartTime = pairStartTimes.get(card1.pairId) || Date.now();
      const timeSpent = Date.now() - pairStartTime;
      const matchRecord = {
        pairId: card1.pairId,
        attempts: attempts + 1,
        timeSpent
      };
      setMatchHistory(prev => [...prev, matchRecord]);
      
      onMatch?.(card1.pairId, attempts + 1);
    } else {
      // 配對失敗，翻回卡片
      setGameCards(prev => prev.map(card =>
        selectedCards.some(selected => selected.id === card.id)
          ? { ...card, isFlipped: false, isSelected: false }
          : card
      ));
    }

    setSelectedCards([]);
    setIsChecking(false);
  };

  const finishGame = () => {
    const totalTimeSpent = Date.now() - gameStartTime;
    const totalPairs = new Set(cards.map(card => card.pairId)).size;
    
    const result: FindMatchResult = {
      score: matchedPairs.size,
      totalPairs,
      percentage: Math.round((matchedPairs.size / totalPairs) * 100),
      timeSpent: totalTimeSpent,
      attempts,
      matches: matchHistory
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const getGridCols = () => {
    const cardCount = cards.length;
    if (gridSize === 'small' || cardCount <= 8) return 'grid-cols-4';
    if (gridSize === 'medium' || cardCount <= 16) return 'grid-cols-4 md:grid-cols-6';
    return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8';
  };

  const getCardStyle = (card: GameCard) => {
    if (card.isMatched) {
      return 'bg-green-100 border-green-300 cursor-default';
    }
    if (card.isSelected) {
      return 'bg-blue-100 border-blue-300';
    }
    if (card.isFlipped) {
      return 'bg-white border-gray-300';
    }
    return 'bg-gray-200 border-gray-300 hover:bg-gray-300 cursor-pointer';
  };

  if (showResult) {
    const totalPairs = new Set(cards.map(card => card.pairId)).size;
    const percentage = Math.round((matchedPairs.size / totalPairs) * 100);
    const efficiency = attempts > 0 ? Math.round((totalPairs / attempts) * 100) : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {percentage === 100 ? '🎉' : percentage >= 80 ? '🎯' : '🧠'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">記憶配對完成！</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{matchedPairs.size}</div>
              <div className="text-sm text-gray-600">成功配對</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">完成率</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{efficiency}%</div>
              <div className="text-sm text-gray-600">效率</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-6">
            總共 {totalPairs} 對，成功找到 {matchedPairs.size} 對
            <br />
            嘗試次數：{attempts} 次
            {timeLimit > 0 && (
              <div className="mt-2">
                用時：{Math.round((Date.now() - gameStartTime) / 1000)} 秒
              </div>
            )}
          </div>
          
          {/* 評價 */}
          <div className="space-y-2">
            {percentage === 100 && attempts <= totalPairs && (
              <p className="text-green-600 font-semibold">🏆 完美！一次性全部配對成功！</p>
            )}
            {percentage === 100 && attempts <= totalPairs * 1.5 && (
              <p className="text-blue-600 font-semibold">⭐ 優秀！記憶力很棒！</p>
            )}
            {percentage >= 80 && (
              <p className="text-green-600 font-semibold">👍 很好！繼續保持！</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-yellow-600 font-semibold">💪 不錯！還有進步空間！</p>
            )}
            {percentage < 60 && (
              <p className="text-orange-600 font-semibold">🎯 多練習記憶技巧會更好！</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const totalPairs = new Set(cards.map(card => card.pairId)).size;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 進度條和統計 */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              已配對：{matchedPairs.size} / {totalPairs}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                嘗試次數：{attempts}
                {maxAttempts > 0 && ` / ${maxAttempts}`}
              </span>
              {timeLimit > 0 && (
                <span className={`text-sm font-medium ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  剩餘時間：{timeRemaining}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(matchedPairs.size / totalPairs) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 遊戲說明 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">記憶配對遊戲</h2>
        <p className="text-gray-600">點擊卡片找到相同的配對，考驗您的記憶力！</p>
      </div>

      {/* 卡片網格 */}
      <div className={`grid ${getGridCols()} gap-4 max-w-4xl mx-auto`}>
        <AnimatePresence>
          {gameCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCardClick(card)}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-center p-2 transition-all duration-300 ${getCardStyle(card)}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                {card.isFlipped || card.isMatched ? (
                  <div className="text-sm font-medium break-words">
                    {card.type === 'image' ? (
                      <img 
                        src={card.content} 
                        alt="Card content" 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span>{card.content}</span>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl">❓</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 提示信息 */}
      <div className="mt-8 text-center">
        <div className="text-gray-600">
          <p>點擊兩張卡片進行配對</p>
          {selectedCards.length === 1 && (
            <p className="text-blue-600 mt-2">已選擇 1 張卡片，請選擇第 2 張</p>
          )}
          {isChecking && (
            <p className="text-orange-600 mt-2">檢查配對中...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindMatch;
