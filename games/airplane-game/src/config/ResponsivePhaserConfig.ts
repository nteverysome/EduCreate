/**
 * 響應式 Phaser 3 配置
 * 優化的 Scale Manager 設定，支援全螢幕和多設備自適應
 */

export interface ResponsiveConfig {
  // 基準尺寸 (Wordwall 標準)
  baseWidth: number;
  baseHeight: number;
  
  // 縮放模式配置
  scaleMode: Phaser.Scale.ScaleModeType;
  autoCenter: Phaser.Scale.CenterType;
  
  // 尺寸限制
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  
  // 響應式選項
  enableResponsive: boolean;
  smoothScaling: boolean;
  maintainAspectRatio: boolean;
}

export class ResponsivePhaserConfig {
  private static readonly DEFAULT_CONFIG: ResponsiveConfig = {
    // Wordwall 標準尺寸
    baseWidth: 1274,
    baseHeight: 739,
    
    // 縮放配置 - 使用 FIT 模式保持穩定性，支援動態切換到 RESIZE
    scaleMode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    
    // 尺寸限制 - 放寬以支援各種設備
    minWidth: 320,   // 最小支援手機尺寸
    minHeight: 240,
    maxWidth: 3840,  // 支援 4K 螢幕
    maxHeight: 2160,
    
    // 響應式選項
    enableResponsive: true,
    smoothScaling: true,
    maintainAspectRatio: true
  };

  /**
   * 獲取優化後的 Phaser 配置
   */
  public static getOptimizedConfig(customConfig?: Partial<ResponsiveConfig>): Phaser.Types.Core.GameConfig {
    const config = { ...this.DEFAULT_CONFIG, ...customConfig };
    
    return {
      type: Phaser.AUTO,
      width: config.baseWidth,
      height: config.baseHeight,
      parent: 'game-container',
      backgroundColor: 'transparent',
      
      // 優化的縮放配置
      scale: {
        mode: config.scaleMode,
        autoCenter: config.autoCenter,
        width: config.baseWidth,
        height: config.baseHeight,
        
        // 尺寸限制
        min: {
          width: config.minWidth,
          height: config.minHeight
        },
        max: {
          width: config.maxWidth || window.innerWidth,
          height: config.maxHeight || window.innerHeight
        },
        
        // 🎯 關鍵設置：支援全螢幕填滿
        expandParent: true,  // 允許擴展父容器
        fullscreenTarget: document.body, // 全螢幕目標設為 body
        
        // 響應式選項
        zoom: 1,
        resizeInterval: 500, // 防抖間隔
      },
      
      // 物理引擎配置
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      
      // 渲染優化
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default'
      },
      
      // 音頻配置
      audio: {
        disableWebAudio: false,
        context: false,
        noAudio: false
      },
      
      // 輸入配置
      input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
      },
      
      // DOM 配置
      dom: {
        createContainer: false
      },
      
      // 插件配置
      plugins: {
        global: [],
        scene: []
      }
    };
  }

  /**
   * 獲取全螢幕優化配置
   */
  public static getFullscreenConfig(): Phaser.Types.Core.GameConfig {
    return this.getOptimizedConfig({
      scaleMode: Phaser.Scale.RESIZE, // 全螢幕時使用 RESIZE 模式
      autoCenter: Phaser.Scale.CENTER_BOTH,
      enableResponsive: true,
      smoothScaling: true,
      // 全螢幕時移除尺寸限制，讓遊戲完全填滿螢幕
      minWidth: 320,
      minHeight: 240,
      maxWidth: undefined, // 移除最大寬度限制
      maxHeight: undefined // 移除最大高度限制
    });
  }

  /**
   * 獲取移動設備優化配置
   */
  public static getMobileConfig(): Phaser.Types.Core.GameConfig {
    return this.getOptimizedConfig({
      scaleMode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      minWidth: 320,
      minHeight: 240,
      maxWidth: 768,
      maxHeight: 1024
    });
  }

  /**
   * 動態檢測最佳配置
   */
  public static getAdaptiveConfig(): Phaser.Types.Core.GameConfig {
    const viewport = this.getViewportInfo();
    
    // 根據設備類型選擇最佳配置
    switch (viewport.deviceType) {
      case 'mobile':
        return this.getMobileConfig();
      case 'tablet':
        return this.getOptimizedConfig({
          scaleMode: Phaser.Scale.FIT,
          maxWidth: 1024,
          maxHeight: 768
        });
      case 'desktop':
      default:
        return this.getOptimizedConfig();
    }
  }

  /**
   * 獲取視窗信息
   */
  private static getViewportInfo() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (width < 768) {
      deviceType = 'mobile';
    } else if (width < 1024) {
      deviceType = 'tablet';
    }
    
    return {
      width,
      height,
      deviceType,
      aspectRatio: width / height,
      isLandscape: width > height,
      isPortrait: height > width
    };
  }

  /**
   * 配置比較工具
   */
  public static compareConfigs() {
    console.log('📊 Phaser 3 縮放模式比較:');
    console.log('');
    console.log('🔧 FIT 模式 (當前):');
    console.log('  ✅ 保持寬高比，無變形');
    console.log('  ✅ 自動居中，視覺穩定');
    console.log('  ❌ 可能有黑邊');
    console.log('  ❌ 無法充分利用大屏幕');
    console.log('');
    console.log('🔧 RESIZE 模式:');
    console.log('  ✅ 充分利用屏幕空間');
    console.log('  ✅ 無黑邊，完全填滿');
    console.log('  ❌ 可能變形，需要額外處理');
    console.log('  ❌ 複雜度較高');
    console.log('');
    console.log('💡 建議: 保持 FIT 模式 + 響應式管理器');
  }

  /**
   * 性能監控
   */
  public static monitorPerformance(game: Phaser.Game) {
    if (!game) return;
    
    const stats = {
      fps: 0,
      memory: 0,
      drawCalls: 0
    };
    
    // FPS 監控
    game.loop.on('step', () => {
      stats.fps = Math.round(game.loop.actualFps);
    });
    
    // 記憶體監控 (如果支援)
    if ((performance as any).memory) {
      stats.memory = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    
    console.log('📈 性能監控已啟動:', stats);
    
    return stats;
  }
}

export default ResponsivePhaserConfig;
