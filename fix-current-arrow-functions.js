/**
 * 修復當前 TypeScript 編譯錯誤中的箭頭函數語法問題
 */

const fs = require('fs');
const path = require('path');

// 需要修復的文件列表（基於 TypeScript 編譯錯誤）
const filesToFix = [
  'components/collaboration/EnhancedCollaborationPanel.tsx',
  'components/editor/DragDropEditor.tsx',
  'components/ShareModal.tsx',
  'components/templates/Flashcard/index.tsx',
  'components/templates/Matching/index.tsx',
  'components/templates/Quiz/index.tsx',
  'components/templates/TemplateConfig.tsx',
  'components/templates/TemplatePreview.tsx',
  'components/upload/EnhancedDragDropUploader.tsx',
  'components/validation/EnhancedContentValidator.tsx',
  'components/version/EnhancedVersionManager.tsx',
  'hooks/useKeyboardShortcuts.tsx'
];

function fixArrowFunctionSyntax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 修復模式1: }: Props) { -> }: Props) => {
    const pattern1 = /(\}: \w+Props\)) \{/g;
    const fixed1 = content.replace(pattern1, '$1 => {');
    if (content !== fixed1) {
      content = fixed1;
      modified = true;
    }
    
    // 修復模式2: const Component = ({ props }: Props) { -> const Component = ({ props }: Props) => {
    const pattern2 = /(const\s+\w+\s*=\s*\([^)]*\):\s*\w+Props\)) \{/g;
    const fixed2 = content.replace(pattern2, '$1 => {');
    if (content !== fixed2) {
      content = fixed2;
      modified = true;
    }
    
    // 修復模式3: export const Component = ({ props }: Props) { -> export const Component = ({ props }: Props) => {
    const pattern3 = /(export\s+const\s+\w+\s*=\s*\([^)]*\):\s*\w+Props\)) \{/g;
    const fixed3 = content.replace(pattern3, '$1 => {');
    if (content !== fixed3) {
      content = fixed3;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
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

console.log('🔧 開始修復箭頭函數語法錯誤...');
console.log(`📁 需要檢查 ${filesToFix.length} 個文件\n`);

let fixedCount = 0;
let totalCount = 0;

filesToFix.forEach(file => {
  totalCount++;
  if (fixArrowFunctionSyntax(file)) {
    fixedCount++;
  }
});

console.log(`\n📊 修復統計:`);
console.log(`   總文件數: ${totalCount}`);
console.log(`   已修復: ${fixedCount}`);
console.log(`   無需修復: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n🔍 建議運行以下命令驗證修復效果:');
  console.log('   npx tsc --noEmit --project tsconfig.json');
} else {
  console.log('\n✅ 所有文件都無需修復！');
}

console.log('✅ 修復完成！');
