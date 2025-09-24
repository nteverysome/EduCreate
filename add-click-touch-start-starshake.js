const fs = require('fs');

console.log('🎮 為 Starshake 遊戲啟動畫面添加觸擊和點擊支援...');

// 目標文件路徑
const starshakeJsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const starshakeHtmlFile = 'public/games/starshake-game/dist/index.html';

// 檢查文件是否存在
if (!fs.existsSync(starshakeJsFile)) {
    console.error('❌ 找不到 Starshake 遊戲 JS 文件:', starshakeJsFile);
    process.exit(1);
}

if (!fs.existsSync(starshakeHtmlFile)) {
    console.error('❌ 找不到 Starshake 遊戲 HTML 文件:', starshakeHtmlFile);
    process.exit(1);
}

// 讀取文件內容
let jsContent = fs.readFileSync(starshakeJsFile, 'utf8');
let htmlContent = fs.readFileSync(starshakeHtmlFile, 'utf8');

console.log('📝 原始 JS 文件大小:', jsContent.length, '字符');
console.log('📝 原始 HTML 文件大小:', htmlContent.length, '字符');

const originalJsContent = jsContent;
const originalHtmlContent = htmlContent;

// 在 HTML 中添加啟動畫面點擊支援的 JavaScript
const startScreenClickJs = `
    <!-- 啟動畫面點擊支援 JavaScript -->
    <script>
        // 啟動畫面點擊和觸摸支援
        window.addStartScreenClickSupport = function() {
            console.log('🎮 添加啟動畫面點擊和觸摸支援');
            
            // 等待 Phaser 遊戲初始化
            const checkPhaserGame = setInterval(() => {
                if (window.game && window.game.scene && window.game.scene.scenes.length > 0) {
                    clearInterval(checkPhaserGame);
                    
                    // 查找 splash 場景
                    const splashScene = window.game.scene.scenes.find(scene => scene.scene.key === 'splash');
                    
                    if (splashScene && splashScene.scene.isActive()) {
                        console.log('🎯 找到 splash 場景，添加點擊支援');
                        addClickSupportToSplash(splashScene);
                    } else {
                        // 監聽場景切換，當 splash 場景啟動時添加支援
                        window.game.events.on('scenestart', (scene) => {
                            if (scene.scene.key === 'splash') {
                                console.log('🎯 splash 場景啟動，添加點擊支援');
                                setTimeout(() => addClickSupportToSplash(scene), 100);
                            }
                        });
                    }
                }
            }, 100);
            
            // 為 splash 場景添加點擊和觸摸支援
            function addClickSupportToSplash(scene) {
                if (scene.clickSupportAdded) return;
                scene.clickSupportAdded = true;
                
                console.log('✅ 為 splash 場景添加點擊和觸摸支援');
                
                // 添加點擊事件監聽器
                scene.input.on('pointerdown', () => {
                    console.log('🖱️ 檢測到點擊，開始遊戲');
                    if (scene.transitionToChange && typeof scene.transitionToChange === 'function') {
                        scene.transitionToChange();
                    }
                });
                
                // 添加觸摸事件監聽器（備用）
                const canvas = scene.sys.game.canvas;
                if (canvas) {
                    const touchStartHandler = (e) => {
                        e.preventDefault();
                        console.log('👆 檢測到觸摸，開始遊戲');
                        if (scene.transitionToChange && typeof scene.transitionToChange === 'function') {
                            scene.transitionToChange();
                        }
                    };
                    
                    canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
                    canvas.addEventListener('click', touchStartHandler);
                    
                    // 清理函數
                    scene.events.once('shutdown', () => {
                        canvas.removeEventListener('touchstart', touchStartHandler);
                        canvas.removeEventListener('click', touchStartHandler);
                    });
                }
                
                // 添加視覺提示
                const instructionText = scene.add.bitmapText(
                    scene.center_width, 
                    scene.center_height + 150, 
                    "wendy", 
                    "點擊任意位置或按 SPACE 開始", 
                    40
                ).setOrigin(0.5);
                
                // 閃爍效果
                scene.tweens.add({
                    targets: instructionText,
                    alpha: { from: 0.3, to: 1 },
                    duration: 800,
                    repeat: -1,
                    yoyo: true
                });
            }
        };
        
        // 當頁面載入完成後初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', window.addStartScreenClickSupport);
        } else {
            window.addStartScreenClickSupport();
        }
    </script>
`;

