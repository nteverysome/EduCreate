import React, { useState, useEffect } from 'react';
export interface ScrambleWord {
  id: string;
  word: string;
  scrambled: string;
  hint?: string;
  category?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
}
interface WordScrambleGameProps {
  words: ScrambleWord[];
  timeLimit?: number;
  showTimer?: boolean;
  onComplete?: (results: any) => void;
}
export default function WordScrambleGame({
  words,
  timeLimit = 120,
  showTimer = true,
  onComplete
}: WordScrambleGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const currentWord = words[currentWordIndex];
  // 初始化打亂的字母
  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(currentWord.scrambled.split(''));
    }
  }, [currentWord]);
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
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentWordIndex(0);
    setUserAnswer('');
    setScore(0);
    setTimeLeft(timeLimit);
    setShowResult(false);
    setAnswers({});
    if (words[0]) {
      setScrambledLetters(words[0].scrambled.split(''));
    }
  };
  // 重新打亂字母
  const reshuffleLetters = () => {
    if (!currentWord) return;
    const shuffled = [...currentWord.scrambled.split('')].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
  };
  // 點擊字母
  const clickLetter = (index: number) => {
    if (showResult) return;
    const letter = scrambledLetters[index];
    setUserAnswer(prev => prev + letter);
    // 移除已點擊的字母
    setScrambledLetters(prev => prev.filter((_, i) => i !== index));
  };
  // 清除答案
  const clearAnswer = () => {
    if (showResult) return;
    setUserAnswer('');
    if (currentWord) {
      setScrambledLetters(currentWord.scrambled.split(''));
    }
  };
  // 提交答案
  const submitAnswer = () => {
    if (!userAnswer.trim() || showResult) return;
    const correct = userAnswer.toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    // 記錄答案
    const newAnswers = { ...answers, [currentWord.id]: userAnswer };
    setAnswers(newAnswers);
    // 計分
    if (correct) {
      const timeBonus = Math.max(0, Math.floor(timeLeft / 10));
      setScore(prev => prev + currentWord.points + timeBonus);
    }
    // 2秒後進入下一題
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setUserAnswer('');
        setShowResult(false);
        const nextWord = words[currentWordIndex + 1];
        if (nextWord) {
          setScrambledLetters(nextWord.scrambled.split(''));
        }
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const correctAnswers = words.filter(word => 
        answers[word.id] && answers[word.id].toLowerCase() === word.word.toLowerCase()
      ).length;
      const totalWords = words.length;
      const accuracy = Math.round((correctAnswers / totalWords) * 100);
      const timeSpent = timeLimit - timeLeft;
      const results = {
        score,
        correctAnswers,
        totalWords,
        accuracy,
        timeSpent,
        answers
      };
      onComplete?.(results);
    }
  }, [gameCompleted, score, answers, words, timeLimit, timeLeft, onComplete]);
  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🔤</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">單詞拼圖遊戲</h2>
        <p className="text-gray-600 mb-6">
          重新排列字母組成正確的單詞！共 {words.length} 個單詞，限時 {Math.floor(timeLimit / 60)} 分鐘。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-yellow-500 text-white text-xl font-bold rounded-lg hover:bg-yellow-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const correctAnswers = words.filter(word => 
      answers[word.id] && answers[word.id].toLowerCase() === word.word.toLowerCase()
    ).length;
    const accuracy = Math.round((correctAnswers / words.length) * 100);
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
              <span className="text-gray-600">正確答案:</span>
              <span className="font-bold text-blue-600">{correctAnswers}/{words.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">用時:</span>
              <span className="font-bold text-orange-600">{formatTime(timeLimit - timeLeft)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">
            {currentWordIndex + 1}/{words.length}
          </div>
          <div className="text-sm text-gray-600">單詞</div>
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
      {/* 遊戲區域 */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            重新排列字母組成正確的單詞
          </h3>
          {/* 提示和分類 */}
          {currentWord.category && (
            <div className="text-sm text-gray-600 mb-2">
              分類: {currentWord.category}
            </div>
          )}
          {currentWord.hint && (
            <div className="text-sm text-blue-600 mb-4">
              💡 提示: {currentWord.hint}
            </div>
          )}
        </div>
        {/* 用戶答案顯示 */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-blue-600 min-h-[3rem] p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            {userAnswer || '點擊下方字母組成單詞...'}
          </div>
        </div>
        {/* 打亂的字母 */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {scrambledLetters.map((letter, index) => (
            <button
              key={index}
              onClick={() => clickLetter(index)}
              disabled={showResult}
              className="w-12 h-12 text-xl font-bold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {letter}
            </button>
          ))}
        </div>
        {/* 控制按鈕 */}
        {!showResult && (
          <div className="flex justify-center gap-4">
            <button
              onClick={clearAnswer}
              className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
            >
              清除
            </button>
            <button
              onClick={reshuffleLetters}
              className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
            >
              重新打亂
            </button>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              提交答案
            </button>
          </div>
        )}
        {/* 結果反饋 */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{isCorrect ? '✅' : '❌'}</span>
              <span className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '正確！' : '錯誤！'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-red-700 text-sm">
                正確答案：{currentWord.word}
              </p>
            )}
          </div>
        )}
      </div>
      {/* 進度條 */}
      <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
