import React, { useState } from 'react';
import Head from 'next/head';
import WhackAMoleGame from '../components/games/WhackAMoleGame';
import SpinWheelGame from '../components/games/SpinWheelGame';

// 簡單的遊戲數據
const sampleGames = {
  quiz: {
    title: '基礎數學測驗',
    questions: [
      { question: '2 + 2 = ?', options: ['3', '4', '5', '6'], correct: 1 },
      { question: '5 × 3 = ?', options: ['12', '15', '18', '20'], correct: 1 },
      { question: '10 ÷ 2 = ?', options: ['4', '5', '6', '7'], correct: 1 },
      { question: '7 - 3 = ?', options: ['3', '4', '5', '6'], correct: 1 },
    ]
  },
  matching: {
    title: '動物配對遊戲',
    pairs: [
      { left: '貓', right: 'Cat' },
      { left: '狗', right: 'Dog' },
      { left: '鳥', right: 'Bird' },
      { left: '魚', right: 'Fish' },
    ]
  },
  flashcard: {
    title: '英語單字卡',
    cards: [
      { front: 'Apple', back: '蘋果' },
      { front: 'Book', back: '書' },
      { front: 'Cat', back: '貓' },
      { front: 'Dog', back: '狗' },
    ]
  },
  whackamole: {
    title: '數學打地鼠',
    questions: [
      { question: '2 + 3 = ?', correct: '5', incorrect: ['4', '6', '7'] },
      { question: '8 - 3 = ?', correct: '5', incorrect: ['4', '6', '7'] },
      { question: '4 × 2 = ?', correct: '8', incorrect: ['6', '10', '12'] },
      { question: '9 ÷ 3 = ?', correct: '3', incorrect: ['2', '4', '5'] },
      { question: '6 + 4 = ?', correct: '10', incorrect: ['8', '9', '11'] },
    ]
  },
  spinwheel: {
    title: '隨機選擇轉盤',
    items: ['蘋果', '香蕉', '橘子', '葡萄', '草莓', '西瓜', '鳳梨', '芒果']
  }
};

