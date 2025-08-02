module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // TypeScript 規則
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 一般規則
    'no-console': 'off', // 遊戲開發中需要 console.log
    'no-debugger': 'warn',
    'no-unused-vars': 'off', // 使用 TypeScript 版本
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Prettier 整合
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      endOfLine: 'auto'
    }],
    
    // 遊戲開發特定規則
    'no-magic-numbers': ['warn', { 
      ignore: [0, 1, -1, 2, 10, 100, 1000],
      ignoreArrayIndexes: true 
    }],
    'max-lines-per-function': ['warn', { max: 100 }],
    'complexity': ['warn', { max: 15 }]
  },
  
  // 針對不同文件類型的特殊規則
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      files: ['vite.config.ts', '*.config.js'],
      rules: {
        'no-magic-numbers': 'off'
      }
    }
  ]
};
