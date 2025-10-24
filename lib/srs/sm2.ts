/**
 * SuperMemo SM-2 算法實現
 * 用於計算間隔重複學習的複習時間
 *
 * 改進版本：
 * - 使用動態複習間隔（基於記憶強度）
 * - 記憶強度越高，複習間隔越長
 * - 考慮自然遺忘衰減
 */

import { calculateNextReviewInterval } from './forgetting';

export interface SM2Progress {
  repetitions: number;      // 連續正確次數
  interval: number;         // 複習間隔 (天數)
  easeFactor: number;       // 難度係數 (1.3-2.5)
  memoryStrength: number;   // 記憶強度 (0-100)
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

    // 2. 增加記憶強度 (最大 100)
    memoryStrength = Math.min(100, memoryStrength + 10);

    // 3. 增加難度係數 (最大 2.5)
    easeFactor = Math.min(2.5, easeFactor + 0.1);

    // 4. 計算動態複習間隔（基於記憶強度）
    // 記憶強度越高，複習間隔越長
    interval = calculateNextReviewInterval(memoryStrength, easeFactor);

  } else {
    // ===== 答錯 =====

    // 1. 重置連續正確次數
    repetitions = 0;

    // 2. 降低記憶強度 (最小 0)
    memoryStrength = Math.max(0, memoryStrength - 20);

    // 3. 降低難度係數 (最小 1.3)
    easeFactor = Math.max(1.3, easeFactor - 0.2);

    // 4. 重置複習間隔（明天再複習）
    interval = 1;
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

/**
 * 計算單字的複習優先級
 * @param progress 學習進度
 * @returns 優先級分數 (越高越優先)
 */
export function calculatePriority(progress: {
  nextReviewAt: Date;
  memoryStrength: number;
  totalReviews: number;
  incorrectReviews: number;
}): number {
  const now = Date.now();
  const overdueDays = (now - progress.nextReviewAt.getTime()) / (1000 * 60 * 60 * 24);
  const memoryScore = 100 - progress.memoryStrength;
  const errorRate = progress.totalReviews > 0 
    ? progress.incorrectReviews / progress.totalReviews 
    : 0;
  
  return (
    Math.max(0, overdueDays) * 10 +  // 過期時間權重
    memoryScore * 5 +                 // 記憶強度權重
    errorRate * 100                   // 錯誤率權重
  );
}

