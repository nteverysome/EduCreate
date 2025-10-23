# 🧮 SuperMemo SM-2 算法實現詳解

## 📋 目錄
1. [算法概述](#算法概述)
2. [核心參數](#核心參數)
3. [算法公式](#算法公式)
4. [實現代碼](#實現代碼)
5. [實際例子](#實際例子)
6. [優化建議](#優化建議)

---

## 算法概述

### 什麼是 SM-2?
SuperMemo SM-2 是由波蘭科學家 Piotr Woźniak 在 1987 年發明的間隔重複算法。

### 核心思想
在記憶即將遺忘前安排複習,最大化記憶保持率。

### 遺忘曲線
```
記憶強度
100% │ ●
     │  ╲
     │   ╲
 80% │    ●────────●
     │     ╲        ╲
     │      ╲        ╲
 60% │       ●────────●
     │        ╲        ╲
     │         ╲        ╲
 40% │          ●────────●
     │           ╲        ╲
     │            ╲        ╲
 20% │             ●────────●
     │              ╲        ╲
  0% └───────────────────────────→ 時間
     學習  1天  6天  15天  30天  60天
           ↑    ↑    ↑     ↑     ↑
         複習1 複習2 複習3  複習4  複習5
```

---

## 核心參數

### 1. Ease Factor (EF) - 難度係數

#### 定義
表示單字的記憶難度。

#### 範圍
- 最小值: 1.3
- 最大值: 2.5
- 預設值: 2.5

#### 意義
- EF 越高 = 越容易記住 = 複習間隔拉長越快
- EF 越低 = 越難記住 = 複習間隔拉長越慢

#### 更新規則
```
答對: EF = EF + 0.1 (最大 2.5)
答錯: EF = EF - 0.2 (最小 1.3)
```

#### 例子
```
容易的單字 (cat, dog):
- 初始 EF = 2.5
- 答對 5 次後 EF = 2.5 (已達上限)
- 複習間隔: 1 → 6 → 15 → 37 → 92 天

困難的單字 (phenomenon):
- 初始 EF = 2.5
- 答錯 3 次後 EF = 1.9
- 答對 5 次後 EF = 2.4
- 複習間隔: 1 → 6 → 14 → 33 → 79 天
```

---

### 2. Interval (I) - 複習間隔

#### 定義
距離上次複習的天數。

#### 範圍
- 最小值: 1 天
- 最大值: 無限制 (實際上通常不超過 1 年)

#### 計算規則
```
第 1 次答對: I = 1 天
第 2 次答對: I = 6 天
第 3+ 次答對: I = I × EF
答錯: I = 1 天 (重置)
```

#### 例子
```
EF = 2.5 的單字:
- 第 1 次答對: I = 1 天
- 第 2 次答對: I = 6 天
- 第 3 次答對: I = 6 × 2.5 = 15 天
- 第 4 次答對: I = 15 × 2.5 = 37.5 ≈ 38 天
- 第 5 次答對: I = 38 × 2.5 = 95 天

EF = 1.5 的單字:
- 第 1 次答對: I = 1 天
- 第 2 次答對: I = 6 天
- 第 3 次答對: I = 6 × 1.5 = 9 天
- 第 4 次答對: I = 9 × 1.5 = 13.5 ≈ 14 天
- 第 5 次答對: I = 14 × 1.5 = 21 天
```

---

### 3. Repetitions (n) - 連續正確次數

#### 定義
連續答對的次數。

#### 範圍
- 最小值: 0
- 最大值: 無限制

#### 更新規則
```
答對: n = n + 1
答錯: n = 0 (重置)
```

#### 意義
- n = 0: 剛學習或答錯
- n = 1-2: 短期記憶
- n = 3-4: 中期記憶
- n ≥ 5: 長期記憶 (可能已掌握)

---

### 4. Memory Strength (MS) - 記憶強度

#### 定義
表示對單字的記憶程度 (非 SM-2 原始參數,我們新增的)。

#### 範圍
- 最小值: 0 (完全忘記)
- 最大值: 100 (完全記住)
- 預設值: 0

#### 更新規則
```
答對: MS = MS + 10 (最大 100)
答錯: MS = MS - 20 (最小 0)
```

#### 用途
- 用於 UI 顯示
- 用於判斷是否已掌握
- 用於計算複習優先級

---

## 算法公式

### 完整公式

#### 當答對時 (Quality ≥ 3)
```
1. n = n + 1

2. if n = 1:
     I = 1
   else if n = 2:
     I = 6
   else:
     I = I × EF

3. EF = EF + 0.1
   EF = min(EF, 2.5)

4. MS = MS + 10
   MS = min(MS, 100)

5. NextReview = Today + I 天
```

#### 當答錯時 (Quality < 3)
```
1. n = 0

2. I = 1

3. EF = EF - 0.2
   EF = max(EF, 1.3)

4. MS = MS - 20
   MS = max(MS, 0)

5. NextReview = Today + 1 天
```

---

## 實現代碼

### TypeScript 版本

```typescript
// lib/srs/sm2.ts

interface SM2Progress {
  repetitions: number;      // n
  interval: number;         // I
  easeFactor: number;       // EF
  memoryStrength: number;   // MS
  nextReviewAt: Date;
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';
}

/**
 * SuperMemo SM-2 算法
 * @param progress 當前進度
 * @param isCorrect 是否答對
 * @returns 更新後的進度
 */
export function updateWithSM2(
  progress: SM2Progress,
  isCorrect: boolean
): SM2Progress {
  let {
    repetitions,
    interval,
    easeFactor,
    memoryStrength
  } = progress;
  
  if (isCorrect) {
    // ===== 答對 =====
    
    // 1. 增加連續正確次數
    repetitions += 1;
    
    // 2. 計算新的複習間隔
    if (repetitions === 1) {
      interval = 1;  // 1 天後複習
    } else if (repetitions === 2) {
      interval = 6;  // 6 天後複習
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    // 3. 增加難度係數 (最大 2.5)
    easeFactor = Math.min(2.5, easeFactor + 0.1);
    
    // 4. 增加記憶強度 (最大 100)
    memoryStrength = Math.min(100, memoryStrength + 10);
    
  } else {
    // ===== 答錯 =====
    
    // 1. 重置連續正確次數
    repetitions = 0;
    
    // 2. 重置複習間隔
    interval = 1;  // 明天再複習
    
    // 3. 降低難度係數 (最小 1.3)
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    
    // 4. 降低記憶強度 (最小 0)
    memoryStrength = Math.max(0, memoryStrength - 20);
  }
  
  // 5. 計算下次複習時間
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  
  // 6. 更新學習狀態
  let status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';
  if (repetitions === 0) {
    status = 'LEARNING';
  } else if (memoryStrength >= 80 && repetitions >= 5) {
    status = 'MASTERED';
  } else {
    status = 'REVIEWING';
  }
  
  return {
    repetitions,
    interval,
    easeFactor,
    memoryStrength,
    nextReviewAt,
    status
  };
}

/**
 * 根據答題結果計算質量分數
 * @param isCorrect 是否答對
 * @param responseTime 反應時間 (毫秒)
 * @returns 質量分數 (0-5)
 */
export function calculateQuality(
  isCorrect: boolean,
  responseTime: number
): number {
  if (!isCorrect) {
    return 0;  // 完全忘記
  }
  
  // 根據反應時間計算質量
  if (responseTime < 2000) {
    return 5;  // 完美記住 (< 2 秒)
  } else if (responseTime < 4000) {
    return 4;  // 正確但有點猶豫 (2-4 秒)
  } else {
    return 3;  // 正確但很困難 (> 4 秒)
  }
}
```

---

### JavaScript 版本 (Phaser 3)

```javascript
// public/games/shimozurdo-game/utils/sm2.js

class SM2 {
  /**
   * 更新學習進度
   * @param {Object} progress - 當前進度
   * @param {boolean} isCorrect - 是否答對
   * @returns {Object} 更新後的進度
   */
  static update(progress, isCorrect) {
    let { repetitions, interval, easeFactor, memoryStrength } = progress;
    
    if (isCorrect) {
      // 答對
      repetitions += 1;
      
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      
      easeFactor = Math.min(2.5, easeFactor + 0.1);
      memoryStrength = Math.min(100, memoryStrength + 10);
      
    } else {
      // 答錯
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      memoryStrength = Math.max(0, memoryStrength - 20);
    }
    
    // 計算下次複習時間
    const nextReviewAt = new Date();
    nextReviewAt.setTime(nextReviewAt.getTime() + interval * 24 * 60 * 60 * 1000);
    
    // 更新狀態
    let status;
    if (repetitions === 0) {
      status = 'LEARNING';
    } else if (memoryStrength >= 80 && repetitions >= 5) {
      status = 'MASTERED';
    } else {
      status = 'REVIEWING';
    }
    
    return {
      repetitions,
      interval,
      easeFactor,
      memoryStrength,
      nextReviewAt,
      status
    };
  }
  
  /**
   * 計算質量分數
   * @param {boolean} isCorrect - 是否答對
   * @param {number} responseTime - 反應時間 (毫秒)
   * @returns {number} 質量分數 (0-5)
   */
  static calculateQuality(isCorrect, responseTime) {
    if (!isCorrect) return 0;
    
    if (responseTime < 2000) return 5;
    if (responseTime < 4000) return 4;
    return 3;
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SM2;
}
```

---

## 實際例子

### 例子 1: 容易的單字 "apple"

#### 初始狀態
```
n = 0
I = 0
EF = 2.5
MS = 0
```

#### 第 1 次學習 (Day 0) - 答對 ✅
```
n = 0 + 1 = 1
I = 1 天
EF = 2.5 + 0.1 = 2.5 (已達上限)
MS = 0 + 10 = 10
NextReview = Day 1
```

#### 第 2 次複習 (Day 1) - 答對 ✅
```
n = 1 + 1 = 2
I = 6 天
EF = 2.5 (已達上限)
MS = 10 + 10 = 20
NextReview = Day 7
```

#### 第 3 次複習 (Day 7) - 答對 ✅
```
n = 2 + 1 = 3
I = 6 × 2.5 = 15 天
EF = 2.5 (已達上限)
MS = 20 + 10 = 30
NextReview = Day 22
```

#### 第 4 次複習 (Day 22) - 答對 ✅
```
n = 3 + 1 = 4
I = 15 × 2.5 = 37.5 ≈ 38 天
EF = 2.5 (已達上限)
MS = 30 + 10 = 40
NextReview = Day 60
```

#### 第 5 次複習 (Day 60) - 答對 ✅
```
n = 4 + 1 = 5
I = 38 × 2.5 = 95 天
EF = 2.5 (已達上限)
MS = 40 + 10 = 50
NextReview = Day 155
Status = REVIEWING
```

#### 第 10 次複習 - 答對 ✅
```
n = 9 + 1 = 10
I = 很長 (幾個月)
EF = 2.5
MS = 90 + 10 = 100
Status = MASTERED 🎉
```

---

### 例子 2: 困難的單字 "phenomenon"

#### 初始狀態
```
n = 0
I = 0
EF = 2.5
MS = 0
```

#### 第 1 次學習 (Day 0) - 答錯 ❌
```
n = 0
I = 1 天
EF = 2.5 - 0.2 = 2.3
MS = 0 - 20 = 0 (已達下限)
NextReview = Day 1
```

#### 第 2 次複習 (Day 1) - 答錯 ❌
```
n = 0
I = 1 天
EF = 2.3 - 0.2 = 2.1
MS = 0 (已達下限)
NextReview = Day 2
```

#### 第 3 次複習 (Day 2) - 答對 ✅
```
n = 0 + 1 = 1
I = 1 天
EF = 2.1 + 0.1 = 2.2
MS = 0 + 10 = 10
NextReview = Day 3
```

#### 第 4 次複習 (Day 3) - 答對 ✅
```
n = 1 + 1 = 2
I = 6 天
EF = 2.2 + 0.1 = 2.3
MS = 10 + 10 = 20
NextReview = Day 9
```

#### 第 5 次複習 (Day 9) - 答對 ✅
```
n = 2 + 1 = 3
I = 6 × 2.3 = 13.8 ≈ 14 天
EF = 2.3 + 0.1 = 2.4
MS = 20 + 10 = 30
NextReview = Day 23
```

---

## 優化建議

### 1. 動態調整參數

#### 問題
不同用戶的記憶能力不同,固定參數可能不適合所有人。

#### 解決方案
根據用戶的整體表現動態調整參數。

```typescript
function adjustParameters(userStats: UserStats) {
  const overallAccuracy = userStats.correctReviews / userStats.totalReviews;
  
  if (overallAccuracy > 0.9) {
    // 用戶記憶力很好,可以拉長間隔
    return {
      initialEF: 2.7,
      intervalMultiplier: 1.2
    };
  } else if (overallAccuracy < 0.7) {
    // 用戶記憶力較弱,縮短間隔
    return {
      initialEF: 2.3,
      intervalMultiplier: 0.8
    };
  } else {
    // 標準參數
    return {
      initialEF: 2.5,
      intervalMultiplier: 1.0
    };
  }
}
```

---

### 2. 考慮遺忘曲線

#### 問題
SM-2 假設遺忘曲線是固定的,但實際上每個人的遺忘速度不同。

#### 解決方案
追蹤用戶的實際遺忘曲線,動態調整複習時間。

```typescript
function calculateOptimalInterval(
  progress: SM2Progress,
  userForgettingCurve: ForgettingCurve
): number {
  const baseInterval = progress.interval;
  const forgettingRate = userForgettingCurve.getRateForWord(progress.wordId);
  
  // 根據遺忘速度調整間隔
  return Math.round(baseInterval * (1 / forgettingRate));
}
```

---

### 3. 批量複習優化

#### 問題
如果有很多單字需要複習,用戶可能會感到壓力。

#### 解決方案
限制每天的複習數量,優先複習最重要的單字。

```typescript
function selectWordsForToday(
  dueWords: UserWordProgress[],
  maxWords: number = 20
): UserWordProgress[] {
  // 按優先級排序
  const sorted = dueWords.sort((a, b) => {
    const priorityA = calculatePriority(a);
    const priorityB = calculatePriority(b);
    return priorityB - priorityA;
  });
  
  // 只選擇前 N 個
  return sorted.slice(0, maxWords);
}
```

---

## 參考資源

### 官方文檔
- [SuperMemo 官網](https://www.supermemo.com/)
- [SM-2 算法原文](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

### 學術論文
- Woźniak, P. A. (1990). "Optimization of learning"
- Ebbinghaus, H. (1885). "Memory: A Contribution to Experimental Psychology"

### 開源實現
- [Anki](https://github.com/ankitects/anki)
- [Anki Algorithm](https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html)

