import { vi } from 'vitest';

// Mock Phaser 3
const mockPhaser = {
  Game: vi.fn().mockImplementation(() => ({
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    },
    scene: {
      add: vi.fn(),
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    },
    destroy: vi.fn()
  })),
  Scene: vi.fn().mockImplementation(() => ({
    add: {
      image: vi.fn(),
      text: vi.fn(),
      graphics: vi.fn(),
      container: vi.fn(),
      existing: vi.fn()
    },
    load: {
      image: vi.fn(),
      audio: vi.fn(),
      json: vi.fn(),
      on: vi.fn(),
      start: vi.fn()
    },
    physics: {
      add: {
        existing: vi.fn(),
        overlap: vi.fn(),
        group: vi.fn()
      }
    },
    input: {
      keyboard: {
        createCursorKeys: vi.fn(),
        addKey: vi.fn()
      },
      on: vi.fn()
    },
    cameras: {
      main: {
        width: 800,
        height: 600
      }
    },
    tweens: {
      add: vi.fn(),
      getAllTweens: vi.fn(() => [])
    },
    sound: {
      play: vi.fn(),
      sounds: []
    },
    time: {
      addEvent: vi.fn(),
      delayedCall: vi.fn()
    },
    textures: {
      list: {},
      addCanvas: vi.fn()
    }
  })),
  AUTO: 'AUTO',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH'
  },
  GameObjects: {
    Container: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      setSize: vi.fn(),
      setInteractive: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn(),
      destroy: vi.fn(),
      listenerCount: vi.fn(() => 0),
      x: 0,
      y: 0
    })),
    Graphics: vi.fn(),
    Text: vi.fn(),
    Image: vi.fn()
  },
  Events: {
    EventEmitter: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn()
    }))
  },
  Physics: {
    Arcade: {
      World: vi.fn()
    }
  },
  Math: {
    Between: vi.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min)
  }
};

vi.mock('phaser', () => ({
  default: mockPhaser
}));

// Mock Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    quadraticCurveTo: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn()
  }))
});

// Mock HTMLCanvasElement.toDataURL
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

// Mock Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createBuffer: vi.fn(() => ({})),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn()
  })),
  destination: {}
}));

// Mock fetch API
global.fetch = vi.fn();

// Mock performance API
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
  },
  configurable: true
});

// Mock FontFace API
global.FontFace = vi.fn().mockImplementation(() => ({
  load: vi.fn().mockResolvedValue(undefined)
}));

global.document.fonts = {
  add: vi.fn()
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Console setup for tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress expected errors in tests
  if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
    return;
  }
  originalConsoleError(...args);
};

// Test utilities
export const createMockScene = () => {
  return new mockPhaser.Scene();
};

export const createMockGame = () => {
  return new mockPhaser.Game();
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
