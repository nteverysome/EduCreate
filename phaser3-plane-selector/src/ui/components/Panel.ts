import Phaser from 'phaser';

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
  alpha?: number;
  padding?: number;
  title?: string;
  titleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}

export class Panel extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private config: PanelConfig;
  private titleText?: Phaser.GameObjects.Text;
  private contentArea: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, config: PanelConfig) {
    super(scene, config.x, config.y);
    
    this.config = {
      backgroundColor: 0x2c3e50,
      borderColor: 0x34495e,
      borderWidth: 2,
      cornerRadius: 10,
      alpha: 0.95,
      padding: 15,
      titleStyle: {
        fontSize: '18px',
        color: '#3498db',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      },
      ...config
    };

    // 創建背景
    this.background = scene.add.graphics();
    this.add(this.background);

    // 創建標題
    if (this.config.title) {
      this.createTitle();
    }

    // 創建內容區域
    this.contentArea = scene.add.container(0, this.config.title ? 30 : 0);
    this.add(this.contentArea);

    // 設置大小
    this.setSize(this.config.width, this.config.height);

    // 渲染面板
    this.render();

    // 添加到場景
    scene.add.existing(this);
  }

  private createTitle() {
    if (!this.config.title) return;

    this.titleText = this.scene.add.text(
      0, 
      -this.config.height / 2 + this.config.padding!,
      this.config.title,
      this.config.titleStyle
    );
    this.titleText.setOrigin(0.5, 0);
    this.add(this.titleText);
  }

  private render() {
    this.background.clear();

    // 繪製背景
    this.background.fillStyle(this.config.backgroundColor!, this.config.alpha!);
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

    // 如果有標題，繪製分隔線
    if (this.config.title) {
      this.background.lineStyle(1, this.config.borderColor!, 0.5);
      this.background.lineBetween(
        -this.config.width / 2 + this.config.padding!,
        -this.config.height / 2 + 35,
        this.config.width / 2 - this.config.padding!,
        -this.config.height / 2 + 35
      );
    }
  }

  public addContent(gameObject: Phaser.GameObjects.GameObject): this {
    this.contentArea.add(gameObject);
    return this;
  }

  public removeContent(gameObject: Phaser.GameObjects.GameObject): this {
    this.contentArea.remove(gameObject);
    return this;
  }

  public clearContent(): this {
    this.contentArea.removeAll();
    return this;
  }

  public setTitle(title: string): this {
    this.config.title = title;
    
    if (this.titleText) {
      this.titleText.setText(title);
    } else {
      this.createTitle();
    }
    
    this.render();
    return this;
  }

  public setBackgroundColor(color: number, alpha?: number): this {
    this.config.backgroundColor = color;
    if (alpha !== undefined) {
      this.config.alpha = alpha;
    }
    this.render();
    return this;
  }

  public setBorderColor(color: number): this {
    this.config.borderColor = color;
    this.render();
    return this;
  }

  public resize(width: number, height: number): this {
    this.config.width = width;
    this.config.height = height;
    this.setSize(width, height);
    this.render();
    return this;
  }

  public getContentArea(): Phaser.GameObjects.Container {
    return this.contentArea;
  }

  public getContentBounds(): { x: number; y: number; width: number; height: number } {
    const titleOffset = this.config.title ? 40 : 0;
    return {
      x: -this.config.width / 2 + this.config.padding!,
      y: -this.config.height / 2 + this.config.padding! + titleOffset,
      width: this.config.width - this.config.padding! * 2,
      height: this.config.height - this.config.padding! * 2 - titleOffset
    };
  }
}

// 預設面板樣式
export const PanelStyles = {
  DEFAULT: {
    backgroundColor: 0x2c3e50,
    borderColor: 0x34495e,
    alpha: 0.95
  },
  
  DARK: {
    backgroundColor: 0x1a1a1a,
    borderColor: 0x333333,
    alpha: 0.98
  },
  
  LIGHT: {
    backgroundColor: 0xecf0f1,
    borderColor: 0xbdc3c7,
    alpha: 0.95
  },
  
  SUCCESS: {
    backgroundColor: 0x27ae60,
    borderColor: 0x229954,
    alpha: 0.9
  },
  
  WARNING: {
    backgroundColor: 0xf39c12,
    borderColor: 0xe67e22,
    alpha: 0.9
  },
  
  DANGER: {
    backgroundColor: 0xe74c3c,
    borderColor: 0xc0392b,
    alpha: 0.9
  }
};
