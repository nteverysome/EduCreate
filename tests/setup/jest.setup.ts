/**
 * Jest 測試設置文件
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 配置測試環境和全局 Mock
 */

import '@testing-library/jest-dom';

// Mock Phaser 全局對象
global.Phaser = {
  Scene: class MockScene {
    add = {
      particles: jest.fn().mockReturnValue({
        setPosition: jest.fn(),
        explode: jest.fn(),
        destroy: jest.fn(),
        quantity: 15
      }),
      text: jest.fn().mockReturnValue({
        destroy: jest.fn()
      }),
      rectangle: jest.fn().mockReturnValue({
        setDepth: jest.fn(),
        destroy: jest.fn()
      }),
      image: jest.fn().mockReturnValue({
        setCollideWorldBounds: jest.fn(),
        body: {
          setDrag: jest.fn(),
          setMaxSpeed: jest.fn()
        }
      }),
      sprite: jest.fn().mockReturnValue({
        play: jest.fn(),
        setFrame: jest.fn(),
        setPosition: jest.fn(),
        setScale: jest.fn(),
        destroy: jest.fn(),
        body: {
          setDrag: jest.fn(),
          setMaxSpeed: jest.fn()
        }
      }),
      existing: jest.fn().mockReturnValue({
        setPosition: jest.fn(),
        setScale: jest.fn(),
        destroy: jest.fn()
      })
    };
    
    sound = {
      play: jest.fn().mockReturnValue({
        setVolume: jest.fn(),
        volume: 0.7
      }),
      get: jest.fn().mockReturnValue(true)
    };
    
    cameras = {
      main: {
        shake: jest.fn(),
        width: 800,
        height: 600,
        centerX: 400,
        centerY: 300
      }
    };
    
    tweens = {
      add: jest.fn().mockReturnValue({
        on: jest.fn()
      })
    };
    
    physics = {
      add: {
        image: jest.fn().mockReturnValue({
          setCollideWorldBounds: jest.fn(),
          body: {
            setDrag: jest.fn(),
            setMaxSpeed: jest.fn(),
            setAcceleration: jest.fn(),
            setVelocityX: jest.fn()
          }
        }),
        group: jest.fn().mockReturnValue({
          create: jest.fn().mockReturnValue({
            setScale: jest.fn(),
            setTint: jest.fn(),
            setData: jest.fn(),
            getData: jest.fn(),
            destroy: jest.fn(),
            setActive: jest.fn(),
            setVisible: jest.fn(),
            x: 100,
            y: 100,
            body: {
              setVelocityX: jest.fn()
            }
          }),
          children: {
            entries: []
          }
        }),
        overlap: jest.fn()
      }
    };
    
    cache = {
      audio: {
        exists: jest.fn().mockReturnValue(true)
      }
    };
    
    load = {
      audio: jest.fn()
    };
    
    time = {
      addEvent: jest.fn().mockReturnValue({
        destroy: jest.fn()
      })
    };
  },
  
  Math: {
    Between: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
    Distance: {
      Between: jest.fn((x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2))
    },
    Vector2: class MockVector2 {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }

      distance(other) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
      }

      normalize() {
        const length = Math.sqrt(this.x ** 2 + this.y ** 2);
        if (length > 0) {
          this.x /= length;
          this.y /= length;
        }
        return this;
      }
    }
  },
  
  GameObjects: {
    Image: class MockImage {
      x = 0;
      y = 0;
      setData = jest.fn();
      getData = jest.fn();
      destroy = jest.fn();
      setActive = jest.fn();
      setVisible = jest.fn();
    },
    
    Sprite: class MockSprite {
      x = 0;
      y = 0;
      setData = jest.fn();
      getData = jest.fn();
      destroy = jest.fn();
      setActive = jest.fn();
      setVisible = jest.fn();
    },
    
    Particles: {
      ParticleEmitter: class MockParticleEmitter {
        setPosition = jest.fn();
        explode = jest.fn();
        destroy = jest.fn();
        quantity = 15;
      }
    }
  },
  
  Physics: {
    Arcade: {
      Body: class MockBody {
        setDrag = jest.fn();
        setMaxSpeed = jest.fn();
        setAcceleration = jest.fn();
        setVelocityX = jest.fn();
      }
    }
  },
  
  Sound: {
    BaseSound: class MockBaseSound {
      setVolume = jest.fn();
      volume = 0.7;
      destroy = jest.fn();
    }
  }
} as any;

// Mock Navigator API
Object.defineProperty(global.navigator, 'vibrate', {
  value: jest.fn(),
  writable: true
});

// Mock Performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => [])
  },
  writable: true
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock console methods for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// 測試前清理
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  
  // 重置 localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // 重置 sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // 重置 console mocks
  (console.log as jest.Mock).mockClear();
  (console.warn as jest.Mock).mockClear();
  (console.error as jest.Mock).mockClear();
  (console.info as jest.Mock).mockClear();
  (console.debug as jest.Mock).mockClear();
});

// 測試後清理
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// 全局測試工具
global.testUtils = {
  // 等待異步操作
  waitFor: async (ms: number = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // 創建 Mock 事件
  createMockEvent: (type: string, data: any = {}) => ({
    type,
    timestamp: Date.now(),
    ...data
  }),
  
  // 創建 Mock 精靈
  createMockSprite: (data: any = {}) => ({
    x: 100,
    y: 100,
    setData: jest.fn(),
    getData: jest.fn().mockImplementation((key: string) => data[key]),
    destroy: jest.fn(),
    setActive: jest.fn(),
    setVisible: jest.fn(),
    ...data
  }),

  // 創建 Mock 場景
  createMockScene: (overrides: any = {}) => ({
    add: {
      particles: jest.fn().mockReturnValue({
        setPosition: jest.fn(),
        explode: jest.fn(),
        destroy: jest.fn(),
        quantity: 15
      }),
      text: jest.fn().mockReturnValue({
        destroy: jest.fn()
      }),
      rectangle: jest.fn().mockReturnValue({
        setDepth: jest.fn(),
        destroy: jest.fn()
      }),
      sprite: jest.fn().mockReturnValue({
        play: jest.fn(),
        setFrame: jest.fn(),
        setPosition: jest.fn(),
        setScale: jest.fn(),
        destroy: jest.fn()
      }),
      existing: jest.fn().mockReturnValue({
        setPosition: jest.fn(),
        setScale: jest.fn(),
        destroy: jest.fn()
      })
    },
    sound: {
      play: jest.fn().mockReturnValue({
        setVolume: jest.fn(),
        volume: 0.7
      }),
      get: jest.fn().mockReturnValue(true)
    },
    cameras: {
      main: {
        shake: jest.fn(),
        width: 800,
        height: 600,
        centerX: 400,
        centerY: 300
      }
    },
    ...overrides
  }),
  
  // 模擬時間流逝
  advanceTime: (ms: number) => {
    jest.advanceTimersByTime(ms);
  }
};

// 類型聲明
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        waitFor: (ms?: number) => Promise<void>;
        createMockEvent: (type: string, data?: any) => any;
        createMockSprite: (data?: any) => any;
        advanceTime: (ms: number) => void;
      };
    }
  }
}
