const { chromium } = require('playwright');

async function analyzeGamePage() {
    try {
        console.log('🔗 正在連接到 Chrome 分析遊戲頁面...');
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
        
        console.log('✅ 找到遊戲頁面，開始分析...\n');
        
        // 基本資訊
        const title = await gamePage.title();
        const url = gamePage.url();
        console.log('📋 基本資訊:');
        console.log(`標題: ${title}`);
        console.log(`URL: ${url}\n`);
        
        // 解析 URL 參數
        const urlObj = new URL(url);
        const gameType = urlObj.searchParams.get('game');
        const activityId = urlObj.searchParams.get('activityId');
        console.log('🔍 URL 參數分析:');
        console.log(`遊戲類型: ${gameType}`);
        console.log(`活動ID: ${activityId}\n`);
        
        // 獲取頁面結構資訊
        const pageInfo = await gamePage.evaluate(() => {
            const info = {
                // 遊戲資訊
                gameTitle: document.querySelector('h1, h2, .game-title, [data-testid="game-title"]')?.textContent?.trim(),
                author: document.querySelector('.author, .creator, [data-testid="author"]')?.textContent?.trim(),
                level: document.querySelector('.level, .difficulty, [data-testid="level"]')?.textContent?.trim(),
                date: document.querySelector('.date, .created-date, [data-testid="date"]')?.textContent?.trim(),
                
                // 遊戲狀態
                gameElements: [],
                buttons: [],
                
                // 視覺風格
                themes: [],
                
                // 學習內容
                vocabulary: [],
                
                // 頁面結構
                sections: []
            };
            
            // 收集遊戲元素
            document.querySelectorAll('button, .game-button, [role="button"]').forEach(btn => {
                if (btn.textContent.trim()) {
                    info.buttons.push(btn.textContent.trim());
                }
            });
            
            // 收集主題選項
            document.querySelectorAll('.theme, .style-option, [data-theme]').forEach(theme => {
                if (theme.textContent.trim()) {
                    info.themes.push(theme.textContent.trim());
                }
            });
            
            // 收集頁面區塊
            document.querySelectorAll('section, .section, .game-section').forEach(section => {
                const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
                if (heading) {
                    info.sections.push(heading.textContent.trim());
                }
            });
            
            // 收集詞彙內容
            document.querySelectorAll('.vocabulary, .word, .term, [data-word]').forEach(word => {
                if (word.textContent.trim()) {
                    info.vocabulary.push(word.textContent.trim());
                }
            });
            
            return info;
        });
        
        // 顯示分析結果
        console.log('🎮 遊戲資訊:');
        if (pageInfo.gameTitle) console.log(`遊戲標題: ${pageInfo.gameTitle}`);
        if (pageInfo.author) console.log(`創建者: ${pageInfo.author}`);
        if (pageInfo.level) console.log(`難度等級: ${pageInfo.level}`);
        if (pageInfo.date) console.log(`創建日期: ${pageInfo.date}`);
        
        console.log('\n🎨 視覺主題:');
        if (pageInfo.themes.length > 0) {
            pageInfo.themes.forEach(theme => console.log(`- ${theme}`));
        } else {
            console.log('- 未檢測到主題選項');
        }
        
        console.log('\n🔘 可用按鈕:');
        if (pageInfo.buttons.length > 0) {
            pageInfo.buttons.slice(0, 10).forEach(btn => console.log(`- ${btn}`));
            if (pageInfo.buttons.length > 10) {
                console.log(`... 還有 ${pageInfo.buttons.length - 10} 個按鈕`);
            }
        } else {
            console.log('- 未檢測到按鈕');
        }
        
        console.log('\n📚 學習內容:');
        if (pageInfo.vocabulary.length > 0) {
            pageInfo.vocabulary.slice(0, 5).forEach(word => console.log(`- ${word}`));
            if (pageInfo.vocabulary.length > 5) {
                console.log(`... 還有 ${pageInfo.vocabulary.length - 5} 個詞彙`);
            }
        } else {
            console.log('- 未檢測到詞彙內容');
        }
        
        console.log('\n📄 頁面區塊:');
        if (pageInfo.sections.length > 0) {
            pageInfo.sections.forEach(section => console.log(`- ${section}`));
        } else {
            console.log('- 未檢測到明確的區塊結構');
        }
        
        // 檢查遊戲狀態
        const gameState = await gamePage.evaluate(() => {
            // 檢查開始按鈕
            const buttons = Array.from(document.querySelectorAll('button'));
            const hasStartButton = buttons.some(btn => 
                btn.textContent.includes('開始') || 
                btn.textContent.includes('Start') ||
                btn.getAttribute('data-testid') === 'start' ||
                btn.classList.contains('start-button')
            );
            
            return {
                isGameLoaded: !!document.querySelector('.game-container, .game-area, canvas, #game'),
                hasStartButton: hasStartButton,
                isGameRunning: !!document.querySelector('.game-running, .playing, .active-game'),
                hasScore: !!document.querySelector('.score, .points, [data-testid="score"]'),
                hasTimer: !!document.querySelector('.timer, .countdown, [data-testid="timer"]')
            };
        });
        
        console.log('\n⚡ 遊戲狀態:');
        console.log(`遊戲已載入: ${gameState.isGameLoaded ? '✅' : '❌'}`);
        console.log(`有開始按鈕: ${gameState.hasStartButton ? '✅' : '❌'}`);
        console.log(`遊戲運行中: ${gameState.isGameRunning ? '✅' : '❌'}`);
        console.log(`有計分系統: ${gameState.hasScore ? '✅' : '❌'}`);
        console.log(`有計時器: ${gameState.hasTimer ? '✅' : '❌'}`);
        
        await browser.close();
        console.log('\n🔄 分析完成，Chrome 保持開啟');
        
    } catch (error) {
        console.error('❌ 分析失敗:', error.message);
    }
}

analyzeGamePage();