/**
 * 雙語管理器
 * 管理中英文語音發音系統
 */
class BilingualManager {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.isSpeaking = false;
    
    if (!this.isSupported) {
      console.warn('⚠️ 瀏覽器不支援語音合成');
    } else {
      console.log('🔊 雙語管理器初始化完成');
    }
  }

  /**
   * 檢查語音合成是否可用
   */
  checkSupport() {
    return this.isSupported;
  }

  /**
   * 停止當前語音
   */
  stop() {
    if (this.isSupported && this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * 英文發音
   */
  speakEnglish(text, options = {}) {
    if (!this.isSupported) {
      console.warn('⚠️ 語音合成不可用');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    return new Promise((resolve, reject) => {
      try {
        // 停止當前語音
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = () => {
          this.isSpeaking = true;
          console.log(`🔊 播放英文: "${text}"`);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          console.error('❌ 英文發音錯誤:', event.error);
          reject(event.error);
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('❌ 英文發音失敗:', error);
        reject(error);
      }
    });
  }

  /**
   * 中文發音
   */
  speakChinese(text, options = {}) {
    if (!this.isSupported) {
      console.warn('⚠️ 語音合成不可用');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    return new Promise((resolve, reject) => {
      try {
        // 停止當前語音
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = () => {
          this.isSpeaking = true;
          console.log(`🔊 播放中文: "${text}"`);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          console.error('❌ 中文發音錯誤:', event.error);
          reject(event.error);
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('❌ 中文發音失敗:', error);
        reject(error);
      }
    });
  }

  /**
   * 雙語發音（先中文後英文）
   */
  async speakBilingual(english, chinese, options = {}) {
    if (!this.isSupported) {
      console.warn('⚠️ 語音合成不可用');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    try {
      console.log(`🔊 雙語發音: "${chinese}" (${english})`);
      
      // 先播放中文
      await this.speakChinese(chinese, options);
      
      // 等待一小段時間
      await new Promise(resolve => setTimeout(resolve, options.delay || 500));
      
      // 再播放英文
      await this.speakEnglish(english, options);
      
      console.log('✅ 雙語發音完成');
    } catch (error) {
      console.error('❌ 雙語發音失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取可用的語音列表
   */
  getVoices() {
    if (!this.isSupported) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * 獲取英文語音
   */
  getEnglishVoices() {
    return this.getVoices().filter(voice => voice.lang.startsWith('en'));
  }

  /**
   * 獲取中文語音
   */
  getChineseVoices() {
    return this.getVoices().filter(voice => voice.lang.startsWith('zh'));
  }

  /**
   * 測試語音系統
   */
  async test() {
    console.log('🧪 測試語音系統...');
    
    try {
      await this.speakChinese('你好');
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.speakEnglish('Hello');
      console.log('✅ 語音系統測試成功');
    } catch (error) {
      console.error('❌ 語音系統測試失敗:', error);
    }
  }
}

// 導出為全局變量
window.BilingualManager = BilingualManager;

