/**
 * Complete the Sentence Game Component
 * 基於語境記憶機制的完形填空遊戲
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface SentenceItem {
  id: string;
  text: string;
  blanks: {
    position: number;
    correctWord: string;
    options: string[];
  }[];
}

interface CompleteSentenceGameProps {
  sentences: SentenceItem[];
  timeLimit?: number;
  showHints?: boolean;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}

interface WordBank {
  id: string;
  word: string;
  used: boolean;
}

export default function CompleteSentenceGame({
  sentences,
  timeLimit = 0,
  showHints = true,
  onComplete,
  onScoreUpdate
}: CompleteSentenceGameProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [wordBank, setWordBank] = useState<WordBank[]>([]);
  const [filledBlanks, setFilledBlanks] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const currentSentence = sentences[currentSentenceIndex];

  // 初始化詞庫
  useEffect(() => {
    if (currentSentence) {
      const words: WordBank[] = [];
      currentSentence.blanks.forEach((blank, index) => {
        // 添加正確答案
        words.push({
          id: `correct-${index}`,
          word: blank.correctWord,
          used: false
        });
        // 添加干擾項
        blank.options.forEach((option, optIndex) => {
          if (option !== blank.correctWord) {
            words.push({
              id: `option-${index}-${optIndex}`,
              word: option,
              used: false
            });
          }
        });
      });
      
      // 打亂順序
      const shuffledWords = words.sort(() => Math.random() - 0.5);
      setWordBank(shuffledWords);
      setFilledBlanks({});
    }
  }, [currentSentence]);

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // 如果拖拽到空白處
    if (destination.droppableId.startsWith('blank-')) {
      const blankIndex = parseInt(destination.droppableId.split('-')[1]);
      const word = wordBank.find(w => w.id === draggableId)?.word;
      
      if (word) {
        // 更新填空
        setFilledBlanks(prev => ({
          ...prev,
          [blankIndex]: word
        }));

        // 標記單詞為已使用
        setWordBank(prev => prev.map(w => 
          w.id === draggableId ? { ...w, used: true } : w
        ));

        // 檢查答案
        checkAnswer(blankIndex, word);
      }
    }
    
    // 如果拖拽回詞庫
    if (destination.droppableId === 'word-bank' && source.droppableId.startsWith('blank-')) {
      const blankIndex = parseInt(source.droppableId.split('-')[1]);
      
      // 清除填空
      setFilledBlanks(prev => {
        const newFilled = { ...prev };
        delete newFilled[blankIndex];
        return newFilled;
      });

      // 標記單詞為未使用
      setWordBank(prev => prev.map(w => 
        w.id === draggableId ? { ...w, used: false } : w
      ));
    }
  };

  const checkAnswer = (blankIndex: number, word: string) => {
    const correctWord = currentSentence.blanks[blankIndex].correctWord;
    const isCorrect = word.toLowerCase() === correctWord.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => {
        const newScore = prev + 10;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      
      setFeedbackMessage('正確！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1000);
      
      // 檢查是否完成當前句子
      const allBlanksCorrect = currentSentence.blanks.every((blank, index) => {
        const filledWord = index === blankIndex ? word : filledBlanks[index];
        return filledWord?.toLowerCase() === blank.correctWord.toLowerCase();
      });
      
      if (allBlanksCorrect) {
        setTimeout(() => {
          if (currentSentenceIndex < sentences.length - 1) {
            setCurrentSentenceIndex(prev => prev + 1);
          } else {
            handleGameComplete();
          }
        }, 1500);
      }
    } else {
      setFeedbackMessage('再試試看！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1000);
    }
  };

  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };

  const renderSentenceWithBlanks = () => {
    const parts = currentSentence.text.split(/(\[BLANK\d+\])/);
    
    return (
      <div className="text-xl leading-relaxed mb-8 p-6 bg-gray-50 rounded-lg">
        {parts.map((part, index) => {
          const blankMatch = part.match(/\[BLANK(\d+)\]/);
          if (blankMatch) {
            const blankIndex = parseInt(blankMatch[1]);
            const filledWord = filledBlanks[blankIndex];
            
            return (
              <Droppable key={`blank-${blankIndex}`} droppableId={`blank-${blankIndex}`}>
                {(provided, snapshot) => (
                  <span
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`inline-block min-w-[120px] min-h-[40px] mx-2 px-3 py-2 border-2 border-dashed rounded-lg text-center ${
                      snapshot.isDraggingOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : filledWord 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 bg-white'
                    }`}
                  >
                    {filledWord && (
                      <Draggable draggableId={`filled-${blankIndex}`} index={0}>
                        {(provided) => (
                          <span
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded cursor-move"
                          >
                            {filledWord}
                          </span>
                        )}
                      </Draggable>
                    )}
                    {!filledWord && (
                      <span className="text-gray-400 text-sm">拖拽單詞到這裡</span>
                    )}
                    {provided.placeholder}
                  </span>
                )}
              </Droppable>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">完成句子</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          將正確的單詞拖拽到空白處，完成句子。基於語境記憶機制，幫助您更好地理解和記憶詞彙。
        </p>
        <div className="mb-6">
          <p className="text-sm text-gray-500">句子數量: {sentences.length}</p>
          {timeLimit > 0 && <p className="text-sm text-gray-500">時間限制: {timeLimit} 秒</p>}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
        >
          開始遊戲
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">遊戲完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">完成句子數: {currentSentenceIndex + 1}/{sentences.length}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再玩一次
        </button>
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
              句子 {currentSentenceIndex + 1}/{sentences.length}
            </span>
          </div>
          {timeLimit > 0 && (
            <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
              時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* 反饋消息 */}
        {showFeedback && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
            feedbackMessage.includes('正確') ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            {feedbackMessage}
          </div>
        )}

        {/* 句子區域 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">完成下面的句子：</h3>
          {renderSentenceWithBlanks()}
        </div>

        {/* 詞庫 */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3">詞庫：</h4>
          <Droppable droppableId="word-bank" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg min-h-[80px]"
              >
                {wordBank.filter(word => !word.used).map((word, index) => (
                  <Draggable key={word.id} draggableId={word.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`px-4 py-2 bg-white border rounded-lg cursor-move select-none transition-all ${
                          snapshot.isDragging 
                            ? 'shadow-lg scale-105 bg-blue-50 border-blue-300' 
                            : 'hover:shadow-md border-gray-300'
                        }`}
                      >
                        {word.word}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* 提示 */}
        {showHints && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 提示：根據句子的語境選擇最合適的單詞。注意語法和語義的一致性。
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
