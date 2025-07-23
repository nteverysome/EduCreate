import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaneManager } from './PlaneManager';
import { createMockScene } from '../test/setup';

describe('PlaneManager', () => {
  let planeManager: PlaneManager;
  let mockScene: any;

  beforeEach(() => {
    mockScene = createMockScene();
    planeManager = new PlaneManager(mockScene);
  });

  afterEach(() => {
    PlaneManager.destroyInstance();
  });

  describe('初始化', () => {
    it('應該正確初始化飛機管理器', () => {
      expect(planeManager).toBeDefined();
      expect(planeManager.getAllPlanes()).toHaveLength(7);
    });

    it('應該設置預設的當前飛機', () => {
      const currentPlane = planeManager.getCurrentPlane();
      expect(currentPlane).toBeDefined();
      expect(currentPlane.id).toBe('b17');
    });
  });

  describe('飛機管理', () => {
    it('應該能夠根據 ID 獲取飛機', () => {
      const plane = planeManager.getPlaneById('bf109');
      expect(plane).toBeDefined();
      expect(plane?.id).toBe('bf109');
      expect(plane?.name).toBe('Messerschmitt BF-109E');
    });

    it('應該在飛機不存在時返回 null', () => {
      const plane = planeManager.getPlaneById('nonexistent');
      expect(plane).toBeNull();
    });

    it('應該能夠切換當前飛機', () => {
      const eventSpy = vi.fn();
      planeManager.on('plane-selected', eventSpy);

      planeManager.setCurrentPlane('hawker');
      
      const currentPlane = planeManager.getCurrentPlane();
      expect(currentPlane.id).toBe('hawker');
      expect(eventSpy).toHaveBeenCalled();
    });

    it('應該能夠根據類型篩選飛機', () => {
      const fighters = planeManager.getPlanesByType('fighter');
      expect(fighters.length).toBeGreaterThan(0);
      
      fighters.forEach(plane => {
        expect(plane.type).toBe('fighter');
      });
    });
  });

  describe('飛機統計', () => {
    it('應該能夠獲取飛機統計資訊', () => {
      const stats = planeManager.getPlaneStats('b17');
      expect(stats).toBeDefined();
      expect(stats?.id).toBe('b17');
      expect(stats?.performance).toBeDefined();
      expect(stats?.performance.speed).toBeGreaterThan(0);
    });

    it('應該在飛機不存在時返回 null', () => {
      const stats = planeManager.getPlaneStats('nonexistent');
      expect(stats).toBeNull();
    });
  });

  describe('推薦系統', () => {
    it('應該能夠推薦攻擊型飛機', () => {
      const recommendedPlane = planeManager.getRecommendedPlane('aggressive');
      expect(recommendedPlane).toBeDefined();
      expect(recommendedPlane.speed + recommendedPlane.damage).toBeGreaterThan(0);
    });

    it('應該能夠推薦防禦型飛機', () => {
      const recommendedPlane = planeManager.getRecommendedPlane('defensive');
      expect(recommendedPlane).toBeDefined();
      expect(recommendedPlane.health).toBeGreaterThan(0);
    });

    it('應該能夠推薦平衡型飛機', () => {
      const recommendedPlane = planeManager.getRecommendedPlane('balanced');
      expect(recommendedPlane).toBeDefined();
    });
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const instance1 = PlaneManager.getInstance();
      const instance2 = PlaneManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該能夠銷毀實例', () => {
      const instance1 = PlaneManager.getInstance();
      PlaneManager.destroyInstance();
      const instance2 = PlaneManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('事件系統', () => {
    it('應該能夠註冊和觸發事件', () => {
      const eventHandler = vi.fn();
      planeManager.on('test-event', eventHandler);
      
      planeManager.emit('test-event', 'test-data');
      
      expect(eventHandler).toHaveBeenCalledWith('test-data');
    });

    it('應該能夠移除事件監聽器', () => {
      const eventHandler = vi.fn();
      planeManager.on('test-event', eventHandler);
      planeManager.off('test-event', eventHandler);
      
      planeManager.emit('test-event', 'test-data');
      
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('飛機創建', () => {
    it('應該能夠創建飛機精靈', () => {
      const plane = planeManager.getPlaneById('b17')!;
      const sprite = planeManager.createPlaneSprite(mockScene, plane);
      
      expect(sprite).toBeDefined();
      expect(mockScene.add.sprite).toHaveBeenCalled();
    });
  });
});
