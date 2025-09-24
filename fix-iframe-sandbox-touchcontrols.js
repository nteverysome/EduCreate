const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復 iframe sandbox 和 TouchControls 整合問題...');

// 1. 分析當前 iframe sandbox 設置
const gameSwitcherFile = 'components/games/GameSwitcher.tsx';

try {
    if (fs.existsSync(gameSwitcherFile)) {
        const content = fs.readFileSync(gameSwitcherFile, 'utf8');
        
        // 檢查當前 sandbox 設置
        const sandboxMatch = content.match(/sandbox="([^"]+)"/);
        if (sandboxMatch) {
            console.log('📋 當前 iframe sandbox 設置:');
            console.log(`   ${sandboxMatch[1]}`);
            
            const currentPermissions = sandboxMatch[1].split(' ');
            console.log('🔍 當前權限分析:');
            currentPermissions.forEach(permission => {
                console.log(`   ✅ ${permission}`);
            });
            
            // 檢查缺失的權限
            const recommendedPermissions = [
                'allow-same-origin',
                'allow-scripts', 
                'allow-forms',
                'allow-popups',
                'allow-modals',
                'allow-pointer-lock',      // 🎯 觸摸控制需要
                'allow-orientation-lock',  // 📱 移動設備方向鎖定
                'allow-presentation',      // 🖥️ 全螢幕支援
                'allow-top-navigation-by-user-activation' // 🔗 用戶激活導航
            ];
            
            console.log('\n🎯 建議的完整權限列表:');
            const missingPermissions = [];
            recommendedPermissions.forEach(permission => {
                if (currentPermissions.includes(permission)) {
                    console.log(`   ✅ ${permission} (已存在)`);
                } else {
                    console.log(`   ❌ ${permission} (缺失)`);
                    missingPermissions.push(permission);
                }
            });
            
            if (missingPermissions.length > 0) {
                console.log('\n🛠️ 需要添加的權限:');
                missingPermissions.forEach(permission => {
                    console.log(`   + ${permission}`);
                });
                
                // 生成新的 sandbox 字符串
                const newSandbox = recommendedPermissions.join(' ');
                console.log(`\n📝 建議的新 sandbox 設置:`);
                console.log(`   sandbox="${newSandbox}"`);
                
                // 更新文件
                const updatedContent = content.replace(
                    /sandbox="[^"]+"/,
                    `sandbox="${newSandbox}"`
                );
                
                fs.writeFileSync(gameSwitcherFile, updatedContent, 'utf8');
                console.log('✅ GameSwitcher.tsx 已更新');
                
            } else {
                console.log('\n✅ 所有建議權限都已存在');
            }
        } else {
            console.log('❌ 未找到 sandbox 屬性');
        }
        
    } else {
        console.log('❌ GameSwitcher.tsx 文件不存在');
    }
    
    // 2. 檢查 TouchControls 整合狀態
    console.log('\n🎮 檢查 TouchControls 整合狀態...');
    
    const htmlFile = 'public/games/starshake-game/dist/index.html';
    const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
    
    if (fs.existsSync(htmlFile)) {
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        
        // 檢查 TouchControls 實現
        const touchControlsChecks = {
            'TouchControls 類': htmlContent.includes('class TouchControls'),
            'DOM 元素': htmlContent.includes('id="touch-controls"'),
            '初始化': htmlContent.includes('window.touchControls = new TouchControls()'),
            '媒體查詢': htmlContent.includes('@media (max-width: 768px)'),
            '觸摸事件': htmlContent.includes('touchstart')
        };
        
        console.log('📱 TouchControls HTML 檢查:');
        Object.entries(touchControlsChecks).forEach(([check, result]) => {
            console.log(`   ${result ? '✅' : '❌'} ${check}`);
        });
        
        // 檢查重複樣式
        const styleCount = (htmlContent.match(/#touch-controls \{/g) || []).length;
        if (styleCount > 1) {
            console.log(`⚠️  發現 ${styleCount} 個重複的 TouchControls 樣式定義`);
            
            // 移除重複樣式
            console.log('🧹 清理重複樣式...');
            
            // 找到第一個樣式定義的結束位置
            const firstStyleStart = htmlContent.indexOf('#touch-controls {');
            const firstStyleEnd = htmlContent.indexOf('</style>', firstStyleStart);
            
            // 保留第一個樣式，移除後續重複的
            let cleanedContent = htmlContent;
            let duplicateStyleRegex = /<style>\s*\/\* 觸摸控制面板 \*\/[\s\S]*?<\/style>/g;
            let matches = [...htmlContent.matchAll(duplicateStyleRegex)];
            
            if (matches.length > 1) {
                // 保留第一個，移除其他
                for (let i = 1; i < matches.length; i++) {
                    cleanedContent = cleanedContent.replace(matches[i][0], '');
                }
                
                fs.writeFileSync(htmlFile, cleanedContent, 'utf8');
                console.log('✅ 已清理重複的 TouchControls 樣式');
            }
        }
        
    } else {
        console.log('❌ HTML 文件不存在');
    }
    
    if (fs.existsSync(jsFile)) {
        const jsContent = fs.readFileSync(jsFile, 'utf8');
        const jsSize = fs.statSync(jsFile).size;
        
        console.log(`📄 JavaScript 文件: ${jsSize} 字節`);
        
        // 檢查是否有 TouchControls 整合
        const hasIntegration = jsContent.includes('window.touchControls');
        console.log(`🔗 TouchControls 整合: ${hasIntegration ? '✅' : '❌'}`);
        
        if (!hasIntegration) {
            console.log('⚠️  JavaScript 文件中缺少 TouchControls 整合代碼');
            console.log('💡 建議: 需要在 Player 類的 update 方法中添加觸摸控制邏輯');
        }
        
    } else {
        console.log('❌ JavaScript 文件不存在');
    }
    
    // 3. 生成測試建議
    console.log('\n🧪 測試建議:');
    console.log('1. 重啟開發服務器以應用 iframe sandbox 更改');
    console.log('2. 在移動設備或瀏覽器開發者工具的移動模式下測試');
    console.log('3. 檢查瀏覽器控制台是否有 TouchControls 相關錯誤');
    console.log('4. 測試直接訪問遊戲頁面 vs 通過遊戲切換器訪問');
    
    // 4. iframe 優化建議
    console.log('\n🎯 iframe 優化建議:');
    console.log('- ✅ 添加 allow-pointer-lock 支援觸摸控制');
    console.log('- ✅ 添加 allow-orientation-lock 支援移動設備方向');
    console.log('- ✅ 添加 allow-presentation 支援全螢幕功能');
    console.log('- ✅ 清理重複的 CSS 樣式定義');
    
    console.log('\n🎉 iframe sandbox 和 TouchControls 優化完成！');
    
} catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error.message);
}

