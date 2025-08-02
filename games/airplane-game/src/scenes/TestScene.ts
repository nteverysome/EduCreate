/**
 * 測試場景 - 專門用於測試全螢幕按鈕功能
 * 最簡化版本，排除所有可能的錯誤源
 */

import Phaser from 'phaser';
import { ResponsiveManager } from '../managers/ResponsiveManager';
import { FullscreenButton } from '../ui/FullscreenButton';

export default class TestScene extends Phaser.Scene {
  private responsiveManager!: ResponsiveManager;
  private fullscreenButton!: FullscreenButton;

  constructor() {
    super({ key: 'TestScene' });
  }

  preload() {
    console.log('🧪 測試場景 - 載入資源');
    
    // 創建最簡單的紋理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 50, 50);
    graphics.generateTexture('test-rect', 50, 50);
    graphics.destroy();
    
    console.log('✅ 測試資源載入完成');
  }

  create() {
    console.log('🧪 測試場景 - 創建場景');
    
    try {
      // 創建簡單背景
      this.add.rectangle(637, 369, 1274, 739, 0x001122);
      
      // 創建測試物件
      const testRect = this.add.image(400, 300, 'test-rect');
      testRect.setOrigin(0.5);
      
      // 添加文字說明
      const titleText = this.add.text(637, 200, '全螢幕按鈕測試', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      const instructionText = this.add.text(637, 250, '右下角應該有全螢幕按鈕\n按 F11 或點擊按鈕進入全螢幕', {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      console.log('✅ 基本 UI 元素創建完成');
      
      // 初始化響應式管理器
      this.responsiveManager = new ResponsiveManager(this, {
        baseWidth: 1274,
        baseHeight: 739,
        enableSmoothing: true,
        animationDuration: 300
      });
      
      console.log('✅ 響應式管理器初始化完成');
      
      // 創建全螢幕按鈕
      this.fullscreenButton = new FullscreenButton(this);
      
      console.log('✅ 全螢幕按鈕創建完成');
      
      // 註冊元素到響應式管理器
      this.responsiveManager.registerElement('title', titleText, 'ui', {
        anchor: { x: 0.5, y: 0.5 }
      });
      
      this.responsiveManager.registerElement('instruction', instructionText, 'ui', {
        anchor: { x: 0.5, y: 0.5 }
      });
      
      this.responsiveManager.registerElement('testRect', testRect, 'gameObject', {
        anchor: { x: 0.5, y: 0.5 }
      });
      
      console.log('✅ 所有元素已註冊到響應式管理器');
      
      // 添加鍵盤測試
      this.input.keyboard?.on('keydown-SPACE', () => {
        console.log('🎯 空白鍵測試 - 響應式管理器強制更新');
        this.responsiveManager.forceUpdate(true);
      });
      
      console.log('🎉 測試場景創建完成！');
      console.log('📋 測試項目：');
      console.log('   1. 右下角是否有全螢幕按鈕');
      console.log('   2. 點擊按鈕是否能進入全螢幕');
      console.log('   3. F11 快捷鍵是否有效');
      console.log('   4. ESC 是否能退出全螢幕');
      console.log('   5. 空白鍵測試響應式更新');
      
    } catch (error) {
      console.error('❌ 測試場景創建失敗:', error);
    }
  }

  update() {
    // 簡單的更新邏輯
  }
}
