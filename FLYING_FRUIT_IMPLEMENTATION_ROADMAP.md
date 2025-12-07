# Flying Fruit 遊戲 - EduCreate 實現路線圖

## 📋 核心發現

### 遊戲特性
- ✅ **Canvas 渲染**：761×441px 的 Canvas 元素
- ✅ **事件驅動**：基於 MouseEvent 的點擊交互
- ✅ **資源驅動**：XML 配置 + CDN 資源加載
- ✅ **開放式模板**：不計分，純學習工具
- ✅ **主題系統**：10 種預設主題 + 自定義支持

### 技術棧
```
前端：
├─ Canvas 2D 渲染
├─ JavaScript 事件系統
├─ XML 配置解析
└─ 資源預加載系統

後端：
├─ RESTful API（遊戲配置、內容、結果）
├─ 內容管理系統
└─ 資源 CDN

資源：
├─ 主題 XML（配置）
├─ 圖片 CDN（WebP）
├─ 音效 CDN（OGG）
└─ 字體 CDN（WOFF2）
```

---

## 🎯 實現階段

### Phase 1：基礎框架（1-2 周）

#### 1.1 Canvas 初始化
```typescript
class FlyingFruitGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 761;
  private height: number = 441;
  
  constructor(containerId: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.className = 'render-canvas js-render-canvas';
    this.ctx = this.canvas.getContext('2d')!;
    
    document.getElementById(containerId)?.appendChild(this.canvas);
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }
}
```

#### 1.2 事件系統
- 點擊事件處理
- 座標轉換（客戶端座標 → Canvas 座標）
- 碰撞檢測基礎

#### 1.3 遊戲狀態管理
```typescript
interface GameState {
  currentQuestion: number;
  lives: number;
  score: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
}
```

---

### Phase 2：資源系統（2-3 周）

#### 2.1 XML 配置解析
```typescript
interface ThemeConfig {
  scenes: SceneConfig[];
  builders: BuilderConfig[];
  animations: AnimationConfig[];
  audios: AudioConfig[];
  palette: PaletteConfig;
  settings: SettingsConfig;
}

class ThemeLoader {
  async loadTheme(themeId: string): Promise<ThemeConfig> {
    const xmlUrl = `/themexml/${themeId}/1080p/assets-82.xml`;
    const response = await fetch(xmlUrl);
    const xml = await response.text();
    return this.parseXML(xml);
  }
}
```

#### 2.2 資源預加載
```typescript
class ResourcePreloader {
  async preload(theme: ThemeConfig): Promise<void> {
    const imagePromises = theme.images.map(img => 
      this.loadImage(img.url)
    );
    const audioPromises = theme.audios.map(audio => 
      this.loadAudio(audio.url)
    );
    
    await Promise.all([...imagePromises, ...audioPromises]);
  }
}
```

#### 2.3 主題系統
- 主題 XML 解析
- 圖片資源加載
- 音效資源加載
- 字體加載

---

### Phase 3：遊戲邏輯（3-4 周）

#### 3.1 遊戲流程
```typescript
class GameFlow {
  async start() {
    this.playSound('gameintro');
    this.showQuestion(0);
    this.startTimer();
  }
  
  async handleAnswer(answerIndex: number) {
    const isCorrect = this.validateAnswer(answerIndex);
    
    if (isCorrect) {
      this.playSound('correct');
      this.showAnimation('correct');
      this.nextQuestion();
    } else {
      this.playSound('incorrect');
      this.showAnimation('incorrect');
      this.decreaseLives();
      
      if (this.lives === 0) {
        this.endGame();
      }
    }
  }
}
```

#### 3.2 物理引擎
- 水果飛行軌跡
- 碰撞檢測
- 動畫幀更新

#### 3.3 計時系統
- 計時器管理
- 倒計時支持
- 時間到事件

---

### Phase 4：動畫和音效（2-3 周）

#### 4.1 動畫系統
```typescript
class AnimationEngine {
  private animations: Animation[] = [];
  
  addAnimation(animation: Animation) {
    this.animations.push(animation);
  }
  
  update(deltaTime: number) {
    this.animations.forEach(anim => {
      anim.update(deltaTime);
      if (anim.isComplete) {
        this.animations.splice(this.animations.indexOf(anim), 1);
      }
    });
  }
}
```

#### 4.2 音效系統
```typescript
class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  
  async loadSound(name: string, url: string) {
    const audio = new Audio(url);
    this.sounds.set(name, audio);
  }
  
  play(soundName: string) {
    const audio = this.sounds.get(soundName);
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }
}
```

#### 4.3 視覺反饋
- 正確/錯誤動畫
- 生命值顯示
- 進度指示
- 結果屏幕

---

## 📊 實現檢查清單

### Canvas 基礎
- [ ] Canvas 元素創建
- [ ] 2D 上下文初始化
- [ ] 事件監聽設置
- [ ] 座標轉換系統

### 資源系統
- [ ] XML 解析器
- [ ] 圖片預加載
- [ ] 音效預加載
- [ ] 字體加載

### 遊戲邏輯
- [ ] 遊戲狀態管理
- [ ] 問題加載
- [ ] 答案驗證
- [ ] 生命值系統

### 動畫和音效
- [ ] 動畫引擎
- [ ] 音效管理
- [ ] 視覺反饋
- [ ] 計時系統

### 集成
- [ ] API 集成
- [ ] 主題切換
- [ ] 結果保存
- [ ] 錯誤處理

---

## 🔗 與 EduCreate 的集成

### API 端點
```
GET /api/games/flying-fruit/config/{activityId}
GET /api/games/flying-fruit/content/{activityId}
POST /api/games/flying-fruit/results
GET /api/themes/{themeId}/config
```

### 數據結構
```typescript
interface FlyingFruitActivity {
  id: string;
  title: string;
  content: ContentItem[];
  options: GameOptions;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GameOptions {
  lives: number;
  speed: number;
  timer: TimerOption;
  shuffle: boolean;
  retryOnIncorrect: boolean;
  showAnswersAtEnd: boolean;
}
```

---

## ⏱️ 時間估計

| 階段 | 任務 | 時間 |
|------|------|------|
| 1 | Canvas + 事件系統 | 1-2 周 |
| 2 | 資源系統 | 2-3 周 |
| 3 | 遊戲邏輯 | 3-4 周 |
| 4 | 動畫 + 音效 | 2-3 周 |
| 5 | 測試 + 優化 | 1-2 周 |
| **總計** | | **9-14 周** |

---

## 🎯 成功標準

- ✅ Canvas 正確渲染遊戲
- ✅ 點擊交互正常工作
- ✅ 資源正確加載
- ✅ 遊戲邏輯正確
- ✅ 動畫流暢
- ✅ 音效正常播放
- ✅ 與 EduCreate API 集成
- ✅ 支持多個主題
- ✅ 性能優化（60 FPS）
- ✅ 跨瀏覽器兼容

