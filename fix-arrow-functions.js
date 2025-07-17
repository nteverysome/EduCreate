/**
 * 修復箭頭函數語法錯誤的腳本
 */

const fs = require('fs');
const path = require('path');

// 需要修復的文件列表
const filesToFix = [
  'components/ai/AIContentGenerator.tsx',
  'components/ai/IntelligentAssistancePanel.tsx',
  'components/ai/SmartRecommendations.tsx',
  'components/analytics/AnalyticsDashboard.tsx',
  'components/collaboration/CollaborativeEditor.tsx',
  'components/content/EnhancedFolderOrganizer.tsx',
  'components/content/EnhancedUniversalContentEditor.tsx',
  'components/content/GameOptionsConfigurator.tsx',
  'components/content/VisualStyleSelector.tsx',
  'components/editor/EditorToolbar.tsx'
];

function fixArrowFunctionSyntax(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 修復箭頭函數語法錯誤
    // 將 "}: Props) => {" 替換為 "}: Props) {"
    const regex = /(\}: \w+Props\)) => \{/g;
    const fixedContent = content.replace(regex, '$1 {');
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ 已修復: ${filePath}`);
    } else {
      console.log(`⚪ 無需修復: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 修復失敗 ${filePath}:`, error.message);
  }
}

console.log('🔧 開始修復箭頭函數語法錯誤...');

filesToFix.forEach(fixArrowFunctionSyntax);

console.log('✅ 修復完成！');
