/**
 * ESLint 自動修復配置工具
 * 設置 ESLint 規則來自動檢測和修復常見語法問題
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ESLint 配置
const eslintConfig = {
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    // 箭頭函數相關規則
    "prefer-arrow-callback": ["error", { "allowNamedFunctions": false }],
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "arrow-parens": ["error", "as-needed"],
    
    // 函數聲明規則
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    
    // 自動修復規則
    "semi": ["error", "always"],
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "comma-dangle": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    
    // TypeScript 特定規則
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    
    // React 相關規則
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  }
};

// Prettier 配置
const prettierConfig = {
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
};

// 需要安裝的依賴
const dependencies = [
  'eslint',
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  'eslint-config-next',
  'prettier',
  'eslint-config-prettier',
  'eslint-plugin-prettier'
];

// 檢查是否已安裝依賴
function checkDependencies() {
  console.log('📦 檢查 ESLint 相關依賴...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const installed = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  
  const missing = dependencies.filter(dep => !installed.has(dep));
  
  if (missing.length > 0) {
    console.log(`❌ 缺少依賴: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ 所有依賴已安裝');
  return true;
}

// 安裝缺少的依賴
function installDependencies() {
  console.log('📦 安裝 ESLint 相關依賴...');
  
  try {
    execSync(`npm install --save-dev ${dependencies.join(' ')}`, {
      stdio: 'inherit',
      timeout: 300000 // 5 分鐘超時
    });
    console.log('✅ 依賴安裝完成');
    return true;
  } catch (error) {
    console.error('❌ 依賴安裝失敗:', error.message);
    return false;
  }
}

// 設置 ESLint 配置
function setupEslintConfig() {
  console.log('⚙️ 設置 ESLint 配置...');
  
  // 備份現有配置
  const eslintConfigPath = '.eslintrc.json';
  if (fs.existsSync(eslintConfigPath)) {
    const backup = `${eslintConfigPath}.backup.${Date.now()}`;
    fs.copyFileSync(eslintConfigPath, backup);
    console.log(`📁 已備份現有配置: ${backup}`);
  }
  
  // 寫入新配置
  fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
  console.log('✅ ESLint 配置已更新');
}

// 設置 Prettier 配置
function setupPrettierConfig() {
  console.log('⚙️ 設置 Prettier 配置...');
  
  const prettierConfigPath = '.prettierrc.json';
  if (fs.existsSync(prettierConfigPath)) {
    const backup = `${prettierConfigPath}.backup.${Date.now()}`;
    fs.copyFileSync(prettierConfigPath, backup);
    console.log(`📁 已備份現有配置: ${backup}`);
  }
  
  fs.writeFileSync(prettierConfigPath, JSON.stringify(prettierConfig, null, 2));
  console.log('✅ Prettier 配置已更新');
}

// 添加 npm scripts
function addNpmScripts() {
  console.log('📝 添加 npm scripts...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 備份 package.json
  const backup = `package.json.backup.${Date.now()}`;
  fs.copyFileSync('package.json', backup);
  console.log(`📁 已備份 package.json: ${backup}`);
  
  // 添加 scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'lint': 'eslint . --ext .ts,.tsx,.js,.jsx',
    'lint:fix': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
    'format': 'prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"',
    'format:check': 'prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}"',
    'fix:all': 'npm run lint:fix && npm run format'
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ npm scripts 已添加');
}

// 運行自動修復
function runAutoFix() {
  console.log('🔧 運行自動修復...');
  
  try {
    // 先運行 ESLint 自動修復
    console.log('📋 運行 ESLint 自動修復...');
    execSync('npm run lint:fix', { stdio: 'inherit', timeout: 120000 });
    
    // 再運行 Prettier 格式化
    console.log('🎨 運行 Prettier 格式化...');
    execSync('npm run format', { stdio: 'inherit', timeout: 120000 });
    
    console.log('✅ 自動修復完成');
    return true;
  } catch (error) {
    console.error('❌ 自動修復失敗:', error.message);
    return false;
  }
}

// 生成修復報告
function generateReport() {
  console.log('📊 生成修復報告...');
  
  try {
    // 運行 lint 檢查
    const lintOutput = execSync('npm run lint', { 
      encoding: 'utf8',
      timeout: 60000 
    });
    
    console.log('✅ 沒有發現 ESLint 錯誤');
    return { success: true, errors: [] };
    
  } catch (error) {
    const output = error.stdout + error.stderr;
    const errors = output.split('\n').filter(line => 
      line.includes('error') || line.includes('warning')
    );
    
    console.log(`⚠️ 發現 ${errors.length} 個 ESLint 問題`);
    return { success: false, errors };
  }
}

// 主函數
function main() {
  console.log('🚀 開始設置 ESLint 自動修復...');
  
  // 檢查依賴
  if (!checkDependencies()) {
    console.log('📦 安裝缺少的依賴...');
    if (!installDependencies()) {
      console.error('❌ 依賴安裝失敗，請手動安裝');
      return;
    }
  }
  
  // 設置配置
  setupEslintConfig();
  setupPrettierConfig();
  addNpmScripts();
  
  // 運行自動修復
  console.log('\n🔧 開始自動修復...');
  const fixSuccess = runAutoFix();
  
  // 生成報告
  const report = generateReport();
  
  console.log('\n📊 修復結果:');
  if (report.success) {
    console.log('✅ 所有問題已修復');
  } else {
    console.log(`⚠️ 還有 ${report.errors.length} 個問題需要手動處理`);
    report.errors.slice(0, 5).forEach(error => {
      console.log(`  ${error}`);
    });
    if (report.errors.length > 5) {
      console.log(`  ... 還有 ${report.errors.length - 5} 個問題`);
    }
  }
  
  console.log('\n🎉 ESLint 自動修復設置完成！');
  console.log('\n📝 可用命令:');
  console.log('  npm run lint        - 檢查代碼問題');
  console.log('  npm run lint:fix    - 自動修復 ESLint 問題');
  console.log('  npm run format      - 格式化代碼');
  console.log('  npm run fix:all     - 運行所有自動修復');
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = { main, runAutoFix, generateReport };
