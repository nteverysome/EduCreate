import React, { useState, useEffect, useCallback } from 'react';
interface WhackAMoleProps {
  questions: Array<{
    question: string;
    correct: string;
    incorrect: string[];
  }>;
  gameTime?: number; // 遊戲時間（秒）
  moleSpeed?: number; // 地鼠出現速度（毫秒）
}
interface Mole {
  id: number;
  position: number;
  text: string;
  isCorrect: boolean;
  isVisible: boolean;
}
export default function WhackAMoleGame({ 
  questions, 
  gameTime = 60, 
  moleSpeed = 2000 
}: WhackAMoleProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameTime);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [nextMoleId, setNextMoleId] = useState(0);
  // 創建地鼠
  const createMole = useCallback(() => {
    if (gameEnded || !gameStarted) return;
    const question = questions[currentQuestion];
    const allAnswers = [question.correct, ...question.incorrect];
    const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    const isCorrect = randomAnswer === question.correct;
    const position = Math.floor(Math.random() * 9); // 9個洞
    const newMole: Mole = {
      id: nextMoleId,
      position,
      text: randomAnswer,
      isCorrect,
      isVisible: true
    };
    setMoles(prev => [...prev, newMole]);
    setNextMoleId(prev => prev + 1);
    // 地鼠自動消失
    setTimeout(() => {
      setMoles(prev => prev.filter(mole => mole.id !== newMole.id));
    }, moleSpeed * 0.8);
  }, [currentQuestion, questions, gameEnded, gameStarted, nextMoleId, moleSpeed]);
  // 打地鼠
  const whackMole = (mole: Mole) => {
    if (mole.isCorrect) {
      setScore(prev => prev + 10);
      // 正確答案後進入下一題
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5)); // 錯誤扣分
    }
    // 移除被打的地鼠
    setMoles(prev => prev.filter(m => m.id !== mole.id));
  };
  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(gameTime);
    setCurrentQuestion(0);
    setMoles([]);
    setNextMoleId(0);
  };
  // 重新開始
  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(gameTime);
    setCurrentQuestion(0);
    setMoles([]);
    setNextMoleId(0);
  };
  // 遊戲計時器
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);
  // 地鼠生成器
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const moleGenerator = setInterval(createMole, moleSpeed);
    return () => clearInterval(moleGenerator);
  }, [gameStarted, gameEnded, createMole, moleSpeed]);
  // 遊戲結束條件
  useEffect(() => {
    if (currentQuestion >= questions.length && gameStarted) {
      setGameEnded(true);
      setGameStarted(false);
    }
  }, [currentQuestion, questions.length, gameStarted]);
  if (!gameStarted && !gameEnded) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🔨 打地鼠遊戲</h2>
        <p className="text-lg mb-6 text-gray-600">
          打正確答案的地鼠！錯誤答案會扣分。
        </p>
        <div className="mb-6">
          <p className="text-sm text-gray-500">遊戲規則：</p>
          <ul className="text-sm text-gray-500 mt-2">
            <li>• 正確答案 +10 分</li>
            <li>• 錯誤答案 -5 分</li>
            <li>• 時間限制：{gameTime} 秒</li>
          </ul>
        </div>
        <button
          onClick={startGame}
          className="bg-green-500 text-white px-8 py-3 rounded-lg text-xl hover:bg-green-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameEnded) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 遊戲結束！</h2>
        <div className="text-2xl mb-6">
          <p>最終得分：<span className="text-green-600 font-bold">{score}</span></p>
          <p className="text-lg text-gray-600 mt-2">
            完成題目：{Math.min(currentQuestion, questions.length)} / {questions.length}
          </p>
        </div>
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg text-xl hover:bg-blue-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  const currentQ = questions[currentQuestion];
  return (
    <div>
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg">
        <div className="text-lg font-bold">
          得分: <span className="text-green-600">{score}</span>
        </div>
        <div className="text-lg font-bold">
          時間: <span className="text-red-600">{timeLeft}s</span>
        </div>
        <div className="text-lg font-bold">
          題目: {currentQuestion + 1}/{questions.length}
        </div>
      </div>
      {/* 當前問題 */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold bg-blue-100 p-4 rounded-lg">
          {currentQ?.question}
        </h3>
      </div>
      {/* 遊戲區域 */}
      <div className="relative bg-green-200 rounded-lg p-4" style={{ minHeight: '400px' }}>
        <div className="grid grid-cols-3 gap-4 h-full">
          {Array.from({ length: 9 }, (_, index) => {
            const moleInHole = moles.find(mole => mole.position === index && mole.isVisible);
            return (
              <div
                key={index}
                className="relative bg-brown-600 rounded-full border-4 border-brown-800 flex items-center justify-center"
                style={{ 
                  backgroundColor: '#8B4513',
                  borderColor: '#654321',
                  minHeight: '100px'
                }}
              >
                {/* 洞 */}
                <div className="absolute inset-2 bg-black rounded-full opacity-50"></div>
                {/* 地鼠 */}
                {moleInHole && (
                  <button
                    onClick={() => whackMole(moleInHole)}
                    className={`absolute inset-0 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all transform hover:scale-105 ${
                      moleInHole.isCorrect 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                    style={{
                      animation: 'molePopUp 0.3s ease-out'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🐹</div>
                      <div className="text-xs">{moleInHole.text}</div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes molePopUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
