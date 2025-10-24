/**
 * 遺忘機制模組
 * 基於 Ebbinghaus 遺忘曲線和記憶科學原理
 * 核心原則：記憶強度越高，遺忘越慢
 */

/**
 * 計算衰減後的記憶強度
 * 
 * 核心原理：
 * - 記憶強度隨時間自然衰減
 * - 記憶強度越高，遺忘時間常數 τ 越大，遺忘越慢
 * - 使用指數衰減公式：R(t) = R0 × e^(-t/τ)
 * 
 * @param currentStrength 當前記憶強度 (0-100)
 * @param lastReviewedAt 上次複習時間
 * @param easeFactor 難度係數 (1.3-2.5)
 * @returns 衰減後的記憶強度 (0-100)
 * 
 * @example
 * // 記憶強度 80%，10 天前複習，easeFactor = 2.0
 * calculateDecayedStrength(80, new Date('2024-01-01'), 2.0)
 * // → 約 60% (記憶強度高，遺忘慢)
 * 
 * // 記憶強度 40%，10 天前複習，easeFactor = 2.0
 * calculateDecayedStrength(40, new Date('2024-01-01'), 2.0)
 * // → 約 20% (記憶強度低，遺忘快)
 */
export function calculateDecayedStrength(
  currentStrength: number,
  lastReviewedAt: Date,
  easeFactor: number
): number {
  // 如果記憶強度為 0，直接返回 0
  if (currentStrength === 0) {
    return 0;
  }

  const now = new Date();
  const daysSinceReview = (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // 如果剛複習過（小於 1 小時），不衰減
  if (daysSinceReview < 1 / 24) {
    return currentStrength;
  }
  
  // 遺忘時間常數（考慮記憶強度）
  // 記憶強度越高，τ 越大，遺忘越慢
  // τ = 基礎時間常數 × easeFactor × (1 + 記憶強度/100)
  const baseTimeConstant = 7;  // 基礎 7 天
  const tau = baseTimeConstant * easeFactor * (1 + currentStrength / 100);
  
  // 指數衰減公式：R(t) = R0 × e^(-t/τ)
  const decayFactor = Math.exp(-daysSinceReview / tau);
  
  // 計算衰減後的強度
  const decayedStrength = currentStrength * decayFactor;
  
  // 確保在 0-100 範圍內
  return Math.max(0, Math.round(decayedStrength));
}

/**
 * 計算下次複習間隔（基於記憶強度）
 * 
 * 核心原理：
 * - 記憶強度越高，複習間隔越長
 * - 在記憶衰減到安全閾值（20%）之前複習
 * - 使用安全係數（0.6）提前複習
 * 
 * @param memoryStrength 當前記憶強度 (0-100)
 * @param easeFactor 難度係數 (1.3-2.5)
 * @returns 複習間隔（天數）
 * 
 * @example
 * // 記憶強度 40%，easeFactor = 2.0
 * calculateNextReviewInterval(40, 2.0)
 * // → 約 6 天
 * 
 * // 記憶強度 80%，easeFactor = 2.0
 * calculateNextReviewInterval(80, 2.0)
 * // → 約 14 天
 * 
 * // 記憶強度 100%，easeFactor = 2.0
 * calculateNextReviewInterval(100, 2.0)
 * // → 約 18 天
 */
export function calculateNextReviewInterval(
  memoryStrength: number,
  easeFactor: number
): number {
  // 如果記憶強度為 0 或很低，明天複習
  if (memoryStrength <= 20) {
    return 1;
  }
  
  // 遺忘時間常數（考慮記憶強度）
  const baseTimeConstant = 7;
  const tau = baseTimeConstant * easeFactor * (1 + memoryStrength / 100);
  
  // 安全閾值（在衰減到 20% 之前複習）
  const safetyThreshold = 20;
  
  // 計算從當前強度衰減到 20% 需要多少天
  // R(t) = R0 × e^(-t/τ) = 20%
  // t = τ × ln(R0 / 20%)
  const daysToThreshold = tau * Math.log(memoryStrength / safetyThreshold);
  
  // 提前複習（安全係數 0.6）
  // 例如：如果 10 天後會衰減到 20%，則在第 6 天複習
  const safetyFactor = 0.6;
  const reviewInterval = daysToThreshold * safetyFactor;
  
  // 確保至少 1 天，最多 30 天
  return Math.max(1, Math.min(30, Math.round(reviewInterval)));
}

/**
 * 計算單字的複習優先級（基於實時記憶強度）
 * 
 * 核心原理：
 * - 實時記憶強度越低，優先級越高
 * - 過期時間越長，優先級越高
 * 
 * @param memoryStrength 當前記憶強度 (0-100)
 * @param lastReviewedAt 上次複習時間
 * @param nextReviewAt 下次複習時間
 * @param easeFactor 難度係數 (1.3-2.5)
 * @returns 優先級分數（越高越優先）
 * 
 * @example
 * // 記憶強度 20%，3 天前複習，已過期
 * calculatePriorityWithDecay(20, new Date('2024-01-01'), new Date('2024-01-02'), 2.0)
 * // → 高優先級
 * 
 * // 記憶強度 80%，1 天前複習，未過期
 * calculatePriorityWithDecay(80, new Date('2024-01-10'), new Date('2024-01-20'), 2.0)
 * // → 低優先級
 */
export function calculatePriorityWithDecay(
  memoryStrength: number,
  lastReviewedAt: Date,
  nextReviewAt: Date,
  easeFactor: number
): number {
  const now = new Date();
  
  // 1. 計算實時記憶強度（考慮自然衰減）
  const realTimeStrength = calculateDecayedStrength(
    memoryStrength,
    lastReviewedAt,
    easeFactor
  );
  
  // 2. 記憶強度分數（記憶強度越低，分數越高）
  const strengthScore = (100 - realTimeStrength) * 5;
  
  // 3. 過期時間分數（過期時間越長，分數越高）
  const overdueDays = Math.max(0, (now.getTime() - nextReviewAt.getTime()) / (1000 * 60 * 60 * 24));
  const overdueScore = overdueDays * 10;
  
  // 4. 總優先級分數
  return strengthScore + overdueScore;
}

/**
 * 遺忘速度對比表（用於調試和分析）
 * 
 * 展示不同記憶強度的遺忘速度
 * 
 * @param easeFactor 難度係數 (1.3-2.5)
 * @returns 遺忘速度對比表
 */
export function getForgettingCurveTable(easeFactor: number = 2.0): string {
  const strengths = [20, 40, 60, 80, 100];
  const days = [1, 7, 14, 30];
  
  let table = '記憶強度 | 遺忘時間常數 τ | 1天後 | 7天後 | 14天後 | 30天後\n';
  table += '---------|--------------|------|------|-------|-------\n';
  
  for (const strength of strengths) {
    const tau = 7 * easeFactor * (1 + strength / 100);
    const row = [
      `${strength}%`,
      `${tau.toFixed(1)} 天`
    ];
    
    for (const day of days) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - day);
      const decayed = calculateDecayedStrength(strength, pastDate, easeFactor);
      row.push(`${decayed}%`);
    }
    
    table += row.join(' | ') + '\n';
  }
  
  return table;
}

/**
 * 計算複習間隔對比表（用於調試和分析）
 * 
 * 展示不同記憶強度的建議複習間隔
 * 
 * @param easeFactor 難度係數 (1.3-2.5)
 * @returns 複習間隔對比表
 */
export function getReviewIntervalTable(easeFactor: number = 2.0): string {
  const strengths = [20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  let table = '記憶強度 | 複習間隔（天）\n';
  table += '---------|-------------\n';
  
  for (const strength of strengths) {
    const interval = calculateNextReviewInterval(strength, easeFactor);
    table += `${strength}% | ${interval} 天\n`;
  }
  
  return table;
}

