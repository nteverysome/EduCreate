/**
 * 全螢幕按鈕 UI 組件
 * 位於右下角，支援全螢幕切換功能，自適應所有螢幕尺寸
 * 具備專業的視覺效果和用戶體驗
 */

export interface FullscreenButtonConfig {
  size: number;
  cornerRadius: number;
  colors: {
    background: number;
    backgroundHover: number;
    backgroundActive: number;
    icon: number;
    iconHover: number;
    border: number;
    borderHover: number;
  };
  animations: {
    hoverScale: number;
    clickScale: number;
    duration: number;
  };
}

export class FullscreenButton {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Graphics;
  private icon!: Phaser.GameObjects.Graphics;
  private tooltip?: Phaser.GameObjects.Container;

  private isFullscreen: boolean = false;
  private isHovered: boolean = false;
  private isPressed: boolean = false;

  // 配置
  private config: FullscreenButtonConfig;

  // 錯誤處理
  private errorStats: Map<string, number> = new Map();
  private lastErrorTime: number = 0;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  
  // 預設配置
  private static readonly DEFAULT_CONFIG: FullscreenButtonConfig = {
    size: 48,
    cornerRadius: 8,
    colors: {
      background: 0x000000,
      backgroundHover: 0x333333,
      backgroundActive: 0x555555,
      icon: 0xffffff,
      iconHover: 0x00ff88,
      border: 0x666666,
      borderHover: 0x00ff88
    },
    animations: {
      hoverScale: 1.1,
      clickScale: 0.95,
      duration: 150
    }
  };

  constructor(scene: Phaser.Scene, config?: Partial<FullscreenButtonConfig>) {
    try {
      this.scene = scene;
      this.config = { ...FullscreenButton.DEFAULT_CONFIG, ...config };

      this.createButton();
      this.setupEvents();
      this.updatePosition();
      this.checkFullscreenStatus();

      // 延遲顯示功能介紹
      this.scene.time.delayedCall(3000, () => {
        this.showFeatureIntro();
      });

      console.log('🖥️ 專業全螢幕按鈕已創建（整合響應式管理器 + UX優化）');
    } catch (error) {
      console.error('❌ 全螢幕按鈕創建失敗:', error);
      throw error;
    }
  }
  
  /**
   * 創建按鈕圖形
   */
  private createButton(): void {
    // 創建容器
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000); // 確保在最上層

    // 創建背景
    this.background = this.scene.add.graphics();
    this.drawBackground();

    // 創建圖標
    this.icon = this.scene.add.graphics();
    this.drawIcon();

    // 添加到容器
    this.container.add([this.background, this.icon]);

    // 設置互動區域
    this.container.setSize(this.config.size, this.config.size);
    this.container.setInteractive({
      useHandCursor: true,
      hitArea: new Phaser.Geom.Rectangle(
        -this.config.size / 2,
        -this.config.size / 2,
        this.config.size,
        this.config.size
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains
    });
  }

  /**
   * 繪製背景
   */
  private drawBackground(): void {
    this.background.clear();

    const { size, cornerRadius } = this.config;
    const colors = this.config.colors;

    // 選擇背景顏色
    let bgColor = colors.background;
    let borderColor = colors.border;
    let alpha = 0.8;

    if (this.isPressed) {
      bgColor = colors.backgroundActive;
      borderColor = colors.borderHover;
      alpha = 0.95;
    } else if (this.isHovered) {
      bgColor = colors.backgroundHover;
      borderColor = colors.borderHover;
      alpha = 0.9;
    }

    // 繪製背景
    this.background.fillStyle(bgColor, alpha);
    this.background.fillRoundedRect(
      -size / 2,
      -size / 2,
      size,
      size,
      cornerRadius
    );

    // 繪製邊框
    this.background.lineStyle(2, borderColor, 0.6);
    this.background.strokeRoundedRect(
      -size / 2,
      -size / 2,
      size,
      size,
      cornerRadius
    );

    // 添加內陰影效果
    if (this.isPressed) {
      this.background.lineStyle(1, 0x000000, 0.3);
      this.background.strokeRoundedRect(
        -size / 2 + 1,
        -size / 2 + 1,
        size - 2,
        size - 2,
        cornerRadius - 1
      );
    }
  }

