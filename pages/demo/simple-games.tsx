import { useState } from 'react';
import Head from 'next/head';
import QuizGame, { QuizQuestion } from '@/components/games/QuizGame';
import SimpleMatchingGame from '@/components/games/SimpleMatchingGame';
import SimpleWhackGame from '@/components/games/SimpleWhackGame';
import TrueFalseGame, { TrueFalseQuestion } from '@/components/games/TrueFalseGame';
import FillBlankGame, { FillBlankQuestion } from '@/components/games/FillBlankGame';
import CrosswordGame, { CrosswordClue } from '@/components/games/CrosswordGame';
import WordsearchGame, { WordsearchWord } from '@/components/games/WordsearchGame';
import GameshowQuizGame, { GameshowQuestion } from '@/components/games/GameshowQuizGame';
import SimpleSpinWheelGame, { WheelSegment } from '@/components/games/SimpleSpinWheelGame';
import BalloonPopGame, { BalloonQuestion } from '@/components/games/BalloonPopGame';

// 示例數據
const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '什麼是 JavaScript？',
    options: ['程式語言', '咖啡品牌', '遊戲引擎', '操作系統'],
    correctAnswer: 0,
    explanation: 'JavaScript 是一種程式語言，主要用於網頁開發',
    difficulty: 'EASY',
    points: 10
  }
];

const sampleMatchingPairs = [
  { id: 1, left: 'HTML', right: '網頁結構' },
  { id: 2, left: 'CSS', right: '樣式設計' },
  { id: 3, left: 'JavaScript', right: '互動功能' },
  { id: 4, left: 'React', right: 'UI框架' }
];

const sampleTrueFalseQuestions: TrueFalseQuestion[] = [
  {
    id: 'tf1',
    statement: 'JavaScript 是一種編譯型語言',
    correct: false,
    explanation: 'JavaScript 是一種解釋型語言，不需要編譯',
    difficulty: 'EASY',
    points: 10
  }
];

const sampleFillBlankQuestions: FillBlankQuestion[] = [
  {
    id: 'fb1',
    sentence: '___是網頁的骨架結構',
    correctAnswer: 'HTML',
    alternatives: ['html'],
    hint: '超文本標記語言',
    difficulty: 'EASY',
    points: 10
  }
];

// 填字遊戲線索
const sampleCrosswordClues: CrosswordClue[] = [
  {
    id: 'c1',
    number: 1,
    clue: '網頁標記語言',
    answer: 'HTML',
    direction: 'across',
    startRow: 2,
    startCol: 1,
    length: 4
  },
  {
    id: 'c2',
    number: 2,
    clue: '樣式表語言',
    answer: 'CSS',
    direction: 'down',
    startRow: 1,
    startCol: 3,
    length: 3
  }
];

// 找字遊戲單詞
const sampleWordsearchWords: WordsearchWord[] = [
  { id: 'w1', word: 'REACT', hint: 'JavaScript框架', category: '程式設計' },
  { id: 'w2', word: 'HTML', hint: '標記語言', category: '網頁技術' },
  { id: 'w3', word: 'CSS', hint: '樣式語言', category: '網頁技術' },
  { id: 'w4', word: 'JAVASCRIPT', hint: '程式語言', category: '程式設計' }
];

// 遊戲節目問答
const sampleGameshowQuestions: GameshowQuestion[] = [
  {
    id: 'gs1',
    question: '哪個是 JavaScript 框架？',
    options: ['React', 'HTML', 'CSS', 'Python'],
    correctAnswer: 0,
    points: 100,
    difficulty: 'EASY',
    category: '程式設計'
  },
  {
    id: 'gs2',
    question: 'CSS 代表什麼？',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    correctAnswer: 1,
    points: 200,
    difficulty: 'MEDIUM',
    category: '網頁技術'
  }
];

// 轉輪遊戲扇形
const sampleWheelSegments: WheelSegment[] = [
  { id: 's1', text: '大獎', color: '#ff6b6b', points: 100, action: 'bonus' },
  { id: 's2', text: '小獎', color: '#4ecdc4', points: 50, action: 'normal' },
  { id: 's3', text: '問題', color: '#45b7d1', points: 20, action: 'question' },
  { id: 's4', text: '獎勵', color: '#96ceb4', points: 30, action: 'bonus' },
  { id: 's5', text: '挑戰', color: '#feca57', points: 40, action: 'question' },
  { id: 's6', text: '幸運', color: '#ff9ff3', points: 60, action: 'normal' }
];

// 氣球問題
const sampleBalloonQuestions: BalloonQuestion[] = [
  {
    id: 'b1',
    question: '什麼是 HTML？',
    answer: '超文本標記語言',
    alternatives: ['標記語言', 'markup language'],
    category: '網頁技術',
    points: 10
  },
  {
    id: 'b2',
    question: 'React 是什麼？',
    answer: 'JavaScript框架',
    alternatives: ['JS框架', '前端框架', 'UI框架'],
    category: '程式設計',
    points: 15
  }
];

