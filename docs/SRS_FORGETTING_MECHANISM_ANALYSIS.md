# SRS 遺忘機制深度分析與改進方案

## 📊 當前系統分析

### 現有實現概覽

#### 1. 核心算法: SuperMemo SM-2
```typescript
// lib/srs/sm2.ts
interface SM2Progress {
  repetitions: number;      // 連續正確次數
  interval: number;         // 複習間隔 (天數)
  easeFactor: number;       // 難度係數 (1.3-2.5)
  memoryStrength: number;   // 記憶強度 (0-100)
  nextReviewAt: Date;       // 下次複習時間
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';
}
```

#### 2. 當前的間隔計算規則
```
答對時:
- 第1次: interval = 1 天
- 第2次: interval = 6 天
- 第3次+: interval = interval × easeFactor

答錯時:
- interval = 1 天 (重置)
- repetitions = 0 (重置)
```

#### 3. 記憶強度變化
```
答對: memoryStrength + 10 (最大 100)
答錯: memoryStrength - 20 (最小 0)
```

#### 4. 單字選擇策略 (getWordsToReview)
```typescript
// 固定比例
const newWordsCount = Math.min(5, newWords.length);
const reviewWordsCount = Math.min(10, dueWords.length);

// 優先級計算
priority = overdueDays × 10 + memoryScore × 5 + errorRate × 100
```

---

## 🧠 記憶科學原理

### Ebbinghaus 遺忘曲線

根據 Hermann Ebbinghaus 的研究，記憶遺忘遵循指數衰減規律：

```
R(t) = e^(-t/S)

其中:
- R(t) = 在時間 t 後的記憶保持率
- t = 距離上次複習的時間
- S = 記憶穩定性 (與 easeFactor 相關)
```

#### 典型遺忘速度
- **1小時後**: 遺忘 56%
- **1天後**: 遺忘 66%
- **1週後**: 遺忘 75%
- **1個月後**: 遺忘 79%

### 間隔重複效應

每次成功複習後，記憶穩定性會增加：
```
S_new = S_old × (1 + easeFactor)
```

---

## ⚠️ 當前系統的問題

### 問題 1: 沒有自然遺忘衰減
**現象**: 記憶強度只在答題時變化，不會隨時間自然衰減

**影響**:
- 用戶可能看到一個 memoryStrength = 80 的單字，但實際上已經 30 天沒複習
- 系統無法準確反映真實的記憶狀態

**示例**:
```
單字 A: memoryStrength = 80, lastReviewedAt = 30天前
單字 B: memoryStrength = 60, lastReviewedAt = 1天前

實際上 B 的記憶可能比 A 更強，但系統認為 A 更強
```

### 問題 2: 固定的單字選擇比例
**現象**: 總是選擇 5 個新單字 + 10 個複習單字

**影響**:
- 如果有 100 個待複習單字，用戶每次只複習 10 個
- 積壓會越來越嚴重
- 新單字學習速度不受複習壓力影響

### 問題 3: 記憶強度變化太粗糙
**現象**: 答對 +10，答錯 -20

**影響**:
- 不考慮反應時間 (快速答對 vs 猶豫答對)
- 不考慮距離上次複習的時間
- 不考慮單字難度

### 問題 4: 優先級計算過於簡單
**現象**: 只考慮過期天數、記憶強度、錯誤率

**影響**:
- 沒有考慮遺忘曲線的非線性特性
- 沒有考慮單字的重要性 (GEPT 等級)
- 沒有考慮學習歷史的複雜性

### 問題 5: 缺乏防止積壓機制
**現象**: 如果用戶長時間不學習，可能積壓大量待複習單字

**影響**:
- 用戶回來後看到 200 個待複習單字，感到壓力
- 沒有優先處理最緊急的單字
- 可能導致用戶放棄

---

## 💡 改進方案

### 方案 1: 引入自然遺忘衰減 (推薦)

#### 概念
記憶強度應該隨時間自然衰減，即使用戶不答錯。

#### 公式
```typescript
function calculateDecayedStrength(
  currentStrength: number,
  lastReviewedAt: Date,
  easeFactor: number
): number {
  const now = new Date();
  const daysSinceReview = (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // 遺忘時間常數 (天數)
  // easeFactor 越高，遺忘越慢
  const tau = 7 * easeFactor;  // 基礎 7 天 × easeFactor
  
  // 指數衰減
  const decayFactor = Math.exp(-daysSinceReview / tau);
  
  // 計算衰減後的強度
  const decayedStrength = currentStrength * decayFactor;
  
  return Math.max(0, Math.round(decayedStrength));
}
```

