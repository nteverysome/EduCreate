import React, { useState, useEffect } from 'react';
export interface GameshowQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
}
interface GameshowQuizGameProps {
  questions: GameshowQuestion[];
  timePerQuestion?: number;
  onComplete?: (results: any) => void;
}
export default function GameshowQuizGame({
  questions,
  timePerQuestion = 15,
  onComplete
}: GameshowQuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: number}>({});
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  // 計時器
  useEffect(() => {
    if (!gameStarted || gameCompleted || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間到，自動進入下一題
          handleTimeUp();
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, showResult, currentQuestionIndex]);
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(timePerQuestion);
    setShowResult(false);
    setAnswers({});
    setStreak(0);
    setMaxStreak(0);
  };
  // 時間到處理
  const handleTimeUp = () => {
    setSelectedAnswer(-1); // 表示超時
    setShowResult(true);
    setStreak(0); // 重置連擊
    // 記錄答案
    const newAnswers = { ...answers, [currentQuestion.id]: -1 };
    setAnswers(newAnswers);
    // 2秒後進入下一題
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };
  // 選擇答案
  const selectAnswer = (answerIndex: number) => {
    if (showResult || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    // 記錄答案
    const newAnswers = { ...answers, [currentQuestion.id]: answerIndex };
    setAnswers(newAnswers);
    // 計分和連擊
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3); // 時間獎勵
      const streakBonus = streak * 5; // 連擊獎勵
      const totalPoints = currentQuestion.points + timeBonus + streakBonus;
      setScore(prev => prev + totalPoints);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    // 2秒後進入下一題
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };
  // 下一題
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(timePerQuestion);
    } else {
      setGameCompleted(true);
    }
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const correctAnswers = questions.filter(q => 
        answers[q.id] === q.correctAnswer
      ).length;
      const totalQuestions = questions.length;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      const results = {
        score,
        correctAnswers,
        totalQuestions,
        accuracy,
        maxStreak,
        answers
      };
      onComplete?.(results);
    }
  }, [gameCompleted, score, answers, questions, maxStreak, onComplete]);
  // 獲取選項樣式
  const getOptionStyle = (optionIndex: number) => {
    if (!showResult) {
      return 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105';
    }
    if (optionIndex === currentQuestion.correctAnswer) {
      return 'bg-green-500 text-white animate-pulse';
    }
    if (optionIndex === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-300 text-gray-600';
  };
  // 獲取進度百分比
  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🎪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲節目問答</h2>
        <p className="text-gray-600 mb-6">
          像電視遊戲節目一樣的快節奏問答！共 {questions.length} 題，每題 {timePerQuestion} 秒。
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-md mx-auto">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>遊戲規則：</strong><br/>
                • 每題限時 {timePerQuestion} 秒<br/>
                • 答對得分，連續答對有獎勵<br/>
                • 速度越快獎勵越多<br/>
                • 超時或答錯會重置連擊
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-yellow-500 text-white text-xl font-bold rounded-lg hover:bg-yellow-600 transition-colors animate-bounce"
        >
          開始挑戰！
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">挑戰完成！</h2>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6 max-w-md mx-auto mb-6">
          <div className="text-3xl font-bold mb-2">{score} 分</div>
          <div className="text-lg">最終得分</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">正確答案:</span>
              <span className="font-bold text-blue-600">{correctAnswers}/{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最高連擊:</span>
              <span className="font-bold text-orange-600">{maxStreak}</span>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          再次挑戰
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* 遊戲狀態欄 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-sm">得分</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentQuestionIndex + 1}/{questions.length}</div>
            <div className="text-sm">題目</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-sm">連擊</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'animate-pulse text-red-300' : ''}`}>
              {timeLeft}
            </div>
            <div className="text-sm">秒</div>
          </div>
        </div>
        {/* 進度條 */}
        <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      {/* 問題區域 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          {currentQuestion.category && (
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              {currentQuestion.category}
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
            <span>難度:</span>
            <span className={`px-2 py-1 rounded ${
              currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
              currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentQuestion.difficulty}
            </span>
            <span>•</span>
            <span>{currentQuestion.points} 分</span>
          </div>
        </div>
        {/* 答案選項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(index)}
              disabled={showResult}
              className={`p-6 text-lg font-bold rounded-lg border-2 transition-all duration-200 ${getOptionStyle(index)} ${
                showResult ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-3 text-xl">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
        {/* 結果反饋 */}
        {showResult && (
          <div className="mt-6 text-center">
            {selectedAnswer === -1 ? (
              <div className="text-red-600 text-xl font-bold animate-pulse">
                ⏰ 時間到！
              </div>
            ) : selectedAnswer === currentQuestion.correctAnswer ? (
              <div className="text-green-600 text-xl font-bold animate-bounce">
                🎉 正確！{streak > 1 && ` 連擊 ${streak}！`}
              </div>
            ) : (
              <div className="text-red-600 text-xl font-bold">
                ❌ 錯誤！正確答案是 {String.fromCharCode(65 + currentQuestion.correctAnswer)}
              </div>
            )}
          </div>
        )}
      </div>
      {/* 時間警告 */}
      {timeLeft <= 5 && !showResult && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-red-500 text-white text-6xl font-bold px-8 py-4 rounded-lg animate-pulse">
            {timeLeft}
          </div>
        </div>
      )}
    </div>
  );
}
