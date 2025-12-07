# Flying Fruit 遊戲實現示例

## 🎮 遊戲配置類

```typescript
interface FlyingFruitConfig {
  // 基本設置
  gameId: string;
  templateId: number;  // 82
  contentSetId: string;
  
  // 難度設置
  lives: number;           // 1-5，默認 3
  speed: number;           // 1-5，默認 2
  timeLimit?: number;      // 秒數，null = 無限
  
  // 遊戲規則
  retryAfterIncorrect: boolean;  // 默認 true
  randomOrder: boolean;          // 默認 true
  showAnswers: boolean;          // 默認 true
  
  // 主題設置
  themeId: string;         // 'jungle', 'videogame' 等
  fontStackId: number;     // 字體 ID
}

class FlyingFruitGameConfig {
  private config: FlyingFruitConfig;
  
  constructor(config: Partial<FlyingFruitConfig>) {
    this.config = {
      gameId: config.gameId || '',
      templateId: 82,
      contentSetId: config.contentSetId || '',
      lives: config.lives || 3,
      speed: config.speed || 2,
      timeLimit: config.timeLimit,
      retryAfterIncorrect: config.retryAfterIncorrect !== false,
      randomOrder: config.randomOrder !== false,
      showAnswers: config.showAnswers !== false,
      themeId: config.themeId || 'jungle',
      fontStackId: config.fontStackId || 0
    };
  }
  
  getConfig(): FlyingFruitConfig {
    return this.config;
  }
  
  updateConfig(updates: Partial<FlyingFruitConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
```

---

## 🎯 遊戲狀態管理

```typescript
interface GameState {
  sessionId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  lives: number;
  score: number;
  elapsedTime: number;
  answers: Answer[];
  status: 'playing' | 'paused' | 'completed';
}

interface Answer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

class FlyingFruitGameState {
  private state: GameState;
  
  constructor(sessionId: string, totalQuestions: number, lives: number) {
    this.state = {
      sessionId,
      currentQuestionIndex: 0,
      totalQuestions,
      lives,
      score: 0,
      elapsedTime: 0,
      answers: [],
      status: 'playing'
    };
  }
  
  handleAnswer(answer: Answer): void {
    this.state.answers.push(answer);
    
    if (answer.isCorrect) {
      this.state.score += 100;
    } else {
      this.state.lives--;
    }
    
    this.state.currentQuestionIndex++;
  }
  
  isGameOver(): boolean {
    return this.state.lives === 0 || 
           this.state.currentQuestionIndex >= this.state.totalQuestions;
  }
  
  getState(): GameState {
    return this.state;
  }
}
```

---

## 🎨 主題加載系統

```typescript
interface ThemeResource {
  id: string;
  name: string;
  xmlUrl: string;
  imagesUrl: string;
  soundsUrl: string;
  fontsUrl: string;
}

class ThemeLoader {
  private themes: Map<string, ThemeResource> = new Map();
  
  constructor() {
    this.initializeThemes();
  }
  
  private initializeThemes(): void {
    const themes: ThemeResource[] = [
      {
        id: 'jungle',
        name: 'Jungle',
        xmlUrl: '/themexml/jungle/1080p/assets-82.xml',
        imagesUrl: '/themeimage/1080p/jungle/',
        soundsUrl: '/themesound/jungle/sounds-03-2025/',
        fontsUrl: '/themefont/'
      },
      {
        id: 'videogame',
        name: 'Video Game',
        xmlUrl: '/themexml/videogame/1080p/assets-82.xml',
        imagesUrl: '/themeimage/1080p/videogame/',
        soundsUrl: '/themesound/videogame/sounds-03-2025/',
        fontsUrl: '/themefont/'
      },
      // ... 其他主題
    ];
    
    themes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }
  
  async loadTheme(themeId: string): Promise<ThemeResource> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    
    // 加載主題資源
    await Promise.all([
      this.loadXML(theme.xmlUrl),
      this.preloadImages(theme.imagesUrl),
      this.preloadSounds(theme.soundsUrl),
      this.loadFonts(theme.fontsUrl)
    ]);
    
    return theme;
  }
  
  private async loadXML(url: string): Promise<void> {
    const response = await fetch(url);
    const xml = await response.text();
    // 解析 XML 配置
  }
  
  private async preloadImages(baseUrl: string): Promise<void> {
    // 預加載圖片
  }
  
  private async preloadSounds(baseUrl: string): Promise<void> {
    // 預加載音效
  }
  
  private async loadFonts(baseUrl: string): Promise<void> {
    // 加載字體
  }
}
```