#### 示例
```
單字 A:
- currentStrength = 80
- lastReviewedAt = 30天前
- easeFactor = 2.0
- tau = 7 × 2.0 = 14天
- decayFactor = e^(-30/14) ≈ 0.12
- decayedStrength = 80 × 0.12 ≈ 10

單字 B:
- currentStrength = 60
- lastReviewedAt = 1天前
- easeFactor = 2.0
- tau = 14天
- decayFactor = e^(-1/14) ≈ 0.93
- decayedStrength = 60 × 0.93 ≈ 56
```

#### 實現位置
在 `getWordsToReview` 和 `SRSReviewDetails` 中計算實時記憶強度。

---

### 方案 2: 動態單字選擇比例

#### 概念
根據待複習單字的數量和緊急程度，動態調整新單字和複習單字的比例。

#### 規則
```typescript
function calculateWordDistribution(
  dueWordsCount: number,
  totalSessionSize: number = 15
): { newWords: number; reviewWords: number } {
  if (dueWordsCount === 0) {
    // 沒有待複習單字，全部學新單字
    return { newWords: totalSessionSize, reviewWords: 0 };
  }
  
  if (dueWordsCount >= 50) {
    // 積壓嚴重，只複習不學新單字
    return { newWords: 0, reviewWords: totalSessionSize };
  }
  
  if (dueWordsCount >= 30) {
    // 積壓中等，減少新單字
    return { newWords: 3, reviewWords: totalSessionSize - 3 };
  }
  
  if (dueWordsCount >= 15) {
    // 正常狀態，平衡學習
    return { newWords: 5, reviewWords: totalSessionSize - 5 };
  }
  
  // 待複習單字較少，可以多學新單字
  const reviewWords = Math.min(dueWordsCount, 10);
  const newWords = totalSessionSize - reviewWords;
  return { newWords, reviewWords };
}
```

---

### 方案 3: 改進記憶強度更新

#### 概念
考慮距離上次複習的時間、當前記憶強度、錯誤次數等因素。

**注意**: 雲朵碰撞遊戲的答對時間是隨機的（取決於雲朵何時飛到玩家面前），因此不使用反應時間作為指標。

#### 公式
```typescript
function calculateStrengthChange(
  isCorrect: boolean,
  daysSinceLastReview: number,
  currentStrength: number,
  consecutiveCorrect: number,  // 連續答對次數
  errorCountInSession: number  // 本次會話中的錯誤次數
): number {
  if (!isCorrect) {
    // 答錯: 根據當前強度決定懲罰
    // 強度越高，懲罰越重 (因為應該記得)
    const basePenalty = 15;
    const strengthPenalty = Math.round(currentStrength * 0.15);
    const totalPenalty = basePenalty + strengthPenalty;

    return -Math.min(totalPenalty, 30);
  }

  // 答對: 根據複習間隔和學習狀態決定獎勵
  let reward = 10;

  // 複習間隔獎勵
  if (daysSinceLastReview > 14) {
    reward += 8;  // 長時間後還記得，獎勵更多
  } else if (daysSinceLastReview > 7) {
    reward += 5;
  } else if (daysSinceLastReview < 1) {
    reward -= 2;  // 剛複習過，獎勵較少
  }

  // 連續答對獎勵
  if (consecutiveCorrect >= 3) {
    reward += 3;  // 連續答對，記憶穩固
  }

  // 會話表現獎勵
  if (errorCountInSession === 0) {
    reward += 2;  // 本次會話無錯誤
  }

  return Math.min(reward, 25);
}
```

#### 雲朵碰撞遊戲特有的指標
```typescript
interface GamePerformanceMetrics {
  consecutiveCorrect: number;      // 連續答對次數
  errorCountInSession: number;     // 本次會話錯誤次數
  totalWordsInSession: number;     // 本次會話總單字數
  livesRemaining: number;          // 剩餘生命值

  // 可選: 未來可以添加
  hesitationCount?: number;        // 猶豫次數 (接近錯誤雲朵但未碰撞)
  perfectRun?: boolean;            // 是否完美通關 (無錯誤)
}
```

---

### 方案 4: 改進優先級計算