// 在 HTML 的 </body> 前添加啟動畫面點擊支援
if (!htmlContent.includes('addStartScreenClickSupport')) {
    htmlContent = htmlContent.replace('</body>', startScreenClickJs + '\n</body>');
    console.log('✅ HTML 文件已修改，添加啟動畫面點擊支援');
} else {
    console.log('ℹ️  HTML 文件已包含啟動畫面點擊支援');
}

// 修改 JavaScript 文件，增強 splash 場景的輸入處理
// 由於是壓縮文件，我們需要在適當位置注入代碼

// 查找並增強 splash 場景的創建邏輯
const splashEnhancement = `
// 增強 splash 場景的輸入處理
if(this.scene && this.scene.key === 'splash') {
    console.log('🎯 增強 splash 場景輸入處理');
    
    // 確保輸入系統啟用
    this.input.enabled = true;
    
    // 添加全屏點擊檢測
    this.input.on('pointerdown', () => {
        console.log('🖱️ splash 場景檢測到點擊');
        if(this.transitionToChange) {
            this.transitionToChange();
        }
    });
    
    // 設置可點擊區域為整個遊戲區域
    this.input.setHitArea(this.add.zone(this.center_width, this.center_height, this.width, this.height));
}
`;

// 在 splash 場景創建後注入增強代碼
// 查找 splash 場景的特徵模式並在其後添加增強代碼
const splashPattern = /this\.scene\.start\("splash"\)/g;
if (splashPattern.test(jsContent)) {
    jsContent = jsContent.replace(
        /this\.scene\.start\("splash"\)/g,
        'this.scene.start("splash");' + splashEnhancement.replace(/\n/g, '')
    );
    console.log('✅ JavaScript 文件已修改，增強 splash 場景輸入處理');
} else {
    console.log('⚠️  未找到 splash 場景啟動模式，嘗試其他方法');
    
    // 嘗試在 create 函數中添加增強
    const createPattern = /create\(\)\{/g;
    if (createPattern.test(jsContent)) {
        jsContent = jsContent.replace(
            /create\(\)\{/g,
            'create(){' + splashEnhancement.replace(/\n/g, '')
        );
        console.log('✅ JavaScript 文件已修改，在 create 函數中添加增強');
    }
}

// 檢查是否有修改
const jsModified = jsContent !== originalJsContent;
const htmlModified = htmlContent !== originalHtmlContent;

if (jsModified || htmlModified) {
    // 寫入修改後的文件
    if (jsModified) {
        fs.writeFileSync(starshakeJsFile, jsContent);
        console.log('📁 JavaScript 文件已更新');
    }
    
    if (htmlModified) {
        fs.writeFileSync(starshakeHtmlFile, htmlContent);
        console.log('📁 HTML 文件已更新');
    }
    
    console.log('🎉 Starshake 遊戲啟動畫面點擊和觸摸支援添加完成！');
    console.log('📝 修改後 JS 文件大小:', jsContent.length, '字符');
    console.log('📝 修改後 HTML 文件大小:', htmlContent.length, '字符');
    
    console.log('\n🎮 新增功能:');
    console.log('  ✅ 點擊任意位置開始遊戲');
    console.log('  ✅ 觸摸任意位置開始遊戲');
    console.log('  ✅ 保持原有 Space 鍵功能');
    console.log('  ✅ 添加視覺提示文字');
    console.log('  ✅ 全屏點擊檢測');
    console.log('  ✅ 移動設備友好');
} else {
    console.log('ℹ️  沒有需要修改的內容');
}
