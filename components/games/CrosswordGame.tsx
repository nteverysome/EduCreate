import React, { useState, useEffect } from 'react';

export interface CrosswordClue {
  id: string;
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
}

interface CrosswordGameProps {
  clues: CrosswordClue[];
  gridSize?: number;
  timeLimit?: number;
  onComplete?: (results: any) => void;
}

interface GridCell {
  letter: string;
  isBlocked: boolean;
  number?: number;
  userInput: string;
  isCorrect?: boolean;
}

export default function CrosswordGame({
  clues,
  gridSize = 10,
  timeLimit = 300,
  onComplete
}: CrosswordGameProps) {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // 初始化網格
  useEffect(() => {
    const newGrid: GridCell[][] = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({
        letter: '',
        isBlocked: true,
        userInput: '',
        isCorrect: false
      }))
    );

    // 根據線索設置網格
    clues.forEach(clue => {
      for (let i = 0; i < clue.length; i++) {
        const row = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
        const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        
        if (row < gridSize && col < gridSize) {
          newGrid[row][col] = {
            letter: clue.answer[i].toUpperCase(),
            isBlocked: false,
            userInput: '',
            isCorrect: false,
            number: i === 0 ? clue.number : newGrid[row][col].number
          };
        }
      }
    });

    setGrid(newGrid);
  }, [clues, gridSize]);

  // 計時器
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  // 開始遊戲
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCompletedClues(new Set());
    setScore(0);
    setTimeLeft(timeLimit);
    setSelectedClue(null);
    setSelectedCell(null);
    
    // 重置用戶輸入
    setGrid(prev => prev.map(row => 
      row.map(cell => ({ ...cell, userInput: '', isCorrect: false }))
    ));
  };

  // 點擊格子
  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || gameCompleted || grid[row][col].isBlocked) return;
    
    setSelectedCell({ row, col });
    
    // 找到包含此格子的線索
    const relevantClues = clues.filter(clue => {
      const inRange = clue.direction === 'across' 
        ? row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.length
        : col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.length;
      return inRange;
    });
    
    if (relevantClues.length > 0) {
      setSelectedClue(relevantClues[0]);
    }
  };

  // 輸入字母
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!selectedCell || !gameStarted || gameCompleted) return;
    
    const { row, col } = selectedCell;
    const key = e.key.toUpperCase();
    
    if (/^[A-Z]$/.test(key)) {
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[row][col] = { ...newGrid[row][col], userInput: key };
        return newGrid;
      });
      
      // 移動到下一個格子
      moveToNextCell();
    } else if (e.key === 'Backspace') {
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[row][col] = { ...newGrid[row][col], userInput: '' };
        return newGrid;
      });
    }
  };

  // 移動到下一個格子
  const moveToNextCell = () => {
    if (!selectedClue || !selectedCell) return;
    
    const { row, col } = selectedCell;
    let nextRow = row;
    let nextCol = col;
    
    if (selectedClue.direction === 'across') {
      nextCol = Math.min(col + 1, selectedClue.startCol + selectedClue.length - 1);
    } else {
      nextRow = Math.min(row + 1, selectedClue.startRow + selectedClue.length - 1);
    }
    
    setSelectedCell({ row: nextRow, col: nextCol });
  };

  // 檢查答案
  const checkAnswers = () => {
    let correctCount = 0;
    const newCompletedClues = new Set<string>();
    
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      
      clues.forEach(clue => {
        let isClueComplete = true;
        let isClueCorrect = true;
        
        for (let i = 0; i < clue.length; i++) {
          const row = clue.direction === 'down' ? clue.startRow + i : clue.startRow;
          const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
          
          const userInput = newGrid[row][col].userInput;
          const correctLetter = clue.answer[i].toUpperCase();
          
          if (!userInput) {
            isClueComplete = false;
          } else if (userInput !== correctLetter) {
            isClueCorrect = false;
          }
          
          newGrid[row][col].isCorrect = userInput === correctLetter;
        }
        
        if (isClueComplete && isClueCorrect) {
          newCompletedClues.add(clue.id);
          correctCount++;
        }
      });
      
      return newGrid;
    });
    
    setCompletedClues(newCompletedClues);
    setScore(correctCount * 10);
    
    // 檢查是否完成
    if (newCompletedClues.size === clues.length) {
      setGameCompleted(true);
    }
  };

  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const accuracy = Math.round((completedClues.size / clues.length) * 100);
      const timeSpent = timeLimit - timeLeft;
      
      const results = {
        score,
        completedClues: completedClues.size,
        totalClues: clues.length,
        accuracy,
        timeSpent
      };
      
      onComplete?.(results);
    }
  }, [gameCompleted, score, completedClues.size, clues.length, timeLimit, timeLeft, onComplete]);

  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🧩</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">填字遊戲</h2>
        <p className="text-gray-600 mb-6">
          根據線索填入正確的單詞。共 {clues.length} 個線索，限時 {Math.floor(timeLimit / 60)} 分鐘。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-purple-500 text-white text-xl font-bold rounded-lg hover:bg-purple-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = Math.round((completedClues.size / clues.length) * 100);
    
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">遊戲完成！</h2>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">最終得分:</span>
              <span className="font-bold text-green-600">{score} 分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成線索:</span>
              <span className="font-bold text-blue-600">{completedClues.size}/{clues.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">準確率:</span>
              <span className="font-bold text-purple-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">用時:</span>
              <span className="font-bold text-orange-600">{formatTime(timeLimit - timeLeft)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {completedClues.size}/{clues.length}
          </div>
          <div className="text-sm text-gray-600">完成線索</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{formatTime(timeLeft)}</div>
          <div className="text-sm text-gray-600">剩餘時間</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 填字網格 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer relative ${
                      cell.isBlocked 
                        ? 'bg-gray-800' 
                        : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'bg-blue-200'
                        : cell.isCorrect
                        ? 'bg-green-100'
                        : cell.userInput && !cell.isCorrect
                        ? 'bg-red-100'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {cell.number && (
                      <span className="absolute top-0 left-0 text-xs text-blue-600">
                        {cell.number}
                      </span>
                    )}
                    {!cell.isBlocked && (
                      <span className="text-gray-800">
                        {cell.userInput || ''}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={checkAnswers}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                檢查答案
              </button>
            </div>
          </div>
        </div>

        {/* 線索列表 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">線索</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-700 mb-2">橫向 (Across)</h4>
              <div className="space-y-2">
                {clues.filter(clue => clue.direction === 'across').map(clue => (
                  <div
                    key={clue.id}
                    onClick={() => setSelectedClue(clue)}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      selectedClue?.id === clue.id
                        ? 'bg-blue-100 border-blue-300'
                        : completedClues.has(clue.id)
                        ? 'bg-green-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-700 mb-2">縱向 (Down)</h4>
              <div className="space-y-2">
                {clues.filter(clue => clue.direction === 'down').map(clue => (
                  <div
                    key={clue.id}
                    onClick={() => setSelectedClue(clue)}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      selectedClue?.id === clue.id
                        ? 'bg-blue-100 border-blue-300'
                        : completedClues.has(clue.id)
                        ? 'bg-green-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
