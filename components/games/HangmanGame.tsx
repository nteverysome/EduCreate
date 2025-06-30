import React, { useState, useEffect } from 'react';

export interface HangmanWord {
  id: string;
  word: string;
  hint?: string;
  category?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
}

interface HangmanGameProps {
  words: HangmanWord[];
  maxWrongGuesses?: number;
  onComplete?: (results: any) => void;
}

export default function HangmanGame({
  words,
  maxWrongGuesses = 6,
  onComplete
}: HangmanGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentWordCompleted, setCurrentWordCompleted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const currentWord = words[currentWordIndex];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // 檢查當前單詞是否完成
  useEffect(() => {
    if (!currentWord || !gameStarted) return;

    const wordLetters = currentWord.word.toUpperCase().split('').filter(letter => /[A-Z]/.test(letter));
    const isCompleted = wordLetters.every(letter => guessedLetters.has(letter));
    
    if (isCompleted && !currentWordCompleted) {
      setCurrentWordCompleted(true);
      setScore(prev => prev + currentWord.points);
      
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          // 下一個單詞
          setCurrentWordIndex(prev => prev + 1);
          setGuessedLetters(new Set());
          setWrongGuesses(0);
          setCurrentWordCompleted(false);
        } else {
          // 遊戲完成
          setGameCompleted(true);
          setGameWon(true);
        }
      }, 2000);
    }
  }, [guessedLetters, currentWord, gameStarted, currentWordCompleted, currentWordIndex, words.length]);

  // 檢查遊戲失敗
  useEffect(() => {
    if (wrongGuesses >= maxWrongGuesses) {
      setGameCompleted(true);
      setGameWon(false);
    }
  }, [wrongGuesses, maxWrongGuesses]);

  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentWordIndex(0);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setScore(0);
    setCurrentWordCompleted(false);
    setGameWon(false);
  };

  // 猜字母
  const guessLetter = (letter: string) => {
    if (!gameStarted || gameCompleted || currentWordCompleted) return;
    if (guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessedLetters);

    // 檢查字母是否在單詞中
    if (!currentWord.word.toUpperCase().includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const completedWords = currentWordIndex + (currentWordCompleted ? 1 : 0);
      const totalWords = words.length;
      const accuracy = Math.round((completedWords / totalWords) * 100);

      const results = {
        score,
        completedWords,
        totalWords,
        accuracy,
        gameWon,
        wrongGuesses,
        maxWrongGuesses
      };

      onComplete?.(results);
    }
  }, [gameCompleted, score, currentWordIndex, currentWordCompleted, words.length, gameWon, wrongGuesses, maxWrongGuesses, onComplete]);

  // 渲染單詞顯示
  const renderWord = () => {
    if (!currentWord) return '';
    
    return currentWord.word.toUpperCase().split('').map((char, index) => {
      if (char === ' ') {
        return <span key={index} className="mx-2">　</span>;
      } else if (!/[A-Z]/.test(char)) {
        return <span key={index} className="mx-1">{char}</span>;
      } else if (guessedLetters.has(char)) {
        return (
          <span key={index} className="inline-block w-8 h-8 mx-1 text-center border-b-2 border-blue-500 text-blue-600 font-bold">
            {char}
          </span>
        );
      } else {
        return (
          <span key={index} className="inline-block w-8 h-8 mx-1 text-center border-b-2 border-gray-400">
            _
          </span>
        );
      }
    });
  };

  // 渲染絞刑架
  const renderHangman = () => {
    const parts = [
      '😵', // 頭
      '|',  // 身體
      '/',  // 左臂
      '\\', // 右臂
      '/',  // 左腿
      '\\', // 右腿
    ];

    return (
      <div className="text-center font-mono text-2xl leading-tight">
        <div>┌─────┐</div>
        <div>│     {wrongGuesses >= 1 ? parts[0] : '　'}</div>
        <div>│    {wrongGuesses >= 3 ? parts[2] : '　'}{wrongGuesses >= 2 ? parts[1] : '　'}{wrongGuesses >= 4 ? parts[3] : '　'}</div>
        <div>│    {wrongGuesses >= 5 ? parts[4] : '　'} {wrongGuesses >= 6 ? parts[5] : '　'}</div>
        <div>│</div>
        <div>└─────</div>
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🎯</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hangman 遊戲</h2>
        <p className="text-gray-600 mb-6">
          猜出隱藏的單詞！共 {words.length} 個單詞，最多可以錯 {maxWrongGuesses} 次。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-red-500 text-white text-xl font-bold rounded-lg hover:bg-red-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const completedWords = currentWordIndex + (currentWordCompleted ? 1 : 0);
    const accuracy = Math.round((completedWords / words.length) * 100);
    
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">{gameWon ? '🎉' : '😢'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {gameWon ? '恭喜完成！' : '遊戲結束！'}
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">最終得分:</span>
              <span className="font-bold text-green-600">{score} 分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成單詞:</span>
              <span className="font-bold text-blue-600">{completedWords}/{words.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">錯誤次數:</span>
              <span className="font-bold text-red-600">{wrongGuesses}/{maxWrongGuesses}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
          <div className="text-lg font-bold text-red-600">
            {currentWordIndex + 1}/{words.length}
          </div>
          <div className="text-sm text-gray-600">單詞</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{wrongGuesses}/{maxWrongGuesses}</div>
          <div className="text-sm text-gray-600">錯誤</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 絞刑架 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">絞刑架</h3>
          {renderHangman()}
        </div>

        {/* 遊戲區域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">猜單詞</h3>
          
          {/* 單詞顯示 */}
          <div className="text-center mb-6">
            <div className="text-2xl mb-4">
              {renderWord()}
            </div>
            
            {/* 提示和分類 */}
            {currentWord.category && (
              <div className="text-sm text-gray-600 mb-2">
                分類: {currentWord.category}
              </div>
            )}
            {currentWord.hint && (
              <div className="text-sm text-blue-600">
                💡 提示: {currentWord.hint}
              </div>
            )}
          </div>

          {/* 字母選擇 */}
          <div className="grid grid-cols-6 gap-2">
            {alphabet.map(letter => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && currentWord.word.toUpperCase().includes(letter);
              const isWrong = isGuessed && !currentWord.word.toUpperCase().includes(letter);
              
              return (
                <button
                  key={letter}
                  onClick={() => guessLetter(letter)}
                  disabled={isGuessed || currentWordCompleted}
                  className={`p-2 text-sm font-bold rounded transition-colors ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500 text-white'
                      : isGuessed
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 當前單詞完成提示 */}
      {currentWordCompleted && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl mr-2">🎉</span>
            <span className="text-green-800 font-bold">
              太棒了！單詞 "{currentWord.word}" 猜對了！
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
