import { PlaneConfig, IPlaneRenderer, PlaneGraphicsConfig } from '../types/planes';

export class PlaneRenderer implements IPlaneRenderer {
  // private _scene: Phaser.Scene;
  private textureCache: Map<string, Phaser.Textures.Texture> = new Map();

  constructor(_scene: Phaser.Scene) {
    // this._scene = scene;
  }

  public renderPlane(graphics: Phaser.GameObjects.Graphics, config: PlaneConfig): void {
    graphics.clear();
    
    const graphicsConfig: PlaneGraphicsConfig = {
      width: 64,
      height: 64,
      centerX: 32,
      centerY: 32,
      colors: this.getPlaneColors(config)
    };

    // 根據飛機類型選擇渲染方法
    switch (config.id) {
      case 'b17':
        this.renderB17(graphics, graphicsConfig);
        break;
      case 'bf109':
        this.renderBF109(graphics, graphicsConfig);
        break;
      case 'biplane':
        this.renderBiplane(graphics, graphicsConfig);
        break;
      case 'tbm3':
        this.renderTBM3(graphics, graphicsConfig);
        break;
      case 'hawker':
        this.renderHawker(graphics, graphicsConfig);
        break;
      case 'ju87':
        this.renderJU87(graphics, graphicsConfig);
        break;
      case 'blenheim':
        this.renderBlenheim(graphics, graphicsConfig);
        break;
      default:
        this.renderDefaultPlane(graphics, graphicsConfig);
    }
  }

  public createPlaneTexture(scene: Phaser.Scene, config: PlaneConfig): Phaser.Textures.Texture {
    const textureKey = `plane-texture-${config.id}`;
    
    // 檢查快取
    if (this.textureCache.has(textureKey)) {
      return this.textureCache.get(textureKey)!;
    }

    // 創建渲染目標
    const renderTexture = scene.add.renderTexture(0, 0, 64, 64);
    const graphics = scene.add.graphics();
    
    // 渲染飛機
    this.renderPlane(graphics, config);
    
    // 將圖形渲染到紋理
    renderTexture.draw(graphics);
    
    // 生成紋理
    const texture = renderTexture.saveTexture(textureKey);
    
    // 清理臨時物件
    graphics.destroy();
    renderTexture.destroy();
    
    // 快取紋理
    this.textureCache.set(textureKey, texture);
    
    return texture;
  }

  public updatePlaneGraphics(graphics: Phaser.GameObjects.Graphics, config: PlaneConfig): void {
    this.renderPlane(graphics, config);
  }

