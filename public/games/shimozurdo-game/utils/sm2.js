/**
 * SuperMemo SM-2 算法實現
 * 用於計算間隔重複學習的複習時間
 */
class SM2 {
  /**
   * 更新學習進度
   * @param {Object} progress - 當前進度
   * @param {number} progress.repetitions - 連續正確次數
   * @param {number} progress.interval - 複習間隔 (天數)
   * @param {number} progress.easeFactor - 難度係數 (1.3-2.5)
   * @param {number} progress.memoryStrength - 記憶強度 (0-100)
   * @param {boolean} isCorrect - 是否答對
   * @returns {Object} 更新後的進度
   */
  static update(progress, isCorrect) {
    let { repetitions, interval, easeFactor, memoryStrength } = progress;
    
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
    nextReviewAt.setTime(nextReviewAt.getTime() + interval * 24 * 60 * 60 * 1000);
    
    // 6. 更新學習狀態
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
   * 根據答題結果計算質量分數
   * @param {boolean} isCorrect - 是否答對
   * @param {number} responseTime - 反應時間 (毫秒)
   * @returns {number} 質量分數 (0-5)
   */
  static calculateQuality(isCorrect, responseTime) {
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
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SM2;
}