  /**
   * 繪製全螢幕圖標
   */
  private drawIcon(): void {
    this.icon.clear();
    this.icon.lineStyle(2, this.config.colors.icon, 1);

    if (!this.isFullscreen) {
      // 進入全螢幕圖標 - 四個角的擴展箭頭
      const size = (this.config.size * 0.6) / 2;
      
      // 左上角
      this.icon.beginPath();
      this.icon.moveTo(-size, -size + 6);
      this.icon.lineTo(-size, -size);
      this.icon.lineTo(-size + 6, -size);
      this.icon.strokePath();
      
      // 右上角
      this.icon.beginPath();
      this.icon.moveTo(size - 6, -size);
      this.icon.lineTo(size, -size);
      this.icon.lineTo(size, -size + 6);
      this.icon.strokePath();
      
      // 左下角
      this.icon.beginPath();
      this.icon.moveTo(-size, size - 6);
      this.icon.lineTo(-size, size);
      this.icon.lineTo(-size + 6, size);
      this.icon.strokePath();
      
      // 右下角
      this.icon.beginPath();
      this.icon.moveTo(size - 6, size);
      this.icon.lineTo(size, size);
      this.icon.lineTo(size, size - 6);
      this.icon.strokePath();
    } else {
      // 退出全螢幕圖標 - 四個角的收縮箭頭
      const size = (this.config.size * 0.6) / 2;
      
      // 左上角
      this.icon.beginPath();
      this.icon.moveTo(-size + 6, -size);
      this.icon.lineTo(-size + 6, -size + 6);
      this.icon.lineTo(-size, -size + 6);
      this.icon.strokePath();
      
      // 右上角
      this.icon.beginPath();
      this.icon.moveTo(size, -size + 6);
      this.icon.lineTo(size - 6, -size + 6);
      this.icon.lineTo(size - 6, -size);
      this.icon.strokePath();
      
      // 左下角
      this.icon.beginPath();
      this.icon.moveTo(-size, size - 6);
      this.icon.lineTo(-size + 6, size - 6);
      this.icon.lineTo(-size + 6, size);
      this.icon.strokePath();
      
      // 右下角
      this.icon.beginPath();
      this.icon.moveTo(size - 6, size);
      this.icon.lineTo(size - 6, size - 6);
      this.icon.lineTo(size, size - 6);
      this.icon.strokePath();
    }
  }
  
