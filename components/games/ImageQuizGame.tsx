/**
 * Image Quiz Game Component
 * 基於視覺記憶機制的圖片測驗遊戲
 * 根據WordWall Image Quiz模板分析設計
 */
import React, { useState, useEffect } from 'react';
interface ImageQuestion {
  id: string;
  image: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: number;
}
interface ImageQuizGameProps {
  questions: ImageQuestion[];
  timeLimit?: number;
  showImageFirst?: boolean;
  imageDisplayTime?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function ImageQuizGame({
  questions,
  timeLimit = 0,
  showImageFirst = true,
  imageDisplayTime = 5,
  onComplete,
  onScoreUpdate
}: ImageQuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [imagePhase, setImagePhase] = useState<'viewing' | 'answering'>('viewing');
  const [imageTimeLeft, setImageTimeLeft] = useState(imageDisplayTime);
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  // 主計時器
  useEffect(() => {
    if (gameStarted && timeLimit > 0 && timeLeft > 0 && !gameCompleted && !showFeedback) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit > 0) {
      handleTimeUp();
    }
  }, [gameStarted, timeLeft, gameCompleted, showFeedback]);
  // 圖片顯示計時器
  useEffect(() => {
    if (gameStarted && showImageFirst && imagePhase === 'viewing' && imageTimeLeft > 0 && imageLoaded) {
      const timer = setTimeout(() => {
        setImageTimeLeft(imageTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (imageTimeLeft === 0 && imagePhase === 'viewing') {
      setImagePhase('answering');
    }
  }, [gameStarted, imagePhase, imageTimeLeft, imageLoaded]);
  // 重置圖片階段
  useEffect(() => {
    if (showImageFirst) {
      setImagePhase('viewing');
      setImageTimeLeft(imageDisplayTime);
      setImageLoaded(false);
    } else {
      setImagePhase('answering');
    }
  }, [currentQuestionIndex, showImageFirst, imageDisplayTime]);
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const handleTimeUp = () => {
    setFeedbackMessage('時間到！');
    setShowFeedback(true);
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showFeedback) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      const baseScore = 20;
      const difficultyBonus = currentQuestion.difficulty * 5;
      const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 10)) : 0;
      const totalScore = baseScore + difficultyBonus + timeBonus;
      setScore(prev => {
        const newScore = prev + totalScore;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage(`正確！+${totalScore} 分`);
    } else {
      setFeedbackMessage(`錯誤！正確答案是：${currentQuestion.options[currentQuestion.correctAnswer]}`);
    }
    setShowFeedback(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleGameComplete();
    }
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const skipImagePhase = () => {
    setImagePhase('answering');
    setImageTimeLeft(0);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">圖片測驗</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          觀察圖片並回答相關問題。基於視覺記憶機制，提高您的觀察力和記憶力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲設置：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>題目數量: {questions.length}</p>
            <p>圖片先顯示: {showImageFirst ? '是' : '否'}</p>
            {showImageFirst && <p>圖片顯示時間: {imageDisplayTime} 秒</p>}
            {timeLimit > 0 && <p>總時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-lg font-semibold"
        >
          開始測驗
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">測驗完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">正確答案: {correctAnswers}/{questions.length}</p>
          <p className="text-gray-600">準確率: {accuracy.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            題目 {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="text-sm text-green-600">正確: {correctAnswers}</span>
        </div>
        <div className="flex items-center space-x-4">
          {imagePhase === 'viewing' && showImageFirst && (
            <div className="text-lg font-semibold text-blue-600">
              觀察時間: {imageTimeLeft}秒
            </div>
          )}
          {timeLimit > 0 && (
            <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
              總時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 圖片觀察階段 */}
      {imagePhase === 'viewing' && showImageFirst && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">仔細觀察圖片</h3>
          <div className="relative inline-block">
            <img
              src={currentQuestion.image}
              alt="Quiz image"
              onLoad={handleImageLoad}
              className="max-w-full max-h-96 rounded-lg shadow-lg"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            )}
            {imageLoaded && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                {imageTimeLeft}s
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-4">
            請仔細觀察圖片中的細節，稍後將根據圖片內容回答問題
          </p>
          {imageLoaded && (
            <button
              onClick={skipImagePhase}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              跳過觀察
            </button>
          )}
        </div>
      )}
      {/* 答題階段 */}
      {imagePhase === 'answering' && (
        <div>
          {/* 圖片和問題 */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 圖片區域 */}
              <div className="text-center">
                <img
                  src={currentQuestion.image}
                  alt="Quiz image"
                  className="w-full max-h-80 object-contain rounded-lg shadow-lg"
                />
                <div className="mt-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    currentQuestion.difficulty === 1 ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                    currentQuestion.difficulty === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    難度 {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
              {/* 問題區域 */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h3>
                {/* 答案選項 */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null || showFeedback}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? selectedAnswer === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : 'border-red-500 bg-red-100 text-red-800'
                          : 'border-gray-300 bg-white hover:border-pink-300 hover:bg-pink-50'
                      } ${
                        selectedAnswer !== null || showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                          selectedAnswer === index
                            ? selectedAnswer === currentQuestion.correctAnswer
                              ? 'bg-green-500'
                              : 'bg-red-500'
                            : 'bg-gray-400'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 解釋（如果有且已回答） */}
          {selectedAnswer !== null && currentQuestion.explanation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">解釋：</h4>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      )}
      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>進度</span>
          <span>{currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
      {/* 操作說明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">操作說明：</p>
        <ul className="space-y-1">
          {showImageFirst && <li>• 首先仔細觀察圖片 {imageDisplayTime} 秒</li>}
          <li>• 根據圖片內容選擇正確答案</li>
          <li>• 點擊選項後無法更改</li>
          <li>• 難度越高的題目分數越高</li>
          <li>• 快速答題可獲得時間獎勵</li>
        </ul>
      </div>
    </div>
  );
}