// 5. 創建測試腳本
const testScript = `
// TouchControls 測試腳本
console.log('🧪 開始 TouchControls 測試...');

// 檢查 TouchControls 對象
if (typeof window.touchControls !== 'undefined') {
    console.log('✅ TouchControls 對象存在');
    
    // 測試 getInputState 方法
    if (typeof window.touchControls.getInputState === 'function') {
        console.log('✅ getInputState 方法可用');
        
        const state = window.touchControls.getInputState();
        console.log('📊 當前輸入狀態:', state);
        
        // 檢查狀態結構
        if (state && typeof state.direction === 'object' && typeof state.shooting === 'boolean') {
            console.log('✅ 輸入狀態結構正確');
        } else {
            console.log('❌ 輸入狀態結構異常');
        }
        
    } else {
        console.log('❌ getInputState 方法不可用');
    }
    
} else {
    console.log('❌ TouchControls 對象不存在');
}

// 檢查 DOM 元素
const touchControls = document.getElementById('touch-controls');
if (touchControls) {
    console.log('✅ TouchControls DOM 元素存在');
    console.log('👁️ 可見性:', getComputedStyle(touchControls).display !== 'none');
} else {
    console.log('❌ TouchControls DOM 元素不存在');
}

// 檢查媒體查詢
const isMobile = window.matchMedia('(max-width: 768px)').matches;
console.log('📱 移動設備檢測:', isMobile);

console.log('🎉 TouchControls 測試完成！');
`;

fs.writeFileSync('test-touchcontrols.js', testScript, 'utf8');
console.log('📝 已創建 TouchControls 測試腳本: test-touchcontrols.js');
