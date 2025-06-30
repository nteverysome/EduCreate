import React, { useState, useEffect, useCallback } from 'react';

export interface BalloonQuestion {
  id: string;
  question: string;
  answer: string;
  alternatives?: string[];
  category?: string;
  points: number;
}

interface BalloonPopGameProps {
  questions: BalloonQuestion[];
  gameTime?: number;
  balloonSpeed?: number;
  onComplete?: (results: any) => void;
}

interface Balloon {
  id: string;
  question: BalloonQuestion;
  x: number;
  y: number;
  color: string;
  speed: number;
  isPopped: boolean;
}

export default function BalloonPopGame({
  questions,
  gameTime = 60,
  balloonSpeed = 2,
  onComplete
}: BalloonPopGameProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameTime);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedBalloon, setSelectedBalloon] = useState<Balloon | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf'];

  // 創建氣球
  const createBalloon = useCallback(() => {
    if (!gameStarted || gameCompleted || questions.length === 0) return;

    const question = questions[Math.floor(Math.random() * questions.length)];
    const newBalloon: Balloon = {
      id: `balloon-${Date.now()}-${Math.random()}`,
      question,
      x: Math.random() * (window.innerWidth - 100),
      y: window.innerHeight,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: balloonSpeed + Math.random() * 2,
      isPopped: false
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [gameStarted, gameCompleted, questions, balloonSpeed, colors]);

  // 移動氣球
  const moveBalloons = useCallback(() => {
    setBalloons(prev => prev.map(balloon => ({
      ...balloon,
      y: balloon.y - balloon.speed
    })).filter(balloon => balloon.y > -100 && !balloon.isPopped));
  }, []);

  // 計時器
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

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
  }, [gameStarted, gameCompleted]);

  // 氣球生成器
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const balloonGenerator = setInterval(createBalloon, 2000);
    return () => clearInterval(balloonGenerator);
  }, [gameStarted, gameCompleted, createBalloon]);

  // 氣球移動
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const moveInterval = setInterval(moveBalloons, 50);
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameCompleted, moveBalloons]);

  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setBalloons([]);
    setScore(0);
    setTimeLeft(gameTime);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setSelectedBalloon(null);
    setShowAnswerDialog(false);
    setUserAnswer('');
  };

  // 點擊氣球
  const popBalloon = (balloon: Balloon) => {
    if (!gameStarted || gameCompleted || showAnswerDialog) return;

    setSelectedBalloon(balloon);
    setShowAnswerDialog(true);
    setUserAnswer('');

    // 移除被點擊的氣球
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
  };

  // 檢查答案
  const checkAnswer = (answer: string) => {
    const trimmedAnswer = answer.trim().toLowerCase();
    const correctAnswer = selectedBalloon!.question.answer.toLowerCase();
    const alternatives = selectedBalloon!.question.alternatives?.map(alt => alt.toLowerCase()) || [];
    
    return trimmedAnswer === correctAnswer || alternatives.includes(trimmedAnswer);
  };

  // 提交答案
  const submitAnswer = () => {
    if (!selectedBalloon || !userAnswer.trim()) return;

    setTotalAttempts(prev => prev + 1);
    const isCorrect = checkAnswer(userAnswer);

    if (isCorrect) {
      setScore(prev => prev + selectedBalloon.question.points);
      setCorrectAnswers(prev => prev + 1);
    }

    setShowAnswerDialog(false);
    setSelectedBalloon(null);
    setUserAnswer('');
  };

  // 跳過問題
  const skipQuestion = () => {
    setTotalAttempts(prev => prev + 1);
    setShowAnswerDialog(false);
    setSelectedBalloon(null);
    setUserAnswer('');
  };

  // 處理鍵盤事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showAnswerDialog) {
      submitAnswer();
    } else if (e.key === 'Escape' && showAnswerDialog) {
      skipQuestion();
    }
  };

  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
      
      const results = {
        score,
        correctAnswers,
        totalAttempts,
        accuracy,
        timeSpent: gameTime - timeLeft
      };

      onComplete?.(results);
    }
  }, [gameCompleted, score, correctAnswers, totalAttempts, gameTime, timeLeft, onComplete]);

  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🎈</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">氣球爆破遊戲</h2>
        <p className="text-gray-600 mb-6">
          點擊飛上來的氣球並回答問題！限時 {gameTime} 秒，答對得分。
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 max-w-md mx-auto">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>遊戲規則：</strong><br/>
                • 點擊氣球回答問題<br/>
                • 答對得分，答錯不扣分<br/>
                • 氣球會不斷飛上來<br/>
                • 按 Enter 提交，Esc 跳過
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-pink-500 text-white text-xl font-bold rounded-lg hover:bg-pink-600 transition-colors animate-bounce"
        >
          開始遊戲
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲完成！</h2>
        
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg p-6 max-w-md mx-auto mb-6">
          <div className="text-3xl font-bold mb-2">{score} 分</div>
          <div className="text-lg">最終得分</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">正確答案:</span>
              <span className="font-bold text-blue-600">{correctAnswers}/{totalAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">遊戲時間:</span>
              <span className="font-bold text-orange-600">{formatTime(gameTime)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-200 to-blue-400 overflow-hidden">
      {/* 遊戲狀態欄 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white bg-opacity-90 rounded-lg p-4 flex justify-between items-center">
          <div className="text-center">
            <div className="text-lg font-bold text-pink-600">{score}</div>
            <div className="text-sm text-gray-600">得分</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-600">剩餘時間</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{correctAnswers}/{totalAttempts}</div>
            <div className="text-sm text-gray-600">正確率</div>
          </div>
        </div>
      </div>

      {/* 氣球 */}
      {balloons.map(balloon => (
        <div
          key={balloon.id}
          onClick={() => popBalloon(balloon)}
          className="absolute cursor-pointer transform hover:scale-110 transition-transform"
          style={{
            left: balloon.x,
            top: balloon.y,
            zIndex: 5
          }}
        >
          <div className="relative">
            {/* 氣球 */}
            <div
              className="w-16 h-20 rounded-full shadow-lg animate-bounce"
              style={{ backgroundColor: balloon.color }}
            >
              <div className="absolute inset-2 bg-white bg-opacity-30 rounded-full"></div>
            </div>
            {/* 氣球線 */}
            <div className="w-0.5 h-8 bg-gray-600 mx-auto"></div>
            {/* 問題預覽 */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {balloon.question.question.substring(0, 20)}...
            </div>
          </div>
        </div>
      ))}

      {/* 答題對話框 */}
      {showAnswerDialog && selectedBalloon && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onKeyDown={handleKeyPress}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">回答問題</h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">{selectedBalloon.question.question}</p>
              {selectedBalloon.question.category && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {selectedBalloon.question.category}
                </span>
              )}
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="輸入你的答案..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={submitAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                提交 (Enter)
              </button>
              <button
                onClick={skipQuestion}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                跳過 (Esc)
              </button>
            </div>

            <div className="mt-3 text-center text-sm text-gray-600">
              得分: {selectedBalloon.question.points} 分
            </div>
          </div>
        </div>
      )}

      {/* 雲朵裝飾 */}
      <div className="absolute top-20 left-10 text-white text-4xl opacity-70 animate-pulse">☁️</div>
      <div className="absolute top-32 right-20 text-white text-3xl opacity-50 animate-pulse">☁️</div>
      <div className="absolute top-48 left-1/3 text-white text-5xl opacity-60 animate-pulse">☁️</div>
    </div>
  );
}