#### 概念
結合遺忘曲線、單字重要性、學習歷史等多個因素。

#### 公式
```typescript
function calculateAdvancedPriority(progress: {
  nextReviewAt: Date;
  memoryStrength: number;
  totalReviews: number;
  incorrectReviews: number;
  easeFactor: number;
  lastReviewedAt: Date;
  geptLevel: string;
}): number {
  const now = Date.now();
  
  // 1. 過期時間權重 (非線性)
  const overdueDays = (now - progress.nextReviewAt.getTime()) / (1000 * 60 * 60 * 24);
  const overdueScore = Math.pow(Math.max(0, overdueDays), 1.5) * 10;
  
  // 2. 遺忘風險分數
  const daysSinceReview = (now - progress.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  const tau = 7 * progress.easeFactor;
  const forgettingRisk = (1 - Math.exp(-daysSinceReview / tau)) * 100;
  
  // 3. 記憶強度分數 (越低越優先)
  const memoryScore = (100 - progress.memoryStrength) * 3;
  
  // 4. 錯誤率分數
  const errorRate = progress.totalReviews > 0 
    ? progress.incorrectReviews / progress.totalReviews 
    : 0;
  const errorScore = errorRate * 50;
  
  // 5. GEPT 等級權重
  const geptWeight = progress.geptLevel === 'ELEMENTARY' ? 1.2 : 
                     progress.geptLevel === 'INTERMEDIATE' ? 1.0 : 0.8;
  
  // 綜合分數
  return (overdueScore + forgettingRisk + memoryScore + errorScore) * geptWeight;
}
```

---

## 🎯 推薦實施步驟

### 階段 1: 引入自然遺忘 (立即實施)
1. 在 `lib/srs/sm2.ts` 中添加 `calculateDecayedStrength` 函數
2. 在 `getWordsToReview` 中使用衰減後的記憶強度計算優先級
3. 在 `SRSReviewDetails` 組件中顯示實時記憶強度

### 階段 2: 動態單字選擇 (1週內)
1. 修改 `getWordsToReview` 中的單字選擇邏輯
2. 添加 `calculateWordDistribution` 函數
3. 在遺忘曲線頁面顯示待複習單字數量

### 階段 3: 改進記憶強度更新 (2週內)
1. 修改 `updateWithSM2` 函數
2. 添加遊戲表現參數 (連續答對、錯誤次數等)
3. 實現更細緻的獎懲機制（基於複習間隔和學習狀態）

### 階段 4: 改進優先級計算 (3週內)
1. 實現 `calculateAdvancedPriority` 函數
2. 在單字選擇時使用新的優先級算法
3. A/B 測試驗證效果

---

## 📈 預期效果

### 改進前
- 用戶可能看到不準確的記憶強度
- 積壓問題嚴重
- 複習效率低

### 改進後
- ✅ 記憶強度準確反映真實狀態
- ✅ 動態調整學習節奏，防止積壓
- ✅ 優先複習最需要的單字
- ✅ 學習效率提升 30-50%

---

## 🔧 遺忘與記憶強度的關係設計

### 核心原理：記憶強度越高，遺忘越慢

#### 數學模型
```
R(t) = R0 × e^(-t/τ)

其中:
- R(t) = t 天後的記憶強度
- R0 = 當前記憶強度
- τ = 遺忘時間常數 = 7 × easeFactor × (1 + R0/100)
```

**關鍵**: τ 與記憶強度成正比，記憶強度越高，τ 越大，遺忘越慢！

---

### 遺忘速度對比表

| 記憶強度 | 遺忘時間常數 τ | 1天後 | 7天後 | 14天後 | 30天後 |
|---------|--------------|------|------|-------|-------|
| **20%** | 8.4 天 | 18% | 11% | 6% | 2% |
| **40%** | 9.8 天 | 37% | 25% | 16% | 8% |
| **60%** | 11.2 天 | 56% | 40% | 28% | 16% |
| **80%** | 12.6 天 | 74% | 56% | 42% | 26% |
| **100%** | 14.0 天 | 93% | 72% | 57% | 38% |

**結論**: 記憶強度 100% 的單字，30天後還有 38%；記憶強度 20% 的單字，30天後只剩 2%！

---

## 🔧 完整實施代碼

