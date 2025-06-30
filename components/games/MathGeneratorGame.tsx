/**
 * Math Generator Game Component
 * 基於數學記憶機制的數學題目生成遊戲
 * 根據WordWall Maths Generator模板分析設計
 */

import React, { useState, useEffect } from 'react';

interface MathProblem {
  id: string;
  question: string;
  answer: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  operands: number[];
  difficulty: number;
  steps?: string[];
}

interface MathGeneratorGameProps {
  operations: ('add' | 'subtract' | 'multiply' | 'divide')[];
  range: { min: number; max: number };
  questionCount: number;
  showSteps?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}

export default function MathGeneratorGame({
  operations,
  range,
  questionCount,
  showSteps = false,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: MathGeneratorGameProps) {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showStepsForCurrent, setShowStepsForCurrent] = useState(false);

  const currentProblem = problems[currentProblemIndex];

  // 生成數學題目
  useEffect(() => {
    if (gameStarted) {
      generateProblems();
    }
  }, [gameStarted]);

  // 計時器
  useEffect(() => {
    if (gameStarted && timeLimit > 0 && timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit > 0) {
      handleGameComplete();
    }
  }, [gameStarted, timeLeft, gameCompleted, timeLimit]);

  const generateProblems = () => {
    const newProblems: MathProblem[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const problem = generateSingleProblem(operation, i);
      newProblems.push(problem);
    }
    
    setProblems(newProblems);
  };

  const generateSingleProblem = (operation: string, index: number): MathProblem => {
    let operands: number[] = [];
    let answer: number = 0;
    let question: string = '';
    let steps: string[] = [];
    
    switch (operation) {
      case 'add':
        operands = [
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        ];
        answer = operands[0] + operands[1];
        question = `${operands[0]} + ${operands[1]} = ?`;
        steps = [
          `將 ${operands[0]} 和 ${operands[1]} 相加`,
          `${operands[0]} + ${operands[1]} = ${answer}`
        ];
        break;
        
      case 'subtract':
        // 確保結果為正數
        const larger = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const smaller = Math.floor(Math.random() * larger) + 1;
        operands = [larger, smaller];
        answer = operands[0] - operands[1];
        question = `${operands[0]} - ${operands[1]} = ?`;
        steps = [
          `從 ${operands[0]} 中減去 ${operands[1]}`,
          `${operands[0]} - ${operands[1]} = ${answer}`
        ];
        break;
        
      case 'multiply':
        operands = [
          Math.floor(Math.random() * 12) + 1, // 1-12
          Math.floor(Math.random() * 12) + 1  // 1-12
        ];
        answer = operands[0] * operands[1];
        question = `${operands[0]} × ${operands[1]} = ?`;
        steps = [
          `將 ${operands[0]} 乘以 ${operands[1]}`,
          `${operands[0]} × ${operands[1]} = ${answer}`
        ];
        break;
        
      case 'divide':
        // 生成能整除的除法
        const divisor = Math.floor(Math.random() * 12) + 1;
        const quotient = Math.floor(Math.random() * 12) + 1;
        const dividend = divisor * quotient;
        operands = [dividend, divisor];
        answer = quotient;
        question = `${operands[0]} ÷ ${operands[1]} = ?`;
        steps = [
          `將 ${operands[0]} 除以 ${operands[1]}`,
          `${operands[0]} ÷ ${operands[1]} = ${answer}`
        ];
        break;
    }
    
    return {
      id: `problem-${index}`,
      question,
      answer,
      operation: operation as any,
      operands,
      difficulty: calculateDifficulty(operation, operands),
      steps
    };
  };

  const calculateDifficulty = (operation: string, operands: number[]): number => {
    switch (operation) {
      case 'add':
      case 'subtract':
        return operands[0] > 50 || operands[1] > 50 ? 3 : operands[0] > 20 || operands[1] > 20 ? 2 : 1;
      case 'multiply':
        return operands[0] > 10 || operands[1] > 10 ? 3 : operands[0] > 5 || operands[1] > 5 ? 2 : 1;
      case 'divide':
        return operands[0] > 50 ? 3 : operands[0] > 20 ? 2 : 1;
      default:
        return 1;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) return;
    
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - currentProblem.answer) < 0.01; // 允許小數點誤差
    
    if (isCorrect) {
      const points = 10 + (currentProblem.difficulty * 5);
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage(`正確！+${points} 分`);
    } else {
      setWrongAnswers(prev => prev + 1);
      setFeedbackMessage(`錯誤！正確答案是 ${currentProblem.answer}`);
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      nextProblem();
    }, 2000);
  };

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setUserAnswer('');
      setShowStepsForCurrent(false);
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  const toggleSteps = () => {
    setShowStepsForCurrent(!showStepsForCurrent);
  };

  const getOperationSymbol = (operation: string): string => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '?';
    }
  };

  const getOperationName = (operation: string): string => {
    switch (operation) {
      case 'add': return '加法';
      case 'subtract': return '減法';
      case 'multiply': return '乘法';
      case 'divide': return '除法';
      default: return '運算';
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">數學生成器</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          自動生成數學題目進行練習。基於數學記憶機制，提高您的計算能力和數學思維。
        </p>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲設置：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>運算類型: {operations.map(op => getOperationName(op)).join(', ')}</p>
            <p>數字範圍: {range.min} - {range.max}</p>
            <p>題目數量: {questionCount}</p>
            <p>顯示步驟: {showSteps ? '是' : '否'}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          開始計算
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = problems.length > 0 ? (correctAnswers / problems.length) * 100 : 0;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">計算完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確答案: {correctAnswers}/{problems.length}</p>
          <p className="text-gray-600">錯誤答案: {wrongAnswers}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            題目 {currentProblemIndex + 1}/{problems.length}
          </span>
          <span className="text-sm text-green-600">正確: {correctAnswers}</span>
          <span className="text-sm text-red-600">錯誤: {wrongAnswers}</span>
        </div>
        {timeLimit > 0 && (
          <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
            時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {feedbackMessage}
        </div>
      )}

      {/* 題目區域 */}
      <div className="mb-8 text-center">
        <div className="mb-4">
          <span className={`px-3 py-1 text-sm rounded-full ${
            currentProblem.difficulty === 1 ? 'bg-green-100 text-green-800' :
            currentProblem.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {getOperationName(currentProblem.operation)} - 難度 {currentProblem.difficulty}
          </span>
        </div>
        
        <div className="text-4xl font-bold text-gray-800 mb-6 p-8 bg-gray-50 rounded-lg">
          {currentProblem.question}
        </div>

        {/* 答案輸入 */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="輸入答案..."
            className="px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none w-32"
            autoFocus
          />
          <button
            onClick={handleAnswerSubmit}
            disabled={!userAnswer.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            提交
          </button>
        </div>

        {/* 步驟顯示 */}
        {showSteps && (
          <div className="mb-6">
            <button
              onClick={toggleSteps}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors mb-4"
            >
              {showStepsForCurrent ? '隱藏步驟' : '顯示解題步驟'}
            </button>
            
            {showStepsForCurrent && currentProblem.steps && (
              <div className="p-4 bg-yellow-50 rounded-lg text-left">
                <h4 className="font-semibold text-yellow-800 mb-2">解題步驟：</h4>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                  {currentProblem.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>進度</span>
          <span>{currentProblemIndex + 1}/{problems.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 操作說明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          <li>• 在輸入框中輸入答案</li>
          <li>• 按 Enter 鍵或點擊"提交"按鈕</li>
          <li>• 正確答案會根據難度獲得不同分數</li>
          {showSteps && <li>• 可以查看解題步驟獲得幫助</li>}
        </ul>
      </div>
    </div>
  );
}
