/**
 * Maze Chase Game Component
 * 基於空間導航記憶機制的迷宮追逐遊戲
 * 根據WordWall Maze Chase模板分析設計
 */
import React, { useState, useEffect, useCallback } from 'react';
interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isPath: boolean;
  hasQuestion: boolean;
  question?: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
  };
  isVisited: boolean;
}
interface Position {
  x: number;
  y: number;
}
interface MazeChaseGameProps {
  mazeSize: { width: number; height: number };
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
  }>;
  timeLimit?: number;
  onComplete?: (score: number, timeUsed: number) => void;
  onScoreUpdate?: (score: number) => void;
}
export default function MazeChaseGame({
  mazeSize,
  questions,
  timeLimit = 0,
  onComplete,
  onScoreUpdate
}: MazeChaseGameProps) {
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 });
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [pathToTarget, setPathToTarget] = useState<Position[]>([]);
  // 生成迷宮
  const generateMaze = useCallback(() => {
    const { width, height } = mazeSize;
    const newMaze: MazeCell[][] = [];
    // 初始化迷宮（全部為牆）
    for (let y = 0; y < height; y++) {
      newMaze[y] = [];
      for (let x = 0; x < width; x++) {
        newMaze[y][x] = {
          x,
          y,
          isWall: true,
          isPath: false,
          hasQuestion: false,
          isVisited: false
        };
      }
    }
    // 使用遞歸回溯算法生成迷宮
    const stack: Position[] = [];
    const start = { x: 1, y: 1 };
    newMaze[start.y][start.x].isWall = false;
    newMaze[start.y][start.x].isPath = true;
    stack.push(start);
    const directions = [
      { x: 0, y: -2 }, // 上
      { x: 2, y: 0 },  // 右
      { x: 0, y: 2 },  // 下
      { x: -2, y: 0 }  // 左
    ];
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors: Position[] = [];
      // 找到未訪問的鄰居
      directions.forEach(dir => {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && newMaze[ny][nx].isWall) {
          neighbors.push({ x: nx, y: ny });
        }
      });
      if (neighbors.length > 0) {
        // 隨機選擇一個鄰居
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // 打通當前位置和選中鄰居之間的牆
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        newMaze[wallY][wallX].isWall = false;
        newMaze[wallY][wallX].isPath = true;
        newMaze[next.y][next.x].isWall = false;
        newMaze[next.y][next.x].isPath = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    // 設置出口
    const exit = { x: width - 2, y: height - 2 };
    newMaze[exit.y][exit.x].isWall = false;
    newMaze[exit.y][exit.x].isPath = true;
    setTargetPosition(exit);
    // 在路徑上隨機放置問題
    const pathCells: Position[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (newMaze[y][x].isPath && !(x === 1 && y === 1) && !(x === exit.x && y === exit.y)) {
          pathCells.push({ x, y });
        }
      }
    }
    // 隨機選擇位置放置問題
    const questionPositions = pathCells
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(questions.length, pathCells.length));
    questionPositions.forEach((pos, index) => {
      newMaze[pos.y][pos.x].hasQuestion = true;
      newMaze[pos.y][pos.x].question = questions[index];
    });
    setMaze(newMaze);
  }, [mazeSize, questions]);
  // 初始化遊戲
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);
  // 計時器
  useEffect(() => {
    if (gameStarted && timeLimit > 0 && timeLeft > 0 && !gameCompleted && !showQuestion) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit > 0) {
      handleGameComplete();
    }
  }, [gameStarted, timeLeft, gameCompleted, showQuestion]);
  // 鍵盤控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameCompleted || showQuestion) return;
      let newX = playerPosition.x;
      let newY = playerPosition.y;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY -= 1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY += 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX -= 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX += 1;
          break;
        default:
          return;
      }
      // 檢查是否可以移動
      if (newX >= 0 && newX < mazeSize.width && 
          newY >= 0 && newY < mazeSize.height && 
          !maze[newY]?.[newX]?.isWall) {
        setPlayerPosition({ x: newX, y: newY });
        // 標記為已訪問
        setMaze(prev => {
          const newMaze = [...prev];
          newMaze[newY][newX].isVisited = true;
          return newMaze;
        });
        // 檢查是否有問題
        const cell = maze[newY]?.[newX];
        if (cell?.hasQuestion && cell.question) {
          setCurrentQuestion(cell.question);
          setShowQuestion(true);
        }
        // 檢查是否到達目標
        if (newX === targetPosition.x && newY === targetPosition.y) {
          handleGameComplete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameCompleted, showQuestion, playerPosition, maze, targetPosition, mazeSize]);
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
  };
  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion) return;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      const points = 20;
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate?.(newScore);
        return newScore;
      });
      setQuestionsAnswered(prev => prev + 1);
      setFeedbackMessage(`正確！+${points} 分`);
    } else {
      setFeedbackMessage('錯誤答案！');
    }
    setShowFeedback(true);
    setTimeout(() => {
      setShowQuestion(false);
      setShowFeedback(false);
      setCurrentQuestion(null);
      // 移除該位置的問題
      setMaze(prev => {
        const newMaze = [...prev];
        newMaze[playerPosition.y][playerPosition.x].hasQuestion = false;
        newMaze[playerPosition.y][playerPosition.x].question = undefined;
        return newMaze;
      });
    }, 2000);
  };
  const handleGameComplete = () => {
    setGameCompleted(true);
    const timeUsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    // 完成獎勵
    const completionBonus = 50;
    const timeBonus = timeLimit > 0 ? Math.max(0, Math.floor(timeLeft / 5)) : 0;
    const finalScore = score + completionBonus + timeBonus;
    setScore(finalScore);
    onScoreUpdate?.(finalScore);
    onComplete?.(finalScore, timeUsed);
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">迷宮追逐</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          在迷宮中找到出口，途中回答問題獲得分數。基於空間導航記憶機制，提高您的空間認知能力。
        </p>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">遊戲設置：</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>迷宮大小: {mazeSize.width} × {mazeSize.height}</p>
            <p>問題數量: {questions.length}</p>
            {timeLimit > 0 && <p>時間限制: {timeLimit} 秒</p>}
          </div>
        </div>
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">控制說明：</h3>
          <div className="text-yellow-800 text-sm space-y-1">
            <p>使用方向鍵或 WASD 移動</p>
            <p>🟦 藍色方塊是您的位置</p>
            <p>🟩 綠色方塊是目標出口</p>
            <p>❓ 問號表示有問題的位置</p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
        >
          開始探索
        </button>
      </div>
    );
  }
  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">成功逃脫！</h2>
        <div className="text-center">
          <p className="text-xl mb-2">最終得分: <span className="font-bold text-blue-600">{score}</span></p>
          <p className="text-gray-600">回答問題: {questionsAnswered}/{questions.length}</p>
          {timeLimit > 0 && <p className="text-gray-600">剩餘時間: {timeLeft} 秒</p>}
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
    <div className="max-w-4xl mx-auto p-6">
      {/* 遊戲狀態欄 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">得分: {score}</span>
          <span className="text-sm text-gray-600">
            問題: {questionsAnswered}/{questions.length}
          </span>
          <span className="text-sm text-blue-600">
            位置: ({playerPosition.x}, {playerPosition.y})
          </span>
        </div>
        {timeLimit > 0 && (
          <div className={`text-lg font-semibold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
            時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      {/* 問題對話框 */}
      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.text}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-sm flex items-center justify-center mr-3">
                      {String.fromCharCode(65 + index)}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
            {showFeedback && (
              <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                feedbackMessage.includes('正確') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedbackMessage}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 迷宮 */}
      <div className="mb-6 flex justify-center">
        <div 
          className="grid gap-1 p-4 bg-gray-800 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${mazeSize.width}, 1fr)`,
            maxWidth: '600px'
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-4 h-4 ${
                  cell.isWall 
                    ? 'bg-gray-700' 
                    : x === playerPosition.x && y === playerPosition.y
                      ? 'bg-blue-500'
                      : x === targetPosition.x && y === targetPosition.y
                        ? 'bg-green-500'
                        : cell.hasQuestion
                          ? 'bg-yellow-400'
                          : cell.isVisited
                            ? 'bg-gray-300'
                            : 'bg-white'
                }`}
                title={
                  x === playerPosition.x && y === playerPosition.y ? '玩家位置' :
                  x === targetPosition.x && y === targetPosition.y ? '目標出口' :
                  cell.hasQuestion ? '問題位置' :
                  cell.isWall ? '牆壁' : '通道'
                }
              >
                {cell.hasQuestion && (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    ?
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* 控制說明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">控制方式：</h4>
          <div className="text-blue-800 text-sm space-y-1">
            <p>⬆️ 向上移動: ↑ 或 W</p>
            <p>⬇️ 向下移動: ↓ 或 S</p>
            <p>⬅️ 向左移動: ← 或 A</p>
            <p>➡️ 向右移動: → 或 D</p>
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">圖例說明：</h4>
          <div className="text-green-800 text-sm space-y-1">
            <p>🟦 藍色: 您的當前位置</p>
            <p>🟩 綠色: 目標出口</p>
            <p>🟨 黃色: 有問題的位置</p>
            <p>⬜ 白色: 未探索的通道</p>
            <p>🔲 灰色: 已探索的通道</p>
          </div>
        </div>
      </div>
    </div>
  );
}
