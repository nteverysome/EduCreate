const { chromium } = require('playwright');

async function analyzeIframeGame() {
    try {
        console.log('🔗 正在連接到 Chrome 分析 iframe 遊戲內容...');
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
        
        console.log('✅ 開始深度分析 iframe 遊戲內容...\n');
        
        // 獲取 iframe 的詳細內容
        const iframeGameContent = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) {
                    return { error: '無法訪問 iframe 內容' };
                }
                
                // 獲取遊戲的完整文本內容
                const fullText = iframeDoc.body ? iframeDoc.body.innerText : '';
                
                // 分析遊戲元素
                const gameElements = {
                    // 基本資訊
                    title: iframeDoc.title,
                    url: iframeDoc.URL,
                    fullText: fullText,
                    
                    // 遊戲組件
                    canvas: Array.from(iframeDoc.querySelectorAll('canvas')).map(canvas => ({
                        id: canvas.id || null,
                        width: canvas.width,
                        height: canvas.height,
                        className: canvas.className || null
                    })),
                    
                    buttons: Array.from(iframeDoc.querySelectorAll('button')).map(btn => ({
                        text: btn.textContent.trim(),
                        id: btn.id || null,
                        className: btn.className || null,
                        disabled: btn.disabled
                    })),
                    
                    // 遊戲狀態指示器
                    scoreElements: Array.from(iframeDoc.querySelectorAll('[class*="score"], [id*="score"], .points')).map(el => ({
                        text: el.textContent.trim(),
                        className: el.className
                    })),
                    
                    timerElements: Array.from(iframeDoc.querySelectorAll('[class*="timer"], [id*="timer"], .countdown')).map(el => ({
                        text: el.textContent.trim(),
                        className: el.className
                    })),
                    
                    // 遊戲卡片或項目
                    gameItems: Array.from(iframeDoc.querySelectorAll('[class*="card"], [class*="item"], [class*="match"]')).map(el => ({
                        text: el.textContent.trim(),
                        className: el.className,
                        id: el.id || null
                    })),
                    
                    // 所有可見文本元素
                    textElements: Array.from(iframeDoc.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6')).map(el => {
                        const text = el.textContent.trim();
                        return text ? {
                            text: text,
                            tagName: el.tagName,
                            className: el.className || null,
                            id: el.id || null
                        } : null;
                    }).filter(Boolean),
                    
                    // 檢查遊戲狀態
                    gameState: {
                        hasStarted: iframeDoc.querySelector('.game-started, .playing, .active') !== null,
                        isLoading: iframeDoc.querySelector('.loading, .spinner') !== null,
                        isGameOver: iframeDoc.querySelector('.game-over, .finished, .complete') !== null,
                        hasInstructions: iframeDoc.querySelector('.instructions, .help, .tutorial') !== null
                    }
                };
                
                return gameElements;
                
            } catch (e) {
                return { error: `訪問錯誤: ${e.message}` };
            }
        });
        
        if (iframeGameContent.error) {
            console.log(`❌ ${iframeGameContent.error}`);
            return;
        }
        
        console.log('🎮 iframe 遊戲詳細分析:');
        console.log('=' .repeat(60));
        
        console.log(`\n📋 基本資訊:`);
        console.log(`標題: ${iframeGameContent.title}`);
        console.log(`URL: ${iframeGameContent.url}`);
        
        console.log(`\n🖼️ Canvas 元素 (${iframeGameContent.canvas.length} 個):`);
        iframeGameContent.canvas.forEach((canvas, index) => {
            console.log(`  ${index + 1}. 尺寸: ${canvas.width}x${canvas.height}, ID: ${canvas.id || '無'}, 類名: ${canvas.className || '無'}`);
        });
        
        console.log(`\n🔘 按鈕元素 (${iframeGameContent.buttons.length} 個):`);
        iframeGameContent.buttons.forEach((btn, index) => {
            console.log(`  ${index + 1}. "${btn.text}" ${btn.disabled ? '(禁用)' : '(可用)'}`);
        });
        
        console.log(`\n🏆 計分元素 (${iframeGameContent.scoreElements.length} 個):`);
        iframeGameContent.scoreElements.forEach((score, index) => {
            console.log(`  ${index + 1}. ${score.text}`);
        });
        
        console.log(`\n⏱️ 計時元素 (${iframeGameContent.timerElements.length} 個):`);
        iframeGameContent.timerElements.forEach((timer, index) => {
            console.log(`  ${index + 1}. ${timer.text}`);
        });
        
        console.log(`\n🎯 遊戲項目 (${iframeGameContent.gameItems.length} 個):`);
        iframeGameContent.gameItems.slice(0, 10).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}`);
        });
        if (iframeGameContent.gameItems.length > 10) {
            console.log(`  ... 還有 ${iframeGameContent.gameItems.length - 10} 個項目`);
        }
        
        console.log(`\n📊 遊戲狀態:`);
        console.log(`  遊戲已開始: ${iframeGameContent.gameState.hasStarted ? '✅' : '❌'}`);
        console.log(`  正在載入: ${iframeGameContent.gameState.isLoading ? '✅' : '❌'}`);
        console.log(`  遊戲結束: ${iframeGameContent.gameState.isGameOver ? '✅' : '❌'}`);
        console.log(`  有說明文字: ${iframeGameContent.gameState.hasInstructions ? '✅' : '❌'}`);
        
        console.log(`\n📄 完整遊戲內容:`);
        console.log('─' .repeat(40));
        console.log(iframeGameContent.fullText);
        console.log('─' .repeat(40));
        
        // 嘗試與遊戲互動
        console.log(`\n🎮 嘗試遊戲互動...`);
        
        const interactionResult = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return { error: '無法訪問 iframe' };
                
                // 查找可點擊的遊戲元素
                const clickableElements = [];
                
                // 查找按鈕
                iframeDoc.querySelectorAll('button').forEach(btn => {
                    if (!btn.disabled && btn.textContent.trim()) {
                        clickableElements.push({
                            type: 'button',
                            text: btn.textContent.trim(),
                            selector: `button:contains("${btn.textContent.trim()}")`
                        });
                    }
                });
                
                // 查找可點擊的遊戲卡片
                iframeDoc.querySelectorAll('[class*="card"], [class*="item"], [onclick], [role="button"]').forEach(el => {
                    if (el.textContent.trim()) {
                        clickableElements.push({
                            type: 'game-element',
                            text: el.textContent.trim().substring(0, 30),
                            className: el.className
                        });
                    }
                });
                
                return {
                    clickableCount: clickableElements.length,
                    clickableElements: clickableElements.slice(0, 5) // 只返回前5個
                };
                
            } catch (e) {
                return { error: `互動分析錯誤: ${e.message}` };
            }
        });
        
        if (interactionResult.error) {
            console.log(`❌ ${interactionResult.error}`);
        } else {
            console.log(`🎯 發現 ${interactionResult.clickableCount} 個可互動元素:`);
            interactionResult.clickableElements.forEach((el, index) => {
                console.log(`  ${index + 1}. [${el.type}] ${el.text}`);
            });
        }
        
        await browser.close();
        console.log('\n✅ iframe 遊戲分析完成');
        
    } catch (error) {
        console.error('❌ iframe 遊戲分析失敗:', error.message);
    }
}

analyzeIframeGame();