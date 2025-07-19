import { useState, useEffect } from 'react';

interface VocabularyWord {
  word: string;
  chinese: string;
  difficulty: number;
  level: string;
}

interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

interface VocabularyGameProps {
  onStatsUpdate?: (stats: GameStats) => void;
}

export default function VocabularyGame({ onStatsUpdate }: VocabularyGameProps) {
  // GEPT 詞彙數據
  const vocabularyData: VocabularyWord[] = [
    // Level 1 - 基礎詞彙
    { word: "apple", chinese: "蘋果", difficulty: 1, level: "Level 1" },
    { word: "book", chinese: "書", difficulty: 1, level: "Level 1" },
    { word: "cat", chinese: "貓", difficulty: 1, level: "Level 1" },
    { word: "dog", chinese: "狗", difficulty: 1, level: "Level 1" },
    { word: "eat", chinese: "吃", difficulty: 1, level: "Level 1" },
    { word: "fish", chinese: "魚", difficulty: 1, level: "Level 1" },
    { word: "good", chinese: "好的", difficulty: 1, level: "Level 1" },
    { word: "house", chinese: "房子", difficulty: 1, level: "Level 1" },
    
    // Level 2 - 進階詞彙
    { word: "airplane", chinese: "飛機", difficulty: 2, level: "Level 2" },
    { word: "education", chinese: "教育", difficulty: 2, level: "Level 2" },
    { word: "computer", chinese: "電腦", difficulty: 2, level: "Level 2" },
    { word: "internet", chinese: "網際網路", difficulty: 2, level: "Level 2" },
    { word: "science", chinese: "科學", difficulty: 2, level: "Level 2" },
    { word: "technology", chinese: "技術", difficulty: 2, level: "Level 2" },
    { word: "memory", chinese: "記憶", difficulty: 2, level: "Level 2" },
    { word: "learning", chinese: "學習", difficulty: 2, level: "Level 2" }
  ];

  // 遊戲狀態
  const [currentQuestion, setCurrentQuestion] = useState<VocabularyWord | null>(null);
  const [options, setOptions] = useState<VocabularyWord[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
    timeSpent: 0
  });
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // 生成新問題
  const generateNewQuestion = () => {
    // 隨機選擇正確答案
    const correctAnswer = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
    
    // 生成錯誤選項
    const wrongOptions: VocabularyWord[] = [];
    const availableWords = vocabularyData.filter(word => word.word !== correctAnswer.word);
    
    while (wrongOptions.length < 3 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const wrongOption = availableWords.splice(randomIndex, 1)[0];
      wrongOptions.push(wrongOption);
    }
    
    // 混合選項
    const allOptions = [correctAnswer, ...wrongOptions];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    setCurrentQuestion(correctAnswer);
    setOptions(shuffledOptions);
    setFeedback('');
  };

  // 處理答案選擇
  const handleAnswerSelect = (selectedWord: VocabularyWord) => {
    const isCorrect = selectedWord.word === currentQuestion?.word;
    
    // 更新統計
    const newStats = {
      ...gameStats,
      questionsAnswered: gameStats.questionsAnswered + 1,
      correctAnswers: gameStats.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: gameStats.wrongAnswers + (isCorrect ? 0 : 1),
      score: gameStats.score + (isCorrect ? 10 : 0),
      timeSpent: Math.floor((Date.now() - startTime) / 1000)
    };
    
    newStats.accuracy = newStats.questionsAnswered > 0 
      ? (newStats.correctAnswers / newStats.questionsAnswered) * 100 
      : 0;
    
    setGameStats(newStats);
    onStatsUpdate?.(newStats);
    
    // 顯示反饋
    if (isCorrect) {
      setFeedback(`✅ 正確！${selectedWord.word} = ${selectedWord.chinese}`);
      setFeedbackColor('text-green-600 bg-green-50');
    } else {
      setFeedback(`❌ 錯誤！正確答案是 ${currentQuestion?.word} = ${currentQuestion?.chinese}`);
      setFeedbackColor('text-red-600 bg-red-50');
    }
    
    // 延遲後生成下一題
    setTimeout(() => {
      generateNewQuestion();
    }, 2000);
  };

  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    generateNewQuestion();
  };

  // 重新開始遊戲
  const restartGame = () => {
    setGameStats({
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      timeSpent: 0
    });
    setStartTime(Date.now());
    generateNewQuestion();
  };

  if (!gameStarted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="text-2xl font-bold mb-4">飛機詞彙學習遊戲</h2>
        <p className="text-gray-600 mb-6">
          點擊正確的英文單字對應中文意思，收集分數！
        </p>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-semibold text-blue-800">Level 1</div>
              <div className="text-blue-600">基礎詞彙 (日常用語)</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-semibold text-purple-800">Level 2</div>
              <div className="text-purple-600">進階詞彙 (學術用語)</div>
            </div>
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
        >
          🚀 開始遊戲
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      {/* 遊戲標題 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">✈️ 飛機詞彙學習遊戲</h2>
        <div className="flex justify-center gap-4 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            分數: {gameStats.score}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
            正確: {gameStats.correctAnswers}
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
            錯誤: {gameStats.wrongAnswers}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
            準確率: {gameStats.accuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 問題區域 */}
      {currentQuestion && (
        <div className="text-center mb-8">
          <div className="text-lg text-gray-600 mb-2">找到對應的英文單字：</div>
          <div className="text-3xl font-bold text-blue-800 mb-2">
            {currentQuestion.chinese}
          </div>
          <div className="text-sm text-gray-500">
            ({currentQuestion.level} - {currentQuestion.difficulty === 1 ? '基礎' : '進階'}詞彙)
          </div>
        </div>
      )}

      {/* 選項區域 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-lg font-semibold"
            disabled={feedback !== ''}
          >
            {option.word}
          </button>
        ))}
      </div>

      {/* 反饋區域 */}
      {feedback && (
        <div className={`p-4 rounded-lg mb-6 text-center font-semibold ${feedbackColor}`}>
          {feedback}
        </div>
      )}

      {/* 控制按鈕 */}
      <div className="text-center">
        <button
          onClick={restartGame}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mr-4"
        >
          🔄 重新開始
        </button>
        <span className="text-sm text-gray-500">
          遊戲時間: {Math.floor(gameStats.timeSpent / 60)}:{(gameStats.timeSpent % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
