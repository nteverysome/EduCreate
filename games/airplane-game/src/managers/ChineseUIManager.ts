/**
 * ChineseUIManager - 中文 UI 管理系統
 * 負責遊戲中所有中文界面元素的管理和顯示
 * 基於 Task 1.5.1 需求分析設計
 */

import { GEPTManager, GEPTWord } from './GEPTManager';
import { BilingualManager, AccessibilitySettings } from './BilingualManager';

export interface ChineseUIElements {
  scoreText: Phaser.GameObjects.Text | null;
  livesText: Phaser.GameObjects.Text | null;
  targetText: Phaser.GameObjects.Text | null;
  statusText: Phaser.GameObjects.Text | null;
  instructionText: Phaser.GameObjects.Text | null;
}

export interface UITextConfig {
  fontSize: number;
  fontFamily: string;
  color: string;
  stroke: string;
  strokeThickness: number;
  shadow: {
    offsetX: number;
    offsetY: number;
    color: string;
    blur: number;
    fill: boolean;
  };
}

/**
 * 中文 UI 管理器
 */
export class ChineseUIManager {
  private scene: Phaser.Scene;
  private geptManager: GEPTManager;
  private bilingualManager: BilingualManager;
  
  private uiElements: ChineseUIElements;
  private textConfig: UITextConfig;
  private accessibilitySettings: AccessibilitySettings;
  
  // UI 容器
  private hudContainer: Phaser.GameObjects.Container | null = null;
  private targetContainer: Phaser.GameObjects.Container | null = null;
  
  // 遊戲狀態
  private currentScore: number = 0;
  private currentLives: number = 100;
  private currentTarget: GEPTWord | null = null;
  private gameStatus: 'waiting' | 'playing' | 'paused' | 'ended' = 'waiting';

  constructor(
    scene: Phaser.Scene, 
    geptManager: GEPTManager, 
    bilingualManager: BilingualManager
  ) {
    this.scene = scene;
    this.geptManager = geptManager;
    this.bilingualManager = bilingualManager;
    
    this.uiElements = this.initializeUIElements();
    this.textConfig = this.getDefaultTextConfig();
    this.accessibilitySettings = this.getDefaultAccessibilitySettings();
    
    this.createChineseHUD();
    console.log('🎨 ChineseUIManager 初始化完成');
  }

  /**
   * 初始化 UI 元素
   */
  private initializeUIElements(): ChineseUIElements {
    return {
      scoreText: null,
      livesText: null,
      targetText: null,
      statusText: null,
      instructionText: null
    };
  }

  /**
   * 獲取默認文字配置
   */
  private getDefaultTextConfig(): UITextConfig {
    return {
      fontSize: 20,
      fontFamily: 'Microsoft YaHei, SimHei, Arial, sans-serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
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
   * 創建中文 HUD - 極簡版本（只保留統一控制的元素）
   */
  private createChineseHUD(): void {
    // 只創建目標詞彙容器（統一控制的元素）
    this.createTargetDisplay();

    console.log('🎨 極簡中文 HUD 創建完成（只保留統一控制元素）');
  }

  /**
   * 創建目標詞彙顯示 - 極簡版本
   */
  private createTargetDisplay(): void {
    const gameWidth = this.scene.scale.width;

    // 創建目標容器 - 極簡版本
    this.targetContainer = this.scene.add.container(gameWidth / 2, 120);
    this.targetContainer.setDepth(998);

    // 極簡目標詞彙文字 - 只有一個大字
    this.uiElements.targetText = this.scene.add.text(0, 0, '等待設置...', {
      fontSize: '48px', // 更大字體
      fontFamily: this.textConfig.fontFamily,
      color: '#FFFFFF',
      align: 'center',
      fontStyle: 'bold',
      backgroundColor: '#FFD700', // 黃色背景
      padding: { x: 20, y: 10 }
    });
    this.uiElements.targetText.setOrigin(0.5);
    this.uiElements.targetText.setInteractive(); // 可點擊
    this.targetContainer.add(this.uiElements.targetText);

    // 添加點擊事件 - 發英文音
    this.uiElements.targetText.on('pointerdown', () => {
      if (this.currentTarget) {
        this.speakEnglish(this.currentTarget.english);
      }
    });

    console.log('🎯 極簡目標詞彙顯示創建完成');
  }

  // 移除操作說明文字（不是統一控制的元素）

  /**
   * 獲取文字樣式
   */
  private getTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: `${this.textConfig.fontSize}px`,
      fontFamily: this.textConfig.fontFamily,
      color: this.textConfig.color,
      stroke: this.textConfig.stroke,
      strokeThickness: this.textConfig.strokeThickness,
      shadow: this.textConfig.shadow
    };
  }

  // 移除分數和生命值顯示（不是統一控制的元素）
  updateScore(score: number): void {
    this.currentScore = score;
    // 不再顯示分數UI
  }

  updateLives(lives: number): void {
    this.currentLives = lives;
    // 不再顯示生命值UI
  }