---

## 📊 遊戲結果計算

```typescript
interface GameResult {
  sessionId: string;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  leaderboardRank: number;
}

class GameResultCalculator {
  calculateResult(state: GameState): GameResult {
    const correctAnswers = state.answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / state.totalQuestions) * 100;
    
    return {
      sessionId: state.sessionId,
      totalScore: state.score,
      correctAnswers,
      totalQuestions: state.totalQuestions,
      accuracy,
      timeSpent: state.elapsedTime,
      leaderboardRank: 0  // 待計算
    };
  }
}
```

---

## 🔄 API 集成

```typescript
class FlyingFruitAPI {
  private baseUrl = 'https://wordwall.net';
  
  async getGameOptions(
    templateId: number,
    activityId: number
  ): Promise<FlyingFruitConfig> {
    const response = await fetch(
      `${this.baseUrl}/resourceajax/getoptions?templateId=${templateId}&activityId=${activityId}`
    );
    return response.json();
  }
  
  async getContentData(activityGuid: string): Promise<any> {
    const response = await fetch(
      `https://user.cdn.wordwall.net/documents/${activityGuid}`
    );
    return response.json();
  }
  
  async submitGameResult(result: GameResult): Promise<void> {
    await fetch(`${this.baseUrl}/myresultsajax/submitresult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  }
  
  async getLeaderboard(
    activityId: number,
    templateId: number
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/leaderboardajax/getoption?activityId=${activityId}&templateId=${templateId}`
    );
    return response.json();
  }
}
```

---

## 🎮 遊戲主類

```typescript
class FlyingFruitGame {
  private config: FlyingFruitGameConfig;
  private state: FlyingFruitGameState;
  private themeLoader: ThemeLoader;
  private api: FlyingFruitAPI;
  
  constructor(config: Partial<FlyingFruitConfig>) {
    this.config = new FlyingFruitGameConfig(config);
    this.themeLoader = new ThemeLoader();
    this.api = new FlyingFruitAPI();
  }
  
  async initialize(): Promise<void> {
    // 加載主題
    const theme = await this.themeLoader.loadTheme(
      this.config.getConfig().themeId
    );
    
    // 加載遊戲內容
    const content = await this.api.getContentData(
      this.config.getConfig().contentSetId
    );
    
    // 初始化遊戲狀態
    this.state = new FlyingFruitGameState(
      `session_${Date.now()}`,
      content.questions.length,
      this.config.getConfig().lives
    );
  }
  
  async start(): Promise<void> {
    await this.initialize();
    // 開始遊戲循環
  }
  
  handleAnswer(answer: string): void {
    const currentQuestion = this.getCurrentQuestion();
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    this.state.handleAnswer({
      questionId: currentQuestion.id,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent: 0
    });
    
    if (this.state.isGameOver()) {
      this.endGame();
    }
  }
  
  private async endGame(): Promise<void> {
    const result = new GameResultCalculator().calculateResult(
      this.state.getState()
    );
    await this.api.submitGameResult(result);
  }
  
  private getCurrentQuestion(): any {
    // 返回當前題目
  }
}
```

---

## 🚀 使用示例

```typescript
// 創建遊戲實例
const game = new FlyingFruitGame({
  gameId: 'flying-fruit-1',
  contentSetId: 'c1703cd9b74343ada917863956841b7a',
  lives: 3,
  speed: 2,
  themeId: 'jungle'
});

// 初始化並開始遊戲
await game.start();

// 處理用戶答案
game.handleAnswer('蘋果');
```

