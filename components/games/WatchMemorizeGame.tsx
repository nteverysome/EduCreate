/**
 * Watch and Memorize Game Component
 * 基於觀察記憶機制的序列記憶遊戲
 */

import React, { useState, useEffect } from 'react';

interface SequenceItem {
  id: string;
  content: string;
  duration: number; // 顯示時間(毫秒)
  type?: 'text' | 'image' | 'color' | 'number';
}

interface WatchMemorizeGameProps {
  sequence: SequenceItem[];
  testType?: 'order' | 'content' | 'both';
  showDuration?: number; // 總顯示時間(秒)
  maxAttempts?: number;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}

type GamePhase = 'intro' | 'watching' | 'testing' | 'completed';

export default function WatchMemorizeGame({
  sequence,
  testType = 'order',
  showDuration = 5,
  maxAttempts = 3,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: WatchMemorizeGameProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<SequenceItem[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [watchingProgress, setWatchingProgress] = useState(0);

  // 計時器
  useEffect(() => {
    if (gamePhase === 'testing' && timeLimit > 0 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit > 0) {
      handleGameComplete();
    }
  }, [gamePhase, timeLeft, timeLimit]);

  const startGame = () => {
    setGamePhase('watching');
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
    startWatchingSequence();
  };

  const startWatchingSequence = () => {
    setCurrentItemIndex(0);
    setWatchingProgress(0);
    
    const totalDuration = showDuration * 1000;
    const itemDuration = totalDuration / sequence.length;
    
    // 顯示序列
    sequence.forEach((item, index) => {
      setTimeout(() => {
        setCurrentItemIndex(index);
        setWatchingProgress(((index + 1) / sequence.length) * 100);
        
        // 如果是最後一個項目，開始測試階段
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setGamePhase('testing');
            prepareTestItems();
          }, itemDuration);
        }
      }, index * itemDuration);
    });
  };

  const prepareTestItems = () => {
    if (testType === 'order') {
      // 打亂順序讓用戶重新排列
      const shuffled = [...sequence].sort(() => Math.random() - 0.5);
      setAvailableItems(shuffled);
    } else if (testType === 'content') {
      // 添加一些干擾項
      const distractors = generateDistractors(sequence);
      const allItems = [...sequence, ...distractors].sort(() => Math.random() - 0.5);
      setAvailableItems(allItems);
    } else {
      // both: 既要記住內容又要記住順序
      const shuffled = [...sequence].sort(() => Math.random() - 0.5);
      setAvailableItems(shuffled);
    }
  };

  const generateDistractors = (originalSequence: SequenceItem[]): SequenceItem[] => {
    // 生成干擾項的邏輯
    const distractors: SequenceItem[] = [];
    const usedContent = new Set(originalSequence.map(item => item.content));
    
    // 根據類型生成干擾項
    for (let i = 0; i < Math.min(3, originalSequence.length); i++) {
      let distractor: string;
      const sampleItem = originalSequence[0];
      
      switch (sampleItem.type) {
        case 'number':
          do {
            distractor = Math.floor(Math.random() * 100).toString();
          } while (usedContent.has(distractor));
          break;
        case 'color':
          const colors = ['紅色', '藍色', '綠色', '黃色', '紫色', '橙色', '粉色', '棕色'];
          do {
            distractor = colors[Math.floor(Math.random() * colors.length)];
          } while (usedContent.has(distractor));
          break;
        default:
          // 對於文字，生成相似但不同的內容
          distractor = `干擾項${i + 1}`;
      }
      
      distractors.push({
        id: `distractor-${i}`,
        content: distractor,
        duration: sampleItem.duration,
        type: sampleItem.type
      });
      
      usedContent.add(distractor);
    }
    
    return distractors;
  };

  const handleItemSelect = (item: SequenceItem) => {
    if (userSequence.length < sequence.length) {
      setUserSequence(prev => [...prev, item.content]);
      setAvailableItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const handleItemRemove = (index: number) => {
    const removedContent = userSequence[index];
    const removedItem = sequence.find(item => item.content === removedContent) || 
                       availableItems.find(item => item.content === removedContent);
    
    if (removedItem) {
      setUserSequence(prev => prev.filter((_, i) => i !== index));
      setAvailableItems(prev => [...prev, removedItem]);
    }
  };

  const checkAnswer = () => {
    setAttempts(prev => prev + 1);
    
    let isCorrect = false;
    let partialScore = 0;
    
    if (testType === 'order' || testType === 'both') {
      // 檢查順序
      const correctSequence = sequence.map(item => item.content);
      isCorrect = JSON.stringify(userSequence) === JSON.stringify(correctSequence);
      
      // 計算部分分數
      for (let i = 0; i < Math.min(userSequence.length, correctSequence.length); i++) {
        if (userSequence[i] === correctSequence[i]) {
          partialScore += 5;
        }
      }
    } else if (testType === 'content') {
      // 檢查內容（順序不重要）
      const correctContent = new Set(sequence.map(item => item.content));
      const userContent = new Set(userSequence);
      isCorrect = correctContent.size === userContent.size && 
                 [...correctContent].every(content => userContent.has(content));
      
      // 計算部分分數
      partialScore = [...userContent].filter(content => correctContent.has(content)).length * 5;
    }
    
    if (isCorrect) {
      const baseScore = 50;
      const attemptBonus = Math.max(0, 30 - (attempts - 1) * 10);
      const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 5)) : 0;
      const totalScore = baseScore + attemptBonus + timeBonus;
      
      setScore(prev => {
        const newScore = prev + totalScore;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      
      setFeedbackMessage(`完全正確！+${totalScore} 分`);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
        handleGameComplete();
      }, 2000);
    } else {
      if (partialScore > 0) {
        setScore(prev => {
          const newScore = prev + partialScore;
          onScoreUpdate?.(newScore);
          return newScore;
        });
        setFeedbackMessage(`部分正確！+${partialScore} 分`);
      } else {
        setFeedbackMessage('不正確，再試試看！');
      }
      
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
      
      if (attempts >= maxAttempts) {
        setTimeout(() => {
          handleGameComplete();
        }, 2000);
      } else {
        // 重置用戶選擇
        setUserSequence([]);
        prepareTestItems();
      }
    }
  };

  const handleGameComplete = () => {
    setGamePhase('completed');
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    onComplete?.(score, timeUsed);
  };

  const renderSequenceItem = (item: SequenceItem) => {
    const baseClasses = "flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300";
    
    switch (item.type) {
      case 'color':
        const colorMap: { [key: string]: string } = {
          '紅色': 'bg-red-500 text-white',
          '藍色': 'bg-blue-500 text-white',
          '綠色': 'bg-green-500 text-white',
          '黃色': 'bg-yellow-500 text-black',
          '紫色': 'bg-purple-500 text-white',
          '橙色': 'bg-orange-500 text-white',
          '粉色': 'bg-pink-500 text-white',
          '棕色': 'bg-amber-700 text-white'
        };
        return (
          <div className={`${baseClasses} ${colorMap[item.content] || 'bg-gray-500 text-white'} w-32 h-32`}>
            {item.content}
          </div>
        );
      case 'number':
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-800 w-32 h-32 text-4xl`}>
            {item.content}
          </div>
        );
      case 'image':
        return (
          <img 
            src={item.content} 
            alt="Sequence item" 
            className="w-32 h-32 object-cover rounded-lg"
          />
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-800 w-32 h-32 p-4 text-center`}>
            {item.content}
          </div>
        );
    }
  };

  if (gamePhase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">觀察記憶</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          仔細觀察即將顯示的序列，然後根據要求重現它們。基於觀察記憶機制，提高您的注意力和記憶力。
        </p>
        <div className="mb-6 text-center space-y-2">
          <p className="text-sm text-gray-500">序列長度: {sequence.length} 項</p>
          <p className="text-sm text-gray-500">觀察時間: {showDuration} 秒</p>
          <p className="text-sm text-gray-500">測試類型: {
            testType === 'order' ? '記住順序' : 
            testType === 'content' ? '記住內容' : 
            '記住內容和順序'
          }</p>
          <p className="text-sm text-gray-500">最大嘗試次數: {maxAttempts}</p>
          {timeLimit > 0 && <p className="text-sm text-gray-500">時間限制: {timeLimit} 秒</p>}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
        >
          開始觀察
        </button>
      </div>
    );
  }

  if (gamePhase === 'watching') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">仔細觀察序列</h2>
        
        {/* 進度條 */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${watchingProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {Math.round(watchingProgress)}% 完成
          </p>
        </div>

        {/* 當前項目 */}
        <div className="mb-4">
          <p className="text-center text-lg font-semibold mb-4">
            項目 {currentItemIndex + 1} / {sequence.length}
          </p>
          {sequence[currentItemIndex] && renderSequenceItem(sequence[currentItemIndex])}
        </div>

        <p className="text-gray-600 text-center">
          請專注觀察每個項目...
        </p>
      </div>
    );
  }

  if (gamePhase === 'testing') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* 遊戲狀態欄 */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">得分: {score}</span>
            <span className="text-sm text-gray-600">
              嘗試: {attempts}/{maxAttempts}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 用戶序列區域 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {testType === 'order' ? '按正確順序排列:' : 
               testType === 'content' ? '選擇正確的項目:' : 
               '按正確順序選擇項目:'}
            </h3>
            <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              {userSequence.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  點擊右側的項目來添加到序列中
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userSequence.map((content, index) => {
                    const item = sequence.find(s => s.content === content) || 
                               { id: `user-${index}`, content, duration: 0, type: 'text' as const };
                    return (
                      <div 
                        key={index}
                        className="relative cursor-pointer"
                        onClick={() => handleItemRemove(index)}
                      >
                        {renderSequenceItem(item)}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                          ×
                        </div>
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={checkAnswer}
                disabled={userSequence.length !== sequence.length}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                檢查答案
              </button>
            </div>
          </div>

          {/* 可選項目區域 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">可選項目:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleItemSelect(item)}
                >
                  {renderSequenceItem(item)}
                </div>
              ))}
            </div>
            
            {availableItems.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                所有項目已選擇
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">操作說明:</p>
          <ul className="space-y-1">
            <li>• 點擊右側項目添加到序列中</li>
            <li>• 點擊左側項目上的 × 可以移除</li>
            <li>• 數字表示項目在序列中的位置</li>
            <li>• 完成後點擊"檢查答案"</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gamePhase === 'completed') {
    const accuracy = sequence.length > 0 ? (score / (sequence.length * 10)) * 100 : 0;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">記憶測試完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">使用嘗試次數: {attempts}/{maxAttempts}</p>
          <p className="text-gray-600">記憶準確率: {accuracy.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          再玩一次
        </button>
      </div>
    );
  }

  return null;
}
