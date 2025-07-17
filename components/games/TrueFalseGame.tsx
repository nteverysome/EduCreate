import React, { useState, useEffect } from 'react';
export interface TrueFalseQuestion {
  id: string;
  statement: string;
  correct: boolean;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
}
interface TrueFalseGameProps {
  questions: TrueFalseQuestion[];
  timeLimit?: number;
  showTimer?: boolean;
  onComplete?: (results: any) => void;
}
export default function TrueFalseGame({
  questions,
  timeLimit = 60,
  showTimer = true,
  onComplete
}: TrueFalseGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: boolean}>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const currentQuestion = questions[currentQuestionIndex];
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
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setTimeLeft(timeLimit);
    setShowResult(false);
    setSelectedAnswer(null);
  };
  // 選擇答案
  const selectAnswer = (answer: boolean) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    // 記錄答案
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    // 計分
    if (answer === currentQuestion.correct) {
      setScore(prev => prev + currentQuestion.points);
    }
    // 2秒後進入下一題
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const correctAnswers = questions.filter(q => answers[q.id] === q.correct).length;
      const totalQuestions = questions.length;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      const timeSpent = timeLimit - timeLeft;
      const results = {
        score,
        correctAnswers,
        totalQuestions,
        accuracy,
        timeSpent,
        answers
      };
      onComplete?.(results);
    }
  }, [gameCompleted, score, answers, questions, timeLimit, timeLeft, onComplete]);
  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">True/False 遊戲</h2>
        <p className="text-gray-600 mb-6">
          判斷陳述是否正確。共 {questions.length} 題，每題 {Math.round(timeLimit / questions.length)} 秒。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correct).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
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
              <span className="font-bold text-blue-600">{correctAnswers}/{questions.length}</span>
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
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {currentQuestionIndex + 1}/{questions.length}
          </div>
          <div className="text-sm text-gray-600">題目</div>
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
      {/* 問題區域 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            請判斷以下陳述是否正確：
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            {currentQuestion.statement}
          </p>
        </div>
        {/* 答案選項 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectAnswer(true)}
            disabled={showResult}
            className={`p-6 text-xl font-bold rounded-lg border-2 transition-all duration-200 ${
              showResult
                ? selectedAnswer === true
                  ? currentQuestion.correct === true
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                  : currentQuestion.correct === true
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
                : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50 cursor-pointer'
            }`}
          >
            <div className="text-4xl mb-2">✅</div>
            <div>正確 (True)</div>
          </button>
          <button
            onClick={() => selectAnswer(false)}
            disabled={showResult}
            className={`p-6 text-xl font-bold rounded-lg border-2 transition-all duration-200 ${
              showResult
                ? selectedAnswer === false
                  ? currentQuestion.correct === false
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                  : currentQuestion.correct === false
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
                : 'bg-white border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div>錯誤 (False)</div>
          </button>
        </div>
        {/* 結果反饋 */}
        {showResult && (
          <div className="mt-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {selectedAnswer === currentQuestion.correct ? '✅' : '❌'}
              </span>
              <span className="font-bold text-blue-800">
                {selectedAnswer === currentQuestion.correct ? '正確！' : '錯誤！'}
              </span>
            </div>
            {currentQuestion.explanation && (
              <p className="text-blue-700 text-sm">
                解釋：{currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>
      {/* 進度條 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
