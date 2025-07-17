import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface FlashcardGameProps {
  cards: Flashcard[];
  onComplete?: () => void;
  showProgress?: boolean;
}

const FlashcardGame = ({ cards = [], onComplete, showProgress = true }: FlashcardGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

  // 初始化並洗牌
  useEffect(() => {
    if (cards.length > 0) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
      setKnownCards(new Set());
    }
  }, [cards]);

  // 當前卡片
  const currentCard = shuffledCards[currentIndex];

  // 翻轉卡片
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // 下一張卡片
  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setCompleted(true);
      onComplete?.();
    }
  };

  // 上一張卡片
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  // 標記為已知
  const handleMarkAsKnown = () => {
    if (currentCard) {
      const newKnownCards = new Set(knownCards);
      newKnownCards.add(currentCard.id);
      setKnownCards(newKnownCards);
    }
    handleNext();
  };

  // 重新開始
  const handleRestart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setKnownCards(new Set());
  };

  // 只學習未知的卡片
  const handleStudyUnknown = () => {
    const unknownCards = shuffledCards.filter(card => !knownCards.has(card.id));
    if (unknownCards.length > 0) {
      setShuffledCards(unknownCards);
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
    }
  };

  if (!currentCard && !completed) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">沒有可用的卡片</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">單字卡片</h2>
        {showProgress && !completed && (
          <div className="text-indigo-600 font-medium">
            {currentIndex + 1} / {shuffledCards.length}
          </div>
        )}
      </div>

      {completed ? (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold text-green-600 mb-4">恭喜！</h3>
          <p className="text-lg mb-6">您已完成所有卡片</p>
          <p className="mb-4">已掌握: {knownCards.size} / {cards.length}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              重新開始
            </button>
            {knownCards.size < cards.length && (
              <button
                onClick={handleStudyUnknown}
                className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                學習未掌握的卡片
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-64 w-full mb-6">
            <AnimatePresence>
              <motion.div
                key={currentCard.id + (flipped ? '-back' : '-front')}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center bg-white rounded-lg shadow-md p-6 cursor-pointer"
                onClick={handleFlip}
              >
                <div className="text-center">
                  <div className="text-xl font-medium">
                    {flipped ? currentCard.back : currentCard.front}
                  </div>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {currentCard.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    {flipped ? '點擊查看正面' : '點擊查看背面'}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一個
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAsKnown}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                已掌握
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                下一個
              </button>
            </div>
          </div>
        </>
      )}

      {showProgress && !completed && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${(currentIndex / shuffledCards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardGame;