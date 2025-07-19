import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  points?: number;
}
export interface QuizGameProps {
  questions: QuizQuestion[];
  timeLimit?: number; // 秒
  showTimer?: boolean;
  showScore?: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  gameMode?: 'CLASSIC' | 'TIMED' | 'SURVIVAL';
  onComplete?: (results: QuizResults) => void;
  onQuestionAnswer?: (questionId: string, selectedAnswer: number, isCorrect: boolean) => void;
  onGameStart?: () => void;
}
export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  accuracy: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
    points: number;
  }>;
}
const QuizGame = ({
  questions = [],
  timeLimit = 300,
  showTimer = true,
  showScore = true,
  shuffleQuestions = false,
  shuffleAnswers = false,
  gameMode = 'CLASSIC',
  onComplete,
  onQuestionAnswer,
  onGameStart
}: QuizGameProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<QuizResults['answers']>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<QuizQuestion[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<{[key: string]: number[]}>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  // 初始化測驗
  useEffect(() => {
    if (questions.length > 0) {
      // 洗牌問題
      const shuffled = shuffleQuestions 
        ? [...questions].sort(() => Math.random() - 0.5)
        : [...questions];
      setShuffledQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setQuizCompleted(false);
      // 為每個問題洗牌選項
      if (shuffleAnswers) {
        const optionsMap: {[key: string]: number[]} = {};
        shuffled.forEach(question => {
          // 創建選項索引數組 [0, 1, 2, 3, ...]
          const indices = question.options.map((_, index) => index);
          // 洗牌索引
          const shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
          optionsMap[question.id] = shuffledIndices;
        });
        setShuffledOptions(optionsMap);
      }
    }
  }, [questions, shuffleQuestions, shuffleAnswers]);
  // 當前問題
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  // 獲取選項順序
  const getOptionsOrder = (questionId: string) => {
    if (shuffleAnswers && shuffledOptions[questionId]) {
      return shuffledOptions[questionId];
    }
    // 如果不洗牌或尚未設置，返回原始順序
    return currentQuestion?.options.map((_, index) => index) || [];
  };
  // 選擇答案
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    // 檢查答案是否正確
    const optionsOrder = getOptionsOrder(currentQuestion.id);
    const originalIndex = optionsOrder[optionIndex];
    if (originalIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };
  // 下一題
  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      onComplete?.(score, shuffledQuestions.length);
    }
  };
  // 重新開始測驗
  const handleRestartQuiz = () => {
    // 重新洗牌問題
    const shuffled = shuffleQuestions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : [...questions];
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    // 重新洗牌選項
    if (shuffleAnswers) {
      const optionsMap: {[key: string]: number[]} = {};
      shuffled.forEach(question => {
        const indices = question.options.map((_, index) => index);
        const shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
        optionsMap[question.id] = shuffledIndices;
      });
      setShuffledOptions(optionsMap);
    }
  };
  if (!currentQuestion && !quizCompleted) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">沒有可用的問題</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">測驗問答</h2>
        {!quizCompleted && (
          <div className="text-indigo-600 font-medium">
            問題 {currentQuestionIndex + 1} / {shuffledQuestions.length}
          </div>
        )}
      </div>
      {quizCompleted ? (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold text-green-600 mb-4">測驗完成！</h3>
          <p className="text-lg mb-6">您的得分：</p>
          <div className="text-3xl font-bold mb-8">
            {score} / {shuffledQuestions.length}
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({Math.round((score / shuffledQuestions.length) * 100)}%)
            </span>
          </div>
          <button
            onClick={handleRestartQuiz}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            重新開始
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            <div className="space-y-3">
              {getOptionsOrder(currentQuestion.id).map((originalIndex, displayIndex) => {
                const option = currentQuestion.options[originalIndex];
                const isSelected = selectedOption === displayIndex;
                const isCorrect = originalIndex === currentQuestion.correctAnswer;
                let optionClass = "p-3 border rounded-lg cursor-pointer transition";
                if (isAnswered) {
                  if (isSelected) {
                    optionClass += isCorrect
                      ? " bg-green-100 border-green-500"
                      : " bg-red-100 border-red-500";
                  } else if (isCorrect) {
                    optionClass += " bg-green-50 border-green-500";
                  }
                } else {
                  optionClass += isSelected
                    ? " bg-indigo-50 border-indigo-500"
                    : " hover:bg-gray-50 border-gray-200";
                }
                return (
                  <div
                    key={displayIndex}
                    className={optionClass}
                    onClick={() => handleSelectOption(displayIndex)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border mr-3">
                        {String.fromCharCode(65 + displayIndex)}
                      </div>
                      <div>{option}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isAnswered && showExplanation && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
                <h4 className="font-medium mb-1">解釋：</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              得分：{score} / {currentQuestionIndex + (isAnswered ? 1 : 0)}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex < shuffledQuestions.length - 1 ? '下一題' : '完成測驗'}
            </button>
          </div>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / shuffledQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuizGame;
