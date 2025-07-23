import Phaser from 'phaser';

export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  style?: Phaser.Types.GameObjects.Text.TextStyle;
  backgroundColor?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
  hoverColor?: number;
  pressedColor?: number;
  disabled?: boolean;
}

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private config: ButtonConfig;
  private isHovered: boolean = false;
  private isPressed: boolean = false;
  private isDisabled: boolean = false;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);
    
    this.config = {
      backgroundColor: 0x3498db,
      borderColor: 0x2980b9,
      borderWidth: 2,
      cornerRadius: 8,
      hoverColor: 0x2980b9,
      pressedColor: 0x1f4e79,
      disabled: false,
      style: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      },
      ...config
    };

    this.isDisabled = this.config.disabled || false;

    // 創建背景
    this.background = scene.add.graphics();
    this.add(this.background);

    // 創建文字標籤
    this.label = scene.add.text(0, 0, this.config.text, this.config.style);
    this.label.setOrigin(0.5);
    this.add(this.label);

    // 設置互動區域
    this.setSize(this.config.width, this.config.height);
    this.setInteractive();

    // 設置事件監聽
    this.setupEvents();

    // 初始渲染
    this.render();

    // 添加到場景
    scene.add.existing(this);
  }

  private setupEvents() {
    if (this.isDisabled) return;

    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);
    this.on('pointerupoutside', this.onPointerUp, this);
  }

  private onPointerOver() {
    if (this.isDisabled) return;
    
    this.isHovered = true;
    this.render();
    this.setScale(1.05);
    
    // 播放懸停音效
    this.scene.sound.play('ui-hover', { volume: 0.3 });
  }

  private onPointerOut() {
    if (this.isDisabled) return;
    
    this.isHovered = false;
    this.isPressed = false;
    this.render();
    this.setScale(1);
  }

  private onPointerDown() {
    if (this.isDisabled) return;
    
    this.isPressed = true;
    this.render();
    this.setScale(0.95);
    
    // 播放點擊音效
    this.scene.sound.play('ui-click', { volume: 0.5 });
  }

  private onPointerUp() {
    if (this.isDisabled) return;
    
    if (this.isPressed) {
      this.emit('click');
    }
    
    this.isPressed = false;
    this.render();
    this.setScale(this.isHovered ? 1.05 : 1);
  }

  private render() {
    this.background.clear();

    let fillColor = this.config.backgroundColor!;
    
    if (this.isDisabled) {
      fillColor = 0x7f8c8d;
    } else if (this.isPressed) {
      fillColor = this.config.pressedColor!;
    } else if (this.isHovered) {
      fillColor = this.config.hoverColor!;
    }

    // 繪製背景
    this.background.fillStyle(fillColor);
    this.background.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      this.config.cornerRadius
    );

    // 繪製邊框
    if (this.config.borderWidth! > 0) {
      this.background.lineStyle(this.config.borderWidth!, this.config.borderColor!);
      this.background.strokeRoundedRect(
        -this.config.width / 2,
        -this.config.height / 2,
        this.config.width,
        this.config.height,
        this.config.cornerRadius
      );
    }

    // 更新文字顏色
    if (this.isDisabled) {
      this.label.setColor('#bdc3c7');
    } else {
      this.label.setColor(this.config.style?.color as string || '#ffffff');
    }
  }

  public setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this.isDisabled = !enabled;
    
    if (this.isDisabled) {
      this.removeInteractive();
      this.setScale(1);
    } else {
      this.setInteractive();
    }
    
    this.render();
    return this;
  }

  public setStyle(style: Partial<Phaser.Types.GameObjects.Text.TextStyle>): this {
    this.label.setStyle(style);
    return this;
  }

  public setBackgroundColor(color: number): this {
    this.config.backgroundColor = color;
    this.render();
    return this;
  }

  public setHoverColor(color: number): this {
    this.config.hoverColor = color;
    return this;
  }

  public setPressedColor(color: number): this {
    this.config.pressedColor = color;
    return this;
  }

  public isButtonDisabled(): boolean {
    return this.isDisabled;
  }

  public destroy(fromScene?: boolean): void {
    this.removeAllListeners();
    super.destroy(fromScene);
  }
}

// 預設按鈕樣式
export const ButtonStyles = {
  PRIMARY: {
    backgroundColor: 0x3498db,
    hoverColor: 0x2980b9,
    pressedColor: 0x1f4e79,
    borderColor: 0x2980b9
  },
  
  SUCCESS: {
    backgroundColor: 0x27ae60,
    hoverColor: 0x229954,
    pressedColor: 0x1e8449,
    borderColor: 0x229954
  },
  
  DANGER: {
    backgroundColor: 0xe74c3c,
    hoverColor: 0xc0392b,
    pressedColor: 0xa93226,
    borderColor: 0xc0392b
  },
  
  WARNING: {
    backgroundColor: 0xf39c12,
    hoverColor: 0xe67e22,
    pressedColor: 0xd35400,
    borderColor: 0xe67e22
  },
  
  SECONDARY: {
    backgroundColor: 0x95a5a6,
    hoverColor: 0x7f8c8d,
    pressedColor: 0x6c7b7d,
    borderColor: 0x7f8c8d
  }
};
