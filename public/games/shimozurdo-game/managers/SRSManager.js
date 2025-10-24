/**
 * SRS (Spaced Repetition System) 管理器
 * 負責與後端 API 通信,管理學習進度
 */
class SRSManager {
  constructor() {
    this.sessionId = null;
    this.userId = null;
    this.geptLevel = null;
    this.words = [];
    this.currentWordIndex = 0;
    this.results = [];
    this.startTime = null;
    
    console.log('🧠 SRS 管理器初始化完成');
  }
  
  /**
   * 初始化 SRS 會話
   * @param {string} userId - 用戶 ID
   * @param {string} geptLevel - GEPT 等級
   * @returns {Promise<boolean>} 是否成功
   */
  async initSession(userId, geptLevel) {
    this.userId = userId;
    this.geptLevel = geptLevel;
    this.startTime = Date.now();
    
    try {
      console.log('🔄 創建 SRS 學習會話...');
      console.log(`  - 用戶 ID: ${userId}`);
      console.log(`  - GEPT 等級: ${geptLevel}`);

      // 檢查是否有指定的單字 IDs
      let wordIds = null;
      if (typeof localStorage !== 'undefined') {
        const storedWordIds = localStorage.getItem('srs_selected_words');
        if (storedWordIds) {
          try {
            wordIds = JSON.parse(storedWordIds);
            console.log(`🎯 使用指定的單字 IDs: ${wordIds.length} 個`);
            // 清除已使用的單字 IDs
            localStorage.removeItem('srs_selected_words');
          } catch (e) {
            console.error('❌ 解析單字 IDs 失敗:', e);
          }
        }
      }

      // 創建學習會話
      const requestBody = { userId, geptLevel };
      if (wordIds && wordIds.length > 0) {
        requestBody.wordIds = wordIds;
      }

      const response = await fetch('/api/srs/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.sessionId = data.sessionId;
      this.words = data.words;
      
      console.log(`✅ SRS 會話創建成功`);
      console.log(`  - 會話 ID: ${this.sessionId}`);
      console.log(`  - 總單字數: ${this.words.length}`);
      console.log(`  - 新單字: ${data.newWords?.length || 0} 個`);
      console.log(`  - 複習單字: ${data.reviewWords?.length || 0} 個`);
      
      return true;
    } catch (error) {
      console.error('❌ SRS 會話創建失敗:', error);
      return false;
    }
  }
  
  /**
   * 獲取當前單字
   * @returns {Object|null} 當前單字
   */
  getCurrentWord() {
    if (this.currentWordIndex >= this.words.length) {
      return null;
    }
    return this.words[this.currentWordIndex];
  }
  
  /**
   * 獲取當前進度
   * @returns {Object} 進度信息
   */
  getProgress() {
    return {
      current: this.currentWordIndex + 1,
      total: this.words.length,
      percentage: Math.round((this.currentWordIndex / this.words.length) * 100)
    };
  }
  
  /**
   * 記錄答題結果
   * @param {boolean} isCorrect - 是否答對
   * @param {number} responseTime - 反應時間 (毫秒)
   * @param {string} wordEnglish - 答題的單字 (用於驗證)
   * @returns {Promise<void>}
   */
  async recordAnswer(isCorrect, responseTime, wordEnglish = null) {
    const word = this.getCurrentWord();
    if (!word) {
      console.warn('⚠️  沒有當前單字,無法記錄答題結果');
      console.warn(`  - currentWordIndex: ${this.currentWordIndex}`);
      console.warn(`  - words.length: ${this.words.length}`);
      return;
    }

    // 🔍 驗證單字是否匹配 (如果提供了 wordEnglish)
    if (wordEnglish && word.english !== wordEnglish) {
      console.warn('⚠️  單字不匹配!');
      console.warn(`  - 當前單字: ${word.english}`);
      console.warn(`  - 答題單字: ${wordEnglish}`);
      console.warn(`  - 跳過此次記錄`);
      return;
    }

    // 計算質量分數
    const quality = SM2.calculateQuality(isCorrect, responseTime);

    // 記錄結果
    this.results.push({
      wordId: word.id,
      english: word.english,
      isCorrect,
      responseTime,
      quality
    });

    try {
      console.log(`📝 更新單字進度: ${word.english} (${isCorrect ? '✅ 正確' : '❌ 錯誤'})`);
      console.log(`  - 反應時間: ${responseTime}ms`);
      console.log(`  - 質量分數: ${quality}/5`);

      // 更新後端進度
      const response = await fetch('/api/srs/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          wordId: word.id,
          isCorrect,
          responseTime,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`✅ 進度更新成功`);
      console.log(`  - 記憶強度: ${data.progress.memoryStrength}/100`);
      console.log(`  - 複習間隔: ${data.progress.interval} 天`);
      console.log(`  - 下次複習: ${new Date(data.progress.nextReviewAt).toLocaleDateString()}`);

    } catch (error) {
      console.error('❌ 進度更新失敗:', error);
    }

    // 🔄 只在答對時移動到下一個單字
    // 答錯時保持在當前單字,讓用戶再次嘗試
    if (isCorrect) {
      this.currentWordIndex++;
      console.log(`🔄 移動到下一個單字 (${this.currentWordIndex}/${this.words.length})`);
    } else {
      console.log(`🔄 保持在當前單字,等待再次嘗試`);
    }
  }
  
  /**
   * 完成會話
   * @returns {Promise<Object|null>} 會話統計
   */
  async finishSession() {
    if (!this.sessionId) {
      console.warn('⚠️  沒有活動會話,無法完成');
      return null;
    }

    const correctAnswers = this.results.filter(r => r.isCorrect).length;
    const totalAnswers = this.results.length;
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(1) : 0;

    try {
      console.log('🏁 完成 SRS 學習會話...');

      const response = await fetch(`/api/srs/sessions/${this.sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctAnswers,
          totalAnswers,
          duration
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ 會話完成');
      console.log(`  - 正確率: ${accuracy}%`);
      console.log(`  - 答對: ${correctAnswers}/${totalAnswers}`);
      console.log(`  - 學習時間: ${duration} 秒`);

      // 🧠 獲取詳細的單字進度變化
      const wordDetails = await this.getWordProgressDetails();

      return {
        correctAnswers,
        totalAnswers,
        accuracy: parseFloat(accuracy),
        duration,
        wordDetails  // 添加單字詳細進度
      };

    } catch (error) {
      console.error('❌ 會話完成失敗:', error);
      return null;
    }
  }

  /**
   * 獲取單字進度詳細信息
   * @returns {Promise<Array>} 單字進度列表
   */
  async getWordProgressDetails() {
    if (!this.sessionId || !this.userId) {
      return [];
    }

    try {
      // 獲取本次學習的所有單字 IDs
      const wordIds = this.words.map(w => w.id);

      const response = await fetch('/api/srs/word-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordIds,
          geptLevel: this.geptLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('📊 獲取單字進度詳情成功:', data.words.length, '個單字');

      return data.words || [];

    } catch (error) {
      console.error('❌ 獲取單字進度詳情失敗:', error);
      return [];
    }
  }
  
  /**
   * 獲取學習統計
   * @returns {Promise<Object|null>} 統計數據
   */
  async getStatistics() {
    try {
      const response = await fetch(`/api/srs/statistics?userId=${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 獲取統計失敗:', error);
      return null;
    }
  }
  
  /**
   * 檢查是否使用 SRS 模式
   * @returns {boolean} 是否使用 SRS
   */
  static isSRSMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('activityId');
    const useSRS = urlParams.get('useSRS');
    
    // 如果有 activityId,則不使用 SRS (教師自定義活動)
    // 如果明確指定 useSRS=true,則使用 SRS
    return !activityId || useSRS === 'true';
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SRSManager;
}

