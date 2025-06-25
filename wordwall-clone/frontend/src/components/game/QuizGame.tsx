import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { QuizQuestion, QuizOption, GameProgress, PlayerAnswer } from '@/types';

interface QuizGameProps {
  questions: QuizQuestion[];
  timeLimit?: number;
  showCorrectAnswer?: boolean;
  allowRetry?: boolean;
  onComplete: (results: PlayerAnswer[]) => void;
  onProgress?: (progress: GameProgress) => void;
}

/**
 * Quiz 遊戲組件 - 多選題測驗遊戲
 * 
 * @example
 * ```tsx
 * <QuizGame
 *   questions={quizQuestions}
 *   timeLimit={300}
 *   showCorrectAnswer={true}
 *   onComplete={handleGameComplete}
 *   onProgress={handleProgress}
 * />
 * ```
 */
export const QuizGame: React.FC<QuizGameProps> = ({
  questions,
  timeLimit,
  showCorrectAnswer = true,
  allowRetry = false,
  onComplete,
  onProgress,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctOption = currentQuestion?.options.find(opt => opt.isCorrect);

  // 計時器
  useEffect(() => {
    if (!timeLimit || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, isCompleted]);

  // 進度回調
  useEffect(() => {
    if (onProgress) {
      const progress: GameProgress = {
        currentStep: currentQuestionIndex + 1,
        totalSteps: questions.length,
        score: answers.filter(a => a.isCorrect).length,
        maxScore: questions.length,
        timeElapsed: Math.floor((Date.now() - gameStartTime) / 1000),
        timeRemaining,
        completed: isCompleted,
        answers: answers.reduce((acc, answer) => ({
          ...acc,
          [answer.questionId]: answer.answer
        }), {}),
      };
      onProgress(progress);
    }
  }, [currentQuestionIndex, answers, timeRemaining, isCompleted, onProgress]);

  const handleTimeUp = useCallback(() => {
    if (!isCompleted) {
      // 時間到，自動提交當前答案（如果有）或跳過
      if (selectedAnswer) {
        handleAnswerSubmit();
      } else {
        handleSkipQuestion();
      }
    }
  }, [selectedAnswer, isCompleted]);

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return; // 已顯示結果時不允許更改
    setSelectedAnswer(optionId);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    const playerAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpent,
      attempts: 1,
      timestamp: new Date().toISOString(),
    };

    setAnswers(prev => [...prev, playerAnswer]);

    if (showCorrectAnswer) {
      setShowResult(true);
      // 2秒後自動進入下一題
      setTimeout(() => {
        proceedToNext();
      }, 2000);
    } else {
      proceedToNext();
    }
  };

  const handleSkipQuestion = () => {
    const playerAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      answer: null,
      isCorrect: false,
      timeSpent: Math.floor((Date.now() - questionStartTime) / 1000),
      attempts: 0,
      timestamp: new Date().toISOString(),
    };

    setAnswers(prev => [...prev, playerAnswer]);
    proceedToNext();
  };

  const proceedToNext = () => {
    if (isLastQuestion) {
      // 遊戲結束
      setIsCompleted(true);
      onComplete([...answers]);
    } else {
      // 下一題
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleRetry = () => {
    if (!allowRetry) return;
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setTimeRemaining(timeLimit);
    setQuestionStartTime(Date.now());
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionClass = (option: QuizOption) => {
    const baseClass = 'game-option';
    
    if (!showResult) {
      return clsx(baseClass, {
        'selected': selectedAnswer === option.id,
      });
    }

    // 顯示結果時的樣式
    if (option.isCorrect) {
      return clsx(baseClass, 'correct');
    }
    
    if (selectedAnswer === option.id && !option.isCorrect) {
      return clsx(baseClass, 'incorrect');
    }

    return clsx(baseClass, 'opacity-50');
  };

  if (isCompleted) {
    const score = answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="game-container flex items-center justify-center p-4">
        <div className="game-board max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              遊戲完成！
            </h2>
            <p className="text-gray-600">
              您答對了 {score} / {questions.length} 題
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {accuracy}%
            </div>
            <div className="text-sm text-gray-600">準確率</div>
          </div>

          <div className="space-y-3">
            {allowRetry && (
              <Button
                variant="secondary"
                fullWidth
                onClick={handleRetry}
              >
                重新開始
              </Button>
            )}
            <Button
              variant="primary"
              fullWidth
              onClick={() => window.history.back()}
            >
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container p-4">
      <div className="max-w-4xl mx-auto">
        {/* 遊戲頭部 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                題目 {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="progress-fill h-2 rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                  }}
                />
              </div>
            </div>
            
            {timeRemaining !== undefined && (
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className={clsx(
                  'font-mono',
                  timeRemaining < 30 ? 'text-error-600' : 'text-gray-600'
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 問題區域 */}
        <div className="game-board mb-6">
          <div className="mb-8">
            <h2 className="game-question">
              {currentQuestion?.text}
            </h2>
            
            {currentQuestion?.image && (
              <div className="flex justify-center mb-6">
                <img
                  src={currentQuestion.image}
                  alt="問題圖片"
                  className="max-w-sm rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>

          {/* 選項 */}
          <div className="grid-game-options mb-8">
            {currentQuestion?.options.map((option) => (
              <button
                key={option.id}
                className={getOptionClass(option)}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
              >
                <div className="flex items-center justify-between">
                  <span className="text-left flex-1">
                    {option.text}
                  </span>
                  
                  {showResult && (
                    <span className="ml-2 flex-shrink-0">
                      {option.isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 text-success-600" />
                      ) : selectedAnswer === option.id ? (
                        <XCircleIcon className="h-5 w-5 text-error-600" />
                      ) : null}
                    </span>
                  )}
                </div>
                
                {option.image && (
                  <img
                    src={option.image}
                    alt="選項圖片"
                    className="mt-2 max-w-full h-20 object-cover rounded"
                  />
                )}
              </button>
            ))}
          </div>

          {/* 操作按鈕 */}
          {!showResult && (
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleSkipQuestion}
              >
                跳過
              </Button>
              
              <Button
                variant="primary"
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
              >
                {isLastQuestion ? '完成' : '下一題'}
              </Button>
            </div>
          )}

          {/* 解釋 */}
          {showResult && currentQuestion?.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">解釋：</h4>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
