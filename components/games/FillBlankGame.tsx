import React, { useState, useEffect } from 'react';
export interface FillBlankQuestion {
  id: string;
  sentence: string; // 包含 ___ 的句子
  correctAnswer: string;
  alternatives?: string[]; // 可接受的其他答案
  hint?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
}
interface FillBlankGameProps {
  questions: FillBlankQuestion[];
  timeLimit?: number;
  showTimer?: boolean;
  onComplete?: (results: any) => void;
}
export default function FillBlankGame({
  questions,
  timeLimit = 120,
  showTimer = true,
  onComplete
}: FillBlankGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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
    setCurrentAnswer('');
    setTimeLeft(timeLimit);
    setShowResult(false);
  };
  // 檢查答案是否正確
  const checkAnswer = (answer: string) => {
    const trimmedAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQuestion.correctAnswer.toLowerCase();
    const alternatives = currentQuestion.alternatives?.map(alt => alt.toLowerCase()) || [];
    return trimmedAnswer === correctAnswer || alternatives.includes(trimmedAnswer);
  };
  // 提交答案
  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const correct = checkAnswer(currentAnswer);
    setIsCorrect(correct);
    setShowResult(true);
    // 記錄答案
    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);
    // 計分
    if (correct) {
      setScore(prev => prev + currentQuestion.points);
    }
    // 2秒後進入下一題
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setShowResult(false);
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };
  // 處理 Enter 鍵提交
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      submitAnswer();
    }
  };
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const correctAnswers = questions.filter(q => 
        answers[q.id] && checkAnswer(answers[q.id])
      ).length;
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
  }, [gameCompleted]);
  // 渲染句子，將 ___ 替換為輸入框
  const renderSentence = () => {
    const parts = currentQuestion.sentence.split('___');
    if (parts.length === 1) {
      return <span>{currentQuestion.sentence}</span>;
    }
    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              showResult ? (
                <span className={`px-2 py-1 rounded font-bold ${
                  isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {currentAnswer}
                </span>
              ) : (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-500 bg-transparent text-center font-bold text-blue-600 focus:outline-none focus:border-blue-700"
                  style={{ minWidth: '100px', width: `${Math.max(100, currentAnswer.length * 12)}px` }}
                  placeholder="?"
                  autoFocus
                />
              )
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };
  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">📝</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">填空遊戲</h2>
        <p className="text-gray-600 mb-6">
          在空白處填入正確的詞語。共 {questions.length} 題，限時 {Math.floor(timeLimit / 60)} 分鐘。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-purple-500 text-white text-xl font-bold rounded-lg hover:bg-purple-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const correctAnswers = questions.filter(q => 
      answers[q.id] && checkAnswer(answers[q.id])
    ).length;
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
          className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
          <div className="text-lg font-bold text-purple-600">
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
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            請在空白處填入正確的詞語：
          </h3>
          <div className="text-xl text-gray-700 leading-relaxed p-6 bg-gray-50 rounded-lg">
            {renderSentence()}
          </div>
        </div>
        {/* 提示 */}
        {currentQuestion.hint && !showResult && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">💡</span>
              <span className="text-yellow-800 font-medium">提示：{currentQuestion.hint}</span>
            </div>
          </div>
        )}
        {/* 提交按鈕 */}
        {!showResult && (
          <div className="text-center">
            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim()}
              className="px-8 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              提交答案
            </button>
            <p className="text-sm text-gray-500 mt-2">或按 Enter 鍵提交</p>
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
                正確答案：{currentQuestion.correctAnswer}
                {currentQuestion.alternatives && currentQuestion.alternatives.length > 0 && (
                  <span> (或: {currentQuestion.alternatives.join(', ')})</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
      {/* 進度條 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
