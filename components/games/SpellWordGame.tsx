/**
 * Spell the Word Game Component
 * 基於拼寫記憶機制的單詞拼寫遊戲
 */
import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
interface WordItem {
  id: string;
  word: string;
  hint?: string;
  image?: string;
  pronunciation?: string;
}
interface SpellWordGameProps {
  words: WordItem[];
  inputMode?: 'drag' | 'type' | 'both';
  showHints?: boolean;
  audioEnabled?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
interface LetterTile {
  id: string;
  letter: string;
  used: boolean;
  position?: number;
}
export default function SpellWordGame({
  words,
  inputMode = 'both',
  showHints = true,
  audioEnabled = true,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: SpellWordGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [spelledWord, setSpelledWord] = useState<string[]>([]);
  const [typedWord, setTypedWord] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentInputMode, setCurrentInputMode] = useState<'drag' | 'type'>(
    inputMode === 'both' ? 'drag' : inputMode as 'drag' | 'type'
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = words[currentWordIndex];
  // 初始化字母瓷磚
  useEffect(() => {
    if (currentWord) {
      const letters = currentWord.word.toLowerCase().split('');
      const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
      const tiles: LetterTile[] = shuffledLetters.map((letter, index) => ({
        id: `letter-${index}`,
        letter: letter.toUpperCase(),
        used: false
      }));
      setLetterTiles(tiles);
      setSpelledWord(new Array(letters.length).fill(''));
      setTypedWord('');
      setAttempts(0);
      setShowHint(false);
    }
  }, [currentWord]);
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
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const playPronunciation = () => {
    if (audioEnabled && currentWord.pronunciation) {
      // 這裡應該播放音頻文件
      // 現在使用 Web Speech API 作為替代
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // 拖拽到拼寫區域
    if (destination.droppableId === 'spell-area') {
      const letter = letterTiles.find(tile => tile.id === draggableId)?.letter;
      if (letter) {
        const newSpelledWord = [...spelledWord];
        newSpelledWord[destination.index] = letter;
        setSpelledWord(newSpelledWord);
        // 標記字母為已使用
        setLetterTiles(prev => prev.map(tile => 
          tile.id === draggableId ? { ...tile, used: true, position: destination.index } : tile
        ));
      }
    }
    // 拖拽回字母區域
    if (destination.droppableId === 'letter-tiles' && source.droppableId === 'spell-area') {
      const sourceIndex = source.index;
      // 清除拼寫位置
      const newSpelledWord = [...spelledWord];
      newSpelledWord[sourceIndex] = '';
      setSpelledWord(newSpelledWord);
      // 標記字母為未使用
      setLetterTiles(prev => prev.map(tile => 
        tile.id === draggableId ? { ...tile, used: false, position: undefined } : tile
      ));
    }
  };
  const handleTypeSubmit = () => {
    checkSpelling(typedWord.toLowerCase());
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTypeSubmit();
    }
  };
  const checkSpelling = (word: string) => {
    const correctWord = currentWord.word.toLowerCase();
    const isCorrect = word === correctWord;
    setAttempts(prev => prev + 1);
    if (isCorrect) {
      const baseScore = 20;
      const attemptBonus = Math.max(0, 10 - attempts * 2);
      const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 10)) : 0;
      const totalScore = baseScore + attemptBonus + timeBonus;
      setScore(prev => {
        const newScore = prev + totalScore;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setFeedbackMessage(`正確！+${totalScore} 分`);
      setShowFeedback(true);
      // 播放成功音效
      if (audioEnabled) {
        playSuccessSound();
      }
      setTimeout(() => {
        setShowFeedback(false);
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          handleGameComplete();
        }
      }, 2000);
    } else {
      setFeedbackMessage('拼寫錯誤，再試試看！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      // 清除輸入
      if (currentInputMode === 'type') {
        setTypedWord('');
      } else {
        setSpelledWord(new Array(currentWord.word.length).fill(''));
        setLetterTiles(prev => prev.map(tile => ({ ...tile, used: false, position: undefined })));
      }
    }
  };
  const playSuccessSound = () => {
    // 播放成功音效的邏輯
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  const switchInputMode = () => {
    if (inputMode === 'both') {
      setCurrentInputMode(currentInputMode === 'drag' ? 'type' : 'drag');
      // 重置當前輸入
      setSpelledWord(new Array(currentWord.word.length).fill(''));
      setTypedWord('');
      setLetterTiles(prev => prev.map(tile => ({ ...tile, used: false, position: undefined })));
    }
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">拼寫單詞</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          根據提示拼寫正確的單詞。可以拖拽字母或直接輸入。基於拼寫記憶機制，提高您的拼寫能力。
        </p>
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">單詞數量: {words.length}</p>
          <p className="text-sm text-gray-500">輸入模式: {inputMode === 'both' ? '拖拽 + 輸入' : inputMode === 'drag' ? '拖拽' : '輸入'}</p>
          {timeLimit > 0 && <p className="text-sm text-gray-500">時間限制: {timeLimit} 秒</p>}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          開始拼寫
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">拼寫完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">完成單詞: {currentWordIndex + 1}/{words.length}</p>
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
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            單詞 {currentWordIndex + 1}/{words.length}
          </span>
          <span className="text-sm text-gray-600">
            嘗試: {attempts}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {inputMode === 'both' && (
            <button
              onClick={switchInputMode}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {currentInputMode === 'drag' ? '切換到輸入' : '切換到拖拽'}
            </button>
          )}
          {timeLimit > 0 && (
            <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
              時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
          feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-orange-500'
        }`}>
          {feedbackMessage}
        </div>
      )}
      {/* 單詞信息區域 */}
      <div className="mb-8 text-center">
        {currentWord.image && (
          <div className="mb-4">
            <img 
              src={currentWord.image} 
              alt="Word hint" 
              className="w-32 h-32 object-cover rounded-lg mx-auto"
            />
          </div>
        )}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h3 className="text-2xl font-bold">拼寫這個單詞</h3>
          {audioEnabled && (
            <button
              onClick={playPronunciation}
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              title="播放發音"
            >
              🔊
            </button>
          )}
        </div>
        {showHints && currentWord.hint && (
          <div className="mb-4">
            <button
              onClick={toggleHint}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              {showHint ? '隱藏提示' : '顯示提示'}
            </button>
            {showHint && (
              <p className="mt-2 text-gray-600 italic">💡 {currentWord.hint}</p>
            )}
          </div>
        )}
      </div>
      {/* 拖拽模式 */}
      {currentInputMode === 'drag' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* 拼寫區域 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-center">拖拽字母到正確位置：</h4>
            <Droppable droppableId="spell-area" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex justify-center space-x-2 p-4 bg-gray-50 rounded-lg min-h-[80px] items-center"
                >
                  {spelledWord.map((letter, index) => (
                    <Droppable key={`position-${index}`} droppableId={`position-${index}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center text-xl font-bold ${
                            snapshot.isDraggingOver 
                              ? 'border-blue-500 bg-blue-50' 
                              : letter 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-300 bg-white'
                          }`}
                        >
                          {letter && (
                            <span className="text-green-700">{letter}</span>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          {/* 字母瓷磚 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-center">可用字母：</h4>
            <Droppable droppableId="letter-tiles" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap justify-center gap-3 p-4 bg-gray-50 rounded-lg min-h-[80px]"
                >
                  {letterTiles.filter(tile => !tile.used).map((tile, index) => (
                    <Draggable key={tile.id} draggableId={tile.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`w-12 h-12 bg-white border rounded-lg flex items-center justify-center text-xl font-bold cursor-move select-none transition-all ${
                            snapshot.isDragging 
                              ? 'shadow-lg scale-105 bg-blue-50 border-blue-300' 
                              : 'hover:shadow-md border-gray-300'
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
          <div className="text-center">
            <button
              onClick={() => checkSpelling(spelledWord.join('').toLowerCase())}
              disabled={spelledWord.some(letter => letter === '')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              檢查拼寫
            </button>
          </div>
        </DragDropContext>
      )}
      {/* 輸入模式 */}
      {currentInputMode === 'type' && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 text-center">輸入單詞：</h4>
          <div className="flex justify-center space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="在這裡輸入單詞..."
              className="px-4 py-3 text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
              autoFocus
            />
            <button
              onClick={handleTypeSubmit}
              disabled={!typedWord.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              檢查
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
