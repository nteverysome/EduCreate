# SRS 遺忘機制實施計劃

## 🎯 核心目標

實現基於記憶科學的 SRS 系統，核心原則：
- **記憶強度越高，遺忘越慢**
- **統一智能出單字，零思考負擔**
- **優先複習最需要的單字**

---

## 📐 兩個核心邏輯的交匯點

### 邏輯 1: 遺忘與記憶強度的關係

#### 數學模型
```
R(t) = R0 × e^(-t/τ)

其中:
- R(t) = t 天後的記憶強度
- R0 = 當前記憶強度
- τ = 遺忘時間常數 = 7 × easeFactor × (1 + R0/100)
```

#### 關鍵設計
**τ 與記憶強度成正比** → 記憶強度越高，遺忘越慢

| 記憶強度 | 遺忘時間常數 τ | 30天後剩餘 |
|---------|--------------|-----------|
| 20% | 8.4 天 | 2% |
| 40% | 9.8 天 | 8% |
| 60% | 11.2 天 | 16% |
| 80% | 12.6 天 | 26% |
| 100% | 14.0 天 | 38% |

---

### 邏輯 2: 統一智能出單字

#### 核心策略
1. **計算實時記憶強度**（考慮自然衰減）
2. **按記憶強度排序**（從低到高）
3. **優先選擇記憶強度最低的單字**
4. **自動平衡新單字和複習單字**

#### 選擇邏輯
```typescript
// 1. 計算所有單字的實時記憶強度
const wordsWithRealTimeStrength = allWords.map(word => ({
  ...word,
  realTimeStrength: calculateDecayedStrength(
    word.memoryStrength,
    word.lastReviewedAt,
    word.easeFactor
  )
}));

// 2. 按記憶強度排序（從低到高）
const sortedWords = wordsWithRealTimeStrength
  .sort((a, b) => a.realTimeStrength - b.realTimeStrength);

// 3. 選擇記憶強度最低的 10 個 + 5 個新單字
const reviewWords = sortedWords.slice(0, 10);
const newWords = allWords.filter(w => w.status === 'NEW').slice(0, 5);
const selectedWords = [...reviewWords, ...newWords];
```

---

## 🔗 交匯點：實時記憶強度

### 關鍵連接
**邏輯 1** 提供 `calculateDecayedStrength` 函數
↓
**邏輯 2** 使用這個函數計算實時記憶強度
↓
**結果**: 優先複習記憶強度最低（最需要複習）的單字

### 完整流程圖
```
用戶點擊「開始學習」
    ↓
獲取所有單字（NEW + LEARNING + REVIEWING）
    ↓
對每個單字計算實時記憶強度
    ├─ 使用邏輯 1 的公式: R(t) = R0 × e^(-t/τ)
    ├─ τ = 7 × easeFactor × (1 + R0/100)
    └─ 考慮時間衰減
    ↓
按實時記憶強度排序（從低到高）
    ↓
選擇單字
    ├─ 記憶強度最低的 10 個（複習）
    └─ 5 個新單字（學習）
    ↓
返回 15 個單字給用戶
```

---

## 🔧 完整實施代碼

### 1. 創建遺忘機制模組
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

### 2. 修改 SM-2 算法
```typescript
// lib/srs/sm2.ts
import { calculateNextReviewInterval } from './forgetting';

export interface SM2Progress {
  memoryStrength: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastReviewedAt: Date;
  nextReviewAt: Date;
}

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

### 3. 修改單字選擇邏輯
```typescript
// lib/srs/getWordsToReview.ts
import { calculateDecayedStrength } from './forgetting';
import { prisma } from '@/lib/prisma';

