const fs = require('fs');

console.log('🔍 深度分析 Phaser 遊戲結構和 TouchControls 整合方案...');

// 讀取壓縮的 JavaScript 文件
const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const htmlFile = 'public/games/starshake-game/dist/index.html';

try {
    const jsContent = fs.readFileSync(jsFile, 'utf8');
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    console.log('📊 文件大小分析:');
    console.log(`  - JavaScript: ${jsContent.length} 字符`);
    console.log(`  - HTML: ${htmlContent.length} 字符`);
    
    // 分析 Phaser 遊戲結構
    console.log('\n🎮 Phaser 遊戲結構分析:');
    
    // 1. 場景分析
    const scenes = [
        { name: 'bootloader', class: 'class t extends Phaser.Scene' },
        { name: 'splash', class: 'class h extends Phaser.Scene' },
        { name: 'transition', class: 'class a extends Phaser.Scene' },
        { name: 'game', class: 'class f extends Phaser.Scene' },
        { name: 'outro', class: 'class s extends Phaser.Scene' }
    ];
    
    console.log('📋 場景列表:');
    scenes.forEach(scene => {
        const hasScene = jsContent.includes(scene.class);
        console.log(`  - ${scene.name}: ${hasScene ? '✅' : '❌'}`);
    });
    
    // 2. Player 類分析
    console.log('\n👤 Player 類分析:');
    const playerClassMatch = jsContent.match(/class g extends Phaser\.GameObjects\.Sprite\{[^}]+\}/);
    if (playerClassMatch) {
        console.log('✅ 找到 Player 類 (class g)');
        
        // 分析 Player 類的方法
        const playerMethods = [
            'constructor',
            'setControls',
            'update',
            'shoot',
            'spawnShadow',
            'init'
        ];
        
        console.log('🔧 Player 類方法:');
        playerMethods.forEach(method => {
            const hasMethod = jsContent.includes(method);
            console.log(`  - ${method}: ${hasMethod ? '✅' : '❌'}`);
        });
        
        // 分析當前的控制邏輯
        console.log('\n🎯 當前控制邏輯分析:');
        const controlPatterns = [
            { name: '方向鍵左', pattern: 'cursor.left.isDown' },
            { name: '方向鍵右', pattern: 'cursor.right.isDown' },
            { name: '方向鍵上', pattern: 'cursor.up.isDown' },
            { name: '方向鍵下', pattern: 'cursor.down.isDown' },
            { name: 'SPACE 鍵射擊', pattern: 'JustDown(this.SPACE)' },
            { name: '動畫控制', pattern: 'anims.play' },
            { name: '位置更新', pattern: 'this.x-=5' }
        ];
        
        controlPatterns.forEach(pattern => {
            const hasPattern = jsContent.includes(pattern.pattern);
            console.log(`  - ${pattern.name}: ${hasPattern ? '✅' : '❌'}`);
        });
        
    } else {
        console.log('❌ 未找到 Player 類');
    }
    
    // 3. TouchControls 分析
    console.log('\n📱 TouchControls 分析:');
    const touchControlsFeatures = [
        { name: 'TouchControls 類', pattern: 'class TouchControls' },
        { name: 'getInputState 方法', pattern: 'getInputState()' },
        { name: '虛擬搖桿', pattern: 'touch-joystick' },
        { name: '射擊按鈕', pattern: 'touch-shoot' },
        { name: '全螢幕按鈕', pattern: 'fullscreen-btn' },
        { name: '觸摸事件', pattern: 'touchstart' },
        { name: '媒體查詢', pattern: '@media (max-width: 768px)' }
    ];
    
    touchControlsFeatures.forEach(feature => {
        const hasFeature = htmlContent.includes(feature.pattern);
        console.log(`  - ${feature.name}: ${hasFeature ? '✅' : '❌'}`);
    });
    
    // 4. 整合方案分析
    console.log('\n🔗 TouchControls 整合方案分析:');
    
    console.log('\n📋 方案 1: 在 Player.update() 中添加觸摸控制邏輯');
    console.log('優點:');
    console.log('  ✅ 與現有鍵盤控制並行工作');
    console.log('  ✅ 邏輯集中在一個地方');
    console.log('  ✅ 容易維護和調試');
    console.log('缺點:');
    console.log('  ❌ 需要修改壓縮的 JavaScript 文件');
    console.log('  ❌ 風險較高，可能破壞現有功能');
    
    console.log('\n📋 方案 2: 創建獨立的觸摸控制處理器');
    console.log('優點:');
    console.log('  ✅ 不修改原始遊戲代碼');
    console.log('  ✅ 風險較低');
    console.log('  ✅ 可以獨立測試');
    console.log('缺點:');
    console.log('  ❌ 需要模擬鍵盤事件');
    console.log('  ❌ 可能有延遲或衝突');
    
    console.log('\n📋 方案 3: 混合方案 - 最小化修改');
    console.log('優點:');
    console.log('  ✅ 平衡風險和效果');
    console.log('  ✅ 只在關鍵位置添加代碼');
    console.log('  ✅ 保持原有架構');
    console.log('缺點:');
    console.log('  ❌ 仍需要修改壓縮文件');
    
    // 5. 具體實現建議
    console.log('\n💡 具體實現建議:');
    
    console.log('\n🎯 推薦方案: 方案 1 - 在 Player.update() 中整合');
    console.log('實現步驟:');
    console.log('1. 在 Player 類的 update 方法開始處添加 TouchControls 檢查');
    console.log('2. 讀取 window.touchControls.getInputState()');
    console.log('3. 根據觸摸狀態更新 player 位置和動畫');
    console.log('4. 處理射擊邏輯');
    console.log('5. 保持與鍵盤控制的兼容性');
    
    console.log('\n📝 代碼整合位置:');
    console.log('目標: Player 類的 update 方法');
    console.log('位置: update(e,t){this.death||( ... 這裡添加觸摸控制邏輯');
    
    console.log('\n🔧 整合代碼模板:');
    console.log(`
// TouchControls 整合代碼模板
if(window.touchControls){
    const touchState = window.touchControls.getInputState();
    
    // 移動控制
    if(Math.abs(touchState.direction.x) > 0.1) {
        if(touchState.direction.x < 0) {
            this.x -= 5;
            this.anims.play(this.name + "left", true);
        } else {
            this.x += 5;
            this.anims.play(this.name + "right", true);
        }
    }
    
    if(Math.abs(touchState.direction.y) > 0.1) {
        if(touchState.direction.y < 0) {
            this.y -= 5;
        } else {
            this.y += 5;
        }
    }
    
    // 射擊控制
    if(touchState.shooting && !this.lastTouchShoot) {
        this.shoot();
    }
    this.lastTouchShoot = touchState.shooting;
}
    `);
    
    // 6. 風險評估
    console.log('\n⚠️ 風險評估:');
    console.log('🔴 高風險:');
    console.log('  - 修改壓縮的 JavaScript 可能導致語法錯誤');
    console.log('  - 可能影響現有的鍵盤控制');
    console.log('  - 調試困難');
    
    console.log('🟡 中風險:');
    console.log('  - TouchControls 和鍵盤控制可能衝突');
    console.log('  - 性能影響');
    
    console.log('🟢 低風險:');
    console.log('  - TouchControls 類已經完整實現');
    console.log('  - 有完整的備份機制');
    
    // 7. 測試策略
    console.log('\n🧪 測試策略:');
    console.log('1. 先在開發環境測試');
    console.log('2. 確保鍵盤控制仍然正常');
    console.log('3. 測試觸摸控制響應性');
    console.log('4. 測試移動設備兼容性');
    console.log('5. 測試 iframe 環境');
    
    console.log('\n🎉 分析完成！建議使用方案 1 進行整合。');
    
} catch (error) {
    console.error('❌ 分析過程中發生錯誤:', error.message);
}
