/**
 * Type the Answer Game Component
 * 基於輸入記憶機制的答案輸入遊戲
 * 根據WordWall Type the Answer模板分析設計
 */
import React, { useState, useEffect, useRef } from 'react';
interface TypeQuestion {
  id: string;
  question: string;
  correctAnswers: string[];
  hint?: string;
  image?: string;
  caseSensitive?: boolean;
  exactMatch?: boolean;
}
interface TypeAnswerGameProps {
  questions: TypeQuestion[];
  timeLimit?: number;
  allowHints?: boolean;
  showProgress?: boolean;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function TypeAnswerGame({
  questions,
  timeLimit = 0,
  allowHints = true,
  showProgress = true,
  onComplete,
  onScoreUpdate
}: TypeAnswerGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuestion = questions[currentQuestionIndex];
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
  // 自動聚焦輸入框
  useEffect(() => {
    if (gameStarted && !gameCompleted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, gameStarted, gameCompleted]);
  // 重置問題狀態
  useEffect(() => {
    setUserAnswer('');
    setShowHint(false);
    setAttempts(0);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    setAttempts(prev => prev + 1);
    const answer = userAnswer.trim();
    // 檢查答案是否正確
    const isCorrect = currentQuestion.correctAnswers.some(correctAnswer => {
      if (currentQuestion.exactMatch) {
        return currentQuestion.caseSensitive 
          ? answer === correctAnswer
          : answer.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        return currentQuestion.caseSensitive
          ? correctAnswer.includes(answer)
          : correctAnswer.toLowerCase().includes(answer.toLowerCase());
      }
    });
    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };
  const handleCorrectAnswer = () => {
    const baseScore = 20;
    const timeBonus = questionStartTime ? Math.max(0, Math.floor((10000 - (Date.now() - questionStartTime)) / 1000)) : 0;
    const attemptBonus = Math.max(0, 10 - (attempts - 1) * 2);
    const hintPenalty = showHint ? 5 : 0;
    const totalScore = baseScore + timeBonus + attemptBonus - hintPenalty;
    setScore(prev => {
      const newScore = prev + totalScore;
      onScoreUpdate?.(newScore);
      return newScore;
    });
    setCorrectAnswers(prev => prev + 1);
    setFeedbackMessage(`正確！+${totalScore} 分`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      nextQuestion();
    }, 2000);
  };
  const handleIncorrectAnswer = () => {
    if (attempts >= 3) {
      setFeedbackMessage(`錯誤！正確答案：${currentQuestion.correctAnswers[0]}`);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        nextQuestion();
      }, 3000);
    } else {
      setFeedbackMessage(`錯誤！還有 ${3 - attempts} 次機會`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      // 清空輸入框
      setUserAnswer('');
    }
  };
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
      checkAnswer();
    }
  };
  const toggleHint = () => {
    if (!allowHints || showHint) return;
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };
  const skipQuestion = () => {
    setFeedbackMessage(`跳過！正確答案：${currentQuestion.correctAnswers[0]}`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      nextQuestion();
    }, 2000);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">輸入答案</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          根據問題輸入正確答案。基於輸入記憶機制，提高您的回憶和表達能力。
        </p>
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">遊戲設置：</h3>
          <div className="text-green-800 text-sm space-y-1">
            <p>題目數量: {questions.length}</p>
            <p>允許提示: {allowHints ? '是' : '否'}</p>
            <p>顯示進度: {showProgress ? '是' : '否'}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          開始答題
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">答題完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確答案: {correctAnswers}/{questions.length}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
          <p className="text-gray-600">使用提示: {hintsUsed} 次</p>
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
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          {showProgress && (
            <span className="text-sm text-gray-600">
              題目 {currentQuestionIndex + 1}/{questions.length}
            </span>
          )}
          <span className="text-sm text-green-600">正確: {correctAnswers}</span>
          <span className="text-sm text-yellow-600">提示: {hintsUsed}</span>
        </div>
        {timeLimit > 0 && (
          <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('正確') ? 'bg-green-500' : 
          feedbackMessage.includes('跳過') ? 'bg-blue-500' : 'bg-red-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 問題區域 */}
      <div className="mb-8">
        {currentQuestion.image && (
          <div className="mb-6 text-center">
            <img
              src={currentQuestion.image}
              alt="Question image"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>
          {showHint && currentQuestion.hint && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                💡 提示: {currentQuestion.hint}
              </p>
            </div>
          )}
        </div>
        {/* 答案輸入 */}
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的答案..."
              className="w-full px-4 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              disabled={showFeedback}
            />
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim() || showFeedback}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              提交答案
            </button>
            {allowHints && !showHint && currentQuestion.hint && (
              <button
                onClick={toggleHint}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                💡 提示
              </button>
            )}
            <button
              onClick={skipQuestion}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              跳過
            </button>
          </div>
        </div>
        {/* 答案要求說明 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            {currentQuestion.exactMatch ? '需要完全匹配' : '部分匹配即可'} | 
            {currentQuestion.caseSensitive ? ' 區分大小寫' : ' 不區分大小寫'}
          </p>
          {attempts > 0 && (
            <p className="mt-1 text-orange-600">
              已嘗試 {attempts}/3 次
            </p>
          )}
        </div>
      </div>
      {/* 進度條 */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進度</span>
            <span>{currentQuestionIndex + 1}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      {/* 操作說明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          <li>• 在輸入框中輸入答案</li>
          <li>• 按 Enter 鍵或點擊"提交答案"</li>
          <li>• 每題最多可嘗試 3 次</li>
          <li>• 使用提示會扣除部分分數</li>
          <li>• 快速答題可獲得時間獎勵</li>
          <li>• 可以跳過困難的題目</li>
        </ul>
      </div>
    </div>
  );
}
