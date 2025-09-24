const fs = require('fs');

console.log('🔧 修復 TouchControls 整合的語法錯誤...');

const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';

try {
    const content = fs.readFileSync(jsFile, 'utf8');
    
    console.log('🔍 分析語法錯誤...');
    
    // 檢查第37行的問題
    const lines = content.split('\n');
    console.log(`第36行: ${lines[35]}`);
    console.log(`第37行: ${lines[36]}`);
    
    // 問題：第37行直接連接了 } 和 this.cursor，缺少分號或適當的分隔符
    // 修復：在 TouchControls 整合代碼塊結束後添加分號
    
    const fixedContent = content.replace(
        /this\.lastTouchShoot = touchState\.shooting;\s*\}this\.cursor\.left\.isDown/,
        'this.lastTouchShoot = touchState.shooting;\n}\n// 鍵盤控制邏輯\nthis.cursor.left.isDown'
    );
    
    if (fixedContent !== content) {
        fs.writeFileSync(jsFile, fixedContent, 'utf8');
        console.log('✅ 語法錯誤已修復');
        console.log('📝 修復內容: 在 TouchControls 代碼塊後添加適當的分隔符');
    } else {
        console.log('⚠️ 未找到預期的語法錯誤模式，嘗試其他修復方法...');
        
        // 備選修復方法：確保 TouchControls 代碼塊正確結束
        const alternativeFixedContent = content.replace(
            /\}this\.cursor\.left\.isDown/,
            '}\n// 鍵盤控制邏輯\nthis.cursor.left.isDown'
        );
        
        if (alternativeFixedContent !== content) {
            fs.writeFileSync(jsFile, alternativeFixedContent, 'utf8');
            console.log('✅ 使用備選方法修復語法錯誤');
        } else {
            console.log('❌ 無法自動修復語法錯誤');
            
            // 顯示問題區域
            const problemArea = content.substring(
                content.indexOf('this.lastTouchShoot = touchState.shooting;') - 50,
                content.indexOf('this.cursor.left.isDown') + 100
            );
            console.log('🔍 問題區域:');
            console.log(problemArea);
        }
    }
    
} catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error.message);
}

console.log('🎉 語法錯誤修復完成！');