// 測驗遊戲組件
function QuizGame({ data }: { data: any }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === data.questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < data.questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (showResult) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">測驗完成！</h3>
        <p className="text-xl mb-4">您的得分：{score} / {data.questions.length}</p>
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          重新開始
        </button>
      </div>
    );
  }

  const question = data.questions[currentQuestion];

  return (
    <div>
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          問題 {currentQuestion + 1} / {data.questions.length}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-6">{question.question}</h3>
      <div className="space-y-3">
        {question.options.map((option: string, index: number) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-3 text-left rounded border-2 transition-colors ${
              selectedAnswer === null
                ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                : selectedAnswer === index
                ? index === question.correct
                  ? 'border-green-500 bg-green-100'
                  : 'border-red-500 bg-red-100'
                : index === question.correct
                ? 'border-green-500 bg-green-100'
                : 'border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// 配對遊戲組件
function MatchingGame({ data }: { data: any }) {
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleLeftClick = (item: string) => {
    setSelectedLeft(item);
  };

  const handleRightClick = (item: string) => {
    if (selectedLeft) {
      const newMatches = { ...matches, [selectedLeft]: item };
      setMatches(newMatches);
      setSelectedLeft(null);
      
      if (Object.keys(newMatches).length === data.pairs.length) {
        setCompleted(true);
      }
    }
  };

  const resetGame = () => {
    setMatches({});
    setSelectedLeft(null);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">恭喜完成！</h3>
        <p className="text-xl mb-4">所有配對都正確！</p>
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          重新開始
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-gray-600">點擊左邊的項目，然後點擊右邊對應的項目進行配對</p>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <h4 className="font-bold text-center">中文</h4>
          {data.pairs.map((pair: any, index: number) => (
            <button
              key={index}
              onClick={() => handleLeftClick(pair.left)}
              disabled={!!matches[pair.left]}
              className={`w-full p-3 rounded border-2 transition-colors ${
                matches[pair.left]
                  ? 'border-green-500 bg-green-100'
                  : selectedLeft === pair.left
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-center">English</h4>
          {data.pairs.map((pair: any, index: number) => (
            <button
              key={index}
              onClick={() => handleRightClick(pair.right)}
              disabled={Object.values(matches).includes(pair.right)}
              className={`w-full p-3 rounded border-2 transition-colors ${
                Object.values(matches).includes(pair.right)
                  ? 'border-green-500 bg-green-100'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {pair.right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 單字卡遊戲組件
function FlashcardGame({ data }: { data: any }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const nextCard = () => {
    setShowBack(false);
    setCurrentCard((prev) => (prev + 1) % data.cards.length);
  };

  const prevCard = () => {
    setShowBack(false);
    setCurrentCard((prev) => (prev - 1 + data.cards.length) % data.cards.length);
  };

  const card = data.cards[currentCard];

  return (
    <div className="text-center">
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          卡片 {currentCard + 1} / {data.cards.length}
        </span>
      </div>
      
      <div
        className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6 cursor-pointer hover:shadow-lg transition-shadow min-h-[200px] flex items-center justify-center"
        onClick={() => setShowBack(!showBack)}
      >
        <div className="text-2xl font-bold">
          {showBack ? card.back : card.front}
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">點擊卡片翻面</p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={prevCard}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          上一張
        </button>
        <button
          onClick={nextCard}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          下一張
        </button>
      </div>
    </div>
  );
}

export default function MVPGames() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const renderGame = () => {
    switch (selectedGame) {
      case 'quiz':
        return <QuizGame data={sampleGames.quiz} />;
      case 'matching':
        return <MatchingGame data={sampleGames.matching} />;
      case 'flashcard':
        return <FlashcardGame data={sampleGames.flashcard} />;
      case 'whackamole':
        return <WhackAMoleGame questions={sampleGames.whackamole.questions} />;
      case 'spinwheel':
        return <SpinWheelGame items={sampleGames.spinwheel.items} title={sampleGames.spinwheel.title} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>EduCreate MVP - 互動教學遊戲</title>
        <meta name="description" content="互動教學遊戲平台" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">EduCreate MVP</h1>
              {selectedGame && (
                <button
                  onClick={() => setSelectedGame(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  返回遊戲列表
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {!selectedGame ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                選擇一個遊戲開始遊玩
              </h2>
              
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3">📝 測驗問答</h3>
                  <p className="text-gray-600 mb-4">回答數學問題，測試您的知識</p>
                  <button
                    onClick={() => setSelectedGame('quiz')}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    開始遊戲
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3">🔗 配對遊戲</h3>
                  <p className="text-gray-600 mb-4">將中文詞彙與英文配對</p>
                  <button
                    onClick={() => setSelectedGame('matching')}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                  >
                    開始遊戲
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3">📚 單字卡片</h3>
                  <p className="text-gray-600 mb-4">學習英語單字和中文意思</p>
                  <button
                    onClick={() => setSelectedGame('flashcard')}
                    className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                  >
                    開始遊戲
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3">🔨 打地鼠</h3>
                  <p className="text-gray-600 mb-4">快速打擊正確答案的地鼠</p>
                  <button
                    onClick={() => setSelectedGame('whackamole')}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                  >
                    開始遊戲
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-3">🎯 隨機轉盤</h3>
                  <p className="text-gray-600 mb-4">轉動轉盤隨機選擇項目</p>
                  <button
                    onClick={() => setSelectedGame('spinwheel')}
                    className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                  >
                    開始遊戲
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {selectedGame === 'quiz' && sampleGames.quiz.title}
                {selectedGame === 'matching' && sampleGames.matching.title}
                {selectedGame === 'flashcard' && sampleGames.flashcard.title}
                {selectedGame === 'whackamole' && sampleGames.whackamole.title}
                {selectedGame === 'spinwheel' && sampleGames.spinwheel.title}
              </h2>
              {renderGame()}
            </div>
          )}
        </main>
      </div>
    </>
  );
}