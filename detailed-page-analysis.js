const { chromium } = require('playwright');

async function detailedPageAnalysis() {
    try {
        console.log('🔗 正在連接到 Chrome 進行詳細分析...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        
        const contexts = browser.contexts();
        const pages = [];
        for (const context of contexts) {
            pages.push(...context.pages());
        }
        
        const gamePage = pages.find(page => 
            page.url().includes('games/switcher') && 
            page.url().includes('match-up-game')
        );
        
        if (!gamePage) {
            console.log('❌ 未找到遊戲頁面');
            return;
        }
        
        console.log('✅ 開始詳細分析頁面內容...\n');
        
        // 獲取完整的頁面文本內容
        const fullText = await gamePage.evaluate(() => {
            return document.body.innerText;
        });
        
        console.log('📄 完整頁面內容:');
        console.log('=' .repeat(50));
        console.log(fullText);
        console.log('=' .repeat(50));
        
        // 分析頁面結構
        const pageStructure = await gamePage.evaluate(() => {
            const structure = {
                headers: [],
                buttons: [],
                links: [],
                inputs: [],
                selects: [],
                gameElements: [],
                userInfo: {},
                gameConfig: {}
            };
            
            // 收集標題
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                structure.headers.push({
                    level: h.tagName,
                    text: h.textContent.trim(),
                    id: h.id || null
                });
            });
            
            // 收集按鈕
            document.querySelectorAll('button, [role="button"], .btn').forEach(btn => {
                if (btn.textContent.trim()) {
                    structure.buttons.push({
                        text: btn.textContent.trim(),
                        id: btn.id || null,
                        className: btn.className || null,
                        disabled: btn.disabled || false
                    });
                }
            });
            
            // 收集連結
            document.querySelectorAll('a').forEach(link => {
                if (link.textContent.trim()) {
                    structure.links.push({
                        text: link.textContent.trim(),
                        href: link.href || null
                    });
                }
            });
            
            // 收集輸入框
            document.querySelectorAll('input, textarea').forEach(input => {
                structure.inputs.push({
                    type: input.type || 'text',
                    placeholder: input.placeholder || null,
                    value: input.value || null,
                    id: input.id || null
                });
            });
            
            // 收集下拉選單
            document.querySelectorAll('select').forEach(select => {
                const options = Array.from(select.options).map(opt => opt.text);
                structure.selects.push({
                    id: select.id || null,
                    options: options,
                    selected: select.value
                });
            });
            
            // 檢查用戶資訊
            const userElement = document.querySelector('[data-user], .user-info, .profile');
            if (userElement) {
                structure.userInfo.text = userElement.textContent.trim();
            }
            
            // 檢查遊戲配置
            const gameTitle = document.querySelector('.game-title, h1, h2');
            if (gameTitle) {
                structure.gameConfig.title = gameTitle.textContent.trim();
            }
            
            const difficulty = document.querySelector('.difficulty, .level');
            if (difficulty) {
                structure.gameConfig.difficulty = difficulty.textContent.trim();
            }
            
            return structure;
        });
        
        console.log('\n🏗️ 頁面結構分析:');
        
        if (pageStructure.headers.length > 0) {
            console.log('\n📋 標題結構:');
            pageStructure.headers.forEach(h => {
                console.log(`${h.level}: ${h.text}`);
            });
        }
        
        if (pageStructure.buttons.length > 0) {
            console.log('\n🔘 可點擊按鈕:');
            pageStructure.buttons.forEach((btn, index) => {
                const status = btn.disabled ? '(禁用)' : '(可用)';
                console.log(`${index + 1}. ${btn.text} ${status}`);
            });
        }
        
        if (pageStructure.links.length > 0) {
            console.log('\n🔗 連結:');
            pageStructure.links.slice(0, 5).forEach((link, index) => {
                console.log(`${index + 1}. ${link.text}`);
            });
        }
        
        if (pageStructure.inputs.length > 0) {
            console.log('\n📝 輸入欄位:');
            pageStructure.inputs.forEach((input, index) => {
                console.log(`${index + 1}. 類型: ${input.type}, 佔位符: ${input.placeholder || '無'}`);
            });
        }
        
        if (pageStructure.selects.length > 0) {
            console.log('\n📋 下拉選單:');
            pageStructure.selects.forEach((select, index) => {
                console.log(`${index + 1}. 選項: ${select.options.join(', ')}`);
                console.log(`   已選擇: ${select.selected}`);
            });
        }
        
        // 檢查當前頁面狀態
        const currentState = await gamePage.evaluate(() => {
            const url = window.location.href;
            const urlParams = new URLSearchParams(window.location.search);
            
            return {
                currentUrl: url,
                gameType: urlParams.get('game'),
                activityId: urlParams.get('activityId'),
                isLoggedIn: !!document.querySelector('.user-menu, .profile, [data-user]'),
                pageType: url.includes('/games/') ? 'game-page' : 'other',
                hasGameContent: !!document.querySelector('.game-container, canvas, .game-area'),
                hasConfigOptions: !!document.querySelector('.config, .settings, .options')
            };
        });
        
        console.log('\n📊 當前頁面狀態:');
        console.log(`頁面類型: ${currentState.pageType}`);
        console.log(`遊戲類型: ${currentState.gameType}`);
        console.log(`活動ID: ${currentState.activityId}`);
        console.log(`用戶登入狀態: ${currentState.isLoggedIn ? '已登入' : '未登入'}`);
        console.log(`有遊戲內容: ${currentState.hasGameContent ? '是' : '否'}`);
        console.log(`有配置選項: ${currentState.hasConfigOptions ? '是' : '否'}`);
        
        await browser.close();
        console.log('\n✅ 詳細分析完成');
        
    } catch (error) {
        console.error('❌ 分析失敗:', error.message);
    }
}

detailedPageAnalysis();