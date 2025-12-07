# Wordwall Flying Fruit 遊戲深度分析

## 🎮 遊戲基本信息

**遊戲名稱：** Flying Fruit（飛行水果）
**遊戲 ID：** 103626299
**模板 ID：** 82（Flying fruit template）
**作者 ID：** 28122419
**活動 GUID：** c1703cd9b74343ada917863956841b7a
**主題：** Jungle（叢林主題）

---

## 📋 遊戲內容結構

### 詞彙項目

**第 1 題：**
- 問題：apple（蘋果）
- 答案選項：
  - a) 蘋果 ✓（正確）
  - b) 橘子
  - c) 葡萄
  - d) 香蕉
  - e) 草莓
  - f) 書

**第 2 題：**
- 問題：球
- 答案選項：
  - a) ball ✓（正確）
  - b) desk

### 內容特點
- ✅ 雙語詞彙（英文 ↔ 中文）
- ✅ 多選項設計（2-6 個選項）
- ✅ 支援圖片（可選）
- ✅ 支援音頻（可選）

---

## ⚙️ 遊戲配置選項

### 計時器設置
- **模式：** Count up（計時上升）
- **時間限制：** 5 分 0 秒
- **選項：** None / Count up / Count down

### 難度設置
- **生命值：** 3（可調整 1-5）
- **速度：** 2（可調整 1-5）
- **重試機制：** ✅ 啟用（錯誤後可重試）

### 遊戲規則
- **隨機順序：** ✅ 啟用（洗牌題目）
- **顯示答案：** ✅ 啟用（遊戲結束後顯示）

---

## 🎨 視覺風格

### 可用主題（10 種）
1. **Jungle**（叢林）- 當前使用
2. **Video Game**（電子遊戲）
3. **Underwater**（水下）
4. **Celebration**（慶祝）
5. **Clouds**（雲朵）
6. **Spooky**（幽靈）
7. **Space**（太空）
8. **Magic Library**（魔法圖書館）
9. **Comics**（漫畫）
10. **Classic**（經典）

### 字體設置
- **默認字體**（Default）

---

## 🔄 遊戲流程

```
遊戲開始
  ↓
加載叢林主題資源
  ├─ 背景圖片
  ├─ 音效
  ├─ 動畫
  └─ 字體
  ↓
初始化遊戲狀態
  ├─ 生命值：3
  ├─ 速度：2
  ├─ 計時器：0:00
  └─ 分數：0
  ↓
顯示第 1 題
  ├─ 問題：apple
  ├─ 答案選項：a-f
  └─ 水果飛行動畫
  ↓
用戶選擇答案
  ├─ 點擊正確答案 → 得分 + 動畫
  └─ 點擊錯誤答案 → 失去生命值
  ↓
檢查生命值
  ├─ 生命值 > 0 → 下一題
  └─ 生命值 = 0 → 遊戲結束
  ↓
顯示結果頁面
  ├─ 最終分數
  ├─ 正確率
  ├─ 排行榜排名
  └─ 分享選項
```

---

## 🎯 遊戲機制

### Flying Fruit 特點
- **動態反應記憶**：水果在屏幕上飛行
- **時間壓力**：需要快速反應
- **生命值系統**：錯誤 3 次遊戲結束
- **速度調整**：可調整難度

### 記憶科學應用
- **主動回憶**：選擇正確答案
- **即時反饋**：正確/錯誤動畫
- **時間壓力**：增加認知負荷
- **多感官**：視覺 + 聽覺 + 動覺

---

## 📊 API 架構

### 關鍵 API 端點

**1. 獲取遊戲選項**
```
GET /resourceajax/getoptions?templateId=82&activityId=103626299&startMode=1
```
返回：計時器、生命值、速度、隨機順序等配置

**2. 獲取內容數據**
```
GET /user.cdn.wordwall.net/documents/{activityGuid}
```
返回：詞彙項目、答案、圖片、音頻 URL

**3. 獲取排行榜選項**
```
GET /leaderboardajax/getoption?activityId=103626299&templateId=82&authorUserId=28122419
```
返回：排行榜配置

**4. 提交遊戲結果**
```
POST /myresultsajax/submitresult
```
提交：分數、正確率、時間、排行榜排名

---

## 🎨 主題資源加載

### Jungle 主題資源
```
主題 XML：
/themexml/jungle/1080p/assets-82.xml

背景圖片：
/themeimage/1080p/jungle/backgroundmainnight.webp

角色動畫：
/themeimage/1080p/jungle/toucanonbranchnight.png
/themeimage/1080p/jungle/frogonleafnight.png
/themeimage/1080p/jungle/butterflyonleafnight.png

水果圖片：
/themeimage/1080p/jungle/2023-03/tiles/speedquizanswer_*.webp

音效：
/themesound/jungle/sounds-03-2025/*.ogg
  - junglegameintro.ogg
  - junglegamemenu.ogg
  - jungleffcorrect1-3.ogg
  - jungleffincorrect1-3.ogg
```

