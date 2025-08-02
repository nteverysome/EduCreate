/**
 * Jest 測試配置
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 為 AirplaneCollisionGame 組件配置完整的測試環境
 */

module.exports = {
  // 測試環境
  testEnvironment: 'jsdom',
  
  // 根目錄
  rootDir: '../',
  
  // 測試文件匹配模式
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx'
  ],
  
  // 模組文件擴展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // TypeScript 轉換
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  
  // 模組名稱映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // 設置文件
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts'
  ],
  
  // 覆蓋率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'components/games/AirplaneCollisionGame/**/*.{ts,tsx}',
    'lib/gept/**/*.{ts,tsx}',
    'lib/memory-enhancement/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**'
  ],
  
  // 覆蓋率報告
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // 覆蓋率閾值
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './components/games/AirplaneCollisionGame/': {
      branches: 95,
      functions: 100,
      lines: 98,
      statements: 98
    }
  },
  
  // 忽略的路徑
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/build/'
  ],
  
  // 模組路徑忽略
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/build/'
  ],
  
  // 清理 mock
  clearMocks: true,
  restoreMocks: true,
  
  // 測試超時
  testTimeout: 10000,
  
  // 詳細輸出
  verbose: true,
  
  // 錯誤時停止
  bail: false,
  
  // 最大並發數
  maxConcurrency: 5,
  
  // 快照序列化器
  snapshotSerializers: [],
  
  // 預設配置
  preset: 'ts-jest',
  
  // 測試結果處理器
  testResultsProcessor: undefined,
  
  // 自定義解析器
  resolver: undefined,
  
  // 監視插件
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // 通知配置
  notify: false,
  notifyMode: 'failure-change',
  
  // 快取配置
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // 錯誤報告
  errorOnDeprecated: true,
  
  // 測試套件配置
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'functional',
      testMatch: ['<rootDir>/tests/functional/**/*.test.ts'],
      testEnvironment: 'node'
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
      testEnvironment: 'node'
    },
    {
      displayName: 'accessibility',
      testMatch: ['<rootDir>/tests/accessibility/**/*.test.ts'],
      testEnvironment: 'jsdom'
    }
  ]
};
