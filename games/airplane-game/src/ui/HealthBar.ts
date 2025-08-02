/**
 * 血條 UI 組件
 * 用於顯示玩家的生命值，替代原本的文字顯示
 */
export class HealthBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Graphics;
  private border: Phaser.GameObjects.Graphics;
  private healthText: Phaser.GameObjects.Text;
  private heartIcon: Phaser.GameObjects.Graphics;
  
  private maxHealth: number = 100;
  private currentHealth: number = 100;
  private barWidth: number = 200;
  private barHeight: number = 20;
  
  // 血條顏色配置
  private colors = {
    background: 0x333333,
    border: 0x000000,
    healthy: 0x00ff00,    // 綠色 (80-100%)
    warning: 0xffff00,    // 黃色 (40-79%)
    danger: 0xff6600,     // 橙色 (20-39%)
    critical: 0xff0000    // 紅色 (0-19%)
  };
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // 創建容器
    this.container = scene.add.container(x, y);
    this.container.setDepth(100);
    
    this.createHealthBar();
    this.createHeartIcon();
    this.createHealthText();
    
    console.log('❤️ 血條組件已創建');
  }
  
  /**
   * 創建血條圖形
   */
  private createHealthBar(): void {
    // 背景
    this.background = this.scene.add.graphics();
    this.background.fillStyle(this.colors.background);
    this.background.fillRoundedRect(0, 0, this.barWidth, this.barHeight, 5);
    
    // 血條
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBarColor();
    this.healthBar.fillRoundedRect(2, 2, this.barWidth - 4, this.barHeight - 4, 3);
    
    // 邊框
    this.border = this.scene.add.graphics();
    this.border.lineStyle(2, this.colors.border);
    this.border.strokeRoundedRect(0, 0, this.barWidth, this.barHeight, 5);
    
    // 添加到容器
    this.container.add([this.background, this.healthBar, this.border]);
  }
  
  /**
   * 創建愛心圖標
   */
  private createHeartIcon(): void {
    this.heartIcon = this.scene.add.graphics();
    
    // 繪製愛心形狀
    this.heartIcon.fillStyle(0xff0000);
    this.heartIcon.beginPath();
    
    // 愛心的數學路徑
    const heartSize = 8;
    const heartX = -25;
    const heartY = this.barHeight / 2;
    
    // 左半圓
    this.heartIcon.arc(heartX - heartSize/4, heartY - heartSize/4, heartSize/2, 0, Math.PI, true);
    // 右半圓
    this.heartIcon.arc(heartX + heartSize/4, heartY - heartSize/4, heartSize/2, 0, Math.PI, true);
    // 底部三角形
    this.heartIcon.lineTo(heartX, heartY + heartSize/2);
    this.heartIcon.closePath();
    this.heartIcon.fillPath();
    
    this.container.add(this.heartIcon);
  }
  
  /**
   * 創建血量文字
   */
  private createHealthText(): void {
    this.healthText = this.scene.add.text(
      this.barWidth + 10, 
      this.barHeight / 2, 
      `${this.currentHealth}/${this.maxHealth}`, 
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.healthText.setOrigin(0, 0.5);
    
    this.container.add(this.healthText);
  }
  
  /**
   * 更新血條顏色
   */
  private updateHealthBarColor(): void {
    const healthPercentage = (this.currentHealth / this.maxHealth) * 100;
    let color: number;
    
    if (healthPercentage >= 80) {
      color = this.colors.healthy;
    } else if (healthPercentage >= 40) {
      color = this.colors.warning;
    } else if (healthPercentage >= 20) {
      color = this.colors.danger;
    } else {
      color = this.colors.critical;
    }
    
    this.healthBar.clear();
    this.healthBar.fillStyle(color);
    
    // 計算血條寬度
    const healthWidth = ((this.barWidth - 4) * this.currentHealth) / this.maxHealth;
    this.healthBar.fillRoundedRect(2, 2, healthWidth, this.barHeight - 4, 3);
  }
  
  /**
   * 更新生命值
   * @param health 當前生命值
   * @param animated 是否使用動畫效果
   */
  public updateHealth(health: number, animated: boolean = true): void {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
    
    console.log(`❤️ 血條更新: ${oldHealth} → ${this.currentHealth}`);
    
    if (animated && oldHealth !== this.currentHealth) {
      this.animateHealthChange(oldHealth, this.currentHealth);
    } else {
      this.updateHealthBarColor();
      this.updateHealthText();
    }
    
    // 生命值過低時的警告效果
    if (this.currentHealth <= 20 && this.currentHealth > 0) {
      this.startCriticalHealthEffect();
    }
  }
  
  /**
   * 動畫效果更新血條
   */
  private animateHealthChange(fromHealth: number, toHealth: number): void {
    const duration = 500; // 動畫持續時間
    
    this.scene.tweens.add({
      targets: { health: fromHealth },
      health: toHealth,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        const currentValue = Math.round(tween.targets[0].health);
        this.currentHealth = currentValue;
        this.updateHealthBarColor();
        this.updateHealthText();
      },
      onComplete: () => {
        console.log('❤️ 血條動畫完成');
      }
    });
    
    // 受傷時的震動效果
    if (toHealth < fromHealth) {
      this.scene.tweens.add({
        targets: this.container,
        x: this.container.x + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
  }
  
  /**
   * 更新血量文字
   */
  private updateHealthText(): void {
    this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    
    // 根據血量調整文字顏色
    const healthPercentage = (this.currentHealth / this.maxHealth) * 100;
    if (healthPercentage <= 20) {
      this.healthText.setColor('#ff0000'); // 紅色
    } else if (healthPercentage <= 40) {
      this.healthText.setColor('#ff6600'); // 橙色
    } else {
      this.healthText.setColor('#ffffff'); // 白色
    }
  }
  
  /**
   * 危險血量閃爍效果
   */
  private startCriticalHealthEffect(): void {
    // 停止之前的閃爍效果
    this.scene.tweens.killTweensOf(this.healthBar);
    
    // 開始閃爍
    this.scene.tweens.add({
      targets: this.healthBar,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });
  }
  
  /**
   * 停止危險血量效果
   */
  private stopCriticalHealthEffect(): void {
    this.scene.tweens.killTweensOf(this.healthBar);
    this.healthBar.setAlpha(1);
  }
  
  /**
   * 設置血條位置
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
  
  /**
   * 設置血條可見性
   */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
  
  /**
   * 銷毀血條
   */
  public destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.healthBar);
    this.container.destroy();
    console.log('❤️ 血條組件已銷毀');
  }
  
  /**
   * 獲取當前生命值
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }
  
  /**
   * 獲取最大生命值
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * 獲取容器（用於響應式管理器）
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
  
  /**
   * 設置最大生命值
   */
  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    this.updateHealthBarColor();
    this.updateHealthText();
  }
}