export default function SimpleGameDemo() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);

  const handleComplete = (results: any) => {
    setGameResults(results);
  };

  const resetGame = () => {
    setCurrentGame(null);
    setGameResults(null);
  };

  return (
    <>
      <Head>
        <title>遊戲演示 - WordWall 仿製品</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎮 WordWall 遊戲演示
            </h1>
            <p className="text-lg text-gray-600">
              體驗我們並行智能體創建的互動遊戲
            </p>
          </div>

          {!currentGame && !gameResults && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Quiz 遊戲 */}
              <div 
                onClick={() => setCurrentGame('quiz')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz 遊戲</h3>
                  <p className="text-gray-600">多選題測驗</p>
                </div>
              </div>

              {/* 配對遊戲 */}
              <div 
                onClick={() => setCurrentGame('matching')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🔗</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">配對遊戲</h3>
                  <p className="text-gray-600">點擊配對</p>
                </div>
              </div>

              {/* 打地鼠 */}
              <div 
                onClick={() => setCurrentGame('whack')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🔨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">打地鼠</h3>
                  <p className="text-gray-600">反應速度訓練</p>
                </div>
              </div>

              {/* True/False */}
              <div 
                onClick={() => setCurrentGame('truefalse')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">True/False</h3>
                  <p className="text-gray-600">判斷真假</p>
                </div>
              </div>

              {/* 填空遊戲 */}
              <div 
                onClick={() => setCurrentGame('fillblank')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">填空遊戲</h3>
                  <p className="text-gray-600">填入正確詞語</p>
                </div>
              </div>

              {/* 填字遊戲 */}
              <div
                onClick={() => setCurrentGame('crossword')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🧩</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">填字遊戲</h3>
                  <p className="text-gray-600">根據線索填字</p>
                </div>
              </div>

              {/* 找字遊戲 */}
              <div
                onClick={() => setCurrentGame('wordsearch')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">找字遊戲</h3>
                  <p className="text-gray-600">在網格中找單詞</p>
                </div>
              </div>

              {/* 遊戲節目問答 */}
              <div
                onClick={() => setCurrentGame('gameshow')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎪</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">遊戲節目問答</h3>
                  <p className="text-gray-600">快節奏問答挑戰</p>
                </div>
              </div>

              {/* 轉輪遊戲 */}
              <div
                onClick={() => setCurrentGame('spinwheel')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎡</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">轉輪遊戲</h3>
                  <p className="text-gray-600">轉動幸運輪盤</p>
                </div>
              </div>

              {/* 氣球爆破 */}
              <div
                onClick={() => setCurrentGame('balloonpop')}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎈</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">氣球爆破</h3>
                  <p className="text-gray-600">點擊氣球答題</p>
                </div>
              </div>

              {/* 成果展示 */}
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-lg p-6 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold mb-2">10個遊戲完成！</h3>
                  <p>並行智能體開發成果</p>
                </div>
              </div>

              {/* 技術突破 */}
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl shadow-lg p-6 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-2">並行開發</h3>
                  <p>5分鐘創建5個新遊戲</p>
                </div>
              </div>
            </div>
          )}

          {/* 遊戲渲染 */}
          {currentGame === 'quiz' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🧠 Quiz 遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <QuizGame
                questions={sampleQuizQuestions}
                timeLimit={120}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'matching' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🔗 配對遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <SimpleMatchingGame
                pairs={sampleMatchingPairs}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'whack' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🔨 打地鼠遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <SimpleWhackGame
                gameTime={30}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'truefalse' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">✅ True/False 遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <TrueFalseGame
                questions={sampleTrueFalseQuestions}
                timeLimit={60}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'fillblank' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📝 填空遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <FillBlankGame
                questions={sampleFillBlankQuestions}
                timeLimit={90}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'crossword' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🧩 填字遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <CrosswordGame
                clues={sampleCrosswordClues}
                gridSize={8}
                timeLimit={180}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'wordsearch' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🔍 找字遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <WordsearchGame
                words={sampleWordsearchWords}
                gridSize={10}
                timeLimit={120}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'gameshow' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎪 遊戲節目問答</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <GameshowQuizGame
                questions={sampleGameshowQuestions}
                timePerQuestion={10}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'spinwheel' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎡 轉輪遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <SimpleSpinWheelGame
                segments={sampleWheelSegments}
                maxSpins={5}
                onComplete={handleComplete}
              />
            </div>
          )}

          {currentGame === 'balloonpop' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎈 氣球爆破遊戲</h2>
                <button onClick={resetGame} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                  返回選單
                </button>
              </div>
              <BalloonPopGame
                questions={sampleBalloonQuestions}
                gameTime={45}
                onComplete={handleComplete}
              />
            </div>
          )}

          {/* 結果顯示 */}
          {gameResults && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 遊戲結果</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(gameResults, null, 2)}
                </pre>
              </div>
              <button
                onClick={resetGame}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                重新選擇遊戲
              </button>
            </div>
          )}

          {/* 技術說明 */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 並行智能體開發成果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3">✅ 已實現功能 (10個遊戲)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Quiz 遊戲系統</li>
                  <li>• 配對遊戲</li>
                  <li>• 打地鼠遊戲</li>
                  <li>• True/False 遊戲</li>
                  <li>• 填空遊戲</li>
                  <li>• 填字遊戲 (新)</li>
                  <li>• 找字遊戲 (新)</li>
                  <li>• 遊戲節目問答 (新)</li>
                  <li>• 轉輪遊戲 (新)</li>
                  <li>• 氣球爆破遊戲 (新)</li>
                  <li>• 計時和計分系統</li>
                  <li>• 響應式設計</li>
                  <li>• TypeScript 類型安全</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3">🎯 技術特色</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• React + TypeScript</li>
                  <li>• Tailwind CSS 樣式</li>
                  <li>• 組件化設計</li>
                  <li>• 事件驅動架構</li>
                  <li>• 可配置遊戲參數</li>
                  <li>• 實時狀態管理</li>
                  <li>• 跨平台兼容</li>
                  <li>• 並行開發模式</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
