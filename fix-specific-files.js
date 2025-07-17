/**
 * 修復特定文件的箭頭函數語法錯誤
 */

const fs = require('fs');
const path = require('path');

// 需要修復的特定文件
const filesToFix = [
  'components/analytics/FolderAnalyticsPanel.tsx',
  'components/content/DragDropFolderTree.tsx',
  'components/content/ShareDialog.tsx',
  'components/folder/FolderCustomizationPanel.tsx',
  'components/permissions/FolderPermissionManager.tsx',
  'components/search/AdvancedSearchInterface.tsx'
];

function fixArrowFunctionSyntax(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 修復 const Component = ({ props }: Props) { 的情況
    // 需要添加 => 
    const constArrowRegex = /(const\s+\w+\s*=\s*\(\{[^}]*\}:\s*\w+Props\))\s*\{/g;
    const fixedConstArrow = content.replace(constArrowRegex, '$1 => {');
    
    if (content !== fixedConstArrow) {
      fs.writeFileSync(fullPath, fixedConstArrow, 'utf8');
      console.log(`✅ 已修復: ${filePath}`);
      return true;
    } else {
      console.log(`⚪ 無需修復: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修復失敗 ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 修復特定文件的箭頭函數語法錯誤...');

let fixedCount = 0;

filesToFix.forEach(file => {
  if (fixArrowFunctionSyntax(file)) {
    fixedCount++;
  }
});

console.log(`\n📊 修復統計:`);
console.log(`   已修復: ${fixedCount}`);
console.log(`   無需修復: ${filesToFix.length - fixedCount}`);
console.log('✅ 修復完成！');
