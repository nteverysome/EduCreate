const fs = require('fs');

// 要修復的文件列表
const filesToFix = [
  'components/games/GodotGameEmbed.tsx',
  'components/Navigation.tsx'
];

// Lucide 到 Heroicons 的映射
const iconMapping = {
  'Play': 'PlayIcon',
  'Pause': 'PauseIcon', 
  'RotateCcw': 'ArrowPathIcon',
  'Volume2': 'SpeakerWaveIcon',
  'VolumeX': 'SpeakerXMarkIcon',
  'GamepadIcon': 'PuzzlePieceIcon', // 遊戲相關圖標
  'Home': 'HomeIcon',
  'BookOpen': 'BookOpenIcon',
  'Trophy': 'TrophyIcon'
};

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`修復文件: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 提取當前使用的 lucide 圖標
    const lucideImportMatch = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'lucide-react';/);
    if (lucideImportMatch) {
      const lucideIcons = lucideImportMatch[1].split(',').map(icon => icon.trim());
      const heroicons = lucideIcons.map(icon => iconMapping[icon] || icon).filter(Boolean);
      
      console.log(`  轉換圖標: ${lucideIcons.join(', ')} -> ${heroicons.join(', ')}`);
      
      // 替換導入語句
      content = content.replace(
        /import\s*{\s*[^}]+\s*}\s*from\s*'lucide-react';\s*\n/,
        `import { ${heroicons.join(', ')} } from '@heroicons/react/24/outline';\n`
      );
      
      // 替換圖標使用
      lucideIcons.forEach(lucideIcon => {
        const heroicon = iconMapping[lucideIcon];
        if (heroicon) {
          const regex = new RegExp(`<${lucideIcon}`, 'g');
          content = content.replace(regex, `<${heroicon}`);
        }
      });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ 修復完成: ${filePath}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
});

console.log('\n🎯 所有 lucide-react 替換完成！');
console.log('💡 現在可以移除 lucide-react 依賴了：npm uninstall lucide-react');
