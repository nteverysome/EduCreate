/**
 * BilingualManager - 中英文雙語管理系統
 * 基於 Task 1.5.1 需求分析設計
 * 整合 GEPTManager 提供完整的雙語功能
 */

import { GEPTManager, GEPTWord, GEPTLevel } from './GEPTManager';

export interface BilingualDisplayConfig {
  position: 'top-center' | 'bottom-center' | 'floating';
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    padding: { x: number; y: number };
    borderRadius: number;
    border: string;
  };
  animation: {
    fadeIn: { duration: number; ease: string };
    fadeOut: { duration: number; ease: string };
    bounce?: { amplitude: number; duration: number };
  };
}

export interface BilingualPromptState {
  isVisible: boolean;
  currentWord: GEPTWord | null;
  displayMode: 'chinese-only' | 'english-only' | 'both';
  lastUpdateTime: number;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'reverse';
  enableVoice: boolean;
  enableKeyboardNav: boolean;
  screenReaderMode: boolean;
}

/**
 * 雙語管理器 - 核心雙語功能管理
 */
export class BilingualManager {
  private scene: Phaser.Scene;
  private geptManager: GEPTManager;
  private promptContainer: Phaser.GameObjects.Container | null = null;
  private chineseText: Phaser.GameObjects.Text | null = null;
  private englishText: Phaser.GameObjects.Text | null = null;
  private backgroundRect: Phaser.GameObjects.Rectangle | null = null;
  
  private config: BilingualDisplayConfig;
  private state: BilingualPromptState;
  private accessibilitySettings: AccessibilitySettings;
  
  // 快取系統
  private wordCache: Map<string, GEPTWord> = new Map();
  private translationCache: Map<string, string> = new Map();
  
  constructor(scene: Phaser.Scene, geptManager: GEPTManager) {
    this.scene = scene;
    this.geptManager = geptManager;
    
    // 初始化配置
    this.config = this.getDefaultConfig();
    this.state = this.getInitialState();
    this.accessibilitySettings = this.getDefaultAccessibilitySettings();
    
    this.initializePromptUI();
    console.log('🌐 BilingualManager 初始化完成');
  }

  /**
   * 獲取默認顯示配置
   */
  private getDefaultConfig(): BilingualDisplayConfig {
    return {
      position: 'top-center',
      style: {
        fontSize: 24,
        fontFamily: 'Microsoft YaHei, SimHei, Arial, sans-serif',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: { x: 16, y: 8 },
        borderRadius: 8,
        border: '2px solid #FFD700'
      },
      animation: {
        fadeIn: { duration: 300, ease: 'Power2.easeOut' },
        fadeOut: { duration: 200, ease: 'Power2.easeIn' },
        bounce: { amplitude: 10, duration: 500 }
      }
    };
  }

  /**
   * 獲取初始狀態
   */
  private getInitialState(): BilingualPromptState {
    return {
      isVisible: false,
      currentWord: null,
      displayMode: 'chinese-only', // 用戶要求只顯示中文
      lastUpdateTime: 0
    };
  }

  /**
   * 獲取默認無障礙設置
   */
  private getDefaultAccessibilitySettings(): AccessibilitySettings {
    return {
      fontSize: 'medium',
      contrast: 'normal',
      enableVoice: false,
      enableKeyboardNav: true,
      screenReaderMode: false
    };
  }