  /**
   * 更新目標詞彙顯示 - 極簡版本
   */
  updateTargetWord(word: GEPTWord): void {
    this.currentTarget = word;
    if (this.uiElements.targetText) {
      // 極簡版本：只顯示一個中文字
      this.uiElements.targetText.setText(word.chinese);

      // 自動發中文音
      this.speakChinese(word.chinese);
    }

    // 同時更新雙語管理器
    this.bilingualManager.updateTargetWord(word.english);

    console.log(`🎯 極簡目標詞彙: ${word.chinese}`);
  }

  // 移除遊戲狀態顯示（不是統一控制的元素）
  updateGameStatus(status: 'waiting' | 'playing' | 'paused' | 'ended'): void {
    this.gameStatus = status;
    // 不再顯示遊戲狀態UI
  }

  /**
   * 顯示成功提示 - 極簡版本 + 英文發音
   */
  showSuccessMessage(word: GEPTWord, points: number): void {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    // 創建成功提示 - 極簡版本
    const successText = this.scene.add.text(
      gameWidth / 2,
      gameHeight / 2,
      `正確！\n${word.chinese}\n+${points} 分`,
      {
        fontSize: '32px',
        fontFamily: this.textConfig.fontFamily,
        color: '#00FF00',
        align: 'center',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    successText.setOrigin(0.5);
    successText.setDepth(1001);

    // 碰撞成功時發英文音（學習獎勵）
    this.speakEnglish(word.english);

    // 動畫效果
    this.scene.tweens.add({
      targets: successText,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 1500,
      ease: 'Power2.easeOut',
      onComplete: () => {
        successText.destroy();
      }
    });

    console.log(`✅ 成功提示: ${word.chinese} +${points}分 🔊${word.english}`);
  }

  /**
   * 顯示錯誤提示
   */
  showErrorMessage(word: GEPTWord, penalty: number): void {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    // 創建錯誤提示 - 用戶要求只顯示中文
    const errorText = this.scene.add.text(
      gameWidth / 2,
      gameHeight / 2,
      `錯誤！\n${word.chinese}\n-${penalty} 生命值`,
      {
        fontSize: '28px',
        fontFamily: this.textConfig.fontFamily,
        color: '#FF0000',
        align: 'center',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    errorText.setOrigin(0.5);
    errorText.setDepth(1001);

    // 動畫效果
    this.scene.tweens.add({
      targets: errorText,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0,
      duration: 1200,
      ease: 'Power2.easeIn',
      onComplete: () => {
        errorText.destroy();
      }
    });

    console.log(`❌ 顯示錯誤提示: ${word.chinese} -${penalty}生命值`);
  }

  /**
   * 應用無障礙設置
   */
  applyAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    
    // 更新字體大小
    this.updateAllFontSizes();
    
    // 更新對比度
    this.updateAllContrast();
    
    console.log('♿ ChineseUIManager 應用無障礙設置:', this.accessibilitySettings);
  }

  /**
   * 更新所有字體大小
   */
  private updateAllFontSizes(): void {
    const sizeMap = {
      'small': 16,
      'medium': 20,
      'large': 24,
      'extra-large': 28
    };
    
    const fontSize = sizeMap[this.accessibilitySettings.fontSize];
    this.textConfig.fontSize = fontSize;
    
    // 更新所有文字元素
    Object.values(this.uiElements).forEach(element => {
      if (element && element.setFontSize) {
        element.setFontSize(fontSize);
      }
    });
  }

  /**
   * 更新所有對比度
   */
  private updateAllContrast(): void {
    const contrastMap = {
      'normal': { text: '#FFFFFF', stroke: '#000000' },
      'high': { text: '#FFFF00', stroke: '#000000' },
      'reverse': { text: '#000000', stroke: '#FFFFFF' }
    };
    
    const colors = contrastMap[this.accessibilitySettings.contrast];
    this.textConfig.color = colors.text;
    this.textConfig.stroke = colors.stroke;
    
    // 更新所有文字元素
    Object.values(this.uiElements).forEach(element => {
      if (element && element.setColor) {
        element.setColor(colors.text);
        element.setStroke(colors.stroke, this.textConfig.strokeThickness);
      }
    });
  }

  /**
   * 設置 UI 可見性
   */
  setVisible(visible: boolean): void {
    if (this.hudContainer) {
      this.hudContainer.setVisible(visible);
    }
    if (this.targetContainer) {
      this.targetContainer.setVisible(visible);
    }
  }

  /**
   * 發中文音
   */
  private speakChinese(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // 中文
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
      console.log(`🔊 發中文音: ${text}`);
    }
  }

  /**
   * 發英文音
   */
  private speakEnglish(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // 英文
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
      console.log(`🔊 發英文音: ${text}`);
    }
  }

  /**
   * 獲取當前狀態
   */
  getState() {
    return {
      score: this.currentScore,
      lives: this.currentLives,
      target: this.currentTarget,
      status: this.gameStatus,
      accessibilitySettings: this.accessibilitySettings
    };
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.hudContainer) {
      this.hudContainer.destroy();
      this.hudContainer = null;
    }
    
    if (this.targetContainer) {
      this.targetContainer.destroy();
      this.targetContainer = null;
    }
    
    // 清空 UI 元素引用
    Object.keys(this.uiElements).forEach(key => {
      this.uiElements[key as keyof ChineseUIElements] = null;
    });
    
    console.log('🧹 ChineseUIManager 已銷毀');
  }
}
