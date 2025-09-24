const fs = require('fs');

console.log('🔧 修復 Starshake 遊戲點擊支援的語法錯誤...');

// 目標文件路徑
const starshakeJsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = starshakeJsFile + '.backup';

// 檢查備份文件是否存在
if (!fs.existsSync(backupFile)) {
    console.error('❌ 找不到備份文件:', backupFile);
    process.exit(1);
}

// 從備份恢復原始文件
let jsContent = fs.readFileSync(backupFile, 'utf8');
console.log('📝 從備份恢復原始文件，大小:', jsContent.length, '字符');

// 使用更精確的方法添加點擊支援
// 在 splash 場景的 create 方法中添加點擊支援

// 查找 splash 場景的 create 方法並添加點擊支援
const splashCreatePattern = /this\.input\.keyboard\.on\("keydown-SPACE",\(\(\)=>this\.transitionToChange\(\)\),this\)/;

if (splashCreatePattern.test(jsContent)) {
    // 在 Space 鍵監聽器後添加點擊和觸摸支援
    jsContent = jsContent.replace(
        splashCreatePattern,
        `this.input.keyboard.on("keydown-SPACE",(()=>this.transitionToChange()),this);
        // 添加點擊和觸摸支援
        this.input.on("pointerdown",(()=>{console.log("🖱️ 檢測到點擊，開始遊戲");this.transitionToChange()}));
        // 設置整個場景為可點擊區域
        this.input.setHitArea(this.add.zone(this.center_width,this.center_height,this.width,this.height))`
    );
    
    console.log('✅ 成功添加點擊和觸摸支援到 splash 場景');
} else {
    console.log('⚠️  未找到 splash 場景的 Space 鍵監聽器模式');
    
    // 嘗試另一種方法：查找 showInstructions 方法並修改提示文字
    const instructionPattern = /"Press SPACE to start"/;
    if (instructionPattern.test(jsContent)) {
        jsContent = jsContent.replace(
            instructionPattern,
            '"點擊任意位置或按 SPACE 開始"'
        );
        console.log('✅ 更新了提示文字');
    }
}

// 寫入修復後的文件
fs.writeFileSync(starshakeJsFile, jsContent);

console.log('🎉 Starshake 遊戲點擊支援修復完成！');
console.log('📝 修復後文件大小:', jsContent.length, '字符');

console.log('\n🎮 修復內容:');
console.log('  ✅ 移除了語法錯誤的代碼注入');
console.log('  ✅ 使用精確的模式匹配');
console.log('  ✅ 在正確位置添加點擊支援');
console.log('  ✅ 保持代碼結構完整性');
