const fs = require('fs');

// 要修復的文件列表
const filesToFix = [
  'components/editor/VersionCompare.tsx',
  'components/editor/VersionHistory.tsx',
  'components/version/EnhancedVersionHistory.tsx'
];

// 替換 date-fns 的工具函數
const dateUtilsCode = `
// 替代 date-fns 的輕量級日期工具函數
const formatDate = (date: Date, formatStr?: string): string => {
  if (formatStr === 'PPP') {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  
  if (diffSec < 60) {
    return '剛剛';
  } else if (diffMin < 60) {
    return \`\${diffMin} 分鐘前\`;
  } else if (diffHour < 24) {
    return \`\${diffHour} 小時前\`;
  } else if (diffDay < 30) {
    return \`\${diffDay} 天前\`;
  } else if (diffMonth < 12) {
    return \`\${diffMonth} 個月前\`;
  } else {
    const diffYear = Math.round(diffDay / 365);
    return \`\${diffYear} 年前\`;
  }
};
`;

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`修復文件: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 移除 date-fns 導入
    content = content
      .replace(/import\s*{\s*format\s*}\s*from\s*'date-fns';\s*\n/g, '')
      .replace(/import\s*{\s*formatDistanceToNow\s*}\s*from\s*'date-fns';\s*\n/g, '')
      .replace(/import\s*{\s*zhTW\s*}\s*from\s*'date-fns\/locale';\s*\n/g, '')
      .replace(/import\s*{\s*format,\s*formatDistanceToNow\s*}\s*from\s*'date-fns';\s*\n/g, '');
    
    // 替換函數調用，移除 locale 參數
    content = content
      .replace(/format\(/g, 'formatDate(')
      .replace(/formatDistanceToNow\(/g, 'formatDistanceToNow(')
      .replace(/, zhTW\)/g, ')') // 移除 locale 參數
      .replace(/, 'PPP', zhTW\)/g, ', "PPP")') // 修復格式字符串
      .replace(/, 'PPP'\)/g, ', "PPP")'); // 修復格式字符串
    
    // 在第一個 import 後添加工具函數
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // 找到最後一個 import 語句的位置
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    // 插入工具函數
    lines.splice(insertIndex, 0, dateUtilsCode);
    content = lines.join('\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ 修復完成: ${filePath}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
});

console.log('\n🎯 所有 date-fns 替換完成！');
