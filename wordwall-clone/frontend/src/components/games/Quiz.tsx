import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  timeLimit?: number;
  showProgress?: boolean;
  shuffleQuestions?: boolean;
  onComplete: (result: QuizResult) => void;
  onQuestionAnswer?: (questionId: string, isCorrect: boolean, timeSpent: number) => void;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  timeLimit = 0,
  showProgress = true,
  shuffleQuestions = false,
  onComplete,
  onQuestionAnswer
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<QuizResult['answers']>([]);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [isAnswered, setIsAnswered] = useState(false);
  
  const processedQuestions = shuffleQuestions 
    ? [...questions].sort(() => Math.random() - 0.5)
    : questions;

  const currentQuestion = processedQuestions[currentQuestionIndex];

  // 計時器
  useEffect(() => {
    if (timeLimit > 0 && timeRemaining > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timeLimit > 0) {
      handleTimeUp();
    }
  }, [timeRemaining, timeLimit, showResult]);

  // 重置問題開始時間
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedOption(null);
    setIsAnswered(false);
  }, [currentQuestionIndex]);

  const handleTimeUp = () => {
    if (!isAnswered) {
      handleAnswer('', false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return;
    
    setSelectedOption(optionId);
    const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect || false;
    
    setTimeout(() => {
      handleAnswer(optionId, isCorrect);
    }, 1000);
  };

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    const timeSpent = Date.now() - questionStartTime;
    
    const answerRecord = {
      questionId: currentQuestion.id,
      selectedOption: optionId,
      isCorrect,
      timeSpent
    };

    setAnswers(prev => [...prev, answerRecord]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    onQuestionAnswer?.(currentQuestion.id, isCorrect, timeSpent);

    // 延遲後進入下一題或結束
    setTimeout(() => {
      if (currentQuestionIndex < processedQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    const totalTimeSpent = Date.now() - gameStartTime;
    const result: QuizResult = {
      score,
      totalQuestions: processedQuestions.length,
      percentage: Math.round((score / processedQuestions.length) * 100),
      timeSpent: totalTimeSpent,
      answers
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const getOptionStyle = (option: QuizOption) => {
    if (!isAnswered) {
      return selectedOption === option.id 
        ? 'bg-blue-500 text-white border-blue-600' 
        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50';
    }
    
    if (option.isCorrect) {
      return 'bg-green-500 text-white border-green-600';
    }
    
    if (selectedOption === option.id && !option.isCorrect) {
      return 'bg-red-500 text-white border-red-600';
    }
    
    return 'bg-gray-100 text-gray-500 border-gray-300';
  };

  if (showResult) {
    const percentage = Math.round((score / processedQuestions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">測驗完成！</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">正確題數</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-gray-600">正確率</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-6">
            總共 {processedQuestions.length} 題，答對 {score} 題
            {timeLimit > 0 && (
              <div className="mt-2">
                用時：{Math.round((Date.now() - gameStartTime) / 1000)} 秒
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {percentage >= 80 && (
              <p className="text-green-600 font-semibold">優秀！您的表現非常出色！</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-blue-600 font-semibold">不錯！繼續努力！</p>
            )}
            {percentage < 60 && (
              <p className="text-orange-600 font-semibold">需要多加練習，加油！</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 進度條和計時器 */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              問題 {currentQuestionIndex + 1} / {processedQuestions.length}
            </span>
            {timeLimit > 0 && (
              <span className={`text-sm font-medium ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                剩餘時間：{timeRemaining}s
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / processedQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 問題內容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {currentQuestion.text}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* 選項 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
            className={`p-4 rounded-lg border-2 text-left font-medium transition-all duration-200 ${getOptionStyle(option)}`}
          >
            <span className="font-bold mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            {option.text}
          </motion.button>
        ))}
      </div>

      {/* 解釋 */}
      {isAnswered && currentQuestion.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <h4 className="font-semibold text-yellow-800 mb-2">解釋：</h4>
          <p className="text-yellow-700">{currentQuestion.explanation}</p>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
