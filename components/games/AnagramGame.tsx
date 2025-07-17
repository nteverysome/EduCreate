/**
 * Anagram Game Component
 * 基於字母重組記憶機制的字母重組遊戲
 * 根據WordWall Anagram模板分析設計
 */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
interface AnagramWord {
  id: string;
  word: string;
  hint?: string;
  category?: string;
  difficulty: number;
}
interface LetterTile {
  id: string;
  letter: string;
  originalIndex: number;
  isUsed: boolean;
}
interface AnagramGameProps {
  words: AnagramWord[];
  timeLimit?: number;
  showHints?: boolean;
  allowShuffle?: boolean;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function AnagramGame({
  words,
  timeLimit = 0,
  showHints = true,
  allowShuffle = true,
  onComplete,
  onScoreUpdate
}: AnagramGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [arrangedLetters, setArrangedLetters] = useState<LetterTile[]>([]);
  const [score, setScore] = useState(0);
  const [solvedWords, setSolvedWords] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const currentWord = words[currentWordIndex];
  // 初始化字母瓷磚
  useEffect(() => {
    if (currentWord) {
      initializeLetters();
    }
  }, [currentWordIndex, currentWord]);
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
  const initializeLetters = () => {
    if (!currentWord) return;
    const letters = currentWord.word.toUpperCase().split('');
    const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
    const tiles: LetterTile[] = shuffledLetters.map((letter, index) => ({
      id: `letter-${index}`,
      letter,
      originalIndex: letters.indexOf(letter),
      isUsed: false
    }));
    setLetterTiles(tiles);
    setArrangedLetters([]);
    setShowHint(false);
    setAttempts(0);
  };
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // 從字母池拖到排列區
    if (source.droppableId === 'letter-pool' && destination.droppableId === 'arranged-area') {
      const tile = letterTiles.find(t => t.id === draggableId);
      if (tile && !tile.isUsed) {
        setLetterTiles(prev => prev.map(t => 
          t.id === draggableId ? { ...t, isUsed: true } : t
        ));
        const newArranged = [...arrangedLetters];
        newArranged.splice(destination.index, 0, tile);
        setArrangedLetters(newArranged);
      }
    }
    // 從排列區拖回字母池
    else if (source.droppableId === 'arranged-area' && destination.droppableId === 'letter-pool') {
      const tile = arrangedLetters[source.index];
      setArrangedLetters(prev => prev.filter((_, index) => index !== source.index));
      setLetterTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, isUsed: false } : t
      ));
    }
    // 在排列區內重新排序
    else if (source.droppableId === 'arranged-area' && destination.droppableId === 'arranged-area') {
      const newArranged = [...arrangedLetters];
      const [reorderedItem] = newArranged.splice(source.index, 1);
      newArranged.splice(destination.index, 0, reorderedItem);
      setArrangedLetters(newArranged);
    }
  };
  const checkWord = () => {
    if (arrangedLetters.length === 0) return;
    setAttempts(prev => prev + 1);
    const arrangedWord = arrangedLetters.map(tile => tile.letter).join('');
    const isCorrect = arrangedWord === currentWord.word.toUpperCase();
    if (isCorrect) {
      handleCorrectWord();
    } else {
      handleIncorrectWord();
    }
  };
  const handleCorrectWord = () => {
    const baseScore = 20;
    const difficultyBonus = currentWord.difficulty * 5;
    const attemptBonus = Math.max(0, 15 - (attempts - 1) * 3);
    const hintPenalty = showHint ? 5 : 0;
    const totalScore = baseScore + difficultyBonus + attemptBonus - hintPenalty;
    setScore(prev => {
      const newScore = prev + totalScore;
      onScoreUpdate?.(newScore);
      return newScore;
    });
    setSolvedWords(prev => prev + 1);
    setFeedbackMessage(`正確！+${totalScore} 分`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      nextWord();
    }, 2000);
  };
  const handleIncorrectWord = () => {
    setFeedbackMessage('不正確，再試試看！');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };
  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      handleGameComplete();
    }
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const shuffleLetters = () => {
    if (!allowShuffle) return;
    const availableLetters = letterTiles.filter(tile => !tile.isUsed);
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    setLetterTiles(prev => {
      const newTiles = [...prev];
      let shuffleIndex = 0;
      return newTiles.map(tile => {
        if (!tile.isUsed) {
          return shuffled[shuffleIndex++];
        }
        return tile;
      });
    });
  };
  const clearArrangement = () => {
    setLetterTiles(prev => prev.map(tile => ({ ...tile, isUsed: false })));
    setArrangedLetters([]);
  };
  const toggleHint = () => {
    if (!showHints || showHint) return;
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };
  const skipWord = () => {
    setFeedbackMessage(`跳過！答案是：${currentWord.word.toUpperCase()}`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      nextWord();
    }, 2000);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">字母重組</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          重新排列字母組成正確的單詞。基於字母重組記憶機制，提高您的詞彙識別能力。
        </p>
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">遊戲設置：</h3>
          <div className="text-purple-800 text-sm space-y-1">
            <p>單詞數量: {words.length}</p>
            <p>顯示提示: {showHints ? '是' : '否'}</p>
            <p>允許重新洗牌: {allowShuffle ? '是' : '否'}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          開始重組
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = words.length > 0 ? (solvedWords / words.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">重組完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">解決單詞: {solvedWords}/{words.length}</p>
          <p className="text-gray-600">完成率: {accuracy.toFixed(1)}%</p>
          <p className="text-gray-600">使用提示: {hintsUsed} 次</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }
  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-4xl mx-auto p-6">
        {/* 遊戲狀態欄 */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">得分: {score}</span>
            <span className="text-sm text-gray-600">
              單詞 {currentWordIndex + 1}/{words.length}
            </span>
            <span className="text-sm text-green-600">已解決: {solvedWords}</span>
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
            feedbackMessage.includes('跳過') ? 'bg-blue-500' : 'bg-orange-500'
          }`}>
            {feedbackMessage}
          </div>
        )}
        {/* 單詞信息 */}
        <div className="mb-6 text-center">
          <div className="mb-4">
            <span className={`px-3 py-1 text-sm rounded-full ${
              currentWord.difficulty === 1 ? 'bg-green-100 text-green-800' :
              currentWord.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
              currentWord.difficulty === 3 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              難度 {currentWord.difficulty}
            </span>
            {currentWord.category && (
              <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {currentWord.category}
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">重新排列這些字母組成一個單詞：</p>
          <p className="text-lg text-gray-500">字母數量: {currentWord.word.length}</p>
          {showHint && currentWord.hint && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                💡 提示: {currentWord.hint}
              </p>
            </div>
          )}
        </div>
        {/* 排列區域 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">您的答案：</h3>
          <Droppable droppableId="arranged-area" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[80px] p-4 border-2 border-dashed rounded-lg transition-all ${
                  snapshot.isDraggingOver 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                {arrangedLetters.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    拖拽字母到這裡組成單詞
                  </p>
                ) : (
                  <div className="flex justify-center space-x-2">
                    {arrangedLetters.map((tile, index) => (
                      <Draggable key={tile.id} draggableId={tile.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`w-16 h-16 bg-purple-500 text-white text-2xl font-bold rounded-lg flex items-center justify-center cursor-move select-none transition-all ${
                              snapshot.isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105'
                            }`}
                          >
                            {tile.letter}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        {/* 字母池 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">可用字母：</h3>
          <Droppable droppableId="letter-pool" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex justify-center space-x-2 p-4 bg-white rounded-lg shadow min-h-[80px]"
              >
                {letterTiles.filter(tile => !tile.isUsed).map((tile, index) => (
                  <Draggable key={tile.id} draggableId={tile.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-16 h-16 bg-gray-200 text-gray-800 text-2xl font-bold rounded-lg flex items-center justify-center cursor-move select-none transition-all ${
                          snapshot.isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105 hover:bg-gray-300'
                        }`}
                      >
                        {tile.letter}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        {/* 操作按鈕 */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={checkWord}
            disabled={arrangedLetters.length === 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            檢查答案
          </button>
          <button
            onClick={clearArrangement}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            清空
          </button>
          {allowShuffle && (
            <button
              onClick={shuffleLetters}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔀 洗牌
            </button>
          )}
          {showHints && !showHint && currentWord.hint && (
            <button
              onClick={toggleHint}
              className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              💡 提示
            </button>
          )}
          <button
            onClick={skipWord}
            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            跳過
          </button>
        </div>
        {/* 進度條 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進度</span>
            <span>{currentWordIndex + 1}/{words.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>
        {/* 操作說明 */}
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">操作說明：</p>
          <ul className="space-y-1">
            <li>• 拖拽字母到排列區域組成單詞</li>
            <li>• 在排列區域內可以重新排序字母</li>
            <li>• 點擊"檢查答案"驗證您的答案</li>
            <li>• 使用"洗牌"重新排列可用字母</li>
            <li>• 使用"提示"獲得幫助（會扣分）</li>
            <li>• 可以跳過困難的單詞</li>
          </ul>
        </div>
      </div>
    </DragDropContext>
  );
}