---

## 💾 數據結構

### ServerModel（頁面初始化數據）
```javascript
{
  userId: 28122419,
  isPro: true,
  activityId: 103626299,
  activityTitle: "Untitled62",
  activityGuid: "c1703cd9b74343ada917863956841b7a",
  templateId: 82,
  themeId: 0,
  fontStackId: 0,
  isAuthor: true,
  canManageLeaderboard: true
}
```

### 遊戲配置
```javascript
{
  timer: "count_up",
  timeLimit: 300,  // 5 分鐘
  lives: 3,
  speed: 2,
  retryAfterIncorrect: true,
  randomOrder: true,
  showAnswers: true
}
```

---

## 🚀 對 EduCreate 的啟示

### 1. 主題系統
- ✅ 多主題支援（10+ 種）
- ✅ 主題資源 CDN 加載
- ✅ 動態主題切換

### 2. 遊戲配置
- ✅ 統一配置系統
- ✅ 可調整難度
- ✅ 生命值系統

### 3. 內容管理
- ✅ 雙語詞彙支援
- ✅ 多媒體支援（圖片、音頻）
- ✅ 靈活的答案選項

### 4. 用戶體驗
- ✅ 實時反饋
- ✅ 排行榜系統
- ✅ 分享功能

---

## 📈 實現建議

### 短期改進
- [ ] 實現類似的主題系統
- [ ] 添加生命值機制
- [ ] 改進難度調整

### 中期改進
- [ ] 統一遊戲配置 API
- [ ] 實現主題 CDN 加載
- [ ] 改進排行榜系統

### 長期改進
- [ ] AI 自適應難度
- [ ] 個性化主題
- [ ] 社交分享功能

---

## 🔧 技術實現細節

### 前端架構
```
Wordwall Flying Fruit
├── HTML 頁面
│   ├── 遊戲容器
│   ├── 選項面板
│   └── 排行榜
├── JavaScript 遊戲引擎
│   ├── 遊戲狀態管理
│   ├── 物理引擎（水果飛行）
│   ├── 碰撞檢測
│   └── 動畫系統
├── CSS 樣式
│   ├── 主題樣式
│   ├── 響應式設計
│   └── 動畫效果
└── 資源加載
    ├── 主題 XML
    ├── 圖片 CDN
    ├── 音效 CDN
    └── 字體 CDN
```

### 後端架構
```
API 服務
├── 內容管理
│   ├── 獲取詞彙項目
│   ├── 獲取媒體 URL
│   └── 驗證答案
├── 遊戲配置
│   ├── 獲取遊戲選項
│   ├── 保存配置
│   └── 應用配置
├── 排行榜
│   ├── 提交分數
│   ├── 獲取排行榜
│   └── 計算排名
└── 用戶數據
    ├── 保存遊戲結果
    ├── 獲取歷史記錄
    └── 分析學習進度
```

### 主題系統架構
```
主題資源
├── 主題 XML 配置
│   ├── 場景定義
│   ├── 動畫定義
│   ├── 音效定義
│   └── 調色板
├── 圖片資源
│   ├── 背景
│   ├── 角色
│   ├── 水果
│   └── UI 元素
├── 音效資源
│   ├── 背景音樂
│   ├── 正確音效
│   ├─ 錯誤音效
│   └── 環境音效
└── 字體資源
    ├── 標題字體
    ├── 正文字體
    └── 特殊字體
```

---

## 📱 響應式設計

### 設備支援
- **桌面版**（>1024px）：完整功能
- **平板版**（768-1024px）：優化觸摸
- **手機版**（<768px）：簡化界面

### 適配策略
- 流體布局
- 觸摸友好的按鈕
- 自適應字體大小
- 優化的圖片加載

---

## 🎯 對 EduCreate 的具體建議

### 1. 實現 Flying Fruit 類遊戲
```typescript
interface FlyingFruitGame {
  // 遊戲配置
  config: {
    lives: number;           // 生命值
    speed: number;           // 速度
    timeLimit?: number;      // 時間限制
    retryAfterIncorrect: boolean;
    randomOrder: boolean;
    showAnswers: boolean;
  };

  // 遊戲狀態
  state: {
    currentQuestion: number;
    lives: number;
    score: number;
    elapsedTime: number;
    answers: Answer[];
  };

  // 遊戲邏輯
  methods: {
    startGame(): void;
    handleAnswer(answer: string): void;
    updateScore(isCorrect: boolean): void;
    endGame(): void;
  };
}
```

### 2. 實現主題系統
```typescript
interface Theme {
  id: string;
  name: string;
  resources: {
    xmlUrl: string;
    imagesUrl: string;
    soundsUrl: string;
    fontsUrl: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

### 3. 實現生命值系統
```typescript
interface LivesSystem {
  maxLives: number;
  currentLives: number;

  loseLive(): void;
  resetLives(): void;
  isGameOver(): boolean;
}
```