  private getPlaneColors(config: PlaneConfig) {
    const baseColor = config.color;
    return {
      primary: baseColor,
      secondary: this.darkenColor(baseColor, 0.2),
      accent: this.lightenColor(baseColor, 0.3),
      detail: '#374151'
    };
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * amount));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  private renderB17(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;

    // 主機身 (深藍色，圓角)
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillRoundedRect(centerX - 4, centerY - 20, 8, 40, 2);

    // 機身中段加寬
    graphics.fillStyle(parseInt(colors.accent.replace('#', '0x')));
    graphics.fillRoundedRect(centerX - 5, centerY - 10, 10, 20, 1.5);

    // 機身細節條紋
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    for (let i = -18; i < 18; i += 4) {
      graphics.fillRect(centerX - 3, centerY + i, 6, 1);
    }

    // 主機翼 (梯形)
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.beginPath();
    graphics.moveTo(centerX - 20, centerY - 4);
    graphics.lineTo(centerX - 18, centerY - 6);
    graphics.lineTo(centerX + 18, centerY - 6);
    graphics.lineTo(centerX + 20, centerY - 4);
    graphics.lineTo(centerX + 18, centerY + 4);
    graphics.lineTo(centerX - 18, centerY + 4);
    graphics.closePath();
    graphics.fillPath();

    // 機翼細節
    graphics.fillStyle(parseInt(colors.accent.replace('#', '0x')));
    graphics.beginPath();
    graphics.moveTo(centerX - 18, centerY - 5);
    graphics.lineTo(centerX + 18, centerY - 5);
    graphics.lineTo(centerX + 15, centerY + 3);
    graphics.lineTo(centerX - 15, centerY + 3);
    graphics.closePath();
    graphics.fillPath();

    // 四個引擎 (詳細設計)
    const enginePositions = [-14, -7, 7, 14];
    enginePositions.forEach(pos => {
      // 引擎主體
      graphics.fillStyle(parseInt(colors.detail.replace('#', '0x')));
      graphics.fillRoundedRect(centerX + pos - 2, centerY - 3, 4, 6, 1);

      // 引擎進氣口
      graphics.fillStyle(0x111827);
      graphics.fillEllipse(centerX + pos, centerY - 4, 1.5, 1);

      // 螺旋槳
      graphics.lineStyle(1, 0xfbbf24);
      graphics.strokeEllipse(centerX + pos, centerY - 5, 3, 0.5);
      graphics.strokeEllipse(centerX + pos, centerY - 5, 0.5, 3);
    });

    // 機頭 (圓錐形)
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillTriangle(centerX, centerY - 23, centerX - 4, centerY - 18, centerX + 4, centerY - 18);

    // 駕駛艙 (透明玻璃效果)
    graphics.fillStyle(0x93c5fd, 0.8);
    graphics.fillRoundedRect(centerX - 2.5, centerY - 13, 5, 8, 1.5);

    // 駕駛艙框架
    graphics.lineStyle(0.5, parseInt(colors.detail.replace('#', '0x')));
    graphics.strokeRoundedRect(centerX - 2.5, centerY - 13, 5, 8, 1.5);

    // 機尾垂直尾翼
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillTriangle(centerX, centerY + 18, centerX - 3, centerY + 23, centerX + 3, centerY + 23);

    // 水平尾翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillRoundedRect(centerX - 6, centerY + 16, 12, 3, 1);

    // 機身窗戶
    graphics.fillStyle(0x93c5fd, 0.6);
    const windowPositions = [-8, -3, 3, 8];
    windowPositions.forEach(pos => {
      graphics.fillEllipse(centerX + 3.5, centerY + pos, 1, 1.5);
      graphics.fillEllipse(centerX - 3.5, centerY + pos, 1, 1.5);
    });
  }

  private renderBF109(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 流線型機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY, 6, 35);
    
    // 機翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY - 2, 32, 8);
    
    // 引擎罩
    graphics.fillStyle(parseInt(colors.detail.replace('#', '0x')));
    graphics.fillCircle(centerX, centerY - 20, 4);
    
    // 螺旋槳
    graphics.lineStyle(2, parseInt(colors.accent.replace('#', '0x')));
    graphics.strokeCircle(centerX, centerY - 24, 6);
    
    // 駕駛艙
    graphics.fillStyle(0x93c5fd, 0.8);
    graphics.fillEllipse(centerX, centerY - 8, 4, 8);
  }

  private renderBiplane(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillRoundedRect(centerX - 2, centerY - 15, 4, 30, 2);
    
    // 上翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillRect(centerX - 15, centerY - 10, 30, 4);
    
    // 下翼
    graphics.fillRect(centerX - 15, centerY + 4, 30, 4);
    
    // 翼間支柱
    graphics.lineStyle(1, parseInt(colors.detail.replace('#', '0x')));
    [-10, 0, 10].forEach(offset => {
      graphics.lineBetween(centerX + offset, centerY - 8, centerX + offset, centerY + 6);
    });
    
    // 螺旋槳
    graphics.fillStyle(parseInt(colors.accent.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY - 20, 8, 2);
    graphics.fillEllipse(centerX, centerY - 20, 2, 8);
  }

  private renderTBM3(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 粗壯機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY, 8, 32);
    
    // 寬大機翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY - 2, 36, 10);
    
    // 引擎罩
    graphics.fillStyle(parseInt(colors.detail.replace('#', '0x')));
    graphics.fillCircle(centerX, centerY - 20, 5);
    
    // 魚雷掛架
    graphics.fillRect(centerX - 1, centerY + 8, 2, 6);
    graphics.fillRoundedRect(centerX - 2, centerY + 12, 4, 8, 1);
  }

  private renderHawker(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 流線型機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY, 5, 30);
    
    // 橢圓翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY - 2, 28, 8);
    
    // 引擎進氣口
    graphics.fillStyle(parseInt(colors.detail.replace('#', '0x')));
    graphics.fillRect(centerX - 2, centerY - 15, 4, 2);
    
    // 四葉螺旋槳
    graphics.lineStyle(1, parseInt(colors.accent.replace('#', '0x')));
    for (let i = 0; i < 4; i++) {
      const angle = (i * 90) * Math.PI / 180;
      const x1 = centerX + Math.cos(angle) * 6;
      const y1 = centerY - 22 + Math.sin(angle) * 6;
      graphics.lineBetween(centerX, centerY - 22, x1, y1);
    }
  }

  private renderJU87(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY, 6, 28);
    
    // 倒海鷗翼
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    // 使用簡化的多邊形代替曲線
    graphics.beginPath();
    graphics.moveTo(centerX - 4, centerY - 2);
    graphics.lineTo(centerX - 10, centerY - 6);
    graphics.lineTo(centerX - 16, centerY - 2);
    graphics.lineTo(centerX - 10, centerY + 4);
    graphics.lineTo(centerX - 4, centerY + 2);
    graphics.moveTo(centerX + 4, centerY - 2);
    graphics.lineTo(centerX + 10, centerY - 6);
    graphics.lineTo(centerX + 16, centerY - 2);
    graphics.lineTo(centerX + 10, centerY + 4);
    graphics.lineTo(centerX + 4, centerY + 2);
    graphics.fillPath();
    
    // 固定起落架
    graphics.fillStyle(parseInt(colors.detail.replace('#', '0x')));
    graphics.fillRect(centerX - 12, centerY + 4, 2, 6);
    graphics.fillRect(centerX + 10, centerY + 4, 2, 6);
  }

  private renderBlenheim(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 機身
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillEllipse(centerX, centerY, 6, 32);
    
    // 雙引擎艙
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillEllipse(centerX - 8, centerY - 4, 4, 8);
    graphics.fillEllipse(centerX + 8, centerY - 4, 4, 8);
    
    // 機翼連接引擎艙
    graphics.fillRect(centerX - 12, centerY - 6, 24, 4);
    
    // 雙螺旋槳
    graphics.lineStyle(1, parseInt(colors.accent.replace('#', '0x')));
    graphics.strokeCircle(centerX - 8, centerY - 12, 4);
    graphics.strokeCircle(centerX + 8, centerY - 12, 4);
  }

  private renderDefaultPlane(graphics: Phaser.GameObjects.Graphics, config: PlaneGraphicsConfig): void {
    const { centerX, centerY, colors } = config;
    
    // 簡單的預設飛機形狀
    graphics.fillStyle(parseInt(colors.primary.replace('#', '0x')));
    graphics.fillTriangle(centerX, centerY - 15, centerX - 8, centerY + 10, centerX + 8, centerY + 10);
    
    graphics.fillStyle(parseInt(colors.secondary.replace('#', '0x')));
    graphics.fillRect(centerX - 12, centerY - 2, 24, 4);
  }

  public destroy(): void {
    this.textureCache.clear();
  }
}
