import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnagramWord {
  id: string;
  word: string;
  hint?: string;
  category?: string;
}

interface AnagramProps {
  words: AnagramWord[];
  timeLimit?: number;
  showHints?: boolean;
  allowSkip?: boolean;
  onComplete: (result: AnagramResult) => void;
  onWordSolved?: (wordId: string, attempts: number, timeSpent: number) => void;
}

interface AnagramResult {
  score: number;
  totalWords: number;
  percentage: number;
  timeSpent: number;
  totalAttempts: number;
  solvedWords: Array<{
    wordId: string;
    word: string;
    attempts: number;
    timeSpent: number;
    skipped: boolean;
  }>;
}

interface Letter {
  id: string;
  letter: string;
  originalIndex: number;
  currentIndex: number;
}

const Anagram: React.FC<AnagramProps> = ({
  words,
  timeLimit = 0,
  showHints = true,
  allowSkip = true,
  onComplete,
  onWordSolved
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [wordAttempts, setWordAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [wordStartTime, setWordStartTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solvedWords, setSolvedWords] = useState<AnagramResult['solvedWords']>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [draggedLetter, setDraggedLetter] = useState<Letter | null>(null);

  const currentWord = words[currentWordIndex];

  // 初始化當前單詞的字母
  useEffect(() => {
    if (currentWord) {
      const wordLetters = currentWord.word.toLowerCase().split('').map((letter, index) => ({
        id: `${currentWord.id}-${index}`,
        letter,
        originalIndex: index,
        currentIndex: index
      }));
      
      // 打亂字母順序
      const shuffledLetters = shuffleArray(wordLetters);
      setLetters(shuffledLetters);
      setUserInput('');
      setWordAttempts(0);
      setWordStartTime(Date.now());
      setIsCorrect(null);
      setShowHint(false);
    }
  }, [currentWordIndex, currentWord]);

  // 計時器
  useEffect(() => {
    if (timeLimit > 0 && timeRemaining > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timeLimit > 0) {
      handleTimeUp();
    }
  }, [timeRemaining, timeLimit, showResult]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleTimeUp = () => {
    skipWord();
  };

  const handleLetterClick = (letter: Letter) => {
    setUserInput(prev => prev + letter.letter);
  };

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserInput('');
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setAttempts(prev => prev + 1);
    setWordAttempts(prev => prev + 1);
    
    const isWordCorrect = userInput.toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(isWordCorrect);
    
    if (isWordCorrect) {
      const timeSpent = Date.now() - wordStartTime;
      setScore(prev => prev + 1);
      
      const solvedWord = {
        wordId: currentWord.id,
        word: currentWord.word,
        attempts: wordAttempts + 1,
        timeSpent,
        skipped: false
      };
      
      setSolvedWords(prev => [...prev, solvedWord]);
      onWordSolved?.(currentWord.id, wordAttempts + 1, timeSpent);
      
      setTimeout(() => {
        nextWord();
      }, 2000);
    } else {
      // 錯誤動畫
      setTimeout(() => {
        setIsCorrect(null);
        setUserInput('');
      }, 1500);
    }
  };

  const skipWord = () => {
    if (!allowSkip) return;
    
    const timeSpent = Date.now() - wordStartTime;
    const solvedWord = {
      wordId: currentWord.id,
      word: currentWord.word,
      attempts: wordAttempts,
      timeSpent,
      skipped: true
    };
    
    setSolvedWords(prev => [...prev, solvedWord]);
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const totalTimeSpent = Date.now() - gameStartTime;
    const result: AnagramResult = {
      score,
      totalWords: words.length,
      percentage: Math.round((score / words.length) * 100),
      timeSpent: totalTimeSpent,
      totalAttempts: attempts,
      solvedWords
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const handleDragStart = (e: React.DragEvent, letter: Letter) => {
    setDraggedLetter(letter);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedLetter) {
      setUserInput(prev => prev + draggedLetter.letter);
      setDraggedLetter(null);
    }
  };

  if (showResult) {
    const percentage = Math.round((score / words.length) * 100);
    const skippedCount = solvedWords.filter(w => w.skipped).length;
    
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
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '🧩' : '💪'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">字謎完成！</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">解出單詞</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">正確率</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{attempts}</div>
              <div className="text-sm text-gray-600">總嘗試</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-6">
            總共 {words.length} 個單詞，成功解出 {score} 個
            {skippedCount > 0 && (
              <div className="mt-2">跳過 {skippedCount} 個單詞</div>
            )}
            {timeLimit > 0 && (
              <div className="mt-2">
                用時：{Math.round((Date.now() - gameStartTime) / 1000)} 秒
              </div>
            )}
          </div>
          
          {/* 詳細結果 */}
          <div className="mt-6 max-h-40 overflow-y-auto">
            <h4 className="font-semibold mb-2">詳細結果：</h4>
            <div className="space-y-1 text-sm">
              {solvedWords.map((word, index) => (
                <div key={word.wordId} className="flex justify-between items-center">
                  <span className={word.skipped ? 'text-orange-600' : 'text-green-600'}>
                    {index + 1}. {word.word}
                  </span>
                  <span className="text-gray-500">
                    {word.skipped ? '跳過' : `${word.attempts} 次嘗試`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 進度條和統計 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600">
            單詞 {currentWordIndex + 1} / {words.length}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              已解出：{score}
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
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 當前單詞信息 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          重新排列字母組成單詞
        </h2>
        {currentWord.category && (
          <div className="text-sm text-gray-600 mb-2">
            分類：{currentWord.category}
          </div>
        )}
        {showHints && currentWord.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {showHint ? '隱藏提示' : '顯示提示'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">💡 {currentWord.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 字母區域 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">可用字母：</h3>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {letters.map((letter) => (
            <motion.button
              key={letter.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLetterClick(letter)}
              draggable
              onDragStart={(e) => handleDragStart(e, letter)}
              className="w-12 h-12 bg-blue-100 border-2 border-blue-300 rounded-lg font-bold text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              {letter.letter.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 輸入區域 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">您的答案：</h3>
        <div
          className="min-h-16 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 mb-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {userInput ? (
            <div className="text-2xl font-bold text-gray-900 tracking-wider">
              {userInput.toUpperCase()}
            </div>
          ) : (
            <div className="text-gray-500">將字母拖拽到這裡或點擊字母</div>
          )}
        </div>

        {/* 結果反饋 */}
        <AnimatePresence>
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg text-center font-semibold ${
                isCorrect 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {isCorrect ? '🎉 正確！' : '❌ 不正確，再試一次！'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 控制按鈕 */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleBackspace}
            disabled={!userInput}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            退格
          </button>
          <button
            onClick={handleClear}
            disabled={!userInput}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            清空
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isCorrect === true}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交
          </button>
          {allowSkip && (
            <button
              onClick={skipWord}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              跳過
            </button>
          )}
        </div>
      </div>

      {/* 統計信息 */}
      <div className="text-center text-gray-600">
        <p>當前單詞嘗試次數：{wordAttempts}</p>
      </div>
    </div>
  );
};

export default Anagram;
