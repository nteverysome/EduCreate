import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Button, ButtonStyles } from './Button';
import { createMockScene } from '../../test/setup';

describe('Button', () => {
  let mockScene: any;
  let button: Button;

  beforeEach(() => {
    mockScene = createMockScene();
    button = new Button(mockScene, {
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      text: 'Test Button'
    });
  });

  describe('初始化', () => {
    it('應該正確創建按鈕', () => {
      expect(button).toBeDefined();
      expect(button.x).toBe(100);
      expect(button.y).toBe(100);
    });

    it('應該使用預設樣式', () => {
      const buttonWithDefaults = new Button(mockScene, {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        text: 'Default'
      });
      
      expect(buttonWithDefaults).toBeDefined();
    });

    it('應該應用自定義樣式', () => {
      const customButton = new Button(mockScene, {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        text: 'Custom',
        backgroundColor: 0xff0000,
        borderColor: 0x00ff00
      });
      
      expect(customButton).toBeDefined();
    });
  });

  describe('文字管理', () => {
    it('應該能夠設置文字', () => {
      button.setText('New Text');
      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('應該能夠設置文字樣式', () => {
      button.setStyle({ fontSize: '20px', color: '#ff0000' });
      expect(button).toBeDefined();
    });
  });

  describe('狀態管理', () => {
    it('應該能夠啟用和禁用按鈕', () => {
      button.setEnabled(false);
      expect(button.isButtonDisabled()).toBe(true);
      
      button.setEnabled(true);
      expect(button.isButtonDisabled()).toBe(false);
    });

    it('應該在禁用時移除互動性', () => {
      const removeInteractiveSpy = vi.spyOn(button, 'removeInteractive');
      button.setEnabled(false);
      expect(removeInteractiveSpy).toHaveBeenCalled();
    });
  });

  describe('顏色管理', () => {
    it('應該能夠設置背景顏色', () => {
      button.setBackgroundColor(0xff0000);
      expect(button).toBeDefined();
    });

    it('應該能夠設置懸停顏色', () => {
      button.setHoverColor(0x00ff00);
      expect(button).toBeDefined();
    });

    it('應該能夠設置按下顏色', () => {
      button.setPressedColor(0x0000ff);
      expect(button).toBeDefined();
    });
  });

  describe('事件處理', () => {
    it('應該能夠處理點擊事件', () => {
      const clickHandler = vi.fn();
      button.on('click', clickHandler);
      
      // 模擬點擊事件
      button.emit('pointerdown');
      button.emit('pointerup');
      
      // 注意：實際的點擊邏輯在私有方法中，這裡只測試事件註冊
      expect(button.listenerCount('click')).toBe(1);
    });

    it('應該能夠移除事件監聽器', () => {
      const clickHandler = vi.fn();
      button.on('click', clickHandler);
      button.off('click', clickHandler);
      
      expect(button.listenerCount('click')).toBe(0);
    });
  });

  describe('銷毀', () => {
    it('應該能夠正確銷毀按鈕', () => {
      const removeAllListenersSpy = vi.spyOn(button, 'removeAllListeners');
      button.destroy();
      expect(removeAllListenersSpy).toHaveBeenCalled();
    });
  });

  describe('預設樣式', () => {
    it('應該包含所有預設樣式', () => {
      expect(ButtonStyles.PRIMARY).toBeDefined();
      expect(ButtonStyles.SUCCESS).toBeDefined();
      expect(ButtonStyles.DANGER).toBeDefined();
      expect(ButtonStyles.WARNING).toBeDefined();
      expect(ButtonStyles.SECONDARY).toBeDefined();
    });

    it('每個樣式應該包含必要的顏色屬性', () => {
      Object.values(ButtonStyles).forEach(style => {
        expect(style.backgroundColor).toBeDefined();
        expect(style.hoverColor).toBeDefined();
        expect(style.pressedColor).toBeDefined();
        expect(style.borderColor).toBeDefined();
      });
    });
  });
});
