const { chromium } = require('playwright');

async function interactWithIframeGame() {
    try {
        console.log('🔗 正在連接到 Chrome 與 iframe 遊戲互動...');
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
        
        console.log('✅ 開始與 iframe 遊戲互動...\n');
        
        // 先檢查當前狀態
        console.log('🔍 檢查遊戲當前狀態...');
        const currentState = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return { error: '無法訪問 iframe' };
                
                return {
                    content: iframeDoc.body.innerText,
                    buttonCount: iframeDoc.querySelectorAll('button').length,
                    canvasCount: iframeDoc.querySelectorAll('canvas').length,
                    hasLoadingIndicator: !!iframeDoc.querySelector('.loading, .spinner, [class*="load"]')
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        if (currentState.error) {
            console.log(`❌ ${currentState.error}`);
            return;
        }
        
        console.log(`當前內容: "${currentState.content}"`);
        console.log(`按鈕數量: ${currentState.buttonCount}`);
        console.log(`Canvas 數量: ${currentState.canvasCount}`);
        console.log(`載入指示器: ${currentState.hasLoadingIndicator ? '有' : '無'}`);
        
        // 嘗試點擊 iframe 內的按鈕
        console.log('\n🎯 嘗試點擊 iframe 內的按鈕...');
        
        const clickResult = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return { error: '無法訪問 iframe' };
                
                const button = iframeDoc.querySelector('button');
                if (!button) return { error: '未找到按鈕' };
                
                // 點擊按鈕
                button.click();
                
                return { success: true, buttonText: button.textContent.trim() };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        if (clickResult.error) {
            console.log(`❌ 點擊失敗: ${clickResult.error}`);
        } else {
            console.log(`✅ 成功點擊按鈕: "${clickResult.buttonText}"`);
        }
        
        // 等待遊戲載入
        console.log('\n⏳ 等待遊戲載入 (3秒)...');
        await gamePage.waitForTimeout(3000);
        
        // 檢查點擊後的狀態
        console.log('🔍 檢查點擊後的遊戲狀態...');
        const afterClickState = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return { error: '無法訪問 iframe' };
                
                const content = iframeDoc.body.innerText;
                const buttons = Array.from(iframeDoc.querySelectorAll('button')).map(btn => btn.textContent.trim());
                const gameElements = Array.from(iframeDoc.querySelectorAll('div, span')).map(el => {
                    const text = el.textContent.trim();
                    return text && text.length < 100 ? text : null;
                }).filter(Boolean);
                
                return {
                    content: content,
                    contentLength: content.length,
                    buttons: buttons,
                    elementCount: iframeDoc.querySelectorAll('*').length,
                    hasCanvas: iframeDoc.querySelectorAll('canvas').length > 0,
                    gameElements: gameElements.slice(0, 10) // 只取前10個
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        if (afterClickState.error) {
            console.log(`❌ ${afterClickState.error}`);
        } else {
            console.log('📊 點擊後的狀態:');
            console.log(`內容長度: ${afterClickState.contentLength} 字符`);
            console.log(`元素數量: ${afterClickState.elementCount}`);
            console.log(`按鈕: [${afterClickState.buttons.join(', ')}]`);
            console.log(`有 Canvas: ${afterClickState.hasCanvas ? '是' : '否'}`);
            
            if (afterClickState.gameElements.length > 0) {
                console.log('🎮 遊戲元素:');
                afterClickState.gameElements.forEach((el, index) => {
                    console.log(`  ${index + 1}. ${el}`);
                });
            }
            
            console.log('\n📄 完整內容:');
            console.log('─' .repeat(50));
            console.log(afterClickState.content);
            console.log('─' .repeat(50));
        }
        
        // 嘗試截圖 iframe 內容
        console.log('\n📸 嘗試截圖 iframe 內容...');
        try {
            await gamePage.evaluate(() => {
                const iframe = document.querySelector('iframe');
                if (iframe) {
                    iframe.scrollIntoView();
                }
            });
            
            // 截圖整個頁面（包含 iframe）
            await gamePage.screenshot({ path: 'iframe-game-state.png', fullPage: true });
            console.log('✅ 截圖已保存: iframe-game-state.png');
        } catch (error) {
            console.log(`❌ 截圖失敗: ${error.message}`);
        }
        
        await browser.close();
        console.log('\n✅ iframe 互動完成');
        
    } catch (error) {
        console.error('❌ iframe 互動失敗:', error.message);
    }
}

interactWithIframeGame();