/**
 * 自動保存管理器測試
 * 測試自動保存、離線模式、錯誤恢復等功能
 */

import { AutoSaveManager, generateActivityId } from '../../lib/content/AutoSaveManager';
import { UniversalContent } from '../../lib/content/UniversalContentManager';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window events
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
global.window = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
} as any;

describe('AutoSaveManager', () => {
  let autoSaveManager: AutoSaveManager;
  let testContent: Partial<UniversalContent>;
  const testActivityId = 'test_activity_123';

  beforeEach(() => {
    jest.clearAllMocks();
    autoSaveManager = new AutoSaveManager(testActivityId, {
      saveDelay: 100, // 短延遲用於測試
      enableOfflineMode: true
    });

    testContent = {
      id: testActivityId,
      title: '測試活動',
      description: '測試描述',
      items: [
        { id: '1', term: '測試詞彙', definition: '測試定義' }
      ]
    };
  });

  afterEach(() => {
    autoSaveManager.destroy();
  });

  describe('基本功能', () => {
    test('應該能夠創建自動保存管理器', () => {
      expect(autoSaveManager).toBeDefined();
    });

    test('應該能夠生成唯一的活動 ID', () => {
      const id1 = generateActivityId();
      const id2 = generateActivityId();
      
      expect(id1).toMatch(/^activity_[a-z0-9]+_\d+$/);
      expect(id2).toMatch(/^activity_[a-z0-9]+_\d+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('自動保存功能', () => {
    test('應該能夠觸發自動保存', (done) => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);

      autoSaveManager.triggerAutoSave(testContent);

      // 等待自動保存延遲
      setTimeout(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/universal-content/${testActivityId}/autosave`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining(testContent.title!)
          })
        );
        done();
      }, 150);
    });

    test('應該能夠強制保存', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);

      await autoSaveManager.forceSave(testContent);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/universal-content/${testActivityId}/autosave`,
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    test('應該能夠處理保存錯誤並重試', (done) => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        } as Response);

      autoSaveManager.triggerAutoSave(testContent);

      // 等待重試
      setTimeout(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        done();
      }, 1500);
    });
  });

  describe('離線模式', () => {
    test('應該能夠保存到本地存儲', () => {
      autoSaveManager['saveToLocalStorage'](testContent);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `autosave_${testActivityId}`,
        expect.stringContaining(testContent.title!)
      );
    });

    test('應該能夠從本地存儲恢復數據', () => {
      const savedData = {
        activityId: testActivityId,
        data: testContent,
        timestamp: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData));

      const restored = autoSaveManager.restoreFromLocalStorage();

      expect(restored).toEqual(testContent);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(`autosave_${testActivityId}`);
    });

    test('應該能夠清除本地存儲', () => {
      autoSaveManager.clearLocalStorage();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`autosave_${testActivityId}`);
    });

    test('應該在離線時保存到本地存儲', (done) => {
      // 模擬離線狀態
      autoSaveManager['isOnline'] = false;

      autoSaveManager.triggerAutoSave(testContent);

      setTimeout(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
        done();
      }, 150);
    });
  });

  describe('網絡狀態處理', () => {
    test('應該監聽網絡狀態變化', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    test('應該在網絡恢復時同步本地數據', () => {
      const savedData = {
        activityId: testActivityId,
        data: testContent,
        timestamp: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData));
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);

      // 模擬網絡恢復
      autoSaveManager['handleOnline']();

      expect(localStorageMock.getItem).toHaveBeenCalled();
    });
  });

  describe('狀態監聽', () => {
    test('應該能夠添加和移除監聽器', () => {
      const listener = jest.fn();

      autoSaveManager.addListener(listener);
      autoSaveManager.triggerAutoSave(testContent);

      // 監聽器應該被調用
      expect(listener).toHaveBeenCalled();

      autoSaveManager.removeListener(listener);
      autoSaveManager.triggerAutoSave(testContent);

      // 移除後不應該再被調用
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('清理資源', () => {
    test('應該能夠正確清理資源', () => {
      autoSaveManager.destroy();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('錯誤處理', () => {
    test('應該處理本地存儲錯誤', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      // 不應該拋出錯誤
      expect(() => {
        autoSaveManager['saveToLocalStorage'](testContent);
      }).not.toThrow();
    });

    test('應該處理 JSON 解析錯誤', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const restored = autoSaveManager.restoreFromLocalStorage();

      expect(restored).toBeNull();
    });

    test('應該在達到最大重試次數後停止重試', (done) => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      autoSaveManager = new AutoSaveManager(testActivityId, {
        saveDelay: 50,
        maxRetries: 2
      });

      autoSaveManager.triggerAutoSave(testContent);

      setTimeout(() => {
        // 應該嘗試 1 次初始調用 + 2 次重試 = 3 次
        expect(mockFetch).toHaveBeenCalledTimes(3);
        done();
      }, 500);
    });
  });
});
