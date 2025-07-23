import Phaser from 'phaser';
import { PlaneConfig } from '../types/planes';
import { Panel, PanelStyles } from './components/Panel';

export interface GameHUDConfig {
  scene: Phaser.Scene;
  selectedPlane: PlaneConfig;
}

export class GameHUD extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene; // 使用 declare 避免與父類衝突
  private selectedPlane: PlaneConfig;

  // UI 元素
  private scorePanel!: Panel;
  private planeInfoPanel!: Panel;
  private healthBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private planeNameText!: Phaser.GameObjects.Text;
  private planeStatsText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  
  // 遊戲數據
  private currentScore: number = 0;
  private currentHealth: number = 100;
  private maxHealth: number = 100;

  constructor(config: GameHUDConfig) {
    super(config.scene, 0, 0);
    
    this.scene = config.scene;
    this.selectedPlane = config.selectedPlane;
    this.maxHealth = config.selectedPlane.health;
    this.currentHealth = this.maxHealth;

    this.createHUD();
    this.updateDisplay();

    // 添加到場景 - 使用類型斷言
    this.scene.add.existing(this as any);
    this.setScrollFactor(0); // 固定在螢幕上
  }

  private createHUD() {
    const { width } = this.scene.cameras.main;

    // 創建分數面板 (左上角)
    this.scorePanel = new Panel(this.scene, {
      x: 120,
      y: 50,
      width: 200,
      height: 80,
      title: '🎯 分數',
      ...PanelStyles.DEFAULT
    });
    this.add(this.scorePanel);

    // 分數文字
    this.scoreText = this.scene.add.text(0, 0, '0', {
      fontSize: '24px',
      color: '#f39c12',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);
    this.scorePanel.addContent(this.scoreText);

    // 創建飛機資訊面板 (右上角)
    this.planeInfoPanel = new Panel(this.scene, {
      x: width - 150,
      y: 80,
      width: 250,
      height: 120,
      title: '✈️ 飛機資訊',
      ...PanelStyles.DEFAULT
    });
    this.add(this.planeInfoPanel);

    // 飛機名稱
    this.planeNameText = this.scene.add.text(0, -20, this.selectedPlane.displayName, {
      fontSize: '16px',
      color: '#3498db',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.planeNameText.setOrigin(0.5);
    this.planeInfoPanel.addContent(this.planeNameText);

    // 飛機統計
    this.planeStatsText = this.scene.add.text(0, 10, this.getPlaneStatsText(), {
      fontSize: '12px',
      color: '#ecf0f1',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.planeStatsText.setOrigin(0.5);
    this.planeInfoPanel.addContent(this.planeStatsText);

    // 創建生命值條 (左下角)
    this.createHealthBar();
  }

  private createHealthBar() {
    const { height } = this.scene.cameras.main;
    
    // 生命值背景
    const healthBg = this.scene.add.graphics();
    healthBg.fillStyle(0x2c3e50, 0.8);
    healthBg.fillRoundedRect(20, height - 60, 200, 30, 5);
    healthBg.lineStyle(2, 0x34495e);
    healthBg.strokeRoundedRect(20, height - 60, 200, 30, 5);
    this.add(healthBg);

    // 生命值條
    this.healthBar = this.scene.add.graphics();
    this.add(this.healthBar);

    // 生命值文字
    this.healthText = this.scene.add.text(120, height - 45, 'HP: 100/100', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);
    this.add(this.healthText);

    // 生命值標籤
    const healthLabel = this.scene.add.text(25, height - 75, '❤️ 生命值', {
      fontSize: '12px',
      color: '#e74c3c',
      fontFamily: 'Arial'
    });
    this.add(healthLabel);
  }

  private getPlaneStatsText(): string {
    return [
      `速度: ${this.selectedPlane.speed}`,
      `射擊: ${this.selectedPlane.fireRate}ms`,
      `傷害: ${this.selectedPlane.damage}`
    ].join('\n');
  }

  private updateDisplay() {
    // 更新分數
    this.scoreText.setText(this.currentScore.toString());

    // 更新生命值條
    this.updateHealthBar();

    // 更新生命值文字
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);
  }

  private updateHealthBar() {
    const { height } = this.scene.cameras.main;
    const healthPercentage = this.currentHealth / this.maxHealth;
    const barWidth = 196; // 200 - 4 (邊框)
    const currentWidth = barWidth * healthPercentage;

    this.healthBar.clear();

    // 根據生命值百分比選擇顏色
    let healthColor = 0x27ae60; // 綠色
    if (healthPercentage < 0.6) healthColor = 0xf39c12; // 橙色
    if (healthPercentage < 0.3) healthColor = 0xe74c3c; // 紅色

    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRoundedRect(22, height - 58, currentWidth, 26, 3);

    // 添加閃爍效果（生命值低時）
    if (healthPercentage < 0.2) {
      this.scene.tweens.add({
        targets: this.healthBar,
        alpha: 0.3,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.healthBar.setAlpha(1);
      this.scene.tweens.killTweensOf(this.healthBar);
    }
  }

  // 公共方法
  public updateScore(score: number): void {
    const oldScore = this.currentScore;
    this.currentScore = score;
    
    // 分數增加動畫
    if (score > oldScore) {
      this.scene.tweens.add({
        targets: this.scoreText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 150,
        yoyo: true,
        ease: 'Power2'
      });

      // 分數變化效果
      this.scene.tweens.add({
        targets: { value: oldScore },
        value: score,
        duration: 500,
        onUpdate: (tween) => {
          this.scoreText.setText(Math.floor(tween.getValue() || 0).toString());
        }
      });
    } else {
      this.updateDisplay();
    }
  }

  public updateHealth(health: number): void {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
    
    // 生命值減少時的震動效果
    if (this.currentHealth < oldHealth) {
      this.scene.cameras.main.shake(200, 0.01);
      
      // 紅色閃爍效果
      const redOverlay = this.scene.add.rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0xff0000,
        0.3
      );
      redOverlay.setScrollFactor(0);

      this.scene.tweens.add({
        targets: redOverlay,
        alpha: 0,
        duration: 300,
        onComplete: () => redOverlay.destroy()
      });
    }

    this.updateDisplay();
  }

  public setPlane(plane: PlaneConfig): void {
    this.selectedPlane = plane;
    this.maxHealth = plane.health;
    this.currentHealth = this.maxHealth;
    
    this.planeNameText.setText(plane.displayName);
    this.planeStatsText.setText(this.getPlaneStatsText());
    this.updateDisplay();
  }

  public showMessage(message: string, duration: number = 2000): void {
    const { width, height } = this.scene.cameras.main;
    
    const messageText = this.scene.add.text(width / 2, height / 2 - 100, message, {
      fontSize: '32px',
      color: '#f39c12',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#2c3e50',
      strokeThickness: 4
    });
    messageText.setOrigin(0.5);
    messageText.setScrollFactor(0);
    messageText.setAlpha(0);

    // 淡入動畫
    this.scene.tweens.add({
      targets: messageText,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 淡出動畫
    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: messageText,
        alpha: 0,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 300,
        onComplete: () => messageText.destroy()
      });
    });
  }

  public getCurrentScore(): number {
    return this.currentScore;
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public isHealthLow(): boolean {
    return (this.currentHealth / this.maxHealth) < 0.3;
  }
}