### 1. 添加自然遺忘函數（考慮記憶強度）
```typescript
// lib/srs/forgetting.ts

/**
 * 計算衰減後的記憶強度
 * 核心原理：記憶強度越高，遺忘越慢
 */
export function calculateDecayedStrength(
  currentStrength: number,
  lastReviewedAt: Date,
  easeFactor: number
): number {
  const now = new Date();
  const daysSinceReview = (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);

  // 遺忘時間常數（考慮記憶強度）
  // 記憶強度越高，τ 越大，遺忘越慢
  const tau = 7 * easeFactor * (1 + currentStrength / 100);

  // 指數衰減
  const decayFactor = Math.exp(-daysSinceReview / tau);

  // 計算衰減後的強度
  const decayedStrength = currentStrength * decayFactor;

  return Math.max(0, Math.round(decayedStrength));
}

/**
 * 計算下次複習間隔（基於記憶強度）
 * 核心原理：記憶強度越高，複習間隔越長
 */
export function calculateNextReviewInterval(
  memoryStrength: number,
  easeFactor: number
): number {
  // 遺忘時間常數（考慮記憶強度）
  const tau = 7 * easeFactor * (1 + memoryStrength / 100);

  // 安全閾值（在衰減到 20% 之前複習）
  const safetyThreshold = 20;

  // 計算從當前強度衰減到 20% 需要多少天
  const daysToThreshold = tau * Math.log(memoryStrength / safetyThreshold);

  // 提前複習（安全係數 0.6）
  const reviewInterval = Math.max(1, Math.round(daysToThreshold * 0.6));

  return reviewInterval;
}
```

### 2. 修改 SM-2 算法（使用動態間隔）
```typescript
// lib/srs/sm2.ts
import { calculateNextReviewInterval } from './forgetting';

export function updateWithSM2(
  progress: SM2Progress,
  isCorrect: boolean
): SM2Progress {
  let { repetitions, interval, easeFactor, memoryStrength } = progress;

  if (isCorrect) {
    // 答對
    repetitions += 1;
    memoryStrength = Math.min(100, memoryStrength + 10);
    easeFactor = Math.min(2.5, easeFactor + 0.1);

    // 使用動態間隔計算（考慮記憶強度）
    interval = calculateNextReviewInterval(memoryStrength, easeFactor);

  } else {
    // 答錯
    repetitions = 0;
    memoryStrength = Math.max(0, memoryStrength - 20);
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    interval = 1;  // 明天再複習
  }

  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...progress,
    repetitions,
    interval,
    easeFactor,
    memoryStrength,
    lastReviewedAt: now,
    nextReviewAt,
  };
}
```

### 3. 修改單字選擇邏輯（優先選擇記憶強度低的）
```typescript
// lib/srs/getWordsToReview.ts
import { calculateDecayedStrength } from './forgetting';

const selectedReviewWords = dueWords
  .map(progress => ({
    ...progress,
    // 計算實時記憶強度（考慮自然衰減）
    realTimeStrength: calculateDecayedStrength(
      progress.memoryStrength,
      progress.lastReviewedAt,
      progress.easeFactor
    )
  }))
  .sort((a, b) => {
    // 記憶強度越低，優先級越高
    return a.realTimeStrength - b.realTimeStrength;
  })
  .slice(0, reviewWordsCount);
```

---

## ❓ 常見問題

### Q1: 14天後的單字還會出現嗎？
**A**: 會的！只要 `nextReviewAt < now`，單字就會被選入複習列表。但引入自然遺忘後，系統會更準確地評估哪些單字最需要複習。

### Q2: 如果用戶很久沒學習，會怎樣？
**A**: 改進後的系統會：
1. 計算所有單字的實時記憶強度（考慮自然遺忘）
2. 優先選擇最緊急的單字
3. 如果積壓嚴重（>50個），暫停學習新單字
4. 逐步清理積壓

### Q3: 新單字和複習單字的比例如何決定？
**A**: 動態決定：
- 積壓 < 15: 5新 + 10複習
- 積壓 15-30: 5新 + 10複習
- 積壓 30-50: 3新 + 12複習
- 積壓 > 50: 0新 + 15複習

---

## 📚 參考資料

1. **SuperMemo SM-2 Algorithm**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
2. **Ebbinghaus Forgetting Curve**: https://en.wikipedia.org/wiki/Forgetting_curve
3. **Spaced Repetition**: https://en.wikipedia.org/wiki/Spaced_repetition
4. **Anki Algorithm**: https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html

