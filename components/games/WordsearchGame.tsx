import React, { useState, useEffect } from 'react';
export interface WordsearchWord {
  id: string;
  word: string;
  hint?: string;
  category?: string;
}
interface WordsearchGameProps {
  words: WordsearchWord[];
  gridSize?: number;
  timeLimit?: number;
  onComplete?: (results: any) => void;
}
interface GridCell {
  letter: string;
  isPartOfWord: boolean;
  wordIds: string[];
  isSelected: boolean;
  isFound: boolean;
}
interface WordPlacement {
  word: string;
  wordId: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  positions: {row: number, col: number}[];
}
export default function WordsearchGame({
  words,
  gridSize = 12,
  timeLimit = 300,
  onComplete
}: WordsearchGameProps) {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  // 生成隨機字母
  const getRandomLetter = () => {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  };
  // 檢查位置是否有效
  const isValidPosition = (row: number, col: number, word: string, direction: string) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1]
    };
    const [dRow, dCol] = directions[direction as keyof typeof directions];
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
        return false;
      }
    }
    return true;
  };
  // 放置單詞
  const placeWord = (grid: GridCell[][], word: WordsearchWord, placement: WordPlacement) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1]
    };
    const [dRow, dCol] = directions[placement.direction];
    for (let i = 0; i < word.word.length; i++) {
      const row = placement.startRow + i * dRow;
      const col = placement.startCol + i * dCol;
      grid[row][col].letter = word.word[i].toUpperCase();
      grid[row][col].isPartOfWord = true;
      grid[row][col].wordIds.push(word.id);
      placement.positions.push({ row, col });
    }
  };
  // 初始化網格
  useEffect(() => {
    const newGrid: GridCell[][] = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({
        letter: '',
        isPartOfWord: false,
        wordIds: [],
        isSelected: false,
        isFound: false
      }))
    );
    const placements: WordPlacement[] = [];
    const directions = ['horizontal', 'vertical', 'diagonal'];
    // 嘗試放置每個單詞
    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        if (isValidPosition(row, col, word.word, direction)) {
          const placement: WordPlacement = {
            word: word.word,
            wordId: word.id,
            startRow: row,
            startCol: col,
            direction: direction as any,
            positions: []
          };
          placeWord(newGrid, word, placement);
          placements.push(placement);
          placed = true;
        }
        attempts++;
      }
    });
    // 填充剩餘格子
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!newGrid[row][col].letter) {
          newGrid[row][col].letter = getRandomLetter();
        }
      }
    }
    setGrid(newGrid);
    setWordPlacements(placements);
  }, [words, gridSize]);
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
    setFoundWords(new Set());
    setSelectedCells([]);
    setScore(0);
    setTimeLeft(timeLimit);
  };
  // 開始選擇
  const handleMouseDown = (row: number, col: number) => {
    if (!gameStarted || gameCompleted) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setGrid(prev => prev.map((gridRow, r) =>
      gridRow.map((cell, c) => ({
        ...cell,
        isSelected: r === row && c === col
      }))
    ));
  };
  // 選擇過程中
  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !gameStarted || gameCompleted) return;
    const firstCell = selectedCells[0];
    if (!firstCell) return;
    // 計算選擇路徑
    const newSelectedCells = getSelectionPath(firstCell, { row, col });
    setSelectedCells(newSelectedCells);
    setGrid(prev => prev.map((gridRow, r) =>
      gridRow.map((cell, c) => ({
        ...cell,
        isSelected: newSelectedCells.some(selected => selected.row === r && selected.col === c)
      }))
    ));
  };
  // 計算選擇路徑
  const getSelectionPath = (start: {row: number, col: number}, end: {row: number, col: number}) => {
    const path = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    // 只允許直線選擇
    if (rowDiff === 0) {
      // 水平
      const step = colDiff > 0 ? 1 : -1;
      for (let col = start.col; col !== end.col + step; col += step) {
        path.push({ row: start.row, col });
      }
    } else if (colDiff === 0) {
      // 垂直
      const step = rowDiff > 0 ? 1 : -1;
      for (let row = start.row; row !== end.row + step; row += step) {
        path.push({ row, col: start.col });
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      // 對角線
      const rowStep = rowDiff > 0 ? 1 : -1;
      const colStep = colDiff > 0 ? 1 : -1;
      const steps = Math.abs(rowDiff);
      for (let i = 0; i <= steps; i++) {
        path.push({
          row: start.row + i * rowStep,
          col: start.col + i * colStep
        });
      }
    } else {
      // 無效選擇，只返回起始點
      return [start];
    }
    return path;
  };
  // 結束選擇
  const handleMouseUp = () => {
    if (!isSelecting || !gameStarted || gameCompleted) return;
    setIsSelecting(false);
    // 檢查是否找到單詞
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col].letter).join('');
    const reverseWord = selectedWord.split('').reverse().join('');
    const foundPlacement = wordPlacements.find(placement => 
      placement.word.toUpperCase() === selectedWord || placement.word.toUpperCase() === reverseWord
    );
    if (foundPlacement && !foundWords.has(foundPlacement.wordId)) {
      // 找到新單詞
      setFoundWords(prev => new Set([...prev, foundPlacement.wordId]));
      setScore(prev => prev + foundPlacement.word.length * 10);
      // 標記為已找到
      setGrid(prev => prev.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          isFound: foundPlacement.positions.some(pos => pos.row === r && pos.col === c) || cell.isFound,
          isSelected: false
        }))
      ));
    } else {
      // 清除選擇
      setGrid(prev => prev.map(row =>
        row.map(cell => ({ ...cell, isSelected: false }))
      ));
    }
    setSelectedCells([]);
  };
  // 檢查遊戲完成
  useEffect(() => {
    if (foundWords.size === words.length && words.length > 0) {
      setGameCompleted(true);
    }
  }, [foundWords.size, words.length]);
  // 遊戲完成處理
  useEffect(() => {
    if (gameCompleted) {
      const accuracy = Math.round((foundWords.size / words.length) * 100);
      const timeSpent = timeLimit - timeLeft;
      const results = {
        score,
        foundWords: foundWords.size,
        totalWords: words.length,
        accuracy,
        timeSpent
      };
      onComplete?.(results);
    }
  }, [gameCompleted, score, foundWords.size, words.length, timeLimit, timeLeft, onComplete]);
  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">找字遊戲</h2>
        <p className="text-gray-600 mb-6">
          在字母網格中找到隱藏的單詞。共 {words.length} 個單詞，限時 {Math.floor(timeLimit / 60)} 分鐘。
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-colors"
        >
          開始遊戲
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    const accuracy = Math.round((foundWords.size / words.length) * 100);
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
              <span className="text-gray-600">找到單詞:</span>
              <span className="font-bold text-blue-600">{foundWords.size}/{words.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成率:</span>
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
          className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          重新開始
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto">
      {/* 遊戲狀態 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {foundWords.size}/{words.length}
          </div>
          <div className="text-sm text-gray-600">找到單詞</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{formatTime(timeLeft)}</div>
          <div className="text-sm text-gray-600">剩餘時間</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{score}</div>
          <div className="text-sm text-gray-600">得分</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 字母網格 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div 
              className="grid gap-1 select-none" 
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              onMouseLeave={() => setIsSelecting(false)}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                    className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer ${
                      cell.isFound
                        ? 'bg-green-200 text-green-800'
                        : cell.isSelected
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {cell.letter}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* 單詞列表 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">要找的單詞</h3>
          <div className="space-y-2">
            {words.map(word => (
              <div
                key={word.id}
                className={`p-3 rounded-lg border ${
                  foundWords.has(word.id)
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{word.word.toUpperCase()}</span>
                  {foundWords.has(word.id) && <span className="text-green-600">✓</span>}
                </div>
                {word.hint && (
                  <div className="text-sm text-gray-600 mt-1">
                    💡 {word.hint}
                  </div>
                )}
                {word.category && (
                  <div className="text-xs text-gray-500 mt-1">
                    分類: {word.category}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 遊戲說明 */}
      <div className="mt-6 text-center text-gray-600">
        <p>拖拽選擇字母來找到隱藏的單詞！可以是水平、垂直或對角線方向。</p>
      </div>
    </div>
  );
}
