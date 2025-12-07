# Wordwall 遊戲機制實現指南

## 🎯 核心遊戲機制實現

### 1. 統一評分系統

```typescript
interface GameScore {
  baseScore: number;           // 基礎分數 (100)
  timeBonus: number;           // 時間獎勵
  accuracyBonus: number;       // 正確率獎勵
  speedBonus: number;          // 速度獎勵
  totalScore: number;          // 最終分數
}

function calculateScore(
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  totalTime: number
): GameScore {
  const baseScore = 100;
  
  // 時間獎勵：剩餘時間比例
  const timeBonus = baseScore * ((totalTime - timeSpent) / totalTime);
  
  // 正確率獎勵：正確答案比例
  const accuracyBonus = baseScore * (correctAnswers / totalQuestions);
  
  // 速度獎勵：平均答題速度
  const avgTimePerQuestion = timeSpent / totalQuestions;
  const speedBonus = baseScore * Math.max(0, 1 - (avgTimePerQuestion / 10));
  
  const totalScore = baseScore + timeBonus + accuracyBonus + speedBonus;
  
  return {
    baseScore,
    timeBonus,
    accuracyBonus,
    speedBonus,
    totalScore: Math.round(totalScore)
  };
}
```

### 2. 排行榜系統

```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  timestamp: Date;
}

interface Leaderboard {
  gameId: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  
  // 方法
  addScore(entry: LeaderboardEntry): void;
  getRank(userId: string): number;
  getTopScores(limit: number): LeaderboardEntry[];
  getPlayerStats(userId: string): LeaderboardEntry | null;
}
```

### 3. 遊戲配置系統

```typescript
interface GameConfig {
  // 基本設置
  gameId: string;
  templateId: string;
  contentSetId: string;
  
  // 時間設置
  timeLimit?: number;           // 秒數，null = 無限
  timePerQuestion?: number;     // 每題時間
  
  // 難度設置
  difficulty: 'easy' | 'medium' | 'hard';
  randomOrder: boolean;
  showAnswers: boolean;
  
  // 遊戲設置
  enableLeaderboard: boolean;
  enableMultiplayer: boolean;
  enableSound: boolean;
  enableAnimation: boolean;
  
  // 計分設置
  scoringMode: 'standard' | 'custom';
  customScoring?: {
    correctPoints: number;
    wrongPenalty: number;
    timeBonus: boolean;
  };
}
```

### 4. 遊戲狀態管理

```typescript
interface GameState {
  sessionId: string;
  userId: string;
  config: GameConfig;
  
  // 進度
  currentQuestionIndex: number;
  totalQuestions: number;
  
  // 分數
  score: number;
  correctAnswers: number;
  
  // 時間
  startTime: Date;
  elapsedTime: number;
  
  // 答案記錄
  answers: Answer[];
  
  // 狀態
  status: 'playing' | 'paused' | 'completed';
}

interface Answer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  score: number;
}
```

### 5. 實時反饋系統

```typescript
interface Feedback {
  type: 'correct' | 'incorrect' | 'timeout';
  message: string;
  animation: 'bounce' | 'shake' | 'pulse';
  color: string;
  sound?: string;
  duration: number;  // 毫秒
}

const feedbackConfig = {
  correct: {
    type: 'correct',
    message: '✓ 正確！',
    animation: 'bounce',
    color: '#34C759',
    sound: 'success.mp3',
    duration: 500
  },
  incorrect: {
    type: 'incorrect',
    message: '✗ 錯誤',
    animation: 'shake',
    color: '#FF3B30',
    sound: 'error.mp3',
    duration: 500
  },
  timeout: {
    type: 'timeout',
    message: '⏱ 時間到',
    animation: 'pulse',
    color: '#FF9500',
    sound: 'timeout.mp3',
    duration: 500
  }
};
```

---

## 🔄 遊戲流程實現

### 遊戲初始化
```typescript
async function initializeGame(config: GameConfig): Promise<GameState> {
  const contentSet = await fetchContentSet(config.contentSetId);
  
  let questions = contentSet.items;
  
  // 應用隨機順序
  if (config.randomOrder) {
    questions = shuffleArray(questions);
  }
  
  // 應用難度過濾
  if (config.difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === config.difficulty);
  }
  
  return {
    sessionId: generateId(),
    userId: getCurrentUserId(),
    config,
    currentQuestionIndex: 0,
    totalQuestions: questions.length,
    score: 0,
    correctAnswers: 0,
    startTime: new Date(),
    elapsedTime: 0,
    answers: [],
    status: 'playing'
  };
}
```

### 答案驗證
```typescript
function validateAnswer(
  userAnswer: string,
  correctAnswer: string,
  questionType: string
): boolean {
  switch (questionType) {
    case 'exact':
      return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    case 'partial':
      return userAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
    case 'multiple':
      return userAnswer.split(',').map(a => a.trim()).includes(correctAnswer);
    default:
      return userAnswer === correctAnswer;
  }
}
```

### 進度更新
```typescript
function updateGameProgress(
  state: GameState,
  userAnswer: string,
  timeSpent: number
): GameState {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = validateAnswer(
    userAnswer,
    currentQuestion.correctAnswer,
    currentQuestion.type
  );
  
  const questionScore = isCorrect ? 100 : 0;
  
  const answer: Answer = {
    questionId: currentQuestion.id,
    userAnswer,
    correctAnswer: currentQuestion.correctAnswer,
    isCorrect,
    timeSpent,
    score: questionScore
  };
  
  return {
    ...state,
    answers: [...state.answers, answer],
    score: state.score + questionScore,
    correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
    currentQuestionIndex: state.currentQuestionIndex + 1
  };
}
```

---

## 📊 結果頁面設計

```typescript
interface GameResult {
  sessionId: string;
  userId: string;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  leaderboardRank: number;
  personalBest: number;
  
  // 詳細統計
  stats: {
    averageTimePerQuestion: number;
    fastestAnswer: number;
    slowestAnswer: number;
    mostMissedQuestion: string;
  };
}
```

---

## 🎨 UI 組件結構

```
GameContainer
├── Header
│   ├── GameTitle
│   ├── Timer
│   └── Score
├── GameArea
│   ├── Question
│   ├── AnswerOptions
│   └── Feedback
├── ProgressBar
└── Controls
    ├── PauseButton
    ├── SkipButton
    └── QuitButton

ResultContainer
├── FinalScore
├── Accuracy
├── Leaderboard
├── PersonalStats
└── ShareButton
```

---

## 🚀 實現優先級

### Phase 1（第 1 周）
- [ ] 基礎遊戲流程
- [ ] 評分系統
- [ ] 實時反饋

### Phase 2（第 2 周）
- [ ] 排行榜系統
- [ ] 多人模式
- [ ] 結果頁面

### Phase 3（第 3 周）
- [ ] 遊戲配置
- [ ] 難度調整
- [ ] 分析系統

