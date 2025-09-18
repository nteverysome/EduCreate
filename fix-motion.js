const fs = require('fs');
const path = require('path');

// 要修復的文件列表
const filesToFix = [
  'pages/activities/[id].tsx'
];

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`修復文件: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // 替換所有 motion 組件和清理多餘的括號
    content = content
      .replace(/<motion\.div/g, '<div')
      .replace(/<\/motion\.div>/g, '</div>')
      .replace(/<motion\.img/g, '<img')
      .replace(/whileHover=\{[^}]*\}/g, '')
      .replace(/initial=\{[^}]*\}/g, '')
      .replace(/animate=\{[^}]*\}/g, '')
      .replace(/transition=\{[^}]*\}/g, '')
      .replace(/exit=\{[^}]*\}/g, '')
      // 清理多餘的括號和空行
      .replace(/\s*}\s*}\s*}/g, '')
      .replace(/\s*}\s*}/g, '')
      .replace(/className="[^"]*"\s*}\s*>/g, (match) => {
        return match.replace(/\s*}\s*>/g, '>');
      })
      // 修復常見的語法錯誤
      .replace(/(\w+)=\{[^}]*\}\s*}\s*>/g, '$1>');

    fs.writeFileSync(filePath, content);
    console.log(`✅ 修復完成: ${filePath}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
});

console.log('所有文件修復完成！');
