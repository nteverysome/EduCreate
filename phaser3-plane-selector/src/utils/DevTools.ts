import Phaser from 'phaser';

export class DevTools {
  private static instance: DevTools | null = null;
  private scene: Phaser.Scene | null = null;
  private debugPanel: HTMLDivElement | null = null;
  private isVisible: boolean = false;
  private stats: { [key: string]: any } = {};

  private constructor() {
    this.createDebugPanel();
    this.setupKeyboardShortcuts();
  }

  public static getInstance(): DevTools {
    if (!DevTools.instance) {
      DevTools.instance = new DevTools();
    }
    return DevTools.instance;
  }

  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  private createDebugPanel(): void {
    if (typeof document === 'undefined') return;

    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'phaser-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #00ff00;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
      backdrop-filter: blur(5px);
    `;

    document.body.appendChild(this.debugPanel);
  }

  private setupKeyboardShortcuts(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', (event) => {
      // F12 - 切換調試面板
      if (event.key === 'F12') {
        event.preventDefault();
        this.toggleDebugPanel();
      }

      // Ctrl + R - 重新載入場景
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        this.reloadCurrentScene();
      }

      // Ctrl + D - 切換物理調試
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        this.togglePhysicsDebug();
      }

      // Ctrl + G - 切換網格顯示
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        this.toggleGrid();
      }

      // Ctrl + P - 暫停/恢復遊戲
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        this.togglePause();
      }
    });
  }

  public toggleDebugPanel(): void {
    if (!this.debugPanel) return;

    this.isVisible = !this.isVisible;
    this.debugPanel.style.display = this.isVisible ? 'block' : 'none';

    if (this.isVisible) {
      this.startStatsUpdate();
    } else {
      this.stopStatsUpdate();
    }
  }

  private statsUpdateInterval: number | null = null;

  private startStatsUpdate(): void {
    if (this.statsUpdateInterval) return;

    this.statsUpdateInterval = window.setInterval(() => {
      this.updateStats();
    }, 100);
  }

  private stopStatsUpdate(): void {
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = null;
    }
  }

  private updateStats(): void {
    if (!this.scene || !this.debugPanel) return;

    const game = this.scene.game;
    const scene = this.scene;

    this.stats = {
      'FPS': Math.round(game.loop.actualFps),
      'Delta': Math.round(game.loop.delta),
      'Scene': scene.scene.key,
      'Objects': scene.children.length,
      'Active Tweens': scene.tweens.getTweens().length,
      'Sounds Playing': (scene.sound as any).sounds ? (scene.sound as any).sounds.filter((s: any) => s.isPlaying).length : 0,
      'Memory (MB)': this.getMemoryUsage(),
      'Render Calls': this.getRenderCalls(),
      'Physics Bodies': this.getPhysicsBodies(),
      'Textures': Object.keys(scene.textures.list).length
    };

    this.renderStats();
  }

  private getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    }
    return 'N/A';
  }

  private getRenderCalls(): number {
    if (!this.scene) return 0;
    return (this.scene.renderer as any).drawCount || 0;
  }

  private getPhysicsBodies(): number {
    if (!this.scene || !this.scene.physics.world) return 0;
    return (this.scene.physics.world as any).bodies?.size || 0;
  }

  private renderStats(): void {
    if (!this.debugPanel) return;

    let html = '<h3 style="margin: 0 0 10px 0; color: #00ff00;">🔧 Phaser 3 Debug Panel</h3>';
    
    for (const [key, value] of Object.entries(this.stats)) {
      const color = this.getStatColor(key, value);
      html += `<div style="margin: 2px 0; color: ${color};">${key}: <strong>${value}</strong></div>`;
    }

    html += '<hr style="border-color: #00ff00; margin: 10px 0;">';
    html += '<div style="font-size: 10px; color: #888;">';
    html += 'F12: Toggle Panel | Ctrl+R: Reload Scene<br>';
    html += 'Ctrl+D: Physics Debug | Ctrl+G: Grid<br>';
    html += 'Ctrl+P: Pause/Resume';
    html += '</div>';

    this.debugPanel.innerHTML = html;
  }

  private getStatColor(key: string, value: any): string {
    switch (key) {
      case 'FPS':
        if (value < 30) return '#ff4444';
        if (value < 50) return '#ffaa00';
        return '#00ff00';
      case 'Objects':
        if (value > 1000) return '#ff4444';
        if (value > 500) return '#ffaa00';
        return '#00ff00';
      case 'Memory (MB)':
        const mem = parseFloat(value);
        if (mem > 100) return '#ff4444';
        if (mem > 50) return '#ffaa00';
        return '#00ff00';
      default:
        return '#ffffff';
    }
  }

  public reloadCurrentScene(): void {
    if (!this.scene) return;
    
    console.log('🔄 重新載入場景:', this.scene.scene.key);
    this.scene.scene.restart();
  }

  public togglePhysicsDebug(): void {
    if (!this.scene || !this.scene.physics.world) return;

    const world = this.scene.physics.world as Phaser.Physics.Arcade.World;
    world.debugGraphic?.setVisible(!world.debugGraphic.visible);
    
    if (!world.debugGraphic) {
      world.createDebugGraphic();
    }

    console.log('🔍 物理調試:', world.debugGraphic?.visible ? '開啟' : '關閉');
  }

  private gridGraphics: Phaser.GameObjects.Graphics | null = null;

  public toggleGrid(): void {
    if (!this.scene) return;

    if (this.gridGraphics) {
      this.gridGraphics.setVisible(!this.gridGraphics.visible);
    } else {
      this.createGrid();
    }

    console.log('📐 網格顯示:', this.gridGraphics?.visible ? '開啟' : '關閉');
  }

  private createGrid(): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;
    this.gridGraphics = this.scene.add.graphics();
    this.gridGraphics.setDepth(-1000);

    // 繪製網格
    this.gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    // 垂直線
    for (let x = 0; x <= width; x += 50) {
      this.gridGraphics.lineBetween(x, 0, x, height);
    }
    
    // 水平線
    for (let y = 0; y <= height; y += 50) {
      this.gridGraphics.lineBetween(0, y, width, y);
    }

    // 中心線
    this.gridGraphics.lineStyle(2, 0x666666, 0.8);
    this.gridGraphics.lineBetween(width / 2, 0, width / 2, height);
    this.gridGraphics.lineBetween(0, height / 2, width, height / 2);
  }

  public togglePause(): void {
    if (!this.scene) return;

    if (this.scene.scene.isPaused()) {
      this.scene.scene.resume();
      console.log('▶️ 遊戲恢復');
    } else {
      this.scene.scene.pause();
      console.log('⏸️ 遊戲暫停');
    }
  }

  public log(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    const colors = {
      info: '#00ff00',
      warn: '#ffaa00',
      error: '#ff4444'
    };

    console.log(`%c[DevTools] ${message}`, `color: ${colors[type]}`);
  }

  public destroy(): void {
    this.stopStatsUpdate();
    
    if (this.debugPanel) {
      document.body.removeChild(this.debugPanel);
      this.debugPanel = null;
    }

    if (this.gridGraphics) {
      this.gridGraphics.destroy();
      this.gridGraphics = null;
    }

    DevTools.instance = null;
  }
}