export async function getWordsToReview(
  userId: string,
  geptLevel: string,
  sessionSize: number = 15
): Promise<any[]> {
  // 1. 獲取所有單字（排除已精通的）
  const allWords = await prisma.userWordProgress.findMany({
    where: {
      userId,
      geptLevel,
      status: { not: 'MASTERED' }
    },
    include: {
      vocabularyItem: true
    }
  });
  
  // 2. 計算實時記憶強度（考慮自然衰減）
  const wordsWithRealTimeStrength = allWords.map(word => {
    const realTimeStrength = word.status === 'NEW' 
      ? 0  // 新單字記憶強度為 0
      : calculateDecayedStrength(
          word.memoryStrength,
          word.lastReviewedAt || new Date(),
          word.easeFactor
        );
    
    return {
      ...word,
      realTimeStrength
    };
  });
  
  // 3. 分離新單字和複習單字
  const newWords = wordsWithRealTimeStrength.filter(w => w.status === 'NEW');
  const reviewWords = wordsWithRealTimeStrength.filter(w => w.status !== 'NEW');
  
  // 4. 按實時記憶強度排序（從低到高）
  const sortedReviewWords = reviewWords.sort((a, b) => 
    a.realTimeStrength - b.realTimeStrength
  );
  
  // 5. 選擇單字
  const selectedReviewWords = sortedReviewWords.slice(0, 10);
  const selectedNewWords = newWords
    .sort(() => Math.random() - 0.5)  // 隨機打亂
    .slice(0, sessionSize - selectedReviewWords.length);
  
  // 6. 合併並返回
  return [...selectedReviewWords, ...selectedNewWords];
}
```

---

## 📊 實施效果

### 示例 1: 用戶有 50 個單字
```
單字狀態:
- 單字 A: 記憶強度 100%, 30天前複習 → 實時強度 38%
- 單字 B: 記憶強度 80%, 20天前複習 → 實時強度 45%
- 單字 C: 記憶強度 60%, 10天前複習 → 實時強度 48%
- 單字 D: 記憶強度 40%, 5天前複習 → 實時強度 32%
- 單字 E: 記憶強度 20%, 3天前複習 → 實時強度 15%
- ... (其他 45 個單字)

系統選擇:
1. 單字 E (實時強度 15%) ← 最需要複習
2. 單字 D (實時強度 32%)
3. 單字 A (實時強度 38%)
4. 單字 B (實時強度 45%)
5. 單字 C (實時強度 48%)
... (共 10 個複習單字)
+ 5 個新單字

總共 15 個單字
```

### 關鍵洞察
- ✅ 單字 E 雖然記憶強度只有 20%，但因為最近複習過，實時強度 15%，優先複習
- ✅ 單字 A 雖然記憶強度 100%，但 30 天沒複習，實時強度降到 38%，也需要複習
- ✅ **實時記憶強度** 準確反映真實記憶狀態
- ✅ **優先複習最需要的單字**，防止遺忘

---

## 🎯 實施步驟

### 步驟 1: 創建遺忘機制模組（30 分鐘）
- [ ] 創建 `lib/srs/forgetting.ts`
- [ ] 實現 `calculateDecayedStrength` 函數
- [ ] 實現 `calculateNextReviewInterval` 函數
- [ ] 添加單元測試

### 步驟 2: 修改 SM-2 算法（20 分鐘）
- [ ] 修改 `lib/srs/sm2.ts`
- [ ] 使用 `calculateNextReviewInterval` 計算動態間隔
- [ ] 測試答對/答錯的間隔計算

### 步驟 3: 修改單字選擇邏輯（30 分鐘）
- [ ] 修改 `lib/srs/getWordsToReview.ts`
- [ ] 使用 `calculateDecayedStrength` 計算實時記憶強度
- [ ] 按實時記憶強度排序選擇單字
- [ ] 測試單字選擇邏輯

### 步驟 4: 測試和驗證（20 分鐘）
- [ ] 創建測試腳本
- [ ] 驗證遺忘衰減計算
- [ ] 驗證單字選擇邏輯
- [ ] 驗證動態間隔計算

### 步驟 5: 部署和監控（10 分鐘）
- [ ] 提交代碼
- [ ] 部署到 Vercel
- [ ] 監控用戶學習數據
- [ ] 收集反饋

**總預計時間**: 約 2 小時

---

## 📈 預期效果

### 改進前
- ❌ 記憶強度不隨時間衰減
- ❌ 複習間隔固定（1天 → 6天 → ...）
- ❌ 不考慮實際記憶狀態
- ❌ 可能複習不需要的單字

### 改進後
- ✅ **記憶強度隨時間自然衰減**
- ✅ **複習間隔根據記憶強度動態調整**
- ✅ **優先複習最需要的單字**
- ✅ **提高學習效率，防止遺忘**

---

## 🎯 成功標準

1. ✅ 實時記憶強度計算準確
2. ✅ 單字選擇邏輯優先選擇記憶強度低的
3. ✅ 複習間隔根據記憶強度動態調整
4. ✅ 用戶學習效率提高
5. ✅ 遺忘率降低

