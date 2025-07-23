import Phaser from 'phaser';
import { PlaneConfig } from '../types/planes';
import { Button, ButtonStyles } from './components/Button';
import { Panel, PanelStyles } from './components/Panel';
import { PlaneRenderer } from '../planes/PlaneRenderer';

export interface PlaneSelectorConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  planes: PlaneConfig[];
  columns?: number;
  spacing?: number;
}

export class PlaneSelector extends Phaser.GameObjects.Container {
  private config: PlaneSelectorConfig;
  private planeButtons: Button[] = [];
  private selectedIndex: number = 0;
  private backgroundPanel: Panel;
  private planeRenderer: PlaneRenderer;
  private planeGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();

  constructor(scene: Phaser.Scene, config: PlaneSelectorConfig) {
    super(scene, config.x, config.y);
    
    this.config = {
      columns: 4,
      spacing: 10,
      ...config
    };

    this.planeRenderer = new PlaneRenderer(scene);

    // 創建背景面板
    this.backgroundPanel = new Panel(scene, {
      x: 0,
      y: 0,
      width: this.config.width,
      height: this.config.height,
      title: '🛩️ 選擇您的飛機',
      ...PanelStyles.DEFAULT
    });
    this.add(this.backgroundPanel);

    // 創建飛機按鈕
    this.createPlaneButtons();

    // 選擇第一架飛機
    this.selectPlane(0);

    // 添加到場景
    scene.add.existing(this);
  }

  private createPlaneButtons() {
    const contentBounds = this.backgroundPanel.getContentBounds();
    const buttonWidth = (contentBounds.width - (this.config.columns! - 1) * this.config.spacing!) / this.config.columns!;
    const buttonHeight = 80;
    const rows = Math.ceil(this.config.planes.length / this.config.columns!);
    const totalHeight = rows * buttonHeight + (rows - 1) * this.config.spacing!;
    const startY = contentBounds.y + (contentBounds.height - totalHeight) / 2;

    this.config.planes.forEach((plane, index) => {
      const row = Math.floor(index / this.config.columns!);
      const col = index % this.config.columns!;
      
      const x = contentBounds.x + col * (buttonWidth + this.config.spacing!) + buttonWidth / 2;
      const y = startY + row * (buttonHeight + this.config.spacing!) + buttonHeight / 2;

      // 創建飛機圖形
      const planeGraphics = this.scene.add.graphics();
      this.planeRenderer.renderPlane(planeGraphics, plane);
      planeGraphics.setScale(0.6);
      this.planeGraphics.set(plane.id, planeGraphics);

      // 創建按鈕
      const button = new Button(this.scene, {
        x: x,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        text: '',
        ...ButtonStyles.SECONDARY
      });

      // 添加飛機圖形到按鈕
      button.add(planeGraphics);
      planeGraphics.setPosition(0, -10);

      // 添加飛機名稱
      const nameText = this.scene.add.text(0, 25, plane.displayName, {
        fontSize: '12px',
        color: '#ecf0f1',
        fontFamily: 'Arial',
        align: 'center'
      });
      nameText.setOrigin(0.5);
      button.add(nameText);

      // 設置點擊事件
      button.on('click', () => {
        this.selectPlane(index);
        this.emit('plane-selected', plane, index);
      });

      this.planeButtons.push(button);
      this.backgroundPanel.addContent(button);
    });
  }

  public selectPlane(index: number): void {
    if (index < 0 || index >= this.config.planes.length) return;

    // 更新之前選中的按鈕
    if (this.planeButtons[this.selectedIndex]) {
      this.planeButtons[this.selectedIndex].setBackgroundColor(ButtonStyles.SECONDARY.backgroundColor!);
    }

    // 更新新選中的按鈕
    this.selectedIndex = index;
    if (this.planeButtons[this.selectedIndex]) {
      this.planeButtons[this.selectedIndex].setBackgroundColor(ButtonStyles.PRIMARY.backgroundColor!);
    }

    console.log(`✈️ 選擇飛機: ${this.config.planes[index].displayName}`);
  }

  public getSelectedPlane(): PlaneConfig {
    return this.config.planes[this.selectedIndex];
  }

  public getSelectedIndex(): number {
    return this.selectedIndex;
  }

  public setPlanes(planes: PlaneConfig[]): void {
    this.config.planes = planes;
    
    // 清除現有按鈕
    this.planeButtons.forEach(button => button.destroy());
    this.planeButtons = [];
    this.planeGraphics.clear();
    this.backgroundPanel.clearContent();

    // 重新創建按鈕
    this.createPlaneButtons();
    this.selectPlane(0);
  }

  public setEnabled(enabled: boolean): void {
    this.planeButtons.forEach(button => {
      button.setEnabled(enabled);
    });
  }

  public highlightPlane(index: number, _duration: number = 1000): void {
    if (index < 0 || index >= this.planeButtons.length) return;

    const button = this.planeButtons[index];
    const originalScale = button.scaleX;

    // 創建高亮動畫
    this.scene.tweens.add({
      targets: button,
      scaleX: originalScale * 1.2,
      scaleY: originalScale * 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });

    // 創建顏色閃爍效果
    const originalColor = ButtonStyles.SECONDARY.backgroundColor!;
    const highlightColor = 0xf39c12;

    this.scene.tweens.add({
      targets: { color: originalColor },
      color: highlightColor,
      duration: 100,
      yoyo: true,
      repeat: 4,
      onUpdate: (tween) => {
        button.setBackgroundColor(Math.floor(tween.getValue() || 0));
      },
      onComplete: () => {
        if (index !== this.selectedIndex) {
          button.setBackgroundColor(originalColor);
        }
      }
    });
  }

  public animateIn(): void {
    // 設置初始狀態
    this.setAlpha(0);
    this.setScale(0.8);

    // 淡入動畫
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 按鈕依次出現動畫
    this.planeButtons.forEach((button, index) => {
      button.setAlpha(0);
      button.setScale(0);

      this.scene.tweens.add({
        targets: button,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        delay: index * 50,
        ease: 'Back.easeOut'
      });
    });
  }

  public animateOut(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 300,
        ease: 'Power2.easeIn',
        onComplete: () => resolve()
      });
    });
  }

  public destroy(fromScene?: boolean): void {
    this.planeButtons.forEach(button => button.destroy());
    this.planeGraphics.forEach(graphics => graphics.destroy());
    this.planeGraphics.clear();
    this.planeRenderer.destroy();
    super.destroy(fromScene);
  }
}
