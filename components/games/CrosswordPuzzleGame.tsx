/**
 * Crossword Puzzle Game Component
 * 基於詞彙網絡記憶機制的填字遊戲
 * 根據WordWall Crossword模板分析設計
 */
import React, { useState, useEffect, useRef } from 'react';
interface CrosswordClue {
  id: string;
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
}
interface CrosswordCell {
  letter: string;
  isBlack: boolean;
  number?: number;
  userInput: string;
  isCorrect?: boolean;
  belongsToClues: string[];
}
interface CrosswordPuzzleGameProps {
  clues: CrosswordClue[];
  gridSize: { rows: number; cols: number };
  timeLimit?: number;
  showHints?: boolean;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function CrosswordPuzzleGame({
  clues,
  gridSize,
  timeLimit = 0,
  showHints = true,
  onComplete,
  onScoreUpdate
}: CrosswordPuzzleGameProps) {
  const [grid, setGrid] = useState<CrosswordCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  // 初始化網格
  useEffect(() => {
    initializeGrid();
  }, [clues, gridSize]);
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
  const initializeGrid = () => {
    const newGrid: CrosswordCell[][] = Array(gridSize.rows).fill(null).map(() =>
      Array(gridSize.cols).fill(null).map(() => ({
        letter: '',
        isBlack: true,
        userInput: '',
        belongsToClues: []
      }))
    );
    // 根據線索設置網格
    clues.forEach(clue => {
      const { startRow, startCol, answer, direction, id, number } = clue;
      for (let i = 0; i < answer.length; i++) {
        const row = direction === 'down' ? startRow + i : startRow;
        const col = direction === 'across' ? startCol + i : startCol;
        if (row < gridSize.rows && col < gridSize.cols) {
          newGrid[row][col].letter = answer[i].toUpperCase();
          newGrid[row][col].isBlack = false;
          newGrid[row][col].belongsToClues.push(id);
          // 設置起始數字
          if (i === 0) {
            newGrid[row][col].number = number;
          }
        }
      }
    });
    setGrid(newGrid);
  };
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    setSelectedCell({ row, col });
    // 找到包含此格子的線索
    const cellClues = grid[row][col].belongsToClues
      .map(clueId => clues.find(c => c.id === clueId))
      .filter(Boolean) as CrosswordClue[];
    if (cellClues.length > 0) {
      // 如果有多個線索，選擇當前方向的線索
      const directionClue = cellClues.find(c => c.direction === selectedDirection);
      setSelectedClue(directionClue || cellClues[0]);
      if (directionClue) {
        setSelectedDirection(directionClue.direction);
      }
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!selectedCell || !gameStarted || gameCompleted) return;
    const { row, col } = selectedCell;
    if (e.key.match(/[a-zA-Z]/)) {
      // 輸入字母
      const letter = e.key.toUpperCase();
      updateCell(row, col, letter);
      moveToNextCell();
    } else if (e.key === 'Backspace') {
      // 刪除字母
      updateCell(row, col, '');
      moveToPreviousCell();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
               e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      handleArrowKey(e.key);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      switchDirection();
    }
  };
  const updateCell = (row: number, col: number, letter: string) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row][col].userInput = letter;
      newGrid[row][col].isCorrect = letter === newGrid[row][col].letter;
      return newGrid;
    });
    // 檢查線索是否完成
    checkClueCompletion();
  };
  const moveToNextCell = () => {
    if (!selectedCell || !selectedClue) return;
    const { row, col } = selectedCell;
    const { direction, startRow, startCol, answer } = selectedClue;
    let nextRow = row;
    let nextCol = col;
    if (direction === 'across') {
      nextCol++;
      if (nextCol >= startCol + answer.length) return;
    } else {
      nextRow++;
      if (nextRow >= startRow + answer.length) return;
    }
    if (nextRow < gridSize.rows && nextCol < gridSize.cols && !grid[nextRow][nextCol].isBlack) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
  };
  const moveToPreviousCell = () => {
    if (!selectedCell || !selectedClue) return;
    const { row, col } = selectedCell;
    const { direction, startRow, startCol } = selectedClue;
    let prevRow = row;
    let prevCol = col;
    if (direction === 'across') {
      prevCol--;
      if (prevCol < startCol) return;
    } else {
      prevRow--;
      if (prevRow < startRow) return;
    }
    if (prevRow >= 0 && prevCol >= 0 && !grid[prevRow][prevCol].isBlack) {
      setSelectedCell({ row: prevRow, col: prevCol });
    }
  };
  const handleArrowKey = (key: string) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;
    switch (key) {
      case 'ArrowUp':
        newRow--;
        break;
      case 'ArrowDown':
        newRow++;
        break;
      case 'ArrowLeft':
        newCol--;
        break;
      case 'ArrowRight':
        newCol++;
        break;
    }
    if (newRow >= 0 && newRow < gridSize.rows && 
        newCol >= 0 && newCol < gridSize.cols && 
        !grid[newRow][newCol].isBlack) {
      setSelectedCell({ row: newRow, col: newCol });
    }
  };
  const switchDirection = () => {
    setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
    if (selectedCell) {
      const { row, col } = selectedCell;
      const cellClues = grid[row][col].belongsToClues
        .map(clueId => clues.find(c => c.id === clueId))
        .filter(Boolean) as CrosswordClue[];
      const newDirection = selectedDirection === 'across' ? 'down' : 'across';
      const directionClue = cellClues.find(c => c.direction === newDirection);
      if (directionClue) {
        setSelectedClue(directionClue);
      }
    }
  };
  const checkClueCompletion = () => {
    clues.forEach(clue => {
      const { id, answer, startRow, startCol, direction } = clue;
      let isComplete = true;
      for (let i = 0; i < answer.length; i++) {
        const row = direction === 'down' ? startRow + i : startRow;
        const col = direction === 'across' ? startCol + i : startCol;
        if (grid[row][col].userInput !== answer[i].toUpperCase()) {
          isComplete = false;
          break;
        }
      }
      if (isComplete && !completedClues.has(id)) {
        setCompletedClues(prev => new Set([...prev, id]));
        const points = answer.length * 5;
        setScore(prev => {
          const newScore = prev + points;
          onScoreUpdate?.(newScore);
          return newScore;
        });
        setFeedbackMessage(`完成線索！+${points} 分`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1500);
      }
    });
    // 檢查是否全部完成
    if (completedClues.size === clues.length - 1) { // -1 因為還沒更新state
      setTimeout(() => {
        handleGameComplete();
      }, 2000);
    }
  };
  const showHint = (clue: CrosswordClue) => {
    if (!showHints) return;
    setHintsUsed(prev => prev + 1);
    // 顯示第一個空白字母
    const { answer, startRow, startCol, direction } = clue;
    for (let i = 0; i < answer.length; i++) {
      const row = direction === 'down' ? startRow + i : startRow;
      const col = direction === 'across' ? startCol + i : startCol;
      if (grid[row][col].userInput === '') {
        updateCell(row, col, answer[i].toUpperCase());
        break;
      }
    }
    // 扣分
    setScore(prev => Math.max(0, prev - 5));
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    // 完成獎勵
    const completionBonus = 100;
    const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 10)) : 0;
    const hintPenalty = hintsUsed * 5;
    const finalScore = score + completionBonus + timeBonus - hintPenalty;
    setScore(finalScore);
    onScoreUpdate?.(finalScore);
    onComplete?.(finalScore, timeUsed);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">填字遊戲</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          根據線索填入正確的單詞。基於詞彙網絡記憶機制，提高您的詞彙聯想能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲設置：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>網格大小: {gridSize.rows} × {gridSize.cols}</p>
            <p>線索數量: {clues.length}</p>
            <p>提示功能: {showHints ? '啟用' : '關閉'}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
        >
          開始填字
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = clues.length > 0 ? (completedClues.size / clues.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">填字完成！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">完成線索: {completedClues.size}/{clues.length}</p>
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
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            完成: {completedClues.size}/{clues.length}
          </span>
          <span className="text-sm text-yellow-600">提示: {hintsUsed}</span>
        </div>
        {timeLimit > 0 && (
          <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
            時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      {/* 反饋消息 */}
      {showFeedback && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold z-50">
          {feedbackMessage}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 填字網格 */}
        <div className="lg:col-span-2">
          <div 
            ref={gridRef}
            className="inline-block p-4 bg-white rounded-lg shadow"
            tabIndex={0}
            onKeyDown={handleKeyPress}
          >
            <div 
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold cursor-pointer relative ${
                      cell.isBlack 
                        ? 'bg-black' 
                        : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? 'bg-blue-200'
                          : cell.isCorrect === true
                            ? 'bg-green-100'
                            : cell.isCorrect === false
                              ? 'bg-red-100'
                              : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {!cell.isBlack && (
                      <>
                        {cell.number && (
                          <span className="absolute top-0 left-0 text-xs text-gray-600">
                            {cell.number}
                          </span>
                        )}
                        <span className="text-center">
                          {cell.userInput || ''}
                        </span>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* 線索列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">線索</h3>
            <div className="space-y-4">
              {/* 橫向線索 */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">橫向</h4>
                <div className="space-y-2">
                  {clues.filter(c => c.direction === 'across').map(clue => (
                    <div 
                      key={clue.id}
                      className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                        completedClues.has(clue.id)
                          ? 'bg-green-100 text-green-800'
                          : selectedClue?.id === clue.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedClue(clue);
                        setSelectedDirection('across');
                        setSelectedCell({ row: clue.startRow, col: clue.startCol });
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span>
                          <strong>{clue.number}.</strong> {clue.clue}
                        </span>
                        {showHints && !completedClues.has(clue.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showHint(clue);
                            }}
                            className="text-yellow-600 hover:text-yellow-700 ml-2"
                            title="顯示提示 (-5分)"
                          >
                            💡
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 縱向線索 */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">縱向</h4>
                <div className="space-y-2">
                  {clues.filter(c => c.direction === 'down').map(clue => (
                    <div 
                      key={clue.id}
                      className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                        completedClues.has(clue.id)
                          ? 'bg-green-100 text-green-800'
                          : selectedClue?.id === clue.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedClue(clue);
                        setSelectedDirection('down');
                        setSelectedCell({ row: clue.startRow, col: clue.startCol });
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span>
                          <strong>{clue.number}.</strong> {clue.clue}
                        </span>
                        {showHints && !completedClues.has(clue.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showHint(clue);
                            }}
                            className="text-yellow-600 hover:text-yellow-700 ml-2"
                            title="顯示提示 (-5分)"
                          >
                            💡
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 操作說明 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">操作說明：</p>
            <ul className="space-y-1">
              <li>• 點擊格子開始輸入</li>
              <li>• 使用鍵盤輸入字母</li>
              <li>• Tab 鍵切換方向</li>
              <li>• 方向鍵移動位置</li>
              <li>• 點擊線索快速定位</li>
              <li>• 💡 按鈕顯示提示</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
