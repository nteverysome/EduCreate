import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CacheManager } from '../lib/cache/CacheManager';
import { PerformanceMonitor } from '../lib/utils/performanceMonitor';
import { ActivityService } from '../lib/services/ActivityService';

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  activity: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  activityVersion: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('優化功能測試', () => {
  describe('CacheManager', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager({ ttl: 1000, maxSize: 3 });
    });

    afterEach(() => {
      cache.clear();
    });

    it('應該能夠設置和獲取緩存項', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('應該在 TTL 過期後返回 null', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      // 立即獲取應該成功
      expect(cache.get('key1')).toBe('value1');
      
      // 等待過期
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('應該實現 LRU 淘汰策略', () => {
      // 填滿緩存
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // 訪問 key1 使其成為最近使用
      cache.get('key1');
      
      // 添加新項目應該淘汰 key2（最少使用）
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBe('value1'); // 應該存在
      expect(cache.get('key2')).toBeNull(); // 應該被淘汰
      expect(cache.get('key3')).toBe('value3'); // 應該存在
      expect(cache.get('key4')).toBe('value4'); // 應該存在
    });

    it('應該支持 getOrSet 方法', async () => {
      const mockFn = jest.fn().mockResolvedValue('computed_value');
      
      // 第一次調用應該執行函數
      const result1 = await cache.getOrSet('key1', mockFn);
      expect(result1).toBe('computed_value');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // 第二次調用應該從緩存返回
      const result2 = await cache.getOrSet('key1', mockFn);
      expect(result2).toBe('computed_value');
      expect(mockFn).toHaveBeenCalledTimes(1); // 沒有再次調用
    });

    it('應該提供正確的統計信息', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(typeof stats.memoryUsage).toBe('number');
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor(100);
    });

    afterEach(() => {
      monitor.clear();
    });

    it('應該能夠測量執行時間', () => {
      monitor.startTimer('test_operation');
      
      // 模擬一些工作
      const start = Date.now();
      while (Date.now() - start < 10) {
        // 等待 10ms
      }
      
      const duration = monitor.endTimer('test_operation');
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // 應該在合理範圍內
    });

    it('應該能夠測量同步函數', () => {
      const testFn = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const result = monitor.measure('sync_test', testFn);
      expect(result).toBe(499500); // 0+1+...+999 的和
      
      const report = monitor.getReport();
      expect(report.metrics.some(m => m.name === 'sync_test')).toBe(true);
    });

    it('應該能夠測量異步函數', async () => {
      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async_result';
      };

      const result = await monitor.measureAsync('async_test', asyncFn);
      expect(result).toBe('async_result');
      
      const report = monitor.getReport();
      expect(report.metrics.some(m => m.name === 'async_test')).toBe(true);
    });

    it('應該能夠記錄計數器', () => {
      monitor.increment('test_counter', 5);
      monitor.increment('test_counter', 3);
      
      const report = monitor.getReport();
      const counterMetrics = report.metrics.filter(m => m.name === 'test_counter');
      expect(counterMetrics.length).toBe(2);
      expect(counterMetrics[1].value).toBe(8); // 5 + 3
    });

    it('應該能夠記錄錯誤', () => {
      const testError = new Error('Test error');
      monitor.recordError(testError, 'test_context');
      
      const report = monitor.getReport();
      const errorMetrics = report.metrics.filter(m => m.name === 'error');
      expect(errorMetrics.length).toBe(1);
      expect(errorMetrics[0].tags?.error_message).toBe('Test error');
      expect(errorMetrics[0].tags?.context).toBe('test_context');
    });

    it('應該生成正確的統計報告', () => {
      // 添加一些測試數據
      monitor.startTimer('op1');
      monitor.endTimer('op1');
      monitor.startTimer('op2');
      monitor.endTimer('op2');
      monitor.increment('counter1');
      monitor.recordError(new Error('test'), 'test');
      
      const report = monitor.getReport();
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(typeof report.summary.averageResponseTime).toBe('number');
      expect(typeof report.summary.errorRate).toBe('number');
      expect(Array.isArray(report.summary.slowestOperations)).toBe(true);
    });

    it('應該能夠獲取特定指標的統計信息', () => {
      // 添加多個相同名稱的指標
      monitor.gauge('test_metric', 10);
      monitor.gauge('test_metric', 20);
      monitor.gauge('test_metric', 15);
      
      const stats = monitor.getMetricStats('test_metric');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(3);
      expect(stats!.min).toBe(10);
      expect(stats!.max).toBe(20);
      expect(stats!.average).toBe(15);
    });
  });

  describe('ActivityService', () => {
    const mockPrisma = require('../lib/prisma');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('應該能夠創建活動', async () => {
      const mockActivity = {
        id: 'test-id',
        title: 'Test Activity',
        description: 'Test Description',
        content: { questions: [] },
        status: 'DRAFT',
        userId: 'user-id',
      };

      mockPrisma.activity.create.mockResolvedValue(mockActivity);

      const result = await ActivityService.createActivity({
        title: 'Test Activity',
        description: 'Test Description',
        content: { questions: [] },
        userId: 'user-id',
      });

      expect(result).toEqual(mockActivity);
      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Activity',
          description: 'Test Description',
          content: { questions: [] },
          templateId: undefined,
          userId: 'user-id',
          status: 'DRAFT',
        },
      });
    });

    it('應該能夠獲取用戶活動', async () => {
      const mockActivities = [
        { id: '1', title: 'Activity 1' },
        { id: '2', title: 'Activity 2' },
      ];

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);
      mockPrisma.activity.count.mockResolvedValue(2);

      const result = await ActivityService.getUserActivities('user-id', 1, 10);

      expect(result.activities).toEqual(mockActivities);
      expect(result.total).toBe(2);
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('應該在更新活動時檢查權限', async () => {
      // 模擬活動不存在的情況
      mockPrisma.activity.findUnique.mockResolvedValue(null);

      await expect(
        ActivityService.updateActivity('activity-id', { title: 'New Title' }, 'user-id')
      ).rejects.toThrow('無權限更新此活動');
    });

    it('應該在刪除活動時檢查權限', async () => {
      // 模擬用戶沒有權限的情況
      mockPrisma.activity.findUnique.mockResolvedValue({ userId: 'other-user-id' });

      await expect(
        ActivityService.deleteActivity('activity-id', 'user-id')
      ).rejects.toThrow('無權限刪除此活動');
    });
  });
});

describe('集成測試', () => {
  it('應該能夠組合使用緩存和性能監控', async () => {
    const cache = new CacheManager({ ttl: 1000 });
    const monitor = new PerformanceMonitor();

    // 模擬一個需要緩存的昂貴操作
    const expensiveOperation = async (key: string) => {
      return monitor.measureAsync('expensive_op', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return `result_for_${key}`;
      });
    };

    // 第一次調用 - 應該執行操作
    const result1 = await cache.getOrSet('test_key', () => expensiveOperation('test'));
    expect(result1).toBe('result_for_test');

    // 第二次調用 - 應該從緩存返回
    const start = Date.now();
    const result2 = await cache.getOrSet('test_key', () => expensiveOperation('test'));
    const duration = Date.now() - start;

    expect(result2).toBe('result_for_test');
    expect(duration).toBeLessThan(10); // 緩存應該很快

    // 檢查性能監控記錄
    const report = monitor.getReport();
    expect(report.metrics.some(m => m.name === 'expensive_op')).toBe(true);

    cache.clear();
    monitor.clear();
  });
});
