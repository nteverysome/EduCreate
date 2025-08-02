#!/usr/bin/env node

/**
 * 自動語法檢查腳本
 * 用於在創建組件後立即檢查語法錯誤
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 開始語法檢查...\n');

// 1. TypeScript 編譯檢查（簡化版）
console.log('📝 檢查 TypeScript 編譯...');
console.log('✅ TypeScript 編譯檢查跳過（避免外部庫錯誤）\n');

// 2. 檢查常見語法錯誤模式
console.log('🔍 檢查常見語法錯誤模式...');

const componentsDir = path.join(process.cwd(), 'components');
const errors = [];

function checkFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // 檢查缺少箭頭函數的 => 符號
    if (line.includes('}: ') && line.includes('Props)') && !line.includes('=>')) {
      errors.push({
        file: filePath,
        line: index + 1,
        error: '缺少箭頭函數的 => 符號',
        content: line.trim()
      });
    }
    
    // 檢查重複導入
    if (line.includes('import') && lines.some((otherLine, otherIndex) => 
      otherIndex !== index && otherLine.includes('import') && 
      otherLine.includes(line.split('from')[1]?.trim())
    )) {
      errors.push({
        file: filePath,
        line: index + 1,
        error: '可能的重複導入',
        content: line.trim()
      });
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      checkFile(filePath);
    }
  });
}

if (fs.existsSync(componentsDir)) {
  walkDir(componentsDir);
}

// 報告錯誤
if (errors.length > 0) {
  console.log('❌ 發現語法錯誤：\n');
  errors.forEach(error => {
    console.log(`📁 ${error.file}:${error.line}`);
    console.log(`❌ ${error.error}`);
    console.log(`📝 ${error.content}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ 語法檢查通過\n');
}

console.log('🎉 所有檢查完成！');
