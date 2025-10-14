/**
 * Word Magnets Game Component
 * 基於詞彙組合記憶機制的單詞磁鐵遊戲
 * 根據WordWall Word Magnets模板分析設計
 */
import React, { useState, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// 临时类型定义
interface DragDropContextProps {
  onDragEnd: (result: any) => void;
  children: React.ReactNode;
}
const DragDropContext: React.FC<DragDropContextProps> = ({ children }) => <>{children}</>;

interface DroppableProps {
  droppableId: string;
  children: (provided: any) => React.ReactNode;
}
const Droppable: React.FC<DroppableProps> = ({ children }) => children({ droppableRef: () => {}, placeholder: null });

interface DraggableProps {
  draggableId: string;
  index: number;
  children: (provided: any) => React.ReactNode;
}
const Draggable: React.FC<DraggableProps> = ({ children }) => children({
  draggableProps: {},
  dragHandleProps: {},
  innerRef: () => {}
});
interface WordMagnet {
  id: string;
  word: string;
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'article' | 'other';
  used: boolean;
}
interface WordMagnetsGameProps {
  words: { word: string; type: string }[];
  targetSentences?: string[];
  freeMode?: boolean;
  grammarCheck?: boolean;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function WordMagnetsGame({
  words,
  targetSentences = [],
  freeMode = true,
  grammarCheck = false,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: WordMagnetsGameProps) {
  const [wordMagnets, setWordMagnets] = useState<WordMagnet[]>([]);
  const [sentenceArea, setSentenceArea] = useState<WordMagnet[]>([]);
  const [createdSentences, setCreatedSentences] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [currentSentence, setCurrentSentence] = useState('');
  // 初始化單詞磁鐵
  useEffect(() => {
    const magnets: WordMagnet[] = words.map((word, index) => ({
      id: `magnet-${index}`,
      word: word.word,
      type: word.type as any,
      used: false
    }));
    // 打亂順序
    const shuffled = magnets.sort(() => Math.random() - 0.5);
    setWordMagnets(shuffled);
  }, [words]);
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
  // 更新當前句子
  useEffect(() => {
    const sentence = sentenceArea.map(magnet => magnet.word).join(' ');
    setCurrentSentence(sentence);
  }, [sentenceArea]);
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // 從單詞區拖到句子區
    if (source.droppableId === 'word-magnets' && destination.droppableId === 'sentence-area') {
      const magnet = wordMagnets.find(m => m.id === draggableId);
      if (magnet && !magnet.used) {
        const newSentenceArea = [...sentenceArea];
        newSentenceArea.splice(destination.index, 0, magnet);
        setSentenceArea(newSentenceArea);
        setWordMagnets(prev => prev.map(m => 
          m.id === draggableId ? { ...m, used: true } : m
        ));
      }
    }
    // 從句子區拖回單詞區
    else if (source.droppableId === 'sentence-area' && destination.droppableId === 'word-magnets') {
      const magnet = sentenceArea[source.index];
      setSentenceArea(prev => prev.filter((_, index) => index !== source.index));
      setWordMagnets(prev => prev.map(m => 
        m.id === magnet.id ? { ...m, used: false } : m
      ));
    }
    // 在句子區內重新排序
    else if (source.droppableId === 'sentence-area' && destination.droppableId === 'sentence-area') {
      const newSentenceArea = [...sentenceArea];
      const [reorderedItem] = newSentenceArea.splice(source.index, 1);
      newSentenceArea.splice(destination.index, 0, reorderedItem);
      setSentenceArea(newSentenceArea);
    }
  };
  const checkSentence = () => {
    if (sentenceArea.length === 0) {
      setFeedbackMessage('請先組成一個句子！');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      return;
    }
    const sentence = currentSentence.trim();
    if (freeMode) {
      // 自由模式：檢查基本語法結構
      const isValid = checkBasicGrammar(sentenceArea);
      if (isValid) {
        const points = calculatePoints(sentenceArea);
        setScore(prev => {
          const newScore = prev + points;
          onScoreUpdate?.(newScore);
          return newScore;
        });
        setCreatedSentences(prev => [...prev, sentence]);
        setFeedbackMessage(`很好的句子！+${points} 分`);
        clearSentence();
      } else {
        setFeedbackMessage('句子結構需要改進，再試試看！');
      }
    } else {
      // 目標模式：檢查是否匹配目標句子
      const isMatch = targetSentences.some(target => 
        target.toLowerCase().trim() === sentence.toLowerCase()
      );
      if (isMatch) {
        const points = 50;
        setScore(prev => {
          const newScore = prev + points;
          onScoreUpdate?.(newScore);
          return newScore;
        });
        setCreatedSentences(prev => [...prev, sentence]);
        setFeedbackMessage(`完美匹配！+${points} 分`);
        clearSentence();
        // 檢查是否完成所有目標句子
        if (createdSentences.length + 1 >= targetSentences.length) {
          setTimeout(() => handleGameComplete(), 2000);
        }
      } else {
        setFeedbackMessage('不匹配目標句子，再試試看！');
      }
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };
  const checkBasicGrammar = (magnets: WordMagnet[]): boolean => {
    if (magnets.length < 2) return false;
    // 基本檢查：至少包含一個名詞和一個動詞
    const hasNoun = magnets.some(m => m.type === 'noun');
    const hasVerb = magnets.some(m => m.type === 'verb');
    return hasNoun && hasVerb;
  };
  const calculatePoints = (magnets: WordMagnet[]): number => {
    let points = 10; // 基礎分數
    // 長度獎勵
    points += Math.min(magnets.length * 2, 20);
    // 詞性多樣性獎勵
    const uniqueTypes = new Set(magnets.map(m => m.type));
    points += uniqueTypes.size * 5;
    return points;
  };
  const clearSentence = () => {
    // 將句子區的單詞返回到單詞區
    setWordMagnets(prev => prev.map(m => ({ ...m, used: false })));
    setSentenceArea([]);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };
  const getWordTypeColor = (type: string): string => {
    switch (type) {
      case 'noun': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'verb': return 'bg-green-100 text-green-800 border-green-300';
      case 'adjective': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'adverb': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'preposition': return 'bg-red-100 text-red-800 border-red-300';
      case 'article': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };
  const getWordTypeName = (type: string): string => {
    switch (type) {
      case 'noun': return '名詞';
      case 'verb': return '動詞';
      case 'adjective': return '形容詞';
      case 'adverb': return '副詞';
      case 'preposition': return '介詞';
      case 'article': return '冠詞';
      default: return '其他';
    }
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">單詞磁鐵</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          使用磁性單詞組合成有意義的句子。基於詞彙組合記憶機制，提高您的語言表達能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲模式：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>模式: {freeMode ? '自由創作' : '目標匹配'}</p>
            <p>單詞數量: {words.length}</p>
            <p>語法檢查: {grammarCheck ? '啟用' : '關閉'}</p>
            {!freeMode && <p>目標句子: {targetSentences.length} 個</p>}
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          開始創作
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">創作完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">創作句子: {createdSentences.length} 個</p>
          {createdSentences.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">您的創作：</h4>
              <ul className="text-left space-y-1">
                {createdSentences.map((sentence, index) => (
                  <li key={index} className="text-gray-700">
                    {index + 1}. {sentence}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto p-6">
        {/* 遊戲狀態欄 */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">得分: {score}</span>
            <span className="text-sm text-gray-600">
              已創作: {createdSentences.length} 個句子
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearSentence}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              清空句子
            </button>
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
            feedbackMessage.includes('很好') || feedbackMessage.includes('完美') ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            {feedbackMessage}
          </div>
        )}
        {/* 目標句子（非自由模式） */}
        {!freeMode && targetSentences.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">目標句子：</h3>
            <ul className="text-yellow-800 text-sm space-y-1">
              {targetSentences.map((sentence, index) => (
                <li key={index} className={createdSentences.includes(sentence) ? 'line-through opacity-50' : ''}>
                  {index + 1}. {sentence}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 句子組合區域 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">組合您的句子：</h3>
          <Droppable droppableId="sentence-area" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[100px] p-4 border-2 border-dashed rounded-lg transition-all ${
                  snapshot.isDraggingOver 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                {sentenceArea.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    拖拽單詞到這裡組成句子
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sentenceArea.map((magnet, index) => (
                      <Draggable key={magnet.id} draggableId={magnet.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-3 py-2 rounded-lg border-2 cursor-move select-none transition-all ${
                              getWordTypeColor(magnet.type)
                            } ${
                              snapshot.isDragging ? 'scale-105 shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            {magnet.word}
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
          {/* 當前句子預覽 */}
          {currentSentence && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium">當前句子: "{currentSentence}"</p>
            </div>
          )}
          {/* 檢查按鈕 */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={checkSentence}
              disabled={sentenceArea.length === 0}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              檢查句子
            </button>
          </div>
        </div>
        {/* 單詞磁鐵區域 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">可用單詞：</h3>
          <Droppable droppableId="word-magnets" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-3 p-4 bg-white rounded-lg shadow min-h-[120px]"
              >
                {wordMagnets.filter(magnet => !magnet.used).map((magnet, index) => (
                  <Draggable key={magnet.id} draggableId={magnet.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`px-3 py-2 rounded-lg border-2 cursor-move select-none transition-all ${
                          getWordTypeColor(magnet.type)
                        } ${
                          snapshot.isDragging ? 'scale-105 shadow-lg' : 'hover:shadow-md'
                        }`}
                        title={getWordTypeName(magnet.type)}
                      >
                        {magnet.word}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        {/* 詞性說明 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">詞性顏色說明：</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {['noun', 'verb', 'adjective', 'adverb', 'preposition', 'article', 'other'].map(type => (
              <span key={type} className={`px-2 py-1 rounded border ${getWordTypeColor(type)}`}>
                {getWordTypeName(type)}
              </span>
            ))}
          </div>
        </div>
        {/* 已創作的句子 */}
        {createdSentences.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">已創作的句子：</h4>
            <ul className="space-y-1">
              {createdSentences.map((sentence, index) => (
                <li key={index} className="text-green-800">
                  {index + 1}. {sentence}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 操作說明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">操作說明：</p>
          <ul className="space-y-1">
            <li>• 拖拽單詞到句子區域組成句子</li>
            <li>• 在句子區域內可以重新排列單詞順序</li>
            <li>• 不同顏色代表不同的詞性</li>
            <li>• 點擊"檢查句子"驗證語法和得分</li>
            <li>• 使用"清空句子"重新開始</li>
          </ul>
        </div>
      </div>
    </DragDropContext>
  );
}
