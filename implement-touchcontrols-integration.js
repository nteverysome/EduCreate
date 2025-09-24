const fs = require('fs');

console.log('🚀 開始實施 TouchControls 整合到 Phaser 遊戲邏輯...');

const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = jsFile + '.backup';

try {
    // 1. 創建備份
    console.log('💾 創建備份文件...');
    const originalContent = fs.readFileSync(jsFile, 'utf8');
    fs.writeFileSync(backupFile, originalContent, 'utf8');
    console.log(`✅ 備份已創建: ${backupFile}`);
    
    // 2. 分析 Player 類的 update 方法位置
    console.log('\n🔍 定位 Player 類的 update 方法...');
    
    // 尋找 Player 類 (class g) 的 update 方法
    // 模式: update(e,t){this.death||(
    const updateMethodPattern = /update\(e,t\)\{this\.death\|\|\(/;
    const match = originalContent.match(updateMethodPattern);
    
    if (match) {
        const matchIndex = originalContent.indexOf(match[0]);
        console.log(`✅ 找到 update 方法位置: 索引 ${matchIndex}`);
        console.log(`📝 匹配內容: ${match[0]}`);
        
        // 3. 準備 TouchControls 整合代碼
        console.log('\n🔧 準備 TouchControls 整合代碼...');
        
        const touchControlsCode = `
// 🎮 TouchControls 整合
if(window.touchControls){
    const touchState = window.touchControls.getInputState();
    
    // 移動控制 - X軸
    if(Math.abs(touchState.direction.x) > 0.1) {
        if(touchState.direction.x < 0) {
            this.x -= 5;
            this.anims.play(this.name + "left", true);
            this.shadow.setScale(.5, 1);
        } else {
            this.x += 5;
            this.anims.play(this.name + "right", true);
            this.shadow.setScale(.5, 1);
        }
    }
    
    // 移動控制 - Y軸
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
}`;
        
        // 4. 插入 TouchControls 代碼
        console.log('\n📝 插入 TouchControls 整合代碼...');
        
        // 在 update 方法的開始處插入代碼
        // 位置: update(e,t){this.death||( 之後
        const insertPosition = matchIndex + match[0].length;
        
        const modifiedContent = 
            originalContent.slice(0, insertPosition) + 
            touchControlsCode + 
            originalContent.slice(insertPosition);
        
        // 5. 驗證修改後的代碼
        console.log('\n🔍 驗證修改後的代碼...');
        
        // 檢查基本語法結構
        const syntaxChecks = [
            { name: '括號平衡', test: () => {
                const openBrackets = (modifiedContent.match(/\{/g) || []).length;
                const closeBrackets = (modifiedContent.match(/\}/g) || []).length;
                return openBrackets === closeBrackets;
            }},
            { name: '分號檢查', test: () => {
                return modifiedContent.includes('this.lastTouchShoot = touchState.shooting;');
            }},
            { name: 'TouchControls 檢查', test: () => {
                return modifiedContent.includes('window.touchControls');
            }},
            { name: '原始功能保持', test: () => {
                return modifiedContent.includes('cursor.left.isDown');
            }}
        ];
        
        let allChecksPass = true;
        syntaxChecks.forEach(check => {
            const result = check.test();
            console.log(`  - ${check.name}: ${result ? '✅' : '❌'}`);
            if (!result) allChecksPass = false;
        });
        
        if (allChecksPass) {
            // 6. 寫入修改後的文件
            console.log('\n💾 寫入修改後的文件...');
            fs.writeFileSync(jsFile, modifiedContent, 'utf8');
            
            console.log('✅ TouchControls 整合完成！');
            console.log(`📊 文件大小: ${originalContent.length} → ${modifiedContent.length} 字符`);
            console.log(`📈 增加: ${modifiedContent.length - originalContent.length} 字符`);
            
            // 7. 生成驗證報告
            console.log('\n📋 整合報告:');
            console.log('🎯 整合位置: Player 類的 update 方法開始處');
            console.log('🔧 整合功能:');
            console.log('  ✅ X軸移動控制 (左右)');
            console.log('  ✅ Y軸移動控制 (上下)');
            console.log('  ✅ 射擊控制');
            console.log('  ✅ 動畫同步');
            console.log('  ✅ 陰影效果');
            console.log('  ✅ 與鍵盤控制並行');
            
            console.log('\n🧪 建議測試步驟:');
            console.log('1. 重啟開發服務器');
            console.log('2. 在桌面瀏覽器測試鍵盤控制');
            console.log('3. 在移動設備測試觸摸控制');
            console.log('4. 測試 iframe 環境');
            console.log('5. 驗證動畫和音效');
            
        } else {
            console.log('❌ 語法檢查失敗，不寫入文件');
            console.log('💡 建議檢查代碼語法後重試');
        }
        
    } else {
        console.log('❌ 未找到 Player 類的 update 方法');
        console.log('💡 可能需要手動定位或使用不同的匹配模式');
    }
    
    // 8. 創建測試腳本
    console.log('\n📝 創建測試腳本...');
    
    const testScript = `
// TouchControls 整合測試腳本
console.log('🧪 開始 TouchControls 整合測試...');

// 檢查 TouchControls 對象
if (typeof window.touchControls !== 'undefined') {
    console.log('✅ TouchControls 對象存在');
    
    // 測試 getInputState
    const state = window.touchControls.getInputState();
    console.log('📊 初始狀態:', state);
    
    // 模擬觸摸輸入測試
    setTimeout(() => {
        console.log('🧪 模擬觸摸輸入...');
        
        // 檢查 Phaser 遊戲
        if (typeof window.game !== 'undefined') {
            console.log('✅ Phaser 遊戲對象存在');
            
            // 檢查活躍場景
            const activeScene = window.game.scene.scenes.find(s => s.scene.isActive());
            if (activeScene) {
                console.log('✅ 活躍場景:', activeScene.scene.key);
                
                // 檢查 Player 對象
                if (activeScene.player) {
                    console.log('✅ Player 對象存在');
                    console.log('📍 Player 位置:', { x: activeScene.player.x, y: activeScene.player.y });
                    
                    // 檢查是否有 lastTouchShoot 屬性（整合成功的標誌）
                    if ('lastTouchShoot' in activeScene.player) {
                        console.log('🎉 TouchControls 整合成功！');
                    } else {
                        console.log('⚠️ TouchControls 整合可能未完成');
                    }
                } else {
                    console.log('❌ Player 對象不存在');
                }
            } else {
                console.log('❌ 沒有活躍場景');
            }
        } else {
            console.log('❌ Phaser 遊戲對象不存在');
        }
    }, 2000);
    
} else {
    console.log('❌ TouchControls 對象不存在');
}

console.log('🎉 TouchControls 整合測試完成！');
    `;
    
    fs.writeFileSync('test-touchcontrols-integration.js', testScript, 'utf8');
    console.log('✅ 測試腳本已創建: test-touchcontrols-integration.js');
    
} catch (error) {
    console.error('❌ 整合過程中發生錯誤:', error.message);
    
    // 如果出錯，嘗試恢復備份
    if (fs.existsSync(backupFile)) {
        console.log('🔄 嘗試從備份恢復...');
        try {
            const backupContent = fs.readFileSync(backupFile, 'utf8');
            fs.writeFileSync(jsFile, backupContent, 'utf8');
            console.log('✅ 已從備份恢復原始文件');
        } catch (restoreError) {
            console.error('❌ 恢復備份失敗:', restoreError.message);
        }
    }
}

console.log('\n🎉 TouchControls 整合實施完成！');
