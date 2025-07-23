import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/gameConfig';
import { ALL_PLANE_CONFIGS } from '../../planes/configs/index';
import { PlaneManager } from '../../planes/PlaneManager';
import { PlaneSelector } from '../../ui/PlaneSelector';
import { Panel, PanelStyles } from '../../ui/components/Panel';
import { PlaneConfig } from '../../types/planes';

export class MenuScene extends Phaser.Scene {
  private selectedPlaneIndex: number = 0;
  private planeSelector!: PlaneSelector;
  private planeDetailPanel!: Panel;
  private planeManager!: PlaneManager;

  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create() {
    console.log('🎮 MenuScene: 創建選單場景');

    const { width, height } = this.cameras.main;

    // 設置背景
    this.add.image(width / 2, height / 2, 'background-placeholder');

    // 創建標題
    this.createTitle();

    // 創建直接開始按鈕（不再需要飛機選擇）
    this.createDirectStartButton();
  }

  private createDirectStartButton() {
    const { width, height } = this.cameras.main;

    // 創建大型開始按鈕
    const startButton = this.add.rectangle(width / 2, height / 2, 300, 80, 0x4CAF50)
      .setInteractive()
      .setStrokeStyle(3, 0x45a049);

    const startText = this.add.text(width / 2, height / 2, '🎯 開始射手冒險', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 按鈕懸停效果
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x45a049);
      startText.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x4CAF50);
      startText.setScale(1.0);
    });

    // 點擊直接開始遊戲
    startButton.on('pointerdown', () => {
      console.log('🎯 直接開始射手遊戲');
      this.scene.start(SCENE_KEYS.GAME);
    });
  }

  private createTitle() {
    const { width } = this.cameras.main;

    this.add.text(width / 2, 60, '� 太空梭森林冒險', {
      fontSize: '36px',
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加陰影效果
    this.add.text(width / 2 + 2, 62, '� 太空梭森林冒險', {
      fontSize: '36px',
      color: '#34495e',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(-1);

    // 添加副標題
    this.add.text(width / 2, 100, '駕駛太空梭穿越神秘森林', {
      fontSize: '18px',
      color: '#7f8c8d',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createModernPlaneSelector() {
    const { width, height } = this.cameras.main;

    this.planeSelector = new PlaneSelector(this, {
      x: width / 2,
      y: height / 2 - 20,
      width: 600,
      height: 200,
      planes: ALL_PLANE_CONFIGS,
      columns: 4,
      spacing: 10
    });

    // 監聽飛機選擇事件
    this.planeSelector.on('plane-selected', (plane: PlaneConfig, index: number) => {
      this.selectedPlaneIndex = index;
      this.planeManager.setCurrentPlane(plane.id);
      this.updatePlaneDetailPanel(plane);
    });
  }

  private createPlaneDetailPanel() {
    const { width, height } = this.cameras.main;

    this.planeDetailPanel = new Panel(this, {
      x: width / 2,
      y: height - 120,
      width: 500,
      height: 100,
      title: '✈️ 飛機詳細資訊',
      ...PanelStyles.DARK
    });

    // 初始顯示第一架飛機的資訊
    this.updatePlaneDetailPanel(ALL_PLANE_CONFIGS[0]);
  }

  private updatePlaneDetailPanel(plane: PlaneConfig) {
    // 清除舊內容
    this.planeDetailPanel.clearContent();

    // 飛機名稱和描述
    const nameText = this.add.text(0, -20, plane.displayName, {
      fontSize: '18px',
      color: '#3498db',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const descText = this.add.text(0, 0, plane.description, {
      fontSize: '14px',
      color: '#ecf0f1',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 性能統計
    const statsText = this.add.text(0, 20,
      `速度: ${plane.speed} | 射擊: ${plane.fireRate}ms | 生命: ${plane.health} | 傷害: ${plane.damage}`, {
      fontSize: '12px',
      color: '#f39c12',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.planeDetailPanel.addContent(nameText);
    this.planeDetailPanel.addContent(descText);
    this.planeDetailPanel.addContent(statsText);
  }

  private createModernStartButton() {
    const { width, height } = this.cameras.main;

    // 創建簡單的開始按鈕
    const buttonBg = this.add.rectangle(width / 2, height - 50, 200, 50, 0xe74c3c)
      .setStrokeStyle(2, 0xc0392b);

    const buttonText = this.add.text(width / 2, height - 50, '🚀 開始遊戲', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 設置互動
    buttonBg.setInteractive()
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => {
        buttonBg.setFillStyle(0xc0392b);
        buttonBg.setScale(1.1);
        buttonText.setScale(1.1);
      })
      .on('pointerout', () => {
        buttonBg.setFillStyle(0xe74c3c);
        buttonBg.setScale(1);
        buttonText.setScale(1);
      });
  }

  private playEntranceAnimation() {
    // 飛機選擇器入場動畫
    this.planeSelector.animateIn();

    // 詳細面板入場動畫
    this.planeDetailPanel.setAlpha(0);
    this.planeDetailPanel.setY(this.planeDetailPanel.y + 50);

    this.tweens.add({
      targets: this.planeDetailPanel,
      alpha: 1,
      y: this.planeDetailPanel.y - 50,
      duration: 600,
      delay: 300,
      ease: 'Power2.easeOut'
    });

    // 開始按鈕入場動畫已在 createModernStartButton 中處理
  }

  private onPlaneSelected(event: any) {
    console.log('飛機選擇事件:', event);
  }

  // 移除重複的舊方法，使用新的現代化組件
  // private selectPlane(index: number): void {
  //   if (index < 0 || index >= ALL_PLANE_CONFIGS.length) return;
  //
  //   this.selectedPlaneIndex = index;
  //   const selectedPlane = ALL_PLANE_CONFIGS[index];
  //   this.planeManager.setCurrentPlane(selectedPlane.id);
  //   this.updatePlaneDetailPanel(selectedPlane);
  //
  //   console.log(`✈️ 選擇飛機: ${selectedPlane.displayName}`);
  // }

  private startGame() {
    console.log(`🚀 開始遊戲，使用飛機: ${ALL_PLANE_CONFIGS[this.selectedPlaneIndex].displayName}`);

    // 傳遞選中的飛機配置到遊戲場景
    this.scene.start(SCENE_KEYS.GAME, {
      selectedPlane: ALL_PLANE_CONFIGS[this.selectedPlaneIndex]
    });
  }
}

