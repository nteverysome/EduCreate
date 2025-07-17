/**
 * Flying Fruit Game Component
 * 基於動態追蹤記憶機制的飛行水果遊戲
 * 根據WordWall Flying Fruit模板分析設計
 */
import React, { useState, useEffect, useRef } from 'react';
interface FruitItem {
  id: string;
  content: string;
  isCorrect: boolean;
  emoji: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isCollected: boolean;
  size: number;
}
interface FlyingFruitGameProps {
  question: string;
  correctAnswers: string[];
  incorrectAnswers: string[];
  fruitCount?: number;
  timeLimit?: number;
  speed?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function FlyingFruitGame({
  question,
  correctAnswers,
  incorrectAnswers,
  fruitCount = 15,
  timeLimit = 45,
  speed = 2,
  onComplete,
  onScoreUpdate
}: FlyingFruitGameProps) {
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [score, setScore] = useState(0);
  const [correctCollected, setCorrectCollected] = useState(0);
  const [incorrectCollected, setIncorrectCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameArea] = useState({ width: 800, height: 600 });
  const [basketPosition, setBasketPosition] = useState({ x: 400, y: 550 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const fruitEmojis = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍'];
  // 初始化水果
  useEffect(() => {
    generateFruits();
  }, [correctAnswers, incorrectAnswers, fruitCount]);
  // 計時器
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameComplete();
    }
  }, [gameStarted, timeLeft, gameCompleted]);
  // 水果移動動畫
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const animationInterval = setInterval(() => {
      setFruits(prev => prev.map(fruit => {
        if (fruit.isCollected) return fruit;
        let newX = fruit.position.x + fruit.velocity.x * speed;
        let newY = fruit.position.y + fruit.velocity.y * speed;
        let newVelX = fruit.velocity.x;
        let newVelY = fruit.velocity.y;
        // 邊界碰撞檢測
        if (newX <= 0 || newX >= gameArea.width - 60) {
          newVelX = -newVelX;
          newX = Math.max(0, Math.min(gameArea.width - 60, newX));
        }
        if (newY <= 0 || newY >= gameArea.height - 60) {
          newVelY = -newVelY;
          newY = Math.max(0, Math.min(gameArea.height - 60, newY));
        }
        return {
          ...fruit,
          position: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY }
        };
      }));
    }, 50);
    return () => clearInterval(animationInterval);
  }, [gameStarted, gameCompleted, speed, gameArea]);
  // 鼠標移動控制籃子
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameStarted || gameCompleted || !gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setBasketPosition(prev => ({
        x: Math.max(25, Math.min(gameArea.width - 75, x - 25)),
        y: prev.y
      }));
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [gameStarted, gameCompleted, gameArea.width]);
  // 碰撞檢測
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const collisionInterval = setInterval(() => {
      setFruits(prev => prev.map(fruit => {
        if (fruit.isCollected) return fruit;
        // 檢查與籃子的碰撞
        const fruitCenterX = fruit.position.x + 30;
        const fruitCenterY = fruit.position.y + 30;
        const basketCenterX = basketPosition.x + 25;
        const basketCenterY = basketPosition.y + 15;
        const distance = Math.sqrt(
          Math.pow(fruitCenterX - basketCenterX, 2) + 
          Math.pow(fruitCenterY - basketCenterY, 2)
        );
        if (distance < 40) {
          handleFruitCollect(fruit);
          return { ...fruit, isCollected: true };
        }
        return fruit;
      }));
    }, 50);
    return () => clearInterval(collisionInterval);
  }, [gameStarted, gameCompleted, basketPosition]);
  const generateFruits = () => {
    const allAnswers = [...correctAnswers, ...incorrectAnswers];
    const selectedAnswers = allAnswers
      .sort(() => Math.random() - 0.5)
      .slice(0, fruitCount);
    const newFruits: FruitItem[] = selectedAnswers.map((answer, index) => ({
      id: `fruit-${index}`,
      content: answer,
      isCorrect: correctAnswers.includes(answer),
      emoji: fruitEmojis[index % fruitEmojis.length],
      position: {
        x: Math.random() * (gameArea.width - 60),
        y: Math.random() * (gameArea.height - 200)
      },
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      },
      isCollected: false,
      size: 60
    }));
    setFruits(newFruits);
  };
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleFruitCollect = (fruit: FruitItem) => {
    if (fruit.isCorrect) {
      const points = 15;
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setCorrectCollected(prev => prev + 1);
      setFeedbackMessage(`正確！+${points} 分`);
      // 檢查是否收集完所有正確水果
      if (correctCollected + 1 >= correctAnswers.length) {
        setTimeout(() => {
          handleGameComplete();
        }, 1000);
      }
    } else {
      setScore(prev => Math.max(0, prev - 8));
      setIncorrectCollected(prev => prev + 1);
      setFeedbackMessage('錯誤！-8 分');
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 800);
    // 播放收集音效
    playCollectSound(fruit.isCorrect);
  };
  const playCollectSound = (isCorrect: boolean) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    if (isCorrect) {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    } else {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
    }
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    // 完成獎勵
    const completionBonus = correctCollected === correctAnswers.length ? 50 : 0;
    const timeBonus = Math.max(0, Math.floor(timeLeft * 2));
    const finalScore = score + completionBonus + timeBonus;
    setScore(finalScore);
    onScoreUpdate?.(finalScore);
    onComplete?.(finalScore, timeUsed);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">飛行水果</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          移動籃子收集正確的飛行水果！基於動態追蹤記憶機制，提高您的注意力和手眼協調能力。
        </p>
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">遊戲目標：</h3>
          <p className="text-green-800 text-lg font-medium">{question}</p>
        </div>
        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-2">遊戲設置：</h3>
          <div className="text-orange-800 text-sm space-y-1">
            <p>水果數量: {fruitCount}</p>
            <p>正確答案: {correctAnswers.length} 個</p>
            <p>時間限制: {timeLimit} 秒</p>
            <p>飛行速度: {speed}x</p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
        >
          開始收集
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = (correctAnswers.length > 0) ? (correctCollected / correctAnswers.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">收集完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確收集: {correctCollected}/{correctAnswers.length}</p>
          <p className="text-gray-600">錯誤收集: {incorrectCollected}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
          {correctCollected === correctAnswers.length && (
            <p className="text-green-600 font-semibold mt-2">🎉 完美收集！</p>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-green-600">
            正確: {correctCollected}/{correctAnswers.length}
          </span>
          <span className="text-sm text-red-600">錯誤: {incorrectCollected}</span>
        </div>
        <div className={`text-lg font-semibold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
          時間: {timeLeft}秒
        </div>
      </div>
      {/* 問題顯示 */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg text-center">
        <h3 className="text-xl font-bold text-green-900">{question}</h3>
        <p className="text-green-700 text-sm mt-2">移動鼠標控制籃子收集正確的水果！</p>
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 遊戲區域 */}
      <div 
        ref={gameAreaRef}
        className="relative bg-gradient-to-b from-sky-200 to-green-200 rounded-lg overflow-hidden cursor-none"
        style={{ height: `${gameArea.height}px` }}
      >
        {/* 背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-4xl">☁️</div>
          <div className="absolute top-20 right-20 text-3xl">☁️</div>
          <div className="absolute top-32 left-1/3 text-5xl">☁️</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">🌳</div>
          <div className="absolute bottom-10 right-1/4 text-6xl">🌳</div>
        </div>
        {/* 飛行水果 */}
        {fruits.map((fruit) => (
          <div
            key={fruit.id}
            className={`absolute transition-opacity duration-300 ${
              fruit.isCollected ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              left: `${fruit.position.x}px`,
              top: `${fruit.position.y}px`,
              fontSize: '3rem',
              transform: 'rotate(0deg)',
              animation: fruit.isCollected ? 'none' : 'spin 2s linear infinite'
            }}
          >
            <div className="relative">
              <div className="text-4xl">{fruit.emoji}</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white bg-black bg-opacity-70 rounded px-1">
                  {fruit.content}
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* 收集籃子 */}
        <div
          className="absolute transition-all duration-100"
          style={{
            left: `${basketPosition.x}px`,
            top: `${basketPosition.y}px`
          }}
        >
          <div className="text-5xl">🧺</div>
        </div>
        {/* 進度指示器 */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white bg-opacity-90 rounded-lg p-3">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>收集進度</span>
              <span>{correctCollected}/{correctAnswers.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(correctCollected / correctAnswers.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 操作說明 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          <li>• 移動鼠標控制籃子位置</li>
          <li>• 收集符合問題條件的水果</li>
          <li>• 正確的水果 +15 分，錯誤的水果 -8 分</li>
          <li>• 水果會在遊戲區域內飛行和彈跳</li>
          <li>• 在時間結束前收集所有正確答案</li>
          <li>• 完成所有正確答案可獲得額外獎勵</li>
        </ul>
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