  /**
   * 設置事件監聽
   */
  private setupEvents(): void {
    // 滑鼠事件
    this.container.on('pointerover', this.onPointerOver, this);
    this.container.on('pointerout', this.onPointerOut, this);
    this.container.on('pointerdown', this.onPointerDown, this);
    this.container.on('pointerup', this.onPointerUp, this);

    // 全螢幕狀態變化監聽
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));

    // 鍵盤快捷鍵 (F11)
    this.scene.input.keyboard?.on('keydown-F11', (event: KeyboardEvent) => {
      event.preventDefault();
      this.toggleFullscreen();
      this.showKeyboardHint('F11 快捷鍵已觸發');
    });

    // ESC 鍵退出全螢幕
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.isFullscreen) {
        this.exitFullscreen();
        this.showKeyboardHint('ESC 快捷鍵已觸發');
      }
    });

    // 添加鍵盤快捷鍵提示
    this.showInitialHint();
  }

  /**
   * 滑鼠懸停進入
   */
  private onPointerOver(): void {
    if (this.isHovered) return;

    this.isHovered = true;
    this.updateVisuals();
    this.playHoverAnimation();
    this.showTooltip();
  }

  /**
   * 滑鼠懸停離開
   */
  private onPointerOut(): void {
    if (!this.isHovered) return;

    this.isHovered = false;
    this.isPressed = false;
    this.updateVisuals();
    this.playNormalAnimation();
    this.hideTooltip();
  }

  /**
   * 滑鼠按下
   */
  private onPointerDown(): void {
    this.isPressed = true;
    this.updateVisuals();
    this.playClickAnimation();
  }

  /**
   * 滑鼠釋放
   */
  private onPointerUp(): void {
    if (this.isPressed) {
      this.isPressed = false;
      this.updateVisuals();
      this.toggleFullscreen();
    }
  }

  /**
   * 更新視覺效果
   */
  private updateVisuals(): void {
    this.drawBackground();
    this.drawIcon();
  }

  /**
   * 播放懸停動畫
   */
  private playHoverAnimation(): void {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: this.config.animations.hoverScale,
      scaleY: this.config.animations.hoverScale,
      duration: this.config.animations.duration,
      ease: 'Power2'
    });
  }

  /**
   * 播放正常動畫
   */
  private playNormalAnimation(): void {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: this.config.animations.duration,
      ease: 'Power2'
    });
  }

  /**
   * 播放點擊動畫
   */
  private playClickAnimation(): void {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: this.config.animations.clickScale,
      scaleY: this.config.animations.clickScale,
      duration: this.config.animations.duration / 2,
      ease: 'Power2',
      yoyo: true
    });
  }

  /**
   * 顯示工具提示
   */
  private showTooltip(): void {
    if (this.tooltip) return;

    const tooltipText = this.isFullscreen ? '退出全螢幕 (F11)' : '進入全螢幕 (F11)';

    // 創建工具提示背景
    const tooltipBg = this.scene.add.graphics();
    tooltipBg.fillStyle(0x000000, 0.8);
    tooltipBg.fillRoundedRect(-50, -15, 100, 30, 4);

    // 創建工具提示文字
    const tooltipTextObj = this.scene.add.text(0, 0, tooltipText, {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 創建工具提示容器
    this.tooltip = this.scene.add.container(
      this.container.x - 60,
      this.container.y - 40
    );
    this.tooltip.add([tooltipBg, tooltipTextObj]);
    this.tooltip.setDepth(1001);
    this.tooltip.setAlpha(0);

    // 淡入動畫
    this.scene.tweens.add({
      targets: this.tooltip,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  /**
   * 隱藏工具提示
   */
  private hideTooltip(): void {
    if (!this.tooltip) return;

    this.scene.tweens.add({
      targets: this.tooltip,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.tooltip?.destroy();
        this.tooltip = undefined;
      }
    });
  }

  /**
   * 懸停進入效果（舊方法，保持兼容性）
   */
  private onHover(): void {
    this.background.clear();
    this.background.fillStyle(this.config.colors.backgroundHover, 0.9);
    this.background.fillRoundedRect(
      -this.config.size / 2,
      -this.config.size / 2,
      this.config.size,
      this.config.size,
      this.config.cornerRadius
    );
    this.background.lineStyle(2, this.config.colors.iconHover, 0.8);
    this.background.strokeRoundedRect(
      -this.config.size / 2,
      -this.config.size / 2,
      this.config.size,
      this.config.size,
      this.config.cornerRadius
    );

    // 更新圖標顏色
    this.icon.clear();
    this.icon.lineStyle(2, this.config.colors.iconHover, 1);
    this.drawIcon();
    
    // 縮放效果
    this.container.setScale(1.1);
  }
  
  /**
   * 懸停離開效果
   */
  private onOut(): void {
    this.background.clear();
    this.background.fillStyle(this.config.colors.background, 0.7);
    this.background.fillRoundedRect(
      -this.config.size / 2,
      -this.config.size / 2,
      this.config.size,
      this.config.size,
      this.config.cornerRadius
    );
    this.background.lineStyle(2, 0xffffff, 0.3);
    this.background.strokeRoundedRect(
      -this.config.size / 2,
      -this.config.size / 2,
      this.config.size,
      this.config.size,
      this.config.cornerRadius
    );

    // 恢復圖標顏色
    this.icon.clear();
    this.icon.lineStyle(2, this.config.colors.icon, 1);
    this.drawIcon();
    
    // 恢復縮放
    this.container.setScale(1.0);
  }
  
  /**
   * 切換全螢幕模式（跨瀏覽器支援）
   */
  private async toggleFullscreen(): Promise<void> {
    try {
      if (!this.isFullscreen) {
        await this.enterFullscreen();
      } else {
        await this.exitFullscreen();
      }
    } catch (error) {
      this.handleFullscreenError(error);
    }
  }

  /**
   * 進入全螢幕模式
   */
  private async enterFullscreen(): Promise<void> {
    const element = document.documentElement;

    // 檢查瀏覽器支援
    if (!this.isFullscreenSupported()) {
      throw new Error('瀏覽器不支援全螢幕 API');
    }

    // 嘗試不同的 API
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }

    console.log('🖥️ 成功進入全螢幕模式');
    this.onFullscreenEnter();
  }

  /**
   * 退出全螢幕模式
   */
  private async exitFullscreen(): Promise<void> {
    // 嘗試不同的 API
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }

    console.log('🖥️ 成功退出全螢幕模式');
    this.onFullscreenExit();
  }

  /**
   * 檢查全螢幕 API 支援
   */
  private isFullscreenSupported(): boolean {
    const element = document.documentElement;
    return !!(
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen
    );
  }

  /**
   * 處理全螢幕錯誤
   */
  private handleFullscreenError(error: any): void {
    console.error('❌ 全螢幕操作失敗:', error);

    let errorMessage = '全螢幕操作失敗';
    let errorType = 'unknown';

    // 根據錯誤類型提供不同的處理
    if (error.name === 'NotAllowedError') {
      console.warn('⚠️ 全螢幕被用戶或瀏覽器政策阻止');
      errorMessage = '全螢幕功能被阻止，請檢查瀏覽器設定或嘗試用戶手動觸發';
      errorType = 'permission';
    } else if (error.name === 'TypeError') {
      console.warn('⚠️ 瀏覽器不支援全螢幕 API');
      errorMessage = '您的瀏覽器不支援全螢幕功能，請嘗試更新瀏覽器';
      errorType = 'unsupported';
    } else if (error.name === 'InvalidStateError') {
      console.warn('⚠️ 全螢幕狀態無效');
      errorMessage = '全螢幕狀態異常，請重新整理頁面';
      errorType = 'state';
    } else if (error.name === 'SecurityError') {
      console.warn('⚠️ 全螢幕安全限制');
      errorMessage = '安全限制阻止全螢幕，請確保在安全環境下操作';
      errorType = 'security';
    } else {
      console.warn('⚠️ 全螢幕操作遇到未知錯誤');
      errorMessage = '全螢幕操作失敗，請稍後再試或重新整理頁面';
      errorType = 'unknown';
    }

    // 顯示錯誤訊息
    this.showErrorMessage(errorMessage, errorType);

    // 記錄錯誤統計
    this.recordError(errorType, error.message);
  }

  /**
   * 記錄錯誤統計
   */
  private recordError(errorType: string, errorMessage: string): void {
    const count = this.errorStats.get(errorType) || 0;
    this.errorStats.set(errorType, count + 1);
    this.lastErrorTime = Date.now();

    console.log(`📊 錯誤統計 - ${errorType}: ${count + 1} 次`);

    // 如果錯誤頻繁，提供額外建議
    if (count >= 2) {
      this.showFrequentErrorAdvice(errorType);
    }
  }

  /**
   * 顯示頻繁錯誤建議
   */
  private showFrequentErrorAdvice(errorType: string): void {
    let advice = '';

    switch (errorType) {
      case 'permission':
        advice = '建議：在用戶手勢後再嘗試全螢幕，或檢查瀏覽器權限設定';
        break;
      case 'unsupported':
        advice = '建議：使用支援全螢幕 API 的現代瀏覽器';
        break;
      case 'state':
        advice = '建議：重新整理頁面或等待一段時間後再試';
        break;
      case 'security':
        advice = '建議：確保在 HTTPS 環境下使用，或檢查瀏覽器安全設定';
        break;
      default:
        advice = '建議：重新整理頁面或聯繫技術支援';
    }

    console.log(`💡 ${advice}`);
    this.showKeyboardHint(advice);
  }

  /**
   * 自動恢復機制
   */
  private attemptRecovery(): void {
    if (this.retryCount >= this.maxRetries) {
      console.log('⚠️ 已達到最大重試次數，停止自動恢復');
      return;
    }

    this.retryCount++;
    console.log(`🔄 嘗試自動恢復 (${this.retryCount}/${this.maxRetries})`);

    // 重置狀態
    this.checkFullscreenStatus();
    this.updateVisuals();

    // 延遲後重新嘗試
    setTimeout(() => {
      if (this.retryCount < this.maxRetries) {
        console.log('🔄 準備重新嘗試全螢幕操作');
      }
    }, 2000);
  }

  /**
   * 重置錯誤狀態
   */
  public resetErrorState(): void {
    this.errorStats.clear();
    this.retryCount = 0;
    this.lastErrorTime = 0;
    console.log('🔄 錯誤狀態已重置');
  }

  /**
   * 獲取錯誤統計
   */
  public getErrorStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    this.errorStats.forEach((count, type) => {
      stats[type] = count;
    });
    return stats;
  }

  /**
   * 顯示錯誤訊息
   */
  private showErrorMessage(message: string, errorType: string = 'unknown'): void {
    // 創建錯誤提示
    const errorTooltip = this.scene.add.container(
      this.container.x - 80,
      this.container.y - 60
    );

    const errorBg = this.scene.add.graphics();
    errorBg.fillStyle(0xff4444, 0.9);
    errorBg.fillRoundedRect(-70, -20, 140, 40, 6);

    const errorText = this.scene.add.text(0, 0, message, {
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 130 }
    }).setOrigin(0.5);

    errorTooltip.add([errorBg, errorText]);
    errorTooltip.setDepth(1002);

    // 3秒後自動消失
    this.scene.time.delayedCall(3000, () => {
      errorTooltip.destroy();
    });
  }

  /**
   * 進入全螢幕回調
   */
  private onFullscreenEnter(): void {
    // 觸發 Phaser 的 resize 事件
    setTimeout(() => {
      this.scene.scale.refresh();
      this.updatePosition();

      // 🎯 觸發響應式管理器更新所有元素（帶動畫）
      this.triggerResponsiveUpdate();
    }, 100);

    console.log('🎮 遊戲已進入全螢幕模式');
  }

  /**
   * 退出全螢幕回調
   */
  private onFullscreenExit(): void {
    // 觸發 Phaser 的 resize 事件
    setTimeout(() => {
      this.scene.scale.refresh();
      this.updatePosition();

      // 🎯 觸發響應式管理器更新所有元素（帶動畫）
      this.triggerResponsiveUpdate();
    }, 100);

    console.log('🎮 遊戲已退出全螢幕模式');
  }

  /**
   * 觸發響應式管理器更新
   */
  private triggerResponsiveUpdate(): void {
    // 檢查場景是否有響應式管理器
    const gameScene = this.scene as any;
    if (gameScene.responsiveManager && typeof gameScene.responsiveManager.forceUpdate === 'function') {
      console.log('🔄 觸發響應式管理器全域更新（帶平滑動畫）');
      gameScene.responsiveManager.forceUpdate(true);
    } else {
      console.log('⚠️ 響應式管理器未找到，跳過更新');
    }
  }

  /**
   * 顯示鍵盤快捷鍵提示
   */
  private showKeyboardHint(message: string): void {
    const hint = this.scene.add.container(
      this.container.x - 80,
      this.container.y - 80
    );

    const hintBg = this.scene.add.graphics();
    hintBg.fillStyle(0x4CAF50, 0.9);
    hintBg.fillRoundedRect(-60, -15, 120, 30, 6);

    const hintText = this.scene.add.text(0, 0, message, {
      fontSize: '11px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    hint.add([hintBg, hintText]);
    hint.setDepth(1003);
    hint.setAlpha(0);

    // 淡入動畫
    this.scene.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // 2秒後淡出
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: hint,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => hint.destroy()
          });
        });
      }
    });
  }

  /**
   * 顯示初始提示
   */
  private showInitialHint(): void {
    // 5秒後顯示快捷鍵提示
    this.scene.time.delayedCall(5000, () => {
      if (!this.isFullscreen) {
        this.showKeyboardHint('按 F11 進入全螢幕');
      }
    });

    // 15秒後顯示進階提示
    this.scene.time.delayedCall(15000, () => {
      if (!this.isFullscreen) {
        this.showAdvancedHints();
      }
    });
  }

  /**
   * 顯示進階提示
   */
  private showAdvancedHints(): void {
    const hints = [
      '💡 全螢幕模式可獲得更好的遊戲體驗',
      '🎮 支援鍵盤快捷鍵 F11 和 ESC',
      '📱 在不同設備上都能完美適配',
      '✨ 享受沉浸式的太空冒險'
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    this.showKeyboardHint(randomHint);
  }

  /**
   * 智能提示系統
   */
  private showSmartHints(): void {
    const gameScene = this.scene as any;

    // 根據遊戲狀態提供不同提示
    if (gameScene.score && gameScene.score > 100) {
      this.showKeyboardHint('🏆 分數不錯！全螢幕模式體驗更佳');
    } else if (gameScene.gameStarted) {
      this.showKeyboardHint('🎯 遊戲進行中，試試全螢幕模式');
    }
  }

  /**
   * 用戶行為分析
   */
  private analyzeUserBehavior(): void {
    const now = Date.now();

    // 如果用戶長時間懸停但未點擊
    if (this.isHovered) {
      this.scene.time.delayedCall(3000, () => {
        if (this.isHovered && !this.isFullscreen) {
          this.showKeyboardHint('點擊進入全螢幕，或按 F11');
        }
      });
    }

    // 如果用戶頻繁嘗試但失敗
    if (this.errorStats.size > 0) {
      this.showTroubleshootingTips();
    }
  }

  /**
   * 顯示故障排除提示
   */
  private showTroubleshootingTips(): void {
    const tips = [
      '🔧 如果全螢幕無法使用，請檢查瀏覽器設定',
      '🔄 嘗試重新整理頁面後再試',
      '🌐 建議使用 Chrome 或 Firefox 瀏覽器',
      '🔒 確保在安全的 HTTPS 環境下使用'
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];
    this.showKeyboardHint(tip);
  }

  /**
   * 顯示功能介紹
   */
  private showFeatureIntro(): void {
    const intro = this.scene.add.container(
      this.container.x - 120,
      this.container.y - 100
    );

    const introBg = this.scene.add.graphics();
    introBg.fillStyle(0x2196F3, 0.95);
    introBg.fillRoundedRect(-100, -40, 200, 80, 8);

    const introTitle = this.scene.add.text(0, -15, '🖥️ 全螢幕功能', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const introText = this.scene.add.text(0, 10, '點擊按鈕或按 F11\n獲得最佳遊戲體驗', {
      fontSize: '11px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    intro.add([introBg, introTitle, introText]);
    intro.setDepth(1004);
    intro.setAlpha(0);

    // 淡入動畫
    this.scene.tweens.add({
      targets: intro,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 4秒後淡出
        this.scene.time.delayedCall(4000, () => {
          this.scene.tweens.add({
            targets: intro,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => intro.destroy()
          });
        });
      }
    });
  }
  
  /**
   * 全螢幕狀態變化處理
   */
  private onFullscreenChange(): void {
    this.checkFullscreenStatus();
    this.drawIcon();

    console.log('🖥️ 全螢幕狀態變化:', {
      isFullscreen: this.isFullscreen,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      gameSize: {
        width: this.scene.scale.gameSize.width,
        height: this.scene.scale.gameSize.height
      }
    });

    // 🔧 關鍵修復：動態切換 Phaser Scale 模式並觸發響應式更新
    setTimeout(() => {
      // 🎯 使用 CSS 直接操作實現真正的全螢幕填滿
      console.log(`🎮 切換全螢幕模式: ${this.isFullscreen ? '填滿整個螢幕' : '恢復原始尺寸'}`);
      
      const canvas = this.scene.game.canvas;
      const gameContainer = canvas?.parentElement;
      
      if (this.isFullscreen) {
        console.log('🔥 進入真正全螢幕模式 - CSS 直接操作');
        
        // 🔥 終極解決方案：精確計算 transform scale 填滿螢幕
        if (canvas) {
          // 🎯 強制使用遊戲的標準尺寸，不依賴當前顯示尺寸
          const canvasWidth = 1274;  // 遊戲設計尺寸
          const canvasHeight = 739;  // 遊戲設計尺寸
          
          // 記錄實際的畫布顯示尺寸用於 debug
          const canvasRect = canvas.getBoundingClientRect();
          console.log(`📐 畫布實際顯示尺寸: ${canvasRect.width} x ${canvasRect.height}`);
          
          // 計算需要的縮放比例
          const scaleX = window.innerWidth / canvasWidth;
          const scaleY = window.innerHeight / canvasHeight;
          
          // 🎯 精確計算：使用剛好覆蓋的縮放比例，不過度縮放
          const scale = Math.max(scaleX, scaleY) * 1.05; // 只增加 5% 確保覆蓋，避免過度偏移
          
          console.log(`🎯 計算縮放詳細資訊:`);
          console.log(`   畫布尺寸: ${canvasWidth} x ${canvasHeight}`);
          console.log(`   螢幕尺寸: ${window.innerWidth} x ${window.innerHeight}`);
          console.log(`   螢幕比例: ${(window.innerWidth / window.innerHeight).toFixed(3)}`);
          console.log(`   遊戲比例: ${(canvasWidth / canvasHeight).toFixed(3)}`);
          console.log(`   scaleX: ${scaleX.toFixed(3)}, scaleY: ${scaleY.toFixed(3)}`);
          console.log(`   基礎scale: ${Math.max(scaleX, scaleY).toFixed(3)}`);
          console.log(`   最終scale: ${scale.toFixed(3)} (增加5%)`);
          
          // 🎯 精確定位：直接計算像素位置，並補償已知的 margin 偏移
          const scaledWidth = canvasWidth * scale;
          const scaledHeight = canvasHeight * scale;
          
          // 基礎居中位置
          let offsetX = (window.innerWidth - scaledWidth) / 2;
          let offsetY = (window.innerHeight - scaledHeight) / 2;
          
          // 🔧 補償已知的負 margin 偏移 (-371px left, -216px top)
          // 從診斷結果看，實際位置比設定位置多偏移了 371px (left) 和 216px (top)
          offsetX += 371; // 補償左側負 margin
          offsetY += 216; // 補償上方負 margin
          
          console.log(`🎯 精確定位計算:`);
          console.log(`   縮放後尺寸: ${scaledWidth.toFixed(1)} x ${scaledHeight.toFixed(1)}`);
          console.log(`   偏移量: x=${offsetX.toFixed(1)}, y=${offsetY.toFixed(1)}`);
          
          // 🔥 終極暴力修復：移除所有樣式，重新設置
          canvas.removeAttribute('style');
          
          // 🎯 檢測設備類型以應用最適合的修復方案
          const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1366 && 
                          (window.innerWidth < window.innerHeight || // 直向平板
                           (window.innerWidth > window.innerHeight && window.innerWidth <= 1366)); // 橫向平板
          
          // 強制設置關鍵樣式 - 使用 cssText 一次性設置所有樣式
          const cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            z-index: ${isTablet ? '10000' : '9999'} !important;
            object-fit: ${isTablet ? 'cover' : 'fill'} !important;
            object-position: center !important;
            display: block !important;
            visibility: visible !important;
            background: #000033 !important;
            transform: none !important;
            transform-origin: center center !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          `;
          
          canvas.style.cssText = cssText;
          
          // 🎯 平板設備專用處理
          if (isTablet) {
            console.log('🎯 檢測到平板設備，應用專用優化');
            
            // 設置 viewport meta
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
              viewportMeta = document.createElement('meta');
              viewportMeta.name = 'viewport';
              document.head.appendChild(viewportMeta);
            }
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
            
            // 強化 body 和 html 設置
            document.body.style.cssText = `
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              width: 100vw !important;
              height: 100vh !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
            `;
            
            document.documentElement.style.cssText = `
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              width: 100vw !important;
              height: 100vh !important;
            `;
          }
          
          console.log(`🔥 強制設置樣式: top=${offsetY}px, left=${offsetX}px, width=${scaledWidth}px, height=${scaledHeight}px`);
          
          // 🚨 強制清除任何可能的負 margin，並使用觀察器持續監控
          const fixMargin = () => {
            const currentMargin = canvas.style.margin;
            if (currentMargin !== '0px' && currentMargin !== '0' && currentMargin !== '') {
              console.log(`🚨 檢測到錯誤 margin: ${currentMargin}，強制修正`);
              canvas.style.setProperty('margin', '0', 'important');
              canvas.style.setProperty('margin-top', '0', 'important');
              canvas.style.setProperty('margin-left', '0', 'important');
              canvas.style.setProperty('margin-right', '0', 'important');
              canvas.style.setProperty('margin-bottom', '0', 'important');
            }
          };
          
          // 立即執行一次
          fixMargin();
          
          // 每 100ms 檢查一次，持續 3 秒
          const fixInterval = setInterval(fixMargin, 100);
          setTimeout(() => {
            clearInterval(fixInterval);
            console.log(`🔥 margin 監控已停止`);
          }, 3000);
          
          // 🔥 不使用 transform，直接設置尺寸
          canvas.style.transform = 'none';
          canvas.style.transformOrigin = 'center center';
          
          // 🔥 額外保險：設置 overflow hidden 確保沒有滾動條
          canvas.style.overflow = 'hidden';
          
          // 確保顯示
          canvas.style.display = 'block';
          canvas.style.visibility = 'visible';
          
          // 設置背景色避免空隙
          canvas.style.background = '#000033';
          
          console.log(`🔥 應用直接定位: top=${offsetY.toFixed(1)}px, left=${offsetX.toFixed(1)}px, size=${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`);
          
          // 🔍 驗證最終覆蓋範圍
          setTimeout(() => {
            console.log(`🔍 最終覆蓋驗證:`);
            console.log(`   畫布位置: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
            console.log(`   畫布尺寸: ${scaledWidth.toFixed(1)} x ${scaledHeight.toFixed(1)}`);
            console.log(`   螢幕尺寸: ${window.innerWidth} x ${window.innerHeight}`);
            console.log(`   完全覆蓋: ${scaledWidth >= window.innerWidth && scaledHeight >= window.innerHeight ? '✅' : '❌'}`);
            console.log(`   是否居中: ${Math.abs(offsetX) < 1 && Math.abs(offsetY) < 1 ? '✅' : '❌'}`);
          }, 100);
        }
        
        // 🎯 檢測設備類型並設置對應的容器樣式
        const isTabletDevice = window.innerWidth >= 768 && window.innerWidth <= 1366;
        
        // 設置遊戲容器和所有父容器 - 使用 cssText 強制設置
        let container = gameContainer;
        while (container && container !== document.body) {
          const containerCssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
            z-index: ${isTabletDevice ? '9999' : '9998'} !important;
            background: transparent !important;
            transform: none !important;
            box-sizing: border-box !important;
          `;
          
          container.style.cssText = containerCssText;
          console.log(`🎯 設置容器: ${container.tagName}#${container.id} (${isTabletDevice ? '平板' : '桌面'}模式)`);
          
          // 移動到父容器
          container = container.parentElement as HTMLElement;
        }
        
        // 🚀 設置 body 和 html 以避免滾動條和邊距
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.background = '#000033'; // 設置背景色以防止空隙
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.background = '#000033';
        
        // 🎯 讓 Phaser 保持原始尺寸，由 CSS 負責拉伸顯示
        this.scene.scale.scaleMode = Phaser.Scale.NONE;
        
        // 不改變 Phaser 的內部遊戲尺寸，保持 1274x739
        // 這樣遊戲邏輯保持不變，只是顯示被 CSS 拉伸
        
        console.log(`🎯 保持 Phaser 原始尺寸，CSS 負責顯示拉伸`);
        
      } else {
        console.log('🔄 退出全螢幕模式 - 恢復原始樣式');
        
        // 🔄 恢復所有修改過的樣式
        if (canvas) {
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.width = '';
          canvas.style.height = '';
          canvas.style.zIndex = '';
          canvas.style.margin = '';
          canvas.style.padding = '';
          canvas.style.border = '';
          canvas.style.outline = '';
          canvas.style.background = '';
          canvas.style.transform = '';
          canvas.style.transformOrigin = '';
          canvas.style.overflow = '';
          canvas.style.visibility = '';
          canvas.style.display = '';
          
          console.log('🔄 恢復畫布原始樣式');
        }
        
        // 恢復所有容器樣式
        let container = gameContainer;
        while (container) {
          container.style.position = '';
          container.style.top = '';
          container.style.left = '';
          container.style.width = '';
          container.style.height = '';
          container.style.zIndex = '';
          container.style.margin = '';
          container.style.padding = '';
          container.style.overflow = '';
          container.style.background = '';
          
          container = container.parentElement as HTMLElement;
          if (container === document.body || container === document.documentElement) break;
        }
        
        // 恢復 body 和 html 樣式
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.body.style.overflow = '';
        document.body.style.background = '';
        document.documentElement.style.margin = '';
        document.documentElement.style.padding = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.background = '';
        
        // 🔄 恢復原始遊戲尺寸和模式
        this.scene.scale.scaleMode = Phaser.Scale.FIT;
        this.scene.scale.setGameSize(1274, 739);
        
        console.log('🔄 恢復原始遊戲模式: FIT 1274 x 739');
      }
      
      // 🚀 刷新 Phaser Scale Manager
      this.scene.scale.refresh();

      // 🚀 多重強制更新響應式管理器，確保所有元素都正確調整
      const gameScene = this.scene as any;
      if (gameScene.responsiveManager) {
        console.log('🔄 觸發響應式管理器多重強制更新...');
        
        // 第一次立即更新
        gameScene.responsiveManager.forceUpdate(true);
        
        // 延遲再次更新，確保所有元素都被重新計算
        setTimeout(() => {
          gameScene.responsiveManager.forceUpdate(true);
          console.log('🔄 第二次響應式更新完成');
        }, 100);
        
        // 最終更新
        setTimeout(() => {
          gameScene.responsiveManager.forceUpdate(true);
          console.log('✅ 最終響應式管理器更新完成');
        }, 300);
      } else {
        console.warn('⚠️ 響應式管理器不存在');
      }

      // 🎯 強制觸發 Phaser 的 resize 事件
      this.scene.events.emit('resize', this.scene.scale.gameSize);
      
      // 更新按鈕位置（延遲以確保所有元素都已更新）
      setTimeout(() => {
      this.updatePosition();
        console.log('🎯 全螢幕按鈕位置更新完成');
      }, 150);

      console.log('🎯 Phaser 3 全螢幕自適應處理完成');
    }, 200); // 增加延遲確保瀏覽器全螢幕切換完成
  }
  
  /**
   * 檢查當前全螢幕狀態
   */
  private checkFullscreenStatus(): void {
    this.isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }
  
  /**
   * 更新按鈕位置（右下角）
   */
  public updatePosition(): void {
    const gameSize = this.scene.scale.gameSize;
    const x = gameSize.width - this.config.size / 2 - 16;
    const y = gameSize.height - this.config.size / 2 - 16;

    this.container.setPosition(x, y);
  }
  
  /**
   * 銷毀按鈕
   */
  public destroy(): void {
    // 移除事件監聽
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
    
    // 銷毀容器
    this.container.destroy();
    
    console.log('🗑️ 全螢幕按鈕已銷毀');
  }
}