  /**
   * 初始化提示 UI
   */
  private initializePromptUI(): void {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    
    // 創建容器
    this.promptContainer = this.scene.add.container(0, 0);
    this.promptContainer.setDepth(1000); // 確保在最上層
    
    // 創建背景
    this.backgroundRect = this.scene.add.rectangle(
      0, 0, 200, 60,
      0x000000, 0.8
    );
    this.backgroundRect.setStrokeStyle(2, 0xFFD700);
    
    // 創建中文文字
    this.chineseText = this.scene.add.text(0, -10, '', {
      fontSize: `${this.config.style.fontSize}px`,
      fontFamily: this.config.style.fontFamily,
      color: this.config.style.color,
      align: 'center',
      fontStyle: 'bold'
    });
    this.chineseText.setOrigin(0.5);
    
    // 創建英文文字（小字）
    this.englishText = this.scene.add.text(0, 15, '', {
      fontSize: `${this.config.style.fontSize * 0.7}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#CCCCCC',
      align: 'center'
    });
    this.englishText.setOrigin(0.5);
    
    // 添加到容器
    this.promptContainer.add([this.backgroundRect, this.chineseText, this.englishText]);
    
    // 設置位置
    this.updatePromptPosition();
    
    // 初始隱藏
    this.promptContainer.setVisible(false);
    this.promptContainer.setAlpha(0);
  }

  /**
   * 更新提示位置
   */
  private updatePromptPosition(): void {
    if (!this.promptContainer) return;
    
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    
    switch (this.config.position) {
      case 'top-center':
        this.promptContainer.setPosition(gameWidth / 2, 80);
        break;
      case 'bottom-center':
        this.promptContainer.setPosition(gameWidth / 2, gameHeight - 80);
        break;
      case 'floating':
        // 浮動位置會在 showChinesePrompt 中動態設置
        break;
    }
  }

  /**
   * 顯示中文提示
   */
  showChinesePrompt(englishWord: string, targetPosition?: { x: number; y: number }): void {
    const word = this.getWordFromCache(englishWord);
    if (!word) {
      console.warn(`⚠️ 未找到詞彙: ${englishWord}`);
      return;
    }

    this.state.currentWord = word;
    this.state.isVisible = true;
    this.state.lastUpdateTime = Date.now();

    // 更新文字內容
    if (this.chineseText) {
      this.chineseText.setText(word.chinese);
    }
    
    if (this.englishText && this.state.displayMode === 'both') {
      this.englishText.setText(`(${word.english})`);
    } else if (this.englishText) {
      this.englishText.setText('');
    }

    // 調整背景大小
    this.adjustBackgroundSize();

    // 設置浮動位置
    if (this.config.position === 'floating' && targetPosition) {
      this.promptContainer?.setPosition(
        targetPosition.x,
        targetPosition.y - 60
      );
    }

    // 顯示動畫
    this.playShowAnimation();

    console.log(`🌐 顯示中文提示: ${word.chinese} (${word.english})`);
  }

  /**
   * 隱藏中文提示
   */
  hideChinesePrompt(): void {
    if (!this.state.isVisible) return;

    this.state.isVisible = false;
    this.state.currentWord = null;

    // 隱藏動畫
    this.playHideAnimation();

    console.log('🌐 隱藏中文提示');
  }

  /**
   * 更新目標詞彙
   */
  updateTargetWord(englishWord: string): void {
    const word = this.getWordFromCache(englishWord);
    if (!word) {
      console.warn(`⚠️ 未找到目標詞彙: ${englishWord}`);
      return;
    }

    // 如果當前正在顯示，更新內容
    if (this.state.isVisible) {
      this.showChinesePrompt(englishWord);
    }

    console.log(`🎯 更新目標詞彙: ${word.chinese} (${word.english})`);
  }

  /**
   * 從快取獲取詞彙
   */
  private getWordFromCache(englishWord: string): GEPTWord | null {
    // 先檢查快取
    if (this.wordCache.has(englishWord)) {
      return this.wordCache.get(englishWord)!;
    }

    // 從 GEPTManager 查找
    const word = this.geptManager.findWordByEnglish(englishWord);
    if (word) {
      // 添加到快取
      this.wordCache.set(englishWord, word);
      this.translationCache.set(englishWord, word.chinese);
    }

    return word;
  }

  /**
   * 調整背景大小
   */
  private adjustBackgroundSize(): void {
    if (!this.backgroundRect || !this.chineseText) return;

    const textBounds = this.chineseText.getBounds();
    const padding = this.config.style.padding;
    
    const width = Math.max(textBounds.width + padding.x * 2, 120);
    const height = Math.max(textBounds.height + padding.y * 2, 50);
    
    this.backgroundRect.setSize(width, height);
  }

  /**
   * 播放顯示動畫
   */
  private playShowAnimation(): void {
    if (!this.promptContainer) return;

    this.promptContainer.setVisible(true);
    
    // 淡入動畫
    this.scene.tweens.add({
      targets: this.promptContainer,
      alpha: 1,
      duration: this.config.animation.fadeIn.duration,
      ease: this.config.animation.fadeIn.ease,
      onComplete: () => {
        // 可選的彈跳效果
        if (this.config.animation.bounce) {
          this.playBounceAnimation();
        }
      }
    });
  }

  /**
   * 播放隱藏動畫
   */
  private playHideAnimation(): void {
    if (!this.promptContainer) return;

    this.scene.tweens.add({
      targets: this.promptContainer,
      alpha: 0,
      duration: this.config.animation.fadeOut.duration,
      ease: this.config.animation.fadeOut.ease,
      onComplete: () => {
        this.promptContainer?.setVisible(false);
      }
    });
  }

  /**
   * 播放彈跳動畫
   */
  private playBounceAnimation(): void {
    if (!this.promptContainer || !this.config.animation.bounce) return;

    const originalY = this.promptContainer.y;
    const bounce = this.config.animation.bounce;

    this.scene.tweens.add({
      targets: this.promptContainer,
      y: originalY - bounce.amplitude,
      duration: bounce.duration / 2,
      ease: 'Power2.easeOut',
      yoyo: true,
      repeat: 0
    });
  }

  /**
   * 設置顯示模式
   */
  setDisplayMode(mode: 'chinese-only' | 'english-only' | 'both'): void {
    this.state.displayMode = mode;
    
    // 如果當前正在顯示，更新顯示
    if (this.state.isVisible && this.state.currentWord) {
      this.showChinesePrompt(this.state.currentWord.english);
    }
  }

  /**
   * 應用無障礙設置
   */
  applyAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    
    // 更新字體大小
    this.updateFontSize();
    
    // 更新對比度
    this.updateContrast();
    
    console.log('♿ 應用無障礙設置:', this.accessibilitySettings);
  }

  /**
   * 更新字體大小
   */
  private updateFontSize(): void {
    const sizeMap = {
      'small': 18,
      'medium': 24,
      'large': 30,
      'extra-large': 36
    };
    
    const fontSize = sizeMap[this.accessibilitySettings.fontSize];
    
    if (this.chineseText) {
      this.chineseText.setFontSize(fontSize);
    }
    
    if (this.englishText) {
      this.englishText.setFontSize(fontSize * 0.7);
    }
    
    // 重新調整背景大小
    this.adjustBackgroundSize();
  }

  /**
   * 更新對比度
   */
  private updateContrast(): void {
    const contrastMap = {
      'normal': { bg: 0x000000, text: '#FFFFFF', border: 0xFFD700 },
      'high': { bg: 0x000000, text: '#FFFF00', border: 0xFFFFFF },
      'reverse': { bg: 0xFFFFFF, text: '#000000', border: 0x000000 }
    };
    
    const colors = contrastMap[this.accessibilitySettings.contrast];
    
    if (this.backgroundRect) {
      this.backgroundRect.setFillStyle(colors.bg, 0.9);
      this.backgroundRect.setStrokeStyle(2, colors.border);
    }
    
    if (this.chineseText) {
      this.chineseText.setColor(colors.text);
    }
    
    if (this.englishText) {
      this.englishText.setColor(colors.text);
    }
  }

  /**
   * 獲取中文翻譯
   */
  getChineseTranslation(englishWord: string): string {
    // 先檢查翻譯快取
    if (this.translationCache.has(englishWord)) {
      return this.translationCache.get(englishWord)!;
    }

    // 從詞彙快取獲取
    const word = this.getWordFromCache(englishWord);
    return word ? word.chinese : '';
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.promptContainer) {
      this.promptContainer.destroy();
      this.promptContainer = null;
    }
    
    this.wordCache.clear();
    this.translationCache.clear();
    
    console.log('🧹 BilingualManager 已銷毀');
  }

  /**
   * 獲取當前狀態
   */
  getState(): BilingualPromptState {
    return { ...this.state };
  }

  /**
   * 獲取統計信息
   */
  getStatistics() {
    return {
      cacheSize: this.wordCache.size,
      translationCacheSize: this.translationCache.size,
      currentLevel: this.geptManager.getCurrentLevel(),
      isVisible: this.state.isVisible,
      displayMode: this.state.displayMode
    };
  }
}
