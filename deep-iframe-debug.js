const { chromium } = require('playwright');

async function deepDebugIframe() {
    try {
        console.log('🔗 正在連接到 Chrome 進行深度 iframe 調試...');
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
        
        console.log('✅ 開始深度調試 iframe...\n');
        
        // 1. 檢查 iframe 的詳細屬性
        console.log('🔍 檢查 iframe 詳細屬性...');
        const iframeInfo = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            return {
                src: iframe.src,
                width: iframe.width || iframe.offsetWidth,
                height: iframe.height || iframe.offsetHeight,
                loaded: iframe.contentDocument !== null,
                readyState: iframe.contentDocument ? iframe.contentDocument.readyState : 'unknown'
            };
        });
        
        console.log('iframe 資訊:', JSON.stringify(iframeInfo, null, 2));
        
        // 2. 檢查 iframe 內的 JavaScript 錯誤
        console.log('\n🐛 檢查 iframe 內的 JavaScript 狀態...');
        const jsState = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeWindow = iframe.contentWindow;
                
                if (!iframeDoc || !iframeWindow) return { error: '無法訪問 iframe' };
                
                // 檢查全域變數
                const globalVars = Object.keys(iframeWindow).filter(key => 
                    !['window', 'document', 'location', 'navigator', 'history'].includes(key) &&
                    typeof iframeWindow[key] !== 'function'
                ).slice(0, 10);
                
                // 檢查是否有遊戲相關的函數
                const gameFunctions = Object.keys(iframeWindow).filter(key => 
                    typeof iframeWindow[key] === 'function' &&
                    (key.toLowerCase().includes('game') || 
                     key.toLowerCase().includes('start') || 
                     key.toLowerCase().includes('init') ||
                     key.toLowerCase().includes('play'))
                );
                
                return {
                    globalVars: globalVars,
                    gameFunctions: gameFunctions,
                    hasJQuery: typeof iframeWindow.$ !== 'undefined',
                    hasReact: typeof iframeWindow.React !== 'undefined',
                    documentReady: iframeDoc.readyState
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        console.log('JavaScript 狀態:', JSON.stringify(jsState, null, 2));
        
        // 3. 檢查 Canvas 的詳細狀態
        console.log('\n🎨 檢查 Canvas 詳細狀態...');
        const canvasState = await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (!iframe) return { error: 'iframe 未找到' };
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return { error: '無法訪問 iframe' };
                
                const canvas = iframeDoc.querySelector('canvas');
                if (!canvas) return { error: '未找到 Canvas' };
                
                const ctx = canvas.getContext('2d');
                
                return {
                    width: canvas.width,
                    height: canvas.height,
                    offsetWidth: canvas.offsetWidth,
                    offsetHeight: canvas.offsetHeight,
                    hasContext: !!ctx,
                    style: canvas.style.cssText,
                    className: canvas.className,
                    id: canvas.id
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        console.log('Canvas 狀態:', JSON.stringify(canvasState, null, 2));
        
        // 4. 嘗試多次點擊並監聽變化
        console.log('\n🎯 嘗試多次點擊並監聽變化...');
        
        for (let i = 1; i <= 3; i++) {
            console.log(`第 ${i} 次點擊...`);
            
            const clickResult = await gamePage.evaluate(() => {
                const iframe = document.querySelector('iframe');
                if (!iframe) return { error: 'iframe 未找到' };
                
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) return { error: '無法訪問 iframe' };
                    
                    const button = iframeDoc.querySelector('button');
                    if (!button) return { error: '未找到按鈕' };
                    
                    // 記錄點擊前的狀態
                    const beforeClick = {
                        elementCount: iframeDoc.querySelectorAll('*').length,
                        bodyContent: iframeDoc.body.innerHTML.length
                    };
                    
                    // 點擊按鈕
                    button.click();
                    
                    // 記錄點擊後的狀態
                    const afterClick = {
                        elementCount: iframeDoc.querySelectorAll('*').length,
                        bodyContent: iframeDoc.body.innerHTML.length
                    };
                    
                    return {
                        success: true,
                        beforeClick: beforeClick,
                        afterClick: afterClick,
                        changed: beforeClick.elementCount !== afterClick.elementCount || 
                                beforeClick.bodyContent !== afterClick.bodyContent
                    };
                } catch (e) {
                    return { error: e.message };
                }
            });
            
            console.log(`點擊結果:`, JSON.stringify(clickResult, null, 2));
            
            // 等待 2 秒
            await gamePage.waitForTimeout(2000);
        }
        
        // 5. 檢查網路請求
        console.log('\n🌐 檢查最近的網路活動...');
        
        // 監聽網路請求
        const networkRequests = [];
        gamePage.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                timestamp: new Date().toISOString()
            });
        });
        
        // 再次點擊並等待網路請求
        await gamePage.evaluate(() => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const button = iframeDoc.querySelector('button');
                    if (button) button.click();
                }
            }
        });
        
        await gamePage.waitForTimeout(3000);
        
        console.log(`捕獲到 ${networkRequests.length} 個網路請求:`);
        networkRequests.forEach((req, index) => {
            console.log(`  ${index + 1}. ${req.method} ${req.url}`);
        });
        
        await browser.close();
        console.log('\n✅ 深度調試完成');
        
    } catch (error) {
        console.error('❌ 深度調試失敗:', error.message);
    }
}

deepDebugIframe();