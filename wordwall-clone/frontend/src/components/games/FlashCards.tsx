import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

interface FlashCardsContent {
  cards: FlashCard[];
  mode: 'study' | 'quiz' | 'memory';
  showProgress: boolean;
  shuffleCards: boolean;
  autoFlip: boolean;
  autoFlipDelay: number;
  allowSkip: boolean;
  repeatIncorrect: boolean;
  studyDirection: 'front-to-back' | 'back-to-front' | 'both';
}

interface FlashCardsProps {
  content: FlashCardsContent;
  onAnswer: (answer: {
    cardId: string;
    confidence: 'low' | 'medium' | 'high';
    timeSpent: number;
    flipsCount: number;
    skipped: boolean;
    timestamp: number;
  }) => void;
  onComplete?: () => void;
  disabled?: boolean;
  showResult?: boolean;
  result?: {
    score: number;
    feedback: string;
    details: any;
  };
}

/**
 * Flash Cards 遊戲組件
 * 
 * 功能：
 * - 翻轉卡片動畫
 * - 自動播放模式
 * - 信心評估
 * - 學習進度追蹤
 * - 間隔重複提醒
 */
export const FlashCards: React.FC<FlashCardsProps> = ({
  content,
  onAnswer,
  onComplete,
  disabled = false,
  showResult = false,
  result,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [flipsCount, setFlipsCount] = useState(0);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const currentCard = content.cards[cardOrder[currentCardIndex]];

  // 初始化卡片順序
  useEffect(() => {
    let order = content.cards.map((_, index) => index);
    if (content.shuffleCards) {
      order = order.sort(() => Math.random() - 0.5);
    }
    setCardOrder(order);
  }, [content.cards, content.shuffleCards]);

  // 自動播放邏輯
  useEffect(() => {
    if (isAutoPlay && content.autoFlip && !disabled) {
      autoPlayRef.current = setTimeout(() => {
        if (!isFlipped) {
          handleFlip();
        } else {
          handleNext();
        }
      }, content.autoFlipDelay);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, isFlipped, currentCardIndex, content.autoFlipDelay, disabled]);

  // 重置卡片狀態
  const resetCardState = () => {
    setIsFlipped(false);
    setCardStartTime(Date.now());
    setFlipsCount(0);
  };

  // 翻轉卡片
  const handleFlip = () => {
    if (disabled) return;
    
    setIsFlipped(!isFlipped);
    setFlipsCount(prev => prev + 1);
  };

  // 下一張卡片
  const handleNext = () => {
    if (currentCardIndex < cardOrder.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      resetCardState();
    } else {
      // 完成所有卡片
      onComplete?.();
    }
  };

  // 上一張卡片
  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      resetCardState();
    }
  };

  // 提交信心評估
  const handleConfidenceSubmit = (confidence: 'low' | 'medium' | 'high') => {
    if (!currentCard || disabled) return;

    const timeSpent = Date.now() - cardStartTime;
    
    onAnswer({
      cardId: currentCard.id,
      confidence,
      timeSpent,
      flipsCount,
      skipped: false,
      timestamp: Date.now(),
    });

    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    handleNext();
  };

  // 跳過卡片
  const handleSkip = () => {
    if (!currentCard || disabled || !content.allowSkip) return;

    const timeSpent = Date.now() - cardStartTime;
    
    onAnswer({
      cardId: currentCard.id,
      confidence: 'low',
      timeSpent,
      flipsCount,
      skipped: true,
      timestamp: Date.now(),
    });

    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    handleNext();
  };

  // 切換自動播放
  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  // 重新開始
  const handleRestart = () => {
    setCurrentCardIndex(0);
    setStudiedCards(new Set());
    resetCardState();
    
    // 重新洗牌
    if (content.shuffleCards) {
      const newOrder = content.cards.map((_, index) => index).sort(() => Math.random() - 0.5);
      setCardOrder(newOrder);
    }
  };

  // 獲取難度顏色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">沒有可用的卡片</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 進度條 */}
      {content.showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              進度: {currentCardIndex + 1} / {cardOrder.length}
            </span>
            <span className="text-sm text-gray-600">
              已學習: {studiedCards.size} 張
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / cardOrder.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 控制按鈕 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0 || disabled}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoPlay}
            disabled={disabled}
          >
            {isAutoPlay ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            disabled={disabled}
          >
            <ArrowPathIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* 難度標籤 */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
            {currentCard.difficulty}
          </span>
          
          {/* 分類標籤 */}
          {currentCard.category && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
              {currentCard.category}
            </span>
          )}
        </div>
      </div>

      {/* 卡片容器 */}
      <div className="relative h-96 mb-6 perspective-1000">
        <motion.div
          className="relative w-full h-full cursor-pointer"
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* 正面 */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg border-2 border-gray-200 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              {currentCard.frontImage && (
                <img
                  src={currentCard.frontImage}
                  alt="Front"
                  className="max-w-32 max-h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentCard.front}
              </h2>
              <p className="text-sm text-gray-500">點擊翻轉查看答案</p>
            </div>
          </div>

          {/* 背面 */}
          <div 
            className="absolute inset-0 w-full h-full bg-blue-50 rounded-xl shadow-lg border-2 border-blue-200 backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              {currentCard.backImage && (
                <img
                  src={currentCard.backImage}
                  alt="Back"
                  className="max-w-32 max-h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                {currentCard.back}
              </h2>
              <p className="text-sm text-blue-600">你記住了嗎？</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 信心評估按鈕 */}
      <AnimatePresence>
        {isFlipped && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center space-x-4 mb-6"
          >
            <Button
              variant="danger"
              onClick={() => handleConfidenceSubmit('low')}
              className="flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>不熟悉</span>
            </Button>
            
            <Button
              variant="warning"
              onClick={() => handleConfidenceSubmit('medium')}
              className="flex items-center space-x-2"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span>還可以</span>
            </Button>
            
            <Button
              variant="success"
              onClick={() => handleConfidenceSubmit('high')}
              className="flex items-center space-x-2"
            >
              <CheckIcon className="h-4 w-4" />
              <span>很熟悉</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 跳過按鈕 */}
      {content.allowSkip && !disabled && (
        <div className="flex justify-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
          >
            跳過這張卡片
          </Button>
        </div>
      )}

      {/* 導航按鈕 */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0 || disabled}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          上一張
        </Button>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>翻轉次數: {flipsCount}</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={currentCardIndex === cardOrder.length - 1 || disabled}
        >
          下一張
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* 結果顯示 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                學習完成！
              </h3>
              
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {result.score} 分
              </div>

              <p className="text-gray-600 mb-6">
                {result.feedback}
              </p>

              {result.details && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-semibold text-green-800">掌握</div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.details.masteredCards}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="font-semibold text-yellow-800">需複習</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.details.needReviewCards}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-800">效率</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.details.efficiency}%
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="font-semibold text-purple-800">平均時間</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {result.details.averageTimePerCard}s
                    </div>
                  </div>
                </div>
              )}

              {result.details?.suggestions && result.details.suggestions.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">學習建議</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {result.details.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashCards;
